(function (G) {
  "use strict";
  const assert = (condition, message) => { if (!condition) throw new Error("Campaign: " + message); };
  const has = (object, key) => Object.hasOwn(object, key);
  const validId = id => typeof id === "string" && /^[a-zA-Z][a-zA-Z0-9_-]*$/.test(id) && !["constructor", "prototype", "__proto__"].includes(id);
  const clone = value => JSON.parse(JSON.stringify(value));
  function plainData(value, label = "state", ancestors = new Set()) {
    if (value === null || typeof value === "string" || typeof value === "boolean") return;
    if (typeof value === "number") { assert(Number.isFinite(value), label + " contains a non-finite number"); return; }
    assert(typeof value === "object", label + " must contain only JSON data");
    assert(Array.isArray(value) || Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null, label + " contains a non-plain object");
    assert(!ancestors.has(value), label + " contains a circular reference");
    ancestors.add(value);
    for (const [key, item] of Object.entries(value)) plainData(item, label + "." + key, ancestors);
    ancestors.delete(value);
  }
  function freeze(value) {
    if (value && typeof value === "object" && !Object.isFrozen(value)) {
      Object.values(value).forEach(freeze);
      Object.freeze(value);
    }
    return value;
  }
  function exactKeys(actual, expected, label) {
    assert(actual && typeof actual === "object", label + " is missing");
    assert(Object.keys(actual).sort().join("|") === Object.keys(expected).sort().join("|"), label + " IDs do not match definitions");
  }
  function definitions(d) {
    plainData(d, "definitions");
    assert(validId(d.id), "invalid world ID");
    for (const group of ["polities", "locations", "routes"]) {
      assert(d[group] && typeof d[group] === "object", "missing " + group);
      for (const [id, item] of Object.entries(d[group])) {
        assert(validId(id) && item.id === id, group + " ID/key mismatch: " + id);
      }
    }
    for (const p of Object.values(d.polities)) {
      assert(Array.isArray(p.locationIds) && new Set(p.locationIds).size === p.locationIds.length, "invalid location list for polity " + p.id);
      for (const id of p.locationIds) assert(has(d.locations, id) && d.locations[id].polityId === p.id, "polity " + p.id + " references missing or mismatched location " + id);
      for (const id of [p.capitalLocationId, p.petitionLocationId].filter(Boolean)) assert(p.locationIds.includes(id), "polity seat is not a member location: " + p.id);
    }
    for (const l of Object.values(d.locations)) {
      assert(has(d.polities, l.polityId), "location " + l.id + " references nonexistent polity " + l.polityId);
      assert(d.polities[l.polityId].locationIds.includes(l.id), "location missing from polity: " + l.id);
      assert(Number.isInteger(l.mapPosition?.x) && Number.isInteger(l.mapPosition?.y), "invalid map position: " + l.id);
      for (const key of ["controller", "stationedSquadId", "stationedSquadIds", "owner"]) assert(!has(l, key), "mutable/ambiguous " + key + " in location definition " + l.id);
    }
    for (const r of Object.values(d.routes)) {
      assert(has(d.locations, r.locationAId) && has(d.locations, r.locationBId), "route " + r.id + " references nonexistent location");
      assert(r.locationAId !== r.locationBId, "self route: " + r.id);
      assert(Number.isFinite(r.travelDays ?? 1) && (r.travelDays ?? 1) > 0, "invalid travelDays: " + r.id);
    }
    return true;
  }
  function state(d, s) {
    plainData(s);
    assert(s.schemaVersion === G.config.CAMPAIGN.schemaVersion && s.worldId === d.id, "unsupported schema or world");
    assert(Number.isSafeInteger(s.day) && s.day >= 1, "day must be a positive integer");
    assert(G.campaign.Phases.includes(s.phase), "invalid campaign phase");
    exactKeys(s.polities, d.polities, "polities"); exactKeys(s.locations, d.locations, "locations"); exactKeys(s.routes, d.routes, "routes");
    for (const [id, p] of Object.entries(s.polities)) {
      assert(Object.values(G.campaign.Allegiance).includes(p.allegiance), "invalid allegiance: " + id);
      assert(!has(p, "controller") && !has(p, "owner"), "contradictory political control: " + id);
    }
    for (const [id, r] of Object.entries(s.routes)) assert(typeof r.blocked === "boolean" && typeof r.available === "boolean", "invalid route availability: " + id);
    assert(s.units && s.squads, "missing units or squads");
    for (const [id, unit] of Object.entries(s.units)) assert(validId(id) && unit.id === id, "invalid unit ID: " + id);
    const members = new Set(), arrivals = new Set();
    assert(Number.isSafeInteger(s.nextArrivalOrder) && s.nextArrivalOrder > 0, "invalid arrival counter");
    for (const [id, q] of Object.entries(s.squads)) {
      assert(validId(id) && q.id === id, "squad ID/key mismatch: " + id);
      assert(Object.values(G.campaign.Faction).includes(q.faction), "invalid squad faction: " + id);
      assert(typeof q.name === "string" && q.name.length > 0, "squad needs a name: " + id);
      assert(Array.isArray(q.unitIds) && q.unitIds.length <= G.config.CAMPAIGN.maxSquadUnits, "squad " + id + " exceeds 12 units or has invalid membership");
      for (const unit of q.unitIds) {
        assert(has(s.units, unit), "unknown unit " + unit + " in " + id);
        assert(!members.has(unit), "unit belongs to multiple squads or is duplicated: " + unit);
        members.add(unit);
      }
      assert(has(d.locations, q.currentLocationId), "squad " + id + " references nonexistent current location");
      assert(q.travelState === null, "travelState must be null; orders/intents own strategic travel in schema 2");
      assert(!has(q, "isStationed") && !has(q, "inventory") && !has(q, "spriteId"), "contradictory stationing, inventory or sprite authority in " + id);
      assert(Number.isSafeInteger(q.createdDay) && q.createdDay >= 1 && q.createdDay <= s.day, "invalid createdDay: " + id);
      assert(Number.isSafeInteger(q.arrivalOrder) && q.arrivalOrder > 0 && q.arrivalOrder < s.nextArrivalOrder && !arrivals.has(q.arrivalOrder), "invalid/duplicate arrivalOrder: " + id);
      arrivals.add(q.arrivalOrder);
      exactKeys(q.artifacts, { jewelOfLight: false, jewelOfEvil: false }, "artifact slots for " + id);
      assert(Object.values(q.artifacts).every(v => typeof v === "boolean"), "artifact presence must be boolean: " + id);
    }
    for (const [id, l] of Object.entries(s.locations)) {
      assert(Object.values(G.campaign.Controller).includes(l.controller), "invalid controller: " + id);
      assert(!has(l, "allegiance") && !has(l, "owner") && !has(l, "squadIds") && !has(l, "stationedSquadId"), "contradictory location authority: " + id);
      exactKeys(l.stationedSquadIds, { PLAYER: null, ZEON: null }, "defender factions at " + id);
      const all = Object.values(s.squads).filter(q => q.currentLocationId === id);
      assert(new Set(all.map(q => q.faction)).size <= 1, "unresolved hostile occupancy at " + id);
      for (const faction of Object.values(G.campaign.Faction)) {
        const present = all.filter(q => q.faction === faction), defenderId = l.stationedSquadIds[faction];
        if (defenderId !== null) {
          assert(has(s.squads, defenderId), "stationed squad does not exist at " + id);
          assert(present.some(q => q.id === defenderId), "stationed squad must be " + faction + " and present at " + id);
        } else assert(present.length === 0, faction + " squads present but no stationed defender at " + id);
      }
    }
    G.campaign.ResourceSystem.validate(d, s);
    G.campaign.ResolutionValidation.validate(d, s);
    return true;
  }
  G.campaign.Validation = { assert, has, validId, clone, freeze, plainData, definitions, state };
}(window.GBTRPG));
