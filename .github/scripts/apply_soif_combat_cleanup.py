from pathlib import Path
p=Path('index.html')
s=p.read_text(encoding='utf-8')

bite='<article class="card"><div class="action-title">Soif ténébreuse</div><div class="meta">Morsure sur cible neutralisée ou empoignée • 1 perforant + 4 nécrotiques si alimentation • 4 PV temp • 1/repos court ou long.</div><button id="bite">Mordre / se nourrir</button></article>'
if bite not in s: raise SystemExit('bite defense card missing')
s=s.replace(bite,'',1)

eld='      <article class="card"><div class="action-title">🔴 Décharge occulte</div><div class="meta">Attaque à distance • +8 toucher • 2 rayons au niveau 10 • 1d10+4 force par rayon grâce à Décharge déchirante • contre la cible maudite : +4 dégâts par rayon et critique sur 19–20.</div><button id="eldritch">Lancer 2 rayons</button></article>'
bite_combat='      <article class="card"><div class="action-title">🩸 Soif ténébreuse</div><div class="meta">Morsure sur cible neutralisée ou empoignée • 1 perforant + 4 nécrotiques si alimentation • 4 PV temp • 1/repos court ou long.</div><button id="bite">Mordre / se nourrir</button></article>'
if eld not in s: raise SystemExit('eldritch anchor missing')
s=s.replace(eld,eld+'\n'+bite_combat,1)

esprit='<article class="card"><div class="action-title">Esprit occulte</div><div class="meta">Avantage aux JS de Constitution pour maintenir la concentration. Utilise le test automatique ci-dessous.</div><div class="row"><input id="concDamageDef" class="compact-input" style="max-width:130px" type="number" min="0" placeholder="Dégâts reçus"><button id="concSave">Tester concentration</button></div></article>'
if esprit not in s: raise SystemExit('esprit card missing')
s=s.replace(esprit,'',1)

old='  <div class="meta">Traitement automatique : PV temporaires → PV • Armure d’Agathys si l’attaque est au corps-à-corps • test de concentration si nécessaire.</div>'
new='  <div class="meta">Traitement automatique : PV temporaires → PV • Armure d’Agathys si CàC • test de concentration si nécessaire avec <b>avantage d’Esprit occulte</b> pris en compte automatiquement.</div>'
if old not in s: raise SystemExit('damage meta missing')
s=s.replace(old,new,1)

s=s.replace("q('#concSave').onclick=()=>concentrationSave(Number(q('#concDamageDef').value)||0);\n",'',1)

p.write_text(s,encoding='utf-8')
print('patched')
