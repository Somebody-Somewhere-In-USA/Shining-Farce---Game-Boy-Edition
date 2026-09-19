(function (G) {
  "use strict";
  const V = G.campaign.Validation, conflicts = G.campaign.MovementConflictSystem;
  function phase(s, next, events) {
    const previousPhase = s.phase; s.phase = next;
    events.push({ type: "CAMPAIGN_PHASE_CHANGED", previousPhase, phase: next, day: s.day });
  }
  function start(s, definitions, provider, events, known = G.campaign.TravelerSystem.knowledge(s)) {
    V.assert(s.phase === "PLANNING" && s.resolution === null, "End Day requires PLANNING with no active resolution");
    G.campaign.TravelerSystem.prepare(definitions, s, known, events);
    const frozenWorld = V.clone({ day: s.day, nextArrivalOrder: s.nextArrivalOrder, squads: s.squads, units: s.units, locations: s.locations, routes: s.routes, orders: s.orders });
    const supplied = provider.provide(definitions, V.freeze(V.clone(frozenWorld)));
    V.plainData(supplied, "Zeon orders");
    const frozenOrders = Object.fromEntries(Object.keys(s.orders).sort().filter(id => s.squads[id].faction === "PLAYER").map(id => [id, V.clone(s.orders[id])]));
    for (const id of Object.keys(supplied).sort()) {
      V.assert(s.squads[id]?.faction === "ZEON" && supplied[id].squadId === id, "Zeon provider returned an invalid squad order");
      frozenOrders[id] = V.clone(supplied[id]);
    }
    for (const id of Object.keys(frozenOrders).sort()) G.campaign.StrategicOrderSystem.validate(definitions, frozenWorld, frozenOrders[id]);
    s.orders = V.clone(frozenOrders);
    s.resolution = { id: "day" + s.day + "-run" + s.nextResolutionId++, resolutionDay: s.day,
      frozenWorld, frozenOrders, resourceBefore: G.campaign.ResourceSystem.capture(s), travelerIntents: [], travelerOutcomes: [], resourceSummary: null, movementIntents: [], conflicts: [], resolvedConflictIds: [], nextConflictIndex: 0,
      pendingBattleScenario: null, battleResults: [], outcomes: {}, movementCommitted: false, worldUpdated: false, dayAdvanced: false };
    phase(s, "ORDER_LOCK", events);
    events.push({ type: "END_DAY_RESOLUTION_STARTED", resolutionId: s.resolution.id, day: s.day });
    events.push({ type: "ORDERS_LOCKED", resolutionId: s.resolution.id, squadIds: Object.keys(frozenOrders).sort() });
  }
  function appendConflict(r, candidate, events) {
    const conflict = { ...candidate, id: "conflict" + (r.conflicts.length + 1), status: "PENDING", battleCount: 0 };
    r.conflicts.push(conflict);
    events.push({ type: "MOVEMENT_CONFLICT_DETECTED", resolutionId: r.id, conflictId: conflict.id, battleType: conflict.type,
      locationId: conflict.locationId, routeId: conflict.routeId, squadIds: [...conflict.participantIds] });
  }
  function commit(s, events) {
    const r = s.resolution;
    V.assert(!r.movementCommitted && !r.pendingBattleScenario && conflicts.locationCandidates(r).length === 0, "movement cannot commit with unresolved conflicts");
    for (const id of Object.keys(r.outcomes).sort()) if (r.outcomes[id] === "DEFEATED") {
      G.campaign.SquadSystem.dismiss(s, id, events, false);
      events.push({ type: "SQUAD_DEFEATED", squadId: id, resolutionId: r.id });
    }
    // Every outcome is already fixed. This loop is only a batch write, never a decision loop.
    for (const intent of r.movementIntents) {
      const id = intent.squadId;
      if (!s.squads[id]) continue;
      if (r.outcomes[id] === "ARRIVE") {
        s.squads[id].currentLocationId = intent.destinationLocationId;
        s.squads[id].arrivalOrder = s.nextArrivalOrder++;
        if (intent.remainingOrder) s.orders[id] = V.clone(intent.remainingOrder); else delete s.orders[id];
        events.push({ type: "SQUAD_MOVED", squadId: id, originId: intent.originLocationId, destinationId: intent.destinationLocationId, reason: "END_DAY", resolutionId: r.id });
      } else G.campaign.StrategicOrderSystem.cancel(s, id, events, "MOVEMENT_FAILED");
    }
    G.campaign.BattleCasualtySystem.apply(s,r);G.campaign.AwolSystem.apply(s,r);
    for (const id of Object.keys(s.locations).sort()) G.campaign.StationingSystem.reconcile(s, id, events);
    G.campaign.TravelerSystem.commit(s, r, events);
    r.movementCommitted = true;
  }
  function step(s, definitions, events) {
    const r = s.resolution;
    V.assert(r && s.phase !== "PLANNING", "no End Day resolution to resume");
    V.assert(!r.pendingBattleScenario, "resolution is paused awaiting BattleResult");
    switch (s.phase) {
      case "ORDER_LOCK":
        r.movementIntents = G.campaign.MovementIntentSystem.create(definitions, r.frozenWorld, r.frozenOrders);
        r.travelerIntents = G.campaign.TravelerSystem.intents(definitions, { ...r.frozenWorld, ...r.resourceBefore });
        r.outcomes = Object.fromEntries(Object.keys(r.frozenWorld.squads).sort().map(id => [id, r.frozenOrders[id] ? "ARRIVE" : "STAY"]));
        for (const intent of r.movementIntents) events.push({ type: "MOVEMENT_INTENT_CREATED", ...V.clone(intent) });
        phase(s, "MOVEMENT_INTENT", events); break;
      case "MOVEMENT_INTENT":
        r.travelerOutcomes = G.campaign.TravelerSystem.outcomes(r);
        conflicts.detect(r).forEach(candidate => appendConflict(r, candidate, events));
        phase(s, "COLLISION_DETECTION", events); break;
      case "COLLISION_DETECTION": phase(s, "RESOLUTION", events); break;
      case "RESOLUTION": {
        while (r.nextConflictIndex < r.conflicts.length) {
          const conflict = r.conflicts[r.nextConflictIndex], pair = conflicts.activePair(r, conflict);
          if (pair) {
            conflict.battleCount++;
            r.pendingBattleScenario = G.campaign.BattleBoundary.scenario(r, conflict, pair);
            events.push({ type: "BATTLE_REQUESTED", scenario: V.clone(r.pendingBattleScenario) });
            return;
          }
          conflict.status = conflict.battleCount ? "RESOLVED" : "SKIPPED";
          r.resolvedConflictIds.push(conflict.id); r.nextConflictIndex++;
        }
        // Retreats/crossings can expose a different final occupancy conflict. Derive it
        // from frozen intentions + recorded outcomes, without replanning anyone's route.
        const remaining = conflicts.locationCandidates(r);
        if (remaining.length) { remaining.forEach(candidate => appendConflict(r, candidate, events)); return; }
        commit(s, events); phase(s, "WORLD_UPDATE", events); break;
      }
      case "WORLD_UPDATE":
        G.campaign.WorldUpdateSystem.update(s, events, definitions); phase(s, "DAY_ADVANCE", events); break;
      case "DAY_ADVANCE": {
        G.campaign.CampaignTurnSystem.advance(s, events);
        r.dayAdvanced = true; s.lastResolution = r; s.resolution = null;
        phase(s, "PLANNING", events);
        events.push({ type: "END_DAY_RESOLUTION_COMPLETED", resolutionId: r.id, resolutionDay: r.resolutionDay, day: s.day }); break;
      }
      default: throw new Error("Campaign: invalid resolution phase " + s.phase);
    }
  }
  G.campaign.EndDayResolutionSystem = { start, step };
}(window.GBTRPG));
