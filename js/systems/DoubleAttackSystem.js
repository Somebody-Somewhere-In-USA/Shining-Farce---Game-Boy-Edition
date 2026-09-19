(function(G){
  "use strict";
  function probability(context,calculator=null,modifierCalculator=null){
    const a=context.abilityId?G.data.ABILITIES[context.abilityId]:null;
    const eligible=context.command!=="STEAL"&&context.attackKind==="NORMAL"&&(a?a.doubleAttackEligible===true:context.command==="ATTACK");
    if(!eligible)return{status:"INELIGIBLE",probability:0};
    if(!calculator)return{status:"UNRESOLVED_FORMULA",probability:null};
    let value=calculator(context);if(value===null)return{status:"UNRESOLVED_FORMULA",probability:null};
    G.campaign.Validation.assert(Number.isFinite(value),"invalid double-attack probability");
    for(const effect of G.campaign.AbilityLoadoutSystem.effects(context.attacker,"doubleAttackChance")){
      if(!modifierCalculator)return{status:"UNRESOLVED_MODIFIER",probability:null};value=modifierCalculator(value,effect,context);
      G.campaign.Validation.assert(Number.isFinite(value),"invalid double-attack modifier");
    }
    return{status:"CALCULATED",probability:Math.min(G.config.CLASSES.doubleAttackCap,Math.max(0,value))};
  }
  G.systems.DoubleAttackSystem={probability};
}(window.GBTRPG));
