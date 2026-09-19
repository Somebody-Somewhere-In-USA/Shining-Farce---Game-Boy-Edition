(function(G){
 "use strict";
 const V=G.campaign.Validation;
 const ids=["road","grassland","forest","mountain","desert","river","stone","bridge","impassableMountain","impassableRiver","impassableLake","impassableWall","impassableTree","impassableCliff"];
 G.data.BATTLE_TERRAIN=Object.fromEntries(ids.map(id=>[id,{id,category:id.startsWith("impassable")?"IMPASSABLE":"TRAVERSABLE",traversable:!id.startsWith("impassable"),spriteId:id.startsWith("impassable")?"tileWall":"tileGrass"}]));
 // Ocean is intentionally impassable to ordinary units; race overrides remain the extension boundary.
 G.data.BATTLE_TERRAIN.ocean={id:"ocean",category:"IMPASSABLE",traversable:false,spriteId:"tileOcean",ruleStatus:"AUTHORITATIVE"};
 function tile(map,x,y){return map.tiles[y]?.[x];}
 function definition(map,x,y){const value=tile(map,x,y),base=G.data.BATTLE_TERRAIN[typeof value==="string"?value:value?.terrainId],variant=typeof value==="object"?G.editor?.BATTLE_TILES[value?.terrainId]?.variants.find(v=>v.id===value.variantId):null;return base&&variant?{...base,spriteId:variant.spriteId}:base;}
 function normal(map,u,x,y){const d=definition(map,x,y);if(!d)return{allowed:false,cost:null};const table=G.data.RACES[u.raceId]?.terrainOverrides||{},o=table[d.id]||table[d.category]||{};const cost=o.cost??1;V.assert(Number.isSafeInteger(cost)&&cost>=0,"invalid race terrain cost");return{allowed:o.traversable??d.traversable,cost};}
 function canOccupy(map,u,x,y){return Number.isInteger(x)&&Number.isInteger(y)&&x>=0&&y>=0&&x<map.width&&y<map.height&&!!definition(map,x,y)&&(G.systems.FlyingSystem.sources(u).length>0||normal(map,u,x,y).allowed);}
 function context(map,u,world){return{inBounds:(x,y)=>Number.isInteger(x)&&Number.isInteger(y)&&x>=0&&y>=0&&x<map.width&&y<map.height,canEnter:(x,y)=>normal(map,u,x,y).allowed,occupiable:(x,y,unit=u)=>normal(map,unit,x,y).allowed,cost:(x,y)=>normal(map,u,x,y).cost,occupant:(x,y)=>G.systems.PortalSystem.occupant(world,{x,y})};}
 function validate(map){V.assert(map&&Number.isInteger(map.width)&&Number.isInteger(map.height)&&map.width>=30&&map.height>=30,"Battle Map minimum is 30x30");V.assert(map.tiles.length===map.height&&map.tiles.every(row=>row.length===map.width),"Battle Map dimensions mismatch");for(let y=0;y<map.height;y++)for(let x=0;x<map.width;x++)V.assert(definition(map,x,y),"unknown Battle Map terrain");return true;}
 G.systems.BattleTerrainSystem={tile,definition,normal,canOccupy,context,validate};
}(window.GBTRPG));
