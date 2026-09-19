(function (G) {
  "use strict";
  const V = G.campaign.Validation;
  function create(s, spec, events) {
    V.assert(V.validId(spec.id) && !V.has(s.squads, spec.id), "invalid or duplicate squad ID: " + spec.id);
    V.assert(V.has(s.locations, spec.currentLocationId), "squad references nonexistent current location");
    if (s.treasuries) {
      V.assert(spec.unitIds.length <= 12, "squad exceeds 12 units");
      for (const id of spec.unitIds) V.assert(s.units[id] && !G.campaign.UnitManagementSystem.squadFor(s,id) && G.campaign.UnitManagementSystem.location(s,id) === spec.currentLocationId && s.units[id].faction === spec.faction && s.units[id].status === "ACTIVE" && !s.travelerOrders["unit_"+id], "unit must physically be at squad creation location");
      for (const id of spec.unitIds) s.units[id].unassignedLocationId = null;
    }
    const squad = { id: spec.id, name: spec.name, faction: spec.faction, unitIds: [...spec.unitIds],
      currentLocationId: spec.currentLocationId, travelState: null, createdDay: s.day,
      arrivalOrder: s.nextArrivalOrder++, mission: spec.mission ?? null,
      artifacts: { jewelOfLight: false, jewelOfEvil: false } };
    s.squads[squad.id] = squad;
    events.push({ type: "SQUAD_CREATED", squadId: squad.id });
    G.campaign.StationingSystem.reconcile(s, squad.currentLocationId, events);
    return squad.id;
  }
  function dismiss(s, id, events, reconcile = true) {
    V.assert(V.has(s.squads, id), "unknown squad: " + id);
    const locationId = s.squads[id].currentLocationId;
    if(s.treasuries) for(const unitId of s.squads[id].unitIds) { s.units[unitId].unassignedLocationId=locationId; if(!reconcile)s.units[unitId].status="DEFEATED"; }
    delete s.squads[id]; // Units remain independently addressable for future survival rules.
    if (s.orders[id]) { delete s.orders[id]; events.push({ type: "ORDER_CANCELLED", squadId: id, reason: "SQUAD_DISMISSED" }); }
    events.push({ type: "SQUAD_DISMISSED", squadId: id, locationId });
    if (reconcile) G.campaign.StationingSystem.reconcile(s, locationId, events);
  }
  function relocate(s, id, destinationId, events) {
    V.assert(V.has(s.squads, id) && V.has(s.locations, destinationId), "unknown squad or destination");
    const q = s.squads[id], originId = q.currentLocationId;
    if (originId === destinationId) return;
    q.currentLocationId = destinationId;
    q.arrivalOrder = s.nextArrivalOrder++;
    G.campaign.StationingSystem.reconcile(s, originId, events);
    G.campaign.StationingSystem.reconcile(s, destinationId, events);
    events.push({ type: "SQUAD_MOVED", squadId: id, originId, destinationId, reason: "INSPECTION" });
  }
  G.campaign.SquadSystem = { create, dismiss, relocate };
}(window.GBTRPG));
