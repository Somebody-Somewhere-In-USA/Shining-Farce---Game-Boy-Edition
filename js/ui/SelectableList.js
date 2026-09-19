(function (G) {
  "use strict";
  class SelectableList {
    constructor(items, visibleRows = G.config.UI.listRows) { this.items = items; this.visibleRows = visibleRows; this.index = 0; this.offset = 0; }
    move(delta) {
      if (!this.items.length) return;
      this.index = (this.index + delta + this.items.length) % this.items.length;
      this.offset = Math.max(0, Math.min(this.offset, this.index));
      if (this.index >= this.offset + this.visibleRows) this.offset = this.index - this.visibleRows + 1;
    }
    get selected() { return this.items[this.index]; }
  }
  G.ui.SelectableList = SelectableList;
}(window.GBTRPG));
