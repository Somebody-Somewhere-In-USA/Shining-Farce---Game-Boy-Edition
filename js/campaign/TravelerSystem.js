(function (G) {
  "use strict";
  const V=G.campaign.Validation,U=G.campaign.UnitManagementSystem,P=G.campaign.TravelerPath;
  // Only public control knowledge by default. An intel adapter can supply observed threats.
  const knowledge = s => ({dangerousLocationIds:Object.keys(s.locations).filter(id=>s.locations[id].controller==="ZEON"),dangerousRouteIds:[]});
  function safeWeight(known){return (r,from,to)=>known.dangerousLocationIds.includes(to)||known.dangerousRouteIds.includes(r.id)?Infinity:r.travelDays??1;}
  function planWagon(d,s,w,known,events){
    if(s.units[w.targetUnitId]?.status==="ACTIVE")w.destinationLocationId=U.location(s,w.targetUnitId);
    const key="wagon_"+w.id,old=s.travelerOrders[key],order=P.make(d,s,w.currentLocationId,w.destinationLocationId,{travelerType:"SUPPLY_WAGON",travelerId:w.id},safeWeight(known));
    if(order)s.travelerOrders[key]=order;else delete s.travelerOrders[key];
    if(JSON.stringify(old?.plannedRouteIds)!==JSON.stringify(order?.plannedRouteIds))events.push({type:"SHIPMENT_REROUTED",shipmentId:w.id,routeIds:order?.plannedRouteIds||[],holding:!order&&w.currentLocationId!==w.destinationLocationId});
  }
  function queueUnit(d,s,id,dest,events){const u=s.units[id];V.assert(u?.faction==="PLAYER"&&u.status==="ACTIVE"&&!U.squadFor(s,id),"active unassigned PLAYER unit required");
    const order=P.make(d,s,u.unassignedLocationId,dest,{travelerType:"LONE_UNIT",travelerId:id});V.assert(order,"no available path or already at destination");s.travelerOrders["unit_"+id]=order;events.push({type:"TRAVELER_ORDER_QUEUED",unitId:id,destinationId:dest});}
  function prepare(d,s,known,events){for(const w of Object.values(s.shipments).sort((a,b)=>a.id.localeCompare(b.id)))planWagon(d,s,w,known,events);}
  function intents(d,s){return Object.keys(s.travelerOrders).sort().map(key=>{const o=s.travelerOrders[key];return P.next(o,{key,travelerType:o.travelerType,travelerId:o.travelerId,faction:"PLAYER"});});}
  const interactionPolicies={SUPPLY_WAGON:"DESTROY_CARGO",LONE_UNIT:"CAPTURE"};
  function outcomes(r){
    const world=r.frozenWorld,resources=r.resourceBefore,orders=Object.fromEntries(r.travelerIntents.map(i=>[i.key,i]));
    const travelers=[...Object.values(resources.shipments).map(w=>({key:"wagon_"+w.id,travelerType:"SUPPLY_WAGON",travelerId:w.id,origin:w.currentLocationId})),
      ...Object.values(world.units).filter(u=>u.faction==="PLAYER"&&u.status==="ACTIVE"&&!U.squadFor(world,u.id)).map(u=>({key:"unit_"+u.id,travelerType:"LONE_UNIT",travelerId:u.id,origin:u.unassignedLocationId}))];
    return travelers.sort((a,b)=>a.key.localeCompare(b.key)).map(t=>{
      const i=orders[t.key],dest=i?.destinationLocationId||t.origin;
      const enemy=Object.values(world.squads).filter(q=>q.faction==="ZEON").sort((a,b)=>a.id.localeCompare(b.id)).find(q=>{
        const z=r.movementIntents.find(i=>i.squadId===q.id),zDest=z?.destinationLocationId||q.currentLocationId;
        return zDest===dest || i&&z&&i.routeId===z.routeId&&i.originLocationId===z.destinationLocationId&&i.destinationLocationId===z.originLocationId;
      });
      return {...t,outcome:enemy?interactionPolicies[t.travelerType]:i?"ARRIVE":"STAY",enemySquadId:enemy?.id||null};
    });
  }
  function commit(s,r,events){
    for(const result of r.travelerOutcomes){const id=result.travelerId,key=result.key,i=r.travelerIntents.find(i=>i.key===key);
      if(result.outcome==="DESTROY_CARGO"){
        const w=s.shipments[id];for(const itemId of w.cargoIds)delete s.itemInstances[itemId];delete s.shipments[id];delete s.travelerOrders[key];
        events.push({type:"SHIPMENT_INTERCEPTED",shipmentId:id,cargoCount:w.cargoIds.length,locationId:i?.destinationLocationId||w.currentLocationId});
      }else if(result.outcome==="CAPTURE"){
        s.units[id].status="CAPTURED";s.units[id].unassignedLocationId=i?.destinationLocationId||result.origin;delete s.travelerOrders[key];
        for(const item of Object.values(s.itemInstances))if(item.place.type==="UNIT"&&item.place.id===id)delete s.itemInstances[item.id];
        events.push({type:"UNIT_INTERCEPTED",unitId:id});
      }else if(result.outcome==="ARRIVE"){
        if(result.travelerType==="SUPPLY_WAGON")s.shipments[id].currentLocationId=i.destinationLocationId;else s.units[id].unassignedLocationId=i.destinationLocationId;
        if(i.remainingOrder)s.travelerOrders[key]=V.clone(i.remainingOrder);else delete s.travelerOrders[key];
        events.push({type:"TRAVELER_MOVED",travelerId:id,travelerType:result.travelerType,locationId:i.destinationLocationId});
      }
    }
  }
  function deliver(s,events){let count=0;for(const w of Object.values(s.shipments).sort((a,b)=>a.id.localeCompare(b.id))){
    if(w.currentLocationId!==w.destinationLocationId)continue;
    const active=s.units[w.targetUnitId]?.status==="ACTIVE";
    if(active&&U.location(s,w.targetUnitId)!==w.currentLocationId)continue; // Replan next day from the new frozen unit position.
    for(const id of [...w.cargoIds]){
      const item=s.itemInstances[id];item.state="AVAILABLE";item.place={type:"LOCATION",id:w.currentLocationId};item.assignedUnitId=null;
      const personalFull=!G.data.ITEMS[item.definitionId].equipmentSlot&&!G.campaign.InventorySystem.canAcquire(s,w.targetUnitId);
      if(active&&!personalFull&&G.campaign.InventorySystem.eligible(s,item,w.targetUnitId,true))G.campaign.InventorySystem.equip(s,item,w.targetUnitId,events,true);
    }
    count+=w.cargoIds.length;delete s.travelerOrders["wagon_"+w.id];delete s.shipments[w.id];events.push({type:"SHIPMENT_DELIVERED",shipmentId:w.id,locationId:w.currentLocationId,cargoCount:w.cargoIds.length});
  }return count;}
  G.campaign.TravelerSystem={knowledge,safeWeight,planWagon,queueUnit,prepare,intents,outcomes,commit,deliver,interactionPolicies};
}(window.GBTRPG));
