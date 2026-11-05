const test=require('node:test'), assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const sandbox={module:{exports:{}},require:()=>({Plugin:class{},Modal:class{},normalizePath:s=>s}),TextDecoder,TextEncoder,Uint8Array,DataView,Blob,Response,DecompressionStream};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../main.js'),'utf8'),sandbox);
const {readZipEntries,parseManifest,planImport,applyImport}=sandbox.module.exports.__test;
const zip=async name=>{
 const bytes=fs.readFileSync(path.join(__dirname,'fixtures',name+'-session.zip'));
 const entries=await readZipEntries(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.length));
 return {entries,manifest:parseManifest(entries)};
};
function vault(){
 const files=new Map();
 return {files,getAbstractFileByPath:path=>files.has(path)?{path}:null,
  getMarkdownFiles:()=>[...files.keys()].filter(p=>p.endsWith('.md')).map(path=>({path})),
  read:async f=>files.get(f.path),createFolder:async p=>files.set(p,null),
  process:async(f,edit)=>files.set(f.path,edit(files.get(f.path))),
  createBinary:async(p,b)=>{assert(!files.has(p));files.set(p,p.endsWith('.md')?new TextDecoder().decode(b):Buffer.from(b));}};
}
test('Les ZIP réels de Kentaro et Kobe partagent le coffre et protègent le contenu existant',async()=>{
 const v=vault(),legacy=await zip('kentaro'),kobe=await zip('kobe');
 assert.equal(legacy.manifest.source,'kentaro');assert.equal(kobe.manifest.source,'kobe');
 assert(!JSON.stringify(kobe.manifest).includes('Absent'));
 const go=async z=>applyImport(v,await planImport(v,z.entries,z.manifest));
 await go(legacy);
 const person='02 - Personnages/PNJ/Roark.md',privateText='# Roark\n\n## Mes secrets\nÀ conserver.\n';
 v.files.set(person,privateText);
 const media=kobe.manifest.routes.find(r=>r.kind==='media').destination;
 v.files.set(media,Buffer.from('portrait préexistant'));
 const session=kobe.manifest.routes.find(r=>r.kind==='session').destination;
 v.files.set(session,'Session manuelle');
 const plan=await planImport(v,kobe.entries,kobe.manifest);
 const merge=plan.find(i=>i.destination===person);
 assert.equal(merge.facts.find(f=>f.kind==='status').selected,false);
 merge.facts.find(f=>f.kind==='relation').selected=false;
 await applyImport(v,plan);
 assert.equal(v.files.get(session),'Session manuelle');
 assert(v.files.get(person).startsWith(privateText));
 assert.match(v.files.get(person),/Vu aux Trois Soupapes/);assert.doesNotMatch(v.files.get(person),/Statut proposé|\*\*Relation/);
 assert.equal(v.files.get(media).toString(),'portrait préexistant');
 assert.equal((await planImport(v,kobe.entries,kobe.manifest)).length,0);
 assert.equal((await planImport(v,legacy.entries,legacy.manifest)).length,0);
 assert.equal([...v.files.keys()].filter(p=>p.includes('Imports Kentaro/')&&p.endsWith('.md')).length,2);
});
