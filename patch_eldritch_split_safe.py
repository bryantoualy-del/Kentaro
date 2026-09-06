from pathlib import Path
import re

p=Path('index.html')
text=p.read_text(encoding='utf-8')

old_click="q('#eldritch').onclick=()=>{if(!useMainAction('Décharge occulte','cantrip'))return render();S.eldritchRun={ray:1,total:0,lines:[],cursed:curseApplies()};render();fx('eldritch');continueEldritchRun()};"
if old_click not in text: raise SystemExit('Unexpected Eldritch handler; aborting')
if 'Rayon 2 sur autre cible' in text or 'fx-eldritch-1' in text: raise SystemExit('Patch already present; aborting')

old_card='<article class="card"><div class="action-title">🔴 Décharge occulte</div><div class="meta">Attaque à distance • +8 toucher • 2 rayons au niveau 10 • 1d10+4 force par rayon grâce à Décharge déchirante • contre la cible maudite : +4 dégâts par rayon et critique sur 19–20.</div><button id="eldritch">Lancer 2 rayons</button></article>'
new_card='<article class="card"><div class="action-title">🔴 Décharge occulte</div><div class="meta">Attaque à distance • +8 toucher • 2 rayons au niveau 10 • 1d10+4 force par rayon grâce à Décharge déchirante • contre la cible maudite : +4 dégâts par rayon et critique sur 19–20.</div><label class="damage-check"><input id="eldritchSplit" type="checkbox"> Rayon 2 sur autre cible</label><div id="eldritchSplitFields" class="row" style="display:none"><input id="eldritchTarget2" class="compact-input" style="flex:1" placeholder="Cible rayon 2"><input id="eldritchAC2" class="compact-input" style="max-width:110px" type="number" min="1" max="40" placeholder="CA 2"></div><div class="meta">Si la case n’est pas cochée, les 2 rayons visent la cible principale.</div><button id="eldritch">Lancer 2 rayons</button></article>'
if old_card not in text: raise SystemExit('Eldritch card anchor missing')
text=text.replace(old_card,new_card,1)

new_css="""#fxOverlay.fx-eldritch-1{background:radial-gradient(circle at 50% 50%,rgba(255,130,130,.99) 0 3.1%,rgba(255,42,52,.88) 3.2% 7.1%,rgba(140,0,14,.34) 7.2% 12%,transparent 15%);animation:fxEldritch .66s ease-out}
#fxOverlay.fx-eldritch-2{background:radial-gradient(circle at 36% 34%,rgba(255,120,120,.98) 0 2.8%,rgba(255,40,52,.84) 2.9% 6.6%,rgba(140,0,14,.34) 6.7% 11%,transparent 14%),radial-gradient(circle at 64% 66%,rgba(255,120,120,.98) 0 2.8%,rgba(255,40,52,.84) 2.9% 6.6%,rgba(140,0,14,.34) 6.7% 11%,transparent 14%),linear-gradient(135deg,transparent 0 30%,rgba(255,24,40,.12) 36%,rgba(90,0,10,.18) 50%,rgba(255,24,40,.12) 64%,transparent 70%);animation:fxEldritch .66s ease-out}
.shell.eldritch-hit{animation:shellEldritch .34s linear}"""
text,n=re.subn(r"#fxOverlay\.fx-eldritch\{.*?\}\n\.shell\.eldritch-hit\{animation:shellEldritch \.34s linear\}",lambda m:new_css,text,count=1,flags=re.S)
if n!=1: raise SystemExit('Eldritch CSS replacement failed')

old_fx="if(type==='eldritch'){const shell=q('#app');if(shell){shell.classList.remove('eldritch-hit');void shell.offsetWidth;shell.classList.add('eldritch-hit');clearTimeout(shell._eldritchTimer);shell._eldritchTimer=setTimeout(()=>shell.classList.remove('eldritch-hit'),360)}}"
new_fx="if(type==='eldritch-1'||type==='eldritch-2'){const shell=q('#app');if(shell){shell.classList.remove('eldritch-hit');void shell.offsetWidth;shell.classList.add('eldritch-hit');clearTimeout(shell._eldritchTimer);shell._eldritchTimer=setTimeout(()=>shell.classList.remove('eldritch-hit'),360)}}"
if old_fx not in text: raise SystemExit('Eldritch FX branch missing')
text=text.replace(old_fx,new_fx,1)

render_tail='renderEconomy();renderSlots();renderRing()\n}'
if render_tail not in text: raise SystemExit('render tail missing')
text=text.replace(render_tail,'renderEconomy();renderSlots();renderRing();syncEldritchSplitUI()\n}',1)

helpers="""function syncEldritchSplitUI(){
 const box=q('#eldritchSplit'),fields=q('#eldritchSplitFields');if(!box||!fields)return;
 fields.style.display=box.checked?'flex':'none';
}
function eldritchRayContext(ray){
 const split=!!(ray===2 && q('#eldritchSplit') && q('#eldritchSplit').checked);
 if(split){
   const altTarget=((q('#eldritchTarget2')&&q('#eldritchTarget2').value)||'').trim();
   const altAC=Number((q('#eldritchAC2')&&q('#eldritchAC2').value)||0)||0;
   const label=altTarget||'Cible 2';
   return {target:altTarget,label,ac:altAC,cursed:curseAppliesTo(altTarget)};
 }
 const baseTarget=(S.currentTarget||'').trim();
 const baseAC=Number(S.targetAC)||0;
 const label=baseTarget||'Cible principale';
 return {target:baseTarget,label,ac:baseAC,cursed:curseAppliesTo(baseTarget)};
}
"""
text=text.replace('function finishEldritchRun(){',helpers+'function finishEldritchRun(){',1)

finish_new=r"""function finishEldritchRun(){
 const run=S.eldritchRun;if(!run)return;
 const lines=run.lines||[],total=run.total||0,hits=run.hits||0;
 S.eldritchRun=null;S.pendingHit=null;
 render();
 if(hits===1)fx('eldritch-1');
 else if(hits>=2)fx('eldritch-2');
 log(`🔴 Décharge occulte\n${lines.join('\n')}\nTOTAL : ${total} dégâts de force`);
}
"""
text,n=re.subn(r"function finishEldritchRun\(\)\{.*?\n\}",lambda m:finish_new,text,count=1,flags=re.S)
if n!=1: raise SystemExit('finish replacement failed')

continue_new=r"""function continueEldritchRun(){
 const run=S.eldritchRun;if(!run)return;
 if(run.ray>2)return finishEldritchRun();
 const i=run.ray,ctx=eldritchRayContext(i),rr=askNat(`Décharge occulte — rayon ${i}${ctx.label?` • ${ctx.label}`:''}`,false);
 if(!rr){run.lines.push(`Rayon ${i}${ctx.label?` • ${ctx.label}`:''} : jet annulé`);run.ray++;return continueEldritchRun()}
 const attack=rr.nat+8,crit=rr.nat===20||(ctx.cursed&&rr.nat===19);
 if(!ctx.ac&&!crit){
   S.pendingHit={kind:'eldritch',ray:i,total:attack,nat:rr.nat,detail:rr.detail,crit:false,target:ctx.target,label:ctx.label,cursed:ctx.cursed};
   render();
   return log(`🔴 Décharge occulte — Rayon ${i}${ctx.label?` • ${ctx.label}`:''}\nAttaque : ${rr.detail} +8 = ${attack}\nCA non renseignée : confirme TOUCHÉ ou RATÉ.`)
 }
 const hit=crit?true:(rr.nat===1?false:attack>=ctx.ac);
 if(hit){
   const r=roll(crit?2:1,10,4+(ctx.cursed?4:0));run.total+=r.total;run.hits=(run.hits||0)+1;
   addTurnDamage(r.total,`Décharge occulte — rayon ${i}${ctx.label?` (${ctx.label})`:''}`);
   run.lines.push(`Rayon ${i}${ctx.label?` • ${ctx.label}`:''} : Attaque ${attack} → TOUCHÉ${crit?' CRITIQUE':''} • Dégâts ${r.total}${ctx.cursed?' (Malédiction +4)':''}`)
 }else run.lines.push(`Rayon ${i}${ctx.label?` • ${ctx.label}`:''} : Attaque ${attack} → RATÉ`);
 run.ray++;continueEldritchRun()
}
"""
text,n=re.subn(r"function continueEldritchRun\(\)\{.*?\n\}",lambda m:continue_new,text,count=1,flags=re.S)
if n!=1: raise SystemExit('continue replacement failed')

confirm_new=r"""function confirmPendingEldritch(hit){
 const p=S.pendingHit,run=S.eldritchRun;if(!p||!run)return;S.pendingHit=null;
 if(hit){
   const r=roll(1,10,4+(p.cursed?4:0));run.total+=r.total;run.hits=(run.hits||0)+1;
   addTurnDamage(r.total,`Décharge occulte — rayon ${p.ray}${p.label?` (${p.label})`:''}`);
   run.lines.push(`Rayon ${p.ray}${p.label?` • ${p.label}`:''} : Attaque ${p.total} → TOUCHÉ • Dégâts ${r.total}${p.cursed?' (Malédiction +4)':''}`);
   log(`🔴 Décharge occulte — Rayon ${p.ray}${p.label?` • ${p.label}`:''}\nConfirmation : TOUCHÉ\nAttaque : ${p.total}\nDégâts : ${r.total}${p.cursed?' • Malédiction +4':''}`)
 }else{
   run.lines.push(`Rayon ${p.ray}${p.label?` • ${p.label}`:''} : Attaque ${p.total} → RATÉ`);
   log(`🔴 Décharge occulte — Rayon ${p.ray}${p.label?` • ${p.label}`:''}\nConfirmation : RATÉ\nAttaque : ${p.total}`)
 }
 run.ray++;render();setTimeout(()=>continueEldritchRun(),80)
}
"""
text,n=re.subn(r"function confirmPendingEldritch\(hit\)\{.*?\n\}",lambda m:confirm_new,text,count=1,flags=re.S)
if n!=1: raise SystemExit('confirm replacement failed')

old_inputs="q('#currentTarget').oninput=e=>{S.currentTarget=e.target.value;render()};q('#targetAC').oninput=e=>{S.targetAC=e.target.value;render()};q('#curseTarget').oninput=e=>{S.curseTarget=e.target.value;render()};"
if old_inputs not in text: raise SystemExit('input handlers missing')
text=text.replace(old_inputs,old_inputs+"q('#eldritchSplit').onchange=()=>syncEldritchSplitUI();",1)

new_click="q('#eldritch').onclick=()=>{if(!useMainAction('Décharge occulte','cantrip'))return render();S.eldritchRun={ray:1,total:0,lines:[],hits:0};render();continueEldritchRun()};"
text=text.replace(old_click,new_click,1)

for c in ['Rayon 2 sur autre cible','function eldritchRayContext(ray)',"fx('eldritch-1')","fx('eldritch-2')",'hits:0']:
    if c not in text: raise SystemExit('validation failed: '+c)
if "fx('eldritch');continueEldritchRun()" in text: raise SystemExit('old immediate FX still present')

p.write_text(text,encoding='utf-8')
print('Patched index.html safely')
