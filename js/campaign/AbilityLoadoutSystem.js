(function(G){
  "use strict";
  const V=G.campaign.Validation;
  const categories={reactionId:"REACTION",supportId:"SUPPORT",movementId:"MOVEMENT"};
  function defaults(){return{secondaryClassId:null,reactionId:null,supportId:null,movementId:null};}
  function learned(unit,id){return !!unit.learnedAbilityIds?.includes(id);}
  function actions(unit){return Object.values(G.data.ABILITIES).filter(a=>a.category==="ACTION"&&[unit.currentClassId,unit.abilityLoadout?.secondaryClassId].includes(a.classId)&&Number.isInteger(a.level)&&learned(unit,a.id)&&G.campaign.ClassProgressionSystem.progress(unit,a.classId).classLevel>=a.level);}
  function equipped(unit){return Object.keys(categories).map(k=>G.data.ABILITIES[unit.abilityLoadout?.[k]]).filter(Boolean);}
  function effects(unit,handler){if(unit.tactical?.life&&unit.tactical.life!=="ALIVE")return [];return equipped(unit).filter(a=>learned(unit,a.id)&&(!handler||a.effect.handler===handler)).map(a=>a.effect);}
  function set(unit,slot,id){
    V.assert(slot==="secondaryClassId"||Object.hasOwn(categories,slot),"Primary Action follows current class; invalid slot");
    if(id!==null){
      V.assert(V.validId(id),"invalid loadout identifier");
      if(slot==="secondaryClassId")V.assert(id!==unit.currentClassId&&(G.data.CLASSES[id]||Object.hasOwn(unit.classProgress,id)),"invalid Secondary Action class");
      else V.assert(learned(unit,id)&&G.data.ABILITIES[id]?.category===categories[slot],"purchased ability of matching category required");
    }
    unit.abilityLoadout[slot]=id;
  }
  function validate(unit){
    V.assert(Array.isArray(unit.learnedAbilityIds)&&new Set(unit.learnedAbilityIds).size===unit.learnedAbilityIds.length&&unit.learnedAbilityIds.every(id=>G.data.ABILITIES[id]),"invalid purchased abilities");
    V.assert(unit.learnedAbilityIds.every(id=>G.campaign.ClassProgressionSystem.progress(unit,G.data.ABILITIES[id].classId).classLevel>=G.data.ABILITIES[id].level),"learned ability exceeds earned Class Level");
    V.assert(unit.abilityLoadout&&Object.keys(unit.abilityLoadout).sort().join()===Object.keys(defaults()).sort().join(),"invalid ability loadout");
    const copy=V.clone(unit);for(const [slot,id]of Object.entries(unit.abilityLoadout))set(copy,slot,id);
  }
  G.campaign.AbilityLoadoutSystem={defaults,learned,actions,equipped,effects,set,validate};
}(window.GBTRPG));
