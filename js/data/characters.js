(function (G) {
  "use strict";

  G.data.CHARACTERS = Object.freeze({
    hero: Object.freeze({
      id: "hero",
      name: "Hero",
      team: "player",
      classId: "starter",
      characterLevel: 1,
      raceId: "HUMAN",
      growthSeed: 471,
      xp: 0,
      position: Object.freeze({ x: 2, y: 2 }),
      mapAssetId: "heroMap",
      animationSet: "hero",
    }),
  });
}(window.GBTRPG));
