(function (G) {
  "use strict";
  function create(definitions, demo) {
    G.campaign.Validation.definitions(definitions);
    const s = { schemaVersion: G.config.CAMPAIGN.schemaVersion, worldId: definitions.id,
      day: G.config.CAMPAIGN.initialDay, phase: "PLANNING", nextArrivalOrder: 1,
      polities: {}, locations: {}, routes: {}, squads: {}, units: {},
      orders: {}, resolution: null, lastResolution: null, nextResolutionId: 1 };
    for (const id of Object.keys(definitions.polities)) s.polities[id] = { allegiance: demo.allegiance[id], influences: {} };
    for (const id of Object.keys(definitions.locations)) s.locations[id] = { controller: demo.controllers[id], stationedSquadIds: { PLAYER: null, ZEON: null }, recovery: null };
    for (const id of Object.keys(definitions.routes)) s.routes[id] = { blocked: false, available: true };
    for (const id of demo.units) s.units[id] = { id, name: G.data.CAMPAIGN_CHARACTERS[id]?.name || id.toUpperCase() };
    for (const squad of demo.squads) G.campaign.SquadSystem.create(s, squad, []);
    G.campaign.ResourceSystem.initialize(definitions, s);
    G.campaign.Validation.state(definitions, s);
    return s;
  }
  function migrate(input, definitions = G.data.WORLD) {
    G.campaign.Validation.plainData(input);
    const s = G.campaign.Validation.clone(input);
    if (s.schemaVersion === 8) return s;
    if (s.schemaVersion === 1) {
    G.campaign.Validation.assert(s.phase === "PLANNING", "version 1 migration requires PLANNING");
    for (const [id, location] of Object.entries(s.locations)) {
      G.campaign.Validation.assert(!Object.hasOwn(location, "stationedSquadIds") && Object.hasOwn(location, "stationedSquadId"), "ambiguous legacy stationing at " + id);
      const playerId = location.stationedSquadId;
      const players = G.campaign.StationingSystem.present(s, id, "PLAYER");
      G.campaign.Validation.assert(playerId === null ? players.length === 0 : players.some(q => q.id === playerId), "invalid legacy PLAYER defender at " + id);
      location.stationedSquadIds = { PLAYER: playerId, ZEON: G.campaign.StationingSystem.present(s, id, "ZEON")[0]?.id ?? null };
      delete location.stationedSquadId;
    }
    s.schemaVersion = 2; s.orders = {}; s.resolution = null; s.lastResolution = null; s.nextResolutionId = 1;
    }
    if (s.schemaVersion === 2) {
      G.campaign.Validation.assert(s.phase === "PLANNING", "legacy resource migration requires PLANNING; finish the old resolution first");
      s.schemaVersion = 3; G.campaign.ResourceSystem.initialize(definitions, s);
    }
    if (s.schemaVersion === 3) G.campaign.CharacterMigration.migrate(s);
    if (s.schemaVersion === 4) G.campaign.ClassMigration.migrate(s);
    if (s.schemaVersion === 5) G.campaign.ClassEntryGrantSystem.migrate(s);
    if(s.schemaVersion===6){
      // A completed old refresh must replay with the old zero Mage growth, without rerolling candidates.
      if(s.resolution?.worldUpdated&&s.resolution.resourceSummary?.refreshed)s.resolution.legacyRecruitGrowth=true;
      s.schemaVersion=7; // Existing status field gains DEAD; no tactical fields are persisted.
    }
    if(s.schemaVersion===7){
      const legacy=(units,items)=>Object.fromEntries(Object.values(items||{}).filter(i=>{const id=i.state==="EQUIPPED"?i.place.id:i.assignedUnitId,u=units[id];return u?.currentClassId==="mage"&&!G.campaign.EquipmentEligibility.allows(u,G.data.ITEMS[i.definitionId]);}).map(i=>[i.id,i.state==="EQUIPPED"?i.place.id:i.assignedUnitId]));
      s.awol=G.campaign.AwolSystem.initial();s.legacyEquipment=legacy(s.units,s.itemInstances);
      for(const r of [s.resolution,s.lastResolution].filter(Boolean)){r.resourceBefore.awol=G.campaign.AwolSystem.initial();r.resourceBefore.legacyEquipment=legacy(r.frozenWorld.units,r.resourceBefore.itemInstances);}
      if(s.resolution){const combined={...s.resolution.resourceBefore.legacyEquipment,...s.legacyEquipment};s.legacyEquipment=combined;s.resolution.resourceBefore.legacyEquipment={...combined};}
      s.schemaVersion=8;
    }
    return s;
  }
  G.campaign.CampaignState = { create, migrate };
}(window.GBTRPG));
