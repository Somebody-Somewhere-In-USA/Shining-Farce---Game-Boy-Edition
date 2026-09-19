(function(G){
  "use strict";
  const melee=weights=>({slot:"weapon",kinds:["MELEE"],weights});
  const armor=weights=>({slot:"armor",weights});
  G.data.CLASSES={
    fighter:{id:"fighter",name:"FIGHTER",playable:true,prerequisites:[],growth:{str:1},movModifier:null,equipmentPermissions:[melee(["MEDIUM"]),armor(["MEDIUM"])],primaryAction:"fighter"},
    knight:{id:"knight",name:"KNIGHT",playable:true,prerequisites:[{classId:"fighter",level:3}],growth:{str:1,con:1},movModifier:null,equipmentPermissions:[melee(["MEDIUM","HEAVY"]),armor(["MEDIUM","HEAVY"]),{slot:"offHand",kinds:["SHIELD"]}],primaryAction:"knight"},
    thief:{id:"thief",name:"THIEF",playable:true,prerequisites:[],growth:{agi:1},movModifier:2,equipmentPermissions:[{slot:"weapon",weights:["LIGHT"]},armor(["LIGHT"])],primaryAction:"thief"},
    archer:{id:"archer",name:"ARCHER",playable:true,prerequisites:[],growth:{dex:1},movModifier:0,equipmentPermissions:[{slot:"weapon",families:["BOW"],excludedWeights:["HEAVY"],requireKnownWeight:true},armor(["LIGHT"])],primaryAction:"archer"},
    alchemist:{id:"alchemist",name:"ALCHEMIST",playable:true,prerequisites:[],growth:{wis:1},movModifier:null,equipmentPermissions:[{slot:"weapon",weights:["LIGHT"]},armor(["LIGHT"])],equipmentStatus:"PROVISIONAL",primaryAction:"alchemist"}
  };
  // These remain compatibility disciplines, not invented playable class designs.
  for(const id of ["swordsman","healer","mage","centaur","starter"])G.data.CLASSES[id]={id,name:id.toUpperCase(),playable:false,legacy:true,prerequisites:[],growth:null,movModifier:null,equipmentPermissions:[],primaryAction:id};
  for(const c of Object.values(G.data.CLASSES))c.initialCurrentCPGrant=null;
  // A prerequisite example only; neither discipline is made playable here.
  G.data.CLASS_PREREQUISITE_EXAMPLES={paladin:[{classId:"knight",level:5},{classId:"cleric",level:5}]};
}(window.GBTRPG));
