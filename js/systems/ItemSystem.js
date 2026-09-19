(function (G) {
  "use strict";

  class ItemSystem {
    static effects(unit,context={}){if(unit.tactical&&unit.tactical.life!=="ALIVE")return [];return [...G.campaign.AbilityLoadoutSystem.equipped(unit).map(a=>a.effect),...(context.effects||[])];}
    static components(definition){return definition.restoration?{hp:definition.restoration.hp||0,mp:definition.restoration.mp||0}:definition.effect?.kind==="HEAL"?{hp:definition.effect.amount,mp:0}:{hp:0,mp:0};}
    static restoration(unit,definition,context={}){const out=this.components(definition);for(const e of this.effects(unit,context).filter(e=>e.handler==="restoration")){out.hp*=e.hpMultiplier;out.mp=Math.ceil(out.mp*e.mpMultiplier);}G.campaign.Validation.assert(Object.values(out).every(n=>Number.isSafeInteger(n)&&n>=0),"invalid item restoration");return out;}
    static conservationEligible(source){return !["TOSS_ITEM","FORAGE_USE","FORAGE_THROW"].includes(source);}
    static removable(statuses){return statuses.filter(s=>s.negative===true&&s.removable===true);}
    static panacea(definition,statuses){G.campaign.Validation.assert(definition.curative===true||definition.effect?.kind?.startsWith("CURE_"),"curative consumable required");return this.removable(statuses).map(s=>s.id);}
    static purification(unit,definition,statuses,context={}){
      const eligible=this.removable(statuses);
      if(!this.effects(unit,context).some(e=>e.handler==="purifyingMedicine")||this.components(definition).hp<=0||!eligible.length)return{status:"INELIGIBLE",removeIds:[]};
      const result=context.decide?.("purifyingMedicine",{eligible})??null;
      if(result===null)return{status:"UNRESOLVED_PURIFICATION",removeIds:[]};
      G.campaign.Validation.assert(typeof result==="boolean","resolved purification outcome required");
      if(!result)return{status:"RESOLVED",removeIds:[]};
      const selected=eligible.length===1?eligible[0].id:context.chooseStatus?.(eligible);
      G.campaign.Validation.assert(eligible.some(s=>s.id===selected),"resolved random removable status required");
      return{status:"RESOLVED",removeIds:[selected]};
    }
    static consumption(unit,definition,source="ITEM",context={}){
      const V=G.campaign.Validation,effects=this.effects(unit,context),decide=context.decide||(()=>null);
      let preserved=false;
      if(this.conservationEligible(source)&&effects.some(e=>e.handler==="conservation")){
        const result=decide("conservation",{source,definition});if(result===null)return{status:"UNRESOLVED_CONSERVATION"};V.assert(typeof result==="boolean","invalid conservation outcome");preserved=result;
      }
      const buff=definition.temporaryStatBuff,affected=(buff?.stats||[]).filter(k=>G.config.CHARACTER_STATS.primaryKeys.includes(k));let permanentStat=null;
      if(!preserved&&buff&&affected.length&&effects.some(e=>e.handler==="catalyze")){
        const result=decide("catalyze",{definition,affected});if(result===null)return{status:"UNRESOLVED_CATALYZE"};V.assert(typeof result==="boolean","invalid Catalyze outcome");
        if(result){permanentStat=affected.length===1?affected[0]:context.chooseStat?.(affected);V.assert(affected.includes(permanentStat),"resolved affected-stat selection required");}
      }
      return{status:"RESOLVED",consumed:!preserved,preserved,permanentStat,durationExtension:buff&&effects.some(e=>e.handler==="catalyze")?null:0};
    }
    static plan(world,actorId,targetId,itemId,source="ITEM",context={}){
      const V=G.campaign.Validation,actor=world.units[actorId],target=world.units[targetId],item=world.itemInstances[itemId],def=G.data.ITEMS[item?.definitionId];
      V.assert(actor&&target&&G.systems.BattleStatusSystem.active(actor)&&G.systems.BattleStatusSystem.active(target)&&item?.state==="PERSONAL"&&item.place.type==="UNIT"&&item.place.id===actorId&&item.ownerFaction===actor.faction&&def?.category==="CONSUMABLE","carried consumable required");
      const consumption=this.consumption(actor,def,source,context);if(consumption.status!=="RESOLVED")return consumption;
      return{...consumption,itemId,definitionId:item.definitionId,actorId,targetId,source,restoration:this.restoration(actor,def,context),purifying: this.effects(actor,context).some(e=>e.handler==="purifyingMedicine")&&this.components(def).hp>0?{chance:null,removableCount:1}:null};
    }
    static commit(world,plan){
      const V=G.campaign.Validation,item=world.itemInstances[plan.itemId];V.assert(plan.status==="RESOLVED","unresolved item plan");
      V.assert(item&&item.definitionId===plan.definitionId&&item.state==="PERSONAL"&&item.place.type==="UNIT"&&item.place.id===plan.actorId&&world.units[plan.targetId],"stale item consumption plan");
      if(plan.permanentStat){const unit=world.units[plan.targetId],value=unit.basePrimary[plan.permanentStat]+1;V.assert(Number.isSafeInteger(value),"permanent stat overflow");unit.basePrimary[plan.permanentStat]=value;}
      if(plan.consumed)delete world.itemInstances[plan.itemId];
      return plan;
    }
    static emergency(world,unitId,hp,maxHp,qualifyingDamage,context={}){
      const unit=world.units[unitId],effect=this.effects(unit,context).find(e=>e.handler==="emergencyMedicine");
      if(!effect||qualifyingDamage!==true||hp>=maxHp*effect.belowHpFraction)return{status:"INELIGIBLE",itemId:null};
      const candidates=G.campaign.InventorySystem.personal(world,unitId).map(i=>({itemId:i.id,healing:this.restoration(unit,G.data.ITEMS[i.definitionId],context).hp})).filter(c=>c.healing>0&&c.healing<=maxHp-hp).sort((a,b)=>b.healing-a.healing||a.itemId.localeCompare(b.itemId));
      return candidates.length?{status:"SELECTED",...candidates[0],activationChance:effect.chance}:{status:"NO_NONOVERHEALING_ITEM",itemId:null};
    }
    static forageChoice(world,unitId,choice){G.campaign.Validation.assert(["USE","THROW","STORE"].includes(choice),"invalid Forage choice");return{source:choice==="STORE"?"ITEM":choice==="USE"?"FORAGE_USE":"FORAGE_THROW",canStore:choice!=="STORE"||G.campaign.InventorySystem.canAcquire(world,unitId),table:null};}
    static refinePlan(world,unitId,firstId,secondId,calculator=null){
      const V=G.campaign.Validation,a=world.itemInstances[firstId],b=world.itemInstances[secondId];
      V.assert(a&&b&&firstId!==secondId&&a.definitionId===b.definitionId&&[a,b].every(i=>i.state==="PERSONAL"&&i.place.type==="UNIT"&&i.place.id===unitId)&&G.data.ITEMS[a.definitionId]?.category==="CONSUMABLE","two identical carried consumables required");
      if(!calculator)return{status:"UNRESOLVED_REFINE",inputIds:[firstId,secondId]};
      const output=calculator(G.data.ITEMS[a.definitionId]),definition=G.data.ITEMS[output?.definitionId];V.assert(definition?.category==="CONSUMABLE","resolved refined definition required");
      const base=this.components(G.data.ITEMS[a.definitionId]),next=this.components(definition);
      V.assert(base.hp+base.mp>0&&next.hp+next.mp>2*(base.hp+base.mp),"refined scalable effect must exceed both originals combined");
      return{status:"RESOLVED",inputIds:[firstId,secondId],definitionId:output.definitionId,unitId};
    }
    static commitRefine(world,plan){const V=G.campaign.Validation;V.assert(plan.status==="RESOLVED","unresolved refine plan");V.assert(plan.inputIds?.length===2,"two refine inputs required");this.refinePlan(world,plan.unitId,...plan.inputIds,()=>({definitionId:plan.definitionId}));let n=world.nextItemId||1;while(world.itemInstances["item"+n])n++;const id="item"+n;world.nextItemId=n+1;for(const input of plan.inputIds)delete world.itemInstances[input];world.itemInstances[id]={id,definitionId:plan.definitionId,ownerFaction:world.units[plan.unitId].faction,state:"PERSONAL",place:{type:"UNIT",id:plan.unitId},assignedUnitId:null};return id;}
  }

  G.systems.ItemSystem = ItemSystem;
}(window.GBTRPG));
