(()=>{
const d=document, qs=s=>d.querySelector(s), qsa=s=>[...d.querySelectorAll(s)];
const asset=name=>`assets/icons/${name}.webp`;

const style=d.createElement('style');
style.id='kentaro-wonq-modern-style';
style.textContent=`
:root{
 --k-bg:#090a0e;--k-surface:#111216;--k-surface2:#17181e;--k-line:#373a45;
 --k-ink:#f4eee5;--k-muted:#aaa29a;--k-gold:#d9ae65;--k-red:#a8323c;
 --k-sun:#f3a243;--k-moon:#74aef5;--k-violet:#8f78b8;--k-green:#75957e;
}
html{background:#07080b}
body{font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif!important;background:
 radial-gradient(circle at 18% -10%,rgba(191,102,42,.13),transparent 32rem),
 radial-gradient(circle at 82% -8%,rgba(78,118,190,.14),transparent 31rem),
 radial-gradient(circle at 50% 110%,rgba(112,28,40,.08),transparent 34rem),
 #08090c!important;color:var(--k-ink)!important}
.wrap{max-width:1240px!important;padding:12px!important}
.shell{overflow:visible!important;background:linear-gradient(180deg,rgba(17,18,23,.985),rgba(10,11,14,.99))!important;border:1px solid #3a3b43!important;border-radius:20px!important;box-shadow:0 22px 70px #0009!important}
.shell:before,.shell:after{height:2px!important;opacity:.9}
.top-modern{display:grid;grid-template-columns:minmax(300px,1.25fr) minmax(0,2fr);gap:14px;align-items:stretch}
.identity-modern{position:relative;overflow:hidden;border:1px solid #403d3c;border-radius:16px;background:
 linear-gradient(145deg,#171519f0,#0d0e12f5),radial-gradient(circle at 85% 20%,#d6a85c22,transparent 36%);min-height:180px}
.identity-modern .head{height:100%;display:flex;flex-direction:column;align-items:flex-start;justify-content:center;text-align:left!important;border:0!important;padding:20px 118px 20px 20px!important}
.identity-modern .head::before,.identity-modern .head::after{display:none!important}
.identity-modern .head h1{font-size:clamp(2.2rem,5vw,4rem)!important;line-height:.92!important;letter-spacing:.08em!important;margin:5px 0 10px!important}
.identity-modern .subtitle{font:500 .9rem/1.45 system-ui,-apple-system,sans-serif!important;color:#beb4a7!important;font-style:normal!important;max-width:46ch}
.identity-modern .eclipse-mark{justify-content:flex-start!important;margin:0!important;font-size:.78rem!important;letter-spacing:.15em;text-transform:uppercase;color:#b9aa98}
.identity-modern .eclipse-mark span:nth-child(2){opacity:.4}
.identity-signature{position:absolute;right:10px;top:50%;width:108px;height:108px;transform:translateY(-50%);object-fit:contain;filter:drop-shadow(0 8px 18px #000c) drop-shadow(0 0 18px #d4ae6550);opacity:.94;pointer-events:none}
.identity-motto{margin-top:10px;color:#d2ad70;font:italic .86rem Georgia,serif;letter-spacing:.03em}
.dashboard-modern{display:grid;grid-template-rows:auto auto;gap:8px;min-width:0}
.dashboard-modern .stats,.dashboard-modern .resources{margin:0!important}
.stats{grid-template-columns:1.35fr repeat(5,1fr)!important}
.resources{grid-template-columns:repeat(6,1fr)!important}
.dashboard-modern .card{padding:10px!important;min-width:0;border-radius:13px!important;background:linear-gradient(160deg,#1b1c22,#111217)!important;border-color:#363942!important;text-align:left!important;overflow:hidden}
.dashboard-modern .card .big{font-size:1.32rem!important;line-height:1.2;margin-top:4px;white-space:nowrap}
.dashboard-modern .card:nth-child(n+1){box-shadow:inset 0 1px #ffffff05}
.hp-controls{justify-content:flex-start!important}
.hp-controls button{min-width:36px!important;padding:5px 8px!important}.hp-controls input{width:68px!important;min-height:36px!important}
.turn-economy{position:sticky!important;top:max(6px,env(safe-area-inset-top))!important;z-index:40!important;margin-top:12px!important;padding:7px!important;border:1px solid #49433e!important;background:#0d0e12ee!important;border-radius:14px!important;box-shadow:0 10px 30px #0008!important;backdrop-filter:blur(14px)!important;-webkit-backdrop-filter:blur(14px)!important;grid-template-columns:auto repeat(5,minmax(76px,1fr)) auto!important}
.turn-label,.eco,.turn-next{min-height:58px!important;border-radius:10px!important}
.turn-label{background:linear-gradient(145deg,#211c15,#15120f)!important;border-color:#66543b!important}
.eco{background:linear-gradient(145deg,#17191e,#101116)!important;border-color:#3a3f49!important}
.eco.free{border-color:#44574a!important}.eco.used{opacity:.52!important}.eco b{letter-spacing:.01em}
#ecoConc{background:linear-gradient(145deg,#1d1825,#11131c)!important;border-color:#57496d!important}
.turn-next{background:linear-gradient(145deg,#3a3020,#211a11)!important;border-color:#725e38!important;font-weight:800!important;color:#ebc77d!important}
.tabs{position:relative!important;top:auto!important;z-index:25!important;margin:10px 0 12px!important;display:flex!important;gap:6px!important;flex-wrap:nowrap!important;overflow-x:auto!important;padding:6px!important;background:#0d0e12e8!important;border:1px solid #3b3c43!important;border-radius:14px!important;scrollbar-width:none}
.tabs::-webkit-scrollbar{display:none}.tab{flex:1 0 auto!important;min-width:118px!important;border-radius:10px!important;background:#17181d!important;border-color:#373941!important;color:#cfc6ba!important;font-weight:750!important}
.tab.active{color:#fff6e5!important;background:linear-gradient(135deg,#4a2b22,#2c2737 50%,#21354c)!important;border-color:#8b6c48!important;box-shadow:inset 0 0 0 1px #d5b57425,0 0 18px #0004!important}
.panel>.grid,.social-grid,.spectre-layout{gap:10px!important}
.card{border-radius:14px!important;border-color:#353841!important;background:linear-gradient(155deg,#18191f,#101116)!important;box-shadow:inset 0 1px #ffffff05}
.action-title{font-family:Georgia,"Times New Roman",serif!important;font-size:1.05rem!important;letter-spacing:.01em}
.meta{font-family:system-ui,-apple-system,sans-serif!important;line-height:1.42!important;color:#aaa39a!important}
button{font-family:system-ui,-apple-system,sans-serif!important;border-radius:10px!important;transition:transform .12s ease,border-color .15s ease,background .15s ease,box-shadow .15s ease}
button:hover{border-color:#6b6258;box-shadow:0 5px 14px #0004}button:active{transform:translateY(1px) scale(.995)}
.combat-layout{grid-template-columns:300px minmax(0,1fr)!important;gap:10px!important}
.target-stack{top:92px!important}
.target-card{background:linear-gradient(155deg,#1d1915,#101116)!important}
.attack-toolbar{border-radius:12px!important;background:#101116!important;border-color:#353841!important}
.attack-grid{gap:10px!important}
.blade-card{min-height:174px!important;padding-right:148px!important}
.blade-card .item-art{width:130px!important;height:130px!important;right:8px!important;filter:drop-shadow(0 10px 16px #000b)!important}
.solar{background:linear-gradient(150deg,#211711,#151318)!important;border-color:#5d4126!important}.lunar{background:linear-gradient(150deg,#121923,#14141a)!important;border-color:#315176!important}
.solar .item-art{filter:drop-shadow(0 8px 20px #f4a64a4c) drop-shadow(0 9px 15px #000b)!important}.lunar .item-art{filter:drop-shadow(0 8px 20px #6baaf54a) drop-shadow(0 9px 15px #000b)!important}
img[src*="02_Selhane"]{clip-path:polygon(0 0,100% 0,100% 70%,79% 70%,79% 100%,0 100%)}
.art-card{min-height:122px!important;padding-right:100px!important}.art-card .item-art{width:88px!important;height:88px!important;right:8px!important}
.art-pair img{width:74px!important;height:92px!important}
.seal-banner{position:relative;overflow:hidden;min-height:68px;padding-right:70px!important}.seal-art{float:none!important;position:absolute;right:3px;top:50%;transform:translateY(-50%);width:66px!important;height:66px!important;margin:0!important;opacity:.9}
.seal-banner::after{content:"";position:absolute;right:4px;top:50%;width:62px;height:62px;transform:translateY(-50%);background:url('assets/icons/09_Sceau_de_l_Eclipse.webp') center/contain no-repeat;filter:drop-shadow(0 5px 12px #000b);opacity:.75}.seal-banner.seal-partial{border-color:#8a6c3e!important}.seal-banner.seal-ready{border-color:#7567a8!important;box-shadow:inset 0 0 24px #755e9b1f}.seal-banner.seal-marked{border-color:#c0914f!important;box-shadow:inset 0 0 28px #3a41613d,0 0 14px #d7a85b1f}
.quick-pact{width:100%;display:flex;align-items:center;gap:10px;margin:0 0 10px;padding:8px 10px;border:1px solid #4c4337;border-radius:12px;background:linear-gradient(145deg,#1d1813,#121217);color:var(--k-ink);cursor:pointer}
.quick-pact small{text-transform:uppercase;letter-spacing:.09em;color:#a89c8e}.quick-pact b{margin-left:auto;color:#e2bd77;font-size:.95rem}
.context-panel{position:relative;overflow:hidden}.context-panel:after{content:"";position:absolute;right:-10px;bottom:-14px;width:92px;height:92px;background:var(--context-icon) center/contain no-repeat;opacity:.12;filter:saturate(.82);pointer-events:none}.context-panel>*{position:relative;z-index:1}
.social-grid{grid-template-columns:1fr 1fr!important}
.social-wide{grid-column:1/-1!important}
.social-grid .card{min-height:170px}
.social-kicker{color:#c6a36e!important;font-family:system-ui,-apple-system,sans-serif!important}
.social-hero{grid-column:1/-1;display:grid;grid-template-columns:minmax(0,1.5fr) minmax(220px,.8fr);gap:10px;align-items:stretch}
.social-hero .card{min-height:160px}
.social-memory-art{position:relative;overflow:hidden;border:1px solid #423c3d;border-radius:14px;background:linear-gradient(145deg,#17151a,#0d0e12);min-height:160px}
.social-memory-art img{position:absolute;right:0;bottom:-12px;width:165px;height:165px;object-fit:contain;filter:drop-shadow(0 10px 20px #000b);opacity:.88}
.social-memory-art .copy{position:relative;z-index:1;padding:16px 150px 16px 16px}
.social-memory-art b{display:block;font:700 1.08rem Georgia,serif;color:#e0bd7c;margin-bottom:5px}
.social-tools{grid-template-columns:repeat(2,1fr)!important}
.social-tool{background:#0e1015!important;border-color:#353943!important}
.social-input,.social-textarea,.compact-input,.ring-controls select,.ring-controls input{font-family:system-ui,-apple-system,sans-serif!important;background:#0b0c10!important;border-color:#41444e!important}
.journal-panel .card{background:linear-gradient(155deg,#121318,#0a0b0e)!important}.journal-panel .log{max-height:560px!important;min-height:340px!important;background:#08090c!important;border-color:#333640!important;font-size:.8rem!important;line-height:1.5!important}
.utility-bar{margin-top:14px!important;border-top-color:#31333a!important}.utility-bar button{background:#15171c!important;border-color:#373a43!important}
.result-badge{background:linear-gradient(135deg,#4b3024,#272337,#1e354b)!important;border-color:#9c784b!important}
#kentaro-ribbon{background:linear-gradient(135deg,#5d2e23,#31293e 50%,#1d3d5c)!important;border-color:#c99d5a!important;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px)}
.section-intro{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:2px 0 10px;padding:0 2px}.section-intro .kicker{font-size:.68rem;text-transform:uppercase;letter-spacing:.12em;color:#9f9589}.section-intro strong{font:700 1rem Georgia,serif;color:#e9dcc8}
@media(max-width:1100px){
 .top-modern{grid-template-columns:1fr}.identity-modern .head{min-height:160px}.dashboard-modern .stats{grid-template-columns:repeat(6,1fr)!important}.dashboard-modern .resources{grid-template-columns:repeat(3,1fr)!important}
 .turn-economy{grid-template-columns:repeat(4,1fr)!important}.turn-label{grid-column:span 1}.turn-next{grid-column:span 2}
 .combat-layout{grid-template-columns:260px minmax(0,1fr)!important}
}
@media(max-width:767px){
 .wrap{padding:6px!important}.shell{padding:9px!important;border-radius:14px!important}
 .top-modern{display:block}.identity-modern{min-height:136px;border-radius:12px}.identity-modern .head{min-height:136px;padding:14px 84px 14px 14px!important}.identity-modern .head h1{font-size:2.2rem!important}.identity-modern .subtitle{font-size:.76rem!important}.identity-signature{width:76px;height:76px;right:4px}
 .dashboard-modern{margin-top:8px}.dashboard-modern .stats{grid-template-columns:repeat(3,1fr)!important}.dashboard-modern .resources{grid-template-columns:repeat(2,1fr)!important}
 .dashboard-modern .card{padding:8px!important}.dashboard-modern .card .big{font-size:1.08rem!important}
 .turn-economy{grid-template-columns:repeat(3,1fr)!important;padding:5px!important;top:max(4px,env(safe-area-inset-top))!important;gap:4px!important}.turn-label{grid-column:span 2!important}.turn-next{grid-column:span 1!important}.eco,.turn-label,.turn-next{min-height:44px!important;padding:5px!important;font-size:.68rem!important}.eco b{font-size:.7rem!important;margin-bottom:2px!important}.turn-next{white-space:normal!important;line-height:1.05!important}.turn-damage{font-size:.62rem!important}
 .tabs{margin-top:8px!important}.tab{min-width:108px!important;min-height:40px!important;padding:7px 9px!important;font-size:.78rem!important}
 .combat-layout{grid-template-columns:1fr!important}.target-stack{position:static!important}
 .attack-grid{grid-template-columns:1fr!important}.blade-card{padding-right:104px!important;min-height:146px!important}.blade-card .item-art{width:92px!important;height:92px!important}
 .art-card{padding-right:76px!important}.art-card .item-art{width:66px!important;height:66px!important}
 .social-grid{grid-template-columns:1fr!important}.social-wide{grid-column:auto!important}.social-hero{grid-template-columns:1fr!important}.social-memory-art .copy{padding-right:125px}.social-memory-art img{width:135px;height:135px}
 .social-tools{grid-template-columns:1fr!important}.journal-panel .log{min-height:260px!important}
 .utility-bar{grid-template-columns:1fr!important}.utility-rest,.utility-tools{grid-template-columns:repeat(3,1fr)!important}
}
@media(min-width:768px){
 .top-modern{grid-template-columns:minmax(260px,.95fr) minmax(0,2fr)!important}
 .dashboard-modern .stats{grid-template-columns:repeat(6,minmax(0,1fr))!important}
 .dashboard-modern .resources{grid-template-columns:repeat(3,minmax(0,1fr))!important}
}
@media(prefers-reduced-motion:reduce){*{scroll-behavior:auto!important;transition:none!important;animation-duration:.01ms!important}}
`;
d.head.appendChild(style);

const head=qs('.head'), stats=qs('.stats'), resources=qs('.resources'), shell=qs('#app');
if(head&&stats&&resources&&shell&&!qs('.top-modern')){
 const top=d.createElement('section');top.className='top-modern';
 const identity=d.createElement('div');identity.className='identity-modern';
 const dashboard=d.createElement('div');dashboard.className='dashboard-modern';
 shell.insertBefore(top,head);top.append(identity,dashboard);identity.appendChild(head);dashboard.append(stats,resources);
 const sig=d.createElement('img');sig.className='identity-signature';sig.src=asset('09_Sceau_de_l_Eclipse');sig.alt='';sig.setAttribute('aria-hidden','true');identity.appendChild(sig);
 const motto=d.createElement('div');motto.className='identity-motto';motto.textContent='Entre l’ombre et la lumière, Kentaro tient encore la lame.';head.appendChild(motto);
}

const newTurn=qs('#newTurn');if(newTurn)newTurn.textContent='↻ Tour suivant';

const combat=qs('[data-panel="combat"]');
if(combat&&!qs('#quickPact')){
 const quick=d.createElement('button');quick.type='button';quick.id='quickPact';quick.className='quick-pact';
 quick.innerHTML='<small>Emplacements de pacte</small><b id="quickPactValue">2/2</b>';
 combat.insertBefore(quick,combat.firstChild);
 quick.addEventListener('click',()=>qs('.tab[data-tab="spells"]')?.click());
 const sync=()=>{const src=qs('#slotView'),dst=qs('#quickPactValue');if(src&&dst)dst.textContent=src.textContent};
 const obs=new MutationObserver(sync);if(qs('#slotView'))obs.observe(qs('#slotView'),{childList:true,subtree:true,characterData:true});sync();
}

const intros={
 combat:['Combat','Lames jumelles · cible · économie du tour'],
 spells:['Sorts','Pacte · contrôle · mobilité'],
 defense:['Défenses','Réactions · dégâts reçus · survie'],
 items:['Équipement','Reliques · anneaux · mémoire'],
 spectre:['Spectre','Compagnon maudit · suivi autonome'],
 social:['Social','Relations · identité · mémoire'],
 journal:['Journal','Historique complet de la session']
};
qsa('.panel[data-panel]').forEach(panel=>{
 if(panel.querySelector(':scope>.section-intro'))return;
 const key=panel.dataset.panel;if(!intros[key])return;
 const intro=d.createElement('div');intro.className='section-intro';
 intro.innerHTML=`<div><div class="kicker">${intros[key][0]}</div><strong>${intros[key][1]}</strong></div>`;
 panel.insertBefore(intro,panel.firstChild);
});

const social=qs('[data-panel="social"] .social-grid');
if(social&&!social.querySelector('.social-hero')){
 const hero=d.createElement('div');hero.className='social-hero';
 hero.innerHTML=`
 <article class="social-memory-art">
   <div class="copy"><div class="social-kicker">Mémoire fracturée</div><b>Jemal Dormy & les âmes fusionnées</b><div class="meta">Kentaro est revenu sans battement de cœur. Son identité porte des souvenirs qui ne sont pas tous les siens. Utilise le registre social pour noter ce qui revient, ce qui manque, et ce qu’il promet de ne plus perdre.</div></div>
   <img src="${asset('06_Tombeau_de_Lazarus')}" alt="" aria-hidden="true">
 </article>
 <article class="social-memory-art">
   <div class="copy"><div class="social-kicker">Héritage Amane</div><b>Kane · patrie · serments</b><div class="meta">Kane n’est pas une simple arme : c’est une ancre. Les cartes, l’ocarina et les noms conservés ici servent autant le roleplay que les décisions de Kentaro.</div></div>
   <img src="${asset('03_Kane_katana')}" alt="" aria-hidden="true">
 </article>`;
 social.insertBefore(hero,social.firstChild);
}

const contextMap=[
 ['[data-panel="defense"] .card:nth-of-type(1)','06_Tombeau_de_Lazarus'],
 ['[data-panel="social"] .card:nth-of-type(1)','03_Kane_katana'],
 ['[data-panel="social"] .card:nth-of-type(2)','04_Anneau_de_stockage'],
 ['[data-panel="social"] .card:nth-of-type(3)','08_Vision_de_la_Pierre'],
 ['[data-panel="journal"] .card','09_Sceau_de_l_Eclipse']
];
contextMap.forEach(([sel,name])=>{const el=qs(sel);if(el){el.classList.add('context-panel');el.style.setProperty('--context-icon',`url('${asset(name)}')`)}});

qsa('.tab').forEach(btn=>btn.addEventListener('click',()=>{
 const key=btn.dataset.tab;
 try{localStorage.setItem('kentaro-last-tab',key)}catch(e){}
 if(innerWidth<768)requestAnimationFrame(()=>qs('.tabs')?.scrollIntoView({block:'start',behavior:'smooth'}));
}));
try{
 const last=localStorage.getItem('kentaro-last-tab');
 if(last){const b=qs(`.tab[data-tab="${last}"]`);if(b)setTimeout(()=>b.click(),0)}
}catch(e){}

const seal=qs('#sealStatus');
function syncSeal(){if(!seal||!window.KentaroAPI)return;const s=window.KentaroAPI.state;seal.classList.remove('seal-partial','seal-ready','seal-marked');if(s.sealTarget)seal.classList.add('seal-marked');else if(s.solHit&&s.selHit)seal.classList.add('seal-ready');else if(s.solHit||s.selHit)seal.classList.add('seal-partial')}
if(seal){new MutationObserver(syncSeal).observe(seal,{childList:true,characterData:true,subtree:true});syncSeal()}

})();
