// Exercises shipped developer screens through logical input on the offline Canvas2D renderer.
module.exports=function({evaluate,snapshot,assert}){
 evaluate(`
  const editorGame=new G.core.Game(canvas,{});editorGame.assets=assets;editorGame.renderer=renderer;editorGame.text=text;editorGame.ui=ui;editorGame.input=new G.core.Input(null,new G.core.LocalStore('offline.',null));editorGame.resetCurrent();editorGame.developer=new G.editor.DeveloperShell(editorGame);
  const shell=editorGame.developer;active={render(){if(shell.overlay||shell.terminal)shell.render();else editorGame.states.render();}};
 `);
 const action=a=>evaluate(`editorGame.input.enqueueAction(${JSON.stringify(a)});if(!shell.update(16))editorGame.states.update(16);`);
 const choose=label=>{const labels=evaluate('shell.overlay.items().map(f=>f.label)'),n=labels.indexOf(label);assert(n>=0,'Missing developer option: '+label);evaluate(`shell.overlay.index=${n}`);action('confirm');};
 const type=line=>{for(const k of line)evaluate(`editorGame.input.onKeyDown({code:'Key'+${JSON.stringify(k)}.toUpperCase(),key:${JSON.stringify(k)},preventDefault(){}})`);evaluate("editorGame.input.onKeyDown({code:'Enter',key:'Enter',preventDefault(){}})");};
 action('devmenu');assert(evaluate('shell.overlay===null'),'Dev menu leaked while disabled');
 action('terminal');type('devmode');snapshot('developer-terminal');action('terminal');
 action('devmenu');snapshot('developer-campaign-menu');choose('EDIT CAMPAIGN MAP');
 evaluate('const terrainEditor=shell.overlay;terrainEditor.cursor={x:3,y:3}');snapshot('editor-campaign-terrain');action('cancel');choose('CHOOSE TILE');snapshot('editor-campaign-tiles');action('down');action('confirm');action('confirm');
 assert(evaluate('terrainEditor.doc.data.visuals.rows[3][3]')==='w','Editor paint did not apply');
 action('menu');choose('RESIZE MAP');snapshot('editor-resize-fields');action('down');action('confirm');action('up');snapshot('editor-number-focused');action('cancel');choose('APPLY RESIZE');
 assert(evaluate('terrainEditor.map().height')===41,'Campaign resize did not apply');snapshot('editor-campaign-resized');
 action('menu');choose('EXIT EDITOR / KEEP WORKING DRAFT');choose('EDIT LOCATIONS');
 evaluate('const locationsEditor=shell.overlay;locationsEditor.cursor={x:0,y:0}');action('cancel');choose('CREATE LOCATION');action('confirm');
 assert(evaluate('shell.overlay.title.startsWith("LOCATION /")'),'New location did not open shared properties');snapshot('editor-location-new');choose('SETTLEMENT');snapshot('editor-location-settlement');choose('SHOPS');snapshot('editor-shops');choose('DEFAULT / SHARED TIER');action('up');action('confirm');choose('INDIVIDUAL TIERS');snapshot('editor-shop-tiers');action('cancel');action('cancel');choose('RECRUITMENT');choose('ALLOWED RACES');snapshot('editor-recruitment-races');action('confirm');action('cancel');choose('ALLOWED CLASSES');snapshot('editor-recruitment-classes');action('cancel');action('cancel');
 choose('CONNECT / DISCONNECT LOCATIONS');evaluate('locationsEditor.cursor={x:locationsEditor.doc.data.world.locations.granseal.mapPosition.x/16,y:locationsEditor.doc.data.world.locations.granseal.mapPosition.y/16}');action('confirm');snapshot('editor-connected-route');action('cancel');
 evaluate('locationsEditor.location(locationsEditor.doc.at(0,0).id)');choose('BATTLE MAPS');choose('CREATE NEW BATTLE MAP');snapshot('editor-battle-new-properties');choose('CREATE / FILL OCEAN');
 evaluate('const battleEditor=shell.overlay');snapshot('editor-battle-ocean');action('cancel');choose('CHOOSE TILE');snapshot('editor-battle-tile-picker');action('select');action('start');action('confirm');action('confirm');
 action('menu');choose('VALIDATE BATTLE MAP');snapshot('editor-battle-invalid');action('cancel');
 // Author a non-contiguous test map through the same document commands, then use the menus.
 evaluate(`battleEditor.doc.battle(battleEditor.mapId,m=>{m.tiles=m.tiles.map(row=>row.map(()=>"grassland"));for(const side of m.approaches)for(const group of ['FRONT','BACK'])m.deployment[side].positions[group]=Array.from({length:6},(_,n)=>({x:2+n*3,y:(side==='NORTH'?2:25)+(group==='FRONT'?1:0)}));});battleEditor.cursor={x:8,y:3};`);
 snapshot('editor-battle-deployment');action('menu');choose('SPECIAL DEPLOYMENT');action('confirm');snapshot('editor-special-unit');choose('FACTION');action('up');action('confirm');choose('ACTIVATE SPECIAL PLACEMENT TOOL');evaluate('battleEditor.cursor={x:20,y:20}');action('confirm');assert(evaluate('battleEditor.map().specialDeployments.length')===1,'Special placement failed');snapshot('editor-special-placed');
 action('menu');choose('VALIDATE BATTLE MAP');assert(evaluate('shell.overlay.title')==='MAP VALID','Authored battle should validate');snapshot('editor-battle-valid');action('cancel');action('menu');choose('PREVIEW NORMAL BATTLE MAP');snapshot('editor-battle-preview');action('cancel');
 action('menu');choose('SAVE / IMPORT / EXPORT');snapshot('editor-files');choose('SAVE WORKING COPY IN THIS BROWSER');snapshot('editor-storage-unavailable');action('cancel');choose('HOW TO SHIP AUTHORED CONTENT');snapshot('editor-shipping-workflow');
 evaluate('shell.close();shell.controls()');snapshot('options-controls');choose('KEYBOARD ASSIGNMENTS');snapshot('options-keyboard');action('confirm');evaluate("editorGame.input.onKeyDown({code:'Enter',key:'Enter',preventDefault(){}})");assert(evaluate('shell.overlay.title.startsWith("USED BY CONFIRM")'),'Key conflict warning missing');snapshot('options-binding-conflict');choose('YES / CONFIRM');assert(evaluate('editorGame.input.actionFor("keyboard","Enter")')==='up','Confirmed remap failed');
 evaluate('editorGame.input.restoreDefaults();shell.controls()');choose('CONTROLLER BUTTON ASSIGNMENTS');snapshot('options-controller');
 evaluate('shell.close();G.core.DeveloperRuntime.reset();active=editorGame.campaignMap');snapshot('campaign-four-colors');
 return 'passed: Terminal, contextual Dev Menu, keyboard conflict reassignment, controller mappings, field focus/cancel, terrain copy/paint, resize, locations, shops, recruitment, connections, Ocean map creation, variants, authored deployment, special unit, validation, normal renderer preview, storage failure and shipping instructions';
};
