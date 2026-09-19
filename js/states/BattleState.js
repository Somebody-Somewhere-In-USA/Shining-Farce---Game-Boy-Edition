(function (G) {
  "use strict";
  class BattleState {
    constructor(scenario=null,dependencies={}){
      Object.assign(this,dependencies);
      // Detached rule session, not a completed battle renderer or speculative combat engine.
      if(!scenario){this.state=null;return;}
      const V=G.campaign.Validation,units={},itemInstances={},turns={},rosters={},turnNumbers={};
      for(const [n,group]of [...scenario.participants,...(scenario.specialUnits?.length?[{special:true,units:scenario.specialUnits}]:[])].entries()){if(!group.special)rosters[group.squadId||"group"+n]={unitIds:group.units.map(u=>u.id)};for(const u of group.units){
        units[u.id]={id:u.id,name:u.name,typeId:u.typeId,faction:u.faction,status:u.status,unassignedLocationId:u.unassignedLocationId,...G.campaign.CharacterGrowthSystem.copyProgression(u)};
        for(const p of u.possessions)itemInstances[p.instance.id]=V.clone(p.instance);
        units[u.id].tactical=G.systems.BattleStatusSystem.initialize(u.stats,scenario.resources?.[u.id]);
        turns[u.id]=G.systems.TurnSystem.start(u.stats.mov);turnNumbers[u.id]=0;
      }
      }
      this.scenario=V.freeze(V.clone(scenario));
      this.state=V.freeze({specialUnitIds:(scenario.specialUnits||[]).map(u=>u.id),units,itemInstances,turns,rosters,turnNumbers,portals:{},controlledUnitId:null,presentation:{phase:"MAP",pendingWinner:null,banner:null},counterRecords:[],pendingCounter:null,positions:V.clone(scenario.positions||{}),hiddenItems:G.systems.HiddenItemSystem.initialize(scenario.hiddenItems||[]),actionRecords:[]});
    }
    command(apply){const V=G.campaign.Validation;V.assert(this.state,"battle snapshot required");const draft=V.clone(this.state),result=apply(draft);for(const [id,u]of Object.entries(draft.units)){const old=this.state.units[id];if(old&&G.core.DeveloperRuntime.protected(u)){u.tactical.hp=Math.max(old.tactical.hp,u.tactical.hp);u.tactical.mp=Math.max(old.tactical.mp,u.tactical.mp);}}V.plainData(draft);this.state=V.freeze(draft);return result;}
    ongoing(s,allowCounter=false){G.campaign.Validation.assert(allowCounter||!s.pendingCounter,"CHOOSE COUNTER SPELL FIRST");G.campaign.Validation.assert(!s.presentation.pendingWinner,"battle conclusion already pending");}
    commands(unitId){return G.systems.ActionCommandSystem.categories(this.state.units[unitId],this.state.turns[unitId],{world:this.state,equipmentDefinitions:G.campaign.InventorySystem.equipmentDefinitions(this.state,unitId)});}
    startTurn(unitId,terrain=this.terrain||{}){return this.command(s=>{this.ongoing(s);G.campaign.Validation.assert(s.units[unitId],"unknown tactical unit");G.campaign.Validation.assert(!["DEAD","AWOL"].includes(s.units[unitId].tactical.life),"Dead/AWOL has no turn");G.campaign.Validation.assert((!s.turns[unitId].escapeRequired||s.turns[unitId].ended),"escape must resolve before another turn");s.turnNumbers[unitId]++;s.controlledUnitId=unitId;s.turns[unitId]=G.systems.TurnSystem.start(G.campaign.InventorySystem.stats(s,unitId).mov);G.systems.BattleStatusSystem.startTurn(s,unitId);if(s.units[unitId].tactical.escapeRequired)G.systems.FlyingSystem.checkPosition(s,unitId,terrain);G.systems.CombatSystem.detectConclusion(s);if(!G.systems.BattleStatusSystem.active(s.units[unitId]))s.turns[unitId].incapacitated=true;});}
    equip(unitId,itemId,unequip=false){return this.command(s=>{this.ongoing(s);return G.systems.TacticalEquipmentSystem.change(s,unitId,itemId,unequip,s.turns[unitId]);});}
    // Resolved outcomes are supplied by a future battle resolver or explicit rule tests.
    resolveSteal(actorId,targetId,abilityId,itemId,successful,context={},cpCalculator){return this.command(s=>{
      this.ongoing(s);const record=G.systems.StealSystem.resolveOutcome(s,actorId,targetId,abilityId,itemId,s.turns[actorId],successful,context);
      let n=s.actionRecords.length;while(s.actionRecords.some(r=>r.executionId==="steal-"+n))n++;Object.assign(record,{executionId:"steal-"+n,legal:true,executed:true,cancelled:false});
      const cp=G.campaign.ClassProgressionSystem.awardAction(s.units[actorId],record,cpCalculator);s.actionRecords.push({...record,actorId,cp});return{...record,cp};
    });}
    resolveActionCP(unitId,execution,calculator){return this.command(s=>{this.ongoing(s);G.campaign.Validation.assert(G.campaign.Validation.validId(execution.executionId)&&!s.actionRecords.some(r=>r.executionId===execution.executionId),"missing or duplicate executed action ID");if(G.systems.ExecutionReceiptSystem.qualifies(execution))G.campaign.Validation.assert(G.systems.BattleStatusSystem.active(s.units[unitId])&&!s.units[unitId].tactical.escapeRequired,"inactive or required escape prevents actions");if(execution.abilityId&&G.systems.ExecutionReceiptSystem.qualifies(execution)){const gear=G.systems.AbilityRequirementSystem.action(s.units[unitId],execution.abilityId,G.campaign.InventorySystem.equipmentDefinitions(s,unitId));G.campaign.Validation.assert(gear.allowed,gear.reason);}
      const cp=G.campaign.ClassProgressionSystem.awardAction(s.units[unitId],execution,calculator);s.actionRecords.push({...execution,...(cp.receipt||G.systems.ExecutionReceiptSystem.normalize(s.units[unitId],execution)||{}),actorId:unitId,cp});return cp;});}
    trade(actorId,targetId,actorItemId,targetItemId,policy={}){return this.command(s=>{this.ongoing(s);return G.systems.TradeSystem.execute(s,actorId,targetId,actorItemId,targetItemId,s.positions,s.turns[actorId],policy);});}
    hiddenItemQuery(unitId,context={}){return G.systems.HiddenItemSystem.query(this.state.units[unitId],this.state.positions[unitId],this.state.hiddenItems,context);}
    endTurn(id,terrain=this.terrain||{}){return this.command(s=>{this.ongoing(s);G.campaign.Validation.assert(!s.units[id].tactical.escapeRequired,"ESCAPE ILLEGAL TERRAIN FIRST");G.campaign.Validation.assert(!s.turns[id].ended,"turn already ended");G.systems.TurnSystem.end(s.turns[id]);G.systems.BattleStatusSystem.endTurn(s,id);G.systems.PortalSystem.endTurn(s,id);G.systems.FlyingSystem.endTurn(s,id,terrain);G.systems.CombatSystem.detectConclusion(s);});}
    move(id,steps,context){return this.command(s=>{this.ongoing(s);const result=G.systems.TacticalMovementRules.traverse(s.units[id],s.positions[id],s.turns[id],steps,{...context,occupant:(x,y)=>G.systems.PortalSystem.occupant(s,{x,y})});return result;});}
    escape(id,target,terrain=this.terrain||{}){return this.command(s=>{this.ongoing(s);return G.systems.FlyingSystem.escape(s,id,target,terrain);});}
    enterPortal(id){return this.command(s=>{this.ongoing(s);G.campaign.Validation.assert(!s.units[id].tactical.escapeRequired,"ESCAPE ILLEGAL TERRAIN FIRST");return G.systems.PortalSystem.enter(s,id);});}
    damage(id,amount,context={}){return this.command(s=>{this.ongoing(s);s.presentation.phase="ANIMATION";const result=G.systems.BattleStatusSystem.damage(s,id,amount,context);G.systems.CombatSystem.detectConclusion(s);return result;});}
    cast(id,spellId,method,target,options={}){G.campaign.Validation.assert(!options.counter,"counter casts require reaction resolver");return this.command(s=>this.applyCast(s,id,spellId,method,target,options));}
    applyCast(s,id,spellId,method,target,options={}){
      this.ongoing(s,options.counter===true);
      const A=G.systems.BattleActionSystem,plan=A.prepare(s,id,spellId,method,target,options);
      for(const targetId of plan.targetIds){if(s.presentation.pendingWinner)break;A.resolveTarget(s,plan,targetId,options);}
      G.systems.CombatSystem.detectConclusion(s);return A.finish(s,plan,options);
    }

    resolveCounters(defenderId,attackerId,context={}){return this.command(s=>{this.ongoing(s);const V=G.campaign.Validation;V.assert(V.validId(context.attackId)&&!s.counterRecords.some(r=>r.attackId===context.attackId),"missing or duplicate counter trigger");V.assert(!s.pendingCounter,"counter choice pending");const result=G.systems.CombatSystem.counters(s,defenderId,attackerId,context);s.counterRecords.push({attackId:context.attackId,defenderId,kind:result.kind});if(result.kind==="SPELL_SELECTION")s.pendingCounter={attackId:context.attackId,defenderId,attackerId,eligibleSpellIds:result.eligibleSpellIds};if(result.kind==="SPELL")result.castResult=this.applyCast(s,defenderId,result.spellId,null,s.positions[attackerId],{...context,counter:true});else if(result.kind==="NORMAL"&&context.resolveNormal){s.presentation.phase="ANIMATION";context.resolveNormal(s,defenderId,attackerId);G.systems.CombatSystem.detectConclusion(s);}return result;});}
    chooseCounter(spellId,context={}){return this.command(s=>{this.ongoing(s,true);const p=s.pendingCounter,V=G.campaign.Validation;V.assert(p&&p.eligibleSpellIds.includes(spellId),"choose an eligible counter spell");const result=this.applyCast(s,p.defenderId,spellId,null,s.positions[p.attackerId],{...context,counter:true});s.counterRecords.find(r=>r.attackId===p.attackId).kind="SPELL";s.pendingCounter=null;return result;});}
    expireStatus(id,statusId,terrain=this.terrain||{}){return this.command(s=>{this.ongoing(s);const u=s.units[id],before=G.systems.FlyingSystem.sources(u).length;u.tactical.statuses=u.tactical.statuses.filter(x=>x.id!==statusId||(statusId==="FLYING"&&(x.sourceType!=="SPELL"||x.sourceKey!=="fly")));if(before&&!G.systems.FlyingSystem.sources(u).length)G.systems.FlyingSystem.checkPosition(s,id,terrain);G.systems.CombatSystem.detectConclusion(s);});}
    animationComplete(){return this.command(s=>G.systems.CombatSystem.animationComplete(s));}
    mapRendered(){return this.command(s=>G.systems.CombatSystem.mapRendered(s));}
    result(){const V=G.campaign.Validation,winner=this.state.presentation.pendingWinner;V.assert(this.state.presentation.phase==="BANNER"&&["PLAYER","ZEON"].includes(winner),"battle banner must complete before result");return{scenarioId:this.scenario.scenarioId,winnerFaction:winner,loserOutcome:"DEFEATED",awolUnitIds:Object.values(this.state.units).filter(u=>u.tactical.life==="AWOL"&&!this.state.specialUnitIds.includes(u.id)).map(u=>u.id),deadUnitIds:Object.values(this.state.units).filter(u=>u.tactical.life==="DEAD"&&!this.state.specialUnitIds.includes(u.id)).map(u=>u.id)};}
    playAnimation(animation,draw){this.cutIn=new G.states.CombatCutInState({animation,draw,onComplete:()=>this.animationComplete()});}
    enter() {}
    update(ms=0){if(this.state?.presentation.phase==="ANIMATION")this.cutIn?.update(ms);}
    render(){if(!this.state||!this.battleRenderer)return;if(this.state.presentation.phase==="ANIMATION"&&this.cutIn)this.cutIn.render();else{this.battleRenderer.draw(this.state,this.cursor,this.portalInteraction);if(this.state.presentation.phase==="MAP_RETURN"||this.state.presentation.phase==="MAP")this.mapRendered();}}
    exit() {}
  }
  G.states.BattleState = BattleState;
}(window.GBTRPG));
