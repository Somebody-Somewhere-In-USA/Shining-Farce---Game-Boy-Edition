(function(G){
 "use strict";
 const V=G.campaign.Validation,R=G.core.DeterministicRandom;
 const alive=u=>G.systems.BattleStatusSystem.active(u),scheduled=u=>u&&(!u.status||u.status==="ACTIVE")&&["ALIVE","DYING"].includes(u.tactical.life);
 function stats(w,id){return G.campaign.InventorySystem.stats(w,id);}
 function initialize(w,seed){return{ct:Object.fromEntries(Object.keys(w.units).map(id=>[id,0])),tick:0,activeId:null,ready:[],rng:R.create(seed)};}
 function compare(w,a,b){const x=stats(w,a),y=stats(w,b);return y.agi-x.agi||y.dex-x.dex||y.mov-x.mov||y.str-x.str;}
 function order(w,ids,rng){const sorted=[...ids].sort((a,b)=>compare(w,a,b)),out=[];while(sorted.length){const first=sorted.shift(),group=[first];while(sorted.length&&compare(w,first,sorted[0])===0)group.push(sorted.shift());for(let n=group.length-1;n>0;n--){const k=R.integer(rng,0,n);[group[n],group[k]]=[group[k],group[n]];}out.push(...group);}return out;}
 function next(w,timeline){if(timeline.activeId)return timeline.activeId;timeline.ready=timeline.ready.filter(id=>scheduled(w.units[id]));if(!timeline.ready.length){const ids=Object.keys(timeline.ct).filter(id=>scheduled(w.units[id]));if(!ids.length)return null;let ticks=Infinity;for(const id of ids){const agi=stats(w,id).agi;V.assert(Number.isSafeInteger(agi)&&agi>0,"positive integer AGI required for CT");ticks=Math.min(ticks,Math.max(0,Math.ceil((1000-timeline.ct[id])/agi)));}timeline.tick+=ticks;for(const id of ids)timeline.ct[id]+=ticks*stats(w,id).agi;timeline.ready=order(w,ids.filter(id=>timeline.ct[id]>=1000),timeline.rng);}
  return timeline.activeId=timeline.ready.shift()||null;
 }
 function end(w,timeline,id){V.assert(timeline.activeId===id,"unit does not own CT control");timeline.ct[id]-=1000;timeline.activeId=null;}
 function forecast(world,timeline,count=G.config.BATTLE.timelineSlots,terrainFor=null){const w=V.clone(world),t=V.clone(timeline),entries=[],seen=new Set(),ids=Object.keys(w.units).filter(id=>alive(w.units[id]));let guard=0;while((entries.length<count||seen.size<ids.length)&&ids.length){V.assert(guard++<10000,"CT forecast horizon exceeds simulation guard");const controlled=t.activeId,id=next(w,t);if(!id)break;if(alive(w.units[id])){entries.push({unitId:id,tick:t.tick});seen.add(id);}if(!controlled||w.controlledUnitId!==id||w.turns[id].ended){w.turnNumbers[id]++;G.systems.BattleStatusSystem.startTurn(w,id);}G.systems.BattleStatusSystem.endTurn(w,id);if(terrainFor){G.systems.PortalSystem.endTurn(w,id);G.systems.FlyingSystem.endTurn(w,id,terrainFor(w,id));}w.turns[id].ended=true;end(w,t,id);}return entries;}

 G.systems.CTSystem={initialize,stats,compare,order,next,end,forecast,scheduled};
}(window.GBTRPG));

