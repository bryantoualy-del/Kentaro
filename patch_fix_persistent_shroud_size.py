from pathlib import Path
p=Path('index.html')
text=p.read_text(encoding='utf-8')
old="#app.shroud-on::before,#app.shroud-on::after{content:'';position:fixed;inset:0;pointer-events:none;border-radius:inherit;z-index:4}"
new="#app.shroud-on::before,#app.shroud-on::after{content:'';position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;border-radius:0;z-index:4}"
if old not in text:
    raise SystemExit('persistent shroud selector not found')
text=text.replace(old,new,1)
p.write_text(text,encoding='utf-8')
print('patched persistent shroud size')
