(function(G){
 "use strict";
 const V=G.campaign.Validation,FORMAT="SHINING_FARCE_AUTHORED",VERSION=1;
 // Sort object keys only: array order carries authored meaning (routes, refs, spots).
 function ordered(value){if(Array.isArray(value))return value.map(ordered);if(value&&typeof value==="object")return Object.fromEntries(Object.keys(value).sort().map(k=>[k,ordered(value[k])]));return value;}
 function json(value){V.plainData(value);return JSON.stringify(ordered(value),null,2)+"\n";}
 function mapDraft(map){V.plainData(map);V.assert(map&&V.validId(map.id),"invalid Battle Map ID");G.systems.BattleTerrainSystem.validate(map);G.editor.BattleMapAuthoring.shape(map);for(const row of map.tiles)for(const tile of row)G.editor.MapAuthoring.validateTile(tile);}
 function mapsById(maps){V.assert(Array.isArray(maps),"Battle Map list required");const out={};for(const map of maps){mapDraft(map);V.assert(!Object.hasOwn(out,map.id),"duplicate Battle Map ID: "+map.id);out[map.id]=V.clone(map);}return out;}
 function matchMapIds(maps,ids){const actual=Object.keys(maps),missing=ids.filter(id=>!Object.hasOwn(maps,id)),extra=actual.filter(id=>!ids.includes(id));V.assert(!missing.length&&!extra.length,"Battle Map assets do not match the Campaign Map index; missing: "+(missing.join(", ")||"none")+"; unlisted: "+(extra.join(", ")||"none"));}
 function campaignAsset(data){const document=V.clone(data),battleMapIds=Object.keys(document.battleMaps).sort();delete document.battleMaps;return{version:VERSION,document,battleMapIds};}
 function validateCampaignAsset(asset){V.plainData(asset);V.assert(asset?.version===VERSION&&asset.document?.version===1&&!Object.hasOwn(asset.document,"battleMaps"),"unsupported Campaign Map asset");V.assert(Array.isArray(asset.battleMapIds)&&asset.battleMapIds.every(V.validId)&&new Set(asset.battleMapIds).size===asset.battleMapIds.length,"invalid or duplicate Battle Map index");}
 function portable(data,kind="DOCUMENT",id=null){
  if(kind==="DOCUMENT")return json(data); // Existing v1 backup format, with stable output.
  if(kind==="CAMPAIGN"){
   const refs=[...new Set(Object.values(data.world.locations).flatMap(l=>l.battleMaps))].sort();
   return json({format:FORMAT,version:VERSION,kind,campaign:campaignAsset({...data,battleMaps:Object.fromEntries(refs.map(key=>[key,data.battleMaps[key]]))}),maps:refs.map(key=>data.battleMaps[key])});
  }
  V.assert(["BATTLE_MAP","BATTLE_MAPS"].includes(kind),"unsupported portable export kind");
  const ids=kind==="BATTLE_MAP"?[id]:Object.keys(data.battleMaps).sort();V.assert(ids.every(key=>Object.hasOwn(data.battleMaps,key)),"unknown Battle Map");
  return json({format:FORMAT,version:VERSION,kind,maps:ids.map(key=>data.battleMaps[key])});
 }
 function prepareImport(doc,text){
  const input=JSON.parse(text);V.plainData(input);let data,kind="DOCUMENT",conflicts=[];
  // A legacy document can have additional metadata named "format"; world marks
  // the original document shape, while partial wrappers have no top-level world.
  if(input&&Object.hasOwn(input,"format")&&!Object.hasOwn(input,"world")){
   V.assert(input.format===FORMAT&&input.version===VERSION,"unsupported authored-data format/version");kind=input.kind;
   V.assert(["CAMPAIGN","BATTLE_MAP","BATTLE_MAPS"].includes(kind),"unsupported authored-data kind");
   const maps=mapsById(input.maps);V.assert(kind!=="BATTLE_MAP"||input.maps.length===1,"individual Battle Map file must contain exactly one map");
   conflicts=Object.keys(maps).filter(id=>Object.hasOwn(doc.data.battleMaps,id)).sort();
   data=V.clone(doc.data);
   if(kind==="CAMPAIGN"){
    validateCampaignAsset(input.campaign);matchMapIds(maps,input.campaign.battleMapIds);
    data=V.clone(input.campaign.document);data.battleMaps=V.clone(doc.data.battleMaps);
   }
   Object.assign(data.battleMaps,maps);
  }else data=input;
  doc.validate(data);return{base:doc.data,data:V.freeze(V.clone(data)),kind,conflicts};
 }
 function ready(doc,{presentation=true}={}){doc.validate(doc.data);if(presentation){const r=G.editor.BattleSceneAssets.readiness(doc.data,{availability:true});V.assert(r.valid,"Battle Scene readiness: "+r.errors.join("; "));}for(const map of Object.values(doc.data.battleMaps)){const r=G.editor.BattleMapAuthoring.validate(map);V.assert(r.valid,map.id+": "+r.errors.join("; "));}G.editor.AuthoredContent.campaign(doc.data);return true;}
 // IDs are ASCII. Escape uppercase and underscores so distinct IDs cannot collide on Windows.
 function battlePath(id){V.assert(V.validId(id),"invalid Battle Map ID");return"js/data/maps/battle/battle-"+id.replace(/[A-Z_]/g,c=>"_"+c.charCodeAt(0).toString(16))+".js";}
 function script(method,data){return"// Generated shipping data. Import the JSON backup into the editor; do not import JavaScript.\nwindow.GBTRPG.data.AUTHORED_MAPS."+method+"(JSON.parse("+JSON.stringify(json(data))+"));\n";}
 function battleScript(map){mapDraft(map);const r=G.editor.BattleMapAuthoring.validate(map);V.assert(r.valid,map.id+": "+r.errors.join("; "));return script("registerBattle",map);}
 function campaignScript(doc){ready(doc);return script("registerCampaign",campaignAsset(doc.data));}
 function packageFiles(doc){
  ready(doc);const files=[{path:"js/data/maps/campaign/campaign.js",text:campaignScript(doc)}];
  for(const id of Object.keys(doc.data.battleMaps).sort())files.push({path:battlePath(id),text:battleScript(doc.data.battleMaps[id])});
  const tags=files.map(f=>'  <script src="'+f.path+'"></script>').join("\n");
  files.push({path:"map-scripts.html",text:"<!-- BEGIN AUTHORED MAP ASSETS -->\n"+tags+"\n<!-- END AUTHORED MAP ASSETS -->\n"});
  files.push({path:"js/data/authored-content.js",text:"// Split authored assets are loaded by index.html. Legacy content disabled.\nwindow.GBTRPG.data.AUTHORED_CONTENT = null;\n"});
  files.push({path:"editor-backup.json",text:portable(doc.data)});
  files.push({path:"INSTALL.txt",text:["SHINING FARCE / SHIPPING MAP PACKAGE","1. Back up your project and close the game.","2. Extract this package into the project root (beside index.html), replacing matching files.","3. In index.html replace only the BEGIN/END AUTHORED MAP ASSETS block with map-scripts.html's block.","4. Reopen index.html. Distribute the entire project folder.","Old unlisted Battle Map files are ignored. Do not remove the registry or legacy bootstrap script tags.","The package disables legacy monolithic content to avoid mixing two shipping sources.","editor-backup.json is a portable editor draft; importing it does not install shipping files.","The browser only downloads this package. It does not modify project files or campaign saves.","Individual replacements keep their generated filename and ID; adding/removing maps requires exporting the Campaign Map index and updating the script block."].join("\n")+"\n"});
  return files;
 }
 G.editor.AuthoredFiles={FORMAT,VERSION,json,portable,prepareImport,ready,mapDraft,mapsById,matchMapIds,campaignAsset,validateCampaignAsset,battlePath,battleScript,campaignScript,packageFiles};
}(window.GBTRPG));
