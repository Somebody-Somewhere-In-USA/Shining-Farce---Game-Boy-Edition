(function(G){
  "use strict";
  function cost(ability){
    // Omitted cost uses the standard curve. Explicit null deliberately remains unresolved.
    if(Object.hasOwn(ability,"costCP"))return ability.costCP;
    return G.config.CLASSES.abilityCosts[ability.level-1]??null;
  }
  G.campaign.AbilityCostSystem={cost};
}(window.GBTRPG));
