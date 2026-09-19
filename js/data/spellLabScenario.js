(function(G){
 "use strict";
 function create(){
  const specs=[["labWizard","PLAYER","wizard","mage",2,2],["labCleric","PLAYER","cleric","wizard",2,5],["labEnemy","ZEON","wizard","mage",7,2],["labReserve","ZEON","mage","wizard",8,6]],units=[],positions={};
  for(const[id,faction,currentClassId,secondary,x,y]of specs){const u={id,name:id==="labWizard"?"WIZARD":id==="labCleric"?"CLERIC":id==="labEnemy"?"ENEMY WIZARD":"ENEMY MAGE",typeId:currentClassId==="cleric"?"healer":"mage",faction,status:"ACTIVE",unassignedLocationId:null,...G.campaign.CharacterGrowthSystem.simulateRecruitGrowth({raceId:"HUMAN",currentClassId,characterLevel:1,seed:99})};
   for(const c of ["mage","cleric","wizard"])G.campaign.ClassProgressionSystem.earn(u,c,2700);
   u.learnedAbilityIds=Object.values(G.data.ABILITIES).filter(a=>["mage","cleric","wizard"].includes(a.classId)).map(a=>a.id);u.abilityLoadout.secondaryClassId=secondary;u.abilityLoadout.supportId="divineArcana";units.push({...u,stats:{...G.campaign.CharacterStatsSystem.deriveStats(u),maxHp:100,maxMp:100},possessions:[]});positions[id]={x,y};
  }
  // Test-only values. Opening this isolated lab never changes campaign or production balance.
  const balance={};for(const s of Object.values(G.data.SPELLS)){balance[s.id]={castingRange:4,effectRadius:1,mpCost:10,magnitude:20,duration:3};if(s.magnitudeBalanceKey)balance[s.magnitudeBalanceKey]=s.spellLevel<=2?20:s.spellLevel===3?40:60;}
  return{scenario:{scenarioId:"debugSpellLab",positions,participants:["PLAYER","ZEON"].map(faction=>({faction,squadId:faction,units:units.filter(u=>u.faction===faction)}))},balance};
 }
 G.data.SpellLabScenario={create};
}(window.GBTRPG));
