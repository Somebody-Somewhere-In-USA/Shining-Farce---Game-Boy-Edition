(function (G) {
  "use strict";
  G.data.UNIT_TYPES = {
    swordsman: { name:"SWORDSMAN", classId:"swordsman", raceId:"HUMAN", strategicSpriteId:"unitSwordsman", recruitBaseG:60 },
    healer: { name:"HEALER", classId:"healer", raceId:"HUMAN", strategicSpriteId:"unitHealer", recruitBaseG:55 },
    mage: { name:"MAGE", classId:"mage", raceId:"HUMAN", strategicSpriteId:"unitMage", recruitBaseG:65 },
    centaur: { name:"CENTAUR", classId:"centaur", raceId:"CENTAUR", strategicSpriteId:"unitCentaur", recruitBaseG:65 },
    // Existing orc art is a placeholder enemy type; HUMAN is a provisional stat profile,
    // not an eighth ordinary race or a finalized statement about the enemy's biology.
    orc: { name:"ORC", classId:"swordsman", raceId:"HUMAN", strategicSpriteId:"unitOrc", recruitBaseG:60 }
  };
  G.data.CAMPAIGN_CHARACTERS = {
    mc:{raceId:"HUMAN",name:"AREN",typeId:"swordsman",strategicSpriteId:"unitAren"}, sara:{raceId:"HUMAN",name:"SARAH",typeId:"healer"},
    chester:{raceId:"CENTAUR",name:"CHESTER",typeId:"centaur"}, jaha:{raceId:"HUMAN",name:"JAHA",typeId:"swordsman"}, kaz:{raceId:"HUMAN",name:"KAZ",typeId:"mage"}
  };
  G.data.ITEMS = {
    ironSword:{id:"ironSword",name:"IRON SWORD",category:"WEAPON",priceG:50,shopTier:1,equipmentSlot:"weapon",allowedClasses:["swordsman"],modifiers:{str:2}},
    steelSword:{id:"steelSword",name:"STEEL SWORD",category:"WEAPON",priceG:110,shopTier:2,equipmentSlot:"weapon",allowedClasses:["swordsman"],modifiers:{str:5}},
    lance:{id:"lance",name:"BRONZE LANCE",category:"WEAPON",priceG:45,shopTier:1,equipmentSlot:"weapon",allowedClasses:["centaur"],modifiers:{str:3}},
    staff:{id:"staff",name:"WOODEN STAFF",category:"WEAPON",priceG:35,shopTier:1,equipmentSlot:"weapon",allowedClasses:["healer","mage"],modifiers:{str:2}},
    cloth:{id:"cloth",name:"CLOTH ROBE",category:"ARMOR",priceG:30,shopTier:1,equipmentSlot:"armor",modifiers:{def:1}},
    mail:{id:"mail",name:"CHAIN MAIL",category:"ARMOR",priceG:80,shopTier:2,equipmentSlot:"armor",modifiers:{def:3}},
    charm:{id:"charm",name:"WARD CHARM",category:"ACCESSORY",priceG:40,shopTier:1,equipmentSlot:"accessory",modifiers:{def:1}},
    ring:{id:"ring",name:"POWER RING",category:"ACCESSORY",priceG:90,shopTier:2,equipmentSlot:"accessory",modifiers:{str:2}},
    herb:{id:"herb",name:"HEALING HERB",category:"CONSUMABLE",priceG:10,shopTier:1,equipmentSlot:null,modifiers:{},effect:{kind:"HEAL",amount:10}},
    antidote:{id:"antidote",name:"ANTIDOTE",category:"CONSUMABLE",priceG:12,shopTier:1,equipmentSlot:null,modifiers:{},effect:{kind:"CURE_POISON"}}
  };
  // Old catalogs did not define weight or weapon ATK. Keep those fields unresolved.
  for(const item of Object.values(G.data.ITEMS)){
    if(item.category==="WEAPON"){item.weaponFamily=item.id.includes("Sword")?"SWORD":item.id==="lance"?"SPEAR":"STAFF";item.equipmentKind="MELEE";item.weight=null;item.weaponAttack=null;}
    if(item.category==="ARMOR")item.weight=null;
    if(item.id==="cloth")item.armorFamily="ROBE";
  }
  const profiles = {
    granseal:{dailyIncomeG:60,shops:{WEAPON:1,ARMOR:1,ACCESSORY:1,CONSUMABLE:1},recruitment:{types:["swordsman","healer","mage"],count:3,levelModifier:0}},
    grove:{dailyIncomeG:25,shops:{WEAPON:1,CONSUMABLE:1},recruitment:{types:["centaur","healer"],count:3,levelModifier:0}},
    galam:{dailyIncomeG:80,shops:{WEAPON:2,ARMOR:2,ACCESSORY:2,CONSUMABLE:1},recruitment:{types:["mage","swordsman"],count:3,levelModifier:1}},
    port:{dailyIncomeG:40,shops:{ARMOR:1,CONSUMABLE:1}},fortress:{dailyIncomeG:15,shops:{}},shrine:{dailyIncomeG:0,shops:{}},crossroads:{dailyIncomeG:0,shops:{}}
  };
  for(const [id,l] of Object.entries(G.data.WORLD.locations)) l.economy=profiles[id];
}(window.GBTRPG));
