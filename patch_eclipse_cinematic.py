from pathlib import Path
import re

p=Path('index.html')
text=p.read_text(encoding='utf-8')

pattern=re.compile(r"#fxOverlay\.fx-eclipse\{.*?@keyframes fxEclipse\{.*?\}",re.S)
replacement=r'''#fxOverlay.fx-eclipse{
  background:
    radial-gradient(circle at 30% 50%, rgba(255,193,84,.42) 0 10%, transparent 26%),
    radial-gradient(circle at 70% 50%, rgba(100,168,255,.42) 0 10%, transparent 26%),
    radial-gradient(circle at 50% 50%, rgba(14,10,22,.82) 0 8%, rgba(48,35,80,.56) 10%, transparent 18%),
    linear-gradient(90deg, rgba(255,173,63,.34) 0%, rgba(40,33,78,.16) 36%, rgba(18,12,32,.30) 50%, rgba(38,49,96,.16) 64%, rgba(106,177,255,.34) 100%);
  animation:fxEclipse 1.02s cubic-bezier(.18,.86,.2,1);
}
.shell.eclipse-hit{animation:shellEclipse .64s ease-out}
@keyframes fxEclipse{
  0%{opacity:0;filter:brightness(.92);clip-path:inset(0 50% 0 50%)}
  12%{opacity:1;filter:brightness(1.08);clip-path:inset(0 35% 0 35%)}
  26%{opacity:1;filter:brightness(1.18);clip-path:inset(0 18% 0 18%)}
  40%{opacity:1;filter:brightness(1.28);clip-path:inset(0 0 0 0)}
  52%{opacity:1;filter:brightness(1.38);background:radial-gradient(circle at 50% 50%, rgba(12,8,18,.94) 0 9%, rgba(237,228,255,.18) 10%, rgba(255,215,120,.22) 12%, rgba(112,180,255,.18) 14%, transparent 24%),linear-gradient(90deg, rgba(255,173,63,.24) 0%, rgba(40,33,78,.08) 40%, rgba(18,12,32,.36) 50%, rgba(38,49,96,.08) 60%, rgba(106,177,255,.24) 100%)}
  68%{opacity:.92;filter:brightness(1.46);transform:scale(1.01)}
  100%{opacity:0;filter:brightness(1);transform:scale(1.035)}
}
@keyframes shellEclipse{
  0%{transform:scale(1) translateX(0)}
  16%{transform:scale(1.003) translateX(-2px)}
  32%{transform:scale(.999) translateX(2px)}
  48%{transform:scale(1.004) translateX(-1px)}
  64%{transform:scale(1.001) translateX(1px)}
  100%{transform:scale(1) translateX(0)}
}'''
text,n=pattern.subn(replacement,text,count=1)
if n!=1: raise SystemExit('eclipse css block not found')

needle="if(type==='synaptic'){const shell=q('#app');if(shell){shell.classList.remove('synaptic-hit');void shell.offsetWidth;shell.classList.add('synaptic-hit');clearTimeout(shell._synTimer);shell._synTimer=setTimeout(()=>shell.classList.remove('synaptic-hit'),460)}}"
insert=needle+"\n if(type==='eclipse'){const shell=q('#app');if(shell){shell.classList.remove('eclipse-hit');void shell.offsetWidth;shell.classList.add('eclipse-hit');clearTimeout(shell._eclipseTimer);shell._eclipseTimer=setTimeout(()=>shell.classList.remove('eclipse-hit'),700)}}"
if needle not in text: raise SystemExit('fx synaptic anchor not found')
text=text.replace(needle,insert,1)

text=text.replace("clearTimeout(fxTimer);fxTimer=setTimeout(()=>o.className='',1150);","clearTimeout(fxTimer);fxTimer=setTimeout(()=>o.className='',1250);",1)
p.write_text(text,encoding='utf-8')
