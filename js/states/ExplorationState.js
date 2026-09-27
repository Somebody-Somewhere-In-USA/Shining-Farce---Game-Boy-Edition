(function (G) {
  "use strict";

  class ExplorationState {
    constructor(dependencies) {
      Object.assign(this, dependencies);
    }

    displayPaletteSelectAllowed(){return true;}
    update() {
      const action = this.input.consumeAction();
      if (action === "cancel" || action === "menu") { this.returnToCampaign?.(); return; }
      const directions = {
        up: [0, -1],
        down: [0, 1],
        left: [-1, 0],
        right: [1, 0],
      };

      if (!directions[action]) return;

      const [dx, dy] = directions[action];
      this.movementSystem.tryMove(this.hero, this.map, dx, dy);
    }

    render() {
      this.renderer.clear();
      this.renderer.ctx.save();
      this.renderer.ctx.translate(Math.floor((G.config.INTERNAL_WIDTH - this.map.width * G.config.TILE_SIZE) / 2), Math.floor((G.config.INTERNAL_HEIGHT - this.map.height * G.config.TILE_SIZE) / 2));
      this.mapRenderer.draw(this.renderer.ctx, this.map);
      this.unitRenderer.draw(this.renderer.ctx, this.hero);
      this.renderer.ctx.restore();
    }
  }

  G.states.ExplorationState = ExplorationState;
}(window.GBTRPG));
