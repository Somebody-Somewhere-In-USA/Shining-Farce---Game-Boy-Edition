(function (G) {
  "use strict";

  class Assets {
    constructor(manifest) {
      this.manifest = manifest;
      this.images = new Map();
    }

    async loadAll() {
      const entries = Object.entries(this.manifest);
      const results = await Promise.allSettled(
        entries.map(([id, path]) => this.loadImage(id, path))
      );

      const failures = results
        .map((result, index) => ({ result, entry: entries[index] }))
        .filter(({ result }) => result.status === "rejected");

      if (failures.length) {
        const details = failures
          .map(({ entry }) => `${entry[0]} (${entry[1]})`)
          .join(", ");
        throw new Error(`Asset loading failed: ${details}`);
      }
    }

    getImage(id) {
      const image = this.images.get(id);
      if (!image) throw new Error(`Unknown or unloaded image asset: ${id}`);
      return image;
    }

    loadImage(id, path) {
      return new Promise((resolve, reject) => {
        const image = new Image();

        image.onload = () => {
          this.images.set(id, image);
          resolve(image);
        };

        image.onerror = () => {
          reject(new Error(`PNG could not be loaded: ${path}`));
        };

        image.src = path;
      });
    }
  }

  G.core.Assets = Assets;
}(window.GBTRPG));
