(function (G) {
  "use strict";

  class UnitRenderer {
    constructor(assets) {
      this.assets = assets;
    }

    draw(ctx, unit) {
      const tileSize = G.config.TILE_SIZE;
      const image = this.assets.getImage(unit.mapAssetId);

      ctx.drawImage(
        image,
        unit.x * tileSize,
        unit.y * tileSize,
        tileSize,
        tileSize
      );
    }
  }

  G.rendering.UnitRenderer = UnitRenderer;
}(window.GBTRPG));
