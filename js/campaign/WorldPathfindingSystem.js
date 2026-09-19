(function (G) {
  "use strict";
  function neighbors(d, s, locationId) {
    return Object.values(d.routes).filter(r => s.routes[r.id].available && !s.routes[r.id].blocked &&
      (r.locationAId === locationId || r.locationBId === locationId)).map(route => ({
        locationId: route.locationAId === locationId ? route.locationBId : route.locationAId, route
      }));
  }
  // Dijkstra with caller-supplied nonnegative weights; null is a clean no-path result.
  function find(d, s, originId, destinationId, weight = r => r.travelDays ?? 1) {
    const V = G.campaign.Validation;
    V.assert(V.has(d.locations, originId) && V.has(d.locations, destinationId), "unknown path endpoint");
    const costs = new Map([[originId, 0]]), previous = new Map(), pending = new Set([originId]), visited = new Set();
    while (pending.size) {
      const current = [...pending].sort((a, b) => costs.get(a) - costs.get(b) || a.localeCompare(b))[0];
      pending.delete(current);
      if (current === destinationId) {
        const locationIds = [current], routeIds = [];
        let cursor = current;
        while (cursor !== originId) {
          const step = previous.get(cursor);
          routeIds.unshift(step.routeId); locationIds.unshift(step.from); cursor = step.from;
        }
        return { locationIds, routeIds, totalCost: costs.get(current) };
      }
      visited.add(current);
      for (const { locationId, route } of neighbors(d, s, current)) {
        const cost = weight(route, current, locationId, s);
        V.assert((Number.isFinite(cost) && cost >= 0) || cost === Infinity, "path weight must be nonnegative");
        if (cost === Infinity || visited.has(locationId)) continue;
        const candidate = costs.get(current) + cost;
        if (candidate < (costs.get(locationId) ?? Infinity)) {
          costs.set(locationId, candidate); previous.set(locationId, { from: current, routeId: route.id }); pending.add(locationId);
        }
      }
    }
    return null;
  }
  G.campaign.WorldPathfindingSystem = { neighbors, find };
}(window.GBTRPG));
