(function(G){
  "use strict";
  function equipment(unit,ability,definitions=[]){
    const requirements=ability.weaponRequirements;if(!requirements)return{allowed:true,reason:null};
    const selectors=Array.isArray(requirements)?requirements:[requirements];
    const allowed=selectors.every(selector=>definitions.some(d=>G.campaign.EquipmentEligibility.matches(selector,d)&&G.campaign.EquipmentEligibility.withEquipment(unit,d,definitions)));
    return{allowed,reason:allowed?null:"REQUIRED EQUIPMENT NOT EQUIPPED"};
  }
  function action(unit,abilityId,definitions=[]){const a=G.data.ABILITIES[abilityId];if(!a||!G.campaign.AbilityLoadoutSystem.actions(unit).some(a=>a.id===abilityId))return{allowed:false,reason:"ACTION NOT LEARNED OR ACCESSIBLE"};return equipment(unit,a,definitions);}
  G.systems.AbilityRequirementSystem={equipment,action};
}(window.GBTRPG));
