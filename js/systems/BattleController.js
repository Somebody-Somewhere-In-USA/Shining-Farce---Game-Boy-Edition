(function(G){
 "use strict";
 const V=G.campaign.Validation,CT=G.systems.CTSystem,Q=G.systems.CombatEventQueue,A=G.systems.BattleActionSystem;
 class BattleController {
  constructor(battle,map,options={}){Object.assign(this,{battle,map,options});battle.command(s=>{s.timeline=CT.initialize(s,options.seed??1);s.events=Q.create();s.combatRng=G.core.DeterministicRandom.create(options.seed??1);});}
  context(s,id){const roll=()=>G.core.DeterministicRandom.integer(s.combatRng,0,999999)/1000000;return{...this.options,...G.systems.BattleTerrainSystem.context(this.map,s.units[id],s),rounding:this.options.rounding,prayerRoll:this.options.prayerRoll||roll,statusRoll:this.options.statusRoll||roll,roll:this.options.roll||roll};}
  get busy(){return!!this.scene||!!this.battle.state.events.frames.length;}
  forecast(count){return CT.forecast(this.battle.state,this.battle.state.timeline,count,(s,id)=>this.context(s,id));}
  advance(){if(this.busy||this.battle.state.presentation.pendingWinner)return null;let guard=0;while(guard++<10000){const id=this.battle.command(s=>CT.next(s,s.timeline));if(!id)return null;if(this.battle.state.controlledUnitId===id&&!this.battle.state.turns[id].ended)return id;this.battle.startTurn(id,this.context(this.battle.state,id));const s=this.battle.state;if(s.presentation.pendingWinner)return null;if(G.systems.BattleStatusSystem.active(s.units[id]))return id;this.battle.endTurn(id,this.context(s,id));this.battle.command(w=>CT.end(w,w.timeline,id));}throw Error("CT maintenance guard exceeded");}
  endTurn(){V.assert(!this.busy,"combat presentation pending");const id=this.battle.state.timeline.activeId;V.assert(id,"no controlled unit");this.battle.endTurn(id,this.context(this.battle.state,id));this.battle.command(s=>CT.end(s,s.timeline,id));return this.advance();}
  control(id){const s=this.battle.state;V.assert(!this.busy&&!s.presentation.pendingWinner&&s.timeline.activeId===id&&s.controlledUnitId===id,"unit does not own battle control");V.assert(G.systems.BattleStatusSystem.active(s.units[id]),"inactive unit");}
  move(id,destination){this.control(id);const context=this.context(this.battle.state,id),path=G.systems.PathfindingSystem.find(this.battle.state,id,destination,context);V.assert(path,"no legal path within remaining MOV");return this.battle.move(id,path,context);}
  route(id,destination){this.control(id);const plan=G.systems.PathfindingSystem.plan(this.battle.state,id,destination,(s,unitId)=>this.context(s,unitId));V.assert(plan,"no legal route within remaining MOV");this.battle.command(s=>{for(const action of plan.actions){if(action.command==="ENTER PORTAL")G.systems.PortalSystem.enter(s,id);else G.systems.TacticalMovementRules.traverse(s.units[id],s.positions[id],s.turns[id],action.steps,this.context(s,id));}});return plan;}
  events(plan){return[...plan.targetIds.flatMap(targetId=>[{type:"TARGET",targetId},{type:"COUNTER",targetId}]),{type:"FINISH"}];}
  cast(id,spellId,method,target){this.control(id);this.battle.command(s=>{const plan=A.prepare(s,id,spellId,method,target,this.context(s,id));Q.push(s.events,plan,this.events(plan));});const plan=this.battle.state.events.frames.at(-1).action;this.scene=new G.systems.BattleSceneSequence(this.battle.state,id,plan.targetIds);}
  // Production attacks and non-spell actions enter through an explicit resolver boundary.
  action(id,command,targetId,resolver,abilityId=null){this.control(id);V.assert(typeof resolver==="function","UNRESOLVED "+command+" RULES");const ability=abilityId?G.data.ABILITIES[abilityId]:null,meta=G.systems.TurnSystem.metadata(command,ability,G.campaign.AbilityModifierSystem.actionPolicy(this.battle.state.units[id]));let result;
   this.battle.command(s=>{const u=s.units[id];if(ability)V.assert(G.campaign.AbilityLoadoutSystem.actions(u).some(a=>a.id===abilityId),"ability not accessible");G.systems.TurnSystem.consume(s.turns[id],command,ability,G.campaign.AbilityModifierSystem.actionPolicy(u));s.presentation.phase=meta.presentation==="SCENE"?"ANIMATION":"MAP";result=resolver(s,id,targetId,this.context(s,id));V.assert(result?.executed===true,"action did not execute");s.actionSerial=(s.actionSerial||0)+1;const receipt={executionId:"action-event-"+s.actionSerial,command,abilityId,legal:true,executed:true,successful:result.successful!==false};const cp=G.campaign.ClassProgressionSystem.awardAction(u,receipt,this.options.cpCalculator);s.actionRecords.push({...receipt,actorId:id,cp});G.systems.CombatSystem.detectConclusion(s);if(command==="ATTACK"&&targetId&&!s.presentation.pendingWinner)Q.push(s.events,{actorId:id,executionId:receipt.executionId,targetIds:[targetId],provenance:{spellCounterGenerated:false}},[{type:"COUNTER",targetId}]);});
   if(meta.presentation==="SCENE"){this.scene=new G.systems.BattleSceneSequence(this.battle.state,id,[targetId||id]);this.scene.target(targetId||id,result);}return result;
  }
  chooseCounter(spellId){this.battle.command(s=>{const p=s.events.waiting;V.assert(p?.eligibleSpellIds.includes(spellId),"choose an eligible counter spell");const plan=A.prepare(s,p.defenderId,spellId,null,s.positions[p.attackerId],{...this.context(s,p.defenderId),counter:true});Q.resume(s.events,plan,this.events(plan));});this.scene.paused=false;}
  step(){let result;this.battle.command(s=>{result=Q.step(s.events,{
   TARGET:(e,f)=>{if(s.presentation.pendingWinner)return{};const r=A.resolveTarget(s,f.action,e.targetId,this.context(s,f.action.actorId));return{presentation:r.skipped?null:{actorId:f.action.actorId,targetId:e.targetId,...r}};},
   COUNTER:(e,f)=>{if(s.presentation.pendingWinner||f.action.cast&&!f.action.cast.dealsDamage)return{};const p=f.action,defenderId=e.targetId,attackerId=p.actorId,context=this.context(s,defenderId);const eligible=(spell,u,attacker)=>{try{const c=G.systems.MagicSystem.resolve(u,spell.id,null,{...context,counter:true});G.systems.MagicSystem.validateReady(c);return G.systems.TargetingSystem.unitAllowed(u,attacker,c)&&G.systems.TargetingSystem.distance(s.positions[u.id],s.positions[attacker.id])<=c.castingRange&&!u.tactical.statuses.some(x=>x.id==="MUTE");}catch{return false;}};
    const r=G.systems.CombatSystem.counters(s,defenderId,attackerId,{...context,canCounter:defenderId!==attackerId&&s.units[defenderId].faction!==s.units[attackerId].faction,provenance:p.provenance,spellEligible:eligible});s.counterRecords.push({attackId:p.executionId+":"+defenderId,defenderId,kind:r.kind});
    if(r.kind==="SPELL_SELECTION")return{wait:{...r,defenderId,attackerId}};
    if(r.kind==="SPELL"){const plan=A.prepare(s,defenderId,r.spellId,null,s.positions[attackerId],{...context,counter:true});return{reaction:{action:plan,events:this.events(plan)}};}
    if(r.kind==="NORMAL"){V.assert(typeof this.options.resolveNormal==="function","UNRESOLVED NORMAL COUNTER RULES");const out=this.options.resolveNormal(s,defenderId,attackerId,context);G.systems.CombatSystem.detectConclusion(s);return{presentation:{actorId:defenderId,targetId:attackerId,...out}};}return{};
   },
   FINISH:(e,f)=>({receipt:A.finish(s,f.action,this.context(s,f.action.actorId))})
  },this);});
   if(result.type==="WAITING"){this.scene.paused=true;return;}
   const p=result.result?.presentation;if(p){this.scene.target(p.targetId,p,p.actorId);}
   if(result.type==="COMPLETE")this.scene.finish();return result;
  }
  update(ms){if(!this.scene)return;this.scene.update(ms);if(this.scene.completed){this.scene=null;this.battle.animationComplete();return;}if(this.scene.idle&&!this.scene.closed&&!this.scene.paused)this.step();}
 }
 G.systems.BattleController=BattleController;
}(window.GBTRPG));
