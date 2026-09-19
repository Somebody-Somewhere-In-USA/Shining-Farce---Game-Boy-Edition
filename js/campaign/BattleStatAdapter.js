(function (G) {
  "use strict";
  function snapshot(unit, equipment = [], currentResources = null, context = {}) {
    const derived = G.campaign.CharacterStatsSystem.deriveStats(unit, equipment, context);
    // Isolated provisional legacy fields. ATK is an alias, NOT a finalized damage formula.
    // A new tactical fixture starts full. Supplying current resources never refills them.
    const hp = currentResources?.hp ?? derived.maxHp, mp = currentResources?.mp ?? derived.maxMp;
    G.campaign.Validation.assert(Number.isFinite(hp) && Number.isFinite(mp) && hp >= 0 && mp >= 0, "invalid current tactical resources");
    return G.campaign.Validation.freeze({ hp: Math.min(hp, derived.maxHp), mp: Math.min(mp, derived.maxMp),
      maxHp: derived.maxHp, maxMp: derived.maxMp,
      atk: derived[G.config.CHARACTER_STATS.legacyMeleeAttribute], def: derived.def, agi: derived.agi, mov: derived.mov });
  }
  G.campaign.BattleStatAdapter = { snapshot };
}(window.GBTRPG));
