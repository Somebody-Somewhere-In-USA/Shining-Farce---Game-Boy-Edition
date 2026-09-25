// Optional offline developer QA. Supply a path to an existing @napi-rs/canvas package.
// This does not launch a browser or claim to verify file:// browser security behavior.
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const { createCanvas, loadImage } = require(process.argv[2] || '@napi-rs/canvas');
const root = path.resolve(__dirname, '..'), outputArg=process.argv.find(a=>a.startsWith('--output=')), out = outputArg?path.resolve(outputArg.slice(9)):path.join(root, 'verification');
fs.mkdirSync(out, { recursive: true });
const canvas = createCanvas(480, 360); canvas.style = {};
const context = vm.createContext({ window: { innerWidth: 1000, innerHeight: 800, addEventListener() {} }, console, canvas });
const scripts = [...fs.readFileSync(path.join(root, 'index.html'), 'utf8').matchAll(/<script src="([^"]+)"/g)].map(m => m[1]);
const evaluate = source => vm.runInContext(source, context);
for (const file of scripts.filter(f => f !== 'js/main.js')) vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context, { filename: file });
vm.runInContext('window.GBTRPG.editor.ShippingPage.install("null")',context);
context.launcherSource=fs.readFileSync(path.join(root,'index.html'),'utf8');
vm.runInContext('window.GBTRPG.editor.ShippingPage.start({querySelectorAll:()=>[],documentElement:{outerHTML:launcherSource.replace(/<!doctype html>/i,"")}})',context);
const G = context.window.GBTRPG;
function assert(value, message) { if (!value) throw new Error(message); }
function verifyPixels(target, allowed, label) {
  const data = target.getContext('2d').getImageData(0, 0, target.width, target.height).data;
  const seen = new Set();
  for (let i = 0; i < data.length; i += 4) {
    if (data[i+3] === 0) continue;
    assert(data[i+3] === 255, label + ': partially transparent pixel');
    const color = '#' + Array.from(data.slice(i, i+3)).map(v => v.toString(16).padStart(2,'0')).join('').toUpperCase();
    assert(allowed.has(color), label + ': non-palette pixel ' + color); seen.add(color);
  }
  return seen.size;
}
async function main() {
  const paletteValidation=await require("./verify-palette.cjs").validate(root,require(process.argv[2]||"@napi-rs/canvas"));
  const images = new Map(), shades = new Set(paletteValidation.authorizedColors);
  for (const [id, relative] of Object.entries(G.data.ASSET_MANIFEST)) {
    const image = await loadImage(path.join(root, relative)); images.set(id, image);
    if(['unitAren','unitSwordsman','unitHealer','unitMage','unitCentaur','unitOrc','emptySquad','supplyWagon','mapCursor'].includes(id)) {
      assert(image.width===16&&image.height===16, id+': must be native 16x16');
      const pixels=createCanvas(16,16);pixels.getContext('2d').drawImage(image,0,0);
      const rgba=pixels.getContext('2d').getImageData(0,0,16,16).data;let nativeDetail=false;
      for(let y=0;y<16;y+=2)for(let x=0;x<16;x+=2){const a=(y*16+x)*4;for(const b of [a+4,a+64,a+68])for(let k=0;k<4;k++)if(rgba[a+k]!==rgba[b+k])nativeDetail=true;}
      assert(nativeDetail,id+': appears to be doubled 8px artwork');
    }
    const assetCanvas = createCanvas(image.width, image.height); assetCanvas.getContext('2d').drawImage(image,0,0);
    verifyPixels(assetCanvas, shades, relative);
  }
  context.assets = { getImage(id) { assert(images.has(id), 'Missing image ' + id); return images.get(id); } };
  evaluate(`
    const G = window.GBTRPG;
    const renderer = new G.rendering.Renderer(canvas, assets);
    const text = new G.rendering.PixelTextRenderer(assets);
    const ui = new G.rendering.CampaignUIRenderer(assets, text);
    const input = new G.core.Input();
    const campaign = G.campaign.createDemo();
    let active;
    const screen = new G.states.CampaignMapState({ campaign, renderer, text, ui, input,
      worldRenderer: new G.rendering.WorldMapRenderer(assets, text, ui), openTactical() {},
      openEndDay() { active = new G.states.EndDayState({ campaign, renderer, text, ui, input, onReturn() { active = screen; } }); } });
    active = screen;
  `);
  function snapshot(name) {
    evaluate('active.render()');
    verifyPixels(canvas, shades, name);
    const enlarged = createCanvas(960,720), ctx = enlarged.getContext('2d'); ctx.imageSmoothingEnabled = false; ctx.drawImage(canvas,0,0,960,720);
    fs.writeFileSync(path.join(out, name + '.png'), enlarged.toBuffer('image/png'));
  }
  function key(code) { evaluate(`input.onKeyDown({ code: ${JSON.stringify(code)}, repeat: false, preventDefault() {} }); active.update(0); active.render();`); }
  function choose(label) {
    const labels = evaluate('active.list.items.map(item => item.label)'), target = labels.indexOf(label);
    assert(target >= 0, 'Menu item not found: ' + label);
    let guard = 0; while (evaluate('active.list.index') !== target) { assert(guard++ < labels.length, 'Menu selection failed'); key('ArrowDown'); }
    key('Enter');
  }
  function completePhases() {
    for (let i=0;i<20 && evaluate('campaign.state.phase !== "PLANNING" && !campaign.state.resolution.pendingBattleScenario');i++) evaluate('active.update(600); active.render();');
  }
  if(process.argv.includes('--developer-only')){const result=require('./verify-developer-ui.cjs')({evaluate,snapshot,assert});console.log(result);return;}
  snapshot('campaign-map');
  assert(evaluate('screen.selectedObject().objectId') === 'vanguard', 'Initial squad selection');
  key('KeyQ'); assert(evaluate('screen.selectedObject().objectId') === 'rangers', 'Stack cycling'); snapshot('stack-reserve');
  key('Enter'); snapshot('squad-context'); choose('STATION');
  assert(evaluate('campaign.state.locations.granseal.stationedSquadIds.PLAYER') === 'rangers', 'Station command');
  key('KeyQ'); key('Enter'); choose('MOVE');
  assert(evaluate('screen.mode') === 'routePreview', 'Move context command');
  for(let i=0;i<10;i++) key('ArrowRight'); for(let i=0;i<7;i++) key('ArrowUp');
  assert(evaluate('screen.selectedId') === 'crossroads', 'Spatial destination selection'); snapshot('route-proposed');
  assert(evaluate('campaign.state.orders.vanguard') === undefined && evaluate('campaign.state.day') === 1, 'Preview changed state');
  key('Enter'); snapshot('route-confirmation'); choose('NO / CHANGE'); assert(evaluate('screen.mode') === 'routePreview', 'Reject route confirmation failed');
  key('Enter'); key('Enter'); assert(evaluate('campaign.state.orders.vanguard.plannedRouteIds.length') === 1, 'Route confirmation failed'); snapshot('route-confirmed');
  key('KeyP'); snapshot('campaign-menu'); choose('END DAY'); snapshot('order-lock'); completePhases();
  assert(evaluate('campaign.state.day') === 2 && evaluate('campaign.state.squads.vanguard.currentLocationId') === 'crossroads', 'End Day menu command failed'); snapshot('day-advanced');
  assert(evaluate('campaign.state.locations.crossroads.controller') === 'PLAYER', 'Friendly controller changed');
  key('Enter'); key('Enter'); choose('INFO'); snapshot('location-inspection');
  key('KeyM'); evaluate('screen.focusLocation("fortress", true)'); snapshot('zeon-location');
  key('Enter'); assert(evaluate('screen.list.items.length') === 1, 'ZEON received player commands'); snapshot('zeon-context');
  key('Escape'); evaluate('screen.focusLocation("shrine");screen.camera.set(192,72)');key('Enter'); snapshot('edge-context');
  assert(evaluate('screen.popupBounds.x + screen.popupBounds.width <= 480 && screen.popupBounds.y + screen.popupBounds.height <= 360'), 'Popup outside viewport');
  key('KeyM'); key('KeyM'); choose('DEBUG OFF'); choose('DEBUG TOOLS'); choose('RUN RULE CHECKS'); snapshot('rule-checks');
  key('Escape'); choose('LOAD TEST SCENARIO'); choose('E TWO BATTLES');
  key('Escape'); key('KeyM'); choose('END DAY'); completePhases();
  assert(evaluate('campaign.state.phase') === 'RESOLUTION' && evaluate('campaign.state.resolution.conflicts.length') === 2, 'Multiple battle UI scenario failed'); snapshot('battle-crossing');
  key('KeyM'); snapshot('resolution-inspection'); key('ArrowRight'); snapshot('resolution-inspection-2'); key('Escape');
  choose('TEST PLAYER WIN'); assert(evaluate('campaign.state.day') === 1, 'First battle advanced day'); snapshot('battle-defender');
  choose('TEST PLAYER WIN'); assert(evaluate('campaign.state.day') === 2 && evaluate('campaign.state.lastResolution.battleResults.length') === 2, 'Battle UI resume failed'); snapshot('two-battles-complete');
  key('Enter'); snapshot('post-resolution-map');
  evaluate('campaign.loadDevelopmentScenario("delivery"); active=screen; screen.stack=[]; screen.mode="map"; screen.focusLocation("granseal",true)');
  snapshot('resource-swordsman'); key('Enter');choose('MANAGE');choose('ROSTER');snapshot('roster-order');
  choose('2 SARAH');choose('UP');assert(evaluate('campaign.state.squads.vanguard.unitIds[0]')==='sara','Roster UI reorder');
  key('KeyM');snapshot('resource-healer');
  evaluate('campaign.reorderRoster("vanguard","mc","TOP"); screen.focusLocation("granseal")');
  key('Enter');choose('SHOP');choose('WEAPON');snapshot('shop-items');choose('IRON SWORD 50 G');snapshot('purchase-confirm');
  key('Enter');assert(evaluate('campaign.state.treasuries.PLAYER')===790,'Shop UI purchase');key('KeyM');
  key('Enter');choose('RECRUIT');snapshot('recruitment-pool');key('Enter');snapshot('recruitment-detail');
  const beforeRecruitPreview=evaluate('JSON.stringify(campaign.state)');choose('RACE / STATS');snapshot('recruitment-stats');
  assert(evaluate('JSON.stringify(campaign.state)')===beforeRecruitPreview,'Recruit preview changed state');key('Escape');key('ArrowUp');
  key('Enter');assert(evaluate('Object.values(campaign.state.units).some(u=>u.id.startsWith("recruit"))'),'Recruit UI failed');key('KeyM');
  key('KeyM');choose('INVENTORY');snapshot('unified-inventory');key('Enter');snapshot('inventory-copies');key('KeyM');
  evaluate('campaign.releaseItem("item2");screen.focusLocation("granseal",true)');key('Enter');choose('MANAGE');choose('UNITS / EQUIPMENT');choose('AREN / GRANSEAL');choose('STATUS / GRANSEAL');snapshot('character-stats');key('Escape');choose('EQUIPMENT / PERSONAL');snapshot('equipment-current');
  choose('WEAPON: IRON SWORD');snapshot('equipment-alternatives');choose('STEEL SWORD / GALAM CAPITAL');snapshot('equipment-delivery-confirm');choose('REQUEST DELIVERY');
  assert(evaluate('campaign.state.itemInstances.item2.state')==='IN_TRANSIT','Equipment UI did not create shipment');key('KeyM');
  evaluate('screen.focusLocation("galam");screen.cursor.y+=48;screen.camera.follow(screen.cursor.x,screen.cursor.y)');snapshot('supply-wagon-map');key('Enter');choose('DELIVERY INFO');snapshot('delivery-in-transit');key('KeyM');
  key('KeyM');choose('END DAY');completePhases();snapshot('resource-day-summary');key('Enter');
  key('KeyM');choose('END DAY');completePhases();assert(evaluate('G.campaign.InventorySystem.equipment(campaign.state,"mc").weapon')==='item2','UI delivery failed');snapshot('resource-delivered');key('Enter');
  key('KeyM');choose('DEBUG TOOLS');choose('LOAD TEST SCENARIO');choose('G WAGON INTERCEPTION');key('Escape');key('KeyM');choose('END DAY');completePhases();
  assert(evaluate('Object.keys(campaign.state.shipments).length')===0&&evaluate('campaign.state.lastResolution.battleResults.length')===0,'Interception scenario failed');snapshot('shipment-interception');key('Enter');
  key('KeyM');choose('DEBUG TOOLS');choose('RACES / STAT PREVIEWS');
  const beforeRacePreview=evaluate('JSON.stringify(campaign.state)');
  for(const id of Object.keys(G.data.RACES)){choose(id);snapshot('race-'+id.toLowerCase());key('Escape');}
  assert(evaluate('JSON.stringify(campaign.state)')===beforeRacePreview,'Race previews changed state');
  key('Escape');choose('DEBUG CHARACTER LEVEL UP');choose('AREN LV3');snapshot('character-level-up');
  assert(evaluate('campaign.state.units.mc.characterLevel')===4,'Debug level-up command');
  evaluate('screen.stack=[];screen.resources.classes.unit("mc")');snapshot('class-management');
  choose('PROGRESSION / CLASS CHANGES');snapshot('class-list');choose('KNIGHT CLV1');choose('PROGRESSION / REQUIREMENTS');snapshot('knight-prerequisite');
  assert(!evaluate('G.campaign.ClassProgressionSystem.availability(campaign.state.units.mc,"knight").allowed'),'Knight unlocked without Fighter mastery');
  evaluate('screen.stack=[];screen.resources.classes.discipline("mc","fighter")');choose('CHANGE TO FIGHTER');
  assert(evaluate('campaign.state.units.mc.currentClassId')==='fighter','Class change UI');snapshot('class-changed');
  evaluate('screen.stack=[];screen.resources.classes.discipline("mc","fighter")');choose('DEBUG GRANT CP TO LV 10');
  evaluate('screen.stack=[];screen.resources.classes.abilities("mc","fighter")');snapshot('fighter-ability-list');choose('L1 POWER ATTACK 100 CP');choose('DETAILS / ACTION');snapshot('ability-priced');key('Escape');
  choose('PURCHASE 100 CP');assert(evaluate('campaign.state.units.mc.classProgress.fighter.currentCP')===2600,'Standard ability purchase did not spend exactly 100 CP');
  evaluate('screen.stack=[];screen.resources.classes.ability("mc","movePlusOne")');choose('DEBUG GRANT / NO PURCHASE');
  evaluate('screen.stack=[];screen.resources.classes.loadout("mc")');choose('MOVEMENT: NONE');choose('MOVE +1');
  assert(evaluate('G.campaign.InventorySystem.stats(campaign.state,"mc").mov')===6,'Movement loadout UI');
  evaluate('screen.stack=[];screen.resources.classes.loadout("mc")');choose('SECONDARY: NONE');choose('THIEF');
  evaluate('screen.stack=[];screen.resources.classes.loadout("mc")');snapshot('five-part-loadout');
  evaluate('screen.stack=[];screen.resources.classes.permissions("mc")');snapshot('class-equipment-permissions');
  evaluate('screen.stack=[];screen.resources.classes.tactical("mc")');choose('INSPECT TURN / COMMANDS');snapshot('tactical-command-foundation');key('Escape');choose('DEBUG CONSUME ATTACK');choose('INSPECT TURN / COMMANDS');snapshot('major-action-spent');
  assert(evaluate('campaign.state.day')===2,'Class/loadout management spent campaign time');
  evaluate('screen.stack=[];screen.resources.classes.discipline("mc","archer")');choose('CHANGE TO ARCHER');
  evaluate('screen.stack=[];screen.resources.classes.discipline("mc","archer")');choose('PROGRESSION / REQUIREMENTS');snapshot('archer-progression');
  evaluate('screen.stack=[];screen.resources.classes.discipline("mc","archer")');choose('DEBUG GRANT CP TO LV 10');
  evaluate('screen.stack=[];screen.resources.classes.abilities("mc","archer")');snapshot('archer-abilities');choose('L1 AIMED SHOT 100 CP');choose('PURCHASE 100 CP');
  evaluate('screen.stack=[];screen.resources.classes.tactical("mc")');choose('INSPECT TURN / COMMANDS');snapshot('archer-bow-required');
  assert(evaluate('G.systems.ActionCommandSystem.categories(campaign.state.units.mc,G.systems.TurnSystem.start(5)).find(c=>c.command==="SKILLS").abilities[0].allowed')===false,'Archer shot available without bow');
  evaluate('screen.stack=[];screen.resources.classes.discipline("mc","alchemist")');choose('CHANGE TO ALCHEMIST');
  evaluate('screen.stack=[];screen.resources.classes.discipline("mc","alchemist")');choose('DEBUG GRANT CP TO LV 10');
  evaluate('screen.stack=[];screen.resources.classes.abilities("mc","alchemist")');snapshot('alchemist-abilities');choose('L5 QUICK ITEMS 200 CP');choose('PURCHASE 200 CP');
  evaluate('screen.stack=[];screen.resources.classes.loadout("mc")');choose('SUPPORT: NONE');choose('QUICK ITEMS');
  evaluate('screen.stack=[];screen.resources.classes.tactical("mc")');choose('DEBUG CONSUME ITEM');choose('DEBUG CONSUME ATTACK');
  assert(evaluate('screen.list.items.some(i=>i.label==="DEBUG CONSUME ITEM")'),'Quick Items unavailable after Attack');choose('INSPECT TURN / COMMANDS');snapshot('quick-items-after-attack');
  evaluate('screen.stack=[];screen.resources.classes.tradeInventories("mc","sara")');snapshot('trade-inventory-preview');
  for(const id of ['coveringFire','firingPosition','emergencyMedicine','catalyze','scrounger']){
    evaluate('screen.stack=[];screen.resources.classes.ability("mc",'+JSON.stringify(id)+')');
    choose('DETAILS / '+G.data.ABILITIES[id].category);snapshot(id+'-details');
    assert(evaluate('screen.lines.every(line=>line.length<=G.config.UI.pageColumns)'),'Ability detail text exceeded wrap width');
    key('ArrowRight');snapshot(id+'-details-page2');
  }
  const checkSizes = [[1000,800,2],[960,720,2],[959,719,1],[480,360,1],[200,160,1]];
  for (const [w,h,expected] of checkSizes) {
    evaluate(`window.innerWidth=${w}; window.innerHeight=${h}; renderer.resize();`);
    assert(evaluate('renderer.scale') === expected && canvas.width === 480 && canvas.height === 360, 'integer scaling failed');
  }
  evaluate(`
    const terrain = new G.systems.TerrainSystem(G.data.TERRAIN);
    const tactical = new G.states.ExplorationState({ input, renderer, mapRenderer: new G.rendering.MapRenderer(assets,terrain),
      unitRenderer: new G.rendering.UnitRenderer(assets), movementSystem: new G.systems.MovementSystem(terrain),
      map: G.data.TEST_MAP, hero: new G.entities.Character(G.data.CHARACTERS.hero) });
    tactical.render();
  `);
  verifyPixels(canvas, shades, 'preserved tactical test');
  evaluate('active = tactical'); snapshot('tactical-test');
  key('ArrowLeft');const heroStart=evaluate('[tactical.hero.x,tactical.hero.y]');key('ArrowLeft');
  assert(JSON.stringify(evaluate('[tactical.hero.x,tactical.hero.y]')) === JSON.stringify(heroStart), 'Tactical wall collision');
  key('ArrowRight');assert(evaluate('tactical.hero.x') === heroStart[0]+1, 'Tactical grid movement');
  evaluate('const lab=new G.states.SpellLabState({renderer,assets,text,ui,input,onReturn(){active=screen;}});active=lab');
  snapshot('spell-lab-map');key('Enter');choose('MAGIC');snapshot('magic-families');choose('BLAZE');snapshot('mage-spell-levels');choose('BLAZE 2 / MAGE');snapshot('wizard-casting-methods');choose('EXTEND');
  for(let n=0;n<5;n++)key('ArrowRight');snapshot('spell-range-radius-target');key('Enter');snapshot('spell-animation');
  assert(evaluate('lab.battle.state.presentation.phase')==='ANIMATION','Cast did not enter animation');
  for(let n=0;n<3;n++)evaluate('lab.update(180);lab.render()');
  assert(evaluate('lab.battle.state.units.labEnemy.tactical.hp')===80&&evaluate('lab.battle.state.units.labWizard.tactical.mp')===89,'Modified spell execution resources');snapshot('spell-after-animation');
  key('Enter');choose('END / NEXT OWN TURN');for(let n=0;n<5;n++)key('ArrowLeft');key('Enter');choose('MAGIC');choose('PORTAL');choose('PORTAL / WIZARD');choose('NORMAL');key('Enter');key('ArrowRight');key('ArrowRight');key('ArrowDown');key('ArrowDown');key('Enter');
  for(let n=0;n<3;n++)evaluate('lab.update(180);lab.render()');
  assert(evaluate('lab.battle.state.positions.labWizard.x')===4&&evaluate('lab.battle.state.positions.labWizard.y')===4,'Portal own-tile forced transfer');snapshot('portal-friendly-pair');
  key('Enter');choose('END / NEXT OWN TURN');key('Enter');choose('ENTER PORTAL');assert(evaluate('lab.battle.state.positions.labWizard.x')===2,'Enter Portal command');snapshot('portal-entered');
  // The fixture exposes both allegiances. Place an enemy pair through the same command facade.
  evaluate('lab.battle.cast("labEnemy","portal",null,[{x:7,y:3},{x:8,y:3}],lab.options());lab.animate()');
  for(let n=0;n<3;n++)evaluate('lab.update(180);lab.render()');snapshot('portal-both-allegiances');
  evaluate('lab.cursor={x:7,y:3};lab.elapsed=600');snapshot('portal-pair-highlight');
  evaluate('lab.battle.damage("labEnemy",100,lab.options());lab.animate()');
  for(let n=0;n<3;n++)evaluate('lab.update(180);lab.render()');snapshot('dying-counter-three');
  evaluate('lab.battle.damage("labReserve",100,lab.options());lab.animate()');snapshot('victory-pending-animation');
  assert(evaluate('lab.battle.state.presentation.banner')===null,'Victory appeared before animation completion');
  evaluate('lab.update(180);lab.update(180);lab.update(180)');assert(evaluate('lab.battle.state.presentation.phase')==='MAP_RETURN','Animation did not return to map');snapshot('victory-map-return');
  assert(evaluate('lab.battle.state.presentation.banner')==='VICTORY','Victory banner not queued after map render');snapshot('victory-banner');
  // Prompt 6A: actual player response, timed Flying, compulsory escape and AWOL.
  evaluate('const corrections=new G.states.SpellLabState({renderer,assets,text,ui,input,onReturn(){active=screen;}});active=corrections');
  key('Enter');choose('DEBUG SPELL COUNTER');snapshot('counter-level-one-choice');
  assert(evaluate('corrections.battle.state.pendingCounter.eligibleSpellIds.every(id=>G.data.SPELLS[id].spellLevel===1)'),'Higher level counter offered');
  key('Escape');assert(evaluate('corrections.mode')==='list','Player silently cancelled successful counter');
  choose('FREEZE 1');for(let n=0;n<3;n++)evaluate('corrections.update(180);corrections.render()');snapshot('counter-selected-result');
  assert(evaluate('corrections.battle.state.units.labWizard.tactical.mp')===100&&!evaluate('corrections.battle.state.turns.labWizard.majorUsed'),'Counter spent MP or action');
  key('Enter');choose('DEBUG FLY ESCAPE');for(let n=0;n<3;n++)evaluate('corrections.update(180);corrections.render()');snapshot('fly-source-three');
  for(let n=0;n<3;n++){key('Enter');choose('END / NEXT OWN TURN');}
  assert(evaluate('corrections.battle.state.units.labWizard.tactical.escapeRequired'),'Missing required escape');snapshot('fly-escape-required');
  key('Enter');snapshot('fly-eight-neighbor-escape-menu');choose('ESCAPE TO 1,1');snapshot('fly-escaped-diagonally');
  assert(evaluate('corrections.battle.state.positions.labWizard.x===1&&corrections.battle.state.positions.labWizard.y===1'),'Diagonal escape failed');
  key('Enter');choose('DEBUG FLY STRANDED');for(let n=0;n<3;n++)evaluate('corrections.update(180);corrections.render()');
  for(let n=0;n<3;n++){key('Enter');choose('END / NEXT OWN TURN');}snapshot('fly-expired-awol');
  assert(evaluate('corrections.battle.state.units.labWizard.tactical.life')==='AWOL'&&!evaluate('corrections.battle.state.positions.labWizard'),'AWOL stayed on map');
  evaluate(`const returnDemo=G.campaign.createDemo();returnDemo.loadDevelopmentScenario("defender");let returnSeed=0;while(G.campaign.AwolSystem.outcome(false,G.core.DeterministicRandom.create(returnSeed)).kind!=="ABSENT")returnSeed++;const returnState=returnDemo.snapshot();returnState.awol.seed=returnSeed;const returnCampaign=new G.campaign.Campaign(returnDemo.definitions,returnState);const returnScreen=new G.states.CampaignMapState({campaign:returnCampaign,renderer,text,ui,input,worldRenderer:new G.rendering.WorldMapRenderer(assets,text,ui)});returnCampaign.endDay();const returnPending=returnCampaign.state.resolution.pendingBattleScenario;returnCampaign.applyBattleResult({...G.campaign.PlaceholderBattleResolver.result(returnPending,"ZEON"),awolUnitIds:["mc"]});active=returnScreen;while(returnCampaign.state.units.mc.status==="AWOL")returnCampaign.endDay();active.update();`);
  snapshot('awol-wilderness-return-message');assert(evaluate('returnScreen.lines.join(" ").includes("RETURNED FROM THE WILDERNESS")'),'Missing named return message');

  // Prompt 7: real BattleMapState input and scene frames, rendered through the same classic scripts.
  evaluate('const battleFixture=G.data.BattleFoundationFixture.create();battleFixture.scenario.participants[0].units[0].basePrimary.agi=90;const foundation=new G.states.BattleMapState({fixture:battleFixture,renderer,assets,text,ui,input,onReturn(){active=screen;}});active=foundation;');
  assert(evaluate('foundation.id')==='labWizard','Battle first CT control');snapshot('battle-map-480');
  evaluate('foundation.battle.command(s=>{s.positions.labWizard={x:10,y:10};s.positions.labEnemy={x:11,y:10};s.positions.labCleric={x:9,y:10};s.positions.labReserve={x:20,y:20};});foundation.cursor={x:11,y:10};');
  key('Enter');snapshot('battle-action-menu');choose('ATTACK');snapshot('battle-scene-black');
  evaluate('foundation.update(200)');snapshot('battle-scene-entrance');evaluate('foundation.update(300)');snapshot('battle-scene-adjacent-idle');
  evaluate('foundation.update(1500)');snapshot('battle-scene-adjacent-result');
  for(let n=0;n<8;n++)evaluate('foundation.update(5000);foundation.render()');
  assert(evaluate('foundation.battle.state.units.labEnemy.tactical.hp===80&&!foundation.battle.state.turns.labWizard.ended'),'Attack damage or explicit End Turn');snapshot('battle-map-after-attack');
  // Exercise family/method targeting using the actual UI after a fixture-only fresh turn.
  evaluate('foundation.battle.command(s=>{s.turns.labWizard=G.systems.TurnSystem.start(6);s.positions.labEnemy={x:13,y:10};});foundation.cursor={x:13,y:10};');
  key('Enter');choose('MAGIC');choose('BLAZE');choose('BLAZE 1');choose('NORMAL');snapshot('battle-spell-target');key('Enter');
  for(let n=0;n<8;n++)evaluate('foundation.update(5000);foundation.render()');
  assert(evaluate('foundation.battle.state.units.labEnemy.tactical.hp')===60,'Battle queued spell damage');snapshot('battle-map-after-spell');
  // Capture spatially continuous ranged, same-faction, self and reaction compositions at exact frames.
  evaluate('const sceneTest=new G.systems.BattleSceneSequence(foundation.battle.state,"labWizard",["labEnemy"]);sceneTest.target("labEnemy",{before:{hp:80},after:{hp:60,life:"ALIVE"}});sceneTest.reaction("labCleric","labWizard","PRAYER / SURVIVE WITH 1 HP");sceneTest.finish();const sceneScreen={render(){foundation.sceneRenderer.draw(sceneTest);}};active=sceneScreen;');
  for(const [type,name] of [['ACTION','battle-scene-ranged-actor'],['WHIP_PAN','battle-scene-whip-pan'],['EFFECT','battle-scene-ranged-effect'],['REACTION','battle-scene-prayer']]){context.frameType=type;evaluate('sceneTest.index=sceneTest.frames.findIndex(f=>f.type===frameType);sceneTest.elapsed=Math.floor(sceneTest.current().duration/2)');snapshot(name);}
  evaluate('const friendScene=new G.systems.BattleSceneSequence(foundation.battle.state,"labWizard",["labCleric"]);friendScene.target("labCleric",{after:{hp:100,life:"ALIVE"}});friendScene.index=friendScene.frames.findIndex(f=>f.type==="EFFECT");active={render(){foundation.sceneRenderer.draw(friendScene);}};');snapshot('battle-scene-friendly');
  evaluate('const selfScene=new G.systems.BattleSceneSequence(foundation.battle.state,"labWizard",["labWizard"]);selfScene.target("labWizard",{after:{hp:100,life:"ALIVE"}});selfScene.index=selfScene.frames.findIndex(f=>f.type==="EFFECT");active={render(){foundation.sceneRenderer.draw(selfScene);}};');snapshot('battle-scene-self');
  evaluate('active=foundation;foundation.mode="map";foundation.battle.command(s=>{s.turns.labWizard=G.systems.TurnSystem.start(6);s.units.labEnemy.tactical.hp=1;s.units.labReserve.tactical.life="AWOL";delete s.positions.labReserve;});foundation.controller.cast("labWizard","blaze1",null,{x:13,y:10});');
  for(let n=0;n<8;n++)evaluate('foundation.update(5000);foundation.render()');
  assert(evaluate('foundation.battle.state.presentation.banner')==='VICTORY','Queued scene victory banner');snapshot('battle-foundation-victory');
  const developerPresentation=require("./verify-developer-ui.cjs")({evaluate,snapshot,assert});
  const results = G.debug.runFoundationTests();
  assert(results.every(r=>r.pass), 'Rule harness failed');
  const summary = { ruleChecks: results.length, ruleFailures: results.filter(r=>!r.pass), externalAssetsChecked: images.size,
    paletteValidation, developerPresentation, assetAndFramebufferPalette: 'exactly four authorized shades; no partial alpha', logicalSize: [canvas.width, canvas.height],
    battleFoundationPresentation: 'passed: 30x30 scrolling map, CT portraits, command menu, explicit End Turn, queued spells, adjacent/ranged/friendly/self/Prayer scenes, palette fades, victory return',
    characterPresentation: 'passed: unit status, stable recruit stats preview/purchase, seven race previews, debug level-up; pure preview reads',
    classPresentation:'passed: prerequisites, class changing, CP debug grant, final ability prices and normal purchase, explicit debug learning, five-part loadout, equipment permissions, Skills ownership and bow availability, Archer/Alchemist pages, Quick Items plus Attack, Trade inventory preview and Major Action inspection',
    resizeCases: checkSizes, strategicTileSize: G.config.WORLD_TILE_SIZE, nativeStrategicArt: '16px assets with detail beyond doubled 8px pixels', inputAndMenus: 'passed: spatial cursor, stack cycling, stationing, roster reorder, shops, recruitment, inventory, equipment delivery, wagon interception, End Day, two sequential battles, tactical movement/collision', spellPresentation:'passed: family/level/method/target flow, modified MP/damage, Portal forced and voluntary transfer, both allegiance PNGs, selected pair highlight, visible Dying counter, animation -> map -> victory banner; player Lv1 counter selection, timed Fly, required diagonal escape, AWOL removal and campaign return message', browserFileLaunch: 'NOT VERIFIED: Prompt 6 direct file:// attempt was rejected by browser URL policy; no workaround used',
    screenshots: 'Offline Canvas2D renders, not browser screenshots' };
  fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify(summary,null,2) + '\n');
  console.log(JSON.stringify(summary,null,2));
}
main().catch(error => { console.error(error); process.exitCode = 1; });
