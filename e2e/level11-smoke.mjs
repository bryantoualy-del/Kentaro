import assert from 'node:assert/strict';
import {chromium,webkit} from 'playwright';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
const root=process.cwd();
const server=createServer(async(req,res)=>{try{
 const u=new URL(req.url,'http://localhost'),file=resolve(root,'.'+u.pathname.replace(/\/$/,'/index.html'));
 if(!file.startsWith(root+'/'))throw Error('Path outside repo');
 const data=await readFile(file);res.setHeader('Content-Type',({'.js':'text/javascript','.css':'text/css','.html':'text/html','.json':'application/json'})[extname(file)]||'application/octet-stream');res.end(data);
}catch{res.writeHead(404).end()}});
await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
const base='http://127.0.0.1:'+server.address().port;
const engine=process.env.E2E_BROWSER==='webkit'?webkit:chromium;
let browser;
try{
 browser=await engine.launch(engine===webkit?{}:{args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']});
 for(const width of [390,1180]){
  const page=await browser.newPage({viewport:{width,height:820}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base);await page.waitForFunction(()=>window.__CompanionBridge?.read);
  const start=await page.evaluate(()=>{const s=window.__CompanionBridge.read();return{hp:s.hp,max:s.maxHp,slots:s.slots,arcaneReady:s.arcaneReady,pips:document.querySelectorAll('#slots .pip').length}});
  assert.equal(start.max,111);assert.equal(start.hp,111);assert.equal(start.slots,3);assert.equal(start.pips,3);assert.equal(start.arcaneReady,true);
  await page.evaluate(()=>document.getElementById('massSuggestion').click());
  const after=await page.evaluate(()=>{const s=window.__CompanionBridge.read();return{ready:s.arcaneReady,used:s.actionUsed,slots:s.slots}});
  assert.equal(after.ready,false);assert.equal(after.used,true);assert.equal(after.slots,3,'Arcane mystique does not use pact slots');
  await page.evaluate(()=>{const s=structuredClone(window.__CompanionBridge.read());s.hp=50;s.maxHp=103;s.slots=2;s.arcaneReady=true;localStorage.setItem('kentaro-eclipse-v4',JSON.stringify(s))});
  await page.reload();await page.waitForFunction(()=>window.__CompanionBridge?.read);
  const migrated=await page.evaluate(()=>{const s=window.__CompanionBridge.read();return{hp:s.hp,max:s.maxHp,slots:s.slots,pips:document.querySelectorAll('#slots .pip').length}});
  assert.equal(migrated.hp,58);assert.equal(migrated.max,111);assert.equal(migrated.slots,3);assert.equal(migrated.pips,3);
  assert.deepEqual(errors,[],'no runtime errors');
  await page.close();
 }
 console.log('Level 11 browser smoke passed:',process.env.E2E_BROWSER||'chromium');
}finally{await browser?.close();await new Promise(ok=>server.close(ok))}
