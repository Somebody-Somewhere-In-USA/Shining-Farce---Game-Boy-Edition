(function (G) {
  "use strict";
  function lines(unit,stats) {
    return ["RACE: "+G.data.RACES[unit.raceId].name,"CHARACTER LV "+unit.characterLevel,
      "CLASS: "+unit.currentClassId.toUpperCase(),
      "STR "+stats.str+"   DEX "+stats.dex,"CON "+stats.con+"   AGI "+stats.agi,"INT "+stats.int+"   WIS "+stats.wis,
      "MAX HP "+stats.maxHp+"   MAX MP "+stats.maxMp,"MOV "+stats.mov+"   DEF "+stats.def,
      ...stats.movementTraits.map(t=>"MOVEMENT: "+t),
      ...stats.racialAbilities.map(id=>G.data.RACIAL_ABILITIES[id].concept.replaceAll("_"," "))];
  }
  G.ui.CharacterStatView={lines};
}(window.GBTRPG));
