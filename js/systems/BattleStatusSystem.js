(function(G){
  "use strict";
  const V=G.campaign.Validation,L=G.campaign.AbilityLoadoutSystem;
  const active=u=>!!u&&(!u.status||u.status==="ACTIVE")&&(!u.tactical||u.tactical.life==="ALIVE");
  function initialize(stats,resources={}){const t={maxHp:stats.maxHp,maxMp:stats.maxMp,hp:resources.hp??stats.maxHp,mp:resources.mp??stats.maxMp,life:"ALIVE",dyingCounter:null,statuses:V.clone(resources.statuses||[])};V.assert(t.hp>0&&t.hp<=t.maxHp&&t.mp>=0&&t.mp<=t.maxMp,"invalid initial battle resources");return t;}
  const adjacent=(w,a,b)=>w.positions[a.id]&&w.positions[b.id]&&G.systems.TargetingSystem.distance(w.positions[a.id],w.positions[b.id])===1;
  function enterDying(w,u){const t=u.tactical;if(t.life!=="ALIVE")return;t.hp=0;t.life="DYING";t.dyingCounter=3;
    if(Object.values(w.units).some(other=>other.faction!==u.faction&&active(other)&&adjacent(w,u,other)&&L.effects(other,"martyr").length))t.dyingCounter=2;
    const turn=w.turns[u.id];if(turn){turn.majorUsed=true;turn.movementLocked=true;turn.remainingMov=0;turn.incapacitated=true;}
  }
  function damage(w,id,amount,context={}){const u=w.units[id];V.assert(u&&active(u),"ordinary damage cannot affect Dying/Dead");const t=u.tactical;if(G.core.DeveloperRuntime.protected(u))return{damage:0,hp:t.hp,life:t.life};let value=amount;
    if(context.cast?.dealsDamage){for(const e of L.effects(u,"divineWard"))value*=e.damageMultiplier;for(const e of L.effects(u,"arcaneSiphon")){value*=e.damageMultiplier;V.assert(Number.isSafeInteger(context.cast.paidMpCost),"resolved paid MP cost required");t.mp=Math.min(t.maxMp,t.mp+context.cast.paidMpCost);context.emitReaction?.({actorId:id,targetId:id,kind:"ARCANE SIPHON",message:"ARCANE SIPHON +"+context.cast.paidMpCost+" MP"});}}
    value=G.systems.RuleNumbers.integer(value,"damage",context.rounding);
    let hp=Math.max(0,t.hp-value);
    if(hp===0){for(const ally of Object.values(w.units).filter(a=>a.id!==u.id&&a.faction===u.faction&&active(a)&&adjacent(w,a,u)&&L.effects(a,"prayer").length)){
      const chance=G.config.SPELLS.prayerChance;let result;
      // Retain explicit resolved-outcome adapters; otherwise evaluate the supplied RNG roll.
      if(typeof context.prayerDecision==="function")result=context.prayerDecision(ally,u,chance);
      else{V.assert(typeof context.prayerRoll==="function","Prayer RNG required");const roll=context.prayerRoll(ally,u);V.assert(Number.isFinite(roll)&&roll>=0&&roll<1,"invalid Prayer roll");result=roll<chance;}
      V.assert(typeof result==="boolean","resolved Prayer outcome required");if(result){context.emitReaction?.({actorId:ally.id,targetId:id,kind:"PRAYER",message:"PRAYER / SURVIVE WITH 1 HP"});hp=1;break;}
    }}
    t.hp=hp;if(!hp)enterDying(w,u);return{damage:value,hp,life:t.life};
  }
  function startTurn(w,id){const u=w.units[id];if(u.tactical.life==="DYING")u.tactical.dyingCounter=Math.max(0,u.tactical.dyingCounter-1);}
  function endTurn(w,id){const u=w.units[id];if(u.tactical.life==="DYING"&&u.tactical.dyingCounter===0){u.tactical.life="DEAD";delete w.positions[id];for(const roster of Object.values(w.rosters))roster.unitIds=roster.unitIds.filter(x=>x!==id);return true;}return false;}
  function raise(u,fraction=0.5,rounding){V.assert(u.tactical.life==="DYING","Raise requires Dying, never Dead");const hp=G.systems.RuleNumbers.integer(u.tactical.maxHp*fraction,"Raise HP",rounding);V.assert(hp>0,"Raise must restore positive HP");u.tactical.hp=Math.min(u.tactical.maxHp,hp);u.tactical.life="ALIVE";u.tactical.dyingCounter=null;}
  function statusChance(u,chance,hostile=true){V.assert(Number.isFinite(chance)&&chance>=0&&chance<=1,"invalid status probability");return Math.max(0,chance-(hostile?L.effects(u,"divineWard").reduce((n,e)=>n+e.statusChanceReduction,0):0));}
  function movementComplete(u,turn,tiles,rounding){if(!active(u)||tiles<=0||turn.movementCompleted)return{restored:0};const effects=L.effects(u,"movementRestore");let total=0;for(const e of effects){const t=u.tactical;if(!t)continue;const max=e.resource==="hp"?t.maxHp:t.maxMp,amount=G.systems.RuleNumbers.integer(max*e.fraction,"movement restoration",rounding);const old=t[e.resource];t[e.resource]=Math.min(max,old+amount);total+=t[e.resource]-old;}turn.movementCompleted=true;return{restored:total};}
  function flying(u){return active(u)&&G.systems.FlyingSystem.sources(u).length>0;}
  function canMove(u){return active(u)&&!u.tactical?.statuses.some(s=>["STUNNED","FROZEN","IMMOBILIZED","SLEEP"].includes(s.id));}
  G.systems.BattleStatusSystem={active,initialize,adjacent,enterDying,damage,startTurn,endTurn,raise,statusChance,movementComplete,flying,canMove};
}(window.GBTRPG));
