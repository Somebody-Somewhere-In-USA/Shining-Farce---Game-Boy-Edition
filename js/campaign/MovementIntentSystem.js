(function (G) {
  "use strict";
  function create(definitions, frozenWorld, frozenOrders) {
    return Object.keys(frozenOrders).sort().map(id => {
      const order = frozenOrders[id];
      G.campaign.StrategicOrderSystem.validate(definitions, frozenWorld, order);
      return G.campaign.TravelerPath.next(order, { squadId: id, faction: frozenWorld.squads[id].faction });
    });
  }
  G.campaign.MovementIntentSystem = { create };
}(window.GBTRPG));
