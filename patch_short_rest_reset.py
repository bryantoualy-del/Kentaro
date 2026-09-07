from pathlib import Path

p=Path('index.html')
text=p.read_text(encoding='utf-8')
old="q('#shortRest').onclick=()=>{push();S.slots=2;S.curseReady=true;S.curse=false;S.curseTarget='';S.biteReady=true;S.solHit=S.selHit=S.seal=false;S.solTarget=S.selTarget='';S.lastCrit=false;resetEconomy();render();log('☕ Repos court : slots restaurés, Malédiction et Soif ténébreuse prêtes. Concentration et PV temporaires ne sont pas effacés automatiquement.')};"
new="""q('#shortRest').onclick=()=>{push();S.slots=2;S.curseReady=true;S.curse=false;S.curseTarget='';S.biteReady=true;S.currentTarget='';S.targetAC='';S.solHit=S.selHit=S.seal=false;S.solTarget=S.selTarget='';S.sealTarget='';S.sealExpiresAfterTurn=0;S.pendingHit=null;S.eldritchRun=null;S.eldritchCount=0;S.lastCrit=false;S.lastCritBlade='';S.turn=1;resetEconomy();resetTurnSummary();render();log('☕ Repos court : ressources de repos court restaurées et données de combat remises à zéro. PV, PV temporaires, concentration et objets conservés.');};"""
if old not in text:
    raise SystemExit('shortRest handler not found')
text=text.replace(old,new,1)
p.write_text(text,encoding='utf-8')
print('patched')
