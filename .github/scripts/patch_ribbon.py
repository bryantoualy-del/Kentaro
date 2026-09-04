from pathlib import Path
import re
p=Path('index.html')
s=p.read_text(encoding='utf-8')
new="""function confirmPendingBlade(hit){
 if(!S.pendingHit)return;
 const p=S.pendingHit;S.pendingHit=null;
 const sun=p.which==='sun',name=p.name,target=p.target||'';
 if(!hit){
   if(sun){S.solHit=false;S.solTarget=''}else{S.selHit=false;S.selTarget=''}
   render();log(`${name}\\nConfirmation : RATÉ\\nAttaque : ${p.total}`);return;
 }
 const cursed=curseAppliesTo(target),crit=false;
 const w=roll(1,8,4),elem=roll(1,6);let extra=0,sealDamage=0,parts=[];
 if(cursed){extra+=4;parts.push('Malédiction +4')}
 if(S.shroud){const sh=roll(2,8);extra+=sh.total;parts.push(`Voile ${sh.total}`)}
 if(sun){S.solHit=true;S.solTarget=target}else{S.selHit=true;S.selTarget=target}
 if(S.solHit&&S.selHit&&bladesShareTarget()&&!S.seal){
   const se=roll(1,8),me=roll(1,8);S.seal=true;S.sealTarget=target;S.sealExpiresAfterTurn=S.turn+1;
   sealDamage=se.total+me.total;fx('eclipse');
 }
 const damage=w.total+elem.total+extra;
 const total=damage+sealDamage;
 render();
 log(`${name}\\nConfirmation : TOUCHÉ\\nAttaque : ${p.total}\\nDégâts : ${damage}${parts.length?` • ${parts.join(' • ')}`:''}${sealDamage?`\\nSceau d’Éclipse : +${sealDamage}`:''}\\nTOTAL : ${total}`);
}
"""
pat=r"function confirmPendingBlade\(hit\)\{.*?\n\}\nq\('#confirmHit'\)"
s2,n=re.subn(pat,new+"q('#confirmHit')",s,count=1,flags=re.S)
if n!=1:
    raise SystemExit(f'Expected one confirmPendingBlade block, found {n}; aborting safely.')
p.write_text(s2,encoding='utf-8')
