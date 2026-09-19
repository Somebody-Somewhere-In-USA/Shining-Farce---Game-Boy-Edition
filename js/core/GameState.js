(function (G) {
  "use strict";

  class GameStateManager {
    constructor() {
      this.current = null;
    }

    change(nextState) {
      this.current?.exit?.();
      this.current = nextState;
      this.current?.enter?.();
    }

    update(deltaMs) {
      this.current?.update?.(deltaMs);
    }

    render() {
      this.current?.render?.();
    }
  }

  G.core.GameStateManager = GameStateManager;
}(window.GBTRPG));
