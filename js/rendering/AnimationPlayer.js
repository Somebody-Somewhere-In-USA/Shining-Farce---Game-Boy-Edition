(function (G) {
  "use strict";

  class AnimationPlayer {
    constructor() {
      this.animation = null;
      this.frameIndex = 0;
      this.elapsedMs = 0;
      this.finished = false;
    }

    play(animation) {
      this.animation = animation;
      this.frameIndex = 0;
      this.elapsedMs = 0;
      this.finished = false;
    }

    update(deltaMs) {
      if (!this.animation || this.finished) return;

      this.elapsedMs += deltaMs;
      const duration = this.animation.durations[this.frameIndex];

      if (this.elapsedMs < duration) return;

      this.elapsedMs -= duration;

      if (this.frameIndex < this.animation.frames - 1) {
        this.frameIndex += 1;
      } else if (this.animation.loop) {
        this.frameIndex = 0;
      } else {
        // Intentionally hold the final frame when a one-shot finishes.
        this.finished = true;
      }
    }
  }

  G.rendering.AnimationPlayer = AnimationPlayer;
}(window.GBTRPG));
