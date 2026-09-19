(function (G) {
  "use strict";
  // Replace this provider with future AI. It receives a read-only pre-resolution snapshot.
  // No configured order means hold. Both factions then use the same intent builder.
  class ZeonOrderProvider {
    provide(definitions, frozenState) {
      return Object.fromEntries(Object.keys(frozenState.orders).sort().filter(id => frozenState.squads[id].faction === "ZEON")
        .map(id => [id, G.campaign.Validation.clone(frozenState.orders[id])]));
    }
  }
  G.campaign.ZeonOrderProvider = ZeonOrderProvider;
}(window.GBTRPG));
