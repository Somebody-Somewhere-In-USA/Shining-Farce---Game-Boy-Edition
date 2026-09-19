(function(G){
 "use strict";
 const V=G.campaign.Validation;
 G.editor.CAMPAIGN_TILES={".":{name:"GRASSLAND",frame:0},w:{name:"OCEAN",frame:1,terrainId:"ocean"},f:{name:"FOREST",frame:2},m:{name:"MOUNTAIN",frame:3},r:{name:"ROAD",frame:4},s:{name:"SWAMP",frame:5}};
 G.editor.BATTLE_TILES=Object.fromEntries(Object.values(G.data.BATTLE_TERRAIN).map(d=>[d.id,{name:d.id,terrainId:d.id,variants:[{id:d.id,spriteId:d.spriteId}]}]));
 function shift(width,height,edge,amount){V.assert(Number.isSafeInteger(width)&&Number.isSafeInteger(height)&&width>=30&&height>=30,"invalid initial map dimensions");V.assert(["NORTH","SOUTH","EAST","WEST"].includes(edge)&&Number.isSafeInteger(amount)&&amount!==0,"invalid resize");const vertical=["NORTH","SOUTH"].includes(edge),w=width+(vertical?0:amount),h=height+(vertical?amount:0);V.assert(w>=30&&h>=30&&Number.isSafeInteger(w*h),"minimum map dimensions are 30x30");return{width:w,height:h,dx:edge==="WEST"?amount:0,dy:edge==="NORTH"?amount:0};}
 function inside(p,w,h){return Number.isInteger(p.x)&&Number.isInteger(p.y)&&p.x>=0&&p.y>=0&&p.x<w&&p.y<h;}
 function resize(map,edge,amount,points=[],fill="ocean"){const change=shift(map.width,map.height,edge,amount);for(const p of points)V.assert(inside({x:p.x+change.dx,y:p.y+change.dy},change.width,change.height),"resize would crop required content");const tiles=Array.from({length:change.height},(_,y)=>Array.from({length:change.width},(_,x)=>V.clone(map.tiles[y-change.dy]?.[x-change.dx]??fill)));return{...change,tiles};}
 function tile(value){if(typeof value==="string")return{terrainId:value,variantId:value};V.assert(value&&Object.keys(value).every(k=>["terrainId","variantId"].includes(k)),"tiles contain identity/variant only, never movement costs");return value;}
 function validateTile(value){const t=tile(value),def=G.editor.BATTLE_TILES[t.terrainId];V.assert(def&&def.variants.some(v=>v.id===t.variantId),"mismatched terrain/visual variant");return true;}
 G.editor.MapAuthoring={shift,inside,resize,tile,validateTile};
}(window.GBTRPG));
