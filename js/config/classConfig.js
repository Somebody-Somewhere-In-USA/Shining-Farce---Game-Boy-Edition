(function(G){
  "use strict";
  G.config.CLASSES=Object.freeze({
    // PROVISIONAL CP curve. The maximum Class Level of 10 is established.
    thresholds:Object.freeze([0,100,250,450,700,1000,1350,1750,2200,2700]),
    abilityCosts:Object.freeze([100,125,150,175,200,225,250,275,300,350]),
    growthScale:Object.freeze({small:1,medium:2,large:3}),
    prerequisiteScope:"CHARACTER",
    doubleAttackCap:0.9,
    // Preserve Prompt 3.5's neutral runtime fallback, not designed class bonuses.
    unresolvedGrowthFallback:Object.freeze({}), unresolvedMovementFallback:0
  });
}(window.GBTRPG));
