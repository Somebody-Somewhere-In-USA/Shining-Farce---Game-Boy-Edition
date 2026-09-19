(function (G) {
  "use strict";
  G.config.CHARACTER_STATS = Object.freeze({
    primaryKeys: Object.freeze(["str", "dex", "con", "agi", "int", "wis"]),
    levelCap: 100,
    // Provisional capacity coefficients, NOT final combat/balance formulas.
    capacity: Object.freeze({ hpBase: 10, hpPerCon: 2, mpBase: 0, mpPerInt: 1, minHp: 1, minMp: 0 }),
    // The old tactical movement fixture needs an ATK field; no damage formula is implied.
    legacyMeleeAttribute: "str"
  });
}(window.GBTRPG));
