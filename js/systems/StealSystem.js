(function(G){
  "use strict";
  const V=G.campaign.Validation,I=G.campaign.InventorySystem;
  function eligibility(world,actorId,targetId,abilityId,itemId,turn,context={}){
    const actor=world.units[actorId],target=world.units[targetId],item=world.itemInstances[itemId],a=G.data.ABILITIES[abilityId];
    const no=reason=>({allowed:false,reason});
    if(!actor||!target||actorId===targetId||actor.faction===target.faction)return no("ENEMY TARGET REQUIRED");
    if(a?.effect.handler!=="steal"||!G.campaign.AbilityLoadoutSystem.actions(actor).some(x=>x.id===abilityId))return no("STEAL ABILITY NOT AVAILABLE");
    const major=G.systems.TurnSystem.availability(turn,"STEAL",a);if(!major.allowed)return major;
    if(!item||item.place.type!=="UNIT"||item.place.id!==targetId||item.ownerFaction!==target.faction)return no("TARGET DOES NOT CARRY ITEM");
    const def=G.data.ITEMS[item.definitionId],slot=a.effect.target;
    if(!def||def.stealable===false||context.itemEligible?.(item,def,actor,target)===false)return no("ITEM CANNOT BE STOLEN");
    if(slot==="PERSONAL"?item.state!=="PERSONAL":item.state!=="EQUIPPED"||def.equipmentSlot!==slot)return no("WRONG TARGET ITEM CATEGORY");
    if(context.targetEligible?.(actor,target,a)===false)return no("TARGET NOT IN LEGAL RANGE");
    if(!I.canAcquire(world,actorId)&&!G.campaign.AbilityLoadoutSystem.effects(actor,"disarm").length)return no("PERSONAL INVENTORY FULL");
    return{allowed:true,reason:null};
  }
  function probability(context,calculator=null){
    if(!calculator)return{status:"UNRESOLVED_FORMULA",probability:null};
    let value=calculator(context);if(value===null)return{status:"UNRESOLVED_FORMULA",probability:null};
    for(const e of G.campaign.AbilityLoadoutSystem.effects(context.actor,"stealChance"))value*=e.multiplier;
    V.assert(Number.isFinite(value)&&value>=0,"invalid Steal chance");
    // Only the mathematical probability domain is bounded. No sub-100% game cap is invented.
    return{status:"CALCULATED",probability:Math.min(1,value)};
  }
  function resolveOutcome(world,actorId,targetId,abilityId,itemId,turn,successful,context={}){
    const result=eligibility(world,actorId,targetId,abilityId,itemId,turn,context);V.assert(result.allowed,result.reason);V.assert(typeof successful==="boolean","resolved success boolean required");
    const a=G.data.ABILITIES[abilityId],item=world.itemInstances[itemId];let outcome="FAILED";
    if(successful){
      if(I.canAcquire(world,actorId)){item.state="PERSONAL";item.place={type:"UNIT",id:actorId};item.ownerFaction=world.units[actorId].faction;item.assignedUnitId=null;outcome="STOLEN";}
      else if(item.state==="EQUIPPED"){item.state="PERSONAL";outcome="DISARMED";}
      else outcome="NO_TRANSFER"; // Full inventory + carried target: nothing equipped to disarm.
    }
    G.systems.TurnSystem.consume(turn,"STEAL",a);
    return{abilityId,owningClassId:a.classId,outcome,successful,meaningful:["STOLEN","DISARMED"].includes(outcome),damage:0,doubleAttack:false};
  }
  G.systems.StealSystem={eligibility,probability,resolveOutcome};
}(window.GBTRPG));
