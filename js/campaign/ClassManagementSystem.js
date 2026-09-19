(function(G){
  "use strict";
  const V=G.campaign.Validation;
  function reconcile(s,id){
    // Changes keep every copy with its physical owner; capacity overflow is retained.
    const unit=s.units[id];
    for(const item of Object.values(s.itemInstances))if(item.place.type==="UNIT"&&item.place.id===id&&item.state==="EQUIPPED"&&!G.campaign.EquipmentEligibility.allows(unit,G.data.ITEMS[item.definitionId]))item.state="PERSONAL";
    const gear=G.campaign.InventorySystem.equipment(s,id);
    if(gear.offHand&&G.campaign.EquipmentEligibility.blocksOffHand(unit,gear.weapon?G.data.ITEMS[s.itemInstances[gear.weapon].definitionId]:null))s.itemInstances[gear.offHand].state="PERSONAL";
    for(const item of Object.values(s.itemInstances))if(item.assignedUnitId===id&&!G.campaign.EquipmentEligibility.allows(unit,G.data.ITEMS[item.definitionId]))G.campaign.InventorySystem.release(s,item.id,[]);
  }
  function change(s,id,classId,events){const unit=s.units[id];V.assert(unit?.faction==="PLAYER"&&unit.status==="ACTIVE","active PLAYER character required");const result=G.campaign.ClassProgressionSystem.availability(unit,classId);V.assert(result.allowed,result.reason);G.campaign.ClassEntryGrantSystem.access(unit,classId);unit.currentClassId=classId;if(unit.abilityLoadout.secondaryClassId===classId)unit.abilityLoadout.secondaryClassId=null;reconcile(s,id);events.push({type:"CLASS_CHANGED",unitId:id,classId});}
  function loadout(s,id,slot,abilityId,events){const unit=s.units[id];V.assert(unit?.faction==="PLAYER"&&unit.status==="ACTIVE","active PLAYER character required");G.campaign.AbilityLoadoutSystem.set(unit,slot,abilityId);if(slot==="secondaryClassId"&&abilityId)G.campaign.ClassEntryGrantSystem.access(unit,abilityId);reconcile(s,id);events.push({type:"ABILITY_LOADOUT_CHANGED",unitId:id,slot,abilityId});}
  G.campaign.ClassManagementSystem={change,loadout,reconcile};
}(window.GBTRPG));
