from pathlib import Path
p=Path('index.html')
text=p.read_text(encoding='utf-8')
old="S.lastCrit=false;S.lastCritBlade='';S.turn=1;resetEconomy();resetTurnSummary();render();log('☕ Repos court : ressources de repos court restaurées et données de combat remises à zéro. PV, PV temporaires, concentration et objets conservés.');"
new="S.lastCrit=false;S.lastCritBlade='';if(S.shroud){S.shroud=false;if(S.concSpell==='Voile spirituel'){S.conc=false;S.concSpell=''}}S.turn=1;resetEconomy();resetTurnSummary();render();log('☕ Repos court : ressources restaurées et données de combat remises à zéro. Voile spirituel prend fin. Les autres concentrations, PV, PV temporaires et objets sont conservés.');"
if old not in text: raise SystemExit('short rest anchor missing')
text=text.replace(old,new,1)
p.write_text(text,encoding='utf-8')
print('patched')
