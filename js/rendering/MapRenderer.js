(function (G) {
  "use strict";

  class MapRenderer {
    constructor(assets, terrainSystem) {
      this.assets = assets;
      this.terrainSystem = terrainSystem;
    }

    draw(ctx, map) {
      const tileSize = G.config.TILE_SIZE;

      for (let y = 0; y < map.height; y += 1) {
        for (let x = 0; x < map.width; x += 1) {
          const terrain = this.terrainSystem.getTerrain(map.tiles[y][x]);
          const image = this.assets.getImage(terrain.assetId);

          ctx.drawImage(
            image,
            x * tileSize,
            y * tileSize,
            tileSize,
            tileSize
          );
        }
      }
    }
  }

  G.rendering.MapRenderer = MapRenderer;
}(window.GBTRPG));
