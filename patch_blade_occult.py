from pathlib import Path
p=Path('index.html')
s=p.read_text(encoding='utf-8')
old="sealDamage=se.total+me.total;fx('eclipse');\n }\n const damage=w.total+elem.total+extra;"
new="sealDamage=se.total+me.total;fx('eclipse');\n } else {\n   fx(sun?'sun':'moon');\n }\n const damage=w.total+elem.total+extra;"
if old not in s: raise SystemExit('blade fx anchor missing')
s=s.replace(old,new,1)
if '#fxOverlay.fx-occult' not in s:
    a='@keyframes fxEclipse{0%{opacity:0}18%{opacity:1}55%{opacity:.75}100%{opacity:0}}'
    b=a+"\n#fxOverlay.fx-occult{background:radial-gradient(circle at 50% 85%,rgba(255,110,72,.42),rgba(186,26,26,.34) 16%,rgba(84,8,16,.28) 34%,transparent 62%),linear-gradient(0deg,rgba(255,80,45,.28),rgba(18,3,6,.18) 48%,transparent 82%);animation:fxOccult .72s ease-out}\n@keyframes fxOccult{0%{opacity:0}12%{opacity:1}38%{opacity:.95}100%{opacity:0}}"
    if a not in s: raise SystemExit('occult css anchor missing')
    s=s.replace(a,b,1)
s=s.replace("render();log(`☠ Châtiment occulte :", "render();fx('occult');log(`☠ Châtiment occulte :",1)
s=s.replace("render();log(`☠ Châtiment occulte CRITIQUE :", "render();fx('occult');log(`☠ Châtiment occulte CRITIQUE :",1)
p.write_text(s,encoding='utf-8')