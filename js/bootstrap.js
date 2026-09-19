(function () {
  "use strict";

  // One intentionally shared namespace prevents dozens of unrelated globals.
  // Each source file owns only its specific section/responsibility.
  window.GBTRPG = window.GBTRPG || {
    config: {},
    data: {},
    core: {},
    entities: {},
    systems: {},
    rendering: {},
    states: {},
    ui: {},
    utils: {},
    campaign: {},
    debug: {},
  };
}());
