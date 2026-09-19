(function(G){
  "use strict";
  const P=G.campaign.ClassProgressionSystem,L=G.campaign.AbilityLoadoutSystem;
  class ClassManagementUI {
    constructor(host){this.h=host;this.c=host.campaign;}
    name(id){return G.data.CLASSES[id]?.name||id?.toUpperCase()||"NONE";}
    requirementText(r){return [r.slot,...(r.families||[]),...(r.weights||[]),...(r.kinds||[]),...(r.tags||[])].filter(Boolean).join(" / ").toUpperCase();}
    spellDetails(a){const s=G.data.SPELLS[a.spellId];return s?["CAST RANGE: "+(s.castingRange??"TBD"),"EFFECT RADIUS: "+(s.effectRadius??"TBD"),"MAGNITUDE: "+(s.magnitude.amount??"TBD"),"MP COST: "+(s.mpCost??"TBD"),"ELEMENT: "+(s.element||"NONE"),...s.curesStatuses.map(id=>"CURES "+id),...s.appliesStatuses.map(s=>"APPLIES "+s.id)]:a.castingModifier?["RANGE BONUS "+a.effect.rangeBonus,"RADIUS "+(a.effect.radiusOverride??"+"+a.effect.radiusBonus),"MAGNITUDE X"+a.effect.magnitudeMultiplier,"MP COST X"+a.effect.mpMultiplier]:[];}
    abilityName(id){return G.data.ABILITIES[id]?.name||"NONE";}
    page(title,lines){this.h.showPage(title,lines);}
    list(title,items){this.h.showList(title,items);}
    unit(id){const u=this.c.state.units[id];this.list("CLASSES / "+u.name,[
      {label:"PROGRESSION / CLASS CHANGES",run:()=>this.classes(id)},
      {label:"ABILITIES / PURCHASE",run:()=>this.abilities(id)},
      {label:"ABILITY LOADOUT",run:()=>this.loadout(id)},
      {label:"EQUIPMENT PERMISSIONS",run:()=>this.permissions(id)},
      ...(this.h.debugEnabled?[{label:"DEBUG TACTICAL RULES",run:()=>this.tactical(id)}]:[])
    ]);}
    classes(id){const u=this.c.state.units[id],ids=[...new Set([u.currentClassId,...Object.keys(u.classProgress),...Object.values(G.data.CLASSES).filter(c=>c.playable).map(c=>c.id)])];this.list("CHARACTER LV "+u.characterLevel,ids.map(classId=>({label:this.name(classId)+" CLV"+P.progress(u,classId).classLevel+(classId===u.currentClassId?" CURRENT":""),run:()=>this.discipline(id,classId)})));}
    discipline(id,classId){const u=this.c.state.units[id],p=P.progress(u,classId),a=P.availability(u,classId),definition=G.data.CLASSES[classId];this.list(this.name(classId),[
      {label:"PROGRESSION / REQUIREMENTS",run:()=>this.page(this.name(classId),["CHARACTER LV "+u.characterLevel,"CLASS LV "+p.classLevel,"LIFETIME CP "+p.lifetimeCP,"CURRENT CP "+p.currentCP,"ENTRY GRANT "+(p.entryGrantCP===null?"NOT ACCESSED":p.entryGrantCP+" / PROCESSED"),...a.requirements.map(r=>this.name(r.classId)+" LV"+r.level+" / HAVE "+r.actual),a.allowed?"CLASS CHANGE AVAILABLE":a.reason,definition?.growth?"GROWTH "+Object.entries(definition.growth).map(([k,v])=>k.toUpperCase()+" +"+v).join(" / "):"CLASS GROWTH UNRESOLVED",definition?.movModifier===null?"CLASS MOV UNRESOLVED":"CLASS MOV +"+(definition?.movModifier||0)])},
      ...(a.allowed&&u.currentClassId!==classId?[{label:"CHANGE TO "+this.name(classId),run:()=>{this.c.changeClass(id,classId);this.h.resources.done("CLASS CHANGED",[this.name(classId),"CHARACTER STATS PRESERVED","NO CAMPAIGN DAY SPENT"]);}}]:[]),
      {label:"CLASS ABILITIES",run:()=>this.abilities(id,classId)},
      ...(this.h.debugEnabled&&definition?[{label:"DEBUG GRANT CP TO LV 10",run:()=>{this.c.grantClassCPForInspection(id,classId,Math.max(0,G.config.CLASSES.thresholds[9]-p.lifetimeCP));this.h.resources.done("DEBUG CP GRANTED",[this.name(classId),"CLASS LV 10","NOT A GAMEPLAY AWARD FORMULA"]);}}]:[])
    ]);}
    abilities(id,classId=null){const u=this.c.state.units[id];this.list("ABILITIES / "+(classId?this.name(classId):"ALL CLASSES"),Object.values(G.data.ABILITIES).filter(a=>!classId||a.classId===classId).map(a=>({label:"L"+(a.level??"?")+" "+a.name+(L.learned(u,a.id)?" LEARNED":G.campaign.AbilityCostSystem.cost(a)===null?" COST TBD":" "+G.campaign.AbilityCostSystem.cost(a)+" CP"),run:()=>this.ability(id,a.id)})));}
    ability(id,abilityId){const u=this.c.state.units[id],a=G.data.ABILITIES[abilityId],e=G.campaign.AbilityLearningSystem.eligibility(u,abilityId);this.list(a.name,[
      {label:"DETAILS / "+a.category,run:()=>this.page(a.name,[this.name(a.classId)+" CLASS LV "+(a.level??"TBD"),a.category,a.description,...this.spellDetails(a),...(a.weaponRequirements?(Array.isArray(a.weaponRequirements)?a.weaponRequirements:[a.weaponRequirements]).map(r=>"REQUIRES "+this.requirementText(r)):[]),...(a.prerequisiteAbilityIds||[]).map(id=>"REQUIRES LEARNED "+this.abilityName(id)),"LIFETIME CP: "+P.progress(u,a.classId).lifetimeCP,"CLASS LV: "+P.progress(u,a.classId).classLevel,"COST: "+(G.campaign.AbilityCostSystem.cost(a)===null?"UNRESOLVED":G.campaign.AbilityCostSystem.cost(a)+" CURRENT CP"),"CURRENT CP: "+P.progress(u,a.classId).currentCP,L.learned(u,a.id)?"PERMANENTLY LEARNED":e.reason||"ELIGIBLE TO PURCHASE",...(this.h.debugEnabled?["IMPLEMENTATION: "+a.implementation,...Object.entries(a.effect).map(([k,v])=>k+": "+JSON.stringify(v))]:[])])},
      ...(e.allowed?[{label:"PURCHASE "+G.campaign.AbilityCostSystem.cost(a)+" CP",run:()=>{this.c.purchaseAbility(id,a.id);this.h.resources.done("ABILITY PURCHASED",[a.name]);}}]:[]),
      ...(this.h.debugEnabled&&!L.learned(u,a.id)&&Number.isInteger(a.level)&&P.progress(u,a.classId).classLevel>=a.level?[{label:"DEBUG GRANT / NO PURCHASE",run:()=>{this.c.grantAbilityForInspection(id,a.id);this.h.resources.done("DEBUG ABILITY GRANTED",[a.name,"NO CP SPENT / DEBUG GRANT"]);}}]:[])
    ]);}
    loadout(id){const u=this.c.state.units[id];this.list("FIVE-PART LOADOUT",[
      {label:"PRIMARY: "+this.name(u.currentClassId),run:()=>this.page("PRIMARY ACTION",["FOLLOWS CURRENT CLASS",...L.actions(u).filter(a=>a.classId===u.currentClassId).map(a=>a.name)])},
      {label:"SECONDARY: "+this.name(u.abilityLoadout.secondaryClassId),run:()=>this.list("SECONDARY ACTION CLASS",[{label:"NONE",run:()=>this.set(id,"secondaryClassId",null)},...Object.values(G.data.CLASSES).filter(c=>c.id!==u.currentClassId&&(c.playable||u.classProgress[c.id])).map(c=>({label:c.name,run:()=>this.set(id,"secondaryClassId",c.id)}))])},
      ...[["REACTION","reactionId"],["SUPPORT","supportId"],["MOVEMENT","movementId"]].map(([category,slot])=>({label:category+": "+this.abilityName(u.abilityLoadout[slot]),run:()=>this.list(category,[{label:"NONE",run:()=>this.set(id,slot,null)},...u.learnedAbilityIds.map(a=>G.data.ABILITIES[a]).filter(a=>a.category===category).map(a=>({label:a.name,run:()=>this.set(id,slot,a.id)}))])}))
    ]);}
    set(id,slot,value){this.c.setAbilityLoadout(id,slot,value);this.h.resources.done("LOADOUT UPDATED",[slot==="secondaryClassId"?this.name(value):this.abilityName(value),"NO CAMPAIGN DAY SPENT"]);}
    permissions(id){const u=this.c.state.units[id],race=G.data.RACES[u.raceId],stats=G.campaign.InventorySystem.stats(this.c.state,id);this.page("EQUIPMENT / MOV",[
      "CLASS: "+this.name(u.currentClassId),"RACE: "+race.name,"RACE FORBIDS: "+(race.equipmentRestrictions.forbiddenSlots.join(" / ")||"NONE"),
      ...G.campaign.EquipmentEligibility.permissions(u).map(p=>[p.slot,...(p.kinds||[]),...(p.families||[]),...(p.weights||[])].join(" ").toUpperCase()),
      ...(G.data.CLASSES[u.currentClassId]?.legacy?["LEGACY ITEM CLASS PERMISSIONS"]:[]),
      "PERSONAL CAPACITY "+G.campaign.InventorySystem.capacity(this.c.state,id),"CARRIED "+G.campaign.InventorySystem.personal(this.c.state,id).length,
      "MOV: RACE "+race.mov+" CLASS "+G.campaign.ClassGrowthProvider.getMovementModifier(u.currentClassId),
      "ABILITY MOV "+G.campaign.AbilityModifierSystem.stats(u).reduce((n,e)=>n+(e.modifiers.mov||0),0),
      "EQUIPMENT MOV "+G.campaign.InventorySystem.equipmentDefinitions(this.c.state,id).reduce((n,d)=>n+(d.modifiers.mov||0),0),"EFFECTIVE MOV "+stats.mov,
      "WEAPON ATK: "+(stats.weaponAttack??"UNRESOLVED"),"OLD ITEM WEIGHTS: UNRESOLVED"
    ]);}
    tradeInventories(actorId,targetId){const s=this.c.state;this.page("DEBUG / TRADE INVENTORIES",["PREVIEW / NO TRANSFER","BATTLE ADJACENCY REQUIRED","SUCCESSFUL ACTION COST TBD",...[actorId,targetId].flatMap(id=>[s.units[id].name,...G.systems.TradeSystem.slots(s,id).map((itemId,n)=>(n+1)+": "+(itemId?G.data.ITEMS[s.itemInstances[itemId].definitionId].name:"EMPTY"))])]);}
    tactical(id,turn=null){const u=this.c.state.units[id];turn=turn||G.systems.TurnSystem.start(G.campaign.InventorySystem.stats(this.c.state,id).mov);const policy=G.campaign.AbilityModifierSystem.actionPolicy(u),commands=G.systems.ActionCommandSystem.categories(u,turn,{equipmentDefinitions:G.campaign.InventorySystem.equipmentDefinitions(this.c.state,id)});this.list("DEBUG / TACTICAL RULES",[
      {label:"INSPECT TURN / COMMANDS",run:()=>this.page("TURN FOUNDATION",["MAJOR ACTION: "+(turn.majorUsed?"USED":"AVAILABLE"),"MOV REMAINING "+turn.remainingMov,"TILES TRAVERSED "+turn.tilesMoved,...commands.flatMap(c=>[c.command+" / "+(c.allowed?"AVAILABLE":c.reason||"UNAVAILABLE"),...(c.abilities||[]).map(a=>a.name+" / "+this.name(a.owningClassId)+" / "+a.accessSource+(a.allowed?"":" / "+a.reason))]),"DAMAGE EXECUTION DEFERRED","CP AWARD FORMULA UNRESOLVED","STEAL FORMULA UNRESOLVED","DOUBLE ATTACK FORMULA UNRESOLVED"])},
      ...["ATTACK","ITEM","EQUIP"].filter(command=>G.systems.TurnSystem.availability(turn,command,null,policy).allowed).map(command=>({label:"DEBUG CONSUME "+command,run:()=>{G.systems.TurnSystem.consume(turn,command,null,policy);this.tactical(id,turn);}})),
      {label:"INSPECT TRADE INVENTORIES",run:()=>this.list("DEBUG / TRADE PARTNER",Object.values(this.c.state.units).filter(other=>other.id!==id&&other.faction===u.faction&&other.status==="ACTIVE").map(other=>({label:other.name,run:()=>this.tradeInventories(id,other.id)})))},
      {label:"RESET INSPECTION TURN",run:()=>this.tactical(id)}
    ]);}
  }
  G.ui.ClassManagementUI=ClassManagementUI;
}(window.GBTRPG));
