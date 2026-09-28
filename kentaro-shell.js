(()=>{'use strict';const nav=document.querySelector('.tabs');if(!nav)return;
const groups={combat:[['combat','Attaques'],['defense','Défenses'],['spectre','Spectre']],powers:[['spells','Sorts & pouvoirs']],social:[['social','Profil'],['items','Inventaire']],journal:[['journal','Journal']]};
const labels={combat:'Combat',powers:'Sorts & pouvoirs',social:'Social',journal:'Journal'};
const dock=document.createElement('nav');dock.className='kentaro-dock';dock.setAttribute('aria-label','Navigation mobile');
const sub=document.createElement('nav');sub.className='kentaro-subnav';sub.setAttribute('aria-label','Sous-sections');nav.after(sub);
for(const [group,label] of Object.entries(labels)){const b=document.createElement('button');b.type='button';b.dataset.group=group;b.textContent=label;dock.append(b)}document.body.append(dock);
let last={};function selected(id){const group=Object.keys(groups).find(g=>groups[g].some(([key])=>key===id))||'combat';last[group]=id;dock.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b.dataset.group===group));sub.replaceChildren();for(const [key,label] of groups[group]){const b=document.createElement('button');b.type='button';b.textContent=label;b.classList.toggle('active',key===id);b.onclick=()=>nav.querySelector(`[data-tab="${key}"]`)?.click();sub.append(b)}}
dock.onclick=e=>{const group=e.target.closest('[data-group]')?.dataset.group;if(group)nav.querySelector(`[data-tab="${last[group]||groups[group][0][0]}"]`)?.click()};
nav.addEventListener('click',e=>{const id=e.target.closest('[data-tab]')?.dataset.tab;if(id)selected(id)});selected(nav.querySelector('.tab.active')?.dataset.tab||'combat');
})();