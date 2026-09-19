(function(G){
  "use strict";
  function stepCost(unit,turn,dx,dy){
    const fleet=G.campaign.AbilityLoadoutSystem.effects(unit,"perpendicularPairDiscount").length>0,p=turn.pendingStep;
    return fleet&&p&&p.dx*dx+p.dy*dy===0?{cost:0,nextPending:null}:{cost:1,nextPending:fleet?{dx,dy}:null};
  }
  function traverse(unit,position,turn,steps,context){
    const V=G.campaign.Validation,t=V.clone(turn),p={...position};
    V.assert(G.systems.BattleStatusSystem.canMove(unit)&&!t.ended&&!t.movementLocked,"movement unavailable");
    V.assert(!unit.tactical?.escapeRequired,"ESCAPE ILLEGAL TERRAIN FIRST");
    // Validate an entire orthogonal path before committing. Allied cells can be intermediate only.
    for(let n=0;n<steps.length;n++){
      const [dx,dy]=steps[n];V.assert(Number.isInteger(dx)&&Number.isInteger(dy)&&Math.abs(dx)+Math.abs(dy)===1,"orthogonal steps required");
      const x=p.x+dx,y=p.y+dy;V.assert((!context.inBounds||context.inBounds(x,y))&&(G.systems.BattleStatusSystem.flying(unit)||context.canEnter(x,y)),"impassable terrain");
      const occupant=context.occupant?.(x,y);
      V.assert(!occupant||occupant.id===unit.id||occupant.tactical?.life==="DYING"||occupant.faction===unit.faction,"enemy blocks passage");
      V.assert(!occupant||occupant.id===unit.id||n<steps.length-1,"occupied movement endpoint");
      const step=stepCost(unit,t,dx,dy),cost=G.systems.BattleStatusSystem.flying(unit)?1:(context.cost?context.cost(x,y):1)*step.cost,nextPending=step.nextPending;V.assert(Number.isInteger(cost)&&cost>=0,"invalid terrain MOV cost");V.assert(t.remainingMov>=cost,"insufficient MOV");
      t.remainingMov-=cost;t.movSpent=(t.movSpent||0)+cost;t.tilesMoved++;t.pendingStep=nextPending;p.x=x;p.y=y;
    }
    const draft=V.clone(unit);G.systems.BattleStatusSystem.movementComplete(draft,t,steps.length,context.rounding);if(draft.tactical)unit.tactical=draft.tactical;
    Object.assign(turn,t);Object.assign(position,p);return{position:p,tilesMoved:t.tilesMoved};
  }
  G.systems.TacticalMovementRules={stepCost,traverse};
}(window.GBTRPG));
