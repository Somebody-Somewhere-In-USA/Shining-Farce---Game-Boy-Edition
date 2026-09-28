(function (G) {
  "use strict";
  const V = G.campaign.Validation;
  const check = (condition, message) => { if (!condition) throw new Error(message); };
  const rejects = (fn, pattern) => {
    let failure;
    try { fn(); } catch (error) { failure = error; }
    check(failure && (!pattern || pattern.test(failure.message)), "Expected rejection: " + pattern + "; got " + (failure?.message || "success"));
  };
  // Each test creates disposable state. Running this from the UI cannot change the game.
  function runFoundationTests() {
    const results = [];
    const test = (name, run) => { try { run(); results.push({ name, pass: true }); } catch (e) { results.push({ name, pass: false, error: e.message }); } };
    test("DETERMINISTIC START", () => check(JSON.stringify(G.campaign.createDemo().state) === JSON.stringify(G.campaign.createDemo().state), "nondeterministic initialization"));
    test("SHORTEST PATH", () => {
      const p = G.campaign.createDemo().findPath("granseal", "port");
      check(p.totalCost === 3 && p.routeIds.join() === "westRoad,kingRoad,portRoad", "wrong shortest path");
    });
    test("NO PATH", () => {
      const c = G.campaign.createDemo(); c.setRouteAvailability("westRoad", { blocked: true }); c.setRouteAvailability("groveTrail", { available: false });
      check(c.findPath("granseal", "port") === null, "disconnected path exists");
    });
    test("SAME NODE PATH", () => check(G.campaign.createDemo().findPath("granseal", "granseal").routeIds.length === 0, "same node should cost zero"));
    test("CUSTOM WEIGHTS", () => {
      const p = G.campaign.createDemo().findPath("granseal", "galam", r => r.id === "kingRoad" ? 20 : 1);
      check(p.totalCost === 3 && p.routeIds[0] === "groveTrail", "weight policy ignored");
    });
    test("BAD PATH WEIGHT", () => rejects(() => G.campaign.createDemo().findPath("granseal", "port", () => -1), /weight/));
    test("PIXELS NOT GRAPH", () => {
      const c = G.campaign.createDemo(), d = V.clone(c.definitions);
      Object.values(d.locations).forEach(l => { l.mapPosition = { x: 0, y: 0 }; });
      check(new G.campaign.Campaign(d, c.snapshot()).findPath("granseal", "port").totalCost === 3, "coordinates changed graph path");
    });
    test("POLITY SUPPORT", () => {
      const c = G.campaign.createDemo(); c.supportPolity("galam");
      check(c.state.polities.galam.allegiance === "PLAYER" && c.state.locations.galam.controller === "PLAYER" && c.state.locations.port.controller === "PLAYER" && c.state.locations.fortress.controller === "ZEON", "support/control transition failed");
    });
    test("SUPPORT IDEMPOTENT", () => {
      const c = G.campaign.createDemo(); let count = 0; c.events.on("POLITY_JOINED", () => count++);
      c.setController("port", "PLAYER"); c.supportPolity("galam"); c.supportPolity("galam"); check(count === 1 && c.state.locations.port.controller === "PLAYER", "repeat join changed state");
    });
    test("CONTROL NOT SUPPORT", () => {
      const c = G.campaign.createDemo(); c.setController("granseal", "ZEON"); check(c.state.polities.granseal.allegiance === "PLAYER", "conquest changed allegiance");
      rejects(() => c.setController("port", "OCCUPIED"), /controller/);
    });
    test("INITIAL STATIONING", () => {
      const c = G.campaign.createDemo(); check(c.squadsAt("granseal", "PLAYER").length === 2 && c.state.locations.granseal.stationedSquadIds.PLAYER === "vanguard", "wrong initial defender");
    });
    test("DEPARTURE SUCCESSOR", () => {
      const c = G.campaign.createDemo(); c.relocateForInspection("vanguard", "crossroads");
      check(c.state.locations.granseal.stationedSquadIds.PLAYER === "rangers" && c.state.locations.crossroads.stationedSquadIds.PLAYER === "vanguard", "wrong departure/arrival defender");
      c.relocateForInspection("vanguard", "granseal"); check(c.state.locations.granseal.stationedSquadIds.PLAYER === "rangers", "arrival replaced defender");
    });
    test("OLDEST ARRIVAL", () => {
      const c = G.campaign.createDemo(); c.createSquad({ id: "third", name: "THIRD", faction: "PLAYER", currentLocationId: "granseal", unitIds: [] });
      c.relocateForInspection("vanguard", "crossroads"); c.relocateForInspection("vanguard", "granseal"); c.dismissSquad("rangers");
      check(c.state.locations.granseal.stationedSquadIds.PLAYER === "third", "creation time incorrectly beat arrival order");
    });
    test("DISMISSAL SUCCESSOR", () => {
      const c = G.campaign.createDemo(); c.dismissSquad("vanguard"); check(c.state.locations.granseal.stationedSquadIds.PLAYER === "rangers" && c.state.units.mc, "dismissal failed or deleted units");
      c.dismissSquad("rangers"); check(c.state.locations.granseal.stationedSquadIds.PLAYER === null, "stale stationing");
    });
    test("MANUAL DEFENDER", () => {
      const c = G.campaign.createDemo(); c.stationSquad("granseal", "rangers"); check(c.state.locations.granseal.stationedSquadIds.PLAYER === "rangers", "manual choice ignored");
      c.stationSquad("fortress", "zeonGuard"); check(c.state.locations.fortress.stationedSquadIds.ZEON === "zeonGuard", "ZEON stationing ignored");
    });
    test("12 UNIT BOUNDARY", () => {
      const c = G.campaign.createDemo(), s = c.snapshot();
      const units = Array.from({ length: 13 }, (_, i) => "test" + i);
      for (const id of units) s.units[id] = G.campaign.UnitManagementSystem.make(id, "swordsman", "PLAYER", "grove");
      const fresh = new G.campaign.Campaign(c.definitions, s);
      fresh.createSquad({ id: "full", name: "FULL", faction: "PLAYER", currentLocationId: "grove", unitIds: units.slice(0, 12) });
      const before = JSON.stringify(fresh.state);
      rejects(() => fresh.setSquadMembers("full", units), /12/);
      check(JSON.stringify(fresh.state) === before, "rejection was not atomic");
      rejects(() => fresh.createSquad({ id: "tooMany", name: "BAD", faction: "PLAYER", currentLocationId: "grove", unitIds: units }), /12/);
    });
    test("UNIQUE MEMBERSHIP", () => rejects(() => G.campaign.createDemo().setSquadMembers("rangers", ["mc"]), /multiple squads/));
    test("UNKNOWN UNIT", () => rejects(() => G.campaign.createDemo().setSquadMembers("rangers", ["missing"]), /unknown unit/));
    test("INVALID ROUTE", () => { const d = V.clone(G.data.WORLD); d.routes.westRoad.locationBId = "missing"; rejects(() => V.definitions(d), /route westRoad.*nonexistent/); });
    test("INVALID POLITY LINK", () => { const d = V.clone(G.data.WORLD); d.polities.galam.locationIds.push("missing"); rejects(() => V.definitions(d), /polity galam/); });
    test("INVALID LOCATION LINK", () => { const d = V.clone(G.data.WORLD); d.locations.granseal.polityId = "missing"; rejects(() => V.definitions(d), /polity|mismatched/); });
    test("INVALID POSITION", () => { const c = G.campaign.createDemo(), s = c.snapshot(); s.squads.vanguard.currentLocationId = "missing"; rejects(() => new G.campaign.Campaign(c.definitions, s), /current location/); });
    test("ABSENT DEFENDER", () => { const c = G.campaign.createDemo(), s = c.snapshot(); s.locations.crossroads.stationedSquadIds.PLAYER = "vanguard"; rejects(() => new G.campaign.Campaign(c.definitions, s), /present/); });
    test("ENEMY DEFENDER", () => { const c = G.campaign.createDemo(), s = c.snapshot(); s.locations.fortress.stationedSquadIds.PLAYER = "zeonGuard"; rejects(() => new G.campaign.Campaign(c.definitions, s), /PLAYER/); });
    test("DUPLICATE AUTHORITY", () => { const c = G.campaign.createDemo(), s = c.snapshot(); s.squads.vanguard.isStationed = true; rejects(() => new G.campaign.Campaign(c.definitions, s), /contradictory/); });
    test("DAY EVENT", () => {
      const c = G.campaign.createDemo(); let received, committed = false; const off = c.events.on("DAY_ADVANCED", e => { received = e; committed = c.state.day === e.day; });
      c.advanceDay(); check(c.state.day === 2 && received.previousDay === 1 && received.day === 2 && committed, "wrong day event"); off(); c.advanceDay(); check(received.day === 2, "unsubscribe failed");
    });
    test("NO FAILED EVENTS", () => {
      const c = G.campaign.createDemo(); let emitted = 0; c.events.on("SQUAD_CREATED", () => emitted++);
      rejects(() => c.createSquad({ id: "bad", name: "BAD", faction: "NEUTRAL", unitIds: [], currentLocationId: "granseal" }), /faction/); check(emitted === 0 && !c.state.squads.bad, "invalid command leaked");
    });
    test("SERIALIZATION", () => {
      const c = G.campaign.createDemo(); c.supportPolity("galam"); c.advanceDay();
      const restored = new G.campaign.Campaign(c.definitions, JSON.parse(JSON.stringify(c.state)));
      check(JSON.stringify(c.state) === JSON.stringify(restored.state), "state did not round trip");
      restored.advanceDay(); check(c.state.day === 2 && restored.state.day === 3, "shared mutable references");
    });
    test("READ ONLY STATE", () => {
      const c = G.campaign.createDemo(); rejects(() => { c.state.day = 99; }); rejects(() => c.state.squads.vanguard.unitIds.push("x")); check(c.state.day === 1, "mutable public state");
    });
    test("TWO ARTIFACT SLOTS", () => {
      const c = G.campaign.createDemo(); check(Object.values(c.state.squads).every(q => Object.keys(q.artifacts).length === 2 && q.artifacts.jewelOfLight === false && q.artifacts.jewelOfEvil === false && !("inventory" in q)), "invalid artifacts");
    });
    test("NO HOSTILE TELEPORT", () => rejects(() => G.campaign.createDemo().relocateForInspection("rangers", "fortress"), /adjacent/));
    test("HOSTILE EDGE REJECTED", () => {
      const c = G.campaign.createDemo(); c.relocateForInspection("rangers", "grove"); rejects(() => c.relocateForInspection("rangers", "fortress"), /hostile/);
    });
    test("REJECT NON JSON STATE", () => {
      const c = G.campaign.createDemo(), s = c.snapshot(); s.squads.rangers.mission = () => {};
      rejects(() => new G.campaign.Campaign(c.definitions, s), /JSON/);
      s.squads.rangers.mission = s; rejects(() => new G.campaign.Campaign(c.definitions, s), /circular/);
    });
    test("DEFINITIONS READ ONLY", () => {
      const c = G.campaign.createDemo(); rejects(() => { c.definitions = {}; }); rejects(() => { c.definitions.locations.galam.name = "X"; });
    });
    return results.concat(G.debug.runStrategicTests ? G.debug.runStrategicTests() : [], G.debug.runMapTests ? G.debug.runMapTests() : [], G.debug.runResourceTests ? G.debug.runResourceTests() : [], G.debug.runCharacterStatsTests ? G.debug.runCharacterStatsTests() : [], G.debug.runClassFoundationTests ? G.debug.runClassFoundationTests() : [], G.debug.runProgressionConsolidationTests ? G.debug.runProgressionConsolidationTests() : [], G.debug.runSpellFrameworkTests ? G.debug.runSpellFrameworkTests() : [], G.debug.runSpellCorrectionsTests ? G.debug.runSpellCorrectionsTests() : [], G.debug.runRouteMidpointTests ? G.debug.runRouteMidpointTests() : [], G.debug.runBattleFoundationTests ? G.debug.runBattleFoundationTests() : [], G.debug.runDeveloperToolsTests ? G.debug.runDeveloperToolsTests() : [], G.debug.runDeploymentOceanTests ? G.debug.runDeploymentOceanTests() : [], G.debug.runAuthoringPersistenceTests ? G.debug.runAuthoringPersistenceTests() : [], G.debug.runShippingPageTests ? G.debug.runShippingPageTests() : [], G.debug.runBattleSceneAssetTests ? G.debug.runBattleSceneAssetTests() : [], G.debug.runAssetAcceptanceTests ? G.debug.runAssetAcceptanceTests() : [], G.debug.runPresentationShellTests ? G.debug.runPresentationShellTests() : [], G.debug.runPowerPresentationTests ? G.debug.runPowerPresentationTests() : []);
  }
  const foundationVisuals=G.data.WORLD_VISUALS;
  G.debug.runFoundationTests = function(){
    const previous={registry:G.data.AUTHORED_MAPS,legacy:G.data.AUTHORED_CONTENT,visuals:G.data.WORLD_VISUALS,runtime:{...G.core.DeveloperRuntime}};
    try{G.data.AUTHORED_MAPS=new G.editor.AuthoredRegistry();G.data.AUTHORED_MAPS.useDemo();G.data.AUTHORED_CONTENT=null;G.data.WORLD_VISUALS=foundationVisuals;return runFoundationTests();}
    finally{G.data.AUTHORED_MAPS=previous.registry;G.data.AUTHORED_CONTENT=previous.legacy;G.data.WORLD_VISUALS=previous.visuals;Object.assign(G.core.DeveloperRuntime,previous.runtime);}
  };
}(window.GBTRPG));
