from pathlib import Path
import re
p=Path('index.html')
s=p.read_text(encoding='utf-8')

def must(old,new,label):
    global s
    if old not in s: raise SystemExit(f'anchor missing: {label}')
    s=s.replace(old,new,1)

# Turn bar + layout.
must('.turn-economy{display:grid;grid-template-columns:auto repeat(3,1fr) auto;','.turn-economy{display:grid;grid-template-columns:auto repeat(4,1fr) auto;','turn css')
must('  <div id="ecoReaction" class="eco free"><b>↯ Réaction</b>Disponible</div>\n  <button id="newTurn" class="turn-next">↻ Nouveau tour</button>', '  <div id="ecoReaction" class="eco free"><b>↯ Réaction</b>Disponible</div>\n  <div id="ecoConc" class="eco free"><b>◐ Concentration</b>Aucune</div>\n  <button id="newTurn" class="turn-next">↻ Nouveau tour</button>', 'turn conc html')

# Remove Concentration and spell-slot blocks from Spells.
s=re.sub(r'<div class="conc-banner"><strong>◐ Concentration</strong>.*?</div></div>\n','',s,count=1,flags=re.S)
s=re.sub(r'<div class="card golden"><div class="action-title">Emplacements de pacte</div><div id="slots"></div>.*?</div>\n','',s,count=1,flags=re.S)
s=s.replace("q('#dropConc').onclick=()=>{if(!S.conc)return;push();const old=S.concSpell;S.conc=false;S.concSpell='';S.shroud=false;render();log(`◐ Concentration rompue : ${old}.`)};",'')
s=s.replace("q('#concSpellView').textContent=S.conc?(S.concSpell||'Active'):'Aucune';",'')

# Synaptic Static card.
s=s.replace('<article class="card violet"><div class="action-title">Perturbations synaptiques</div><div class="meta">N5 • meilleur choix multi-cible dans ton arbre de décision.</div><button data-spell="Perturbations synaptiques">Lancer</button></article>', '<article class="card violet"><div class="action-title">Perturbations synaptiques</div><div class="meta">N5 • JS INT DD16 • 8d6 psychiques • moitié des dégâts en cas de réussite. Le compagnon demande le nombre de cibles et comptabilise les dégâts totaux du tour.</div><button data-spell="Perturbations synaptiques">Lancer + dégâts</button></article>',1)

# Economy rendering: current live is compact/minified.
old="function renderEconomy(){const td=q('#turnDamageView');if(td)td.textContent=S.turnDamage||0;const a=q('#ecoAction'),b=q('#ecoBonus'),r=q('#ecoReaction'),tv=q('#turnEconomyView');if(!a)return;if(tv)tv.textContent=S.turn;const actionTxt=S.actionUsed?(S.actionKind==='attack'?`${S.attackCount}/2 attaques`:(S.actionLabel||'Utilisée')):'Disponible';a.innerHTML=`<b>⚔ Action</b>${actionTxt}`;b.innerHTML=`<b>✦ Bonus</b>${S.bonusUsed?(S.bonusLabel||'Utilisée'):'Disponible'}`;r.innerHTML=`<b>↯ Réaction</b>${S.reactionUsed?(S.reactionLabel||'Utilisée'):'Disponible'}`;a.className='eco '+(S.actionUsed?'used':'free');b.className='eco '+(S.bonusUsed?'used':'free');r.className='eco '+(S.reactionUsed?'used':'free');const attackBlocked="
new="function renderEconomy(){const td=q('#turnDamageView');if(td)td.textContent=S.turnDamage||0;const a=q('#ecoAction'),b=q('#ecoBonus'),r=q('#ecoReaction'),c=q('#ecoConc'),tv=q('#turnEconomyView');if(!a)return;if(tv)tv.textContent=S.turn;const actionTxt=S.actionUsed?(S.actionKind==='attack'?`${S.attackCount}/2 attaques`:(S.actionLabel||'Utilisée')):'Disponible';a.innerHTML=`<b>⚔ Action</b>${actionTxt}`;b.innerHTML=`<b>✦ Bonus</b>${S.bonusUsed?(S.bonusLabel||'Utilisée'):'Disponible'}`;r.innerHTML=`<b>↯ Réaction</b>${S.reactionUsed?(S.reactionLabel||'Utilisée'):'Disponible'}`;a.className='eco '+(S.actionUsed?'used':'free');b.className='eco '+(S.bonusUsed?'used':'free');r.className='eco '+(S.reactionUsed?'used':'free');if(c){c.innerHTML=`<b>◐ Concentration</b>${S.conc?(S.concSpell||'Active'):'Aucune'}`;c.className='eco '+(S.conc?'free':'used')}const attackBlocked="
must(old,new,'render economy')
s=s.replace("function renderSlots(){const x=q('#slots');x.innerHTML='';","function renderSlots(){const x=q('#slots');if(!x)return;x.innerHTML='';",1)

# Dedicated Synaptic Static cast flow.
if 'function castSynapticStatic(){' not in s:
    fn="""function castSynapticStatic(){\n if(S.slots<1)return log('❌ Aucun emplacement de pacte restant.');\n if(!useMainAction('Perturbations synaptiques','spell'))return render();\n const targetInput=prompt('Perturbations synaptiques — combien de cibles sont dans la zone ?','1');\n if(targetInput===null){S.actionUsed=false;S.actionKind='';S.actionLabel='';render();return}\n const targets=Math.max(1,parseInt(targetInput,10)||1);\n const successInput=prompt(`Sur ${targets} cible${targets>1?'s':''}, combien réussissent le JS INT DD16 ?\\n(Réussite = moitié des dégâts)`,'0');\n if(successInput===null){S.actionUsed=false;S.actionKind='';S.actionLabel='';render();return}\n const successes=Math.max(0,Math.min(targets,parseInt(successInput,10)||0));\n push();if(!useSlot())return render();\n const r=roll(8,6),failed=targets-successes,half=Math.floor(r.total/2),total=r.total*failed+half*successes;\n addTurnDamage(total,`Perturbations synaptiques — ${targets} cible${targets>1?'s':''}`);\n render();fx('synaptic');\n log(`🧠 Perturbations synaptiques\\nJet : ${r.total} psychiques (${r.dice.join('+')})\\nCibles : ${targets}\\nÉchec JS INT DD16 : ${failed} × ${r.total}\\nRéussite : ${successes} × ${half}\\n💥 Dégâts totaux comptabilisés : ${total}`);\n}\n"""
    must('function castSpellButton(b){\n',fn+'function castSpellButton(b){\n','cast insert')
must("function castSpellButton(b){\n const name=b.dataset.spell,bonus=['Maléfice','Foulée brumeuse','Voile spirituel'].includes(name);", "function castSpellButton(b){\n const name=b.dataset.spell;\n if(name==='Perturbations synaptiques')return castSynapticStatic();\n const bonus=['Maléfice','Foulée brumeuse','Voile spirituel'].includes(name);", 'cast routing')

# Purple mental pulse + concentric waves + light glitch.
if '#fxOverlay.fx-synaptic' not in s:
    k='@keyframes fxEclipse{0%{opacity:0}18%{opacity:1}55%{opacity:.75}100%{opacity:0}}'
    css=k+'\n#fxOverlay.fx-synaptic{background:radial-gradient(circle at center,rgba(227,119,255,.34) 0,rgba(184,82,255,.28) 12%,rgba(103,43,176,.18) 28%,transparent 56%),repeating-radial-gradient(circle at center,rgba(212,144,255,.26) 0 6px,transparent 6px 20px),linear-gradient(135deg,rgba(162,56,255,.16),rgba(48,12,90,.08) 45%,rgba(255,94,203,.14));animation:fxSynaptic .72s ease-out}\n.shell.synaptic-hit{animation:shellSynaptic .42s linear}\n@keyframes fxSynaptic{0%{opacity:0;filter:blur(0)}12%{opacity:1;filter:blur(1px)}32%{opacity:.95;filter:blur(.4px)}52%{opacity:.78;filter:hue-rotate(14deg)}100%{opacity:0;filter:blur(0)}}\n@keyframes shellSynaptic{0%{transform:translateX(0)}15%{transform:translateX(-2px)}30%{transform:translateX(2px)}45%{transform:translateX(-1px)}60%{transform:translateX(1px)}75%{transform:translateX(-1px)}100%{transform:translateX(0)}}'
    must(k,css,'fx css')
must("function fx(type){\n const o=q('#fxOverlay'); if(!o)return;\n o.className=''; void o.offsetWidth; o.className='fx-'+type;\n clearTimeout(fxTimer);fxTimer=setTimeout(()=>o.className='',850);\n}", "function fx(type){\n const o=q('#fxOverlay'); if(!o)return;\n o.className=''; void o.offsetWidth; o.className='fx-'+type;\n if(type==='synaptic'){root.classList.remove('synaptic-hit');void root.offsetWidth;root.classList.add('synaptic-hit');clearTimeout(root._synTimer);root._synTimer=setTimeout(()=>root.classList.remove('synaptic-hit'),460)}\n clearTimeout(fxTimer);fxTimer=setTimeout(()=>o.className='',850);\n}", 'fx function')

p.write_text(s,encoding='utf-8')
