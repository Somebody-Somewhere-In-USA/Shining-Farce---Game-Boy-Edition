(function (G) {
  "use strict";
  G.data.DEMO_CAMPAIGN = {
    allegiance: { granseal: "PLAYER", galam: "NEUTRAL", order: "NEUTRAL" },
    controllers: { granseal: "PLAYER", crossroads: "PLAYER", grove: "PLAYER", galam: "NEUTRAL", port: "NEUTRAL", fortress: "ZEON", shrine: "NEUTRAL" },
    units: ["mc", "sara", "chester", "jaha", "kaz", "orc1", "orc2", "orc3"],
    squads: [
      { id: "vanguard", name: "VANGUARD", faction: "PLAYER", unitIds: ["mc", "sara", "chester"], currentLocationId: "granseal" },
      { id: "rangers", name: "RANGERS", faction: "PLAYER", unitIds: ["jaha", "kaz"], currentLocationId: "granseal" },
      { id: "zeonGuard", name: "ZEON GUARD", faction: "ZEON", unitIds: ["orc1", "orc2", "orc3"], currentLocationId: "fortress", mission: null }
    ]
  };
}(window.GBTRPG));
