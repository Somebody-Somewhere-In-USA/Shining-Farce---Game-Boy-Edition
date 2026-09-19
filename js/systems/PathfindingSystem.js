(function(G){
 "use strict";
 // Search uses the same step validator as execution, including Fleet-Footed history.
 class PathfindingSystem {
  static plan(world,id,destination,contextFor){
   const V=G.campaign.Validation,pending=[{world:V.clone(world),actions:[]}],best=new Map(),solutions=[];
   while(pending.length){pending.sort((a,b)=>b.world.turns[id].remainingMov-a.world.turns[id].remainingMov);const n=pending.shift(),w=n.world,p=w.positions[id],turn=w.turns[id],key=p.x+","+p.y+":"+JSON.stringify(turn.pendingStep);if((best.get(key)??-1)>=turn.remainingMov)continue;best.set(key,turn.remainingMov);
    const destinations=[destination,...Object.values(w.portals).filter(pair=>pair.faction===w.units[id].faction).flatMap(pair=>pair.endpoints)];
    for(const goal of destinations){const steps=this.find(w,id,goal,contextFor(w,id));if(!steps)continue;const draft=V.clone(w);draft.turns[id].movementCompleted=true;G.systems.TacticalMovementRules.traverse(draft.units[id],draft.positions[id],draft.turns[id],steps,contextFor(draft,id));const actions=[...n.actions,...(steps.length?[{command:"MOVE",steps}]:[])];
     if(goal.x===destination.x&&goal.y===destination.y)solutions.push({actions,remainingMov:draft.turns[id].remainingMov});
     if(G.systems.PortalSystem.availability(draft,id).allowed){G.systems.PortalSystem.enter(draft,id);pending.push({world:draft,actions:[...actions,{command:"ENTER PORTAL"}]});}
    }
   }
   solutions.sort((a,b)=>b.remainingMov-a.remainingMov||a.actions.length-b.actions.length);return solutions[0]||null;
  }
  static find(world,id,destination,context){const V=G.campaign.Validation,u=world.units[id],origin=world.positions[id],turn=world.turns[id];if(!origin||!G.systems.BattleStatusSystem.canMove(u)||turn.ended)return null;const pending=[{p:{...origin},t:V.clone(turn),steps:[]}],best=new Map();
   const key=n=>n.p.x+","+n.p.y+":"+JSON.stringify(n.t.pendingStep);
   while(pending.length){pending.sort((a,b)=>b.t.remainingMov-a.t.remainingMov||a.steps.length-b.steps.length);const n=pending.shift(),k=key(n);if((best.get(k)??-1)>=n.t.remainingMov)continue;best.set(k,n.t.remainingMov);if(n.p.x===destination.x&&n.p.y===destination.y)return n.steps;
    for(const step of [[0,-1],[1,0],[0,1],[-1,0]]){const p={...n.p},t=V.clone(n.t);t.movementCompleted=true;try{const next={x:p.x+step[0],y:p.y+step[1]},occupied=context.occupant?.(next.x,next.y);if(occupied&&occupied.id!==id&&next.x===destination.x&&next.y===destination.y)continue;
      // Allow allied/Dying intermediate tiles; the endpoint remains unoccupied.
      G.systems.TacticalMovementRules.traverse(V.clone(u),p,t,[step],{...context,rounding:context.rounding,occupant:(x,y)=>{const o=context.occupant?.(x,y);return o&&(o.tactical?.life==="DYING"||o.faction===u.faction)&&!(x===destination.x&&y===destination.y)?null:o;}});pending.push({p,t,steps:[...n.steps,step]});
    }catch(e){if(/UNRESOLVED ROUNDING/.test(e.message))throw e;}}
   }return null;
  }
 }
 G.systems.PathfindingSystem=PathfindingSystem;
}(window.GBTRPG));
