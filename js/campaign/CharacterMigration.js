(function (G) {
  "use strict";
  function migrate(s) {
    const V=G.campaign.Validation;
    V.assert(s.phase==="PLANNING"&&!s.resolution,"version 3 stat migration requires PLANNING; finish the old resolution first");
    for(const u of Object.values(s.units))if(u.characterLevel===undefined)
      V.assert(G.data.UNIT_TYPES[u.typeId]&&Number.isSafeInteger(u.level)&&u.level>=1&&u.level<=G.config.CHARACTER_STATS.levelCap,"invalid legacy character type/level");
    G.campaign.UnitManagementSystem.upgrade(s);
    for(const pool of Object.values(s.recruitPools))for(const c of pool) {
      if(c.characterLevel===undefined) {
        const type=G.data.UNIT_TYPES[c.typeId];V.assert(type,"unknown legacy recruit type");
        Object.assign(c,G.campaign.CharacterGrowthSystem.simulateRecruitGrowth({raceId:type.raceId,currentClassId:type.classId,characterLevel:c.level,seed:c.seed}));
        delete c.level;
      }
    }
    s.schemaVersion=4;
  }
  G.campaign.CharacterMigration={migrate};
}(window.GBTRPG));
