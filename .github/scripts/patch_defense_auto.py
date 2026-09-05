from pathlib import Path

p=Path('index.html')
text=p.read_text(encoding='utf-8')


def rep(old,new,label):
    global text
    if old not in text:
        raise SystemExit(f'ANCHOR_MISSING:{label}')
    text=text.replace(old,new,1)

# CSS
rep('.label-mini{display:block;font-size:11px;color:var(--muted);margin-bottom:3px}',
    '.label-mini{display:block;font-size:11px;color:var(--muted);margin-bottom:3px}.damage-check{display:flex;align-items:center;gap:7px;min-height:44px;padding:8px 10px;border:1px solid #444b5e;border-radius:8px;background:#0b0d12;color:var(--ivory);font-size:13px}.damage-check input{width:18px;height:18px}',
    'css')

# Defense cards
old='''<section class="panel" data-panel="defense"><div class="grid two">\n<article class="card" id="hexArmorCard"><div class="action-title">Armure des maléfices</div><div class="meta">Uniquement contre la <b>cible maudite</b> : sur 4–6 au d6, l’attaque qui t’a touché est annulée.</div><div class="row"><input id="incomingDamage" class="compact-input" style="max-width:120px" type="number" min="0" placeholder="Dégâts"><button id="hexArmor">Touché par la cible maudite</button><button id="applyDamage">Appliquer dégâts</button></div></article>\n<article class="card"><div class="action-title">Tombeau de Lazarus</div>'''
new='''<section class="panel" data-panel="defense"><div class="grid two">\n<article class="card golden" id="incomingDamageCard">\n  <div class="action-title">🛡 Dégâts reçus</div>\n  <div class="meta">Traitement automatique : PV temporaires → PV • Armure d’Agathys si l’attaque est au corps-à-corps • test de concentration si nécessaire.</div>\n  <div class="row">\n    <input id="incomingDamage" class="compact-input" style="max-width:130px" type="number" min="0" placeholder="Dégâts reçus">\n    <label class="damage-check"><input id="incomingMelee" type="checkbox"> Attaque au CàC</label>\n    <button id="applyDamage" class="btn-gold">Appliquer</button>\n  </div>\n  <div class="meta">Le DD de concentration est calculé automatiquement : max(10, moitié des dégâts).</div>\n</article>\n<article class="card" id="hexArmorCard">\n  <div class="action-title">Armure des maléfices</div>\n  <div class="meta">Uniquement contre la <b>cible maudite</b> : sur 4–6 au d6, l’attaque est annulée. Sinon, les dégâts sont traités automatiquement avec le même système.</div>\n  <div class="row">\n    <input id="hexIncomingDamage" class="compact-input" style="max-width:120px" type="number" min="0" placeholder="Dégâts">\n    <label class="damage-check"><input id="hexIncomingMelee" type="checkbox"> CàC</label>\n    <button id="hexArmor">Tester</button>\n  </div>\n</article>\n<article class="card"><div class="action-title">Tombeau de Lazarus</div>'''
rep(old,new,'defense_html')

start=text.find("function applyIncomingDamage(amount,source='dégâts'){")
end=text.find('function concentrationSave(dmg){', start)
if start<0 or end<0:
    raise SystemExit('ANCHOR_MISSING:damage_functions')
text=text[:start]+r'''function rollConcentrationCheck(dmg){
 dmg=Math.max(0,Number(dmg)||0);
 if(!S.conc)return null;
 const dc=Math.max(10,Math.floor(dmg/2));
 const a=d(20)+3,b=d(20)+3,best=Math.max(a,b),ok=best>=dc;
 const spell=S.concSpell||'Concentration';
 if(!ok){S.conc=false;S.concSpell='';S.shroud=false}
 return {dc,a,b,best,ok,spell};
}
function processIncomingDamage(amount,{source='dégâts reçus',melee=false}={}){
 amount=Math.max(0,Number(amount)||0);
 if(!amount)return log('ℹ️ Aucun dégât à appliquer.');
 push();
 const agathysTriggers=!!(melee && S.agathys && S.tempHp>0 && S.tempSource==="Armure d’Agathys");
 const agathysDamage=agathysTriggers?(S.agathysDamage||25):0;
 let left=amount,absorbed=0;
 const tempBefore=S.tempHp||0;
 const tempSourceBefore=S.tempSource||'';
 if(S.tempHp>0){
   absorbed=Math.min(S.tempHp,left);
   S.tempHp-=absorbed;
   left-=absorbed;
   if(S.tempHp===0){if(S.tempSource==="Armure d’Agathys")S.agathys=false;S.tempSource=''}
 }
 const hpLoss=Math.min(S.hp,left);
 if(left>0)S.hp=Math.max(0,S.hp-left);
 const conc=rollConcentrationCheck(amount);
 render();
 let lines=[
   `🛡 ${source} : ${amount}`,
   `PV temp : ${absorbed?`-${absorbed}${tempSourceBefore?` (${tempSourceBefore})`:''}`:'0'}${tempBefore?` • reste ${S.tempHp}`:''}`,
   `PV perdus : ${hpLoss}`,
   `PV restants : ${S.hp}/${S.maxHp}`
 ];
 if(agathysTriggers)lines.push(`❄ Armure d’Agathys : ${agathysDamage} dégâts de froid à l’attaquant`);
 if(conc){
   lines.push(`◐ Concentration DD ${conc.dc} : ${conc.a} / ${conc.b} → ${conc.best} ${conc.ok?'✅ MAINTENUE':'❌ PERDUE'}`);
   if(!conc.ok)lines.push(`${conc.spell} prend fin.`);
 }
 log(lines.join('\n'));
}
function applyIncomingDamage(amount,source='dégâts reçus'){
 processIncomingDamage(amount,{source,melee:false});
}
''' + text[end:]

old_handlers='''q('#agathysHit').onclick=()=>{if(S.agathys&&S.tempHp>0&&S.tempSource==="Armure d’Agathys")log(`❄ Armure d’Agathys : la créature qui vient de toucher Kentaro au corps-à-corps subit ${S.agathysDamage} dégâts de froid.`);else log('ℹ️ Armure d’Agathys n’est pas active avec ses PV temporaires.')};\nq('#hexArmor').onclick=()=>{if(!S.curse||!cleanName(S.curseTarget))return log('❌ Aucune cible maudite active.');if(!useReaction('Armure des maléfices'))return render();render();const x=d(6),amt=Number(q('#incomingDamage').value)||0;if(x>=4)log(`🛡 Armure des maléfices contre ${S.curseTarget} : d6=${x} → ATTAQUE ANNULÉE. Aucun dégât appliqué.`);else{log(`🛡 Armure des maléfices : d6=${x} → attaque non annulée.`);if(amt>0)applyIncomingDamage(amt,'attaque de la cible maudite')}};\nq('#applyDamage').onclick=()=>applyIncomingDamage(Number(q('#incomingDamage').value)||0,'dégâts reçus');'''
new_handlers='''q('#agathysHit').onclick=()=>{if(S.agathys&&S.tempHp>0&&S.tempSource==="Armure d’Agathys")log(`❄ Armure d’Agathys est active : utilise le bloc « Dégâts reçus » de Défense et coche « Attaque au CàC » pour appliquer automatiquement son retour de ${S.agathysDamage} froid.`);else log('ℹ️ Armure d’Agathys n’est pas active avec ses PV temporaires.')};\nq('#hexArmor').onclick=()=>{\n if(!S.curse||!cleanName(S.curseTarget))return log('❌ Aucune cible maudite active.');\n if(!useReaction('Armure des maléfices'))return render();\n render();\n const x=d(6),amt=Number(q('#hexIncomingDamage').value)||0,melee=!!q('#hexIncomingMelee').checked;\n if(x>=4)log(`🛡 Armure des maléfices contre ${S.curseTarget} : d6=${x} → ATTAQUE ANNULÉE. Aucun dégât appliqué.`);\n else{log(`🛡 Armure des maléfices : d6=${x} → attaque non annulée.`);if(amt>0)processIncomingDamage(amt,{source:'attaque de la cible maudite',melee});}\n};\nq('#applyDamage').onclick=()=>processIncomingDamage(Number(q('#incomingDamage').value)||0,{source:'dégâts reçus',melee:!!q('#incomingMelee').checked});'''
rep(old_handlers,new_handlers,'handlers')

p.write_text(text,encoding='utf-8')
print('PATCH_OK')
