(function(G){
  "use strict";
  const spells={};
  G.data.RAISE_BEHAVIORS=Object.freeze({1:Object.freeze({effect:"RAISE",lifeTarget:"DYING",maxHpFraction:0.5}),2:Object.freeze({effect:"RAISE",lifeTarget:"DYING",maxHpFraction:1})});
  function add(id,owner,level,family,tier,effect,extra={}){
    spells[id]={id,name:family+" "+tier,spellFamily:family,spellLevel:tier,owningClassId:owner,requiredClassLevel:level,
      castingRange:null,effectRadius:null,magnitude:{kind:effect,amount:null},mpCost:null,element:null,
      dealsDamage:effect==="DAMAGE",restoresHp:effect==="HEAL",appliesStatuses:[],curesStatuses:[],
      targetAllegiances:[effect==="DAMAGE"?"ENEMY":"FRIENDLY"],targetTypes:["UNIT"],canTargetCaster:effect!=="DAMAGE",canTargetDying:false,canTargetDead:false,
      placement:null,effect,modifierCompatibility:{inherent:owner==="mage",allowed:["extend","focus","expand","overcharge"],arcanaGroup:owner},...extra};
  }
  for(const [family,element]of [["Blaze","FIRE"],["Freeze","ICE"],["Bolt","LIGHTNING"],["Gale","AIR"],["Quake","EARTH"],["Torrent","WATER"]])for(let tier=1;tier<=4;tier++){
    const id=family.toLowerCase()+tier;
    add(id,"mage",[1,3,5,7][tier-1],family.toUpperCase(),tier,"DAMAGE",{element,areaAllegiances:["FRIENDLY","ENEMY"],areaCanTargetCaster:true,effectRadius:[1,2,2,3][tier-1],magnitudeBalanceKey:family.toLowerCase()+"Magnitude"+(tier===2?1:tier),magnitudeProgression:tier<=2?"BASE":tier===3?"SUBSTANTIALLY_GREATER":"GREATER_THAN_TIER_3"});
  }
  for(let tier=1;tier<=4;tier++)add("heal"+tier,"cleric",[1,3,5,7][tier-1],"HEAL",tier,"HEAL");
  for(const [id,name,level,status]of [["detox","DETOX",2,"POISON"],["clearSight","CLEAR SIGHT",4,"BLIND"],["unseal","UNSEAL",4,"MUTE"],["awaken","AWAKEN",6,"SLEEP"],["clarity","CLARITY",6,"CONFUSED"]])add(id,"cleric",level,name,1,"CURE",{name,magnitude:{kind:"NONE",amount:0},curesStatuses:[status],modifierCompatibility:{inherent:false,allowed:["extend","expand"],arcanaGroup:"cleric"}});
  add("raise1","cleric",4,"RAISE",1,"RAISE",{magnitude:{kind:"MAX_HP_FRACTION",amount:G.data.RAISE_BEHAVIORS[1].maxHpFraction},restoresHp:true,canTargetDying:true,targetTypes:["DYING_UNIT"],modifierCompatibility:{inherent:false,allowed:["extend","expand"],arcanaGroup:"cleric"}});
  add("fly","wizard",8,"FLY",1,"STATUS",{name:"FLY",magnitude:{kind:"NONE",amount:0},appliesStatuses:[{id:"FLYING",duration:3,sourceType:"SPELL",sourceKey:"fly"}],modifierCompatibility:{inherent:true,allowed:["expand"],arcanaGroup:"wizard"}});
  add("portal","wizard",9,"PORTAL",1,"PORTAL",{name:"PORTAL",castingRange:4,effectRadius:1,magnitude:{kind:"NONE",amount:0},targetTypes:["TILE"],targetAllegiances:["FRIENDLY","ENEMY"],canTargetDying:true,placement:{kind:"PAIRED_ENDPOINTS",count:2,duration:3},modifierCompatibility:{inherent:true,allowed:["extend"],arcanaGroup:"wizard"}});
  G.data.SPELLS=spells;
}(window.GBTRPG));
