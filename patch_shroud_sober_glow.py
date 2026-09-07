from pathlib import Path
import re
p=Path('index.html')
text=p.read_text(encoding='utf-8')
pat=r"#app\.shroud-on::before,#app\.shroud-on::after\{.*?@keyframes shroudDriftB\{.*?\}\}\n"
new="""#app.shroud-on{border-color:#6770c9;box-shadow:0 20px 60px rgba(0,0,0,.48),0 0 0 1px rgba(103,112,201,.28),0 0 18px rgba(102,112,205,.16),0 0 34px rgba(79,145,224,.12),inset 0 0 0 1px rgba(170,180,255,.08),inset 0 0 22px rgba(82,98,214,.10);animation:shroudEdgePulse 3.4s ease-in-out infinite}\n#app.shroud-on::before,#app.shroud-on::after{content:'';position:absolute;inset:0;pointer-events:none;border-radius:18px}\n#app.shroud-on::before{box-shadow:inset 0 0 0 1px rgba(118,128,240,.14),inset 0 0 18px rgba(88,98,214,.10);opacity:.92}\n#app.shroud-on::after{box-shadow:0 0 0 1px rgba(102,118,230,.10),0 0 22px rgba(102,112,212,.12),0 0 42px rgba(76,142,226,.10);opacity:.72}\n@keyframes shroudEdgePulse{0%{box-shadow:0 20px 60px rgba(0,0,0,.48),0 0 0 1px rgba(103,112,201,.24),0 0 14px rgba(102,112,205,.12),0 0 28px rgba(79,145,224,.09),inset 0 0 0 1px rgba(170,180,255,.07),inset 0 0 18px rgba(82,98,214,.08)}50%{box-shadow:0 20px 60px rgba(0,0,0,.48),0 0 0 1px rgba(116,124,220,.30),0 0 18px rgba(114,120,222,.16),0 0 38px rgba(85,150,232,.13),inset 0 0 0 1px rgba(176,186,255,.09),inset 0 0 24px rgba(90,106,220,.11)}100%{box-shadow:0 20px 60px rgba(0,0,0,.48),0 0 0 1px rgba(103,112,201,.24),0 0 14px rgba(102,112,205,.12),0 0 28px rgba(79,145,224,.09),inset 0 0 0 1px rgba(170,180,255,.07),inset 0 0 18px rgba(82,98,214,.08)}}\n"""
text2,n=re.subn(pat,new,text,flags=re.S)
if n!=1:
    raise SystemExit(f'expected 1 persistent shroud block, found {n}')
p.write_text(text2,encoding='utf-8')
print('patched sober shroud glow')
