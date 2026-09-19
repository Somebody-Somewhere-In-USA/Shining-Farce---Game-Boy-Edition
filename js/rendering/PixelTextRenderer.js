(function (G) {
  "use strict";
  class PixelTextRenderer {
    constructor(assets) { this.atlas = assets.getImage("pixelFont"); this.advance = 6; this.lineHeight = 10; }
    draw(ctx, text, x, y, maxChars = 26) {
      const lines = String(text).toUpperCase().split("\n");
      lines.forEach((line, row) => {
        [...line.slice(0, maxChars)].forEach((char, column) => {
          let code = char.charCodeAt(0);
          if (code < 32 || code > 95) code = 63;
          const index = code - 32;
          ctx.drawImage(this.atlas, (index % 16) * 6, Math.floor(index / 16) * 8, 6, 8,
            Math.round(x) + column * this.advance, Math.round(y) + row * this.lineHeight, 6, 8);
        });
      });
    }
    wrap(text, width = 23) {
      const lines = [];
      for (const paragraph of String(text).toUpperCase().split("\n")) {
        let line = "";
        for (let word of paragraph.split(/\s+/)) {
          if (line && line.length + word.length + 1 > width) { lines.push(line); line = ""; }
          while (word.length > width) { if (line) { lines.push(line); line = ""; } lines.push(word.slice(0, width)); word = word.slice(width); }
          if (word) line += (line ? " " : "") + word;
        }
        lines.push(line);
      }
      return lines;
    }
  }
  G.rendering.PixelTextRenderer = PixelTextRenderer;
}(window.GBTRPG));
