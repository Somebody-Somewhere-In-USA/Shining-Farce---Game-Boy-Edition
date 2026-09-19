(function(G){
  "use strict";
  const effects=(u,h)=>G.campaign.AbilityLoadoutSystem.effects(u,h);
  function damage(unit,hp,maxHp,incoming){for(const e of effects(unit,"indomitable"))if(hp<=Math.ceil(maxHp*e.activationFraction)&&incoming<=Math.ceil(maxHp*e.blockedDamageFraction))return 0;return incoming;}
  function displacementAllowed(unit,sourceFaction){if(unit.tactical&&unit.tactical.life!=="ALIVE")return false;return !effects(unit,"enemyDisplacementImmunity").length||!["PLAYER","ZEON"].includes(sourceFaction)||sourceFaction===unit.faction;}
  function magicAffected(unit,context){return !(effects(unit,"friendlyOffensiveAreaImmunity").length&&context.sourceFaction===unit.faction&&context.offensive&&context.area);}
  function auraDefense(unit,sourcePosition,allyPosition,totalDefense){if(allyPosition.faction!==unit.faction||sourcePosition.x===allyPosition.x&&sourcePosition.y===allyPosition.y)return 0;return Math.max(Math.abs(sourcePosition.x-allyPosition.x),Math.abs(sourcePosition.y-allyPosition.y))===1?effects(unit,"defenseAura").reduce((n,e)=>n+totalDefense*e.fraction,0):0;}
  function endTurn(unit,turn){return effects(unit,"endTurnDefense").filter(e=>turn.tilesMoved>=e.tilesRequired).map(e=>({handler:e.handler,defBonus:e.defBonus,expires:e.expires,status:e.defBonus===null?"UNRESOLVED_MODIFIER":"READY"}));}
  function backstabMultiplier(actor,target,allies){return Math.abs(actor.x-target.x)+Math.abs(actor.y-target.y)===1&&allies.some(u=>u.faction===actor.faction&&u.x===2*target.x-actor.x&&u.y===2*target.y-actor.y)?1.5:1;}
  // Unsupported effects require explicit future handlers; no pretend damage/action is executed.
  function executionStatus(abilityId,handlers={}){const a=G.data.ABILITIES[abilityId];return a&&typeof handlers[a.effect.handler]==="function"?"HANDLER_AVAILABLE":"EFFECT_NOT_IMPLEMENTED";}
  function coveringFire(unit,attacker,target,equipmentDefinitions,context={}){
    const a=G.campaign.AbilityLoadoutSystem.equipped(unit).find(a=>a.effect.handler==="preAttackBowReaction");
    if(!a||!attacker||!target||![unit,attacker,target].every(G.systems.BattleStatusSystem.active)||target.id===unit.id||target.faction!==unit.faction||attacker.faction===unit.faction||!G.systems.AbilityRequirementSystem.equipment(unit,a,equipmentDefinitions).allowed)return{status:"INELIGIBLE"};
    if(!context.legalTarget)return{status:"UNRESOLVED_TARGETING"};
    if(!context.legalTarget(unit,attacker))return{status:"INELIGIBLE"};
    return{status:"QUALIFYING",chance:a.effect.chance,timing:a.effect.timing,isCounterattack:false,doubleAttackEligible:false,activationLimit:null};
  }
  function pendingAttackAfterReaction(canComplete){G.campaign.Validation.assert(typeof canComplete==="boolean","resolved attacker capability required");return{resolvePendingAttack:canComplete};}
  G.systems.AbilityEffectHooks={damage,displacementAllowed,magicAffected,auraDefense,endTurn,backstabMultiplier,executionStatus,coveringFire,pendingAttackAfterReaction};
}(window.GBTRPG));
