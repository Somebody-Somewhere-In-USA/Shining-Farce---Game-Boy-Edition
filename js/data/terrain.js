(function (G) {
  "use strict";

  G.data.TERRAIN = Object.freeze({
    0: Object.freeze({
      id: "grass", name: "Grass", moveCost: 1,
      defBonus: 0, evaBonus: 0, passable: true,
      assetId: "tileGrass",
    }),
    1: Object.freeze({
      id: "wall", name: "Wall", moveCost: Infinity,
      defBonus: 0, evaBonus: 0, passable: false,
      assetId: "tileWall",
    }),
  });
}(window.GBTRPG));
