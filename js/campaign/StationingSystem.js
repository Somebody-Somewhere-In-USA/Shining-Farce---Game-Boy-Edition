(function (G) {
  "use strict";
  function present(s, locationId, faction) {
    return Object.values(s.squads).filter(q => q.currentLocationId === locationId && (!faction || q.faction === faction))
      .sort((a, b) => a.arrivalOrder - b.arrivalOrder || a.id.localeCompare(b.id));
  }
  function choose(s, locationId, squadId, events) {
    const q = s.squads[squadId];
    G.campaign.Validation.assert(q && present(s, locationId, q.faction).some(other => other.id === squadId), "defender must be a present faction squad");
    set(s, locationId, q.faction, squadId, events);
  }
  function set(s, locationId, faction, squadId, events) {
    const location = s.locations[locationId], previousSquadId = location.stationedSquadIds[faction];
    if (previousSquadId === squadId) return;
    location.stationedSquadIds[faction] = squadId;
    events.push({ type: "SQUAD_STATIONED", locationId, faction, squadId, previousSquadId });
  }
  function reconcile(s, locationId, events) {
    for (const faction of Object.values(G.campaign.Faction)) {
      const eligible = present(s, locationId, faction);
      if (eligible.some(q => q.id === s.locations[locationId].stationedSquadIds[faction])) continue;
      set(s, locationId, faction, eligible[0]?.id ?? null, events);
    }
  }
  G.campaign.StationingSystem = { present, choose, reconcile };
}(window.GBTRPG));
