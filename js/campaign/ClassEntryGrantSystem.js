(function(G){
  "use strict";
  const V=G.campaign.Validation;
  function access(unit,classId){
    V.assert(V.validId(classId),"invalid class access");
    let p=unit.classProgress[classId];
    if(p&&p.entryGrantCP!==null)return 0;
    const amount=G.data.CLASSES[classId]?.initialCurrentCPGrant??0;
    V.assert(Number.isSafeInteger(amount)&&amount>=0,"invalid class-entry grant");
    p=p||{lifetimeCP:0,currentCP:0,classLevel:1,entryGrantCP:null};
    V.assert(Number.isSafeInteger(p.currentCP+amount),"Current CP overflow");
    unit.classProgress[classId]={...p,currentCP:p.currentCP+amount,entryGrantCP:amount};return amount;
  }
  function character(u){
      // Pre-schema-5 completed history is not replayed or converted into live units.
      if(!u.classProgress||!Array.isArray(u.learnedAbilityIds)||!u.abilityLoadout)return;
      const known=new Set([u.currentClassId,...Object.keys(u.classProgress),...u.learnedAbilityIds.map(id=>G.data.ABILITIES[id]?.classId),u.abilityLoadout.secondaryClassId].filter(Boolean));
      for(const id of known){const p=u.classProgress[id]||{lifetimeCP:0,currentCP:0,classLevel:1};u.classProgress[id]={...p,entryGrantCP:0};}
  }
  function migrate(s){
    const world=w=>{if(!w)return;Object.values(w.units||{}).forEach(character);Object.values(w.recruitPools||{}).flat().forEach(character);};
    const scenario=b=>b?.participants.forEach(p=>p.units.forEach(character));
    world(s);
    for(const r of [s.resolution,s.lastResolution])if(r){world(r.frozenWorld);world(r.resourceBefore);scenario(r.pendingBattleScenario);for(const b of r.battleResults)scenario(b.scenario);}
    s.schemaVersion=6;
  }
  G.campaign.ClassEntryGrantSystem={access,migrate};
}(window.GBTRPG));
