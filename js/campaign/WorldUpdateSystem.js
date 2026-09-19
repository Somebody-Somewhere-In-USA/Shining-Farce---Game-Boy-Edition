(function (G) {
  "use strict";
  G.campaign.WorldUpdateSystem = { update(s, events, definitions) {
    const r = s.resolution;
    G.campaign.Validation.assert(r?.movementCommitted && !r.worldUpdated, "world update requires unprocessed committed movement");
    const arrived = new Set(r.movementIntents.filter(i => r.outcomes[i.squadId] === "ARRIVE").map(i => i.destinationLocationId));
    for (const id of [...arrived].sort()) {
      const present = G.campaign.StationingSystem.present(s, id);
      if (present.length) G.campaign.PoliticalControlSystem.setController(s, id,
        G.campaign.PoliticalControlSystem.controllerAfterArrival(s.locations[id].controller, present[0].faction), events);
    }
    // Future recovery/economy/etc. attach here, after outcomes are fixed. None run now.
    r.resourceSummary = G.campaign.ResourceSystem.update(definitions, s, events);
    r.worldUpdated = true;
    events.push({ type: "WORLD_UPDATED", resolutionId: r.id, day: s.day });
  } };
}(window.GBTRPG));
