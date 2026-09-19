(function(G){
  "use strict";
  const effects=(u,h)=>G.campaign.AbilityLoadoutSystem.effects(u,h);
  function growth(unit){const out={};for(const e of effects(unit,"growth"))if(e.bonus!==null){G.campaign.Validation.assert(G.config.CHARACTER_STATS.primaryKeys.includes(e.stat)&&Number.isSafeInteger(e.bonus)&&e.bonus>=0,"invalid support growth bonus");out[e.stat]=(out[e.stat]||0)+e.bonus;}return out;}
  function stats(unit){return effects(unit,"stats").map(e=>({modifiers:e.modifiers}));}
  function capacity(unit){return G.config.RESOURCES.personalCapacity+effects(unit,"capacity").reduce((n,e)=>n+e.bonus,0);}
  function actionPolicy(unit){return Object.assign({},...effects(unit,"actionPolicy").map(e=>({itemOutsideMajor:e.itemOutsideMajor===true})));}
  function weaponAttack(unit,definition){
    if(!definition||definition.weaponAttack===null||definition.weaponAttack===undefined)return null;
    const multiplier=effects(unit,"twoHanded").reduce((n,e)=>n*e.weaponAttackMultiplier,1);
    return definition.weaponAttack*multiplier;
  }
  G.campaign.AbilityModifierSystem={effects,growth,stats,capacity,weaponAttack,actionPolicy};
}(window.GBTRPG));
