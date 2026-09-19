(function(G){
  "use strict";
  const V=G.campaign.Validation,I=G.campaign.InventorySystem;
  function targets(world,actorId,positions){const p=positions[actorId];return p&&G.systems.BattleStatusSystem.active(world.units[actorId])?Object.values(world.units).filter(u=>G.systems.BattleStatusSystem.active(u)&&u.id!==actorId&&u.faction===world.units[actorId].faction&&positions[u.id]&&Math.abs(p.x-positions[u.id].x)+Math.abs(p.y-positions[u.id].y)===1):[];}
  function slots(world,unitId){const items=I.personal(world,unitId).map(i=>i.id);return [...items,...Array(Math.max(0,I.capacity(world,unitId)-items.length)).fill(null)];}
  function plan(world,actorId,targetId,actorItemId,targetItemId,positions,turn){
    V.assert(!turn.ended&&targets(world,actorId,positions).some(u=>u.id===targetId),"adjacent friendly Trade target required");
    for(const [unitId,itemId]of [[actorId,actorItemId],[targetId,targetItemId]])V.assert(slots(world,unitId).includes(itemId),"invalid carried Trade slot");
    if(actorItemId===null&&targetItemId===null)return{status:"NO_TRANSACTION"};
    return{status:"READY",actorId,targetId,actorItemId,targetItemId,majorAction:false};
  }
  function execute(world,actorId,targetId,actorItemId,targetItemId,positions,turn,policy={tradeMajorAction:false}){
    const p=plan(world,actorId,targetId,actorItemId,targetItemId,positions,turn);if(p.status==="NO_TRANSACTION")return p;
    policy={tradeMajorAction:false,...policy};
    const available=G.systems.TurnSystem.availability(turn,"TRADE",null,policy);V.assert(available.allowed,available.reason);
    if(actorItemId!==null)world.itemInstances[actorItemId].place.id=targetId;
    if(targetItemId!==null)world.itemInstances[targetItemId].place.id=actorId;
    G.systems.TurnSystem.consume(turn,"TRADE",null,policy);return{...p,status:"TRADED",majorAction:policy.tradeMajorAction};
  }
  G.systems.TradeSystem={targets,slots,plan,execute};
}(window.GBTRPG));
