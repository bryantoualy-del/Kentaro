from pathlib import Path
p=Path('index.html')
text=p.read_text(encoding='utf-8')
anchor="#shroudToggle.on{border-color:#6f72c9;box-shadow:0 0 0 2px rgba(105,95,190,.16) inset,0 0 18px rgba(90,105,220,.26)}"
if anchor not in text: raise SystemExit('shroud halo anchor missing')
if 'shroud-on::before' not in text:
    css=anchor+"""
#app.shroud-on::before,#app.shroud-on::after{content:'';position:fixed;inset:0;pointer-events:none;z-index:4}
#app.shroud-on::before{background:radial-gradient(ellipse at 50% 115%,rgba(86,96,210,.18) 0 18%,rgba(95,55,155,.12) 32%,rgba(25,20,70,.05) 52%,transparent 74%),radial-gradient(circle at 12% 18%,rgba(120,95,215,.10) 0 10%,transparent 26%),radial-gradient(circle at 85% 22%,rgba(78,132,222,.10) 0 10%,transparent 25%),radial-gradient(circle at 10% 82%,rgba(100,80,200,.10) 0 12%,transparent 28%),radial-gradient(circle at 88% 78%,rgba(70,145,220,.10) 0 12%,transparent 28%),linear-gradient(180deg,rgba(28,24,74,.05),rgba(35,27,88,.03) 35%,rgba(14,14,40,.06));box-shadow:inset 0 0 90px rgba(92,88,188,.12),inset 0 0 180px rgba(26,20,64,.14);animation:shroudDriftA 8s ease-in-out infinite alternate}
#app.shroud-on::after{background:radial-gradient(ellipse at 30% 55%,rgba(138,110,235,.09) 0 16%,transparent 42%),radial-gradient(ellipse at 72% 48%,rgba(90,160,235,.08) 0 14%,transparent 38%),radial-gradient(ellipse at 50% 28%,rgba(120,110,215,.05) 0 14%,transparent 38%);mix-blend-mode:screen;animation:shroudDriftB 10s ease-in-out infinite}
@keyframes shroudDriftA{0%{opacity:.72;transform:translate3d(0,0,0) scale(1)}50%{opacity:.88;transform:translate3d(0,-4px,0) scale(1.01)}100%{opacity:.74;transform:translate3d(0,3px,0) scale(1.015)}}
@keyframes shroudDriftB{0%{opacity:.28;transform:translate3d(-1.2%,1%,0)}50%{opacity:.42;transform:translate3d(1.4%,-1.2%,0)}100%{opacity:.30;transform:translate3d(-0.8%,0.8%,0)}}
"""
    text=text.replace(anchor,css,1)
render_anchor="q('#shroudToggle').textContent='◐ Voile spirituel '+(S.shroud?'ON':'OFF');q('#shroudToggle').classList.toggle('on',S.shroud);"
if render_anchor not in text: raise SystemExit('render shroud anchor missing')
if "classList.toggle('shroud-on'" not in text:
    text=text.replace(render_anchor,render_anchor+"const app=q('#app');if(app)app.classList.toggle('shroud-on',!!S.shroud);",1)
p.write_text(text,encoding='utf-8')
print('persistent shroud FX patched')
