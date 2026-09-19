(function (G) {
  "use strict";

  G.utils.gridToPixel = function (tile) {
    return tile * G.config.TILE_SIZE;
  };

  G.utils.pixelToGrid = function (pixel) {
    return Math.floor(pixel / G.config.TILE_SIZE);
  };
}(window.GBTRPG));
