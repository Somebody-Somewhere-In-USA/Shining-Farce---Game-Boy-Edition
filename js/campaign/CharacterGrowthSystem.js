(function (G) {
  "use strict";
  const V = G.campaign.Validation, R = G.core.DeterministicRandom;
  const keys = G.config.CHARACTER_STATS.primaryKeys;
  const progressionKeys = ["raceId", "characterLevel", "currentClassId", "basePrimary", "growthRngState", "classProgress", "learnedAbilityIds", "abilityLoadout"];
  function roll(raceId, field, rng) {
    const race = G.data.RACES[raceId]; V.assert(race, "unknown race " + raceId);
    return Object.fromEntries(keys.map(key => [key, R.integer(rng, ...race[field][key])]));
  }
  function generateLevelOneStats(raceId, rng) { return roll(raceId, "starting", rng); }
  function getRacialGrowth(raceId, rng) { return roll(raceId, "growth", rng); }
  function applyGrowthEvent(basePrimary, raceId, classGrowth, rng) {
    V.assert(classGrowth && Object.keys(classGrowth).every(key => keys.includes(key) && Number.isSafeInteger(classGrowth[key]) && classGrowth[key] >= 0), "invalid class growth bonus; only primary attributes may grow");
    const racial = getRacialGrowth(raceId, rng);
    return Object.fromEntries(keys.map(key => {
      V.assert(Number.isSafeInteger(basePrimary[key]) && basePrimary[key] >= 0, "invalid accumulated primary attribute");
      const value = basePrimary[key] + racial[key] + (classGrowth[key] || 0);
      V.assert(Number.isSafeInteger(value), "primary attribute overflow");
      return [key, value];
    }));
  }
  function advanceLevel(unit, provider = G.campaign.ClassGrowthProvider, growthClassId = unit.currentClassId) {
    V.assert(Number.isSafeInteger(unit.characterLevel) && unit.characterLevel >= 1 && unit.characterLevel < G.config.CHARACTER_STATS.levelCap, "character level cap reached or invalid level");
    const rng = R.create(unit.growthRngState);
    const bonuses={...provider.getGrowth(growthClassId)};
    for(const [key,value]of Object.entries(G.campaign.AbilityModifierSystem.growth(unit)))bonuses[key]=(bonuses[key]||0)+value;
    const next = applyGrowthEvent(unit.basePrimary, unit.raceId, bonuses, rng);
    unit.basePrimary = next; unit.growthRngState = rng.state; unit.characterLevel++;
    return unit;
  }
  function simulateRecruitGrowth({ raceId, characterLevel = 1, currentClassId, seed, allocations }, provider = G.campaign.ClassGrowthProvider) {
    V.assert(Number.isSafeInteger(characterLevel) && characterLevel >= 1 && characterLevel <= G.config.CHARACTER_STATS.levelCap, "invalid Character Level");
    V.assert(V.validId(currentClassId), "invalid current class identifier");
    const groups = allocations ?? [{ classId: currentClassId, events: characterLevel - 1 }];
    V.assert(Array.isArray(groups) && groups.every(group => V.validId(group.classId) && Number.isSafeInteger(group.events) && group.events >= 0), "invalid recruit growth allocations");
    V.assert(groups.reduce((sum, group) => sum + group.events, 0) === characterLevel - 1, "recruit requires Character Level minus one growth events");
    const rng = R.create(seed);
    const unit = { raceId, characterLevel: 1, currentClassId,
      basePrimary: generateLevelOneStats(raceId, rng), growthRngState: rng.state, classProgress: {}, learnedAbilityIds: [], abilityLoadout: G.campaign.AbilityLoadoutSystem.defaults() };
    // The ordinary level-up path is also the generated-recruit path. No history is retained.
    for (const group of groups) for (let i = 0; i < group.events; i++) advanceLevel(unit, provider, group.classId);
    G.campaign.ClassEntryGrantSystem.access(unit,currentClassId);
    return unit;
  }
  function copyProgression(unit) { return V.clone(Object.fromEntries(progressionKeys.map(key => [key, unit[key]]))); }
  G.campaign.CharacterGrowthSystem = { progressionKeys, generateLevelOneStats, getRacialGrowth, applyGrowthEvent, advanceLevel, simulateRecruitGrowth, copyProgression };
}(window.GBTRPG));
