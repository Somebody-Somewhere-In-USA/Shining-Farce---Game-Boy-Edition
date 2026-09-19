(function(G){
  "use strict";
  const V=G.campaign.Validation,I=G.campaign.InventorySystem;
  function change(world,unitId,itemId,unequip,turn){
    const unit=world.units[unitId],item=world.itemInstances[itemId],def=G.data.ITEMS[item?.definitionId];
    V.assert(unit&&item&&item.place.type==="UNIT"&&item.place.id===unitId&&item.ownerFaction===unit.faction&&def?.equipmentSlot,"unit-carried equipment required");
    const result=G.systems.TurnSystem.availability(turn,"EQUIP");V.assert(result.allowed,result.reason);
    if(unequip)V.assert(item.state==="EQUIPPED","item not equipped");
    else V.assert(item.state==="PERSONAL"&&G.campaign.EquipmentEligibility.withEquipment(unit,def,I.equipmentDefinitions(world,unitId)),"item cannot be equipped");
    // One chosen item per command. Replaced equipment remains carried, even in overflow.
    if(!unequip){const old=I.equipment(world,unitId)[def.equipmentSlot];if(old)world.itemInstances[old].state="PERSONAL";}
    item.state=unequip?"PERSONAL":"EQUIPPED";
    G.systems.TurnSystem.consume(turn,"EQUIP");
    return{itemId,unitId,state:item.state};
  }
  G.systems.TacticalEquipmentSystem={change};
}(window.GBTRPG));
