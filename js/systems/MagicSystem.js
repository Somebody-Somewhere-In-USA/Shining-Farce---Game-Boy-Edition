(function(G){
  "use strict";
  const V=G.campaign.Validation,L=G.campaign.AbilityLoadoutSystem;
  class MagicSystem {
    static methods(unit,spell){return L.actions(unit).filter(a=>a.castingModifier&&this.compatible(unit,spell,a.id)).map(a=>({id:a.id,name:a.name}));}
    static compatible(unit,spell,method){const a=G.data.ABILITIES[method],c=spell.modifierCompatibility;if(!a?.castingModifier||!L.actions(unit).some(x=>x.id===method)||!c.allowed.includes(method))return false;if(a.effect.requiresInnateArea&&!((spell.innateRadius??spell.effectRadius)>1))return false;return c.inherent||L.effects(unit,"arcana").some(e=>e.classId===spell.owningClassId||e.classId===c.arcanaGroup);}
    static definition(id,balance=G.config.SPELLS.balance){
      const base=G.data.SPELLS[id];V.assert(base,"unknown spell");const s=V.clone(base),profile=balance[id]||{};
      for(const k of ["castingRange","effectRadius","mpCost"])if(s[k]===null&&profile[k]!==undefined)s[k]=profile[k];
      if(s.magnitude.amount===null){const value=base.magnitudeBalanceKey?balance[base.magnitudeBalanceKey]:profile.magnitude;s.magnitude.amount=value??null;}
      s.appliesStatuses=s.appliesStatuses.map(x=>({...x,duration:x.duration??profile.duration??null}));return s;
    }
    static resolve(unit,id,method=null,options={}){
      V.assert(!unit.tactical||unit.tactical.life==="ALIVE","Dying/Dead cannot cast");
      const s=this.definition(id,options.balance),a=G.data.ABILITIES[id];
      V.assert(options.counter===true?s.owningClassId==="mage"&&s.spellLevel===1&&L.learned(unit,id)&&L.effects(unit,"spellCounter").length>0:L.actions(unit).some(x=>x.id===id),"spell not purchased/accesssible");
      V.assert(method===null||typeof method==="string","only one casting method allowed");
      const innateRadius=s.effectRadius;
      if(method!==null&&method!=="normal"){
        V.assert(this.compatible(unit,s,method),"incompatible or inaccessible casting method");const e=G.data.ABILITIES[method].effect;
        if(s.castingRange!==null)s.castingRange+=e.rangeBonus;
        if(s.effectRadius!==null)s.effectRadius=e.radiusOverride??s.effectRadius+e.radiusBonus;
        if(s.magnitude.amount!==null)s.magnitude.amount*=e.magnitudeMultiplier;
        if(s.mpCost!==null)s.mpCost*=e.mpMultiplier;
      }
      if(options.counter===true||G.core.DeveloperRuntime.protected(unit))s.mpCost=0;
      if(s.mpCost!==null)s.mpCost=G.systems.RuleNumbers.integer(s.mpCost,"MP cost",options.rounding);
      V.assert(s.castingRange===null||Number.isInteger(s.castingRange)&&s.castingRange>=0,"invalid casting range");V.assert(s.effectRadius===null||Number.isInteger(s.effectRadius)&&s.effectRadius>=1,"invalid effect radius");
      return{...s,abilityId:a.id,owningClassId:a.classId,accessSource:a.classId===unit.currentClassId?"PRIMARY":"SECONDARY",method:method||"normal",innateRadius,paidMpCost:s.mpCost,counter:options.counter===true,provenance:{spellCounterGenerated:options.counter===true}};
    }
    static validateReady(cast){V.assert([cast.castingRange,cast.effectRadius,cast.mpCost,cast.magnitude.amount].every(Number.isFinite),"UNRESOLVED SPELL BALANCE");V.assert(cast.appliesStatuses.every(s=>s.duration!==null),"UNRESOLVED STATUS DURATION");}
  }
  G.systems.MagicSystem=MagicSystem;
}(window.GBTRPG));
