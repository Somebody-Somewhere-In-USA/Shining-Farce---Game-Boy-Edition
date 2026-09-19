(function(G){
  "use strict";
  function eligibility(unit,id){
    const a=G.data.ABILITIES[id];if(!a)return{allowed:false,reason:"UNKNOWN ABILITY"};
    if(G.campaign.AbilityLoadoutSystem.learned(unit,id))return{allowed:false,reason:"ALREADY LEARNED"};
    if(!Number.isInteger(a.level))return{allowed:false,reason:"CLASS LEVEL REQUIREMENT TBD"};
    const p=G.campaign.ClassProgressionSystem.progress(unit,a.classId);
    if(p.classLevel<a.level)return{allowed:false,reason:"REQUIRES CLASS LV "+a.level};
    if((a.prerequisiteAbilityIds||[]).some(id=>!unit.learnedAbilityIds.includes(id)))return{allowed:false,reason:"PREREQUISITE ABILITY NOT LEARNED"};
    const cost=G.campaign.AbilityCostSystem.cost(a);
    if(cost===null)return{allowed:false,reason:"PURCHASE COST UNRESOLVED"};
    if(!Number.isSafeInteger(cost)||cost<0)return{allowed:false,reason:"INVALID PURCHASE COST"};
    return{allowed:p.currentCP>=cost,reason:p.currentCP>=cost?null:"INSUFFICIENT CURRENT CP"};
  }
  function purchase(unit,id){const result=eligibility(unit,id);G.campaign.Validation.assert(result.allowed,result.reason);const a=G.data.ABILITIES[id];G.campaign.ClassProgressionSystem.earn(unit,a.classId,0);unit.classProgress[a.classId].currentCP-=G.campaign.AbilityCostSystem.cost(a);unit.learnedAbilityIds.push(id);}
  G.campaign.AbilityLearningSystem={eligibility,purchase};
}(window.GBTRPG));
