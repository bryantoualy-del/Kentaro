/* Armure de Maléfice (Armor of Hexes) : 1d6 du compagnon ou dé physique, résolution arbitrée par Encounter. */
(()=>{'use strict';
 const engine=window.RPGReactions,character=window.KentaroAPI;
 if(!engine||!character||window.__CompanionBridge?.id!=='kentaro')return;
 const KEY='kentaro:armor-of-hexes:v1',OPTION='kentaro-armor-of-hexes';
 let ledger={};try{ledger=JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch{}
 const save=()=>localStorage.setItem(KEY,JSON.stringify(ledger)),valid=v=>/^[1-6]$/.test(String(v??'').trim());
 const dialog=document.createElement('dialog');dialog.id='kentaroArmorHexesDialog';dialog.className='kentaro-armor-hexes';dialog.setAttribute('aria-labelledby','kentaroArmorTitle');document.body.append(dialog);
 const style=document.createElement('style');style.textContent=`
 #kentaroArmorHexesDialog{position:fixed;inset:auto;margin:auto;width:min(460px,calc(100vw - 28px));max-height:min(80dvh,670px);overflow:auto;background:linear-gradient(155deg,#251a30 0%,#16131e 85%);color:#f7ecda;border:1px solid #bc9b62;border-radius:17px;padding:22px;box-shadow:0 24px 90px #000b;z-index:99999;font:inherit}
 #kentaroArmorHexesDialog::backdrop{background:#06020cbb;backdrop-filter:blur(5px)}
 #kentaroArmorHexesDialog h2{font-size:1.2rem;line-height:1.2;color:#efcf8d;margin:0 0 12px}
 #kentaroArmorHexesDialog p{line-height:1.4;margin:0 0 14px}
 #kentaroArmorHexesDialog .armor-actions{display:grid;gap:9px;margin-top:13px}
 #kentaroArmorHexesDialog button{min-height:44px;border:1px solid #b79256;border-radius:10px;background:#473151;color:#fff5df;font:inherit;font-weight:700;padding:11px;cursor:pointer;text-align:center}
 #kentaroArmorHexesDialog button.armor-secondary{background:#24212a;border-color:#736473;color:#e4d9e5}
 #kentaroArmorHexesDialog button:disabled{opacity:.5;cursor:default}
 #kentaroArmorHexesDialog input{box-sizing:border-box;display:block;background:#eee6db;color:#1c1823;border:2px solid #bb9257;border-radius:9px;padding:13px;width:100%;min-height:44px;font:inherit;font-size:1.2rem}
 #kentaroArmorHexesDialog .armor-error{color:#ffc3b4;min-height:1.5em;display:block;font-size:.9rem;margin-top:7px}
 #kentaroArmorHexesDialog .armor-note{color:#d0bdd4;font-size:.87rem}
 @media(max-width:550px){#kentaroArmorHexesDialog{padding:16px;border-radius:12px}}`;
 document.head.append(style);
 function recorded(q){const x=ledger[q.reactionId];return x?.combatId===q.combatId&&x?.result?x.result:null}
 function recover(q){const result=recorded(q);if(result?.consumed)engine.setAvailable(false);return result}
 function close(){if(dialog.open)dialog.close();dialog.replaceChildren()}
 function perform(q){const existing=recover(q);if(existing)return Promise.resolve(existing);
  return new Promise(resolve=>{
   let finished=false;const done=result=>{if(finished)return;finished=true;close();resolve(result)};
   const pass=()=>done({success:false,declined:true,consumed:false,reason:'Armure de Maléfice passée'});
   dialog.oncancel=e=>{e.preventDefault();pass()};
   function confirm(value,mode){if(finished||!valid(value))return false;const n=Number(value);
    const result={success:n>=4,consumed:true,hexArmorRoll:n,hexArmorMode:mode,rolls:[n],hexArmorOutcome:n>=4?'miss':'hit',manual:mode==='manual'};
    // Écrire le résultat avant tout effet local ou transmission : une reconnexion ne relance pas le dé.
    ledger[q.reactionId]={combatId:q.combatId,result};save();engine.setAvailable(false);
    character.log(`🛡 Armure de Maléfice · 1d6 = ${n}${mode==='manual'?' · résultat MANUEL (dé physique)':' · jet du compagnon'} · ${n>=4?'ATTAQUE ANNULÉE (raté)':'TOUCHE MAINTENUE'} · réaction dépensée · validation Encounter.`);
    done(result);return true;
   }
   function el(tag,text,cls){const x=document.createElement(tag);if(text!=null)x.textContent=text;if(cls)x.className=cls;return x}
   function button(text,fn,secondary=false){const b=el('button',text,secondary?'armor-secondary':'');b.type='button';b.onclick=()=>{if(!finished)fn()};return b}
   function header(){dialog.replaceChildren();const title=el('h2','🛡 Armure de Maléfice');title.id='kentaroArmorTitle';dialog.append(title,el('p',`${q.attackerName||'Un adversaire maudit'} touche Kentaro. Lance 1d6 : sur 4, 5 ou 6, l’attaque devient un raté et n’inflige aucun dégât.`),el('p','La réaction n’est dépensée qu’après le jet ou la confirmation du résultat.','armor-note'))}
   function choose(){header();const actions=el('div',null,'armor-actions');actions.append(button('🎲 Lancer le d6',()=>{if(finished||recorded(q))return;const r=character.roll(1,6);confirm(r.total,'automatic')}),button('✍️ Saisir mon résultat',manual),button('Passer · conserver ma réaction',pass,true));dialog.append(actions)}
   function manual(){header();const label=el('label','Résultat du dé physique (entier de 1 à 6)');label.htmlFor='kentaroHexD6Input';const input=el('input');input.id='kentaroHexD6Input';input.type='text';input.inputMode='numeric';input.autocomplete='off';input.pattern='[1-6]';input.maxLength=5;const error=el('small','','armor-error');error.setAttribute('role','alert');const actions=el('div',null,'armor-actions');const submit=button('Confirmer et transmettre',()=>{if(!valid(input.value)){error.textContent='Saisis un nombre entier de 1 à 6.';input.setAttribute('aria-invalid','true');return}submit.disabled=true;confirm(input.value,'manual')});actions.append(submit,button('← Retour au choix du jet',choose,true),button('Passer · conserver ma réaction',pass,true));dialog.append(label,input,error,actions);input.addEventListener('input',()=>{error.textContent='';input.removeAttribute('aria-invalid')});input.focus()}
   choose();if(!dialog.open)dialog.showModal();
  });
 }
 engine.register({id:OPTION,label:'Armure de Maléfice · 1d6',kind:OPTION,matches:q=>q.kind===OPTION,available:q=>!!q.attackerId&&!!q.reactionId,execute:perform,recover});
 window.KentaroArmorOfHexes={valid,recover};
})();