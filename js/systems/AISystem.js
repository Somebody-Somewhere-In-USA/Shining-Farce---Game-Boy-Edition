(function(G){
 "use strict";
 class AISystem {
  static choose(snapshot,candidates,policy){if(typeof policy!=="function")return{status:"UNRESOLVED_AI_POLICY"};const selected=policy(G.campaign.Validation.freeze(G.campaign.Validation.clone(snapshot)),G.campaign.Validation.freeze(G.campaign.Validation.clone(candidates)));G.campaign.Validation.assert(candidates.some(c=>JSON.stringify(c)===JSON.stringify(selected)),"AI selected an illegal candidate");return{status:"READY",action:selected};}
 }
 G.systems.AISystem=AISystem;
}(window.GBTRPG));
