(function (G) {
  "use strict";

  G.config.INTERNAL_WIDTH = 480;
  G.config.INTERNAL_HEIGHT = 360;
  G.config.WORLD_TILE_SIZE = 16;
  G.config.MAP_VIEW = Object.freeze({ x: 0, y: 16, width: 480, height: 312 });
  G.config.UI = Object.freeze({ pageRows: 18, pageColumns: 50, listRows: 12 });
  G.config.TILE_SIZE = 16;

  G.config.GAME_STATES = Object.freeze({
    EXPLORATION: "EXPLORATION",
    PLAYER_TURN: "PLAYER_TURN",
    COMMAND_MENU: "COMMAND_MENU",
    TARGETING: "TARGETING",
    ENEMY_TURN: "ENEMY_TURN",
    COMBAT_CUTIN: "COMBAT_CUTIN",
    ANIMATION_TEST: "ANIMATION_TEST",
  });
}(window.GBTRPG));
