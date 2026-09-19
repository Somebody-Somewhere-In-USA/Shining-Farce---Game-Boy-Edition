(function (G) {
  "use strict";
  // All numerical ranges, MOV and capacity offsets are provisional balance data.
  // Equipment prohibitions, flight declarations and Fairy's cure concept are settled.
  G.data.RACES = {
    HUMAN: {
      id: "HUMAN", name: "HUMAN",
      starting: { str:[8,12], dex:[8,12], con:[8,12], agi:[8,12], int:[8,12], wis:[8,12] },
      growth: { str:[1,2], dex:[1,2], con:[1,2], agi:[1,2], int:[1,2], wis:[1,2] },
      mov: 5, startingMaxHpModifier: 0, startingMaxMpModifier: 0,
      movementTraits: [], equipmentRestrictions: { forbiddenSlots: [] }, innateAbilities: [], compatibility: {}
    },
    ELF: {
      id: "ELF", name: "ELF",
      starting: { str:[7,10], dex:[10,13], con:[7,10], agi:[10,13], int:[10,13], wis:[10,13] },
      growth: { str:[0,1], dex:[1,3], con:[0,1], agi:[1,3], int:[1,3], wis:[1,3] },
      mov: 5, startingMaxHpModifier: -4, startingMaxMpModifier: 8,
      movementTraits: [], equipmentRestrictions: { forbiddenSlots: [] }, innateAbilities: [], compatibility: {}
    },
    DWARF: {
      id: "DWARF", name: "DWARF",
      starting: { str:[10,13], dex:[7,10], con:[10,13], agi:[7,10], int:[7,10], wis:[8,12] },
      growth: { str:[1,3], dex:[0,1], con:[1,3], agi:[0,1], int:[0,1], wis:[1,2] },
      mov: 4, startingMaxHpModifier: 6, startingMaxMpModifier: -4,
      movementTraits: [], equipmentRestrictions: { forbiddenSlots: [] }, innateAbilities: [], compatibility: {}
    },
    CENTAUR: {
      id: "CENTAUR", name: "CENTAUR",
      starting: { str:[10,13], dex:[8,12], con:[8,12], agi:[10,13], int:[8,12], wis:[8,12] },
      growth: { str:[1,3], dex:[1,2], con:[1,2], agi:[1,3], int:[1,2], wis:[1,2] },
      mov: 7, startingMaxHpModifier: 4, startingMaxMpModifier: 0,
      movementTraits: [], equipmentRestrictions: { forbiddenSlots: [] }, innateAbilities: [], compatibility: {}
    },
    BIRDFOLK: {
      id: "BIRDFOLK", name: "BIRDFOLK",
      starting: { str:[8,12], dex:[11,14], con:[7,10], agi:[11,14], int:[8,12], wis:[10,13] },
      growth: { str:[1,2], dex:[2,3], con:[0,1], agi:[2,3], int:[1,2], wis:[1,3] },
      mov: 7, startingMaxHpModifier: -4, startingMaxMpModifier: 0,
      movementTraits: ["FLIGHT"], equipmentRestrictions: { forbiddenSlots: [] }, innateAbilities: [], compatibility: {}
    },
    BEASTMAN: {
      id: "BEASTMAN", name: "BEASTMAN",
      starting: { str:[10,13], dex:[7,10], con:[8,12], agi:[10,13], int:[8,12], wis:[7,10] },
      growth: { str:[1,3], dex:[0,1], con:[1,2], agi:[1,3], int:[1,2], wis:[0,1] },
      mov: 5, startingMaxHpModifier: 4, startingMaxMpModifier: 0,
      movementTraits: [], equipmentRestrictions: { forbiddenSlots: ["weapon", "armor"] }, innateAbilities: [], compatibility: {}
    },
    FAIRY: {
      id: "FAIRY", name: "FAIRY",
      starting: { str:[8,12], dex:[7,10], con:[5,8], agi:[11,14], int:[10,13], wis:[11,14] },
      growth: { str:[1,2], dex:[0,1], con:[0,1], agi:[2,3], int:[1,3], wis:[2,3] },
      mov: 7, startingMaxHpModifier: -10, startingMaxMpModifier: 6,
      movementTraits: ["FLIGHT"], equipmentRestrictions: { forbiddenSlots: [] },
      innateAbilities: ["singleTargetDebuffCure"], compatibility: {}
    }
  };
  G.data.RACIAL_ABILITIES = {
    singleTargetDebuffCure: { id: "singleTargetDebuffCure", source: "RACE", concept: "CURE_ONE_TARGET_DEBUFF" }
  };
}(window.GBTRPG));
