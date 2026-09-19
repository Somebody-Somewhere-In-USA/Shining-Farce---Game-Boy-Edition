(function (G) {
  "use strict";
  const V=G.campaign.Validation;
  function squadFor(s,id){return Object.values(s.squads).find(q=>q.unitIds.includes(id))||null;}
  function location(s,id){return squadFor(s,id)?.currentLocationId ?? s.units[id]?.unassignedLocationId ?? null;}
  function make(id,typeId,faction,locationId,level=1,name=null,options={}){
    const d=G.data.UNIT_TYPES[typeId];V.assert(d,"unknown unit type");
    const progression=options.progression?G.campaign.CharacterGrowthSystem.copyProgression(options.progression):G.campaign.CharacterGrowthSystem.simulateRecruitGrowth({
      raceId:options.raceId||G.data.CAMPAIGN_CHARACTERS[id]?.raceId||d.raceId,
      currentClassId:d.classId,characterLevel:level,seed:options.seed??G.core.DeterministicRandom.seedFromId(id),allocations:options.allocations
    },options.classProvider);
    return {id,name:name||d.name,typeId,faction,status:"ACTIVE",unassignedLocationId:locationId,...progression};
  }
  function upgrade(s){
    for(const [id,u] of Object.entries(s.units)) {
      const q=squadFor(s,id), character=G.data.CAMPAIGN_CHARACTERS[id];
      if(u.characterLevel!==undefined)continue;
      const old={...u};
      Object.assign(u,{...make(id,u.typeId||character?.typeId || (id.startsWith("orc")?"orc":"swordsman"),q?.faction||"PLAYER",q?null:"granseal",u.level??3,character?.name||u.name),...old});
      delete u.level;
    }
  }
  function setMembers(s,id,ids,events){
    const q=s.squads[id];V.assert(q,"unknown squad");V.assert(ids.length<=12,"squad exceeds 12 units");
    V.assert(new Set(ids).size===ids.length,"unit belongs to multiple squads or duplicated");
    for(const unitId of ids){
      const u=s.units[unitId];V.assert(u,"unknown unit "+unitId);const old=squadFor(s,unitId);
      V.assert(!old||old.id===id,"unit belongs to multiple squads");
      V.assert(u.faction===q.faction&&u.status==="ACTIVE","unit faction/status ineligible");
      V.assert(location(s,unitId)===q.currentLocationId&&!s.travelerOrders?.["unit_"+unitId],"unit must physically reach squad first");
    }
    for(const unitId of q.unitIds) if(!ids.includes(unitId))s.units[unitId].unassignedLocationId=q.currentLocationId;
    q.unitIds=[...ids];for(const unitId of ids)s.units[unitId].unassignedLocationId=null;
    events.push({type:"SQUAD_MEMBERS_CHANGED",squadId:id,unitIds:[...ids]});
  }
  function reorder(s,id,unitId,delta,events){
    const q=s.squads[id];V.assert(q?.faction==="PLAYER","PLAYER squad required");
    const ids=[...q.unitIds],from=ids.indexOf(unitId);V.assert(from>=0,"unit not in roster");
    V.assert([-1,1,"TOP"].includes(delta),"invalid reorder action");const to=delta==="TOP"?0:Math.max(0,Math.min(ids.length-1,from+delta));
    ids.splice(from,1);ids.splice(to,0,unitId);setMembers(s,id,ids,events);
  }
  function transfer(s,unitId,toId,events){
    const u=s.units[unitId],to=s.squads[toId],from=squadFor(s,unitId);
    V.assert(u?.faction==="PLAYER"&&to?.faction==="PLAYER","PLAYER units/squads required");
    V.assert(from?.id!==toId&&to.unitIds.length<12,"destination already contains unit or exceeds 12");
    V.assert(location(s,unitId)===to.currentLocationId&&!s.travelerOrders["unit_"+unitId],"unit must physically reach squad first");
    if(from)setMembers(s,from.id,from.unitIds.filter(id=>id!==unitId),events);
    setMembers(s,toId,[...to.unitIds,unitId],events);
  }
  function sprite(s,q){const id=q.unitIds[0],u=s.units[id];return u ? G.data.CAMPAIGN_CHARACTERS[id]?.strategicSpriteId||G.data.UNIT_TYPES[u.typeId].strategicSpriteId : "emptySquad";}
  G.campaign.UnitManagementSystem={squadFor,location,make,upgrade,setMembers,reorder,transfer,sprite};
}(window.GBTRPG));
