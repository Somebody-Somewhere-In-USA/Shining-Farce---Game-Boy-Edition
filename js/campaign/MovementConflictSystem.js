(function (G) {
  "use strict";
  const compare = (a, b) => a < b ? -1 : a > b ? 1 : 0;
  function projectedLocations(r) {
    const intents = Object.fromEntries(r.movementIntents.map(i => [i.squadId, i]));
    return Object.fromEntries(Object.keys(r.frozenWorld.squads).sort().filter(id => r.outcomes[id] !== "DEFEATED")
      .map(id => [id, r.outcomes[id] === "ARRIVE" ? intents[id].destinationLocationId : r.frozenWorld.squads[id].currentLocationId]));
  }
  function locationCandidates(r) {
    const groups = {};
    for (const [id, location] of Object.entries(projectedLocations(r))) (groups[location] ||= []).push(id);
    return Object.keys(groups).sort().filter(id => new Set(groups[id].map(q => r.frozenWorld.squads[q].faction)).size > 1)
      .map(id => ({ type: groups[id].every(q => r.outcomes[q] === "ARRIVE") ? "SIMULTANEOUS_ARRIVAL" : "LOCATION_ATTACK",
        locationId: id, routeId: null, participantIds: groups[id].sort() }));
  }
  function detect(r) {
    const conflicts = [];
    const intents = r.movementIntents;
    for (let a = 0; a < intents.length; a++) for (let b = a + 1; b < intents.length; b++) {
      const x = intents[a], y = intents[b];
      if (x.faction !== y.faction && x.routeId === y.routeId && x.originLocationId === y.destinationLocationId && x.destinationLocationId === y.originLocationId)
        conflicts.push({ type: "ROUTE_INTERCEPTION", routeId: x.routeId, locationId: null, participantIds: [x.squadId, y.squadId].sort() });
    }
    conflicts.push(...locationCandidates(r));
    // Routes first, then locations; explicit IDs resolve ties, never insertion order.
    return conflicts.sort((a, b) => Number(a.routeId === null) - Number(b.routeId === null) ||
      compare(a.routeId || a.locationId, b.routeId || b.locationId) || compare(a.participantIds.join("|"), b.participantIds.join("|")));
  }
  function activePair(r, conflict) {
    const world = r.frozenWorld, positions = projectedLocations(r);
    const ids = conflict.participantIds.filter(id => conflict.routeId ? r.outcomes[id] === "ARRIVE" : positions[id] === conflict.locationId);
    const groups = { PLAYER: [], ZEON: [] };
    ids.forEach(id => groups[world.squads[id].faction].push(id));
    if (!groups.PLAYER.length || !groups.ZEON.length) return null;
    const stationary = faction => groups[faction].filter(id => r.outcomes[id] !== "ARRIVE");
    const defendingFaction = stationary("PLAYER").length && !stationary("ZEON").length ? "PLAYER" : "ZEON";
    const attackingFaction = defendingFaction === "PLAYER" ? "ZEON" : "PLAYER";
    const choose = (faction, defending) => {
      const stationed = conflict.locationId && world.locations[conflict.locationId].stationedSquadIds[faction];
      if (defending && stationary(faction).includes(stationed)) return stationed;
      return groups[faction].slice().sort((a, b) => Number(r.outcomes[a] === "ARRIVE") - Number(r.outcomes[b] === "ARRIVE") ||
        world.squads[a].arrivalOrder - world.squads[b].arrivalOrder || compare(a, b))[0];
    };
    return { attackingSquadId: choose(attackingFaction, false), defendingSquadId: choose(defendingFaction, true) };
  }
  G.campaign.MovementConflictSystem = { projectedLocations, locationCandidates, detect, activePair };
}(window.GBTRPG));
