(function(G){
 "use strict";
 const V=G.campaign.Validation;
 class BattleMapState {
  constructor(deps){Object.assign(this,deps);const f=deps.fixture||G.data.BattleFoundationFixture.create();this.map=f.map;this.battle=new G.states.BattleState(f.scenario);this.controller=new G.systems.BattleController(this.battle,this.map,{balance:f.balance,...(this.map.testOnly?{rounding:Math.ceil,seed:77,selectSpell:eligible=>eligible[0].id}:{}),...deps.rules});this.board=new G.rendering.BattleMapRenderer(this);this.sceneRenderer=new G.rendering.BattleSceneRenderer(this);this.mode="map";this.timelineOffset=0;this.selectControlled(this.controller.advance());}
  selectControlled(id){if(id){this.id=id;this.cursor={...this.battle.state.positions[id]};}else this.cursor=this.cursor||{x:0,y:0};}
  show(title,items){this.title=title;this.list=new G.ui.SelectableList(items,18);this.mode="list";}
  context(){return this.controller.context(this.battle.state,this.id);}
  menu(){const s=this.battle.state,u=s.units[this.id],t=s.turns[this.id];if(u.tactical.escapeRequired){return this.show("ESCAPE REQUIRED",G.systems.FlyingSystem.destinations(s,this.id,this.context()).map(p=>({label:"ESCAPE "+p.x+","+p.y,run:()=>{this.controller.control(this.id);this.battle.escape(this.id,p,this.context());this.cursor={...p};this.mode="map";}})));}
   const commands=this.battle.commands(this.id),allowed=c=>commands.find(x=>x.command===c)?.allowed;
   this.show(u.name+" / ACTION",[
    {label:"MOVE TO CURSOR",run:()=>{this.controller.move(this.id,this.cursor);this.mode="map";}},
    ...(allowed("ATTACK")?[{label:"ATTACK",run:()=>{const target=G.systems.PortalSystem.occupant(s,this.cursor);this.controller.action(this.id,"ATTACK",target?.id,this.map.testOnly?G.data.BattleFoundationFixture.attack:this.rules?.attack);this.mode="map";}}]:[]),
    ...(allowed("MAGIC")?[{label:"MAGIC",run:()=>this.families()}]:[]),
    ...commands.filter(x=>["SKILLS","STEAL","ITEM","SCROUNGE"].includes(x.command)&&x.allowed).map(x=>({label:x.command,run:()=>this.show(x.command,[{label:"RULES UNRESOLVED",run:()=>{throw Error("UNRESOLVED "+x.command+" EFFECT / BALANCE");}}])})),
    ...(allowed("EQUIP")?[{label:"EQUIP",run:()=>this.equipment()}]:[]),
    ...(allowed("TRADE")?[{label:"TRADE",run:()=>this.tradeMenu()}]:[]),
    ...(G.systems.PortalSystem.availability(s,this.id).allowed?[{label:"ENTER PORTAL",run:()=>{this.controller.control(this.id);this.battle.enterPortal(this.id);this.cursor={...this.battle.state.positions[this.id]};this.mode="map";}}]:[]),
    ...commands.filter(x=>x.implementation==="DEFERRED"&&x.allowed).map(x=>({label:x.command,run:()=>{throw Error(x.reason);}})),
    {label:"END TURN",run:()=>{this.selectControlled(this.controller.endTurn());this.mode="map";}},
    {label:"RETURN",run:()=>this.onReturn()}
   ]);
  }
  equipment(){const s=this.battle.state,u=s.units[this.id],items=Object.values(s.itemInstances).filter(i=>i.place.type==="UNIT"&&i.place.id===this.id&&G.data.ITEMS[i.definitionId]?.equipmentSlot).map(i=>i.id);this.show("EQUIP",items.map(itemId=>({label:itemId,run:()=>{this.controller.control(this.id);this.battle.equip(this.id,itemId,s.itemInstances[itemId].state==="EQUIPPED");this.mode="map";}})));}
  tradeMenu(){const s=this.battle.state,id=this.id,Trade=G.systems.TradeSystem,label=itemId=>itemId?G.data.ITEMS[s.itemInstances[itemId].definitionId].name:"EMPTY SLOT";this.show("TRADE / PARTNER",Trade.targets(s,id,s.positions).map(u=>({label:u.name,run:()=>this.show("YOUR SLOT",Trade.slots(s,id).map(own=>({label:label(own),run:()=>this.show("PARTNER SLOT",Trade.slots(s,u.id).map(other=>({label:label(other),run:()=>{this.controller.control(id);this.battle.trade(id,u.id,own,other);this.mode="map";}})))})))})));}

  families(){const group=this.battle.commands(this.id).find(c=>c.command==="MAGIC");this.show("MAGIC",(group?.families||[]).map(f=>({label:f.name,run:()=>this.show(f.name,f.levels.filter(e=>e.allowed).map(e=>({label:e.name,run:()=>this.methods(e.abilityId)})))})));}
  methods(id){this.spellId=id;const u=this.battle.state.units[this.id],spell=G.systems.MagicSystem.definition(id,this.controller.options.balance),options=G.systems.SpellMenuSystem.castingOptions(u,{abilityId:id},()=>G.systems.MagicSystem.methods(u,spell));if(!options.length)return this.target(null);this.show("CASTING METHOD",options.map(o=>({label:o.name,run:()=>this.target(o.id)})));}
  target(method){G.systems.MagicSystem.validateReady(G.systems.MagicSystem.resolve(this.battle.state.units[this.id],this.spellId,method,this.context()));this.method=method;this.ends=[];this.mode="target";}
  confirmTarget(){let target={...this.cursor};if(G.data.SPELLS[this.spellId].effect==="PORTAL"){this.ends.push(target);if(this.ends.length<2)return;target=this.ends;}this.controller.cast(this.id,this.spellId,this.method,target);this.mode="map";}
  counterChoice(){const p=this.battle.state.events.waiting;this.show("SPELL COUNTER / CHOOSE LV1",p.eligibleSpellIds.map(id=>({label:G.data.SPELLS[id].name,run:()=>{this.controller.chooseCounter(id);this.mode="map";}})));}
  ai(){const s=this.battle.state,id=this.id,u=s.units[id],p=s.positions[id],enemies=Object.values(s.units).filter(x=>x.faction!==u.faction&&G.systems.BattleStatusSystem.active(x)),candidates=[];
   if(!this.map.testOnly){V.assert(typeof this.rules?.candidates==="function","UNRESOLVED AI CANDIDATE PROVIDER");candidates.push(...this.rules.candidates(V.freeze(V.clone(s)),id,V.freeze(V.clone(this.map))));}
   if(!s.turns[id].majorUsed)for(const e of enemies)if(G.systems.TargetingSystem.distance(p,s.positions[e.id])===1)candidates.push({command:"ATTACK",targetId:e.id});
   // Only the isolated fixture chooses a nearest-target objective; production weights remain absent.
   if(this.map.testOnly&&!s.turns[id].attacked&&s.turns[id].remainingMov>0&&enemies.length){const distance=q=>Math.min(...enemies.map(e=>G.systems.TargetingSystem.distance(q,s.positions[e.id]))),context=this.context(),destinations=[];const mov=s.turns[id].remainingMov;
    for(let y=Math.max(0,p.y-mov);y<=Math.min(this.map.height-1,p.y+mov);y++)for(let x=Math.max(0,p.x-mov);x<=Math.min(this.map.width-1,p.x+mov);x++){const q={x,y};if(distance(q)<distance(p))destinations.push(q);}destinations.sort((a,b)=>distance(a)-distance(b)||a.y-b.y||a.x-b.x);for(const q of destinations){if(G.systems.PathfindingSystem.find(s,id,q,context)){candidates.push({command:"MOVE",destination:q});break;}}
   }
   candidates.push({command:"END TURN"});const choice=G.systems.AISystem.choose(s,candidates,this.map.testOnly?G.data.BattleFoundationFixture.choose:this.rules?.ai);V.assert(choice.status==="READY",choice.status);const a=choice.action;if(a.command==="ATTACK")this.controller.action(id,"ATTACK",a.targetId,this.map.testOnly?G.data.BattleFoundationFixture.attack:this.rules?.attack);if(a.command==="MOVE"){this.controller.move(id,a.destination);this.cursor={...a.destination};}if(a.command==="MAGIC")this.controller.cast(id,a.spellId,a.method||null,a.target);if(a.command==="ROUTE")this.controller.route(id,a.destination);if(a.command==="END TURN")this.selectControlled(this.controller.endTurn());
  }
  update(ms=0){const input=this.input.consumeAction();try{this.controller.update(ms);const s=this.battle.state;if(s.events.waiting){if(this.mode!=="list")this.counterChoice();}else if(this.controller.busy)return;
    if(s.presentation.phase==="MAP_RETURN")return;if(s.presentation.phase==="BANNER"){if(input==="confirm"||input==="cancel")this.onReturn();return;}
    if(this.mode==="error"){if(input)this.mode=s.events.waiting?"map":"map";return;}
    if(this.mode==="list"){if(input==="up"||input==="down")this.list.move(input==="up"?-1:1);if(input==="confirm")this.list.selected?.run();if(input==="cancel"&&!s.events.waiting)this.mode="map";return;}
    if(!G.systems.BattleStatusSystem.active(s.units[this.id])){this.selectControlled(this.controller.endTurn());return;}
    if(s.units[this.id]?.faction!=="PLAYER"){this.ai();return;}
    const d={up:[0,-1],right:[1,0],down:[0,1],left:[-1,0]}[input];if(d){this.cursor.x=Math.max(0,Math.min(this.map.width-1,this.cursor.x+d[0]));this.cursor.y=Math.max(0,Math.min(this.map.height-1,this.cursor.y+d[1]));}
    if(input==="select")this.timelineOffset=(this.timelineOffset+19>=this.controller.forecast().length?0:this.timelineOffset+19);if(input==="confirm")this.mode==="target"?this.confirmTarget():this.menu();if(input==="cancel"){if(this.mode==="target")this.mode="map";else this.onReturn();}
   }catch(e){this.error=e.message;this.mode="error";}}
  render(){if(this.mode==="error"){this.renderer.clear();this.ui.page(this.renderer.ctx,"COMMAND REJECTED",this.text.wrap(this.error,70),0);return;}if(this.battle.state.events.waiting||this.mode==="list"){this.renderer.clear();this.ui.list(this.renderer.ctx,this.title,this.list,"Z SELECT  X BACK");return;}if(this.controller.scene){this.sceneRenderer.draw(this.controller.scene);return;}let targeting=null;if(this.mode==="target"){const cast=G.systems.MagicSystem.resolve(this.battle.state.units[this.id],this.spellId,this.method,this.context());G.systems.MagicSystem.validateReady(cast);targeting={range:G.systems.TargetingSystem.targetTiles(this.battle.state.positions[this.id],cast.castingRange,this.context().inBounds),area:G.systems.TargetingSystem.affectedTiles(this.cursor,cast.effectRadius)};}this.board.draw(this.battle.state,this.map,this.cursor,this.controller.forecast(),this.timelineOffset,targeting);if(this.mode==="target")this.text.draw(this.renderer.ctx,"SELECT "+G.data.SPELLS[this.spellId].name,8,324,65);if(this.battle.state.presentation.phase==="MAP_RETURN")this.battle.mapRendered();}
 }
 G.states.BattleMapState=BattleMapState;
}(window.GBTRPG));
