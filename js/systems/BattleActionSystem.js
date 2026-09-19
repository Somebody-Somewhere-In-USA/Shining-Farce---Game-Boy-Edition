(function(G){
 "use strict";
 const V=G.campaign.Validation;
 function prepare(s,id,spellId,method,target,options={}){
  const M=G.systems.MagicSystem,T=G.systems.TargetingSystem,u=s.units[id],cast=M.resolve(u,spellId,method,options);
  V.assert(!s.presentation.pendingWinner,"battle conclusion already pending");
  M.validateReady(cast);V.assert(["DAMAGE","HEAL","CURE","RAISE","STATUS","PORTAL"].includes(cast.effect),"spell effect handler not implemented");
  V.assert(u.tactical.mp>=cast.paidMpCost,"INSUFFICIENT MP");V.assert(!u.tactical.statuses.some(x=>x.id==="MUTE"),"MUTE prevents casting");
  const origin=s.positions[id];V.assert(origin,"caster position missing");let affected=[];
  if(cast.effect==="PORTAL")G.systems.PortalSystem.place(s,id,cast,target,options);
  else{
   V.assert(target&&T.distance(origin,target)<=cast.castingRange&&(!options.inBounds||options.inBounds(target.x,target.y)),"spell target out of range");
   const center=G.systems.PortalSystem.occupant(s,target);
   V.assert(cast.effectRadius>1&&cast.areaAllegiances||center&&T.unitAllowed(u,center,cast),"illegal spell target");
   affected=T.affectedUnits(s,u,cast,target).map(x=>x.id);
  }
  if(!options.counter)G.systems.TurnSystem.consume(s.turns[id],"MAGIC",G.data.ABILITIES[spellId]);
  u.tactical.mp-=cast.paidMpCost;s.presentation.phase="ANIMATION";
  s.actionSerial=(s.actionSerial||0)+1;
  return{executionId:"spell-event-"+s.actionSerial,actorId:id,spellId,cast,target:V.clone(target),targetIds:affected,resolvedIds:[],provenance:{spellCounterGenerated:options.counter===true},finished:false};
 }
 function resolveTarget(s,plan,id,options={}){
  const B=G.systems.BattleStatusSystem,u=s.units[plan.actorId],other=s.units[id],cast=plan.cast;
  if(s.presentation.pendingWinner||!other||!(cast.effect==="RAISE"?other.tactical.life==="DYING":B.active(other)))return{skipped:true};
  const t=other.tactical,before={hp:t.hp,mp:t.mp,life:t.life},reactions=[];
  if(cast.dealsDamage)B.damage(s,id,cast.magnitude.amount,{...options,cast,emitReaction:r=>reactions.push(r)});
  if(cast.effect==="RAISE")B.raise(other,cast.magnitude.amount,options.rounding);
  else if(cast.restoresHp)t.hp=Math.min(t.maxHp,t.hp+G.systems.RuleNumbers.integer(cast.magnitude.amount,"spell healing",options.rounding));
  t.statuses=t.statuses.filter(x=>!cast.curesStatuses.includes(x.id));
  if(B.active(other))for(const status of cast.appliesStatuses){const hostile=u.faction!==other.faction,chance=B.statusChance(other,status.chance??(hostile?null:1),hostile);if(chance>0&&chance<1)V.assert(typeof options.statusRoll==="function","UNRESOLVED STATUS OUTCOME");if(chance===1||chance>0&&options.statusRoll()<chance){if(status.id==="FLYING"){G.systems.FlyingSystem.grant(other,status,plan.actorId);s.turns[id].escapeRequired=false;}else{t.statuses=t.statuses.filter(x=>x.id!==status.id);t.statuses.push({...status,sourceId:plan.actorId});}}}
  plan.resolvedIds.push(id);G.systems.CombatSystem.detectConclusion(s);
  return{targetId:id,before,after:{hp:t.hp,mp:t.mp,life:t.life},reactions};
 }
 function finish(s,plan,options={}){
  V.assert(!plan.finished,"action already completed");plan.finished=true;
  const receipt={executionId:plan.executionId,abilityId:plan.spellId,command:"MAGIC",legal:true,executed:true,successful:true,method:plan.cast.method,affectedUnitIds:[...plan.resolvedIds]};
  const cp=plan.cast.counter?{status:"REACTION_NO_CP",recipients:{}}:G.campaign.ClassProgressionSystem.awardAction(s.units[plan.actorId],receipt,options.cpCalculator);
  s.actionRecords.push({...receipt,actorId:plan.actorId,owningClassId:plan.cast.owningClassId,provenance:plan.provenance,cp});return{cast:plan.cast,affectedUnitIds:receipt.affectedUnitIds,cp};
 }
 G.systems.BattleActionSystem={prepare,resolveTarget,finish};
}(window.GBTRPG));
