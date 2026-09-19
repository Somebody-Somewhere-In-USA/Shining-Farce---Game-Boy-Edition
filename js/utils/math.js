(function (G) {
  "use strict";
  G.utils.clamp = function (value, min, max) {
    return Math.max(min, Math.min(max, value));
  };
}(window.GBTRPG));
