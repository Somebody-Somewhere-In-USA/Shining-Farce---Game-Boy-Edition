(function (G) {
  "use strict";
  const V=G.campaign.Validation;
  function validate(d,s,order,origin,requireAvailable=true){
    V.assert(Array.isArray(order.plannedLocationIds)&&Array.isArray(order.plannedRouteIds)&&order.plannedRouteIds.length>0,"order requires at least one route edge");
    V.assert(order.plannedLocationIds.length===order.plannedRouteIds.length+1,"order path lengths disagree");
    V.assert(order.plannedLocationIds[0]===origin,"order origin does not match traveler position");
    V.assert(order.destinationLocationId===order.plannedLocationIds.at(-1),"order destination does not match path");
    V.assert(Number.isSafeInteger(order.createdDay)&&order.createdDay>=1&&order.createdDay<=s.day,"invalid order creation day");
    order.plannedRouteIds.forEach((id,i)=>{const r=d.routes[id],a=order.plannedLocationIds[i],b=order.plannedLocationIds[i+1];
      V.assert(r&&d.locations[a]&&d.locations[b],"order references missing route/location");
      V.assert(r.locationAId===a&&r.locationBId===b||r.locationAId===b&&r.locationBId===a,"order path is not contiguous");
      if(requireAvailable)V.assert(s.routes[id]?.available&&!s.routes[id].blocked,"order uses unavailable/blocked route "+id);
    });return true;
  }
  function make(d,s,origin,destination,extra={},weight){const p=G.campaign.WorldPathfindingSystem.find(d,s,origin,destination,weight);if(!p?.routeIds.length)return null;return {...extra,destinationLocationId:destination,plannedLocationIds:p.locationIds,plannedRouteIds:p.routeIds,createdDay:s.day};}
  function next(order,identity){return {...identity,originLocationId:order.plannedLocationIds[0],destinationLocationId:order.plannedLocationIds[1],routeId:order.plannedRouteIds[0],remainingOrder:order.plannedRouteIds.length>1?{...V.clone(order),plannedLocationIds:order.plannedLocationIds.slice(1),plannedRouteIds:order.plannedRouteIds.slice(1)}:null};}
  G.campaign.TravelerPath={validate,make,next};
}(window.GBTRPG));
