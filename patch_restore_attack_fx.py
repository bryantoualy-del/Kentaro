from pathlib import Path

p=Path('index.html')
s=p.read_text(encoding='utf-8')

# 1) Repair malformed FX CSS around cinematic Eclipse and restore fxPulse.
s=s.replace("""@keyframes shellEclipse{
  0%{transform:scale(1) translateX(0)}
  16%{transform:scale(1.003) translateX(-2px)}
  32%{transform:scale(.999) translateX(2px)}
  48%{transform:scale(1.004) translateX(-1px)}
  64%{transform:scale(1.001) translateX(1px)}
  100%{transform:scale(1) translateX(0)}
}18%{opacity:1}55%{opacity:.75}100%{opacity:0}}""",
"""@keyframes shellEclipse{
  0%{transform:scale(1) translateX(0)}
  16%{transform:scale(1.003) translateX(-2px)}
  32%{transform:scale(.999) translateX(2px)}
  48%{transform:scale(1.004) translateX(-1px)}
  64%{transform:scale(1.001) translateX(1px)}
  100%{transform:scale(1) translateX(0)}
}
@keyframes fxPulse{0%{opacity:0}20%{opacity:1}100%{opacity:0}}""",1)

# 2) Add dedicated Eldritch Blast FX: two diagonal glowing red points.
if '#fxOverlay.fx-eldritch' not in s:
    s=s.replace("#fxOverlay.fx-red{background:radial-gradient(circle at center,rgba(255,30,54,.52),rgba(130,0,20,.14) 45%,transparent 74%);animation:fxPulse .52s ease}\n#fxOverlay.fx-eclipse{",
"""#fxOverlay.fx-red{background:radial-gradient(circle at center,rgba(255,30,54,.52),rgba(130,0,20,.14) 45%,transparent 74%);animation:fxPulse .52s ease}
#fxOverlay.fx-eldritch{background:radial-gradient(circle at 36% 34%,rgba(255,120,120,.98) 0 2.8%,rgba(255,40,52,.84) 2.9% 6.6%,rgba(140,0,14,.34) 6.7% 11%,transparent 14%),radial-gradient(circle at 64% 66%,rgba(255,120,120,.98) 0 2.8%,rgba(255,40,52,.84) 2.9% 6.6%,rgba(140,0,14,.34) 6.7% 11%,transparent 14%),linear-gradient(135deg,transparent 0 30%,rgba(255,24,40,.12) 36%,rgba(90,0,10,.18) 50%,rgba(255,24,40,.12) 64%,transparent 70%);animation:fxEldritch .66s ease-out}
.shell.eldritch-hit{animation:shellEldritch .34s linear}
#fxOverlay.fx-eclipse{""",1)
    s=s.replace("@keyframes fxPulse{0%{opacity:0}20%{opacity:1}100%{opacity:0}}",
"""@keyframes fxPulse{0%{opacity:0}20%{opacity:1}100%{opacity:0}}
@keyframes fxEldritch{0%{opacity:0;filter:brightness(.9) blur(1px)}18%{opacity:1;filter:brightness(1.35) blur(0)}48%{opacity:.96;filter:brightness(1.12)}100%{opacity:0;filter:brightness(1)}}
@keyframes shellEldritch{0%{transform:translateX(0)}20%{transform:translateX(-2px)}40%{transform:translateX(2px)}60%{transform:translateX(-1px)}100%{transform:translateX(0)}}""",1)

# 3) Wire fx(type) for Eldritch.
if "if(type==='eldritch')" not in s:
    marker=""" if(type==='occult'||type==='occult-crit'){const shell=q('#app');if(shell){const cls=type==='occult-crit'?'occult-crit-hit':'occult-hit';shell.classList.remove('occult-hit','occult-crit-hit');void shell.offsetWidth;shell.classList.add(cls);clearTimeout(shell._occTimer);shell._occTimer=setTimeout(()=>shell.classList.remove('occult-hit','occult-crit-hit'),720)}}
 clearTimeout(fxTimer);fxTimer=setTimeout(()=>o.className='',1250);"""
    repl=""" if(type==='occult'||type==='occult-crit'){const shell=q('#app');if(shell){const cls=type==='occult-crit'?'occult-crit-hit':'occult-hit';shell.classList.remove('occult-hit','occult-crit-hit');void shell.offsetWidth;shell.classList.add(cls);clearTimeout(shell._occTimer);shell._occTimer=setTimeout(()=>shell.classList.remove('occult-hit','occult-crit-hit'),720)}}
 if(type==='eldritch'){const shell=q('#app');if(shell){shell.classList.remove('eldritch-hit');void shell.offsetWidth;shell.classList.add('eldritch-hit');clearTimeout(shell._eldritchTimer);shell._eldritchTimer=setTimeout(()=>shell.classList.remove('eldritch-hit'),360)}}
 clearTimeout(fxTimer);fxTimer=setTimeout(()=>o.className='',1250);"""
    if marker not in s: raise SystemExit('fx marker missing')
    s=s.replace(marker,repl,1)

# 4) Use dedicated Eldritch FX both at start and finish.
s=s.replace("render();fx('red');continueEldritchRun()","render();fx('eldritch');continueEldritchRun()",1)
s=s.replace("S.eldritchRun=null;S.pendingHit=null;render();fx('red');","S.eldritchRun=null;S.pendingHit=null;render();fx('eldritch');",1)

# Safety assertions.
for needle in ["@keyframes fxPulse","#fxOverlay.fx-sun","#fxOverlay.fx-moon","#fxOverlay.fx-eldritch","if(type==='eldritch')","fx('eldritch')","fx(sun?'sun':'moon')"]:
    if needle not in s: raise SystemExit(f'missing after patch: {needle}')
if "}18%{opacity:1}55%{opacity:.75}100%{opacity:0}}" in s: raise SystemExit('malformed eclipse CSS remains')

p.write_text(s,encoding='utf-8')
print('FX repaired')
# retrigger
