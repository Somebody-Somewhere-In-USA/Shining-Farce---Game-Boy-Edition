(function(G){
  "use strict";
  // Final Mage identity; migration preserves only specific old equipment instances.
  Object.assign(G.data.CLASSES.mage,{playable:true,legacy:false,growth:{int:1},movModifier:0,equipmentPermissions:[{slot:"weapon",families:["WAND"]},{slot:"armor",families:["ROBE"]}]});
  G.data.CLASSES.cleric={id:"cleric",name:"CLERIC",playable:true,prerequisites:[],prerequisiteStatus:"UNSPECIFIED",growth:{wis:1},movModifier:null,equipmentPermissions:[],equipmentStatus:"TBD",initialCurrentCPGrant:null,primaryAction:"cleric"};
  G.data.CLASSES.wizard={id:"wizard",name:"WIZARD",playable:true,prerequisites:[{classId:"mage",level:5}],growth:{int:2},movModifier:0,equipmentPermissions:[{slot:"weapon",families:["STAFF"]},{slot:"armor",families:["ROBE"]}],initialCurrentCPGrant:null,primaryAction:"wizard"};
  const a=G.data.ABILITIES;
  function add(id,classId,category,level,name,description,effect,extra={}){a[id]={id,classId,category,level,name,description,effect,implementation:"FUNCTIONAL_RULE",...extra};}
  for(const s of Object.values(G.data.SPELLS))add(s.id,s.owningClassId,"ACTION",s.requiredClassLevel,s.name,"Spell: "+s.effect+". Range, radius, magnitude and MP are separate; unresolved balance values block casting.",{handler:"spell",spellId:s.id},{command:"MAGIC",majorAction:true,doubleAttackEligible:false,spellFamily:s.spellFamily,spellLevel:s.spellLevel,spellId:s.id});
  for(const [id,level,range,radius,magnitude,mp]of [["extend",1,1,0,1,1.1],["focus",3,0,null,1.75,1.25],["expand",5,0,1,1,1.5],["overcharge",7,0,0,2,2.5]])add(id,"wizard","ACTION",level,id.toUpperCase(),"Casting method; modifies an accessible compatible spell. No independent CP award.",{handler:"castingModifier",rangeBonus:range,radiusBonus:radius,radiusOverride:id==="focus"?1:null,magnitudeMultiplier:magnitude,mpMultiplier:mp,requiresInnateArea:id==="focus"},{castingModifier:true,command:null,majorAction:false});
  add("spellCounter","wizard","REACTION",2,"SPELL COUNTER","20% chance before normal counter; player chooses a purchased Lv1 Mage spell for 0 MP.",{handler:"spellCounter",chance:0.2,mpCost:0,ownerClass:"mage",selection:null});
  add("arcaneSiphon","wizard","REACTION",6,"ARCANE SIPHON","Damaging magic restores its paid MP cost and deals 10% less damage.",{handler:"arcaneSiphon",chance:1,damageMultiplier:0.9});
  for(const [id,level,owner]of [["divineArcana",4,"cleric"],["hexArcana",6,"hexer"],["enchantingArcana",7,"enchanter"],["restorativeArcana",9,"advancedHealer"]])add(id,"wizard","SUPPORT",level,id.replace(/([A-Z])/g," $1").toUpperCase(),"Authorizes compatible "+owner+" spells for accessible Wizard casting methods.",{handler:"arcana",classId:owner});
  add("intelligenceTraining","wizard","SUPPORT",8,"INTELLIGENCE TRAINING","Future INT growth +2 while equipped.",{handler:"growth",stat:"int",bonus:2});
  add("manaStep","wizard","MOVEMENT",10,"MANA STEP","First completed movement each turn restores 5% MAX MP.",{handler:"movementRestore",resource:"mp",fraction:0.05});
  for(const [id,category,name,description,effect]of [
    ["prayer","REACTION","PRAYER","25% chance: an adjacent friendly unit remains at 1 HP instead of entering Dying. Statuses remain.",{handler:"prayer",chance:G.config.SPELLS.prayerChance}],
    ["martyr","REACTION","MARTYR","An adjacent enemy newly entering Dying immediately has its counter reduced by 1.",{handler:"martyr",reduction:1}],
    ["faith","SUPPORT","FAITH","Future WIS growth +1 while equipped.",{handler:"growth",stat:"wis",bonus:1}],
    ["divineWard","SUPPORT","DIVINE WARD","Spell damage x0.7; hostile spell status chance minus 30 percentage points.",{handler:"divineWard",damageMultiplier:0.7,statusChanceReduction:0.3}],
    ["gracefulStep","MOVEMENT","GRACEFUL STEP","First completed movement each turn restores 5% MAX HP.",{handler:"movementRestore",resource:"hp",fraction:0.05}]
  ])add(id,"cleric",category,{prayer:3,martyr:7,faith:6,divineWard:8,gracefulStep:10}[id],name,description,effect);
  for(const c of Object.values(G.data.CLASSES))c.abilityIds=Object.values(a).filter(x=>x.classId===c.id).map(x=>x.id);
}(window.GBTRPG));
