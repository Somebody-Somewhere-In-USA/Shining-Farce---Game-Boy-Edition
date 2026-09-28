(function(G){
 "use strict";
 const V=G.campaign.Validation,F=G.editor.AuthoredFiles;
 const FORMAT="SHINING_FARCE_SHIPPING_PAGE",VERSION=1,ID="shining-farce-shipping-data";
 const BEGIN="<!-- BEGIN AUTHORED MAP ASSETS -->",END="<!-- END AUTHORED MAP ASSETS -->";
 let template=null;
 function payload(doc){F.ready(doc);return{format:FORMAT,version:VERSION,campaign:F.campaignAsset(doc.data),maps:Object.keys(doc.data.battleMaps).sort().map(id=>doc.data.battleMaps[id])};}
 function decode(text){
  const data=JSON.parse(text),registry=new G.editor.AuthoredRegistry();V.plainData(data);
  if(data===null){registry.useDemo();return registry;}
  V.assert(data.format===FORMAT&&data.version===VERSION,"unsupported shipping page format/version");
  F.validateCampaignAsset(data.campaign);const maps=F.mapsById(data.maps);F.matchMapIds(maps,data.campaign.battleMapIds);
  registry.registerCampaign(data.campaign);for(const map of Object.values(maps))registry.registerBattle(map);
  registry.assemble(G.campaign.createDemo(),null,true);return registry;
 }
 function install(text){
  const candidate=decode(text),current=G.data.AUTHORED_MAPS,legacy=G.data.AUTHORED_CONTENT;
  // Empty page data explicitly allows an already installed legacy source.
  if(!candidate.campaign){current.assemble(G.campaign.createDemo(),legacy);current.useDemo();return current;}
  V.assert(!legacy&&!current.campaign&&!Object.keys(current.maps).length&&!current.errors.length,"both HTML and legacy/split shipping sources installed");
  G.data.AUTHORED_MAPS=candidate;return candidate;
 }
 function start(dom){
  const nodes=dom.querySelectorAll('[id="'+ID+'"]');
  if(!nodes.length){
   // Compatibility for a previously installed classic-script launcher.
   V.assert(G.data.AUTHORED_CONTENT||G.data.AUTHORED_MAPS.campaignScriptLoaded,"shipping data block missing");
   G.data.AUTHORED_MAPS.assemble(G.campaign.createDemo(),G.data.AUTHORED_CONTENT,true);
  }else{
   V.assert(nodes.length===1&&nodes[0].tagName==="SCRIPT"&&nodes[0].getAttribute("type")==="application/json"&&!nodes[0].hasAttribute("src"),"invalid or duplicate shipping data block");
   install(nodes[0].textContent);
  }
  // Capture before Game.start changes status/styles. Export never serializes a live editor.
  template="<!doctype html>\n"+dom.documentElement.outerHTML;
 }
 function block(doc){const data=F.json(payload(doc)).replace(/</g,"\\u003c").replace(/>/g,"\\u003e").replace(/&/g,"\\u0026");return BEGIN+'\n<script type="application/json" id="'+ID+'">\n'+data+'</script>\n'+END;}
 function page(doc,source=template){
  const data=block(doc);V.assert(typeof source==="string","launcher template unavailable; reopen the updated index.html");
  V.assert(source.split(BEGIN).length===2&&source.split(END).length===2&&source.indexOf(BEGIN)<source.indexOf(END),"launcher must have one authored-data marker pair");
  const result=source.slice(0,source.indexOf(BEGIN))+data+source.slice(source.indexOf(END)+END.length);
  // Retire the old monolith tag outside the original assets block during migration.
  return result.replace(/<script\s+src=["']js\/data\/authored-content\.js["']\s*>\s*<\/script>\s*/g,"");
 }
 function files(doc,source=template){
  const result=[{path:"index.html",text:page(doc,source)},{path:"editor-backup.json",text:doc.portable()},{path:"shipping-data.txt",text:block(doc)+"\n"},{path:"portable/campaign-map.json",text:doc.portable("CAMPAIGN")}];
  for(const id of Object.keys(doc.data.battleMaps).sort())result.push({path:"portable/"+F.battlePath(id).split("/").pop().replace(/\.js$/,".json"),text:doc.portable("BATTLE_MAP",id)});
  result.push({path:"INSTALL.txt",text:["SHINING FARCE / HTML + JSON SHIPPING PACKAGE","1. Keep a backup of the project and close the game.","2. Extract to a temporary folder. Copy ONLY index.html over the project's index.html.","3. Reopen index.html in the complete, updated project folder. Distribute the entire project.","Keep assets/presentation/game-boy/ and the installed shell scripts with the complete game; these fixed PNG resources are not embedded in this authored-data package.","No downloaded .js files, script-list edits, security changes or commands are needed.","The map data lives in an application/json block in index.html. Existing game scripts stay in place.","editor-backup.json and portable/*.json are editor backups, not automatic runtime inputs.","To replace/add/remove maps: change the editor draft and publish a fresh index.html.","If Windows blocks HTML placement, leave the warning in place. Use the data-only option:","Open shipping-data.txt in Notepad and copy its entire text. In the existing project's index.html,", "replace the BEGIN AUTHORED MAP ASSETS through END AUTHORED MAP ASSETS block with that text.","This edits inert JSON data in your existing launcher; it does not remove origin metadata or execute imported data.","If that is also blocked, stop and report the policy/browser details. Do not weaken security.","Reopen the game. Browser saves and imported JSON do not automatically install project content."].join("\n")+"\n"});return result;
 }
 G.editor.ShippingPage={FORMAT,VERSION,ID,BEGIN,END,payload,decode,install,start,block,page,files};
}(window.GBTRPG));
