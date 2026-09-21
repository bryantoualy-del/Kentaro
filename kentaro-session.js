(()=>{
'use strict';
const api=window.KentaroAPI,panel=document.querySelector('[data-panel="journal"]');if(!api||!panel)return;
const KEY='kentaro-session-v1',esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const nowTitle=()=>`Session du ${new Date().toLocaleDateString('fr-FR')}`;
const blank=start=>({id:`session-${Date.now()}`,title:nowTitle(),startedAt:new Date().toISOString(),startIndex:start,notes:'',highlights:[]});
function load(){try{const x=JSON.parse(localStorage.getItem(KEY));if(x&&x.version===1)return x}catch(_){}return{version:1,active:blank(0),archives:[]}}
let data=load();if(!data.active)data.active=blank(0);if(!Array.isArray(data.archives))data.archives=[];
const save=()=>localStorage.setItem(KEY,JSON.stringify(data));
const journal=()=>Array.isArray(api.state.journal)?api.state.journal.map(String):[];
const activeEntries=()=>journal().slice(Math.min(data.active.startIndex||0,journal().length));
function social(){try{const s=JSON.parse(localStorage.getItem('kentaro-social-v2'))||{};return{relations:Array.isArray(s.relations)?s.relations:[],memories:Array.isArray(s.memories)?s.memories:[]}}catch(_){return{relations:[],memories:[]}}}
function socialLines(s=social()){
 const rel=s.relations.filter(x=>x?.name).slice(0,12).map(x=>`- **${x.name}** (${x.category||'relation'}${x.status?` · ${x.status}`:''})${x.promise?` — Promesse : ${x.promise}`:''}${x.debt?` — Dette : ${x.debt}`:''}${x.goal?` — Objectif : ${x.goal}`:''}`);
 const mem=s.memories.filter(x=>x?.title||x?.text||x?.notes).sort((a,b)=>Number(!!b.important)-Number(!!a.important)).slice(0,12).map(x=>`- ${x.important?'★ ':''}**${x.title||x.type||'Mémoire'}** — ${x.text||x.notes||x.body||''}`);
 return [...rel,...mem];
}
function stats(entries){
 const count=re=>entries.filter(x=>re.test(x)).length;
 return{events:entries.length,attacks:count(/attaque|solinar|sélhane|décharge|spectre/i),spells:count(/sort|lancé|concentration|porte dimensionnelle|synapti|voile/i),rests:count(/repos/i),social:count(/social|relation|mémoire|promesse/i)};
}
function useful(entries){
 const seen=new Set();return entries.filter(x=>{const v=x.trim();if(!v||seen.has(v))return false;seen.add(v);return true}).slice(-60);
}
function summary(session,entries=activeEntries(),socialSnapshot=social()){
 const st=stats(entries),marks=session.highlights||[],socials=socialLines(socialSnapshot),date=new Date(session.startedAt||Date.now()).toLocaleDateString('fr-FR');
 const sections=[`# ${session.title||'Session de Kentaro'}`,`_Commencée le ${date} · ${st.events} événements consignés_`];
 sections.push('\n## Notes de séance\n'+(session.notes?.trim()||'_Aucune note libre._'));
 sections.push('\n## Faits marquants\n'+(marks.length?marks.map(x=>`- **${x.type||'Événement'}** — ${x.text}`).join('\n'):'_Aucun fait marquant ajouté._'));
 const chronology=useful(entries);sections.push('\n## Chronologie\n'+(chronology.length?chronology.map(x=>`- ${x}`).join('\n'):'_Aucun événement enregistré._'));
 sections.push('\n## Relations et mémoire\n'+(socials.length?socials.join('\n'):'_Aucun élément social renseigné._'));
 sections.push(`\n## Bilan mécanique\n- ${st.attacks} événements de combat\n- ${st.spells} événements liés aux sorts\n- ${st.rests} repos\n- ${st.social} événements sociaux`);
 const follow=[...marks.filter(x=>/objectif|promesse|indice/i.test(x.type||'')).map(x=>x.text),...socialSnapshot.relations.filter(x=>x?.promise||x?.goal).flatMap(x=>[x.promise&&`${x.name} — ${x.promise}`,x.goal&&`${x.name} — ${x.goal}`].filter(Boolean))];
 sections.push('\n## À suivre\n'+(follow.length?follow.map(x=>`- ${x}`).join('\n'):'_À compléter à la prochaine séance._'));
 return sections.join('\n');
}
function aiPacket(){const a=data.active,e=activeEntries(),s=social();return`Rédige un résumé narratif fidèle et concis de cette session de D&D. Sépare : récit, révélations, relations, décisions/promesses, butin/ressources et pistes pour la prochaine séance. N’invente aucun fait.\n\n${summary(a,e,s)}\n\n## Données brutes complémentaires\n${e.map(x=>`- ${x}`).join('\n')}`}
const desk=document.createElement('article');desk.className='session-desk';desk.innerHTML=`
 <header class="session-head"><div><span class="session-kicker">Registre de session</span><input id="sessionTitle" aria-label="Titre de la session"></div><div class="session-count" id="sessionCount"></div></header>
 <div class="session-grid"><label class="session-notes"><span>Notes persistantes</span><textarea id="sessionNotes" placeholder="PNJ rencontrés, décisions, révélations, impressions…"></textarea><small>Sauvegarde automatique sur cet appareil.</small></label>
 <section class="session-marks"><span>Faits marquants</span><div class="session-capture"><select id="markType"><option>Événement</option><option>PNJ</option><option>Décision</option><option>Indice</option><option>Promesse</option><option>Objectif</option><option>Butin</option></select><input id="markText" placeholder="Ajouter un fait important…"><button id="addMark">Ajouter</button></div><div id="markList"></div></section></div>
 <div class="session-actions"><button id="makeSummary">Générer le résumé</button><button id="copyAI">Copier pour ChatGPT</button><button id="exportSummary">Exporter .md</button><button id="closeSession" class="session-close">Clore et archiver</button></div>
 <section id="summaryPreview" class="session-preview" hidden><div><b>Résumé généré</b><button id="copySummary">Copier</button></div><pre></pre></section>
 <details class="session-archives"><summary>Sessions archivées <span id="archiveCount"></span></summary><div id="archiveList"></div></details>`;
const firstCard=panel.querySelector('.card');panel.insertBefore(desk,firstCard);
const $=q=>desk.querySelector(q),title=$('#sessionTitle'),notes=$('#sessionNotes'),markText=$('#markText'),preview=$('#summaryPreview');
function render(){
 title.value=data.active.title||'';notes.value=data.active.notes||'';const e=activeEntries(),st=stats(e);$('#sessionCount').textContent=`${st.events} événements · ${data.active.highlights.length} repères`;
 $('#markList').innerHTML=data.active.highlights.length?data.active.highlights.map((x,i)=>`<button class="session-mark" data-remove="${i}" title="Retirer"><b>${esc(x.type)}</b><span>${esc(x.text)}</span><i>×</i></button>`).join(''):'<small class="session-empty">Ajoute ici ce qui devra absolument apparaître dans le résumé.</small>';
 $('#archiveCount').textContent=`(${data.archives.length})`;$('#archiveList').innerHTML=data.archives.length?data.archives.map((x,i)=>`<article><div><b>${esc(x.title)}</b><small>${new Date(x.endedAt).toLocaleDateString('fr-FR')} · ${x.journal?.length||0} événements</small></div><button data-copy-archive="${i}">Copier</button><button data-export-archive="${i}">.md</button></article>`).join(''):'<p class="session-empty">Aucune session close pour le moment.</p>';
}
function flash(button,label){const old=button.textContent;button.textContent=label;setTimeout(()=>button.textContent=old,1300)}
async function copy(text,button){try{await navigator.clipboard.writeText(text);flash(button,'Copié ✓')}catch(_){const ta=document.createElement('textarea');ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();flash(button,'Copié ✓')}}
function download(text,name){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type:'text/markdown;charset=utf-8'}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
function showSummary(){const text=summary(data.active);preview.hidden=false;preview.querySelector('pre').textContent=text;preview.scrollIntoView({behavior:'smooth',block:'nearest'});return text}
title.oninput=()=>{data.active.title=title.value;save()};notes.oninput=()=>{data.active.notes=notes.value;save()};
$('#addMark').onclick=()=>{const text=markText.value.trim();if(!text)return;data.active.highlights.push({type:$('#markType').value,text,createdAt:new Date().toISOString()});markText.value='';save();render()};
markText.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();$('#addMark').click()}};
$('#markList').onclick=e=>{const b=e.target.closest('[data-remove]');if(!b)return;data.active.highlights.splice(Number(b.dataset.remove),1);save();render()};
$('#makeSummary').onclick=showSummary;$('#copySummary').onclick=e=>copy(preview.querySelector('pre').textContent,e.currentTarget);$('#copyAI').onclick=e=>copy(aiPacket(),e.currentTarget);$('#exportSummary').onclick=()=>download(showSummary(),`${(data.active.title||'session-kentaro').replace(/[^a-z0-9à-ÿ]+/gi,'-').toLowerCase()}.md`);
$('#closeSession').onclick=()=>{if(!confirm('Clore cette session et conserver son résumé dans les archives ?'))return;const entries=activeEntries(),snap=social(),closed={...data.active,endedAt:new Date().toISOString(),journal:entries,social:snap};closed.summary=summary(closed,entries,snap);data.archives.unshift(closed);data.archives=data.archives.slice(0,30);api.log(`☷ Session archivée : ${closed.title}`);data.active=blank(journal().length);save();preview.hidden=true;render()};
$('#archiveList').onclick=e=>{const copyBtn=e.target.closest('[data-copy-archive]'),exportBtn=e.target.closest('[data-export-archive]');if(copyBtn){const x=data.archives[Number(copyBtn.dataset.copyArchive)];copy(x.summary||summary(x,x.journal,x.social),copyBtn)}if(exportBtn){const x=data.archives[Number(exportBtn.dataset.exportArchive)];download(x.summary||summary(x,x.journal,x.social),`${x.title.replace(/[^a-z0-9à-ÿ]+/gi,'-').toLowerCase()}.md`)}};
new MutationObserver(()=>{const e=activeEntries();$('#sessionCount').textContent=`${e.length} événements · ${data.active.highlights.length} repères`}).observe(document.querySelector('#log'),{childList:true});
const style=document.createElement('style');style.textContent=`
.session-desk{margin:10px 0 12px;padding:14px;border:1px solid #51483f;border-radius:14px;background:linear-gradient(145deg,#171418,#0c0d11);box-shadow:0 12px 32px #0005}.session-head{display:flex;justify-content:space-between;gap:12px;align-items:center;margin-bottom:11px}.session-kicker,.session-notes>span,.session-marks>span{display:block;margin-bottom:5px;color:#c79c61;font-size:.65rem;letter-spacing:.14em;text-transform:uppercase}.session-head input{width:min(520px,65vw);border:0;border-bottom:1px solid #4b423a;background:transparent;color:#f1e5d3;font:700 1.22rem Georgia,serif;padding:3px 0}.session-count{color:#948b82;font-size:.7rem;white-space:nowrap}.session-grid{display:grid;grid-template-columns:minmax(260px,.8fr) 1.2fr;gap:10px}.session-notes textarea{display:block;width:100%;min-height:150px;padding:10px;border:1px solid #3c3d44;border-radius:10px;background:#090a0e;color:#eee4d7;resize:vertical;line-height:1.45}.session-notes small,.session-empty{color:#89827b;font-size:.68rem}.session-capture{display:grid;grid-template-columns:115px 1fr auto;gap:6px}.session-capture select,.session-capture input{min-height:42px;padding:7px;border:1px solid #414149;border-radius:9px;background:#0a0b0f;color:#eee4d7}.session-capture button{min-height:42px}.session-marks{min-width:0}.session-marks #markList{display:grid;gap:5px;margin-top:7px}.session-mark{display:grid;grid-template-columns:76px 1fr auto;gap:7px;align-items:center;width:100%;min-height:38px;padding:6px 8px;text-align:left;border-color:#3d3b40;background:#121116}.session-mark b{color:#c89e64;font-size:.66rem;text-transform:uppercase}.session-mark span{overflow:hidden;text-overflow:ellipsis;color:#ddd3c7}.session-mark i{color:#917e6e;font-style:normal}.session-actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:11px}.session-actions button{min-height:42px}.session-actions .session-close{margin-left:auto;border-color:#7b493f;color:#e6bbb0}.session-preview{margin-top:10px;padding:10px;border:1px solid #45434a;border-radius:10px;background:#090a0e}.session-preview>div{display:flex;justify-content:space-between;align-items:center}.session-preview pre{max-height:420px;overflow:auto;white-space:pre-wrap;color:#d9d0c5;font:500 .76rem/1.5 ui-monospace,monospace}.session-archives{margin-top:10px;border-top:1px solid #302e33;padding-top:9px}.session-archives summary{cursor:pointer;color:#baaa96;font-size:.76rem}.session-archives article{display:grid;grid-template-columns:1fr auto auto;gap:6px;align-items:center;padding:7px 0;border-bottom:1px solid #2d2c31}.session-archives article small{display:block;color:#888078;margin-top:2px}.session-archives button{min-height:38px}
@media(max-width:767px){.session-head{align-items:flex-start;flex-direction:column}.session-head input{width:100%}.session-grid{grid-template-columns:1fr}.session-capture{grid-template-columns:110px 1fr}.session-capture button{grid-column:1/-1}.session-actions{display:grid;grid-template-columns:1fr 1fr}.session-actions .session-close{margin:0;grid-column:1/-1}.session-count{white-space:normal}.session-archives article{grid-template-columns:1fr auto}.session-archives article button:last-child{grid-column:2}.session-mark{grid-template-columns:68px 1fr auto}}
`;document.head.appendChild(style);save();render();
})();
