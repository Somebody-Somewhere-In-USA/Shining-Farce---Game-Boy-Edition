(function (G) {
  "use strict";

  class TerrainSystem {
    constructor(definitions) {
      this.definitions = definitions;
    }

    getTerrain(tileId) {
      const terrain = this.definitions[tileId];
      if (!terrain) throw new Error(`Unknown terrain tile ID: ${tileId}`);
      return terrain;
    }

    isPassable(tileId) {
      return this.getTerrain(tileId).passable;
    }
  }

  G.systems.TerrainSystem = TerrainSystem;
}(window.GBTRPG));
