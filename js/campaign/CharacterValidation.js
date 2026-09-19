(function (G) {
  "use strict";
  const V=G.campaign.Validation, keys=G.config.CHARACTER_STATS.primaryKeys;
  function progression(u,kind="unit") {
    const identity=kind==="candidate"?["id","typeId","seed","costG"]:["id","name","typeId","faction","status","unassignedLocationId"];
    const fields=[...identity,...G.campaign.CharacterGrowthSystem.progressionKeys].sort();
    V.assert(Object.keys(u).sort().join()===fields.join(),"missing or duplicate persistent character authority");
    V.assert(G.data.RACES[u.raceId],"unknown or missing race");
    V.assert(Number.isSafeInteger(u.characterLevel)&&u.characterLevel>=1&&u.characterLevel<=G.config.CHARACTER_STATS.levelCap,"invalid Character Level");
    V.assert(V.validId(u.currentClassId),"invalid current class");
    V.assert(u.basePrimary&&Object.keys(u.basePrimary).sort().join() === [...keys].sort().join(),"missing or additional primary attributes");
    for(const n of Object.values(u.basePrimary))V.assert(Number.isSafeInteger(n)&&n>=0,"invalid primary stat");
    V.assert(G.core.DeterministicRandom.isSeed(u.growthRngState),"invalid growth RNG state");
    V.assert(u.classProgress&&typeof u.classProgress==="object"&&!Array.isArray(u.classProgress),"invalid class progression");
    V.assert(u.classProgress[u.currentClassId]?.entryGrantCP !== undefined && u.classProgress[u.currentClassId]?.entryGrantCP !== null,"current class access must be recorded");
    for(const [id,p] of Object.entries(u.classProgress)) {
      V.assert(V.validId(id)&&p&&typeof p==="object"&&!Array.isArray(p)&&Object.keys(p).sort().join()==="classLevel,currentCP,entryGrantCP,lifetimeCP","invalid class progress entry");
      V.assert(Number.isSafeInteger(p.currentCP)&&p.currentCP>=0&&(p.entryGrantCP===null||Number.isSafeInteger(p.entryGrantCP)&&p.entryGrantCP>=0)&&p.currentCP<=p.lifetimeCP+(p.entryGrantCP??0)&&p.classLevel===G.campaign.ClassProgressionSystem.level(p.lifetimeCP),"invalid class CP/level");
    }
    G.campaign.AbilityLoadoutSystem.validate(u);
    // The exact field set above excludes derived values and per-level history ledgers.
    G.campaign.CharacterStatsSystem.deriveStats(u);
  }
  G.campaign.CharacterValidation={progression};
}(window.GBTRPG));
