from pathlib import Path
p=Path('index.html')
text=p.read_text(encoding='utf-8')

def rep(old,new,label):
    global text
    if old not in text: raise SystemExit('ANCHOR_MISSING:'+label)
    text=text.replace(old,new,1)

rep("if(hit){const r=roll(crit?2:1,10,4+(run.cursed?4:0));run.total+=r.total;run.lines.push(`Rayon ${i} : Attaque ${attack} → TOUCHÉ${crit?' CRITIQUE':''} • Dégâts ${r.total}${run.cursed?' (Malédiction +4)':''}`)}", "if(hit){const r=roll(crit?2:1,10,4+(run.cursed?4:0));run.total+=r.total;addTurnDamage(r.total,`Décharge occulte — rayon ${i}`);run.lines.push(`Rayon ${i} : Attaque ${attack} → TOUCHÉ${crit?' CRITIQUE':''} • Dégâts ${r.total}${run.cursed?' (Malédiction +4)':''}`)}", 'eb_auto')
rep("if(hit){const r=roll(1,10,4+(run.cursed?4:0));run.total+=r.total;run.lines.push(`Rayon ${p.ray} : Attaque ${p.total} → TOUCHÉ • Dégâts ${r.total}${run.cursed?' (Malédiction +4)':''}`);log(`🔴 Décharge occulte — Rayon ${p.ray}", "if(hit){const r=roll(1,10,4+(run.cursed?4:0));run.total+=r.total;addTurnDamage(r.total,`Décharge occulte — rayon ${p.ray}`);run.lines.push(`Rayon ${p.ray} : Attaque ${p.total} → TOUCHÉ • Dégâts ${r.total}${run.cursed?' (Malédiction +4)':''}`);log(`🔴 Décharge occulte — Rayon ${p.ray}", 'eb_confirm')
rep("q('#smite').onclick=()=>{if(!useSlot())return;const r=roll(6,8);S.lastCrit=false;render();log(`☠ Châtiment occulte : ${r.total} dégâts (${r.dice.join('+')}) • cible à terre selon l’effet.`)};", "q('#smite').onclick=()=>{if(!useSlot())return;const r=roll(6,8);addTurnDamage(r.total,'Châtiment occulte');S.lastCrit=false;render();log(`☠ Châtiment occulte : ${r.total} dégâts (${r.dice.join('+')}) • cible à terre selon l’effet.`)};", 'smite')
rep("q('#smiteCrit').onclick=()=>{if(!useSlot())return;const r=roll(12,8);S.lastCrit=false;render();log(`☠ Châtiment occulte CRITIQUE : ${r.total} dégâts (${r.dice.join('+')}).`)};", "q('#smiteCrit').onclick=()=>{if(!useSlot())return;const r=roll(12,8);addTurnDamage(r.total,'Châtiment occulte critique');S.lastCrit=false;render();log(`☠ Châtiment occulte CRITIQUE : ${r.total} dégâts (${r.dice.join('+')}).`)};", 'smite_crit')
rep("reactionUsed:false,reactionLabel:''});render();log('🌙 Repos long", "reactionUsed:false,reactionLabel:'',turnDamage:0,turnEvents:[]});render();log('🌙 Repos long", 'long_rest_reset')
rep("S.lastCrit=false;S.turn=1;resetEconomy();render();log('⚔ Nouveau combat", "S.lastCrit=false;S.turn=1;resetEconomy();resetTurnSummary();render();log('⚔ Nouveau combat", 'new_combat_reset')

p.write_text(text,encoding='utf-8')
print('PATCH_OK')
