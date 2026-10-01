(()=>{
'use strict';
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const social=$('[data-panel="social"]');
if(!social)return;

const profile={
  scores:{FOR:10,DEX:14,CON:16,INT:10,SAG:10,CHA:18},
  abilities:{FOR:0,DEX:2,CON:3,INT:0,SAG:0,CHA:4},
  saves:{FOR:0,DEX:2,CON:3,INT:0,SAG:4,CHA:8},
  skills:{
    'Athlétisme':0,'Acrobaties':2,'Discrétion':2,'Escamotage':2,
    'Arcanes':4,'Histoire':0,'Investigation':4,'Nature':0,'Religion':0,
    'Dressage':0,'Intuition':0,'Médecine':0,'Perception':0,'Survie':0,
    'Intimidation':8,'Persuasion':8,'Représentation':4,'Tromperie':8
  },
  extra:[
    ['Profil','Grand Voyageur · Dhampir · Pacte de la lame · Loyal neutre'],
    ['Combat','Maîtrise +4 · Initiative +2 · Vitesse 9 m · CA 18 · PV max 103'],
    ['Passifs','Perception passive 10 · Intuition passive 10 · Investigation passive 14'],
    ['Langues & instrument','Commun · Infernal · langue orientale · Ocarina'],
    ['Repères','34 ans · 179 cm · 76 kg · peau grise · cheveux blancs · yeux rouges'],
    ['Social','Charme prédateur : avantage aux tests de Charisme contre une cible éligible après 1 minute de conversation']
  ]
};

let pane='skills',mode='normal';

social.innerHTML=`
<div id="kentaro-social-v3">
  <div class="v3-heading">
    <div>
      <h2>Social · Kentaro Amane</h2>
      <p class="v3-sub">Jets de la fiche et informations utiles.</p>
    </div>
  </div>
  <nav class="v3-sheet-tabs" aria-label="Profil social">
    <button type="button" data-v3-sheet="skills" class="active">Compétences</button>
    <button type="button" data-v3-sheet="abilities">Carac. &amp; JdS</button>
    <button type="button" data-v3-sheet="info">Infos utiles</button>
  </nav>
  <div class="v3-switch v3-social-mode" role="group" aria-label="Mode de jet social">
    <button type="button" data-v3-social-mode="normal" class="active">Normal</button>
    <button type="button" data-v3-social-mode="adv">Avantage</button>
    <button type="button" data-v3-social-mode="dis">Désavantage</button>
  </div>
  <div id="kentaro-social-content"></div>
  <div id="v3-roll" class="v3-result" role="status" hidden></div>
</div>`;

function record(text){
  window.KentaroAPI?.log?.('♜ Social — '+text);
  if(typeof window.addLog==='function')window.addLog('Jet social · '+text);
}
function roll(label,bonus){
  const a=1+Math.floor(Math.random()*20);
  const b=mode==='normal'?null:1+Math.floor(Math.random()*20);
  const chosen=b===null?a:(mode==='adv'?Math.max(a,b):Math.min(a,b));
  const total=chosen+Number(bonus||0);
  const detail=b===null?`d20 ${a}`:`d20 ${a} / ${b} → ${chosen}`;
  const mod=bonus>=0?`+${bonus}`:`${bonus}`;
  const text=`${label} : ${detail} ${mod} = ${total}`;
  record(text);
  if(window.CompanionSocialDice?.show){
    window.CompanionSocialDice.show({label,dice:b===null?a:[a,b],bonus:Number(bonus||0),total,mode});
  }else{
    const out=$('#v3-roll',social);out.hidden=false;out.textContent=text;
  }
}
function list(values,kind){
  return Object.entries(values).map(([name,bonus])=>`
    <button type="button" data-v3-roll="${esc((kind==='saves'?'JdS ':'')+name)}" data-bonus="${Number(bonus)}">
      <span><b>${esc(name)}</b>${kind==='abilities'&&profile.scores[name]!==undefined?`<small>Score ${profile.scores[name]}</small>`:''}</span>
      <strong>${bonus>=0?'+':''}${bonus}</strong>
    </button>`).join('');
}
function render(){
  $$('[data-v3-sheet]',social).forEach(b=>b.classList.toggle('active',b.dataset.v3Sheet===pane));
  $$('[data-v3-social-mode]',social).forEach(b=>b.classList.toggle('active',b.dataset.v3SocialMode===mode));
  const root=$('#kentaro-social-content',social);
  if(pane==='skills'){
    root.innerHTML=`<article class="v3-card"><h3>Compétences</h3><div class="v3-roll-grid">${list(profile.skills,'skills')}</div></article>`;
  }else if(pane==='abilities'){
    root.innerHTML=`<div class="v3-social-grid">
      <article class="v3-card"><h3>Caractéristiques</h3><div class="v3-roll-grid">${list(profile.abilities,'abilities')}</div></article>
      <article class="v3-card"><h3>Jets de sauvegarde</h3><div class="v3-roll-grid">${list(profile.saves,'saves')}</div></article>
    </div>`;
  }else{
    root.innerHTML=`<article class="v3-card"><h3>Informations utiles</h3><div class="v3-extra-grid">${profile.extra.map(([k,v])=>`<div><small>${esc(k)}</small><b>${esc(v)}</b></div>`).join('')}</div></article>`;
  }
}
social.addEventListener('click',e=>{
  const p=e.target.closest('[data-v3-sheet]');
  if(p){pane=p.dataset.v3Sheet;render();return;}
  const m=e.target.closest('[data-v3-social-mode]');
  if(m){mode=m.dataset.v3SocialMode;render();return;}
  const r=e.target.closest('[data-v3-roll]');
  if(r)roll(r.dataset.v3Roll,Number(r.dataset.bonus));
});

const style=document.createElement('style');
style.id='kentaro-social-v3-style';
style.textContent=`
#kentaro-social-v3{--v3-panel:#15181f;--v3-panel2:#0e1117;--v3-line:#454954;--v3-muted:#aaa39a;--v3-accent:#c49a65;display:block}
#kentaro-social-v3 .v3-heading{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin:10px 0}
#kentaro-social-v3 .v3-heading h2{margin:0;color:#f0e4d2;font-family:Georgia,serif}
#kentaro-social-v3 .v3-sub,#kentaro-social-v3 small{color:var(--v3-muted)}
#kentaro-social-v3 .v3-card{background:linear-gradient(145deg,var(--v3-panel),var(--v3-panel2));border:1px solid var(--v3-line);border-radius:16px;padding:15px;margin:8px 0;box-shadow:0 12px 30px #0005}
#kentaro-social-v3 .v3-card h3{margin:0 0 10px;color:#efdec6}
#kentaro-social-v3 .v3-sheet-tabs{display:flex;gap:6px;overflow-x:auto;margin:9px 0;padding:5px;border:1px solid var(--v3-line);border-radius:12px;background:#11151bcf}
#kentaro-social-v3 .v3-sheet-tabs button{flex:1 0 auto;min-height:42px;padding:7px 10px;border-radius:9px;font-size:12px}
#kentaro-social-v3 .v3-sheet-tabs button.active{border-color:var(--v3-accent);color:#fff2d8;background:#473527}
#kentaro-social-v3 .v3-switch{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0}
#kentaro-social-v3 .v3-social-mode{position:sticky;top:0;z-index:20;padding:5px;border:1px solid #3f424b;border-radius:11px;background:#11141af2;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)}
#kentaro-social-v3 .v3-social-mode button{flex:1;min-height:40px}
#kentaro-social-v3 .v3-social-mode button.active{border-color:var(--v3-accent);color:#ffe4bb;background:#34251d}
#kentaro-social-v3 .v3-social-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
#kentaro-social-v3 .v3-roll-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px}
#kentaro-social-v3 .v3-roll-grid button{display:flex;align-items:center;justify-content:space-between;gap:7px;min-height:54px;padding:9px 10px;text-align:left;border:1px solid #44464f;border-radius:10px;background:#0b0e13;color:#eee1d0}
#kentaro-social-v3 .v3-roll-grid button span{display:grid;gap:2px;min-width:0}
#kentaro-social-v3 .v3-roll-grid button b{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
#kentaro-social-v3 .v3-roll-grid button small{font-size:10px;opacity:.75}
#kentaro-social-v3 .v3-roll-grid button strong{font-size:16px;color:#e2bd88}
#kentaro-social-v3 .v3-extra-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
#kentaro-social-v3 .v3-extra-grid>div{border:1px solid #2c3034;border-radius:11px;background:#0b0d0f;padding:10px}
#kentaro-social-v3 .v3-extra-grid small,#kentaro-social-v3 .v3-extra-grid b{display:block}
#kentaro-social-v3 .v3-extra-grid small{text-transform:uppercase;letter-spacing:.06em;font-size:.67rem}
#kentaro-social-v3 .v3-extra-grid b{margin-top:3px;font-size:.86rem;line-height:1.45}
#kentaro-social-v3 .v3-result{padding:15px;background:#2a2119;border:1px solid var(--v3-accent);border-radius:14px;margin:16px 0;font-weight:800}
@media(max-width:760px){
 #kentaro-social-v3 .v3-social-grid{grid-template-columns:1fr}
 #kentaro-social-v3 .v3-roll-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
 #kentaro-social-v3 .v3-extra-grid{grid-template-columns:1fr}
}
@media(max-width:430px){
 #kentaro-social-v3 .v3-roll-grid{grid-template-columns:1fr 1fr}
 #kentaro-social-v3 .v3-sheet-tabs button{font-size:11px;padding:6px 8px}
}`;
document.head.appendChild(style);
render();
})();