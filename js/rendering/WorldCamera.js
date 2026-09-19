(function (G) {
  "use strict";
  class WorldCamera {
    constructor(worldWidth, worldHeight, viewport = G.config.MAP_VIEW) {
      this.worldWidth = worldWidth; this.worldHeight = worldHeight; this.viewport = viewport; this.x = 0; this.y = 0;
    }
    set(x, y) {
      this.x = Math.max(0, Math.min(Math.round(x), Math.max(0, this.worldWidth - this.viewport.width)));
      this.y = Math.max(0, Math.min(Math.round(y), Math.max(0, this.worldHeight - this.viewport.height)));
    }
    follow(x, y, margin = 32) {
      let cx = this.x, cy = this.y;
      if (x < cx + margin) cx = x - margin;
      if (x + G.config.WORLD_TILE_SIZE > cx + this.viewport.width - margin) cx = x + G.config.WORLD_TILE_SIZE - this.viewport.width + margin;
      if (y < cy + margin) cy = y - margin;
      if (y + G.config.WORLD_TILE_SIZE > cy + this.viewport.height - margin) cy = y + G.config.WORLD_TILE_SIZE - this.viewport.height + margin;
      this.set(cx, cy);
    }
    worldToScreen(x, y) { return { x: Math.round(x) - this.x + this.viewport.x + Math.max(0,Math.floor((this.viewport.width-this.worldWidth)/2)), y: Math.round(y) - this.y + this.viewport.y + Math.max(0,Math.floor((this.viewport.height-this.worldHeight)/2)) }; }
    screenToWorld(x, y) { return { x: Math.round(x) + this.x - this.viewport.x - Math.max(0,Math.floor((this.viewport.width-this.worldWidth)/2)), y: Math.round(y) + this.y - this.viewport.y - Math.max(0,Math.floor((this.viewport.height-this.worldHeight)/2)) }; }
  }
  G.rendering.WorldCamera = WorldCamera;
}(window.GBTRPG));
