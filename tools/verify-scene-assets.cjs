// Offline Canvas/VM integration. This is not a browser or Windows security acceptance test.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),vm=require('node:vm'),assert=require('node:assert/strict');
const {createCanvas,loadImage}=require(process.argv[2]||'@napi-rs/canvas'),{png}=require('./test-asset-catalog.cjs');
const root=path.resolve(__dirname,'..'),out=fs.mkdtempSync(path.join(os.tmpdir(),'shining-scene-ui-')),canvas=createCanvas(480,360);canvas.style={};
const context=vm.createContext({window:{innerWidth:960,innerHeight:720,addEventListener(){}},console,canvas,setTimeout,clearTimeout});
const run=s=>vm.runInContext(s,context),source=fs.readFileSync(path.join(root,'index.html'),'utf8');
for(const [,file]of source.matchAll(/<script src="([^"]+)"/g))if(file!=='js/main.js')vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file});
async function main(){const G=context.window.GBTRPG,images=new Map();
 for(const [id,file]of Object.entries(G.data.ASSET_MANIFEST))images.set(id,await loadImage(path.join(root,file)));
 context.assets={getImage(id){assert(images.has(id));return images.get(id);}};context.launcher=source;
 run(`G=window.GBTRPG;G.editor.ShippingPage.install('null');G.editor.ShippingPage.start({querySelectorAll:()=>[],documentElement:{outerHTML:launcher.replace(/<!doctype html>/i,'')}});
  const renderer=new G.rendering.Renderer(canvas,assets),text=new G.rendering.PixelTextRenderer(assets),ui=new G.rendering.CampaignUIRenderer(assets,text),game=new G.core.Game(canvas,{});
  Object.assign(game,{assets,renderer,text,ui,input:new G.core.Input(null,new G.core.LocalStore('scene-ui.',null))});game.resetCurrent();
  const shell=new G.editor.DeveloperShell(game);G.core.DeveloperRuntime.devmode=true;shell.document=G.debug.battleSceneAssetFixture();
  let stored; shell.document.store=new G.core.LocalStore('scene-ui.',{setItem:(k,v)=>stored=v,getItem:()=>stored});
  G.data.ASSET_CATALOG=G.debug.battleSceneTestCatalog();const browser=new G.editor.AssetBrowser(shell);const beforeCampaign=JSON.stringify(game.campaign.state);
 `);
 const originalCatalog=G.data.ASSET_CATALOG;
 for(const e of originalCatalog.entries){const picture=await loadImage(png(e.width,e.height,{pixel:e.category==='units'?[48,98,48,255]:[139,172,15,255]}));run('browser').images.images.set(e.id,picture);}
 const action=a=>run(`game.input.enqueueAction(${JSON.stringify(a)});shell.update(16);`);
 const choose=label=>{const list=run('shell.overlay.items().map(f=>f.label)'),i=list.indexOf(label);assert(i>=0,'Missing '+label);run(`shell.overlay.index=${i}`);action('confirm');assert(!run('shell.overlay.error'),'UI error '+run('shell.overlay.error'));};
 let frames=0;
 const snap=name=>{run('shell.render()');const rgba=canvas.getContext('2d').getImageData(0,0,480,360).data,allowed=new Set(['155,188,15','139,172,15','48,98,48','15,56,15']);for(let i=0;i<rgba.length;i+=4){assert.equal(rgba[i+3],255,name+' alpha');assert(allowed.has([...rgba.slice(i,i+3)].join(',')),name+' illegal pixel');}fs.writeFileSync(path.join(out,name+'.png'),canvas.toBuffer('image/png'));frames++;};
 run('browser.menu()');snap('asset-tools');choose('ASSET BROWSER / SEARCH ALL');snap('asset-browser');choose('SEARCH');
 for(const key of 'zeon')run(`game.input.onKeyDown({code:'KeyZ',key:${JSON.stringify(key)},preventDefault(){}})`);run("game.input.onKeyDown({code:'Enter',key:'Enter',preventDefault(){}})");
 assert(run('shell.overlay.items().filter(f=>f.label.startsWith("OK units:")).length')===2);snap('asset-search');choose('OK units:zeon-human-fighter-idle-1 / asset');snap('asset-detail');choose('PIXEL PREVIEW');snap('asset-pixels');action('cancel');choose('CREATE ANIMATION FROM THIS SEQUENCE');snap('animation-editor');
 const animationId=run('Object.keys(browser.doc.data.battleScene.animations).at(-1)');choose('FRAME 1 / 100 MS / units:zeon-human-fighter-idle-1');choose('DURATION MS');action('up');action('confirm');assert.equal(run(`browser.doc.data.battleScene.animations.${animationId}.frames[0].ms`),101);choose('MOVE LATER');assert.equal(run(`browser.doc.data.battleScene.animations.${animationId}.frames[1].ms`),101);snap('animation-reordered');choose('LOOP');choose('FINAL FRAME');action('up');action('confirm');choose('PREVIEW / RESTART');snap('animation-preview');action('confirm');action('select');snap('animation-inspected-frame');action('menu');action('cancel');choose('SAVE WORKING COPY');assert.equal(run('shell.overlay.title'),'DRAFT SAVED');action('cancel');
 run('browser.unit("fighter")');choose('ATTACK: attack');choose('CHOOSE ANIMATION');snap('context-animation-picker');choose('OK IDLE / idle');choose('USE THIS ANIMATION');assert.equal(run('browser.doc.data.battleScene.units.fighter.attack'),'idle');
 run('browser.terrain("grassland")');choose('BACKGROUND: backgrounds:meadow');choose('CHOOSE ASSET');assert(run('shell.overlay.items().filter(f=>f.label.startsWith("OK ")).every(f=>f.label.includes("backgrounds:"))'));choose('OK backgrounds:meadow / asset');choose('USE THIS ASSET');snap('terrain-associations');
 run('browser.preview({...browser.doc.data.battleScene.animations.fire,kind:"animation",valid:true},()=>browser.menu())');snap('effect-preview');action('cancel');
 run('G.editor.BattleSceneAssets.mutate(browser.doc,p=>p.units.fighter.attack="removed-animation");browser.browse({state:{status:"broken"}})');snap('broken-references');assert(run('shell.overlay.items().some(f=>f.label.includes("removed-animation"))'));
 run('browser.doc.save();const exported=browser.doc.portable();browser.doc.import(exported);browser.doc.restore();');assert.equal(run('browser.doc.data.battleScene.units.fighter.attack'),'removed-animation');
 run('G.editor.BattleSceneAssets.mutate(browser.doc,p=>p.units.fighter.attack="idle");');
 context.availableImage=()=>{const img={};Object.defineProperty(img,'src',{set(src){const e=G.data.ASSET_CATALOG.entries.find(e=>src.startsWith(e.path));img.width=e?.width;img.height=e?.height;queueMicrotask(()=>img.onload());}});return img;};
 await run('G.editor.BattleSceneAssets.verify(browser.doc.data,{createImage:availableImage})');
 run('const page=G.editor.ShippingPage.page(browser.doc);const body=page.match(/id="shining-farce-shipping-data">\\n([\\s\\S]*?)<\\/script>/)[1];const installed=G.editor.ShippingPage.decode(body).assemble(game.campaign);');
 assert(run('JSON.stringify(installed.battleScene)===JSON.stringify(JSON.parse(G.editor.AuthoredFiles.json(browser.doc.data.battleScene)))'));
 assert(run('JSON.stringify(game.campaign.state)===beforeCampaign'));
 // A quarantined file can be inspected but must never request/display illegal pixels.
 run('G.data.ASSET_CATALOG.entries.push({id:"units:bad",category:"units",filename:"bad.png",path:"bad.png",valid:false,errors:["Partial alpha is forbidden"],width:128,height:96});browser.browse({state:{status:"invalid"}})');choose('INVALID units:bad / asset');snap('quarantine-detail');choose('PIXEL PREVIEW');snap('quarantine-safe-placeholder');
 // Simulate native image load failures: no exception, and readiness sees known failures.
 context.Image=class{set src(value){this.onerror();}};
 run('const failedImages=new G.rendering.SceneAssetImages();failedImages.get(G.editor.BattleSceneAssets.asset("backgrounds:meadow"));');await new Promise(setImmediate);assert(run('!G.editor.BattleSceneAssets.readiness(browser.doc.data).valid'));assert(run('G.editor.BattleSceneAssets.resolveTerrain(browser.doc.data,"grassland","grassland","PLAYER").fallback==="generic-background"'));
 console.log(`Passed scene asset UI, real PNG previews, four-color pixels (${frames} frames), search, filtered selectors, per-frame reorder/timing, persistence, shipping, quarantine and image-load fallback. Screenshots: ${out}`);
}
main().catch(e=>{console.error(e);process.exitCode=1;});
