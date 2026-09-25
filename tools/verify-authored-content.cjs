// Optional developer QA: executes generated classic assets offline, never required to play.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),html=fs.readFileSync(path.join(root,'index.html'),'utf8'),scripts=[...html.matchAll(/<script src="([^"]+)"/g)].map(m=>m[1]);
const campaignPath='js/data/maps/campaign/campaign.js';
function load(replacements=new Map(),extra=[]){
 const context=vm.createContext({window:{},console});
 for(const file of scripts.filter(f=>f!=='js/main.js')){
  vm.runInContext(replacements.get(file)??fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file});
  if(file==='js/editor/ShippingPage.js'){
   vm.runInContext(replacements.get('js/data/authored-content.js')||'window.GBTRPG.data.AUTHORED_CONTENT=null;',context);
   vm.runInContext(replacements.get(campaignPath)??'window.GBTRPG.data.AUTHORED_MAPS.useDemo();',context);
   for(const asset of extra)vm.runInContext(asset.text,context,{filename:asset.path});
  }
 }
 return context;
}
const base=load(),evaluate=source=>vm.runInContext(source,base);
evaluate('const G=window.GBTRPG;const authoredFixture=G.debug.authoringPersistenceFixture();');
const files=evaluate('authoredFixture.shippingFiles()'),zip=evaluate('G.editor.EditorFiles.zip(authoredFixture.shippingFiles())');
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'shining-farce-authoring-'));
fs.writeFileSync(path.join(temp,'shipping-maps.zip'),zip);
fs.writeFileSync(path.join(temp,'expected-files.json'),JSON.stringify(files));
const replacements=new Map(files.filter(f=>[campaignPath,'js/data/authored-content.js'].includes(f.path)).map(f=>[f.path,f.text]));
const maps=files.filter(f=>f.path.startsWith('js/data/maps/battle/'));
const expected=evaluate('G.editor.AuthoredFiles.json(authoredFixture.data)');
for(const order of [maps,[...maps].reverse()]){
 const context=load(replacements,order);
 const actual=vm.runInContext('const G=window.GBTRPG;const game=new G.core.Game({},{});game.resetCurrent();G.editor.AuthoredFiles.json(game.authoredContent)',context);
 assert.equal(actual,expected,'generated scripts lost metadata or depended on Battle Map order');
 assert.equal(vm.runInContext('game.campaign.state.schemaVersion',context),8);
 assert.equal(vm.runInContext('G.editor.AuthoredContent.select(game.campaign.definitions.locations.granseal,game.battleProviders.staticMaps,{controller:"PLAYER",story:{storyGate:true}}).id',context),'mapA');
 assert.equal(vm.runInContext('const fixture=G.data.BattleFoundationFixture.create();const prepared=G.systems.BattleInitializationSystem.prepare({...fixture.scenario,routeId:null,locationId:"granseal"},game.campaign.definitions,{...game.battleProviders,campaignState:game.campaign.state,storyState:()=>({storyGate:true}),orientation:()=>fixture.orientation,designations:{labWizard:"BACK",labEnemy:"BACK"}});prepared.status',context),'READY');
 assert.equal(vm.runInContext('prepared.scenario.specialUnits.length',context),1);
 assert.equal(vm.runInContext('Object.hasOwn(game.authoredContent.battleMaps.mapA.metadata,"__proto__")',context),true);
 assert.equal(vm.runInContext('({}).retained',context),undefined);
}
const missing=load(replacements,maps.slice(1));
assert.throws(()=>vm.runInContext('new window.GBTRPG.core.Game({},{}).resetCurrent()',missing),/missing: mapA/);
const missingCampaign=load(new Map([[campaignPath,'// Failed script load simulation.']]),[]);
assert.throws(()=>vm.runInContext('new window.GBTRPG.core.Game({},{}).resetCurrent()',missingCampaign),/script missing/);
// Existing monoliths use a JS object literal, whose __proto__ syntax predates the
// new JSON-backed registration format. Exercise the legacy shape without that key.
evaluate('const legacyFixture=new G.editor.EditorDocument(authoredFixture.campaign,authoredFixture.data);legacyFixture.command(d=>{for(const m of Object.values(d.battleMaps))delete m.metadata.__proto__;});');
const legacy=load(new Map([['js/data/authored-content.js',evaluate('legacyFixture.shipping()')]]));
assert.equal(vm.runInContext('const G=window.GBTRPG;const game=new G.core.Game({},{});game.resetCurrent();G.editor.AuthoredFiles.json(game.authoredContent)',legacy),evaluate('G.editor.AuthoredFiles.json(legacyFixture.data)'));
const manifest=files.find(f=>f.path==='map-scripts.html').text;
assert.deepEqual([...manifest.matchAll(/src="([^"]+)"/g)].map(m=>m[1]),[campaignPath,...maps.map(f=>f.path)]);
for(const file of scripts.filter(f=>!f.startsWith('js/debug/'))){
 const source=fs.readFileSync(path.join(root,file),'utf8');
 assert(!/\bfetch\s*\(|\bXMLHttpRequest\b|\beval\s*\(|\bnew\s+Function\s*\(|(?<![.\w])import\s*\(\s*['"`]/.test(source),file+' introduces runtime network/dynamic code');
 assert(!/^\s*(?:import\s+|export\s+(?:default|const|class|function))/m.test(source),file+' introduces modules');
}
async function pickerChecks(){
 // File.text and cancellation use the browser-facing callbacks, with a deterministic DOM fixture.
 const result=await vm.runInContext(`(async()=>{
  let events={},got=null,error=null,cancels=0;const dom={createElement:()=>({files:[{text:async()=>authoredFixture.portable()}],addEventListener:(k,f)=>events[k]=f,click(){}})};
  const input=G.editor.EditorFiles.import(t=>got=t,e=>error=e,()=>cancels++,dom);await events.change();if(got!==authoredFixture.portable()||error)throw Error('File read failed');
  input.files=[{text:async()=>{throw Error('read denied');}}];await events.change();if(error?.message!=='read denied')throw Error('File error not surfaced');
  input.files=[];await events.change();events.cancel();if(cancels!==2)throw Error('Cancellation not handled');return true;
 })()`,base);assert(result);
 console.log(JSON.stringify({generatedClassicAssetRoundTrip:'passed, both map orders',legacyClassicAsset:'passed',normalGameInitialization:'passed',stableIdsReferencesAndMetadata:'passed',missingShippingFiles:'rejected',fileReadErrorAndCancel:'passed',runtimeNetworkOrDynamicCode:0,campaignSchema:8,packageFiles:files.length,zipBytes:zip.length,artifactDirectory:temp,browserLaunchVerified:false},null,2));
}
pickerChecks().catch(error=>{console.error(error);process.exitCode=1;});
