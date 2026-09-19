(function (G) {
  "use strict";
  const V = G.campaign.Validation;
  const check = (condition, message = "assertion failed") => { if (!condition) throw new Error(message); };
  function rejects(fn, pattern) { let error; try { fn(); } catch (e) { error = e; } check(error && (!pattern || pattern.test(error.message)), "expected " + pattern + ", got " + (error?.message || "success")); }
  const scenario = id => new G.campaign.Campaign(G.data.WORLD, G.campaign.DevelopmentScenarios.createState(G.data.WORLD, id));
  const restore = c => new G.campaign.Campaign(c.definitions, JSON.parse(JSON.stringify(c.state)));
  function result(c, winner = "PLAYER", loser = "DEFEATED") { return G.campaign.PlaceholderBattleResolver.result(c.state.resolution.pendingBattleScenario, winner, loser); }
  function settle(c, winner = "PLAYER") { let guard = 0; while (c.state.phase !== "PLANNING") { check(guard++ < 30, "resolution did not terminate"); if (c.state.resolution.pendingBattleScenario) c.applyBattleResult(result(c, winner)); else c.resumeResolution(); } }
  function runStrategicTests() {
    const results = [], test = (name, fn) => { try { fn(); results.push({ name, pass: true }); } catch (error) { results.push({ name, pass: false, error: error.message }); } };
    test("QUEUE NO MOVEMENT", () => { const c = G.campaign.createDemo(); c.queueMovement("vanguard", "crossroads"); check(c.state.day === 1 && c.state.squads.vanguard.currentLocationId === "granseal" && c.state.orders.vanguard.plannedRouteIds.length === 1); });
    test("REPLACE AND CANCEL", () => { const c = scenario("peaceful"); c.queueMovement("vanguard", "grove"); check(c.state.orders.vanguard.destinationLocationId === "grove"); c.cancelMovement("vanguard"); check(!c.state.orders.vanguard && c.state.day === 1); });
    test("DISCONNECTED ORDER", () => { const c = G.campaign.createDemo(); rejects(() => c.queueMovement("vanguard", "galam", { locationIds: ["granseal", "galam"], routeIds: ["westRoad"] }), /contiguous/); check(!c.state.orders.vanguard); });
    test("BLOCKED ORDER", () => { const c = G.campaign.createDemo(); c.setRouteAvailability("westRoad", { blocked: true }); rejects(() => c.queueMovement("vanguard", "crossroads", { locationIds: ["granseal", "crossroads"], routeIds: ["westRoad"] }), /blocked/); });
    test("CLOSED ORDER CANCELS", () => { const c = scenario("peaceful"); c.setRouteAvailability("kingRoad", { available: false }); check(!c.state.orders.vanguard); });
    test("ENEMY ORDER AUTHORITY", () => { const c = G.campaign.createDemo(); rejects(() => c.queueMovement("zeonGuard", "galam"), /PLAYER/); rejects(() => c.queueZeonDemoMovement("vanguard", "grove"), /ZEON/); });
    test("ONE EDGE PER DAY", () => { const c = scenario("peaceful"); c.endDay(); check(c.state.day === 2 && c.state.squads.vanguard.currentLocationId === "crossroads" && c.state.orders.vanguard.plannedRouteIds.length === 1); c.endDay(); check(c.state.day === 3 && c.state.squads.vanguard.currentLocationId === "galam" && !c.state.orders.vanguard); });
    test("INTENT IS NOT ARRIVAL", () => {
      const c = scenario("peaceful"), before = JSON.stringify(c.state.squads); c.startEndDay(); c.stepResolution();
      check(c.state.phase === "MOVEMENT_INTENT" && c.state.resolution.movementIntents[0].destinationLocationId === "crossroads" && JSON.stringify(c.state.squads) === before && c.state.day === 1);
    });
    test("LOCK BOTH FACTIONS", () => {
      const c = scenario("crossing"); c.startEndDay(); c.stepResolution(); const r = c.state.resolution;
      check(r.movementIntents.length === 2 && r.movementIntents.every(i => i.originLocationId === r.frozenWorld.squads[i.squadId].currentLocationId));
      rejects(() => { r.frozenOrders.vanguard.plannedRouteIds.pop(); });
    });
    test("PHASE COMMAND GUARDS", () => {
      const c = scenario("crossing"); c.endDay(); const before = JSON.stringify(c.state);
      for (const fn of [() => c.queueMovement("vanguard", "granseal"), () => c.cancelMovement("vanguard"), () => c.queueZeonDemoMovement("zeonGuard", "galam"),
        () => c.relocateForInspection("rangers", "crossroads"), () => c.stationSquad("granseal", "rangers"), () => c.supportPolity("galam"),
        () => c.setController("galam", "PLAYER"), () => c.dismissSquad("rangers"), () => c.setRouteAvailability("westRoad", { blocked: true }), () => c.endDay()]) rejects(fn, /PLANNING/);
      check(JSON.stringify(c.state) === before); rejects(() => c.stepResolution(), /BattleResult/);
    });
    test("FRIENDLY SAME NODE", () => { const c = G.campaign.createDemo(); c.queueMovement("vanguard", "crossroads"); c.queueMovement("rangers", "crossroads"); c.endDay(); check(c.state.day === 2 && c.squadsAt("crossroads").length === 2 && c.state.locations.crossroads.stationedSquadIds.PLAYER === "rangers" && c.state.lastResolution.conflicts.length === 0); });
    test("ARRIVAL KEEPS DEFENDER", () => { const c = G.campaign.createDemo(); c.relocateForInspection("vanguard", "crossroads"); c.queueMovement("rangers", "crossroads"); c.endDay(); check(c.state.locations.crossroads.stationedSquadIds.PLAYER === "vanguard"); });
    test("ZEON DEFENDER SUCCESSOR", () => { const c = G.campaign.createDemo(); c.createSquad({ id: "zReserve", name: "RESERVE", faction: "ZEON", unitIds: [], currentLocationId: "fortress" }); c.queueZeonDemoMovement("zeonGuard", "shrine"); c.endDay(); check(c.state.locations.fortress.stationedSquadIds.ZEON === "zReserve" && c.state.locations.shrine.stationedSquadIds.ZEON === "zeonGuard"); });
    test("OPPOSITE EDGE BATTLE", () => { const c = scenario("crossing"); const b = c.endDay(); check(b.battleType === "ROUTE_INTERCEPTION" && c.state.resolution.conflicts.length === 1 && c.state.squads.vanguard.currentLocationId === "grove" && c.state.squads.zeonGuard.currentLocationId === "fortress" && !c.state.resolution.movementCommitted); c.applyBattleResult(result(c)); check(c.state.day === 2 && c.state.squads.vanguard.currentLocationId === "fortress" && !c.state.squads.zeonGuard); });
    test("SIMULTANEOUS ARRIVAL", () => { const c = scenario("arrival"); const b = c.endDay(); check(b.battleType === "SIMULTANEOUS_ARRIVAL" && c.state.resolution.conflicts.length === 1 && c.state.squads.vanguard.currentLocationId === "crossroads"); c.applyBattleResult(result(c, "ZEON")); check(c.state.squads.zeonGuard.currentLocationId === "galam" && c.state.locations.galam.controller === "ZEON" && !c.state.squads.vanguard); });
    test("STATIONED DEFENSE", () => { const c = scenario("defender"), b = c.endDay(); check(b.battleType === "LOCATION_ATTACK" && b.defendingSquadId === "zeonGuard"); c.applyBattleResult(result(c)); check(c.state.locations.fortress.controller === "PLAYER" && c.state.polities.galam.allegiance === "NEUTRAL"); });
    test("DEFENDER VICTORY", () => { const c = scenario("defender"); c.endDay(); c.applyBattleResult(result(c, "ZEON")); check(c.state.locations.fortress.controller === "ZEON" && c.state.squads.zeonGuard && !c.state.squads.vanguard && c.state.units.mc); });
    test("MULTIPLE BATTLES", () => { const c = scenario("multiple"); let days = 0; c.events.on("DAY_ADVANCED", () => days++); c.endDay(); check(c.state.resolution.conflicts.length === 2); const first = result(c); c.applyBattleResult(first); check(c.state.day === 1 && c.state.phase === "RESOLUTION" && c.state.resolution.pendingBattleScenario.scenarioId !== first.scenarioId && !c.state.resolution.movementCommitted); rejects(() => c.applyBattleResult(first), /stale|match/); c.applyBattleResult(result(c)); check(c.state.day === 2 && days === 1 && c.state.lastResolution.battleResults.length === 2); });
    test("INTERRUPTED ROUND TRIP", () => { const c = scenario("multiple"); c.endDay(); c.applyBattleResult(result(c)); const loaded = restore(c); settle(c); settle(loaded); check(JSON.stringify(c.state) === JSON.stringify(loaded.state), "restored resolution diverged"); });
    test("EVERY PHASE RESTORES", () => { let c = scenario("peaceful"); c.startEndDay(); const phases = []; while (c.state.phase !== "PLANNING") { phases.push(c.state.phase); c = restore(c); c.stepResolution(); } check(phases.join() === G.campaign.Phases.slice(1).join() && c.state.day === 2); });
    test("DAY EXACTLY ONCE", () => { const c = scenario("crossing"); let days = 0; c.events.on("DAY_ADVANCED", e => { check(c.state.day === e.day && c.state.phase === "PLANNING"); days++; }); c.endDay(); check(days === 0); c.applyBattleResult(result(c)); check(days === 1 && c.state.day === 2); rejects(() => c.resumeResolution(), /no active/); rejects(() => c.applyBattleResult({ scenarioId: "stale", winnerFaction: "PLAYER", loserOutcome: "DEFEATED" }), /no pending/); check(c.state.day === 2); });
    test("RETREAT CANCELS ORDER", () => { const c = scenario("arrival"); c.endDay(); c.applyBattleResult(result(c, "ZEON", "RETREATED")); check(c.state.squads.vanguard.currentLocationId === "crossroads" && !c.state.orders.vanguard && c.state.squads.zeonGuard.currentLocationId === "galam"); });
    test("CROSSING RETREAT HALTS", () => { const c = scenario("crossing"); c.endDay(); c.applyBattleResult(result(c, "PLAYER", "RETREATED")); check(c.state.squads.vanguard.currentLocationId === "grove" && c.state.squads.zeonGuard.currentLocationId === "fortress" && Object.keys(c.state.orders).length === 0); });
    test("NO STATIONARY RETREAT", () => { const c = scenario("defender"); c.endDay(); const before = JSON.stringify(c.state); rejects(() => c.applyBattleResult({ scenarioId: c.state.resolution.pendingBattleScenario.scenarioId, winnerFaction: "PLAYER", loserOutcome: "RETREATED" }), /stationary/); check(before === JSON.stringify(c.state)); });
    test("RESERVE DEFENSE BATTLES", () => { const c = scenario("defender"); c.createSquad({ id: "zReserve", name: "RESERVE", faction: "ZEON", unitIds: [], currentLocationId: "fortress" }); c.endDay(); c.applyBattleResult(result(c)); check(c.state.day === 1 && c.state.resolution.pendingBattleScenario.defendingSquadId === "zReserve"); c.applyBattleResult(result(c)); check(c.state.day === 2 && c.state.lastResolution.battleResults.length === 2 && c.squadsAt("fortress").length === 1); });
    test("HOSTILE OCCUPANCY CHECK", () => { const c = G.campaign.createDemo(), s = c.snapshot(); s.squads.zeonGuard.currentLocationId = "granseal"; rejects(() => new G.campaign.Campaign(c.definitions, s), /hostile occupancy/); });
    test("LEGACY MIGRATION", () => { const c = G.campaign.createDemo(), old = c.snapshot(); old.schemaVersion = 1; delete old.orders; delete old.resolution; delete old.lastResolution; delete old.nextResolutionId; for (const l of Object.values(old.locations)) { l.stationedSquadId = l.stationedSquadIds.PLAYER; delete l.stationedSquadIds; } const loaded = new G.campaign.Campaign(c.definitions, old); check(loaded.state.schemaVersion===8 && loaded.state.locations.fortress.stationedSquadIds.ZEON === "zeonGuard" && !Object.hasOwn(loaded.state.locations.granseal, "stationedSquadId")); });
    test("MIXED STATIONING REJECT", () => { const c = G.campaign.createDemo(), s = c.snapshot(); s.locations.granseal.stationedSquadId = "vanguard"; rejects(() => new G.campaign.Campaign(c.definitions, s), /contradictory/); });
    test("CORRUPT INTENT REJECT", () => { const c = scenario("crossing"); c.endDay(); const s = c.snapshot(); s.resolution.movementIntents[0].destinationLocationId = "port"; rejects(() => new G.campaign.Campaign(c.definitions, s), /intents disagree/); });
    test("CORRUPT PENDING REJECT", () => { const c = scenario("crossing"); c.endDay(); const s = c.snapshot(); s.resolution.pendingBattleScenario.defendingSquadId = "rangers"; rejects(() => new G.campaign.Campaign(c.definitions, s), /BattleScenario/); });
    test("DETERMINISTIC OUTCOMES", () => { const a = scenario("multiple"), b = scenario("multiple"); a.endDay(); b.endDay(); settle(a); settle(b); check(JSON.stringify(a.state) === JSON.stringify(b.state)); });
    test("DEPARTING DEFENDER", () => {
      const demo = V.clone(G.data.DEMO_CAMPAIGN); demo.squads.find(q => q.id === "zeonGuard").currentLocationId = "crossroads";
      const c = new G.campaign.Campaign(G.data.WORLD, G.campaign.CampaignState.create(G.data.WORLD, demo));
      c.queueMovement("vanguard", "crossroads"); c.queueZeonDemoMovement("zeonGuard", "galam"); c.endDay();
      check(c.state.phase === "PLANNING" && c.state.squads.vanguard.currentLocationId === "crossroads" && c.state.squads.zeonGuard.currentLocationId === "galam" && c.state.lastResolution.conflicts.length === 0);
    });
    test("RETREAT ORIGIN CONFLICT", () => {
      const demo = V.clone(G.data.DEMO_CAMPAIGN);
      demo.squads.find(q => q.id === "vanguard").currentLocationId = "grove";
      demo.squads.find(q => q.id === "rangers").currentLocationId = "crossroads";
      demo.squads.find(q => q.id === "zeonGuard").currentLocationId = "shrine";
      demo.squads.push({ id: "zSecond", name: "SECOND", faction: "ZEON", unitIds: [], currentLocationId: "granseal" });
      const c = new G.campaign.Campaign(G.data.WORLD, G.campaign.CampaignState.create(G.data.WORLD, demo));
      c.queueMovement("vanguard", "fortress"); c.queueZeonDemoMovement("zeonGuard", "fortress"); c.queueZeonDemoMovement("zSecond", "grove");
      c.endDay(); c.applyBattleResult(result(c, "ZEON", "RETREATED"));
      check(c.state.resolution.pendingBattleScenario.locationId === "grove" && c.state.day === 1);
      rejects(() => c.applyBattleResult(result(c, "ZEON", "RETREATED")), /stationary/);
      c.applyBattleResult(result(c, "PLAYER")); check(c.state.day === 2 && c.state.squads.vanguard.currentLocationId === "grove" && !c.state.squads.zSecond);
    });
    test("OVERLAPPING CONFLICTS", () => {
      const c = scenario("crossing"); c.queueMovement("rangers", "grove"); c.endDay(); c.applyBattleResult(result(c, "ZEON"));
      check(c.state.resolution.pendingBattleScenario.locationId === "grove"); c.applyBattleResult(result(c));
      check(c.state.day === 2 && c.state.squads.rangers.currentLocationId === "grove" && !c.state.squads.zeonGuard && !c.state.squads.vanguard);
    });
    test("CORRUPT OUTCOME REJECT", () => {
      const c = scenario("multiple"); c.endDay(); c.applyBattleResult(result(c)); const s = c.snapshot(); s.resolution.outcomes.rangers = "DEFEATED";
      rejects(() => new G.campaign.Campaign(c.definitions, s), /outcomes disagree/);
    });
    test("CORRUPT QUEUE REJECT", () => {
      const c = scenario("crossing"); c.endDay(); const s = c.snapshot(), r = s.resolution;
      r.pendingBattleScenario = null; r.conflicts[0].status = "SKIPPED"; r.conflicts[0].battleCount = 0;
      r.nextConflictIndex = 1; r.resolvedConflictIds = [r.conflicts[0].id];
      rejects(() => new G.campaign.Campaign(c.definitions, s), /active hostile/);
    });
    test("CONFLICT ORDER STABLE", () => {
      const c = scenario("multiple"), s = c.snapshot(); s.squads = Object.fromEntries(Object.entries(s.squads).reverse()); s.orders = Object.fromEntries(Object.entries(s.orders).reverse());
      const reversed = new G.campaign.Campaign(c.definitions, s); c.endDay(); reversed.endDay();
      check(JSON.stringify(c.state.resolution.conflicts) === JSON.stringify(reversed.state.resolution.conflicts));
    });
    test("ZEON PROVIDER SNAPSHOT", () => {
      const base = G.campaign.createDemo(); let observed;
      const provider = { provide(d, frozen) { observed = frozen; check(Object.isFrozen(frozen) && Object.isFrozen(frozen.squads)); return { zeonGuard: G.campaign.StrategicOrderSystem.make(d, frozen, "zeonGuard", "shrine") }; } };
      const c = new G.campaign.Campaign(base.definitions, base.snapshot(), new G.core.EventBus(), provider); c.queueMovement("vanguard", "crossroads"); c.startEndDay();
      check(observed.squads.vanguard.currentLocationId === "granseal"); c.stepResolution(); check(c.state.resolution.movementIntents.length === 2); c.resumeResolution(); check(c.state.squads.zeonGuard.currentLocationId === "shrine");
    });
    test("MOVEMENT COMBINATIONS", () => {
      const base = scenario("crossing"), ids = ["vanguard", "rangers", "zeonGuard"];
      const options = ids.map(id => [null, ...base.neighbors(base.state.squads[id].currentLocationId).map(n => n.locationId)]);
      for (const a of options[0]) for (const b of options[1]) for (const z of options[2]) for (const winner of ["PLAYER", "ZEON"]) {
        const c = G.campaign.createDemo(); c.loadDevelopmentScenario("crossing");
        c.cancelMovement("vanguard");
        // Hold ZEON by using a fresh initial state with no authoritative orders.
        const initial = c.snapshot(); initial.orders = {}; const trial = new G.campaign.Campaign(c.definitions, initial);
        [a,b,z].forEach((target, i) => { if (target) { if (i === 2) trial.queueZeonDemoMovement(ids[i], target); else trial.queueMovement(ids[i], target); } });
        trial.endDay(); let count = 0;
        while (trial.state.phase !== "PLANNING") {
          check(count++ < 20, "combination did not terminate");
          const pending = trial.state.resolution.pendingBattleScenario;
          if (!pending) { trial.resumeResolution(); continue; }
          const loser = pending.participants.find(q => q.faction !== winner);
          const canRetreat = loser.squadId === pending.attackingSquadId ? pending.context.attackerMoving : pending.context.defenderMoving;
          trial.applyBattleResult(result(trial, winner, canRetreat && count % 2 ? "RETREATED" : "DEFEATED"));
        }
        check(trial.state.day === 2 && trial.validate(), "invalid final combination");
      }
    });
    return results;
  }
  G.debug.runStrategicTests = runStrategicTests;
}(window.GBTRPG));
