'use strict';

const { Plugin, Modal, Notice, normalizePath } = require('obsidian');

const SCHEMA = 'kentaro.obsidian-import';
const KENTARO_URL = 'https://bryantoualy-del.github.io/Kentaro/';
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
  for (const update of Array.isArray(manifest.personUpdates) ? manifest.personUpdates : []) {
    const destination = safePath(update.destination);
    const existing = vault.getAbstractFileByPath(destination);
    const willCreate = plan.some(item => item.route.kind === 'person' && item.destination === destination && item.outcome !== 'skip');
    if (willCreate) continue;
    if (!existing) continue;
    const sessionId = String(update.sessionId || manifest.session?.id || '').replace(/[^a-zA-Z0-9_-]/g, '');
    if (!sessionId) continue;
    const marker = `<!-- KENTARO:SESSION:${sessionId}:START -->`;
    let alreadyMerged = false;
    if (existing) {
      const current = await vault.read(existing);
      alreadyMerged = current.includes(marker);
    }
    const facts = (Array.isArray(update.facts) ? update.facts : [])
      .filter(fact => fact && String(fact.text || '').trim())
      .map((fact, index) => ({
        id: `${sessionId}-${index}`,
        kind: String(fact.kind || 'information'),
        label: String(fact.label || 'Information'),
        text: String(fact.text || '').trim(),
        selected: fact.defaultSelected !== false
      }));
    plan.push({
      route: { kind: 'person-merge' },
      destination,
      finalPath: destination,
      outcome: alreadyMerged ? 'merged-skip' : 'merge',
      update: { ...update, sessionId },
      facts
    });
  }
  return plan;
}

function personSessionBlock(update, facts) {
  const start = `<!-- KENTARO:SESSION:${update.sessionId}:START -->`;
  const end = `<!-- KENTARO:SESSION:${update.sessionId}:END -->`;
  const sessionLink = update.sessionNote ? `[[${update.sessionNote}]]` : (update.sessionTitle || 'Session de Kentaro');
  const lines = facts.map(fact => `- **${fact.label} :** ${fact.text}`);
  return `${start}\n### ${sessionLink}\n\n${lines.join('\n')}\n${end}`;
}

async function mergePersonUpdate(vault, item) {
  const file = vault.getAbstractFileByPath(item.finalPath);
  if (!file) throw new Error(`Fiche PNJ introuvable après import : ${item.finalPath}`);
  const facts = item.facts.filter(fact => fact.selected);
  if (!facts.length) return false;
  const current = await vault.read(file);
  const sessionMarker = `<!-- KENTARO:SESSION:${item.update.sessionId}:START -->`;
  if (current.includes(sessionMarker)) return false;
  const autoStart = '<!-- KENTARO:AUTO:START -->';
  const autoEnd = '<!-- KENTARO:AUTO:END -->';
  const block = personSessionBlock(item.update, facts);
  let next;
  if (current.includes(autoStart) && current.includes(autoEnd)) {
    next = current.replace(autoEnd, `${block}\n\n${autoEnd}`);
  } else {
    next = `${current.trimEnd()}\n\n## Suivi automatique Kentaro\n\n${autoStart}\n${block}\n\n${autoEnd}\n`;
  }
  await vault.modify(file, next);
  return true;
}

async function applyImport(vault, plan) {
  const result = { create: 0, replace: 0, rename: 0, merge: 0, skip: 0, sessionPath: null };
  for (const item of plan) {
    if (item.route.kind === 'person-merge') {
      if (item.outcome === 'merged-skip') { result.skip += 1; continue; }
      if (await mergePersonUpdate(vault, item)) result.merge += 1;
      else result.skip += 1;
      continue;
    }
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
  return ({ session: '☷', person: '♙', 'person-merge': '✦', media: '▧', receipt: '✓' })[kind] || '•';
}

function labelFor(outcome) {
  return ({ create: 'Créer', replace: 'Actualiser', rename: 'Créer une copie', skip: 'Conserver l’existant', merge: 'Enrichir la fiche', 'merged-skip': 'Déjà intégré' })[outcome] || outcome;
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
    summary.createEl('small', { text: `${counts.create || 0} création(s) · ${counts.merge || 0} fiche(s) PNJ à enrichir · ${counts.rename || 0} copie(s) · ${(counts.skip || 0) + (counts['merged-skip'] || 0)} conservé(s)` });
    const files = summary.createDiv({ cls: 'kentaro-import-files' });
    for (const item of this.plan) {
      if (item.route.kind === 'person-merge') {
        const card = files.createDiv({ cls: 'kentaro-person-update' });
        const head = card.createDiv({ cls: 'kentaro-person-update-head' });
        head.createEl('span', { text: '✦' });
        const headCopy = head.createDiv();
        headCopy.createEl('b', { text: item.update.name || splitPath(item.finalPath).name.replace(/\.md$/i, '') });
        headCopy.createEl('small', { text: item.outcome === 'merged-skip' ? 'Cette session est déjà présente dans la fiche.' : 'Choisis les informations à ajouter à la zone protégée.' });
        head.createEl('span', { text: labelFor(item.outcome), cls: `kentaro-import-status ${item.outcome}` });
        if (item.outcome === 'merge') {
          const choices = card.createDiv({ cls: 'kentaro-person-update-choices' });
          for (const fact of item.facts) {
            const label = choices.createEl('label');
            const checkbox = label.createEl('input');
            checkbox.type = 'checkbox';
            checkbox.checked = fact.selected;
            checkbox.addEventListener('change', () => { fact.selected = checkbox.checked; });
            const copy = label.createDiv();
            copy.createEl('b', { text: fact.label });
            copy.createEl('span', { text: fact.text });
          }
        }
        continue;
      }
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
        new Notice(`Kentaro · ${total} fichier(s), ${result.merge} fiche(s) PNJ enrichie(s), ${result.skip} élément(s) conservé(s).`, 7000);
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

function safePnjName(value) {
  return String(value || '').normalize('NFC').replace(/[\\/:*?"<>|]/g, '-').replace(/\s+/g, ' ').replace(/[. ]+$/g, '').trim();
}

function yamlText(value) {
  return `"${String(value || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, ' ')}"`;
}

function rosterPayload(people) {
  const payload = JSON.stringify({
    v: 1,
    createdAt: new Date().toISOString(),
    people: people.map(person => ({
      id: String(person.id || ''),
      name: String(person.name || ''),
      category: String(person.category || 'Inconnu'),
      status: String(person.status || ''),
      path: String(person.path || '')
    }))
  });
  const bytes = new TextEncoder().encode(payload);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

class PrepareKentaroSessionModal extends Modal {
  constructor(app, plugin) {
    super(app);
    this.plugin = plugin;
    this.people = [];
    this.selected = new Set();
    this.query = '';
  }

  async onOpen() {
    this.modalEl.addClass('kentaro-roster-modal');
    const saved = await this.plugin.loadData() || {};
    this.selected = new Set(Array.isArray(saved.rosterPaths) ? saved.rosterPaths : []);
    this.people = this.app.vault.getMarkdownFiles()
      .filter(file => file.path.startsWith('02 - Personnages/PNJ/'))
      .map(file => {
        const frontmatter = this.app.metadataCache.getFileCache(file)?.frontmatter || {};
        return {
          id: String(frontmatter.kentaro_id || `obsidian-${file.path}`),
          name: String(frontmatter.nom || file.basename),
          category: String(frontmatter.relation_kentaro || 'Inconnu'),
          status: String(frontmatter.statut || ''),
          path: file.path
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }));
    const valid = new Set(this.people.map(person => person.path));
    this.selected = new Set([...this.selected].filter(path => valid.has(path)).slice(0, 20));
    this.render();
  }

  render() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.createEl('h2', { text: 'Préparer une session Kentaro' });
    contentEl.createEl('p', { text: 'Choisis les PNJ susceptibles d’apparaître. Cette distribution sera temporaire : Obsidian reste le registre permanent.', cls: 'kentaro-import-help' });
    const toolbar = contentEl.createDiv({ cls: 'kentaro-roster-toolbar' });
    const search = toolbar.createEl('input');
    search.type = 'search';
    search.placeholder = 'Rechercher un PNJ…';
    search.value = this.query;
    search.addEventListener('input', () => { this.query = search.value; this.renderList(); });
    const clear = toolbar.createEl('button', { text: 'Tout retirer' });
    clear.addEventListener('click', () => { this.selected.clear(); this.renderList(); this.updateLaunch(); });
    this.summaryEl = contentEl.createEl('small', { cls: 'kentaro-roster-summary' });
    this.listEl = contentEl.createDiv({ cls: 'kentaro-roster-list' });
    const actions = contentEl.createDiv({ cls: 'kentaro-import-actions' });
    const cancel = actions.createEl('button', { text: 'Annuler' });
    cancel.addEventListener('click', () => this.close());
    this.launch = actions.createEl('a', { text: 'Ouvrir Kentaro', cls: 'mod-cta kentaro-roster-launch' });
    this.launch.target = '_blank';
    this.launch.rel = 'noopener';
    this.launch.addEventListener('click', () => {
      this.plugin.saveData({ rosterPaths: [...this.selected] });
      setTimeout(() => this.close(), 120);
    });
    this.renderList();
    this.updateLaunch();
  }

  filteredPeople() {
    const needle = this.query.trim().toLocaleLowerCase('fr');
    if (!needle) return this.people;
    return this.people.filter(person => `${person.name} ${person.category} ${person.status}`.toLocaleLowerCase('fr').includes(needle));
  }

  renderList() {
    this.listEl.empty();
    const people = this.filteredPeople();
    if (!people.length) this.listEl.createEl('p', { text: this.people.length ? 'Aucun PNJ ne correspond.' : 'Aucune fiche trouvée dans 02 - Personnages/PNJ.', cls: 'kentaro-import-help' });
    for (const person of people) {
      const label = this.listEl.createEl('label', { cls: 'kentaro-roster-person' });
      const checkbox = label.createEl('input');
      checkbox.type = 'checkbox';
      checkbox.checked = this.selected.has(person.path);
      checkbox.addEventListener('change', () => {
        if (checkbox.checked && this.selected.size >= 20) {
          checkbox.checked = false;
          new Notice('La distribution est limitée à 20 PNJ pour rester fiable sur iPad.');
          return;
        }
        checkbox.checked ? this.selected.add(person.path) : this.selected.delete(person.path);
        label.toggleClass('selected', checkbox.checked);
        this.updateLaunch();
      });
      label.toggleClass('selected', checkbox.checked);
      const copy = label.createDiv();
      copy.createEl('b', { text: person.name });
      copy.createEl('small', { text: [person.category, person.status].filter(Boolean).join(' · ') || 'Inconnu' });
    }
    this.updateLaunch();
  }

  updateLaunch() {
    if (!this.launch || !this.summaryEl) return;
    const selected = this.people.filter(person => this.selected.has(person.path));
    this.summaryEl.setText(`${selected.length}/20 PNJ dans la distribution temporaire`);
    this.launch.toggleClass('is-disabled', !selected.length);
    this.launch.setAttr('aria-disabled', String(!selected.length));
    this.launch.href = selected.length ? `${KENTARO_URL}#roster=${rosterPayload(selected)}` : '#';
  }

  onClose() { this.contentEl.empty(); }
}

class CreatePnjFromNotesModal extends Modal {
  constructor(app, selection = '', sourceFile = null) {
    super(app);
    this.selection = selection;
    this.sourceFile = sourceFile;
  }

  onOpen() {
    const { contentEl } = this;
    this.modalEl.addClass('kentaro-create-pnj-modal');
    contentEl.createEl('h2', { text: 'Créer un PNJ depuis les notes' });
    contentEl.createEl('p', { text: 'La sélection devient le point de départ de la fiche. Tu pourras ensuite la compléter normalement dans Obsidian.', cls: 'kentaro-import-help' });
    const field = (label, tag = 'input') => {
      const wrap = contentEl.createEl('label', { cls: 'kentaro-pnj-field' });
      wrap.createEl('span', { text: label });
      return wrap.createEl(tag);
    };
    const name = field('Nom du PNJ');
    name.placeholder = 'Nom obligatoire';
    const category = field('Relation', 'select');
    for (const value of ['Inconnu', 'Allié', 'Compagnon', 'Contact', 'Rival', 'Ennemi']) category.createEl('option', { text: value, value });
    const status = field('Statut');
    status.placeholder = 'Actif, disparu, hostile…';
    const note = field('Ce que Kentaro sait', 'textarea');
    note.value = this.selection;
    note.placeholder = 'Colle ou résume ici les informations connues.';
    const actions = contentEl.createDiv({ cls: 'kentaro-import-actions' });
    const cancel = actions.createEl('button', { text: 'Annuler' });
    cancel.addEventListener('click', () => this.close());
    const create = actions.createEl('button', { text: 'Créer la fiche', cls: 'mod-cta' });
    create.addEventListener('click', async () => {
      const cleanName = safePnjName(name.value);
      if (!cleanName) { new Notice('Indique le nom du PNJ.'); name.focus(); return; }
      const path = `02 - Personnages/PNJ/${cleanName}.md`;
      const existing = this.app.vault.getAbstractFileByPath(path);
      if (existing) {
        new Notice(`${cleanName} possède déjà une fiche. Elle a été ouverte sans être modifiée.`);
        this.close();
        await this.app.workspace.getLeaf(false).openFile(existing);
        return;
      }
      create.disabled = true;
      try {
        await ensureFolder(this.app.vault, '02 - Personnages/PNJ');
        const source = this.sourceFile ? `[[${this.sourceFile.basename}]]` : '';
        const body = `---\ntype: pnj\naliases: []\nrace:\ngenre:\ngroupe:\nlieu:\nstatut: ${yamlText(status.value || 'actif')}\nrelation_kentaro: ${yamlText(category.value || 'Inconnu')}\npremiere_rencontre:\nillustration:\ntags:\n  - pnj\n---\n# ${cleanName}\n\n## En bref\n\n${note.value.trim() || '_À compléter._'}\n\n## Ce que Kentaro sait\n\n- **Statut :** ${status.value.trim() || 'Inconnu'}\n- **Relation :** ${category.value || 'Inconnu'}\n${source ? `- **Source :** ${source}\n` : ''}\n## Motivation\n\n- À découvrir.\n\n## Relations\n\n- [[Kentaro]]\n\n## Secrets ou incertitudes\n\n- [ ] À confirmer :\n\n## Apparitions\n\n${source ? `- ${source}` : '- À compléter.'}\n`;
        const file = await this.app.vault.create(path, body);
        new Notice(`Fiche PNJ créée : ${cleanName}`);
        this.close();
        await this.app.workspace.getLeaf(false).openFile(file);
      } catch (err) {
        create.disabled = false;
        new Notice(`Création impossible : ${err && err.message ? err.message : err}`, 8000);
      }
    });
    setTimeout(() => name.focus(), 50);
  }

  onClose() { this.contentEl.empty(); }
}

class KentaroSessionImporter extends Plugin {
  async onload() {
    this.addRibbonIcon('moon-star', 'Importer une session Kentaro', () => this.openImporter());
    this.addRibbonIcon('users', 'Préparer une session Kentaro', () => this.openRoster());
    this.addCommand({
      id: 'import-kentaro-session',
      name: 'Importer une session Kentaro',
      callback: () => this.openImporter()
    });
    this.addCommand({
      id: 'create-pnj-from-notes',
      name: 'Créer un PNJ depuis la sélection',
      editorCallback: (editor, view) => new CreatePnjFromNotesModal(this.app, editor.getSelection().trim(), view.file).open()
    });
    this.addCommand({
      id: 'prepare-kentaro-session',
      name: 'Préparer une session Kentaro',
      callback: () => this.openRoster()
    });
  }

  openImporter() {
    new KentaroImportModal(this.app, this).open();
  }

  openRoster() {
    new PrepareKentaroSessionModal(this.app, this).open();
  }
}

module.exports = KentaroSessionImporter;
module.exports.__test = { readZipEntries, parseManifest, safePath, planImport, applyImport, personSessionBlock, rosterPayload };
