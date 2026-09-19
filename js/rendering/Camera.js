(function (G) {
  "use strict";
  class Camera {
    constructor(x = 0, y = 0) {
      this.x = x;
      this.y = y;
    }
  }
  G.rendering.Camera = Camera;
}(window.GBTRPG));
