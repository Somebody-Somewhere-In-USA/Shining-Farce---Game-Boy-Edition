(function(G){
  "use strict";
  function initialize(records=[]){const V=G.campaign.Validation,ids=new Set();for(const r of records){V.assert(V.validId(r.id)&&!ids.has(r.id)&&G.data.ITEMS[r.definitionId]&&Number.isSafeInteger(r.x)&&Number.isSafeInteger(r.y),"invalid hidden battlefield item");ids.add(r.id);}return V.clone(records);}
  function query(unit,position,records,context={}){
    const effect=G.campaign.AbilityLoadoutSystem.effects(unit,"scrounger")[0];if(!effect)return{status:"NO_SCROUNGER",notify:false};
    if(!position)return{status:"UNRESOLVED_POSITION",notify:false};
    if(!context.distance)return{status:"UNRESOLVED_DISTANCE",notify:false};
    const nearby=records.filter(r=>!r.claimed&&context.distance(position,r)<=effect.radius);
    if(!nearby.length)return{status:"NONE",notify:false};
    if(nearby.length>1&&!context.select)return{status:"UNRESOLVED_ITEM_SELECTION",notify:true};
    const item=nearby.length===1?nearby[0]:context.select(nearby,position);G.campaign.Validation.assert(nearby.includes(item),"invalid Scrounge selection");
    const dx=Math.sign(item.x-position.x),dy=Math.sign(item.y-position.y),direction=(dy<0?"N":dy>0?"S":"")+(dx<0?"W":dx>0?"E":"");
    return{status:direction?"DIRECTION":"ON_ITEM",notify:true,direction:direction||null,itemId:item.id,majorAction:true,movCost:null,fullInventoryPolicy:null};
  }
  // Placement belongs to scenario/event data. Claiming awaits distance/tie/cost/capacity policy.
  G.systems.HiddenItemSystem={initialize,query};
}(window.GBTRPG));
