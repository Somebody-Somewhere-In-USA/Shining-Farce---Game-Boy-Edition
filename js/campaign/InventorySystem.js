(function (G) {
  "use strict";
  const V=G.campaign.Validation,U=G.campaign.UnitManagementSystem;
  function location(s,item){return item.place.type==="LOCATION"?item.place.id:item.place.type==="UNIT"?U.location(s,item.place.id):s.shipments[item.place.id]?.currentLocationId;}
  function equipment(s,unitId){return Object.fromEntries(Object.values(s.itemInstances).filter(i=>i.state==="EQUIPPED"&&i.place.id===unitId).map(i=>[G.data.ITEMS[i.definitionId].equipmentSlot,i.id]));}
  function personal(s,unitId){return Object.values(s.itemInstances).filter(i=>i.state==="PERSONAL"&&i.place.type==="UNIT"&&i.place.id===unitId);}
  function capacity(s,unitId){return G.campaign.AbilityModifierSystem.capacity(s.units[unitId]);}
  function canAcquire(s,unitId){return personal(s,unitId).length<capacity(s,unitId);}
  function equipmentDefinitions(s,unitId){return Object.values(equipment(s,unitId)).map(id=>G.data.ITEMS[s.itemInstances[id].definitionId]);}
  function stats(s,unitId){return G.campaign.CharacterStatsSystem.deriveStats(s.units[unitId],Object.values(equipment(s,unitId)).map(id=>G.data.ITEMS[s.itemInstances[id].definitionId]),{effects:s.units[unitId].tactical?.statuses||[]});}
  function eligible(s,item,unitId,legacyDelivery=false){const u=s.units[unitId],d=G.data.ITEMS[item?.definitionId];return !!(u?.status==="ACTIVE"&&u.faction==="PLAYER"&&item?.ownerFaction==="PLAYER"&&d&&(G.campaign.EquipmentEligibility.withEquipment(u,d,equipmentDefinitions(s,unitId))||legacyDelivery&&u.currentClassId==="mage"&&s.legacyEquipment?.[item.id]===unitId));}
  function equip(s,item,unitId,events,legacyDelivery=false){
    V.assert(eligible(s,item,unitId,legacyDelivery)&&location(s,item)===U.location(s,unitId),"item must physically reach eligible unit");
    const d=G.data.ITEMS[item.definitionId],here=U.location(s,unitId);
    if(d.equipmentSlot){const old=equipment(s,unitId)[d.equipmentSlot];if(old){s.itemInstances[old].state="AVAILABLE";s.itemInstances[old].place={type:"LOCATION",id:here};}}
    else V.assert(canAcquire(s,unitId),"personal inventory full");
    item.state=d.equipmentSlot?"EQUIPPED":"PERSONAL";item.place={type:"UNIT",id:unitId};item.assignedUnitId=null;events.push({type:"ITEM_EQUIPPED",itemId:item.id,unitId,slot:d.equipmentSlot});
  }
  function assign(d,s,itemId,unitId,known,events){
    const item=s.itemInstances[itemId];V.assert(item?.state==="AVAILABLE"&&eligible(s,item,unitId),"item unavailable or incompatible");
    const origin=location(s,item),dest=U.location(s,unitId),def=G.data.ITEMS[item.definitionId];
    V.assert(!Object.values(s.itemInstances).some(i=>i.assignedUnitId===unitId&&def.equipmentSlot&&G.data.ITEMS[i.definitionId].equipmentSlot===def.equipmentSlot),"replacement already assigned for this slot");
    if(origin===dest){equip(s,item,unitId,events);return null;}
    V.assert(G.campaign.WorldPathfindingSystem.find(d,s,origin,dest),"no available delivery path");
    let wagon=Object.values(s.shipments).find(w=>w.currentLocationId===origin&&w.targetUnitId===unitId);
    if(!wagon){const id="wagon"+s.nextShipmentId++;wagon=s.shipments[id]={id,faction:"PLAYER",currentLocationId:origin,destinationLocationId:dest,targetUnitId:unitId,cargoIds:[]};G.campaign.TravelerSystem.planWagon(d,s,wagon,known,events);events.push({type:"SHIPMENT_CREATED",shipmentId:id,originId:origin,destinationId:dest});}
    wagon.cargoIds.push(itemId);item.place={type:"SHIPMENT",id:wagon.id};item.state="IN_TRANSIT";item.assignedUnitId=unitId;
    events.push({type:"ITEM_ASSIGNED",itemId,unitId,shipmentId:wagon.id});return wagon.id;
  }
  function release(s,itemId,events){const i=s.itemInstances[itemId];V.assert(i?.ownerFaction==="PLAYER","owned item required");const here=location(s,i);if(i.place.type==="SHIPMENT"){
    const w=s.shipments[i.place.id];w.cargoIds=w.cargoIds.filter(id=>id!==itemId);if(!w.cargoIds.length){delete s.travelerOrders["wagon_"+w.id];delete s.shipments[w.id];}
  }i.state="AVAILABLE";i.place={type:"LOCATION",id:here};i.assignedUnitId=null;events.push({type:"ITEM_RELEASED",itemId,locationId:here});}
  function aggregate(s){const groups={};for(const i of Object.values(s.itemInstances).filter(i=>i.ownerFaction==="PLAYER")){
    const g=groups[i.definitionId]||={definitionId:i.definitionId,count:0,copies:[],distribution:{}};g.count++;g.copies.push(i.id);
    const key=i.state==="AVAILABLE"?location(s,i):i.state;g.distribution[key]=(g.distribution[key]||0)+1;
  }return Object.values(groups).sort((a,b)=>a.definitionId.localeCompare(b.definitionId));}
  G.campaign.InventorySystem={location,equipment,stats,eligible,equip,assign,release,aggregate,personal,capacity,canAcquire,equipmentDefinitions};
}(window.GBTRPG));
