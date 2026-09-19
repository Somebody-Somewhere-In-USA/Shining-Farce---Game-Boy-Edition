(function (G) {
  "use strict";
  function permissions(unit){return [...(G.data.CLASSES[unit.currentClassId]?.equipmentPermissions||[]),...G.campaign.AbilityLoadoutSystem.effects(unit,"equipmentPermission").map(e=>e.grant)];}
  function family(d){return d.equipmentSlot==="armor"?d.armorFamily||d.equipmentFamily:d.weaponFamily||d.equipmentFamily;}
  function matches(grant,d){return (!grant.slot||grant.slot===d.equipmentSlot)&&(!grant.families||grant.families.includes(family(d)))&&(!grant.weights||grant.weights.includes(d.weight))&&(!grant.kinds||grant.kinds.includes(d.equipmentKind))&&(!grant.requireKnownWeight||["LIGHT","MEDIUM","HEAVY"].includes(d.weight))&&(!grant.excludedWeights||!grant.excludedWeights.includes(d.weight))&&(!grant.tags||grant.tags.every(tag=>d.tags?.includes(tag)))&&(!grant.metadata||Object.entries(grant.metadata).every(([k,v])=>d[k]===v));}
  function blocksOffHand(unit,weapon){return weapon?.handsRequired===2||G.campaign.AbilityLoadoutSystem.effects(unit,"twoHanded").some(e=>e.blocksOffHand);}
  function allows(unit, itemDefinition) {
    const race = G.data.RACES[unit?.raceId];
    if (!race || !itemDefinition) return false;
    const forbidden=race.equipmentRestrictions.forbiddenSlots;
    if (forbidden.includes(itemDefinition.equipmentSlot)||(forbidden.includes("weapon")&&itemDefinition.category==="WEAPON")||(forbidden.includes("armor")&&itemDefinition.category==="ARMOR")) return false;
    if (itemDefinition.allowedRaces && !itemDefinition.allowedRaces.includes(unit.raceId)) return false;
    if(itemDefinition.equipmentSlot==="offHand"&&blocksOffHand(unit,null))return false;
    if(!itemDefinition.equipmentSlot||itemDefinition.equipmentSlot==="accessory")return !itemDefinition.allowedClasses||itemDefinition.allowedClasses.includes(unit.currentClassId);
    if(permissions(unit).some(g=>matches(g,itemDefinition)))return true;
    // Preserve prior archetype permissions without inventing weights for old items.
    return !!G.data.CLASSES[unit.currentClassId]?.legacy&&(!itemDefinition.allowedClasses||itemDefinition.allowedClasses.includes(unit.currentClassId))&&itemDefinition.equipmentSlot!=="offHand";
  }
  function withEquipment(unit,definition,equippedDefinitions){return allows(unit,definition)&&!(definition.equipmentSlot==="offHand"&&blocksOffHand(unit,equippedDefinitions.find(d=>d.equipmentSlot==="weapon")))&&!(definition.equipmentSlot==="weapon"&&blocksOffHand(unit,definition)&&equippedDefinitions.some(d=>d.equipmentSlot==="offHand"));}
  // Structural legality is independent of ownership/status, so it also validates saved gear.
  G.campaign.EquipmentEligibility = { allows,permissions,blocksOffHand,withEquipment,matches,family };
}(window.GBTRPG));
