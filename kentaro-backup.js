(()=>{
'use strict';
const api=window.KentaroAPI,panel=document.querySelector('[data-panel="journal"]');if(!api||!panel)return;
const KEYS=['kentaro-eclipse-v4','kentaro-social-v2','kentaro-session-v1','kentaro-session-v2'];
const RECOVERY='kentaro-backup-recovery-v1',KIND='kentaro-complete-backup';
const capture=()=>Object.fromEntries(KEYS.map(key=>[key,localStorage.getItem(key)]));
function payload(storage=capture()){return{kind:KIND,version:1,app:'Kentaro — Porteur de l’Éclipse',exportedAt:new Date().toISOString(),storage}}
function validate(data){
 if(!data||data.kind!==KIND||data.version!==1||!data.storage||typeof data.storage!=='object')throw new Error('Ce fichier n’est pas une sauvegarde complète de Kentaro.');
 for(const key of KEYS){const value=data.storage[key];if(value!==null&&value!==undefined&&typeof value!=='string')throw new Error(`Donnée invalide : ${key}.`);if(typeof value==='string'){const parsed=JSON.parse(value);if(!parsed||typeof parsed!=='object')throw new Error(`Donnée illisible : ${key}.`)}}
 return data.storage;
}
function apply(storage){for(const key of KEYS){const value=storage[key];if(value===null||value===undefined)localStorage.removeItem(key);else localStorage.setItem(key,value)}}
function download(text,name){const url=URL.createObjectURL(new Blob([text],{type:'application/json;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500)}
const desk=document.createElement('article');desk.className='backup-desk';desk.innerHTML=`
 <div class="backup-copy"><span>Sauvegarde complète</span><b>Emporter tout Kentaro</b><small>Combat, inventaire, journaux, carnet et sessions archivées. Les portraits voyagent dans les ZIP Obsidian.</small></div>
 <div class="backup-actions"><button id="backupExport" type="button">Exporter</button><button id="backupImport" type="button">Importer</button><button id="backupRollback" class="backup-rollback" type="button" hidden>Annuler la restauration</button><input id="backupFile" type="file" accept="application/json,.json" hidden></div>`;
const mechanical=panel.querySelector('[data-journal-pane="mechanical"]'),first=panel.querySelector('.card');if(mechanical)mechanical.appendChild(desk);else panel.insertBefore(desk,first);
const file=desk.querySelector('#backupFile'),rollback=desk.querySelector('#backupRollback');rollback.hidden=!localStorage.getItem(RECOVERY);
function flash(button,text){const old=button.textContent;button.textContent=text;setTimeout(()=>button.textContent=old,1400)}
desk.querySelector('#backupExport').onclick=e=>{api.save(true);api.log('↓ Sauvegarde complète exportée.');const stamp=new Date().toISOString().slice(0,10);download(JSON.stringify(payload(),null,2),`kentaro-sauvegarde-complete-${stamp}.json`);flash(e.currentTarget,'Exportée ✓')};
desk.querySelector('#backupImport').onclick=()=>{file.value='';file.click()};
file.onchange=async()=>{
 const selected=file.files?.[0];if(!selected)return;if(selected.size>25*1024*1024)return alert('Cette sauvegarde dépasse 25 Mo et ne peut pas être importée.');
 try{
  const storage=validate(JSON.parse(await selected.text()));
  if(!confirm('Restaurer cette sauvegarde complète ? L’état actuel sera conservé pour permettre une annulation.'))return;
  const before=payload();localStorage.setItem(RECOVERY,JSON.stringify(before));
  try{apply(storage)}catch(error){apply(before.storage);throw error}
  location.reload();
 }catch(error){alert(`Import impossible : ${error.message||'fichier invalide'}`)}
};
rollback.onclick=()=>{
 try{const stored=localStorage.getItem(RECOVERY),storage=validate(JSON.parse(stored));if(!confirm('Revenir à l’état présent avant le dernier import ?'))return;apply(storage);localStorage.removeItem(RECOVERY);location.reload()}catch(error){alert(`Restauration impossible : ${error.message||'sauvegarde de secours invalide'}`)}
};
const style=document.createElement('style');style.textContent=`
.backup-desk{display:flex;align-items:center;justify-content:space-between;gap:14px;margin:0 0 12px;padding:11px 13px;border:1px solid #45413d;border-radius:12px;background:linear-gradient(135deg,#121116,#0b0c10)}.backup-copy{display:grid;gap:2px;min-width:0}.backup-copy span{color:#c79c61;font-size:.62rem;letter-spacing:.14em;text-transform:uppercase}.backup-copy b{color:#eee3d3;font-size:.9rem}.backup-copy small{color:#90877f;line-height:1.35}.backup-actions{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end}.backup-actions button{min-height:40px;white-space:nowrap}.backup-actions .backup-rollback{border-color:#744b43;color:#deb6ad}
@media(max-width:767px){.backup-desk{align-items:stretch;flex-direction:column}.backup-actions{display:grid;grid-template-columns:1fr 1fr}.backup-actions .backup-rollback{grid-column:1/-1}}
`;document.head.appendChild(style);
})();
