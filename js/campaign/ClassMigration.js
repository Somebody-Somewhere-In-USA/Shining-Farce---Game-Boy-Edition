(function(G){
  "use strict";
  const V=G.campaign.Validation;
  function character(u){
    for(const [id,p]of Object.entries(u.classProgress))if(Object.hasOwn(p,"cp")||!Object.hasOwn(p,"lifetimeCP")){
      V.assert((p.cp===undefined||Number.isSafeInteger(p.cp)&&p.cp>=0)&&(p.classLevel===undefined||Number.isSafeInteger(p.classLevel)&&p.classLevel>=1),"invalid old class CP");
      // Preserve both earned CP and the old independently stored level, conservatively.
      const floor=G.config.CLASSES.thresholds[Math.min(10,p.classLevel||1)-1];
      const cp=Math.max(p.cp||0,floor);u.classProgress[id]={lifetimeCP:cp,currentCP:cp,classLevel:G.campaign.ClassProgressionSystem.level(cp)};
    }
    if(!Object.hasOwn(u,"learnedAbilityIds"))u.learnedAbilityIds=[];
    if(!Object.hasOwn(u,"abilityLoadout"))u.abilityLoadout=G.campaign.AbilityLoadoutSystem.defaults();
  }
  function migrate(s){V.assert(s.phase==="PLANNING"&&!s.resolution,"version 4 class migration requires PLANNING; finish the old resolution first");for(const u of [...Object.values(s.units),...Object.values(s.recruitPools).flat()])character(u);s.schemaVersion=5;}
  G.campaign.ClassMigration={character,migrate};
}(window.GBTRPG));
