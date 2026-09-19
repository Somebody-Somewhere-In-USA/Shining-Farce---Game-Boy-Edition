(function(G){
  "use strict";
  const V=G.campaign.Validation,B=G.systems.BattleStatusSystem;
  // Optional capability metadata; no production race/class is granted Flying here.
  function sources(u){return [
    ...(G.data.RACES[u.raceId]?.capabilities||[]).filter(x=>x==="FLYING").map(()=>({sourceType:"RACE"})),
    ...(G.data.CLASSES[u.currentClassId]?.capabilities||[]).filter(x=>x==="FLYING").map(()=>({sourceType:"CLASS"})),
    ...(u.tactical?.capabilitySources||[]).filter(x=>x.id==="FLYING"),
    ...(u.tactical?.statuses||[]).filter(x=>x.id==="FLYING")];}
  function grant(u,status,casterId){const t=u.tactical;t.statuses=t.statuses.filter(x=>!(x.id==="FLYING"&&x.sourceType==="SPELL"&&x.sourceKey==="fly"));t.statuses.push({...status,sourceType:"SPELL",sourceKey:"fly",sourceId:casterId,remaining:3});t.escapeRequired=false;}
  function destinations(w,id,terrain){const u=w.units[id],p=w.positions[id];V.assert(typeof terrain.inBounds==="function"&&typeof terrain.occupiable==="function","terrain occupancy provider required for Flying expiration");if(!p)return[];const out=[];for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;const x=p.x+dx,y=p.y+dy;if(terrain.inBounds(x,y)&&terrain.occupiable(x,y,u)&&!G.systems.PortalSystem.occupant(w,{x,y})&&(!terrain.destinationAllowed||terrain.destinationAllowed(x,y,u)))out.push({x,y});}return out;}
  function awol(w,id){const u=w.units[id];u.tactical.life="AWOL";u.tactical.escapeRequired=false;u.tactical.dyingCounter=null;delete w.positions[id];w.turns[id].incapacitated=true;w.turns[id].movementLocked=true;w.turns[id].remainingMov=0;w.turns[id].escapeRequired=false;for(const q of Object.values(w.rosters))q.unitIds=q.unitIds.filter(x=>x!==id);}
  function checkPosition(w,id,terrain){const u=w.units[id],p=w.positions[id];if(!B.active(u)||!p||sources(u).length){u.tactical.escapeRequired=false;w.turns[id].escapeRequired=false;return;}
    V.assert(typeof terrain.inBounds==="function"&&typeof terrain.occupiable==="function","terrain occupancy provider required for Flying expiration");
    if(terrain.inBounds(p.x,p.y)&&terrain.occupiable(p.x,p.y,u)){u.tactical.escapeRequired=false;w.turns[id].escapeRequired=false;return;}
    if(!destinations(w,id,terrain).length){awol(w,id);return;}u.tactical.escapeRequired=true;w.turns[id].escapeRequired=true;
  }
  function endTurn(w,id,terrain){const u=w.units[id],before=sources(u).length;for(const s of u.tactical.statuses)if(s.id==="FLYING"&&s.sourceType==="SPELL"&&s.sourceKey==="fly")s.remaining--;u.tactical.statuses=u.tactical.statuses.filter(s=>!(s.id==="FLYING"&&s.sourceType==="SPELL"&&s.sourceKey==="fly"&&s.remaining<=0));if(before&&!sources(u).length)checkPosition(w,id,terrain);}
  function escape(w,id,target,terrain){const u=w.units[id],turn=w.turns[id];V.assert(u.tactical.escapeRequired&&!turn.ended&&B.canMove(u),"required escape unavailable");V.assert(destinations(w,id,terrain).some(p=>p.x===target.x&&p.y===target.y),"illegal escape destination");w.positions[id]={...target};u.tactical.escapeRequired=false;turn.escapeRequired=false;
    // Position correction has no invented MOV or Major Action price.
  }
  G.systems.FlyingSystem={sources,grant,destinations,awol,checkPosition,endTurn,escape};
}(window.GBTRPG));
