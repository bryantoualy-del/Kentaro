(()=>{
'use strict';
const d=document;
const paths={
 combat:'<path d="M5 4l15 15M19 4L4 19M8 7l-3 3M16 7l3 3"/>',
 spells:'<path d="M12 2l1.7 6.3L20 10l-6.3 1.7L12 18l-1.7-6.3L4 10l6.3-1.7L12 2z"/><path d="M18 16l.8 2.2L21 19l-2.2.8L18 22l-.8-2.2L15 19l2.2-.8L18 16z"/>',
 defense:'<path d="M12 3l7 3v5c0 4.6-2.8 7.9-7 10-4.2-2.1-7-5.4-7-10V6l7-3z"/><path d="M9 12l2 2 4-5"/>',
 items:'<path d="M12 2l8 10-8 10L4 12 12 2z"/><path d="M8 12h8"/>',
 spectre:'<path d="M6 20V10a6 6 0 0112 0v10l-3-2-3 2-3-2-3 2z"/><circle cx="10" cy="10" r=".8"/><circle cx="14" cy="10" r=".8"/>',
 social:'<circle cx="8" cy="8" r="3"/><circle cx="17" cy="7" r="2"/><path d="M3 20c.4-4 2-6 5-6s4.6 2 5 6M14 14c3 0 5 2 5 5"/>',
 journal:'<path d="M5 4h10a3 3 0 013 3v13H8a3 3 0 01-3-3V4z"/><path d="M8 4v13a3 3 0 003 3M11 8h4M11 12h4"/>',
 action:'<path d="M14 4l6 6-9 9-6 1 1-6 8-10zM12 6l6 6"/>',
 bonus:'<path d="M12 3l2.3 5.7L20 9l-4.7 4 1.5 6-4.8-3.3L7.2 19l1.5-6L4 9l5.7-.3L12 3z"/>',
 reaction:'<path d="M13 2L5 14h6l-1 8 9-13h-6V2z"/>',
 move:'<path d="M4 17L17 4M10 4h7v7M4 7v10h10"/>',
 conc:'<circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 000 16 6 6 0 000-16z"/>',
 target:'<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>',
 curse:'<circle cx="12" cy="12" r="8"/><path d="M8 15l4-8 4 8M9 12h6"/>',
 shroud:'<path d="M18 16.5A8 8 0 017.5 6 7 7 0 1018 16.5z"/>',
 rest:'<path d="M5 8h11v5a5 5 0 01-5 5H9a4 4 0 01-4-4V8zM16 10h2a2 2 0 010 4h-2M4 21h14"/>',
 turn:'<path d="M20 7v5h-5M4 17v-5h5"/><path d="M6.2 8a7 7 0 0111.8-2l2 2M17.8 16A7 7 0 016 18l-2-2"/>',
 bladeSun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',
 bladeMoon:'<path d="M19 15.5A8 8 0 018.5 5 7 7 0 1019 15.5z"/>',
 agathys:'<path d="M12 2v20M4 7l16 10M20 7L4 17M8 4l4 3 4-3M8 20l4-3 4 3"/>',
 hex:'<circle cx="12" cy="12" r="8"/><path d="M8 8l8 8M16 8l-8 8M12 5v3M12 16v3"/>',
 misty:'<path d="M4 8c3-3 6 2 9-1s5-1 7 1M3 13c4-3 7 2 11-1s5 0 7 1M5 18c3-2 5 1 8-1s4-1 6 0"/>',
 invisible:'<path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12z"/><circle cx="12" cy="12" r="3"/><path d="M4 20L20 4"/>',
 door:'<path d="M5 21V4l12-2v19M9 12h.01M17 21h3"/>',
 shadow:'<path d="M6 20V9a6 6 0 0112 0v11l-3-2-3 2-3-2-3 2z"/><path d="M9 10c1-1 2-1 3 0s2 1 3 0"/>',
 banish:'<circle cx="12" cy="12" r="8"/><path d="M8 8l8 8M16 8l-8 8M12 2v3M12 19v3M2 12h3M19 12h3"/>',
 synaptic:'<path d="M9 4c-3 0-4 3-3 5-3 2-2 6 1 7 0 3 4 5 6 2V6c0-1-2-2-4-2zM15 5l2-2M16 9h4M16 13l3 2M15 17l2 3"/>',
 eldritch:'<path d="M3 13l6-3 3-7 2 7 7 2-7 2-3 7-2-6-6-2z"/>'
};
const svg=name=>`<svg class="ui-icon" viewBox="0 0 24 24" aria-hidden="true">${paths[name]||paths.items}</svg>`;
const clean=el=>{for(const n of el.childNodes){if(n.nodeType===3&&n.textContent.trim()){n.textContent=n.textContent.replace(/^\s*[☀☾✦◈⌁⚔🎯☠◐👻♜☷💥↯↗↻☕◉🔴🩸]+\s*/u,'');break}}};
const put=(el,name)=>{if(!el||el.querySelector(':scope > .ui-icon'))return;clean(el);el.insertAdjacentHTML('afterbegin',svg(name))};
const titleIcon=el=>{const t=el.textContent.toLowerCase();if(el.closest('[data-panel="spells"]'))return null;if(t.includes('décharge occulte'))return'eldritch';if(t.includes('solinar'))return'bladeSun';if(t.includes('sélhane'))return'bladeMoon';if(t.includes('cible'))return'target';if(t.includes('spectre'))return'spectre';if(t.includes('journal'))return'journal';if(t.includes('attaque'))return'action';if(t.includes('déf')||t.includes('armure')||t.includes('tombeau'))return'defense';if(t.includes('sort'))return'spells';if(t.includes('relation')||t.includes('mémoire'))return'social';return null};
let queued=false;
function decorate(){queued=false;document.querySelectorAll('.tab[data-tab]').forEach(el=>put(el,{combat:'combat',spells:'spells',defense:'defense',items:'items',spectre:'spectre',social:'social',journal:'journal'}[el.dataset.tab]));[['#ecoAction b','action'],['#ecoBonus b','bonus'],['#ecoReaction b','reaction'],['#ecoMove b','move'],['#ecoConc b','conc'],['.turn-next','turn'],['.turn-rest:not(.long)','rest'],['.turn-rest.long','shroud'],['#curseToggle','curse'],['#shroudToggle','shroud']].forEach(([s,n])=>document.querySelectorAll(s).forEach(el=>put(el,n)));document.querySelectorAll('.action-title').forEach(el=>{const n=titleIcon(el);if(n)put(el,n)})}
const style=d.createElement('style');style.textContent='.ui-icon{width:1.05em;height:1.05em;display:inline-block;vertical-align:-.16em;margin-right:.42em;fill:none;stroke:currentColor;stroke-width:1.65;stroke-linecap:round;stroke-linejoin:round;flex:0 0 auto}.tab{display:inline-flex!important;align-items:center}.tab .ui-icon{opacity:.76}.tab.active .ui-icon{opacity:1}.eco b,.turn-next,.turn-rest{display:flex!important;align-items:center;justify-content:center}.action-title .ui-icon{color:var(--k-gold);width:1.1em;height:1.1em}.solar .action-title .ui-icon{color:#e9a553}.lunar .action-title .ui-icon{color:#8db9ef}.spell-title-agathys .ui-icon{color:#a8dcff}.spell-title-hex .ui-icon{color:#c879a4}.spell-title-misty .ui-icon{color:#aab0d8}.spell-title-invisible .ui-icon{color:#d8d5e8}.spell-title-shroud .ui-icon,.spell-title-shadow .ui-icon{color:#9a82c8}.spell-title-door .ui-icon{color:#bf5368}.spell-title-banish .ui-icon{color:#efc878}.spell-title-synaptic .ui-icon{color:#c589ff}.spell-title-eldritch .ui-icon{color:#dd6076}';d.head.appendChild(style);
new MutationObserver(()=>{if(!queued){queued=true;queueMicrotask(decorate)}}).observe(d.body,{childList:true,subtree:true,characterData:true});decorate();
})();
