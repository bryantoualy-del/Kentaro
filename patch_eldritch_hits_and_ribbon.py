from pathlib import Path
import re
p=Path('index.html')
s=p.read_text(encoding='utf-8')

# 1) Refine ribbon behavior: already-disabled actions => no ribbon; hidden constraints => gray; true failures => red.
pat=re.compile(r"function getRibbonTone\(t\)\{.*?\n\}\nfunction log\(t\)\{.*?\n\}", re.S)
new="""function getRibbonTone(t){
 const x=(t||'').toLowerCase();
 const noRibbonKeys=[
   'action déjà utilisée',
   'action bonus déjà utilisée',
   'réaction déjà utilisée',
   'déjà effectué ses 2 attaques',
   'action d’attaque déjà complète'
 ];
 const warnKeys=[
   'renseigne d’abord',
   'aucune cible',
   'aucun dégât',
   'anneau plein',
   'anneau est déjà vide',
   'rien à annuler',
   'n’est pas actif',
   'ne maintient actuellement aucun sort'
 ];
 const errKeys=[
   '→ raté',
   'confirmation : raté',
   'concentration perdue',
   '❌ échec',
   ' prend fin.'
 ];
 if(noRibbonKeys.some(k=>x.includes(k)))return 'none';
 if(warnKeys.some(k=>x.includes(k)))return 'warn';
 if(errKeys.some(k=>x.includes(k)))return 'error';
 return 'success';
}
function log(t){
 const el=q('#log');el.textContent=(el.textContent==='Prêt. Que l’éclipse tombe.'?'':el.textContent+'\\n\\n')+t;el.scrollTop=el.scrollHeight;
 q('#lastResult').textContent=t;const r=q('#kentaro-ribbon');
 r.classList.remove('tone-warn','tone-error');
 const tone=getRibbonTone(t);
 clearTimeout(ribbonTimer);
 if(tone==='none'){
   r.classList.remove('show');
   save(true);
   return;
 }
 if(tone==='warn')r.classList.add('tone-warn');
 else if(tone==='error')r.classList.add('tone-error');
 r.classList.add('show');
 if(!S.pendingHit)ribbonTimer=setTimeout(()=>r.classList.remove('show'),7000);
 save(true)
}"""
if pat.search(s):
    s=pat.sub(new,s,count=1)

# 2) Eldritch CSS: one point for one hit, two diagonal points for two hits.
old_css=re.compile(r"#fxOverlay\.fx-eldritch\{.*?animation:fxEldritch \.66s ease-out;\n\}", re.S)
new_css="""#fxOverlay.fx-eldritch-1{
  background:
    radial-gradient(circle at 50% 50%, rgba(255,135,135,.99) 0 3%, rgba(255,40,52,.88) 3.1% 7%, rgba(140,0,14,.34) 7.1% 12%, transparent 15%);
  animation:fxEldritch .66s ease-out;
}
#fxOverlay.fx-eldritch-2{
  background:
    radial-gradient(circle at 36% 34%, rgba(255,120,120,.98) 0 2.8%, rgba(255,40,52,.84) 2.9% 6.6%, rgba(140,0,14,.34) 6.7% 11%, transparent 14%),
    radial-gradient(circle at 64% 66%, rgba(255,120,120,.98) 0 2.8%, rgba(255,40,52,.84) 2.9% 6.6%, rgba(140,0,14,.34) 6.7% 11%, transparent 14%),
    linear-gradient(135deg, transparent 0 30%, rgba(255,24,40,.12) 36%, rgba(90,0,10,.18) 50%, rgba(255,24,40,.12) 64%, transparent 70%);
  animation:fxEldritch .66s ease-out;
}"""
if old_css.search(s):
    s=old_css.sub(new_css,s,count=1)

# fx() branch accepts hit-count variants.
s=s.replace("if(type==='eldritch'){", "if(type==='eldritch-1'||type==='eldritch-2'){", 1)

# Start run: no FX at click, store hit counter.
s=s.replace("S.eldritchRun={ray:1,total:0,lines:[],cursed:curseApplies()};render();fx('eldritch');continueEldritchRun()", "S.eldritchRun={ray:1,total:0,lines:[],cursed:curseApplies(),hits:0};render();continueEldritchRun()")
s=s.replace("S.eldritchRun={ray:1,total:0,lines:[],cursed:curseApplies(),fxPlayed:false};render();continueEldritchRun()", "S.eldritchRun={ray:1,total:0,lines:[],cursed:curseApplies(),hits:0};render();continueEldritchRun()")

# Replace per-hit FX with hit counter, if present.
s=s.replace("if(!run.fxPlayed){fx('eldritch');run.fxPlayed=true}", "run.hits=(run.hits||0)+1")

# Ensure each successful Eldritch hit increments hit counter when not already present.
needle="addTurnDamage(r.total,`Décharge occulte — rayon ${i}`);"
if needle in s and "run.hits=(run.hits||0)+1" not in s[s.find(needle):s.find(needle)+220]:
    s=s.replace(needle, needle+"\n   run.hits=(run.hits||0)+1", 1)
needle2="addTurnDamage(r.total,`Décharge occulte — rayon ${p.ray}`);"
if needle2 in s and "run.hits=(run.hits||0)+1" not in s[s.find(needle2):s.find(needle2)+220]:
    s=s.replace(needle2, needle2+"\n   run.hits=(run.hits||0)+1", 1)

# Finish run: play exactly one FX based on total hits; remove any unconditional Eldritch FX at finish.
finish_pat=re.compile(r"function finishEldritchRun\(\)\{\n const run=S\.eldritchRun;if\(!run\)return;\n const cursed=run\.cursed,lines=run\.lines\|\|\[\],total=run\.total\|\|0;\n(?: const hits=run\.hits\|\|0;\n)? S\.eldritchRun=null;S\.pendingHit=null;render\(\);(?:fx\('(?:red|eldritch)'\);)?\n log\(`🔴 Décharge occulte", re.S)
m=finish_pat.search(s)
if m:
    repl="""function finishEldritchRun(){
 const run=S.eldritchRun;if(!run)return;
 const cursed=run.cursed,lines=run.lines||[],total=run.total||0;
 const hits=run.hits||0;
 S.eldritchRun=null;S.pendingHit=null;render();
 if(hits===1)fx('eldritch-1');
 else if(hits>=2)fx('eldritch-2');
 log(`🔴 Décharge occulte"""
    s=s[:m.start()]+repl+s[m.end():]

p.write_text(s,encoding='utf-8')
