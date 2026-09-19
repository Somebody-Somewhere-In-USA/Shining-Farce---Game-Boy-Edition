(function (G) {
  "use strict";
  class CommandMenu {
    constructor(unit=null,turn=null,context={}) {this.entries=unit&&turn?G.systems.ActionCommandSystem.categories(unit,turn,context):[];}
  }
  G.ui.CommandMenu = CommandMenu;
}(window.GBTRPG));
