(function(G){
  "use strict";
  const V=G.campaign.Validation;
  class CombatSystem {
    static counters(world,defenderId,attackerId,context={}){
      const u=world.units[defenderId],attacker=world.units[attackerId],L=G.campaign.AbilityLoadoutSystem;
      if(!G.systems.BattleStatusSystem.active(u)||!G.systems.BattleStatusSystem.active(attacker)||context.canCounter!==true)return{kind:"NONE"};
      if(!context.provenance?.spellCounterGenerated&&L.effects(u,"spellCounter").length){
        const eligible=Object.values(G.data.SPELLS).filter(s=>s.owningClassId==="mage"&&s.spellLevel===1&&L.learned(u,s.id)&&context.spellEligible?.(s,u,attacker)===true);
        if(eligible.length){V.assert(typeof context.roll==="function","counter RNG required");const roll=context.roll();V.assert(Number.isFinite(roll)&&roll>=0&&roll<1,"invalid counter roll");if(roll<0.2){if(u.faction==="PLAYER")return{kind:"SPELL_SELECTION",eligibleSpellIds:eligible.map(s=>s.id),mpCost:0,suppressNormal:true};const select=context.selectSpell||G.config.SPELLS.counterSpellSelection;V.assert(typeof select==="function","UNRESOLVED COUNTER SPELL SELECTION");const id=select(eligible,u,attacker);V.assert(eligible.some(s=>s.id===id),"counter spell not eligible");return{kind:"SPELL",spellId:id,mpCost:0,suppressNormal:true};}}
      }
      return{kind:context.normalCounter?.(u,attacker)===true?"NORMAL":"NONE"};
    }
    static conclusion(world){const factions=[...new Set(Object.values(world.units).filter(u=>G.systems.BattleStatusSystem.active(u)&&u.tactical.hp>0).map(u=>u.faction))];return factions.length===0?"DRAW":factions.length===1?factions[0]:null;}

    static detectConclusion(world){const winner=this.conclusion(world);if(winner&&!world.presentation.pendingWinner)world.presentation.pendingWinner=winner;if(winner&&world.presentation.phase==="MAP")world.presentation.phase="MAP_RETURN";return winner;}
    static animationComplete(world){V.assert(world.presentation.phase==="ANIMATION","no current battle animation");world.presentation.phase="MAP_RETURN";}
    static mapRendered(world){if(world.presentation.phase==="MAP_RETURN"||world.presentation.phase==="MAP"){if(world.presentation.pendingWinner){world.presentation.phase="BANNER";world.presentation.banner=world.presentation.pendingWinner==="PLAYER"?"VICTORY":world.presentation.pendingWinner==="DRAW"?"DRAW":"DEFEAT";}else world.presentation.phase="MAP";}}
  }
  G.systems.CombatSystem=CombatSystem;
}(window.GBTRPG));
