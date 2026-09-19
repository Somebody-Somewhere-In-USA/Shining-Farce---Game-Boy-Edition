(function (G) {
  "use strict";

  const canvas = document.querySelector("#game");
  const status = document.querySelector("#status");

  const game = new G.core.Game(canvas, status);
  G.debug.game = game;

  game.start().catch((error) => {
    console.error(error);
    status.textContent = `Startup failed: ${error.message}`;
    // Host diagnostic remains readable even when the font PNG itself cannot load.
    status.classList.remove("accessible-status");
  });
}(window.GBTRPG));
