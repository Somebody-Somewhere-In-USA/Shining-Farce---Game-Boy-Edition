(function(G){
  "use strict";
  function categories(unit,turn,context={}){
    const actions=G.campaign.AbilityLoadoutSystem.actions(unit).filter(a=>!a.castingModifier),out=[],policy={...G.campaign.AbilityModifierSystem.actionPolicy(unit),...context.policy};
    for(const command of ["ATTACK","SKILLS","MAGIC","STEAL","ITEM","EQUIP","TRADE"]){
      const abilities=actions.filter(a=>a.command===command);
      if(["SKILLS","MAGIC","STEAL"].includes(command)&&!abilities.length)continue;
      const entries=abilities.map(a=>{const gear=G.systems.AbilityRequirementSystem.equipment(unit,a,context.equipmentDefinitions||[]);return{abilityId:a.id,owningClassId:a.classId,accessSource:a.classId===unit.currentClassId?"PRIMARY":"SECONDARY",requiredClassLevel:a.level,learned:true,command:a.command,weaponRequirements:a.weaponRequirements||null,majorAction:a.majorAction,name:a.name,spellFamily:a.spellFamily||null,spellFamilyName:a.spellFamilyName||null,spellLevel:a.spellLevel||null,implementation:a.implementation,...(gear.allowed?G.systems.TurnSystem.availability(turn,command,a,policy):gear)};});
      out.push({command,...G.systems.TurnSystem.metadata(command,null,policy),abilities:entries,...(command==="MAGIC"?{families:G.systems.SpellMenuSystem.families(entries)}:{}),...(entries.length?{allowed:entries.some(a=>a.allowed),reason:null}:G.systems.TurnSystem.availability(turn,command,null,policy))});
    }
    for(const e of G.campaign.AbilityLoadoutSystem.effects(unit,"stance"))out.push({command:e.command,...G.systems.TurnSystem.metadata("STANCE"),...G.systems.TurnSystem.availability(turn,"STANCE"),implementation:"DEFERRED",reason:"DODGE MODIFIER UNRESOLVED"});
    if(G.campaign.AbilityLoadoutSystem.effects(unit,"scrounger").length)out.push({command:"SCROUNGE",...G.systems.TurnSystem.metadata("SCROUNGE"),...G.systems.TurnSystem.availability(turn,"SCROUNGE",null,policy),implementation:"RULE_HOOK"});
    if(context.world&&G.systems.PortalSystem.availability(context.world,unit.id).allowed)out.push({command:"ENTER PORTAL",...G.systems.TurnSystem.metadata("ENTER PORTAL"),allowed:true});
    out.push({command:"END TURN",allowed:!turn.ended});return out;
  }
  // Action categories remain independent of Major Action cost and effect executability.
  G.systems.ActionCommandSystem={categories};
}(window.GBTRPG));
