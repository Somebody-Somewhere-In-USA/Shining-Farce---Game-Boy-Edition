(function (G) {
  "use strict";
  const V = G.campaign.Validation, config = G.config.CHARACTER_STATS;
  const modifierKeys = [...config.primaryKeys, "def", "mov", "maxHp", "maxMp"];
  function deriveStats(unit, equipment = [], context = {}) {
    const race = G.data.RACES[unit.raceId]; V.assert(race, "unknown race");
    const additions = Object.fromEntries(modifierKeys.map(key => [key, 0]));
    for (const modifiers of [...equipment.map(item => item.modifiers || {}), ...[...(context.effects || []),...G.campaign.AbilityModifierSystem.stats(unit)].map(effect => effect.modifiers || {})]) {
      for (const [key, value] of Object.entries(modifiers)) {
        V.assert(modifierKeys.includes(key) && Number.isSafeInteger(value), "invalid stat modifier " + key);
        additions[key] += value;
      }
    }
    const primary = Object.fromEntries(config.primaryKeys.map(key => [key, unit.basePrimary[key] + additions[key]]));
    const provider = context.classProvider || G.campaign.ClassGrowthProvider;
    const classMov = provider.getMovementModifier(unit.currentClassId);
    V.assert(Number.isSafeInteger(classMov), "invalid class MOV modifier");
    const formula = config.capacity;
    const stats = { ...primary,
      maxHp: Math.max(formula.minHp, formula.hpBase + primary.con * formula.hpPerCon + race.startingMaxHpModifier + additions.maxHp),
      maxMp: Math.max(formula.minMp, formula.mpBase + primary.int * formula.mpPerInt + race.startingMaxMpModifier + additions.maxMp),
      mov: Math.max(0, race.mov + classMov + additions.mov),
      weaponAttack: G.campaign.AbilityModifierSystem.weaponAttack(unit,equipment.find(d=>d.equipmentSlot==="weapon")),
      def: additions.def, // Ordinary innate DEF is always zero; no racial/class DEF growth.
      movementTraits: [...race.movementTraits], racialAbilities: [...race.innateAbilities]
    };
    V.assert([...Object.values(primary),stats.maxHp,stats.maxMp,stats.mov,stats.def].every(Number.isSafeInteger), "invalid or overflowing derived attribute");
    return V.freeze(stats);
  }
  G.campaign.CharacterStatsSystem = { deriveStats, modifierKeys };
}(window.GBTRPG));
