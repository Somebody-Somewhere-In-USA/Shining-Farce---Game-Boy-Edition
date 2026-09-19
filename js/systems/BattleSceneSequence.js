(function(G){
 "use strict";
 const V=G.campaign.Validation;
 function side(faction,opponent){return faction==="PLAYER"||faction==="WILDERNESS"&&opponent==="ZEON"?"LEFT":"RIGHT";}
 function composition(world,actorId,targetId){const actor=world.units[actorId],target=world.units[targetId],self=actorId===targetId,same=actor.faction===target.faction,adjacent=!self&&!same&&G.systems.TargetingSystem.distance(world.positions[actorId],world.positions[targetId])===1;return{actorId,targetId,self,adjacent,sameFaction:same,actorSide:side(actor.faction,target.faction),targetSide:side(target.faction,actor.faction),sprites:[...new Set([actorId,targetId])]};}
 class BattleSceneSequence {
  constructor(world,actorId,targetIds){this.world=world;this.actorId=actorId;this.targetIds=[...targetIds];this.frames=[];this.elapsed=0;this.index=0;this.paused=false;this.completed=false;this.camera=0;this.events=[];const t=G.config.BATTLE.sceneTiming;this.add("BLACK",t.black,actorId);this.add("ENTRANCE",t.entrance,actorId);this.add("IDLE",t.idle,actorId);}
  add(type,duration,focusId,extra={}){this.frames.push({type,duration,focusId,...extra});}
  target(id,result={},actorId=this.actorId){const t=G.config.BATTLE.sceneTiming,c=composition(this.world,actorId,id);this.add("ACTION",t.action,actorId,{composition:c});if(!c.adjacent&&!c.self)this.add("WHIP_PAN",t.pan,id,{composition:c});this.add("EFFECT",t.effect,id,{composition:c,result});for(const r of result.reactions||[])this.reaction(r.actorId,r.targetId,r.message);if(!c.adjacent&&!c.self)this.add("WHIP_PAN",t.pan,actorId,{composition:c});this.add("RESULT",t.result,actorId,{composition:c,result});}

  reaction(id,targetId,message){const t=G.config.BATTLE.sceneTiming;this.add("WHIP_PAN",t.pan,id);this.add("REACTION",t.action,id,{message});this.add("RESULT",t.result,id,{message});this.add("WHIP_PAN",t.pan,targetId);}
  finish(){this.add("EXIT",G.config.BATTLE.sceneTiming.exit,this.actorId);this.add("RETURN_MAP",0,this.actorId);this.closed=true;}
  update(ms){if(this.paused||this.completed)return;V.assert(Number.isFinite(ms)&&ms>=0,"invalid scene time");this.elapsed+=ms;while(this.index<this.frames.length&&this.elapsed>=this.frames[this.index].duration){this.elapsed-=this.frames[this.index].duration;this.index++;}if(this.index>=this.frames.length){this.elapsed=0;if(this.closed)this.completed=true;}}
  current(){return this.frames[this.index]||null;}
  get idle(){return this.index>=this.frames.length;}
 }
 G.systems.BattleSceneSequence=BattleSceneSequence;G.systems.BattleSceneComposition=composition;
}(window.GBTRPG));
