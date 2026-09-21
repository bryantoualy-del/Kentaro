(()=>{
'use strict';
const api=window.KentaroAPI;if(!api)return;
const d=document,$=s=>d.querySelector(s),$$=s=>[...d.querySelectorAll(s)];
const categories={heritage:'Héritage',social:'Outil social',travel:'Voyage',memory:'Mémoire',consumable:'Consommable',misc:'Divers'};
const iconChoices=[
 {key:'generic',label:'Éclipse',glyph:'✦'},{key:'kane',label:'Kane',icon:'assets/icons/03_Kane_katana.webp?v=2'},{key:'solinar',label:'Solinar',icon:'assets/icons/01_Solinar.webp?v=2'},{key:'selhane',label:'Sélhane',icon:'assets/icons/02_Selhane.webp?v=2'},
 {key:'storage-ring',label:'Anneau',icon:'assets/icons/04_Anneau_de_stockage.webp?v=2'},{key:'leaf-ring',label:'Feuille',icon:'assets/icons/05_Bague_feuille_morte.webp'},{key:'stone',label:'Vision',icon:'assets/icons/08_Vision_de_la_Pierre.webp?v=2'},{key:'seal',label:'Sceau',icon:'assets/icons/09_Sceau_de_l_Eclipse.webp?v=2'},
 {key:'spectre',label:'Spectre',icon:'assets/icons/07_Spectre_occult.webp?v=2'},{key:'door',label:'Porte',icon:'assets/icons/10_Porte_dimensionnelle.webp?v=2'},{key:'blood',label:'Sang',glyph:'♦'},{key:'letter',label:'Lettre',glyph:'✉'},
 {key:'music',label:'Ocarina',glyph:'♪'},{key:'travel',label:'Voyage',glyph:'◇'},{key:'mask',label:'Masque',glyph:'◒'},{key:'memory',label:'Mémoire',glyph:'✥'},{key:'heart',label:'Cœur',glyph:'♡'}
];
const defaults=[
 {id:'kane',name:'Kane',category:'heritage',icon:'assets/icons/03_Kane_katana.webp?v=2',description:'Katana familial transmis dans la lignée Amane. Une ancre de mémoire et d’héritage, davantage qu’une arme secondaire.'},
 {id:'face-ring',name:'Bague d’échange de visages',category:'social',glyph:'◐',description:'Outil d’apparence et d’infiltration. Noter ici l’identité portée et les précautions associées.'},
 {id:'ocarina',name:'Ocarina',category:'social',glyph:'♪',description:'Objet personnel et marqueur culturel, lié aux voyages et à la mémoire de Kentaro.'},
 {id:'traveler-map',name:'Carte du voyageur',category:'travel',glyph:'◇',description:'Routes, lieux reconnus et indices permettant de retrouver la patrie.'},
 {id:'memory-lantern',name:'Lanterne de mémoire',category:'memory',glyph:'◈',description:'Réceptacle symbolique pour les souvenirs retrouvés ou encore fragmentaires.'},
 {id:'homeland-letter',name:'Lettre de la patrie',category:'heritage',glyph:'✉',description:'Trace écrite de la famille Amane et d’une terre que Kentaro cherche encore à comprendre.'},
 {id:'aen-mask',name:'Masque d’Aen',category:'social',glyph:'◒',description:'Masque lié aux faux-semblants, aux identités empruntées et aux approches discrètes.'},
 {id:'blood-vial',name:'Fiole de sang',category:'consumable',glyph:'♦',description:'Réserve de sang transportée. Ajuster la quantité au fil du voyage.'},
 {id:'memory-flower',name:'Fleur de mémoire',category:'memory',glyph:'✥',description:'Souvenir fragile associé à une personne, un lieu ou une vision retrouvée.'},
 {id:'silent-heart',name:'Cœur silencieux',category:'memory',glyph:'♡',description:'Relique mémorielle dont la signification reste à reconstituer.'}
];
const style=d.createElement('style');style.id='kentaro-inventory-style';style.textContent=`
.inventory-switch{display:grid;grid-template-columns:1fr 1fr;gap:8px;max-width:720px;margin-bottom:11px;padding:5px;border:1px solid #4e4642;border-radius:14px;background:#0e0d11}.inventory-switch-btn{display:grid;grid-template-columns:auto 1fr;grid-template-rows:auto auto;column-gap:9px;align-items:center;min-height:58px;padding:8px 12px;text-align:left;border:1px solid transparent;border-radius:10px;background:transparent;color:#b9afa2}.inventory-switch-btn>span{grid-row:1/3;display:grid;place-items:center;width:33px;height:33px;border:1px solid #564b42;border-radius:50%;color:#d1a35c}.inventory-switch-btn b{color:#eee2d0}.inventory-switch-btn small{font-size:.69rem}.inventory-switch-btn.active{border-color:#a27c49;background:linear-gradient(135deg,#422d21,#25202b);box-shadow:inset 0 1px #fff1}.inventory-switch-btn.active>span{border-color:#d1a35c;box-shadow:0 0 16px #d1a35c35}.inventory-view[hidden]{display:none!important}.loadout-strip{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-bottom:10px}.loadout-strip>div{padding:10px 12px;border:1px solid #433e3c;border-radius:11px;background:#111014}.loadout-strip small,.loadout-strip b{display:block}.loadout-strip small,.inventory-card-kicker{font-size:.65rem;letter-spacing:.1em;text-transform:uppercase;color:#b59261}.loadout-strip b{margin-top:3px;color:#e8dcc9;font-size:.82rem}.inventory-linked-grid{display:grid;grid-template-columns:repeat(12,1fr);gap:11px}.inventory-linked-grid>.card{margin:0}.inventory-blades{grid-column:span 8;min-height:164px!important;padding-right:168px!important}.inventory-blades .art-pair{right:10px}.inventory-blades .art-pair img{width:70px;height:96px}.inventory-vision{grid-column:span 4}.inventory-ring{grid-column:span 8;min-height:350px}.inventory-minor-stack{grid-column:span 4;display:grid;gap:11px}.inventory-minor{display:grid;grid-template-columns:64px 1fr;gap:10px;align-items:center;min-height:116px}.inventory-minor img,.inventory-rune{width:64px;height:64px;object-fit:contain}.inventory-rune{display:grid;place-items:center;border:1px solid #6b5740;border-radius:50%;background:radial-gradient(circle,#6f4f27,#171217 68%);color:#f2cc7d;font-size:1.7rem;box-shadow:0 0 20px #bd87432a}.inventory-toolbar{display:grid;grid-template-columns:minmax(220px,1fr) 190px auto auto;gap:8px}.inventory-toolbar select,.inventory-search{min-height:44px;border:1px solid #474249;border-radius:10px;background:#0c0d11;color:#eee2d0}.inventory-search{display:flex;align-items:center;gap:7px;padding:0 11px}.inventory-search span{color:#c9a060;font-size:1.1rem}.inventory-search input{width:100%;height:42px;border:0;outline:0;background:transparent;color:#eee2d0}.inventory-toolbar select{padding:0 10px}.inventory-transfer{display:grid;grid-template-columns:1fr 1fr;gap:6px}.inventory-transfer button{white-space:nowrap}.inventory-summary{display:flex;justify-content:space-between;gap:10px;margin:11px 2px 8px;color:#9f978e;font-size:.75rem}.inventory-summary b{color:#d8bd92}.inventory-object-list{display:grid;gap:7px}.inventory-object{border:1px solid #403d42;border-radius:12px;background:linear-gradient(125deg,#19171b,#0d0e12);overflow:hidden}.inventory-object[open]{border-color:#6c5947;background:linear-gradient(125deg,#211a1b,#101116)}.inventory-object summary{display:grid;grid-template-columns:54px 1fr auto auto;gap:11px;align-items:center;min-height:72px;padding:8px 12px;cursor:pointer;list-style:none}.inventory-object summary::-webkit-details-marker{display:none}.inventory-object-icon{display:grid;place-items:center;width:54px;height:54px;border:1px solid #51483f;border-radius:11px;background:radial-gradient(circle,#3a2a20,#111116 72%);color:#d6ad6b;font:1.45rem Georgia,serif}.inventory-object-icon img{width:50px;height:50px;object-fit:contain}.inventory-object-name b,.inventory-object-name small{display:block}.inventory-object-name b{font:700 1rem Georgia,serif;color:#eee2d0}.inventory-object-name small{margin-top:3px;color:#aa9f94}.inventory-qty{min-width:42px;padding:4px 7px;border:1px solid #534942;border-radius:999px;color:#d9c9b5;text-align:center;font-size:.74rem}.inventory-chevron{color:#a98a60;transition:transform .18s}.inventory-object[open] .inventory-chevron{transform:rotate(180deg)}.inventory-object-body{padding:0 12px 12px 77px}.inventory-object-body p{margin:0 0 9px;color:#afa69c;font-size:.82rem;line-height:1.5}.inventory-object-actions{display:flex;align-items:center;gap:6px;flex-wrap:wrap}.inventory-object-actions button{min-height:40px}.inventory-object-actions .qty-label{margin-right:auto;color:#9e958d;font-size:.75rem}.inventory-note{width:100%;min-height:72px;margin-top:9px;padding:9px;border:1px solid #3d3e45;border-radius:9px;background:#0a0b0f;color:#eee2d0;resize:vertical}.inventory-empty{padding:28px;border:1px dashed #4a4545;border-radius:12px;text-align:center;color:#9f978e}.inventory-editor{width:min(620px,calc(100% - 20px));max-height:92vh;overflow:auto;border:1px solid #8b704c;border-radius:16px;background:#151419;color:#eee2d0;padding:17px;box-shadow:0 28px 80px #000}.inventory-editor::backdrop{background:#030305da;backdrop-filter:blur(6px)}.inventory-editor-head{display:flex;justify-content:space-between;align-items:start}.inventory-editor h3{margin:3px 0 10px;font:700 1.35rem Georgia,serif;color:#e6c68d}.inventory-close{min-width:42px;padding:4px;font-size:1.25rem}.inventory-editor label{display:block;margin:8px 0;color:#aaa198;font-size:.78rem}.inventory-editor input,.inventory-editor select,.inventory-editor textarea{display:block;width:100%;min-height:44px;margin-top:4px;padding:8px;border:1px solid #44444d;border-radius:9px;background:#0b0c10;color:#eee2d0}.inventory-editor textarea{min-height:105px;resize:vertical}.inventory-editor-grid{display:grid;grid-template-columns:1fr 120px;gap:8px}.inventory-editor-actions{display:flex;justify-content:flex-end;gap:7px;margin-top:12px}.inventory-icon-field{margin:10px 0;padding:8px;border:1px solid #3f3d43;border-radius:11px}.inventory-icon-field legend{padding:0 6px;color:#aaa198;font-size:.78rem}.inventory-icon-picker{display:grid;grid-template-columns:repeat(6,1fr);gap:6px}.inventory-icon-choice{display:grid;place-items:center;gap:3px;min-width:0;min-height:68px;padding:5px 3px;border:1px solid #403d43;border-radius:9px;background:#0c0d11;color:#a79f96}.inventory-icon-choice img,.inventory-icon-choice .icon-glyph{width:39px;height:39px;object-fit:contain}.inventory-icon-choice .icon-glyph{display:grid;place-items:center;color:#d6ad6b;font-size:1.25rem}.inventory-icon-choice small{max-width:100%;overflow:hidden;text-overflow:ellipsis;font-size:.57rem;white-space:nowrap}.inventory-icon-choice.selected{border-color:#c89a55;background:radial-gradient(circle at 50% 25%,#664629,#211921 74%);color:#f0d8ad;box-shadow:0 0 13px #c7954b2b}.inventory-icon-tools{display:grid;grid-template-columns:auto auto 1fr;gap:6px;align-items:center;margin-top:8px}.inventory-icon-tools small{color:#8f8881;font-size:.62rem;line-height:1.35}.inventory-icon-tools button{min-height:40px}
@media(max-width:767px){.inventory-switch{max-width:none}.inventory-switch-btn{min-height:54px;padding:7px}.loadout-strip{display:flex;overflow-x:auto}.loadout-strip>div{flex:0 0 72%}.inventory-linked-grid{display:block}.inventory-linked-grid>*{margin-bottom:8px!important}.inventory-blades{min-height:150px!important;padding-right:118px!important}.inventory-blades .art-pair{right:5px}.inventory-blades .art-pair img{width:52px;height:76px;padding:3px}.inventory-ring{min-height:0}.inventory-toolbar{grid-template-columns:1fr auto}.inventory-search{grid-column:1/-1}.inventory-toolbar select{grid-column:1/2;grid-row:auto}.inventory-transfer{grid-column:1/-1}.inventory-summary{display:block}.inventory-summary span{display:block;margin-top:2px}.inventory-object summary{grid-template-columns:48px 1fr auto;padding:7px}.inventory-object-icon{width:48px;height:48px}.inventory-object-icon img{width:44px;height:44px}.inventory-qty{display:none}.inventory-object-body{padding:0 9px 10px}.inventory-object-actions .qty-label{width:100%;margin:0}.inventory-editor-grid{grid-template-columns:1fr}.inventory-icon-picker{grid-template-columns:repeat(4,1fr)}.inventory-icon-tools{grid-template-columns:1fr 1fr}.inventory-icon-tools small{grid-column:1/-1}}
@media(min-width:768px) and (max-width:1100px){.inventory-blades,.inventory-ring{grid-column:span 7}.inventory-vision,.inventory-minor-stack{grid-column:span 5}}
@media(prefers-reduced-motion:reduce){.inventory-chevron{transition:none}}
`;d.head.appendChild(style);

function freshState(){const items={};defaults.forEach(x=>items[x.id]={qty:1,notes:''});return{version:2,view:'linked',items,custom:[],customIcons:[]}}
function normalize(){
 const s=api.state;
 if(!s.inventory||typeof s.inventory!=='object')s.inventory=freshState();
 if(!s.inventory.items||typeof s.inventory.items!=='object')s.inventory.items={};
 defaults.forEach(x=>{if(!s.inventory.items[x.id])s.inventory.items[x.id]={qty:1,notes:''}});
 if(!Array.isArray(s.inventory.custom))s.inventory.custom=[];
 if(!Array.isArray(s.inventory.customIcons))s.inventory.customIcons=[];
 s.inventory.version=2;
 if(!['linked','objects'].includes(s.inventory.view))s.inventory.view='linked';
 return s.inventory;
}
const esc=x=>String(x??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const allIconChoices=()=>iconChoices.concat((api.state.inventory?.customIcons||[]).map(x=>({key:x.key,label:x.label,icon:x.dataUrl,custom:true})));
const getIconChoice=key=>allIconChoices().find(x=>x.key===key)||iconChoices[0];
const allItems=()=>defaults.map(x=>({...x,...normalize().items[x.id],fixed:true})).concat(normalize().custom.map(x=>{const visual=getIconChoice(x.iconKey);return{...x,icon:visual.icon||'',glyph:visual.glyph||'✦',fixed:false}}));
function setView(view,persist=true){
 const inv=normalize();inv.view=view;
 $$('[data-inventory-view]').forEach(b=>{const on=b.dataset.inventoryView===view;b.classList.toggle('active',on);b.setAttribute('aria-selected',String(on))});
 $$('[data-inventory-pane]').forEach(p=>{const on=p.dataset.inventoryPane===view;p.classList.toggle('active',on);p.hidden=!on});
 if(persist)api.save(true);
}
function commit(message,mutate){api.push();mutate();api.render();api.log(message)}
function findItem(id){const inv=normalize();const base=defaults.find(x=>x.id===id);if(base)return{entry:inv.items[id],base,fixed:true};const entry=inv.custom.find(x=>x.id===id);return entry?{entry,base:entry,fixed:false}:null}
function renderObjects(){
 const list=$('#inventoryObjectList');if(!list)return;
 const term=($('#inventorySearch')?.value||'').trim().toLowerCase(),category=$('#inventoryCategory')?.value||'all';
 const items=allItems().filter(x=>(category==='all'||x.category===category)&&(!term||`${x.name} ${x.description||''} ${x.notes||''}`.toLowerCase().includes(term)));
 const owned=allItems().filter(x=>Number(x.qty)>0).length,count=$('#inventoryObjectCount');if(count)count.textContent=`${owned} objet${owned>1?'s':''} recensé${owned>1?'s':''}`;
 if(!items.length){list.innerHTML='<div class="inventory-empty">Aucun objet ne correspond à cette recherche.</div>';return}
 list.innerHTML=items.map(x=>`<details class="inventory-object" data-inventory-id="${esc(x.id)}"><summary><span class="inventory-object-icon">${x.icon?`<img src="${esc(x.icon)}" alt="">`:esc(x.glyph||'✦')}</span><span class="inventory-object-name"><b>${esc(x.name)}</b><small>${esc(categories[x.category]||'Divers')}</small></span><span class="inventory-qty">× ${Math.max(0,Number(x.qty)||0)}</span><span class="inventory-chevron">⌄</span></summary><div class="inventory-object-body"><p>${esc(x.description||'Objet ajouté au registre de Kentaro.')}</p><div class="inventory-object-actions"><span class="qty-label">Quantité : <b>${Math.max(0,Number(x.qty)||0)}</b></span><button type="button" data-inventory-dec aria-label="Retirer une unité">−</button><button type="button" data-inventory-inc aria-label="Ajouter une unité">＋</button>${x.fixed?'':`<button type="button" data-inventory-edit>Modifier</button><button type="button" data-inventory-delete class="utility-danger">Supprimer</button>`}</div><textarea class="inventory-note" maxlength="500" placeholder="Note personnelle, usage ou provenance…">${esc(x.notes||'')}</textarea></div></details>`).join('');
 $$('.inventory-object').forEach(card=>{
  const id=card.dataset.inventoryId;
  card.querySelector('[data-inventory-dec]')?.addEventListener('click',()=>{const found=findItem(id);if(!found)return;commit(`⌁ Inventaire : ${found.base.name} • quantité ${Math.max(0,(Number(found.entry.qty)||0)-1)}.`,()=>found.entry.qty=Math.max(0,(Number(found.entry.qty)||0)-1))});
  card.querySelector('[data-inventory-inc]')?.addEventListener('click',()=>{const found=findItem(id);if(!found)return;commit(`⌁ Inventaire : ${found.base.name} • quantité ${(Number(found.entry.qty)||0)+1}.`,()=>found.entry.qty=Math.min(99,(Number(found.entry.qty)||0)+1))});
  card.querySelector('[data-inventory-edit]')?.addEventListener('click',()=>openEditor(id));
  card.querySelector('[data-inventory-delete]')?.addEventListener('click',()=>{const found=findItem(id);if(!found)return;commit(`⌁ ${found.base.name} retiré de l’inventaire.`,()=>{const inv=normalize();inv.custom=inv.custom.filter(x=>x.id!==id)})});
  const note=card.querySelector('.inventory-note');if(note)note.addEventListener('change',()=>{const found=findItem(id);if(!found)return;api.push();found.entry.notes=note.value;api.save(true)});
 });
}
function render(){
 const inv=normalize();setView(inv.view,false);
 const ringSummary=$('#inventoryRingSummary');if(ringSummary){const used=(api.state.ring||[]).reduce((a,x)=>a+Number(x.level||0),0);ringSummary.textContent=`${used} / 5 niveaux`}
 renderObjects();
}
function openEditor(id=''){
 const dialog=$('#inventoryEditor'),form=$('#inventoryForm');if(!dialog||!form)return;
 form.reset();$('#inventoryEditId').value=id;$('#inventoryEditorTitle').textContent=id?'Modifier l’objet':'Ajouter un objet';$('#inventoryEditQty').value='1';$('#inventoryEditIcon').value='generic';
 if(id){const found=findItem(id);if(!found||found.fixed)return;$('#inventoryEditName').value=found.entry.name||'';$('#inventoryEditCategory').value=found.entry.category||'misc';$('#inventoryEditQty').value=Math.max(0,Number(found.entry.qty)||0);$('#inventoryEditNotes').value=found.entry.notes||'';$('#inventoryEditIcon').value=getIconChoice(found.entry.iconKey).key}
 renderIconPicker();
 if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','');
 setTimeout(()=>$('#inventoryEditName')?.focus(),30);
}
function renderIconPicker(){
 const picker=$('#inventoryIconPicker');if(!picker)return;const selected=getIconChoice($('#inventoryEditIcon')?.value).key;
 picker.innerHTML=allIconChoices().map(icon=>`<button type="button" class="inventory-icon-choice${icon.key===selected?' selected':''}${icon.custom?' custom':''}" data-icon-key="${esc(icon.key)}" role="radio" aria-checked="${icon.key===selected}">${icon.icon?`<img src="${esc(icon.icon)}" alt="">`:`<span class="icon-glyph">${esc(icon.glyph)}</span>`}<small>${esc(icon.label)}</small></button>`).join('');
 picker.querySelectorAll('[data-icon-key]').forEach(button=>button.addEventListener('click',()=>{$('#inventoryEditIcon').value=button.dataset.iconKey;renderIconPicker()}));
 const remove=$('#inventoryIconRemove');if(remove)remove.hidden=!getIconChoice(selected).custom;
}
function loadImage(file){return new Promise((resolve,reject)=>{const url=URL.createObjectURL(file),img=new Image();img.onload=()=>{URL.revokeObjectURL(url);resolve(img)};img.onerror=()=>{URL.revokeObjectURL(url);reject(new Error('Cette image ne peut pas être lue.'))};img.src=url})}
function canvasIcon(img,size,quality){const canvas=d.createElement('canvas');canvas.width=canvas.height=size;const ctx=canvas.getContext('2d'),pad=Math.round(size*.07),scale=Math.min((size-pad*2)/img.naturalWidth,(size-pad*2)/img.naturalHeight),w=img.naturalWidth*scale,h=img.naturalHeight*scale;ctx.clearRect(0,0,size,size);ctx.drawImage(img,(size-w)/2,(size-h)/2,w,h);return canvas.toDataURL('image/webp',quality)}
async function importCustomIcon(file){
 if(!/^image\/(png|jpeg|webp)$/i.test(file.type))throw new Error('Utilise une image PNG, JPEG ou WebP.');
 if(file.size>8*1024*1024)throw new Error('L’image source doit faire moins de 8 Mo.');
 if(normalize().customIcons.length>=20)throw new Error('La limite est de 20 icônes personnelles. Supprime une ancienne icône avant de continuer.');
 const img=await loadImage(file);let dataUrl=canvasIcon(img,256,.84);if(dataUrl.length>180000)dataUrl=canvasIcon(img,192,.72);if(dataUrl.length>180000)throw new Error('L’image reste trop lourde après compression. Choisis un fichier plus simple.');
 const key=`local-${Date.now().toString(36)}`,label=(file.name.replace(/\.[^.]+$/,'').trim()||'Icône personnelle').slice(0,36);
 api.push();normalize().customIcons.push({key,label,dataUrl});$('#inventoryEditIcon').value=key;api.save(true);renderIconPicker();api.log(`✦ Icône « ${label} » ajoutée au catalogue local et incluse dans les prochains exports.`);
}
function removeSelectedCustomIcon(){
 const key=$('#inventoryEditIcon').value,icon=getIconChoice(key);if(!icon.custom)return;
 if(!confirm(`Supprimer l’icône « ${icon.label} » du catalogue ? Les objets qui l’utilisent reprendront l’icône Éclipse.`))return;
 api.push();const inv=normalize();inv.customIcons=inv.customIcons.filter(x=>x.key!==key);inv.custom.forEach(item=>{if(item.iconKey===key)item.iconKey='generic'});$('#inventoryEditIcon').value='generic';api.save(true);renderIconPicker();api.log(`✦ Icône « ${icon.label} » supprimée du catalogue local.`);
}
function exportInventory(){
 const payload={kind:'kentaro-inventory',version:2,exportedAt:new Date().toISOString(),inventory:JSON.parse(JSON.stringify(normalize()))};
 const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),link=d.createElement('a');
 link.href=url;link.download=`kentaro-inventaire-${new Date().toISOString().slice(0,10)}.json`;d.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
 api.log('↓ Inventaire exporté : objets, quantités et notes sont réunis dans le fichier JSON.');
}
function cleanImportedInventory(raw){
 const source=raw?.kind==='kentaro-inventory'?raw.inventory:raw?.inventory||raw;
 if(!source||typeof source!=='object'||!source.items||!Array.isArray(source.custom))throw new Error('Format d’inventaire non reconnu.');
 const clean=freshState();clean.view=['linked','objects'].includes(source.view)?source.view:'objects';
 defaults.forEach(item=>{const value=source.items[item.id]||{};clean.items[item.id]={qty:Math.max(0,Math.min(99,Number(value.qty)||0)),notes:String(value.notes||'').slice(0,500)}});
 clean.customIcons=(Array.isArray(source.customIcons)?source.customIcons:[]).slice(0,20).map((icon,index)=>({key:`local-import-${Date.now().toString(36)}-${index}`,sourceKey:String(icon?.key||''),label:String(icon?.label||'Icône personnelle').slice(0,36),dataUrl:String(icon?.dataUrl||'')})).filter(icon=>/^data:image\/(png|jpeg|webp);base64,/i.test(icon.dataUrl)&&icon.dataUrl.length<=180000);
 const importedKeys=new Map(clean.customIcons.map(icon=>[icon.sourceKey,icon.key])),staticKeys=new Set(iconChoices.map(icon=>icon.key));clean.customIcons.forEach(icon=>delete icon.sourceKey);
 clean.custom=source.custom.slice(0,200).map((item,index)=>{const requested=String(item?.iconKey||'generic'),iconKey=staticKeys.has(requested)?requested:(importedKeys.get(requested)||'generic');return{id:`import-${Date.now().toString(36)}-${index}`,name:String(item?.name||'').trim().slice(0,80),category:categories[item?.category]?item.category:'misc',qty:Math.max(0,Math.min(99,Number(item?.qty)||0)),notes:String(item?.notes||'').slice(0,500),iconKey,description:String(item?.description||'Objet importé dans le registre de Kentaro.').slice(0,300)}}).filter(item=>item.name);
 return clean;
}
async function importInventory(file){
 try{
  const parsed=JSON.parse(await file.text()),clean=cleanImportedInventory(parsed);
  if(!confirm('Remplacer l’inventaire actuel par celui de ce fichier ? L’état de combat ne sera pas modifié.'))return;
  api.push();api.state.inventory=clean;api.render();api.log(`↑ Inventaire importé : ${allItems().filter(x=>Number(x.qty)>0).length} objets recensés. L’état de combat est inchangé.`);
 }catch(error){alert(error?.message||'Impossible d’importer ce fichier.');api.log('❌ Import de l’inventaire impossible : fichier invalide.')}
}
$$('[data-inventory-view]').forEach(b=>b.addEventListener('click',()=>setView(b.dataset.inventoryView)));
$('#inventorySearch')?.addEventListener('input',renderObjects);$('#inventoryCategory')?.addEventListener('change',renderObjects);$('#inventoryAdd')?.addEventListener('click',()=>openEditor());
$('#inventoryExport')?.addEventListener('click',exportInventory);$('#inventoryImport')?.addEventListener('click',()=>$('#inventoryImportFile')?.click());$('#inventoryImportFile')?.addEventListener('change',async e=>{const file=e.target.files?.[0];e.target.value='';if(file)await importInventory(file)});
$('#inventoryIconUpload')?.addEventListener('click',()=>$('#inventoryIconFile')?.click());$('#inventoryIconFile')?.addEventListener('change',async e=>{const file=e.target.files?.[0];e.target.value='';if(!file)return;try{await importCustomIcon(file)}catch(error){alert(error?.message||'Impossible d’ajouter cette icône.');api.log('❌ Import de l’icône impossible.')}});$('#inventoryIconRemove')?.addEventListener('click',removeSelectedCustomIcon);
$('#inventoryEditor .inventory-close')?.addEventListener('click',e=>{e.preventDefault();$('#inventoryEditor').close()});
$('#inventoryCancel')?.addEventListener('click',()=>$('#inventoryEditor').close());
$('#inventoryForm')?.addEventListener('submit',e=>{
 e.preventDefault();const id=$('#inventoryEditId').value,name=$('#inventoryEditName').value.trim();if(!name)return;
 const data={name,category:$('#inventoryEditCategory').value,qty:Math.max(0,Math.min(99,Number($('#inventoryEditQty').value)||0)),notes:$('#inventoryEditNotes').value.trim(),iconKey:getIconChoice($('#inventoryEditIcon').value).key};
 if(id){const found=findItem(id);if(!found||found.fixed)return;commit(`⌁ ${name} mis à jour dans l’inventaire.`,()=>Object.assign(found.entry,data))}
 else{const newId=`custom-${Date.now().toString(36)}`;commit(`⌁ ${name} ajouté à l’inventaire.`,()=>normalize().custom.push({id:newId,description:'Objet ajouté au registre de Kentaro.',...data}))}
 $('#inventoryEditor').close();
});
window.KentaroInventoryRender=render;
render();api.save(true);
})();
