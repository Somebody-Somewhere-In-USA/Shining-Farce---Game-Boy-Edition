(function (G) {
  "use strict";
  const V = G.campaign.Validation;
  function validate(d, s, order, requireAvailable = true) {
    V.assert(order && s.squads[order.squadId], "order references missing squad");
    const q = s.squads[order.squadId];
    V.assert(q.travelState === null, "squad already traveling");
    return G.campaign.TravelerPath.validate(d, s, order, q.currentLocationId, requireAvailable);
  }
  function make(d, s, squadId, destinationLocationId, path) {
    V.assert(s.squads[squadId], "unknown squad " + squadId);
    const proposed = path || G.campaign.WorldPathfindingSystem.find(d, s, s.squads[squadId].currentLocationId, destinationLocationId);
    V.assert(proposed, "no available path to destination");
    const order = { squadId, destinationLocationId, plannedLocationIds: [...proposed.locationIds], plannedRouteIds: [...proposed.routeIds], createdDay: s.day };
    validate(d, s, order); return order;
  }
  function cancel(s, squadId, events, reason = "PLAYER_CANCELLED") {
    V.assert(s.squads[squadId], "unknown squad " + squadId);
    if (!s.orders[squadId]) return;
    delete s.orders[squadId]; events.push({ type: "ORDER_CANCELLED", squadId, reason });
  }
  function queue(d, s, squadId, destinationId, path, faction, events) {
    V.assert(s.squads[squadId]?.faction === faction, "only " + faction + " squads are eligible for this order command");
    const order = make(d, s, squadId, destinationId, path);
    s.orders[squadId] = order;
    events.push({ type: "ORDER_QUEUED", squadId, destinationId, routeIds: [...order.plannedRouteIds] });
  }
  G.campaign.StrategicOrderSystem = { validate, make, queue, cancel };
}(window.GBTRPG));
