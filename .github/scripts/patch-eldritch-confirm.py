from pathlib import Path
p=Path('index.html')
s=p.read_text(encoding='utf-8')

# State: add eldritch run if missing.
old="actionUsed:false,actionKind:'',actionLabel:'',attackCount:0,bonusUsed:false,bonusLabel:'',bonusSpell:false,reactionUsed:false,reactionLabel:''"
new="actionUsed:false,actionKind:'',actionLabel:'',attackCount:0,bonusUsed:false,bonusLabel:'',bonusSpell:false,reactionUsed:false,reactionLabel:'',eldritchRun:null"
if 'eldritchRun:null' not in s:
    if old not in s: raise SystemExit('state anchor missing')
    s=s.replace(old,new,1)

# Blade pending type discriminator.
old="S.pendingHit={which,name,total:hitRoll,nat,crit:false,detail,target:S.currentTarget};"
new="S.pendingHit={kind:'blade',which,name,total:hitRoll,nat,crit:false,detail,target:S.currentTarget};"
if old in s: s=s.replace(old,new,1)

# Dispatcher/functions before existing confirm handlers.
old="q('#confirmHit').onclick=(e)=>{e.stopPropagation();confirmPendingBlade(true)};\nq('#confirmMiss').onclick=(e)=>{e.stopPropagation();confirmPendingBlade(false)};"
new=r'''function finishEldritchRun(){
 const run=S.eldritchRun;if(!run)return;
 const cursed=run.cursed,lines=run.lines||[],total=run.total||0;
 S.eldritchRun=null;S.pendingHit=null;render();fx('red');
 log(`🔴 Décharge occulte${cursed?' • cible maudite':''}\n${lines.join('\n')}\nTOTAL : ${total} dégâts de force`);
}
function continueEldritchRun(){
 const run=S.eldritchRun;if(!run)return;
 if(run.ray>2)return finishEldritchRun();
 const i=run.ray,rr=askNat(`Décharge occulte — rayon ${i}`,false);
 if(!rr){run.lines.push(`Rayon ${i} : jet annulé`);run.ray++;return continueEldritchRun()}
 const attack=rr.nat+8,crit=rr.nat===20||(run.cursed&&rr.nat===19);
 if(!S.targetAC&&!crit){
   S.pendingHit={kind:'eldritch',ray:i,total:attack,nat:rr.nat,detail:rr.detail,crit:false};render();
   return log(`🔴 Décharge occulte — Rayon ${i}\nAttaque : ${rr.detail} +8 = ${attack}\nCA non renseignée : confirme TOUCHÉ ou RATÉ.`)
 }
 const hit=resolveHit(rr.nat,attack,crit);
 if(hit){const r=roll(crit?2:1,10,4+(run.cursed?4:0));run.total+=r.total;run.lines.push(`Rayon ${i} : Attaque ${attack} → TOUCHÉ${crit?' CRITIQUE':''} • Dégâts ${r.total}${run.cursed?' (Malédiction +4)':''}`)}
 else run.lines.push(`Rayon ${i} : Attaque ${attack} → RATÉ`);
 run.ray++;continueEldritchRun();
}
function confirmPendingEldritch(hit){
 const p=S.pendingHit,run=S.eldritchRun;if(!p||!run)return;S.pendingHit=null;
 if(hit){const r=roll(1,10,4+(run.cursed?4:0));run.total+=r.total;run.lines.push(`Rayon ${p.ray} : Attaque ${p.total} → TOUCHÉ • Dégâts ${r.total}${run.cursed?' (Malédiction +4)':''}`);log(`🔴 Décharge occulte — Rayon ${p.ray}\nConfirmation : TOUCHÉ\nAttaque : ${p.total}\nDégâts : ${r.total}${run.cursed?' • Malédiction +4':''}`)}
 else{run.lines.push(`Rayon ${p.ray} : Attaque ${p.total} → RATÉ`);log(`🔴 Décharge occulte — Rayon ${p.ray}\nConfirmation : RATÉ\nAttaque : ${p.total}`)}
 run.ray++;render();setTimeout(()=>continueEldritchRun(),80);
}
function confirmPendingAttack(hit){if(!S.pendingHit)return;if(S.pendingHit.kind==='eldritch')return confirmPendingEldritch(hit);return confirmPendingBlade(hit)}
q('#confirmHit').onclick=(e)=>{e.stopPropagation();confirmPendingAttack(true)};
q('#confirmMiss').onclick=(e)=>{e.stopPropagation();confirmPendingAttack(false)};'''
if 'function confirmPendingEldritch' not in s:
    if old not in s: raise SystemExit('confirm handler anchor missing')
    s=s.replace(old,new,1)

# Replace EB launcher.
import re
pat=re.compile(r"q\('#eldritch'\)\.onclick=\(\)=>\{if\(!useMainAction\('Décharge occulte','cantrip'\)\)return render\(\);.*?\};",re.S)
replacement="q('#eldritch').onclick=()=>{if(!useMainAction('Décharge occulte','cantrip'))return render();S.eldritchRun={ray:1,total:0,lines:[],cursed:curseApplies()};render();fx('red');continueEldritchRun()};"
if 'S.eldritchRun={ray:1' not in s:
    s,n=pat.subn(replacement,s,count=1)
    if n!=1: raise SystemExit('eldritch launcher anchor missing')

# Clear pending EB on new turn/combat.
s=s.replace("S.pendingHit=null;S.lastCrit=false;","S.pendingHit=null;S.eldritchRun=null;S.lastCrit=false;",1)
s=s.replace("S.pendingHit=null;S.sealTarget='';","S.pendingHit=null;S.eldritchRun=null;S.sealTarget='';",1)

# Sanity assertions.
for token in ["kind:'eldritch'","function confirmPendingEldritch","S.eldritchRun={ray:1","TOTAL : ${total} dégâts de force"]:
    if token not in s: raise SystemExit('missing '+token)

p.write_text(s,encoding='utf-8')
