'use strict';

const { Plugin, Modal, Notice, normalizePath } = require('obsidian');

const SCHEMA = 'kentaro.obsidian-import';
const ALLOWED_ROOTS = [
  '01 - Sessions/',
  '02 - Personnages/PNJ/',
  '99 - Médias/',
  '98 - Archives/Imports Kentaro/'
];

function decode(bytes) {
  return new TextDecoder('utf-8').decode(bytes);
}

function safePath(value) {
  const path = normalizePath(String(value || '').normalize('NFC')).replace(/^\/+/, '');
  if (!path || path.includes('../') || path.includes('\\') || !ALLOWED_ROOTS.some(root => path.startsWith(root))) {
    throw new Error(`Destination non autorisée : ${value || '(vide)'}`);
  }
  return path;
}

async function inflateRaw(bytes) {
  if (typeof DecompressionStream === 'undefined') {
    throw new Error('Cette archive est compressée dans un format non pris en charge sur cet appareil. Réexporte-la depuis Kentaro.');
  }
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

async function readZipEntries(buffer) {
  const bytes = new Uint8Array(buffer);
  const view = new DataView(buffer);
  const entries = new Map();
  let offset = 0;
  while (offset + 30 <= bytes.length && view.getUint32(offset, true) === 0x04034b50) {
    const flags = view.getUint16(offset + 6, true);
    const method = view.getUint16(offset + 8, true);
    const compressedSize = view.getUint32(offset + 18, true);
    const nameLength = view.getUint16(offset + 26, true);
    const extraLength = view.getUint16(offset + 28, true);
    if (flags & 0x08) throw new Error('Archive ZIP non compatible : tailles différées.');
    const nameStart = offset + 30;
    const dataStart = nameStart + nameLength + extraLength;
    const dataEnd = dataStart + compressedSize;
    if (dataEnd > bytes.length) throw new Error('Archive ZIP incomplète ou endommagée.');
    const name = decode(bytes.slice(nameStart, nameStart + nameLength)).normalize('NFC');
    const compressed = bytes.slice(dataStart, dataEnd);
    let content;
    if (method === 0) content = compressed;
    else if (method === 8) content = await inflateRaw(compressed);
    else throw new Error(`Méthode ZIP ${method} non prise en charge.`);
    if (name && !name.endsWith('/')) entries.set(name, content);
    offset = dataEnd;
  }
  if (!entries.size) throw new Error('Aucun fichier trouvé dans cette archive.');
  return entries;
}

function parseManifest(entries) {
  const raw = entries.get('_kentaro-import.json');
  if (!raw) throw new Error('Ce ZIP ne contient pas le manifeste Kentaro.');
  let manifest;
  try { manifest = JSON.parse(decode(raw)); }
  catch (_) { throw new Error('Le manifeste Kentaro est illisible.'); }
  if (manifest.schema !== SCHEMA || !Array.isArray(manifest.routes)) {
    throw new Error('Ce paquet n’est pas un export de session Kentaro compatible.');
  }
  return manifest;
}

async function ensureFolder(vault, folderPath) {
  const parts = normalizePath(folderPath).split('/').filter(Boolean);
  let current = '';
  for (const part of parts) {
    current = current ? `${current}/${part}` : part;
    if (!vault.getAbstractFileByPath(current)) await vault.createFolder(current);
  }
}

function splitPath(path) {
  const index = path.lastIndexOf('/');
  return { folder: index < 0 ? '' : path.slice(0, index), name: index < 0 ? path : path.slice(index + 1) };
}

function renamedPath(vault, path) {
  const { folder, name } = splitPath(path);
  const dot = name.lastIndexOf('.');
  const stem = dot > 0 ? name.slice(0, dot) : name;
  const ext = dot > 0 ? name.slice(dot) : '';
  let number = 2;
  let candidate;
  do {
    candidate = `${folder ? `${folder}/` : ''}${stem} — import ${number}${ext}`;
    number += 1;
  } while (vault.getAbstractFileByPath(candidate));
  return candidate;
}

async function planImport(vault, entries, manifest) {
  const plan = [];
  const createdAt = Date.parse(manifest.createdAt || '') || Date.now();
  for (const route of manifest.routes) {
    const source = String(route.source || '').normalize('NFC');
    if (!entries.has(source)) throw new Error(`Fichier annoncé mais absent : ${source}`);
    const destination = safePath(route.destination);
    const existing = vault.getAbstractFileByPath(destination);
    let outcome = 'create';
    let finalPath = destination;
    if (existing) {
      switch (route.conflict) {
        case 'skip-existing': outcome = 'skip'; break;
        case 'keep-newest': {
          const stat = await vault.adapter.stat(destination);
          outcome = !stat || createdAt > stat.mtime ? 'replace' : 'skip';
          break;
        }
        case 'rename':
        case 'ask':
        default:
          outcome = 'rename';
          finalPath = renamedPath(vault, destination);
      }
    }
    plan.push({ route, source, destination, finalPath, outcome, bytes: entries.get(source) });
  }
  return plan;
}

async function applyImport(vault, plan) {
  const result = { create: 0, replace: 0, rename: 0, skip: 0, sessionPath: null };
  for (const item of plan) {
    if (item.outcome === 'skip') { result.skip += 1; continue; }
    const { folder } = splitPath(item.finalPath);
    if (folder) await ensureFolder(vault, folder);
    if (item.outcome === 'replace') await vault.adapter.writeBinary(item.finalPath, item.bytes.buffer.slice(item.bytes.byteOffset, item.bytes.byteOffset + item.bytes.byteLength));
    else await vault.createBinary(item.finalPath, item.bytes.buffer.slice(item.bytes.byteOffset, item.bytes.byteOffset + item.bytes.byteLength));
    result[item.outcome] += 1;
    if (item.route.kind === 'session') result.sessionPath = item.finalPath;
  }
  return result;
}

function iconFor(kind) {
  return ({ session: '☷', person: '♙', media: '▧', receipt: '✓' })[kind] || '•';
}

function labelFor(outcome) {
  return ({ create: 'Créer', replace: 'Actualiser', rename: 'Créer une copie', skip: 'Conserver l’existant' })[outcome] || outcome;
}

class KentaroImportModal extends Modal {
  constructor(app, plugin) {
    super(app);
    this.plugin = plugin;
    this.plan = null;
    this.manifest = null;
  }

  onOpen() {
    this.modalEl.addClass('kentaro-import-modal');
    this.renderPicker();
  }

  renderPicker(error = '') {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl('h2', { text: 'Importer une session Kentaro', cls: 'modal-title' });
    const hero = contentEl.createDiv({ cls: 'kentaro-import-hero' });
    hero.createDiv({ text: '◐', cls: 'kentaro-import-mark' });
    const copy = hero.createDiv();
    copy.createEl('strong', { text: 'Porteur de l’Éclipse' });
    copy.createEl('small', { text: 'Session · PNJ · portraits · reçu d’import' });
    if (error) contentEl.createEl('div', { text: error, cls: 'mod-warning kentaro-import-help' });
    const picker = contentEl.createDiv({ cls: 'kentaro-import-picker' });
    picker.createEl('strong', { text: 'Choisis le ZIP téléchargé depuis le compagnon.' });
    const input = picker.createEl('input');
    input.type = 'file';
    input.accept = '.zip,application/zip';
    input.addEventListener('change', async () => {
      const file = input.files && input.files[0];
      if (!file) return;
      input.disabled = true;
      try {
        const entries = await readZipEntries(await file.arrayBuffer());
        const manifest = parseManifest(entries);
        const plan = await planImport(this.app.vault, entries, manifest);
        this.manifest = manifest;
        this.plan = plan;
        this.renderPreview(file.name);
      } catch (err) {
        this.renderPicker(err && err.message ? err.message : String(err));
      }
    });
    contentEl.createEl('p', { text: 'Tout reste sur cet appareil. Le plugin n’envoie aucune donnée sur Internet.', cls: 'kentaro-import-help' });
  }

  renderPreview(fileName) {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl('h2', { text: 'Vérifier l’import', cls: 'modal-title' });
    const session = this.manifest.session || {};
    const sessionBox = contentEl.createDiv({ cls: 'kentaro-import-session' });
    sessionBox.createEl('strong', { text: session.title || 'Session de Kentaro' });
    sessionBox.createEl('div', { text: `${session.date || 'Date inconnue'} · ${fileName}` });
    const summary = contentEl.createDiv({ cls: 'kentaro-import-summary' });
    const counts = this.plan.reduce((acc, item) => (acc[item.outcome] = (acc[item.outcome] || 0) + 1, acc), {});
    summary.createEl('small', { text: `${counts.create || 0} création(s) · ${counts.rename || 0} copie(s) · ${counts.replace || 0} actualisation(s) · ${counts.skip || 0} conservé(s)` });
    const files = summary.createDiv({ cls: 'kentaro-import-files' });
    for (const item of this.plan) {
      const row = files.createDiv({ cls: 'kentaro-import-file' });
      row.createEl('span', { text: iconFor(item.route.kind) });
      const detail = row.createDiv();
      detail.createEl('b', { text: splitPath(item.finalPath).name });
      detail.createEl('small', { text: item.finalPath });
      row.createEl('span', { text: labelFor(item.outcome), cls: `kentaro-import-status ${item.outcome}` });
    }
    const actions = contentEl.createDiv({ cls: 'kentaro-import-actions' });
    const cancel = actions.createEl('button', { text: 'Annuler' });
    cancel.addEventListener('click', () => this.close());
    const importButton = actions.createEl('button', { text: 'Importer dans ce coffre', cls: 'mod-cta' });
    importButton.addEventListener('click', async () => {
      importButton.disabled = true;
      importButton.setText('Import en cours…');
      try {
        const result = await applyImport(this.app.vault, this.plan);
        const total = result.create + result.rename + result.replace;
        new Notice(`Kentaro · ${total} fichier(s) importé(s), ${result.skip} conservé(s).`, 7000);
        this.close();
        if (result.sessionPath) {
          const sessionFile = this.app.vault.getAbstractFileByPath(result.sessionPath);
          if (sessionFile) await this.app.workspace.getLeaf(false).openFile(sessionFile);
        }
      } catch (err) {
        importButton.disabled = false;
        importButton.setText('Réessayer');
        new Notice(`Import Kentaro impossible : ${err && err.message ? err.message : err}`, 9000);
      }
    });
  }

  onClose() {
    this.contentEl.empty();
  }
}

class KentaroSessionImporter extends Plugin {
  async onload() {
    this.addRibbonIcon('moon-star', 'Importer une session Kentaro', () => this.openImporter());
    this.addCommand({
      id: 'import-kentaro-session',
      name: 'Importer une session Kentaro',
      callback: () => this.openImporter()
    });
  }

  openImporter() {
    new KentaroImportModal(this.app, this).open();
  }
}

module.exports = KentaroSessionImporter;
module.exports.__test = { readZipEntries, parseManifest, safePath, planImport, applyImport };
