from pathlib import Path
p=Path('index.html')
text=p.read_text(encoding='utf-8')

def require_replace(old,new,label):
    global text
    if old not in text:
        raise SystemExit(f'ANCHOR_MISSING:{label}')
    text=text.replace(old,new,1)

# 1) Keep Agathys melee checkbox concise.
require_replace(
    '<label class="damage-check"><input id="incomingMelee" type="checkbox"> Attaque au CàC</label>',
    '<label class="damage-check"><input id="incomingMelee" type="checkbox"> CàC</label>',
    'agathys_melee_label'
)
text=text.replace('coche « Attaque au CàC »','coche « CàC »')

# 2) Remove Hex Armor card from Defense entirely.
start=text.find('<article class="card" id="hexArmorCard">')
if start < 0:
    raise SystemExit('ANCHOR_MISSING:hexArmorCard')
end=text.find('</article>',start)
if end < 0:
    raise SystemExit('ANCHOR_MISSING:hexArmorCard_end')
text=text[:start]+text[end+10:]

# 3) Remove Hex Armor JS handler; damage processing starts directly at applyDamage.
start=text.find("q('#hexArmor').onclick=()=>{")
if start < 0:
    raise SystemExit('ANCHOR_MISSING:hexArmor_handler')
end=text.find("q('#applyDamage').onclick=",start)
if end < 0:
    raise SystemExit('ANCHOR_MISSING:applyDamage_handler')
text=text[:start]+text[end:]

# 4) In Spells, keep concentration status and manual break only.
old='''<div class="conc-banner"><strong>◐ Concentration</strong> — <span id="concSpellView">Aucune</span>\n<div class="row"><input id="concDamage" class="compact-input" style="max-width:135px" type="number" min="0" placeholder="Dégâts reçus"><button id="autoConcSave" class="btn-violet">Tester concentration</button><button id="dropConc">Rompre</button></div>\n<div id="concInfo" class="meta">DD = max(10, moitié des dégâts) • Esprit occulte : avantage au JS CON (+3).</div></div>'''
new='''<div class="conc-banner"><strong>◐ Concentration</strong> — <span id="concSpellView">Aucune</span>\n<div class="row"><button id="dropConc">Rompre la concentration</button></div>\n<div id="concInfo" class="meta">Le test est géré automatiquement dans Défense quand Kentaro reçoit des dégâts • Esprit occulte : avantage au JS CON (+3).</div></div>'''
require_replace(old,new,'spells_concentration_banner')

# 5) Remove obsolete manual test handler.
require_replace("q('#autoConcSave').onclick=()=>concentrationSave(Number(q('#concDamage').value)||0);\n",'', 'autoConcSave_handler')

p.write_text(text,encoding='utf-8')
print('PATCH_OK')
