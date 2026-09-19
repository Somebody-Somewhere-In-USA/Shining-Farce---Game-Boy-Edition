(function(G){
  "use strict";
  const V=G.campaign.Validation,T=G.systems.TargetingSystem;
  function at(w,p){return Object.values(w.portals).find(pair=>pair.endpoints.some(e=>T.distance(e,p)===0));}
  function occupant(w,p){return Object.values(w.units).find(u=>u.tactical.life!=="DEAD"&&w.positions[u.id]&&T.distance(w.positions[u.id],p)===0);}
  function place(w,casterId,cast,endpoints,context){
    const caster=w.units[casterId],origin=w.positions[casterId];V.assert(G.systems.BattleStatusSystem.active(caster)&&cast.effect==="PORTAL"&&endpoints.length===2&&T.distance(endpoints[0],endpoints[1])>0,"Portal requires two distinct endpoints");
    for(const p of endpoints){V.assert(Number.isInteger(p.x)&&Number.isInteger(p.y)&&context.inBounds(p.x,p.y)&&T.distance(origin,p)<=cast.castingRange,"Portal endpoint out of range");V.assert(!at(w,p)||at(w,p).casterId===casterId,"Portal endpoint already occupied by another caster Portal");V.assert(occupant(w,p)||context.occupiable(p.x,p.y),"Portal endpoint terrain unoccupiable");}
    const units=endpoints.map(p=>occupant(w,p)),pair={casterId,faction:caster.faction,endpoints:V.clone(endpoints),remaining:3,castingTurn:w.turnNumbers[casterId]};
    // Existing pair disappears only after both new endpoints pass validation.
    w.portals[casterId]=pair;
    for(let n=0;n<2;n++)if(units[n])w.positions[units[n].id]={...endpoints[1-n]};
    return pair;
  }
  function availability(w,id){if(w.units[id]?.tactical.escapeRequired)return{allowed:false,reason:"ESCAPE ILLEGAL TERRAIN FIRST"};const u=w.units[id],p=w.positions[id],pair=p&&at(w,p);if(!u||!G.systems.BattleStatusSystem.canMove(u)||!pair||pair.faction!==u.faction||w.turns[id]?.ended)return{allowed:false,reason:"NO FRIENDLY PORTAL ACCESS"};const destination=pair.endpoints.find(e=>T.distance(e,p)!==0);return{allowed:!occupant(w,destination),reason:occupant(w,destination)?"DESTINATION OCCUPIED":null,destination};}
  function enter(w,id){const a=availability(w,id);V.assert(a.allowed,a.reason);w.positions[id]={...a.destination};return a.destination;}
  function endTurn(w,id){const p=w.portals[id];if(p&&w.turnNumbers[id]>p.castingTurn&&p.lastExpirationTurn!==w.turnNumbers[id]){p.remaining--;p.lastExpirationTurn=w.turnNumbers[id];if(p.remaining===0)delete w.portals[id];}}
  function highlighted(w,pair,cursor,interaction){return !!(cursor&&pair.endpoints.some(p=>T.distance(p,cursor)===0)||interaction?.active&&w.controlledUnitId===interaction.unitId&&w.units[interaction.unitId]?.faction===pair.faction&&w.positions[interaction.unitId]&&pair.endpoints.some(p=>T.distance(p,w.positions[interaction.unitId])===0));}
  G.systems.PortalSystem={at,occupant,place,availability,enter,endTurn,highlighted};
}(window.GBTRPG));
