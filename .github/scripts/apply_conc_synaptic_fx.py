from pathlib import Path
p=Path('index.html')
s=p.read_text(encoding='utf-8')

def repl(old,new,label):
    global s
    if old not in s:
        raise SystemExit(f'anchor missing: {label}')
    s=s.replace(old,new,1)

# Turn bar: add concentration indicator and 4th economy column.
repl('.turn-economy{display:grid;grid-template-columns:auto repeat(3,1fr) auto;','.turn-economy{display:grid;grid-template-columns:auto repeat(4,1fr) auto;','turn css')
repl('  <div id="ecoReaction" class="eco free"><b>↯ Réaction</b>Disponible</div>\n  <button id="newTurn" class="turn-next">↻ Nouveau tour</button>', '  <div id="ecoReaction" class="eco free"><b>↯ Réaction</b>Disponible</div>\n  <div id="ecoConc" class="eco free"><b>◐ Concentration</b>Aucune</div>\n  <button id="newTurn" class="turn-next">↻ Nouveau tour</button>', 'turn conc html')

# Remove concentration + spell-slot cards from Spells.
conc='''<div class="conc-banner"><strong>◐ Concentration</strong> — <span id="concSpellView">Aucune</span>\n<div class="row"><button id="dropConc">Rompre la concentration</button></div>\n<div id="concInfo" class="meta">Le test est géré automatiquement dans Défense quand Kentaro reçoit des dégâts • Esprit occulte : avantage au JS CON (+3).</div></div>\n'''
s=s.replace(conc,'',1)
slot='''<div class="card golden"><div class="action-title">Emplacements de pacte</div><div id="slots"></div><div class="meta">Occultiste niv. 10 : 2 emplacements de pacte. Le bouton d’un sort consomme 1 slot.</div></div>\n'''
s=s.replace(slot,'',1)
s=s.replace("q('#dropConc').onclick=()=>{if(!S.conc)return;push();const old=S.concSpell;S.conc=false;S.concSpell='';S.shroud=false;render();log(`◐ Concentration rompue : ${old}.`)};\n",'',1)
s=s.replace(" q('#concSpellView').textContent=S.conc?(S.concSpell||'Active'):'Aucune';\n",'',1)

# Synaptic card copy.
s=s.replace('<article class="card violet"><div class="action-title">Perturbations synaptiques</div><div class="meta">N5 • meilleur choix multi-cible dans ton arbre de décision.</div><button data-spell="Perturbations synaptiques">Lancer</button></article>', '<article class="card violet"><div class="action-title">Perturbations synaptiques</div><div class="meta">N5 • JS INT DD16 • 8d6 psychiques • moitié des dégâts en cas de réussite. Le compagnon demande le nombre de cibles et comptabilise les dégâts totaux du tour.</div><button data-spell="Perturbations synaptiques">Lancer + dégâts</button></article>',1)

# Economy render concentration.
repl(" const a=q('#ecoAction'),b=q('#ecoBonus'),r=q('#ecoReaction'),t=q('#turnEconomyView');if(!a)return;if(t)t.textContent=S.turn;const td=q('#turnDamageView');if(td)td.textContent=S.turnDamage||0;", " const a=q('#ecoAction'),b=q('#ecoBonus'),r=q('#ecoReaction'),c=q('#ecoConc'),t=q('#turnEconomyView');if(!a)return;if(t)t.textContent=S.turn;const td=q('#turnDamageView');if(td)td.textContent=S.turnDamage||0;", 'render econ vars')
repl(" a.className='eco '+(S.actionUsed?'used':'free');b.className='eco '+(S.bonusUsed?'used':'free');r.className='eco '+(S.reactionUsed?'used':'free');\n const attackBlocked=", " a.className='eco '+(S.actionUsed?'used':'free');b.className='eco '+(S.bonusUsed?'used':'free');r.className='eco '+(S.reactionUsed?'used':'free');\n if(c){c.innerHTML=`<b>◐ Concentration</b>${S.conc?(S.concSpell||'Active'):'Aucune'}`;c.className='eco '+(S.conc?'free':'used')}\n const attackBlocked=", 'render econ conc')

# Keep renderSlots safe if #slots is absent.
s=s.replace("function renderSlots(){const x=q('#slots');x.innerHTML='';", "function renderSlots(){const x=q('#slots');if(!x)return;x.innerHTML='';",1)

# Dedicated Synaptic Static casting flow.
anchor='function castSpellButton(b){\n'
if 'function castSynapticStatic(){' not in s:
    fn='''function castSynapticStatic(){\n if(S.slots<1)return log('❌ Aucun emplacement de pacte restant.');\n if(!useMainAction('Perturbations synaptiques','spell'))return render();\n const targetInput=prompt('Perturbations synaptiques — combien de cibles sont dans la zone ?','1');\n if(targetInput===null){S.actionUsed=false;S.actionKind='';S.actionLabel='';render();return}\n const targets=Math.max(1,parseInt(targetInput,10)||1);\n const successInput=prompt(`Sur ${targets} cible${targets>1?'s':''}, combien réussissent le JS INT DD16 ?\\n(Réussite = moitié des dégâts)`,'0');\n if(successInput===null){S.actionUsed=false;S.actionKind='';S.actionLabel='';render();return}\n const successes=Math.max(0,Math.min(targets,parseInt(successInput,10)||0));\n push();\n if(!useSlot())return render();\n const r=roll(8,6);\n const failed=targets-successes;\n const half=Math.floor(r.total/2);\n const total=r.total*failed+half*successes;\n addTurnDamage(total,`Perturbations synaptiques — ${targets} cible${targets>1?'s':''}`);\n render();\n fx('synaptic');\n log(`🧠 Perturbations synaptiques\nJet : ${r.total} psychiques (${r.dice.join('+')})\nCibles : ${targets}\nÉchec JS INT DD16 : ${failed} × ${r.total}\nRéussite : ${successes} × ${half}\n💥 Dégâts totaux comptabilisés : ${total}`);\n}\n'''
    repl(anchor,fn+anchor,'cast spell anchor')
repl("function castSpellButton(b){\n const name=b.dataset.spell,bonus=['Maléfice','Foulée brumeuse','Voile spirituel'].includes(name);", "function castSpellButton(b){\n const name=b.dataset.spell;\n if(name==='Perturbations synaptiques')return castSynapticStatic();\n const bonus=['Maléfice','Foulée brumeuse','Voile spirituel'].includes(name);", 'cast routing')

# Synaptic FX CSS.
if '#fxOverlay.fx-synaptic' not in s:
    k='@keyframes fxEclipse{0%{opacity:0}18%{opacity:1}55%{opacity:.75}100%{opacity:0}}'
    fxcss=k+'''\n#fxOverlay.fx-synaptic{background:radial-gradient(circle at center,rgba(227,119,255,.34) 0,rgba(184,82,255,.28) 12%,rgba(103,43,176,.18) 28%,transparent 56%),repeating-radial-gradient(circle at center,rgba(212,144,255,.26) 0 6px,rgba(0,0,0,0) 6px 20px),linear-gradient(135deg,rgba(162,56,255,.16),rgba(48,12,90,.08) 45%,rgba(255,94,203,.14));animation:fxSynaptic .72s ease-out}\n.shell.synaptic-hit{animation:shellSynaptic .42s linear}\n@keyframes fxSynaptic{0%{opacity:0;filter:blur(0)}12%{opacity:1;filter:blur(1px)}32%{opacity:.95;filter:blur(.4px)}52%{opacity:.78;filter:hue-rotate(14deg)}100%{opacity:0;filter:blur(0)}}\n@keyframes shellSynaptic{0%{transform:translateX(0)}15%{transform:translateX(-2px)}30%{transform:translateX(2px)}45%{transform:translateX(-1px)}60%{transform:translateX(1px)}75%{transform:translateX(-1px)}100%{transform:translateX(0)}}'''
    repl(k,fxcss,'fx css')

# Synaptic shell shake.
repl("function fx(type){\n const o=q('#fxOverlay'); if(!o)return;\n o.className=''; void o.offsetWidth; o.className='fx-'+type;\n clearTimeout(fxTimer);fxTimer=setTimeout(()=>o.className='',850);\n}", "function fx(type){\n const o=q('#fxOverlay'); if(!o)return;\n o.className=''; void o.offsetWidth; o.className='fx-'+type;\n if(type==='synaptic'){root.classList.remove('synaptic-hit');void root.offsetWidth;root.classList.add('synaptic-hit');clearTimeout(root._synTimer);root._synTimer=setTimeout(()=>root.classList.remove('synaptic-hit'),460)}\n clearTimeout(fxTimer);fxTimer=setTimeout(()=>o.className='',850);\n}", 'fx function')

p.write_text(s,encoding='utf-8')
