from pathlib import Path

p=Path('index.html')
text=p.read_text(encoding='utf-8')

def once(old,new,label):
    global text
    if old not in text:
        raise SystemExit(f'{label} missing')
    text=text.replace(old,new,1)

# Card
once('<article class="card"><div class="action-title">🔴 Décharge occulte</div><div class="meta">Attaque à distance • +8 toucher • 2 rayons au niveau 10 • 1d10+4 force par rayon grâce à Décharge déchirante • contre la cible maudite : +4 dégâts par rayon et critique sur 19–20.</div><button id="eldritch">Lancer 2 rayons</button></article>',
     '<article class="card"><div class="action-title">🔴 Décharge occulte</div><div class="meta">Attaque à distance • +8 toucher • 1d10+4 force • jusqu’à 2 rayons par tour • contre la cible maudite : +4 dégâts et critique sur 19–20.</div><button id="eldritch">Lancer rayon 1/2</button></article>',
     'eldritch card')

# FX: one luminous red point
once('#fxOverlay.fx-eldritch{background:radial-gradient(circle at 36% 34%,rgba(255,120,120,.98) 0 2.8%,rgba(255,40,52,.84) 2.9% 6.6%,rgba(140,0,14,.34) 6.7% 11%,transparent 14%),radial-gradient(circle at 64% 66%,rgba(255,120,120,.98) 0 2.8%,rgba(255,40,52,.84) 2.9% 6.6%,rgba(140,0,14,.34) 6.7% 11%,transparent 14%),linear-gradient(135deg,transparent 0 30%,rgba(255,24,40,.12) 36%,rgba(90,0,10,.18) 50%,rgba(255,24,40,.12) 64%,transparent 70%);animation:fxEldritch .66s ease-out}',
     '#fxOverlay.fx-eldritch{background:radial-gradient(circle at 50% 50%,rgba(255,225,225,1) 0 1.5%,rgba(255,95,105,.98) 1.6% 4.2%,rgba(255,28,45,.82) 4.3% 8%,rgba(120,0,14,.30) 8.1% 13%,transparent 16%);animation:fxEldritch .66s ease-out}',
     'eldritch fx')

# State
once('actionUsed:false,actionKind:\'\',actionLabel:\'\',attackCount:0,bonusUsed:false,bonusLabel:\'\',bonusSpell:false,reactionUsed:false,reactionLabel:\'\',turnDamage:0,turnEvents:[],eldritchRun:null',
     'actionUsed:false,actionKind:\'\',actionLabel:\'\',attackCount:0,bonusUsed:false,bonusLabel:\'\',bonusSpell:false,reactionUsed:false,reactionLabel:\'\',turnDamage:0,turnEvents:[],eldritchRun:null,eldritchCount:0',
     'eldritch state')

# Render economy: let EB fire twice if EB is the action used
once("const eb=q('#eldritch');if(eb)eb.disabled=!!S.actionUsed",
     "const eb=q('#eldritch');if(eb){const n=S.eldritchCount||0;const otherAction=S.actionUsed&&!(S.actionKind==='cantrip'&&S.actionLabel==='Décharge occulte');eb.disabled=otherAction||n>=2||!!S.pendingHit;eb.textContent=n===0?'Lancer rayon 1/2':(n===1?'Lancer rayon 2/2':'2/2 rayons lancés')}",
     'eldritch economy')

# Replace old two-ray engine by one ray per click
start=text.find('function finishEldritchRun(){')
end=text.find('function confirmPendingAttack(hit){')
if start<0 or end<0 or end<=start:
    raise SystemExit('eldritch engine block missing')
new_engine=r'''function eldritchRay(){
 if((S.eldritchCount||0)>=2)return log('❌ Décharge occulte : les 2 rayons du tour ont déjà été lancés.');
 if((S.eldritchCount||0)===0){
   if(!useMainAction('Décharge occulte','cantrip'))return render();
 }else if(!(S.actionKind==='cantrip'&&S.actionLabel==='Décharge occulte')){
   return log('❌ Décharge occulte n’est plus disponible ce tour.');
 }
 const ray=(S.eldritchCount||0)+1,cursed=curseApplies(),rr=askNat(`Décharge occulte — rayon ${ray}`,false);
 if(!rr)return log('ℹ️ Jet annulé.');
 const attack=rr.nat+8,crit=rr.nat===20||(cursed&&rr.nat===19);
 if(!S.targetAC&&!crit){
   S.pendingHit={kind:'eldritch',ray,total:attack,nat:rr.nat,detail:rr.detail,crit:false,cursed};
   render();
   return log(`🔴 Décharge occulte — Rayon ${ray}\nAttaque : ${rr.detail} +8 = ${attack}\nCA non renseignée : confirme TOUCHÉ ou RATÉ.`);
 }
 const hit=resolveHit(rr.nat,attack,crit);
 S.eldritchCount=ray;
 if(hit){
   const r=roll(crit?2:1,10,4+(cursed?4:0));
   addTurnDamage(r.total,`Décharge occulte — rayon ${ray}`);
   fx('eldritch');
   render();
   return log(`🔴 Décharge occulte — Rayon ${ray}\nAttaque ${attack} → TOUCHÉ${crit?' CRITIQUE':''}\nDégâts : ${r.total}${cursed?' • Malédiction +4':''}`);
 }
 render();
 log(`🔴 Décharge occulte — Rayon ${ray}\nAttaque ${attack} → RATÉ`);
}
function confirmPendingEldritch(hit){
 const p=S.pendingHit;if(!p)return;
 S.pendingHit=null;
 S.eldritchCount=Math.max(S.eldritchCount||0,p.ray||1);
 if(hit){
   const r=roll(1,10,4+(p.cursed?4:0));
   addTurnDamage(r.total,`Décharge occulte — rayon ${p.ray}`);
   fx('eldritch');
   render();
   return log(`🔴 Décharge occulte — Rayon ${p.ray}\nConfirmation : TOUCHÉ\nAttaque : ${p.total}\nDégâts : ${r.total}${p.cursed?' • Malédiction +4':''}`);
 }
 render();
 log(`🔴 Décharge occulte — Rayon ${p.ray}\nConfirmation : RATÉ\nAttaque : ${p.total}`);
}
'''
text=text[:start]+new_engine+text[end:]

# Click handler
once("q('#eldritch').onclick=()=>{if(!useMainAction('Décharge occulte','cantrip'))return render();S.eldritchRun={ray:1,total:0,lines:[],cursed:curseApplies()};render();fx('eldritch');continueEldritchRun()};",
     "q('#eldritch').onclick=()=>eldritchRay();",
     'eldritch click')

# Reset per-turn counter
once("S.pendingHit=null;S.eldritchRun=null;S.lastCrit=false", "S.pendingHit=null;S.eldritchRun=null;S.eldritchCount=0;S.lastCrit=false", 'new turn reset')
once("turnDamage:0,turnEvents:[]});render();log('🌙 Repos long", "turnDamage:0,turnEvents:[],eldritchCount:0});render();log('🌙 Repos long", 'long rest reset')
once("S.pendingHit=null;S.eldritchRun=null;S.sealTarget='';", "S.pendingHit=null;S.eldritchRun=null;S.eldritchCount=0;S.sealTarget='';", 'new combat reset')

# Guards
for needle in ['Lancer rayon 1/2','Lancer rayon 2/2','function eldritchRay()','eldritchCount:0']:
    if needle not in text: raise SystemExit(f'guard failed: {needle}')

p.write_text(text,encoding='utf-8')
print('patched')
