(function (G) {
  "use strict";
  G.debug.runMapTests = function () {
    const results = [], P = G.ui.MapPresentation;
    const check = (value, message = "check failed") => { if (!value) throw new Error(message); };
    const test = (name, run) => { try { run(); results.push({name,pass:true}); } catch(e) { results.push({name,pass:false,error:e.message}); } };
    const screen = () => new G.states.CampaignMapState({campaign:G.campaign.createDemo(),input:new G.core.Input(),text:{wrap:(s)=>[s]}});
    const act = (s,a) => { s.input.enqueueAction(a); s.update(); };
    test("STRATEGIC VIEWPORT AND TILE DATA", () => {
      check(G.config.INTERNAL_WIDTH === 480 && G.config.INTERNAL_HEIGHT === 360 && G.config.WORLD_TILE_SIZE === 16);
      const w = G.data.WORLD_VISUALS; check(w.rows.length === w.height && w.width*16 > 320 && w.height*16 > 240);
      check(w.rows.every(r => r.length === w.width && [...r].every(v => w.tiles[v] !== undefined)));
      check(Object.values(G.data.WORLD.locations).every(l => l.mapPosition.x%16 === 0 && l.mapPosition.y%16 === 0));
    });
    test("CAMERA BOUNDS AND TRANSFORMS", () => {
      const c = new G.rendering.WorldCamera(512,320); c.set(-20,-20); check(c.x===0&&c.y===0);
      c.follow(504,312); check(c.x===32&&c.y===8);
      const p=c.worldToScreen(448,256), q=c.screenToWorld(p.x,p.y); check(q.x===448&&q.y===256&&p.y===264);
      c.set(20.6,21.3); check(c.x===21&&c.y===8);
      const small=new G.rendering.WorldCamera(80,80);small.follow(72,72);check(small.x===0&&small.y===0);
    });
    test("DERIVED SQUADS AND STACK PRIORITY", () => {
      const c=G.campaign.createDemo(), before=JSON.stringify(c.state), objects=P.derive(c);
      const mc=objects.find(o=>o.objectId==='vanguard'), ranger=objects.find(o=>o.objectId==='rangers'), z=objects.find(o=>o.objectId==='zeonGuard');
      check(mc.spriteId==='unitAren'&&mc.hasMC&&ranger.spriteId==='unitSwordsman'&&z.spriteId==='unitOrc');
      check(mc.stationed&&mc.drawSprite&&!ranger.drawSprite&&mc.stackCount===1);
      check(P.atCell(objects,mc.worldX,mc.worldY).map(o=>o.objectId).join(',')==='vanguard,rangers');
      mc.worldX=500;check(JSON.stringify(c.state)===before && c.state.squads.vanguard.currentLocationId==='granseal');
      c.stationSquad('granseal','rangers');check(P.atCell(P.derive(c),176,288)[0].objectId==='rangers');
    });
    test("VISIBILITY POLICY AND APPROXIMATE REPORT", () => {
      const c=G.campaign.createDemo();check(!P.derive(c,()=>({visibility:'hidden'})).some(o=>o.objectId==='zeonGuard'));
      const report=P.derive(c,()=>({visibility:'reported',locationId:'port'})).find(o=>o.objectId==='zeonGuard');
      check(report.objectType==='report'&&report.locationId==='port'&&report.name==='ZEON REPORT'&&report.spriteId==='reportedSquad');
      check(P.commands(c,report).map(o=>o.id).join() === 'reportInfo');
      check(!P.derive(c,()=>({visibility:'reported'})).some(o=>o.objectId==='zeonGuard'));
    });
    test("SPATIAL CURSOR AND STACK CYCLING ARE PURE", () => {
      const s=screen(), before=JSON.stringify(s.campaign.state); check(s.selectedObject().objectId==='vanguard');
      act(s,'select');check(s.selectedObject().objectId==='rangers');
      act(s,'left');check(s.cursor.x===160&&s.selectedObject()===null);act(s,'left');check(s.selectedObject().objectType==='location');
      for(let i=0;i<80;i++)act(s,'right');check(s.cursor.x===1008&&s.camera.x===544);
      for(let i=0;i<80;i++)act(s,'down');check(s.cursor.y===624&&s.camera.y===328);
      check(JSON.stringify(s.campaign.state)===before);
    });
    test("CONTEXT MENU CAPTURES DIRECTIONAL INPUT", () => {
      const s=screen();act(s,'confirm');check(s.mode==='context'&&s.list.selected.label==='MOVE');
      const before=JSON.stringify([s.cursor,s.camera.x,s.camera.y,s.campaign.state]);
      act(s,'down');act(s,'left');act(s,'right');check(s.list.selected.label==='STATUS');
      check(JSON.stringify([s.cursor,s.camera.x,s.camera.y,s.campaign.state])===before);
      act(s,'cancel');check(s.mode==='map');
    });
    test("CONTEXT BOUNDS FLIP AND CLAMP", () => {
      const items=['MOVE','STATUS','CANCEL ROUTE','ROUTE','STATION'].map(label=>({label}));
      for(const anchor of [{x:0,y:0},{x:472,y:352},{x:240,y:352},{x:-8,y:-8}]) {
        const b=P.menuBounds(anchor,'VANGUARD',items);check(b.x>=0&&b.y>=0&&b.x+b.width<=480&&b.y+b.height<=360);
        if(anchor.x===472)check(b.x<anchor.x);
      }
    });
    test("COMMAND AVAILABILITY AND PHASE GUARDS", () => {
      const c=G.campaign.createDemo(), objects=P.derive(c), mc=objects.find(o=>o.objectId==='vanguard'), ranger=objects.find(o=>o.objectId==='rangers'), z=objects.find(o=>o.objectId==='zeonGuard');
      check(P.commands(c,mc).map(o=>o.id).join() === 'move,squadInfo,manage');
      check(P.commands(c,ranger).some(o=>o.id==='station')&&P.commands(c,z).map(o=>o.id).join()==='squadInfo');
      c.queueMovement('vanguard','galam');check(P.commands(c,mc).some(o=>o.id==='cancelRoute'));
      c.startEndDay();check(P.commands(c,mc).map(o=>o.id).join()==='squadInfo');
      const before=JSON.stringify(c.state);try {c.queueMovement('vanguard','grove');}catch(e){} check(JSON.stringify(c.state)===before);
    });
    test("SPATIAL ROUTE PREVIEW CANCEL AND COMMIT", () => {
      const s=screen(), c=s.campaign, before=JSON.stringify(c.state);act(s,'confirm');act(s,'confirm');
      check(s.mode==='routePreview'&&s.cursor.x===128);
      for(let i=0;i<10;i++)act(s,'right');for(let i=0;i<7;i++)act(s,'up');
      check(s.selectedId==='crossroads'&&s.path.routeIds.join()==='westRoad'&&JSON.stringify(c.state)===before);
      act(s,'confirm');act(s,'cancel');check(s.mode==='routePreview'&&JSON.stringify(c.state)===before);
      act(s,'confirm');act(s,'confirm');check(s.mode==='map'&&c.state.orders.vanguard.destinationLocationId==='crossroads'&&c.state.day===1&&c.state.squads.vanguard.currentLocationId==='granseal');
      s.focusLocation('granseal',true);act(s,'confirm');act(s,'confirm');act(s,'cancel');check(c.state.orders.vanguard.destinationLocationId==='crossroads');
    });
    test("ACTION INPUT SOURCES AND REPEAT", () => {
      const input=new G.core.Input();input.onKeyDown({code:'ArrowRight',repeat:true,preventDefault(){}});check(input.consumeAction()==='right');
      input.onKeyDown({code:'Enter',repeat:true,preventDefault(){}});check(input.consumeAction()===null);
      for(const a of ['up','down','left','right','confirm','cancel','menu','start','select']){input.enqueueAction(a);check(input.consumeAction()===a);}
      input.onKeyDown({code:'KeyQ',repeat:false,preventDefault(){}});check(input.consumeAction()==='select');
    });
    for(const [faction,initial,expected] of [['PLAYER','NEUTRAL','NEUTRAL'],['ZEON','NEUTRAL','ZEON'],['PLAYER','ZEON','PLAYER'],['ZEON','PLAYER','ZEON']]) {
      test(faction+' ARRIVAL INTO '+initial, () => {
        const c=G.campaign.createDemo(), id=faction==='PLAYER'?'vanguard':'zeonGuard', dest=faction==='PLAYER'?'crossroads':'shrine';
        c.setController(dest,initial);const politics=JSON.stringify(c.state.polities);
        if(faction==='PLAYER')c.queueMovement(id,dest);else c.queueZeonDemoMovement(id,dest);
        c.startEndDay();const restored=new G.campaign.Campaign(c.definitions,JSON.parse(JSON.stringify(c.state)));restored.resumeResolution();
        check(restored.state.locations[dest].controller===expected&&restored.state.squads[id].currentLocationId===dest&&restored.state.day===2);
        check(JSON.stringify(restored.state.polities)===politics);restored.validate();
        new G.campaign.Campaign(c.definitions,JSON.parse(JSON.stringify(restored.state))).validate();
      });
    }
    return results;
  };
}(window.GBTRPG));
