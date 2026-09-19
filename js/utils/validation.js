(function (G) {
  "use strict";
  G.utils.assert = function (condition, message) {
    if (!condition) throw new Error(message);
  };
}(window.GBTRPG));
