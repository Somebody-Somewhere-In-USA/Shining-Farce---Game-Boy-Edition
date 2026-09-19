(function (G) {
  "use strict";
  class CampaignUIRenderer {
    constructor(assets, text) { this.assets = assets; this.text = text; }
    window(ctx, x, y, width, height) {
      ctx.fillStyle = G.config.PALETTE.lightest; ctx.fillRect(x, y, width, height);
      // Replaceable 3x3 frame atlas, each source cell 4px. Draw at native resolution.
      const frame = this.assets.getImage("windowFrame"), tile = 4;
      for (let dy = 0; dy < height; dy += tile) for (let dx = 0; dx < width; dx += tile) {
        const sx = dx === 0 ? 0 : dx + tile >= width ? 8 : 4;
        const sy = dy === 0 ? 0 : dy + tile >= height ? 8 : 4;
        ctx.drawImage(frame, sx, sy, tile, tile, x + dx, y + dy, tile, tile);
      }
    }
    cursor(ctx, x, y) { ctx.drawImage(this.assets.getImage("cursors"), 16, 0, 8, 8, x, y, 8, 8); }
    list(ctx, title, list, footer="Z OK  X BACK") {
      this.window(ctx, 0, 0, G.config.INTERNAL_WIDTH, G.config.INTERNAL_HEIGHT);
      this.text.draw(ctx, title, 8, 8, 50);
      if (!list.items.length) this.text.draw(ctx, "NO ELIGIBLE ENTRIES", 8, 28, 24);
      list.items.slice(list.offset, list.offset + list.visibleRows).forEach((item, row) => {
        this.text.draw(ctx, item.label, 18, 26 + row * 12, 48);
        if (list.index === list.offset + row) this.cursor(ctx, 7, 26 + row * 12);
      });
      this.text.draw(ctx, footer, 8, G.config.INTERNAL_HEIGHT-18);
      if (list.items.length > list.visibleRows) this.text.draw(ctx, (list.index + 1) + "/" + list.items.length, G.config.INTERNAL_WIDTH-56, G.config.INTERNAL_HEIGHT-18, 7);
    }
    popup(ctx, title, list, bounds) {
      const { x, y, width, height } = bounds;
      this.window(ctx, x, y, width, height);
      this.text.draw(ctx, title, x + 8, y + 8, Math.floor((width - 16) / 6));
      list.items.forEach((item, row) => {
        this.text.draw(ctx, item.label, x + 18, y + 24 + row * 12, Math.floor((width - 24) / 6));
        if (list.index === row) this.cursor(ctx, x + 7, y + 24 + row * 12);
      });
      this.text.draw(ctx, "X BACK", x + 8, y + height - 12, 12);
    }
    page(ctx, title, lines, page) {
      const rows = G.config.UI.pageRows, count = Math.max(1, Math.ceil(lines.length / rows));
      this.window(ctx, 0, 0, G.config.INTERNAL_WIDTH, G.config.INTERNAL_HEIGHT);
      this.text.draw(ctx, title, 8, 8, 50);
      lines.slice(page * rows, page * rows + rows).forEach((line, i) => this.text.draw(ctx, line, 8, 26 + i * 10, G.config.UI.pageColumns));
      this.text.draw(ctx, "<> PAGE  X BACK", 8, G.config.INTERNAL_HEIGHT-18);
      this.text.draw(ctx, (page + 1) + "/" + count, G.config.INTERNAL_WIDTH-56, G.config.INTERNAL_HEIGHT-18, 8);
    }
  }
  G.rendering.CampaignUIRenderer = CampaignUIRenderer;
}(window.GBTRPG));
