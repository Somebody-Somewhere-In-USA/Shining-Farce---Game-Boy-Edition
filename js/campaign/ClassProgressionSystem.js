(function(G){
  "use strict";
  const V=G.campaign.Validation;
  function level(lifetimeCP){V.assert(Number.isSafeInteger(lifetimeCP)&&lifetimeCP>=0,"invalid Lifetime CP");return G.config.CLASSES.thresholds.filter(n=>lifetimeCP>=n).length;}
  function progress(unit,id){return unit.classProgress[id]||{lifetimeCP:0,currentCP:0,classLevel:1,entryGrantCP:null};}
  function earn(unit,id,amount){
    V.assert(V.validId(id)&&Number.isSafeInteger(amount)&&amount>=0,"invalid CP award");
    const draft=V.clone(unit);G.campaign.ClassEntryGrantSystem.access(draft,id);
    const p=progress(draft,id),lifetimeCP=p.lifetimeCP+amount,currentCP=p.currentCP+amount;
    V.assert(Number.isSafeInteger(lifetimeCP)&&Number.isSafeInteger(currentCP),"CP overflow");
    unit.classProgress[id]={lifetimeCP,currentCP,classLevel:level(lifetimeCP),entryGrantCP:p.entryGrantCP};
  }
  function prerequisites(unit,requirements){return requirements.map(r=>({...r,actual:progress(unit,r.classId).classLevel,met:progress(unit,r.classId).classLevel>=r.level}));}
  function availability(unit,id){const c=G.data.CLASSES[id];if(!c?.playable)return{allowed:false,reason:"CLASS NOT AVAILABLE FOR TRAINING",requirements:[]};const requirements=prerequisites(unit,c.prerequisites);return{allowed:requirements.every(r=>r.met),reason:requirements.every(r=>r.met)?null:"PREREQUISITES NOT MET",requirements};}
  function attribution(unit,action,amount){
    V.assert(Number.isSafeInteger(amount)&&amount>=0,"invalid CP amount");
    const identity=G.systems.ExecutionReceiptSystem.identity(unit,typeof action==="string"?{abilityId:action}:action);if(!identity)return{};
    if(identity.accessSource!=="SECONDARY")return{[unit.currentClassId]:amount};
    return{[unit.currentClassId]:Math.ceil(amount/2),[identity.owningClassId]:Math.floor(amount/2)};
  }
  function awardAction(unit,execution,calculator=G.campaign.CPAwardCalculator){
    if(!G.systems.ExecutionReceiptSystem.qualifies(execution))return{status:"NO_CP",recipients:{}};
    const receipt=G.systems.ExecutionReceiptSystem.normalize(unit,execution);if(!receipt)return{status:"NO_CP",recipients:{}};
    const amount=calculator.calculate(V.freeze(V.clone(receipt)),V.freeze(V.clone(unit)));
    if(amount===null)return{status:"UNRESOLVED_FORMULA",recipients:{}};
    const recipients=attribution(unit,receipt,amount),draft=V.clone(unit);
    for(const [id,n]of Object.entries(recipients))if(n>0)earn(draft,id,n);
    unit.classProgress=draft.classProgress;return{status:"AWARDED",receipt,recipients};
  }
  G.campaign.CPAwardCalculator={calculate(){return null;}};
  G.campaign.ClassProgressionSystem={level,progress,earn,prerequisites,availability,attribution,awardAction};
}(window.GBTRPG));
