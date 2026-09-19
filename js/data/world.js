(function (G) {
  "use strict";
  // Definition IDs are save-file references. Pixel positions have no travel semantics.
  G.data.WORLD = {
    id: "foundation-world", name: "THE BORDERLANDS",
    polities: {
      granseal: { id: "granseal", name: "GRANSEAL", category: "KINGDOM", capitalLocationId: "granseal", locationIds: ["granseal", "crossroads", "grove"], politics: {} },
      galam: { id: "galam", name: "GALAM", category: "KINGDOM", capitalLocationId: "galam", locationIds: ["galam", "port", "fortress"], politics: {} },
      order: { id: "order", name: "DAWN ORDER", category: "RELIGIOUS ORDER", petitionLocationId: "shrine", locationIds: ["shrine"], politics: {} }
    },
    locations: {
      granseal: { id: "granseal", name: "GRANSEAL", polityId: "granseal", mapPosition: { x: 128, y: 288 }, locationType: "CAPITAL", services: [], recruitmentRefs: [], economy: {}, story: {} },
      crossroads: { id: "crossroads", name: "OLD CROSSROADS", polityId: "granseal", mapPosition: { x: 288, y: 176 }, locationType: "CROSSROADS" },
      grove: { id: "grove", name: "ELDER GROVE", polityId: "granseal", mapPosition: { x: 352, y: 416 }, locationType: "VILLAGE" },
      galam: { id: "galam", name: "GALAM CAPITAL", polityId: "galam", mapPosition: { x: 512, y: 128 }, locationType: "CAPITAL" },
      port: { id: "port", name: "GALAM PORT", polityId: "galam", mapPosition: { x: 800, y: 208 }, locationType: "PORT" },
      fortress: { id: "fortress", name: "BORDER FORT", polityId: "galam", mapPosition: { x: 624, y: 384 }, locationType: "FORTRESS" },
      shrine: { id: "shrine", name: "DAWN SHRINE", polityId: "order", mapPosition: { x: 896, y: 512 }, locationType: "SHRINE" }
    },
    routes: {
      westRoad: { id: "westRoad", locationAId: "granseal", locationBId: "crossroads", primaryTerrain: "grassland", routeType: "road", travelDays: 1, modifiers: [], wilderness: {}, battle: {} },
      groveTrail: { id: "groveTrail", locationAId: "granseal", locationBId: "grove", primaryTerrain: "forest", routeType: "trail", travelDays: 1 },
      kingRoad: { id: "kingRoad", locationAId: "crossroads", locationBId: "galam", primaryTerrain: "grassland", routeType: "road", travelDays: 1 },
      portRoad: { id: "portRoad", locationAId: "galam", locationBId: "port", primaryTerrain: "grassland", routeType: "road", travelDays: 1 },
      northPass: { id: "northPass", locationAId: "galam", locationBId: "fortress", primaryTerrain: "mountain", routeType: "pass", travelDays: 1 },
      marshWay: { id: "marshWay", locationAId: "grove", locationBId: "fortress", primaryTerrain: "swamp", routeType: "causeway", travelDays: 1 },
      dawnBridge: { id: "dawnBridge", locationAId: "fortress", locationBId: "shrine", primaryTerrain: "grassland", routeType: "bridge", travelDays: 1 }
    }
  };
}(window.GBTRPG));

