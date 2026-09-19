(function (G) {
  "use strict";
  const V=G.campaign.Validation,U=G.campaign.UnitManagementSystem;
  const keys=["awol","legacyEquipment","treasuries","itemInstances","shipments","travelerOrders","recruitPools","recruitment","nextItemId","nextShipmentId","nextUnitId"];
  function capture(s){return V.clone(Object.fromEntries(keys.map(k=>[k,s[k]])));}
  function initialize(d,s){U.upgrade(s);Object.assign(s,{awol:G.campaign.AwolSystem.initial(),legacyEquipment:{},treasuries:{PLAYER:1000,ZEON:500},itemInstances:{},shipments:{},travelerOrders:{},recruitPools:{},recruitment:{seed:12345,nextCandidateId:1,lastRefreshDay:s.day,nextRefreshDay:s.day+7},nextItemId:1,nextShipmentId:1,nextUnitId:1});G.campaign.RecruitmentSystem.generate(d,s,s.day);}
  function defeatedUnits(s,r){for(const [id,outcome]of Object.entries(r.outcomes))if(outcome==="DEFEATED")for(const unitId of r.frozenWorld.squads[id].unitIds){s.units[unitId].unassignedLocationId=r.frozenWorld.squads[id].currentLocationId;s.units[unitId].status="DEFEATED";}}
  function update(d,s,events,classProvider,legacyRouteHolds=[]){const delivered=G.campaign.TravelerSystem.deliver(s,events),income=G.campaign.EconomySystem.collect(d,s,events),refreshed=G.campaign.RecruitmentSystem.refresh(d,s,events,classProvider);G.campaign.AwolSystem.update(d,s,events,legacyRouteHolds);return{delivered,income,refreshed};}
  function validate(d,s){
    G.campaign.AwolSystem.validate(d,s);V.assert(s.legacyEquipment&&typeof s.legacyEquipment==="object"&&!Array.isArray(s.legacyEquipment),"invalid legacy equipment map");for(const [itemId,unitId]of Object.entries(s.legacyEquipment))V.assert(s.itemInstances[itemId]&&s.units[unitId],"invalid legacy equipment reference");
    V.assert(s.treasuries&&Object.keys(s.treasuries).sort().join()==="PLAYER,ZEON","treasuries missing");
    for(const n of Object.values(s.treasuries))V.assert(Number.isSafeInteger(n)&&n>=0,"invalid treasury");
    for(const k of ["nextItemId","nextShipmentId","nextUnitId"])V.assert(Number.isSafeInteger(s[k])&&s[k]>0,"invalid resource counter");
    for (const [collection,prefix,counter] of [[s.itemInstances,"item",s.nextItemId],[s.shipments,"wagon",s.nextShipmentId],[s.units,"recruit",s.nextUnitId]]) {
      for (const id of Object.keys(collection || {})) if (new RegExp("^"+prefix+"[0-9]+$").test(id)) V.assert(Number(id.slice(prefix.length)) < counter,"resource counter would reuse an ID");
    }
    for(const l of Object.values(d.locations)){
      const e=l.economy;V.assert(e&&Number.isSafeInteger(e.dailyIncomeG)&&e.dailyIncomeG>=0,"invalid income definition");
      for(const n of Object.values(e.shops))V.assert(Number.isSafeInteger(n)&&n>=0,"invalid shop tier");
      if(e.recruitment)V.assert(e.recruitment.types.every(id=>G.data.UNIT_TYPES[id])&&Number.isSafeInteger(e.recruitment.count)&&e.recruitment.count>0,"invalid recruitment table");
    }
    for(const l of Object.values(s.locations))V.assert(l.recovery===null||Number.isFinite(l.recovery?.incomeMultiplier)&&l.recovery.incomeMultiplier>=0&&l.recovery.incomeMultiplier<=1,"invalid recovery income multiplier");
    for(const def of Object.values(G.data.ITEMS))V.assert(Number.isSafeInteger(def.priceG)&&def.priceG>=0&&Number.isSafeInteger(def.shopTier)&&def.shopTier>0,"invalid item price/tier");
    for(const u of Object.values(s.units)){
      V.assert(G.data.UNIT_TYPES[u.typeId]&&["PLAYER","ZEON"].includes(u.faction)&&Number.isSafeInteger(u.characterLevel),"invalid unit definition/faction/level");
      G.campaign.CharacterValidation.progression(u);
      V.assert(["ACTIVE","DEFEATED","CAPTURED","DEAD","AWOL"].includes(u.status),"invalid unit status");
      const q=U.squadFor(s,u.id);V.assert(q?u.unassignedLocationId===null&&u.status==="ACTIVE"&&u.faction===q.faction:!!d.locations[u.unassignedLocationId],"unit physical/organizational state contradictory");
      V.assert(!Object.hasOwn(u,"squadId")&&!Object.hasOwn(u,"equipment")&&!Object.hasOwn(u,"inventory"),"duplicate unit ownership authority");
    }
    V.assert(s.itemInstances&&s.shipments&&s.travelerOrders&&s.recruitPools&&s.recruitment,"missing resource state");
    const slots=new Set(),assigned=new Set(),cargo=new Set(),personal={};
    for(const [id,i]of Object.entries(s.itemInstances)){
      const def=G.data.ITEMS[i.definitionId];V.assert(V.validId(id)&&i.id===id&&def&&["PLAYER","ZEON"].includes(i.ownerFaction),"invalid item instance");
      V.assert(Object.keys(i).sort().join()==="assignedUnitId,definitionId,id,ownerFaction,place,state","duplicate item authority");
      V.assert(i.place&&Object.keys(i.place).sort().join()==="id,type","invalid physical place");
      if(i.state==="AVAILABLE")V.assert(i.place.type==="LOCATION"&&d.locations[i.place.id]&&i.assignedUnitId===null,"invalid available item location");
      else if(i.state==="IN_TRANSIT")V.assert(i.place.type==="SHIPMENT"&&s.shipments[i.place.id]?.cargoIds.includes(id)&&i.assignedUnitId===s.shipments[i.place.id].targetUnitId&&s.units[i.assignedUnitId],"invalid shipment assignment");
      else{
        V.assert(["EQUIPPED","PERSONAL"].includes(i.state)&&i.place.type==="UNIT"&&s.units[i.place.id]&&s.units[i.place.id].faction===i.ownerFaction&&i.assignedUnitId===null,"invalid unit item ownership");
        if(i.state==="EQUIPPED"){const key=i.place.id+":"+def.equipmentSlot;V.assert(["weapon","offHand","armor","accessory"].includes(def.equipmentSlot)&&!slots.has(key),"duplicate equipment slot");slots.add(key);V.assert((G.campaign.EquipmentEligibility.allows(s.units[i.place.id],def)||s.legacyEquipment[id]===i.place.id&&s.units[i.place.id].currentClassId==="mage"),"incompatible equipment");}
        else {personal[i.place.id]=(personal[i.place.id]||0)+1;} // Safe overflow retains every carried item.
      }
      if(i.assignedUnitId)V.assert((G.campaign.EquipmentEligibility.allows(s.units[i.assignedUnitId],def)||s.legacyEquipment[id]===i.assignedUnitId&&s.units[i.assignedUnitId].currentClassId==="mage"),"incompatible assigned equipment");
      if(i.assignedUnitId&&def.equipmentSlot){const key=i.assignedUnitId+":"+def.equipmentSlot;V.assert(!assigned.has(key),"duplicate equipment assignment");assigned.add(key);}
    }
    for(const u of Object.values(s.units)){const gear=G.campaign.InventorySystem.equipmentDefinitions(s,u.id);V.assert(!gear.some(d=>d.equipmentSlot==="offHand")||!G.campaign.EquipmentEligibility.blocksOffHand(u,gear.find(d=>d.equipmentSlot==="weapon")),"off-hand conflicts with both hands");}
    for(const [id,w]of Object.entries(s.shipments)){
      V.assert(V.validId(id)&&w.id===id&&w.faction==="PLAYER"&&d.locations[w.currentLocationId]&&d.locations[w.destinationLocationId]&&s.units[w.targetUnitId],"invalid shipment reference");
      V.assert(Object.keys(w).sort().join()==="cargoIds,currentLocationId,destinationLocationId,faction,id,targetUnitId","shipment cannot attach to squad");
      V.assert(Array.isArray(w.cargoIds)&&w.cargoIds.length>0,"empty shipment");
      for(const itemId of w.cargoIds){V.assert(!cargo.has(itemId)&&s.itemInstances[itemId]?.place.type==="SHIPMENT"&&s.itemInstances[itemId].place.id===id,"duplicate or missing shipment cargo");cargo.add(itemId);}
    }
    for(const[key,o]of Object.entries(s.travelerOrders)){
      V.assert(["SUPPLY_WAGON","LONE_UNIT"].includes(o.travelerType),"invalid traveler type");
      const w=o.travelerType==="SUPPLY_WAGON"?s.shipments[o.travelerId]:s.units[o.travelerId];
      V.assert(w&&key===(o.travelerType==="SUPPLY_WAGON"?"wagon_":"unit_")+o.travelerId,"invalid traveler order reference");
      if(o.travelerType==="LONE_UNIT")V.assert(w.faction==="PLAYER"&&w.status==="ACTIVE"&&!U.squadFor(s,w.id),"lone traveler must be unassigned");
      G.campaign.TravelerPath.validate(d,s,o,w.currentLocationId||w.unassignedLocationId);
    }
    const candidates=new Set();for(const[id,pool]of Object.entries(s.recruitPools)){
      V.assert(d.locations[id]?.economy.recruitment&&Array.isArray(pool),"invalid recruit pool");
      for(const c of pool){V.assert(V.validId(c.id)&&!candidates.has(c.id)&&d.locations[id].economy.recruitment.types.includes(c.typeId)&&Number.isSafeInteger(c.costG)&&c.costG>0&&G.core.DeterministicRandom.isSeed(c.seed),"invalid or duplicate candidate");G.campaign.CharacterValidation.progression(c,"candidate");candidates.add(c.id);}
    }
    V.assert(Object.keys(s.recruitPools).sort().join()===Object.keys(d.locations).filter(id=>d.locations[id].economy.recruitment).sort().join(),"recruit pool locations mismatch");
    const r=s.recruitment;V.assert(Number.isSafeInteger(r.seed)&&r.seed>=0&&r.seed<=4294967295&&Number.isSafeInteger(r.nextCandidateId)&&r.nextCandidateId>0&&Number.isSafeInteger(r.lastRefreshDay)&&Number.isSafeInteger(r.nextRefreshDay)&&r.nextRefreshDay===r.lastRefreshDay+G.config.RESOURCES.recruitIntervalDays&&r.lastRefreshDay<=s.day+1,"invalid recruit schedule/seed");
  }
  function validateResolution(d,s,r){
    const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b),f={...V.clone(r.frozenWorld),...V.clone(r.resourceBefore)};
    V.assert(r.resourceBefore&&Array.isArray(r.travelerIntents)&&Array.isArray(r.travelerOutcomes),"missing frozen resource record");
    const built=G.campaign.TravelerSystem.intents(d,f);
    V.assert(equal(r.travelerIntents,s.phase==="ORDER_LOCK"?[]:built),"traveler intents disagree with frozen snapshot");
    const expectedOutcomes=["ORDER_LOCK","MOVEMENT_INTENT"].includes(s.phase)?[]:G.campaign.TravelerSystem.outcomes(r);
    V.assert(equal(expectedOutcomes,r.travelerOutcomes),"traveler outcomes disagree with frozen interactions");
    if(r.movementCommitted){f.squads=V.clone(s.squads);f.locations=V.clone(s.locations);defeatedUnits(f,r);G.campaign.BattleCasualtySystem.apply(f,r);G.campaign.AwolSystem.apply(f,r);G.campaign.TravelerSystem.commit(f,r,[]);}
    if(r.worldUpdated){const legacyRouteHolds=Object.values(s.awol.pending).filter(p=>!p.battleLocationId&&d.routes[p.routeId]&&p.blockedReason==="BATTLE ROUTE POSITION UNRESOLVED").map(p=>p.unitId);const summary=update(d,f,[],r.legacyRecruitGrowth?G.campaign.LegacyRecruitGrowthProvider:undefined,legacyRouteHolds);V.assert(equal(summary,r.resourceSummary),"resource summary mismatch");}
    V.assert(equal(capture(f),capture(s))&&equal(f.units,s.units),"resource state disagrees with resolution replay");
  }
  G.campaign.ResourceSystem={keys,capture,initialize,defeatedUnits,update,validate,validateResolution};
}(window.GBTRPG));
