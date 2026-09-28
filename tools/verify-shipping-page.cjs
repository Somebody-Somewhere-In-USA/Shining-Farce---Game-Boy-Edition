// Generated-page and DOM-fixture checks. This is not a browser/Explorer security test.
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),source=fs.readFileSync(path.join(root,'index.html'),'utf8');
require('./shell-assets.cjs').inspect(root);
function load(html){const c=vm.createContext({window:{},console});for(const m of html.matchAll(/<script src="([^"]+)"/g)){if(m[1]==='js/main.js')continue;assert(!/^(?:\w+:|\/\/)/.test(m[1]));vm.runInContext(fs.readFileSync(path.join(root,m[1]),'utf8'),c,{filename:m[1]});}return c;}
function dom(html){const matches=[...html.matchAll(/<script type="application\/json" id="shining-farce-shipping-data">([\s\S]*?)<\/script>/g)];return{querySelectorAll:()=>matches.map(m=>({tagName:'SCRIPT',getAttribute:()=> 'application/json',hasAttribute:()=>false,textContent:m[1]})),documentElement:{outerHTML:html.replace(/^<!doctype html>\s*/i,'')}};}
const c=load(source),run=text=>vm.runInContext(text,c);c.pageSource=source;
run('const G=window.GBTRPG;const fixture=G.debug.authoringPersistenceFixture();');
const files=run('G.editor.ShippingPage.files(fixture,pageSource)'),html=files.find(f=>f.path==='index.html').text,expected=run('fixture.portable()');
assert(files.every(f=>/\.(html|json|txt)$/.test(f.path)));
assert(!html.includes('src="js/data/authored-content.js"')&&!html.includes('src="js/data/maps/'));
const before=[...source.matchAll(/<script src="([^"]+)"/g)].map(m=>m[1]),after=[...html.matchAll(/<script src="([^"]+)"/g)].map(m=>m[1]);assert.deepEqual(after,before);
const installed=load(html);installed.document=dom(html);
assert.equal(vm.runInContext('const G=window.GBTRPG;G.editor.ShippingPage.start(document);const game=new G.core.Game({},{});game.resetCurrent();G.editor.AuthoredFiles.json(game.authoredContent)',installed),expected);
assert.equal(vm.runInContext('G.editor.ShippingPage.page(new G.editor.EditorDocument(game.campaign,game.authoredContent))',installed),'<!doctype html>\n'+html.replace(/^<!doctype html>\s*/i,''));
const registry=installed.window.GBTRPG.data.AUTHORED_MAPS;
const tests=vm.runInContext('G.debug.runFoundationTests()',installed);
assert(tests.every(t=>t.pass),JSON.stringify(tests.filter(t=>!t.pass)));
assert.equal(installed.window.GBTRPG.data.AUTHORED_MAPS,registry,'UI rule checks replaced installed source');
assert.equal(vm.runInContext('G.editor.AuthoredFiles.json(game.authoredContent)',installed),expected);
for(const f of files.filter(f=>f.path.endsWith('.json'))){c.portable=f.text;run('const draft=new G.editor.EditorDocument(G.campaign.createDemo());draft.import(portable);'.replace('const draft','var draft'));}
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'sf-windows-shipping-'));
fs.writeFileSync(path.join(temp,'shipping.zip'),run('G.editor.EditorFiles.zip(G.editor.ShippingPage.files(fixture,pageSource))'));
fs.writeFileSync(path.join(temp,'expected-files.json'),JSON.stringify(files));
fs.writeFileSync(path.join(temp,'index.html'),html);
fs.writeFileSync(path.join(temp,'expected-data.json'),expected);
console.log(JSON.stringify({packageFiles:files.map(f=>f.path),executableScriptAssets:0,generatedPageRoundTrip:'passed',installedPageRuleChecks:tests.length,installedSourcePreserved:true,portableImports:'passed',artifactDirectory:temp,browserVerified:false,explorerVerified:false},null,2));
