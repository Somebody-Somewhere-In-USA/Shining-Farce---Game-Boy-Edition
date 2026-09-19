(function(G){
  "use strict";
  const V=G.campaign.Validation;
  // Derived campaign positions: existing scenario/absence IDs remain the save authority.
  function resolve(d,reference){
    const locationId=reference.locationId??reference.battleLocationId;
    if(locationId){V.assert(d.locations[locationId],"unknown battle location");return{kind:"NODE",locationId,connections:[{locationId,distance:0}]};}
    const route=d.routes[reference.routeId];V.assert(route,"unknown battle route");
    const half=(route.travelDays??1)/2;V.assert(Number.isFinite(half)&&half>0,"invalid battle route weight");
    return{kind:"ROUTE_MIDPOINT",routeId:route.id,connections:[
      {locationId:route.locationAId,distance:half},
      {locationId:route.locationBId,distance:half}
    ]};
  }
  function distance(d,s,reference,destinationId){
    return Math.min(...resolve(d,reference).connections.map(endpoint=>endpoint.distance+
      (G.campaign.WorldPathfindingSystem.find(d,s,endpoint.locationId,destinationId)?.totalCost??Infinity)));
  }
  G.campaign.BattleLocationSystem={resolve,distance};
}(window.GBTRPG));
