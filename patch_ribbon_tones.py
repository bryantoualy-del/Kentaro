from pathlib import Path
p=Path('index.html')
s=p.read_text(encoding='utf-8')
old_css="#kentaro-ribbon{position:fixed;top:max(8px,env(safe-area-inset-top));left:50%;transform:translate(-50%,-145%);width:min(calc(100% - 16px),780px);z-index:9999;background:linear-gradient(90deg,#7d341f 0%,#3c314c 48%,#1f4d78 100%);border:2px solid #e7bb69;border-radius:14px;padding:12px 14px;box-shadow:0 12px 34px rgba(0,0,0,.65),0 0 0 2px rgba(231,187,105,.12) inset;opacity:0;pointer-events:none;transition:.25s ease}#kentaro-ribbon.show{transform:translate(-50%,0);opacity:1;pointer-events:auto}#kentaro-ribbon .title{color:#fff0d1;font-weight:800;font-size:14px;letter-spacing:.06em;text-transform:uppercase}#kentaro-ribbon .body{margin-top:6px;color:#fff;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:15px;line-height:1.35;white-space:pre-wrap;font-weight:800}#kentaro-ribbon .hint{margin-top:5px;color:#ddd4c5;font-size:11px}#kentaro-ribbon .ribbon-actions{display:none;gap:8px;margin-top:10px}#kentaro-ribbon.awaiting-hit .ribbon-actions{display:flex}#kentaro-ribbon.awaiting-hit .hint{display:none}#kentaro-ribbon .ribbon-actions button{flex:1;min-height:46px;font-weight:800;font-size:15px}"
new_css=old_css+"#kentaro-ribbon.tone-warn{background:linear-gradient(90deg,#2f323a 0%,#252a34 48%,#202833 100%);border-color:#8d96a8;box-shadow:0 12px 28px rgba(0,0,0,.48),0 0 0 1px rgba(180,190,210,.08) inset}#kentaro-ribbon.tone-warn .title{color:#e9edf5}#kentaro-ribbon.tone-warn .body{color:#f1f4fa}#kentaro-ribbon.tone-warn .hint{color:#c3cad6}#kentaro-ribbon.tone-error{background:linear-gradient(90deg,#6f1e20 0%,#4d2030 50%,#3e1b27 100%);border-color:#e08e92;box-shadow:0 12px 30px rgba(0,0,0,.56),0 0 0 1px rgba(255,185,185,.12) inset}#kentaro-ribbon.tone-error .title{color:#ffe6e6}#kentaro-ribbon.tone-error .body{color:#fff6f6}#kentaro-ribbon.tone-error .hint{color:#efcfd1}"
if old_css not in s: raise SystemExit('ribbon css anchor missing')
s=s.replace(old_css,new_css,1)
old_js="""function log(t){
 const el=q('#log');el.textContent=(el.textContent==='Prêt. Que l’éclipse tombe.'?'':el.textContent+'\\n\\n')+t;el.scrollTop=el.scrollHeight;
 q('#lastResult').textContent=t;const r=q('#kentaro-ribbon');r.classList.add('show');clearTimeout(ribbonTimer);if(!S.pendingHit)ribbonTimer=setTimeout(()=>r.classList.remove('show'),7000);save(true)
}"""
new_js="""function getRibbonTone(t){
 const x=(t||'').toLowerCase();
 const warnKeys=['déjà utilisée','déjà utilisé','déjà dépensée','déjà dépensé','aucun emplacement','aucune cible','aucun dégât','pas assez','plus de','plus d’',\"plus d'\",'non disponible','conservés','conservé','rien à annuler'];
 const errKeys=['raté','perdue','perdu','échoue','échec','concentration rompue'];
 if(warnKeys.some(k=>x.includes(k)))return 'warn';
 if(errKeys.some(k=>x.includes(k)))return 'error';
 return 'success';
}
function log(t){
 const el=q('#log');el.textContent=(el.textContent==='Prêt. Que l’éclipse tombe.'?'':el.textContent+'\\n\\n')+t;el.scrollTop=el.scrollHeight;
 q('#lastResult').textContent=t;const r=q('#kentaro-ribbon');
 r.classList.remove('tone-warn','tone-error');
 const tone=getRibbonTone(t);
 if(tone==='warn')r.classList.add('tone-warn');
 else if(tone==='error')r.classList.add('tone-error');
 r.classList.add('show');clearTimeout(ribbonTimer);if(!S.pendingHit)ribbonTimer=setTimeout(()=>r.classList.remove('show'),7000);save(true)
}"""
if old_js not in s: raise SystemExit('log anchor missing')
s=s.replace(old_js,new_js,1)
p.write_text(s,encoding='utf-8')
