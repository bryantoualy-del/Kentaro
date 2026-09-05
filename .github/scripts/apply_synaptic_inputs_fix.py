from pathlib import Path
p=Path('index.html')
s=p.read_text(encoding='utf-8')

# Fix synaptic FX crash if still present.
s=s.replace("if(type==='synaptic'){root.classList.remove('synaptic-hit');void root.offsetWidth;root.classList.add('synaptic-hit');clearTimeout(root._synTimer);root._synTimer=setTimeout(()=>root.classList.remove('synaptic-hit'),460)}", "if(type==='synaptic'){const shell=q('#app');if(shell){shell.classList.remove('synaptic-hit');void shell.offsetWidth;shell.classList.add('synaptic-hit');clearTimeout(shell._synTimer);shell._synTimer=setTimeout(()=>shell.classList.remove('synaptic-hit'),460)}}", 1)

old_card='<article class="card violet"><div class="action-title">Perturbations synaptiques</div><div class="meta">N5 • JS INT DD16 • 8d6 psychiques • moitié des dégâts en cas de réussite. Le compagnon demande le nombre de cibles et comptabilise les dégâts totaux du tour.</div><button data-spell="Perturbations synaptiques">Lancer + dégâts</button></article>'
new_card='''<article class="card violet">\n  <div class="action-title">Perturbations synaptiques</div>\n  <div class="meta">N5 • JS INT DD16 • 8d6 psychiques • moitié des dégâts en cas de réussite.</div>\n  <div class="row">\n    <label class="label-mini" style="flex:1;min-width:130px">Cibles\n      <input id="synTargets" class="compact-input" type="number" min="1" value="1" inputmode="numeric">\n    </label>\n    <label class="label-mini" style="flex:1;min-width:150px">Ratent le JS\n      <input id="synFails" class="compact-input" type="number" min="0" value="1" inputmode="numeric">\n    </label>\n  </div>\n  <div class="meta">Les autres cibles sont comptées comme réussissant le JS et prennent la moitié des dégâts.</div>\n  <button data-spell="Perturbations synaptiques">Lancer + dégâts</button>\n</article>'''
if old_card not in s:
    raise SystemExit('synaptic card anchor not found')
s=s.replace(old_card,new_card,1)

start=s.find('function castSynapticStatic(){')
end=s.find('function castSpellButton(b){',start)
if start<0 or end<0:
    raise SystemExit('synaptic function anchor not found')
new_func='''function castSynapticStatic(){\n if(S.slots<1)return log('❌ Aucun emplacement de pacte restant.');\n if(!useMainAction('Perturbations synaptiques','spell'))return render();\n const targets=Math.max(1,parseInt(q('#synTargets').value,10)||1);\n const failed=Math.max(0,Math.min(targets,parseInt(q('#synFails').value,10)||0));\n const successes=targets-failed;\n push();\n if(!useSlot())return render();\n const r=roll(8,6);\n const half=Math.floor(r.total/2);\n const total=r.total*failed+half*successes;\n addTurnDamage(total,`Perturbations synaptiques — ${targets} cible${targets>1?'s':''}`);\n render();\n fx('synaptic');\n log(`🧠 Perturbations synaptiques\nJet : ${r.total} psychiques (${r.dice.join('+')})\nCibles : ${targets}\nÉchec JS INT DD16 : ${failed} × ${r.total}\nRéussite : ${successes} × ${half}\n💥 Dégâts totaux comptabilisés : ${total}`);\n}\n'''
s=s[:start]+new_func+s[end:]
p.write_text(s,encoding='utf-8')
