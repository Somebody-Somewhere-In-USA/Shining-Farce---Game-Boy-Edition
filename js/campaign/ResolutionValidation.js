(function (G) {
  "use strict";
  const V = G.campaign.Validation;
  const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  function validateRecord(d, s, r, historical = false) {
    V.assert(r && typeof r.id === "string" && Number.isSafeInteger(r.resolutionDay), "invalid resolution identity");
    V.assert(r.resolutionDay === (historical ? s.day - 1 : s.day), "resolution day disagrees with campaign day");
    V.assert(r.frozenWorld?.day === r.resolutionDay && r.frozenOrders && Array.isArray(r.movementIntents), "missing frozen resolution snapshot");
    V.assert(Array.isArray(r.conflicts) && Array.isArray(r.battleResults) && Array.isArray(r.resolvedConflictIds), "invalid conflict/result record");
    V.assert([r.movementCommitted, r.worldUpdated, r.dayAdvanced].every(x => typeof x === "boolean"), "invalid commit flags");
    V.assert(!r.worldUpdated || r.movementCommitted, "world update precedes movement commit");
    V.assert(!r.dayAdvanced || r.worldUpdated, "day advanced before world update");
    for (const [id, order] of Object.entries(r.frozenOrders)) {
      V.assert(order.squadId === id, "locked order key mismatch");
      G.campaign.StrategicOrderSystem.validate(d, r.frozenWorld, order);
    }
    if (s.phase !== "ORDER_LOCK" || historical) {
      const expected = G.campaign.MovementIntentSystem.create(d, r.frozenWorld, r.frozenOrders);
      V.assert(equal(expected, r.movementIntents), "movement intents disagree with frozen orders");
      V.assert(Object.keys(r.outcomes).sort().join() === Object.keys(r.frozenWorld.squads).sort().join(), "resolution outcome IDs mismatch");
      for (const [id, outcome] of Object.entries(r.outcomes)) {
        V.assert(["ARRIVE", "STAY", "RETREAT", "DEFEATED"].includes(outcome), "invalid movement outcome");
        V.assert(outcome !== "ARRIVE" || r.frozenOrders[id], "arrival has no frozen intention");
      }
    } else V.assert(r.movementIntents.length === 0 && Object.keys(r.outcomes).length === 0, "ORDER_LOCK already has intents/outcomes");
    V.assert(Number.isInteger(r.nextConflictIndex) && r.nextConflictIndex >= 0 && r.nextConflictIndex <= r.conflicts.length, "invalid conflict cursor");
    V.assert(r.resolvedConflictIds.length === r.nextConflictIndex, "resolved conflict cursor mismatch");
    const ids = new Set();
    r.conflicts.forEach((conflict, index) => {
      V.assert(!ids.has(conflict.id), "duplicate conflict ID"); ids.add(conflict.id);
      V.assert(["ROUTE_INTERCEPTION", "LOCATION_ATTACK", "SIMULTANEOUS_ARRIVAL"].includes(conflict.type), "invalid battle type");
      V.assert(conflict.routeId ? d.routes[conflict.routeId] && conflict.locationId === null : d.locations[conflict.locationId], "invalid conflict site");
      V.assert(conflict.participantIds.length >= 2 && new Set(conflict.participantIds).size === conflict.participantIds.length && conflict.participantIds.every(id => r.frozenWorld.squads[id]), "invalid conflict participants");
      V.assert(Number.isInteger(conflict.battleCount) && conflict.battleCount >= 0, "invalid conflict battle count");
      V.assert(index < r.nextConflictIndex ? ["RESOLVED", "SKIPPED"].includes(conflict.status) && r.resolvedConflictIds[index] === conflict.id : conflict.status === "PENDING", "conflict status/cursor mismatch");
    });
    V.assert(new Set(r.battleResults.map(x => x.scenarioId)).size === r.battleResults.length, "duplicate BattleResult");
    const initialOutcomes = Object.fromEntries(Object.keys(r.frozenWorld.squads).sort().map(id => [id, r.frozenOrders[id] ? "ARRIVE" : "STAY"]));
    if (["ORDER_LOCK", "MOVEMENT_INTENT"].includes(s.phase) && !historical) V.assert(r.conflicts.length === 0, "conflicts exist before collision detection");
    else {
      const base = G.campaign.MovementConflictSystem.detect({ ...r, outcomes: initialOutcomes });
      const signatures = r.conflicts.slice(0, base.length).map(c => ({ type: c.type, routeId: c.routeId, locationId: c.locationId, participantIds: c.participantIds }));
      const expected = base.map(c => ({ type: c.type, routeId: c.routeId, locationId: c.locationId, participantIds: c.participantIds }));
      V.assert(equal(signatures, expected), "conflict queue disagrees with frozen intentions");
      V.assert(r.conflicts.slice(base.length).every(c => c.routeId === null), "secondary conflict cannot invent a new route crossing");
      V.assert(r.conflicts.slice(0, r.nextConflictIndex).every(c => G.campaign.MovementConflictSystem.activePair(r, c) === null), "resolved conflict still has active hostile participants");
    }
    if (s.phase !== "ORDER_LOCK" || historical) {
      const replay = { ...r, battleResults:[], outcomes: { ...initialOutcomes } };
      const rounds = {};
      for (const result of r.battleResults) {
        const conflict = r.conflicts.find(c => c.id === result.scenario?.context.conflictId);
        V.assert(conflict, "BattleResult references missing conflict");
        const pair = G.campaign.MovementConflictSystem.activePair(replay, conflict);
        const round = rounds[conflict.id] = (rounds[conflict.id] || 0) + 1;
        V.assert(pair && equal(result.scenario, G.campaign.BattleBoundary.scenario(replay, { ...conflict, battleCount: round }, pair)), "BattleResult scenario cannot be replayed");
        const loser = G.campaign.BattleBoundary.validateResult(result.scenario, result);
        const winner = result.scenario.participants.find(q => q.faction === result.winnerFaction).squadId;
        V.assert(result.loserSquadId === loser && result.winnerSquadId === winner, "BattleResult squad outcomes disagree");
        replay.battleResults.push(result);
        replay.outcomes[loser] = result.loserOutcome === "DEFEATED" ? "DEFEATED" : "RETREAT";
        if (conflict.type === "ROUTE_INTERCEPTION" && result.loserOutcome === "RETREATED") replay.outcomes[winner] = "STAY";
      }
      V.assert(equal(replay.outcomes, r.outcomes), "resolution outcomes disagree with recorded battles");
      for (const conflict of r.conflicts) V.assert(conflict.battleCount === (rounds[conflict.id] || 0) + Number(r.pendingBattleScenario?.context.conflictId === conflict.id), "battle count disagrees with result history");
    }
    if (r.pendingBattleScenario) {
      V.assert(!historical && s.phase === "RESOLUTION" && !r.movementCommitted, "battle pending in invalid phase");
      const conflict = r.conflicts[r.nextConflictIndex], pair = conflict && G.campaign.MovementConflictSystem.activePair(r, conflict);
      V.assert(pair && equal(r.pendingBattleScenario, G.campaign.BattleBoundary.scenario(r, conflict, pair)), "pending BattleScenario disagrees with resolution");
      V.assert(!r.battleResults.some(item => item.scenarioId === r.pendingBattleScenario.scenarioId), "pending battle already resolved");
    }
    if (!r.movementCommitted) {
      V.assert(equal(s.squads, r.frozenWorld.squads) && equal(s.locations, r.frozenWorld.locations) && equal(s.routes, r.frozenWorld.routes) && equal(s.units, r.frozenWorld.units) && s.nextArrivalOrder === r.frozenWorld.nextArrivalOrder, "world mutated before simultaneous commit");
      V.assert(equal(s.orders, r.frozenOrders), "orders changed after order lock");
    } else {
      V.assert(r.nextConflictIndex === r.conflicts.length && !r.pendingBattleScenario, "committed with pending conflict");
      V.assert(G.campaign.MovementConflictSystem.locationCandidates(r).length === 0, "committed hostile occupancy");
      if (!historical) {
        const positions = G.campaign.MovementConflictSystem.projectedLocations(r);
        V.assert(Object.keys(positions).sort().join() === Object.keys(s.squads).sort().join(), "committed squad IDs disagree with outcomes");
        const expectedSquads = V.clone(r.frozenWorld.squads), expectedOrders = {}, expectedLocations = V.clone(r.frozenWorld.locations);
        let arrivalOrder = r.frozenWorld.nextArrivalOrder;
        for (const [id, outcome] of Object.entries(r.outcomes)) if (outcome === "DEFEATED") delete expectedSquads[id];
        for (const intent of r.movementIntents) if (r.outcomes[intent.squadId] === "ARRIVE") {
          expectedSquads[intent.squadId].currentLocationId = intent.destinationLocationId;
          expectedSquads[intent.squadId].arrivalOrder = arrivalOrder++;
          if (intent.remainingOrder) expectedOrders[intent.squadId] = intent.remainingOrder;
          if (r.worldUpdated) expectedLocations[intent.destinationLocationId].controller = G.campaign.PoliticalControlSystem.controllerAfterArrival(expectedLocations[intent.destinationLocationId].controller, intent.faction);
        }
        const dead=new Set([...G.campaign.BattleCasualtySystem.ids(r),...G.campaign.AwolSystem.removedIds(r)]);for(const q of Object.values(expectedSquads))q.unitIds=q.unitIds.filter(id=>!dead.has(id));
        const expectedState = { squads: expectedSquads, locations: expectedLocations };
        Object.keys(expectedLocations).sort().forEach(id => G.campaign.StationingSystem.reconcile(expectedState, id, []));
        V.assert(equal(s.squads, expectedSquads) && equal(s.locations, expectedLocations) && s.nextArrivalOrder === arrivalOrder, "committed world disagrees with frozen outcomes");
        V.assert(Object.keys(s.orders).sort().every(id => equal(s.orders[id], expectedOrders[id])) && Object.keys(s.orders).length === Object.keys(expectedOrders).length, "remaining orders disagree with committed movement");
      }
    }
    if (historical) V.assert(r.dayAdvanced && r.worldUpdated && r.movementCommitted, "incomplete last resolution");
  }
  function validate(d, s) {
    V.assert(s.orders && !Array.isArray(s.orders), "missing authoritative orders");
    for (const [id, order] of Object.entries(s.orders)) {
      V.assert(order.squadId === id, "order key does not match squad ID"); G.campaign.StrategicOrderSystem.validate(d, s, order);
    }
    V.assert(Number.isSafeInteger(s.nextResolutionId) && s.nextResolutionId > 0, "invalid resolution counter");
    if (s.phase === "PLANNING") V.assert(s.resolution === null, "planning retains active resolution");
    else {
      validateRecord(d, s, s.resolution);
      G.campaign.ResourceSystem.validateResolution(d, s, s.resolution);
      V.assert(s.resolution.movementCommitted === ["WORLD_UPDATE", "DAY_ADVANCE"].includes(s.phase), "movement commit/phase mismatch");
      V.assert(s.resolution.worldUpdated === (s.phase === "DAY_ADVANCE"), "world update/phase mismatch");
      V.assert(!s.resolution.dayAdvanced, "active resolution already advanced day");
    }
    if (s.lastResolution !== null) {
      // Historical records are independent of subsequent planning edits.
      V.assert(s.lastResolution.dayAdvanced && s.lastResolution.resolutionDay < s.day, "invalid last resolution summary");
    }
    return true;
  }
  G.campaign.ResolutionValidation = { validate, validateRecord };
}(window.GBTRPG));
