(function (G) {
  "use strict";
  const V = G.campaign.Validation;
  function setController(s, locationId, controller, events) {
    V.assert(V.has(s.locations, locationId), "unknown location: " + locationId);
    V.assert(Object.values(G.campaign.Controller).includes(controller), "invalid controller: " + controller);
    const location = s.locations[locationId], previousController = location.controller;
    if (previousController === controller) return;
    location.controller = controller;
    events.push({ type: "LOCATION_CONTROL_CHANGED", locationId, previousController, controller });
  }
  function join(s, definitions, polityId, events) {
    V.assert(V.has(s.polities, polityId), "unknown polity: " + polityId);
    const polity = s.polities[polityId];
    if (polity.allegiance === "PLAYER") return;
    polity.allegiance = "PLAYER";
    for (const id of definitions.polities[polityId].locationIds) {
      if (s.locations[id].controller === "NEUTRAL") setController(s, id, "PLAYER", events);
    }
    events.push({ type: "POLITY_JOINED", polityId, allegiance: "PLAYER" });
  }
  function controllerAfterArrival(controller, faction) {
    return faction === "PLAYER" && controller === "NEUTRAL" ? "NEUTRAL" : faction;
  }
  G.campaign.PoliticalControlSystem = { setController, join, controllerAfterArrival };
}(window.GBTRPG));
