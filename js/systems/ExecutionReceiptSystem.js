(function(G){
  "use strict";
  function identity(unit,execution){
    if(execution.abilityId){
      const a=G.data.ABILITIES[execution.abilityId];if(a?.category!=="ACTION"||a.castingModifier)return null;
      G.campaign.Validation.assert(G.campaign.AbilityLoadoutSystem.actions(unit).some(x=>x.id===a.id),"Action Ability not available");
      return{abilityId:a.id,owningClassId:a.classId,accessSource:a.classId===unit.currentClassId?"PRIMARY":"SECONDARY",category:a.category,command:a.command};
    }
    if(!["ATTACK","ITEM","EQUIP","TRADE"].includes(execution.command))return null;
    return{abilityId:null,owningClassId:unit.currentClassId,accessSource:"UNIVERSAL",category:"UNIVERSAL",command:execution.command};
  }
  function normalize(unit,execution){
    const id=identity(unit,execution);if(!id)return null;
    return{...execution,...id,legal:execution.legal===true,executed:execution.executed===true,cancelled:execution.cancelled===true};
  }
  function qualifies(execution){return !!execution&&G.campaign.Validation.validId(execution.executionId)&&execution.legal===true&&execution.executed===true&&execution.cancelled!==true;}
  G.systems.ExecutionReceiptSystem={identity,normalize,qualifies};
}(window.GBTRPG));
