(function(G){
 "use strict";
 const V=G.campaign.Validation;
 function source(scenario,definitions){if(scenario.routeId){const route=definitions.routes[scenario.routeId];V.assert(route,"unknown route");return{type:"PROCEDURAL",routeId:route.id,battleLocation:G.campaign.BattleLocationSystem.resolve(definitions,scenario),biomes:route.biomes||[route.primaryTerrain].filter(Boolean),transitions:route.biomeTransitions||[],infrastructure:route.infrastructure||[route.routeType].filter(Boolean)};}const location=definitions.locations[scenario.locationId];V.assert(location,"unknown location");return{type:"STATIC",locationId:location.id,mapId:location.battleMapId??null};}
 function prepare(scenario,definitions,providers={}){
  const spec=source(scenario,definitions),location=definitions.locations[spec.locationId];let map;
  if(spec.type==="STATIC"&&location.battleMaps?.length){
   map=G.editor.AuthoredContent.select(location,providers.staticMaps||{},{controller:providers.campaignState?.locations[location.id]?.controller,story:providers.storyState?.(scenario,definitions)||{},choose:providers.chooseStaticMap});
   if(map.status)return{...map,source:spec};spec.mapId=map.id;
  }else map=spec.type==="STATIC"?providers.staticMaps?.[spec.mapId]:providers.generate?.(spec,scenario);
  if(!map)return{status:"UNRESOLVED_BATTLE_MAP",source:spec};
  G.systems.BattleTerrainSystem.validate(map);
  if(map.conditions){const result=G.editor.BattleMapAuthoring.validate(map);if(!result.valid)return{status:"INVALID_AUTHORED_BATTLE_MAP",errors:result.errors,source:spec};}
  const orientation=providers.orientation?.(scenario,definitions)??map.orientation;
  if(!orientation)return{status:"UNRESOLVED_DEPLOYMENT_ORIENTATION",source:spec};
  if(map.approaches)V.assert(Object.values(orientation).every(side=>map.approaches.includes(side)),"orientation does not match authored approach axis");
  const deployment=G.systems.DeploymentSystem.assign(map,scenario.participants,orientation,providers.designations||{},providers.seed??G.core.DeterministicRandom.seedFromId(scenario.scenarioId)),special=map.specialDeployments?G.editor.BattleMapAuthoring.instantiate(map):{units:[],positions:{}};
  const ids=new Set(scenario.participants.flatMap(q=>q.units.map(u=>u.id))),used=new Set(Object.values(deployment.positions).map(p=>p.x+","+p.y));
  for(const u of special.units){const p=special.positions[u.id];V.assert(!ids.has(u.id)&&!used.has(p.x+","+p.y),"special deployment collision");ids.add(u.id);used.add(p.x+","+p.y);}
  return{status:"READY",source:spec,map:V.clone(map),scenario:{...V.clone(scenario),positions:{...deployment.positions,...special.positions},specialUnits:special.units},deployment};
 }
 G.systems.BattleInitializationSystem={source,prepare};
}(window.GBTRPG));
