from pathlib import Path
p=Path('index.html')
s=p.read_text(encoding='utf-8')
old=" q('#concSpellView').textContent=S.conc?(S.concSpell||'Concentration active'):'Aucune';\n"
if old not in s:
    raise SystemExit('orphan concSpellView line not found')
s=s.replace(old,'',1)
p.write_text(s,encoding='utf-8')
