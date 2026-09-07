from pathlib import Path
p=Path('index.html')
text=p.read_text(encoding='utf-8')

# CSS FX inserted before synaptic FX block
anchor="#fxOverlay.fx-synaptic{"
if anchor not in text: raise SystemExit('synaptic anchor missing')
css="""#fxOverlay.fx-curse{background:radial-gradient(circle at center,rgba(25,0,35,.15) 0 13%,transparent 14%),conic-gradient(from 0deg at 50% 50%,transparent 0 7%,rgba(170,35,80,.72) 8% 10%,transparent 11% 23%,rgba(110,45,170,.72) 24% 26%,transparent 27% 39%,rgba(190,30,65,.78) 40% 42%,transparent 43% 55%,rgba(105,45,165,.70) 56% 58%,transparent 59% 71%,rgba(180,35,75,.76) 72% 74%,transparent 75% 87%,rgba(120,45,175,.72) 88% 90%,transparent 91% 100%),radial-gradient(circle at center,rgba(140,20,65,.42) 0 9%,rgba(75,25,105,.24) 10% 17%,transparent 26%);animation:fxCurse .58s ease-out}.shell.curse-hit{animation:shellCurse .34s ease-out}
#fxOverlay.fx-shroud{background:radial-gradient(ellipse at 50% 115%,rgba(70,90,190,.38) 0 18%,rgba(95,55,155,.28) 32%,rgba(25,20,70,.18) 52%,transparent 74%),radial-gradient(circle at 18% 88%,rgba(110,85,210,.24) 0 8%,transparent 30%),radial-gradient(circle at 82% 84%,rgba(70,145,220,.24) 0 8%,transparent 30%);box-shadow:inset 0 -24vh 90px rgba(95,70,180,.20),inset 0 0 80px rgba(30,50,120,.16);animation:fxShroud .82s ease-out}.shell.shroud-hit{animation:shellShroud .46s ease-out}
#curseToggle.on{border-color:#9e3d64;box-shadow:0 0 0 2px rgba(145,35,80,.15) inset,0 0 18px rgba(175,35,85,.28)}
#shroudToggle.on{border-color:#6f72c9;box-shadow:0 0 0 2px rgba(105,95,190,.16) inset,0 0 18px rgba(90,105,220,.26)}
@keyframes fxCurse{0%{opacity:0;transform:scale(.72) rotate(-14deg);filter:brightness(.8)}22%{opacity:1;transform:scale(1.03) rotate(3deg);filter:brightness(1.35)}55%{opacity:.95;transform:scale(.98) rotate(-2deg)}100%{opacity:0;transform:scale(1.12) rotate(0);filter:brightness(.9)}}
@keyframes shellCurse{0%{transform:scale(1)}35%{transform:scale(.995)}65%{transform:scale(1.004)}100%{transform:scale(1)}}
@keyframes fxShroud{0%{opacity:0;transform:translateY(10%) scale(.98);filter:blur(2px)}18%{opacity:1;transform:translateY(0) scale(1);filter:blur(.5px)}55%{opacity:.88;filter:blur(0)}100%{opacity:0;transform:translateY(-3%) scale(1.015);filter:blur(1px)}}
@keyframes shellShroud{0%{filter:brightness(1)}35%{filter:brightness(1.08)}70%{filter:brightness(.98)}100%{filter:brightness(1)}}
"""
text=text.replace(anchor,css+anchor,1)

# FX JS branches
anchor_js="if(type==='eldritch'){const shell=q('#app');if(shell){shell.classList.remove('eldritch-hit');void shell.offsetWidth;shell.classList.add('eldritch-hit');clearTimeout(shell._eldritchTimer);shell._eldritchTimer=setTimeout(()=>shell.classList.remove('eldritch-hit'),360)}}"
if anchor_js not in text: raise SystemExit('eldritch fx branch missing')
new_js=anchor_js+"\n if(type==='curse'){const shell=q('#app');if(shell){shell.classList.remove('curse-hit');void shell.offsetWidth;shell.classList.add('curse-hit');clearTimeout(shell._curseTimer);shell._curseTimer=setTimeout(()=>shell.classList.remove('curse-hit'),420)}}\n if(type==='shroud'){const shell=q('#app');if(shell){shell.classList.remove('shroud-hit');void shell.offsetWidth;shell.classList.add('shroud-hit');clearTimeout(shell._shroudTimer);shell._shroudTimer=setTimeout(()=>shell.classList.remove('shroud-hit'),520)}}"
text=text.replace(anchor_js,new_js,1)

# Curse activation: fire only when turning ON
old="if(S.curse){S.curseReady=false;log(`☠ Malédiction activée sur ${S.curseTarget} : action bonus consommée • +4 dégâts et critique 19–20 uniquement contre cette cible.`)}else log('☠ Malédiction désactivée.');render()"
new="if(S.curse){S.curseReady=false;fx('curse');log(`☠ Malédiction activée sur ${S.curseTarget} : action bonus consommée • +4 dégâts et critique 19–20 uniquement contre cette cible.`)}else log('☠ Malédiction désactivée.');render()"
if old not in text: raise SystemExit('curse activation missing')
text=text.replace(old,new,1)

# Shroud activation fx
old2="S.shroud=true;startConcentration('Voile spirituel');render();log('◐ Voile spirituel activé : action bonus consommée • 1 emplacement de pacte N5 dépensé • concentration • +2d8 par touche.');"
new2="S.shroud=true;startConcentration('Voile spirituel');render();fx('shroud');log('◐ Voile spirituel activé : action bonus consommée • 1 emplacement de pacte N5 dépensé • concentration • +2d8 par touche.');"
if old2 not in text: raise SystemExit('shroud activation missing')
text=text.replace(old2,new2,1)

p.write_text(text,encoding='utf-8')
print('patched')
