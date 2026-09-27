(function(G){
 "use strict";
 const V=G.campaign.Validation,F=G.editor.AuthoredFiles;
 class AuthoredRegistry {
  constructor(){this.campaign=null;this.maps={};this.errors=[];this.campaignScriptLoaded=false;}
  useDemo(){this.campaignScriptLoaded=true;}
  register(fn){try{fn();}catch(error){this.errors.push(error.message);throw error;}}
  registerCampaign(asset){this.register(()=>{V.assert(!this.campaign,"duplicate shipping Campaign Map");F.validateCampaignAsset(asset);this.campaign=V.freeze(V.clone(asset));this.campaignScriptLoaded=true;});}
  registerBattle(map){this.register(()=>{F.mapDraft(map);V.assert(!Object.hasOwn(this.maps,map.id),"duplicate shipping Battle Map ID: "+map.id);this.maps[map.id]=V.freeze(V.clone(map));});}
  assemble(base,legacy=null,requireCampaignScript=false){
   V.assert(!this.errors.length,"AUTHORED MAP REGISTRATION FAILED: "+this.errors.join("; "));
   V.assert(legacy===null||(typeof legacy==="object"&&!Array.isArray(legacy)),"legacy authored content must be a document or null");
   V.assert(!requireCampaignScript||legacy||this.campaignScriptLoaded,"shipping Campaign Map script missing or did not register");
   const split=!!this.campaign||Object.keys(this.maps).length>0;
   V.assert(!(legacy&&split),"Both legacy and split shipping content installed. Export/install the shipping package or disable one source.");
   if(!legacy&&!split)return null;
   let data=legacy;
   if(split){V.assert(this.campaign,"shipping Campaign Map script missing");F.matchMapIds(this.maps,this.campaign.battleMapIds);data={...V.clone(this.campaign.document),battleMaps:V.clone(this.maps)};}
   const doc=new G.editor.EditorDocument(base,data);F.ready(doc,{presentation:false});return doc.data;
  }
 }
 G.editor.AuthoredRegistry=AuthoredRegistry;
 G.data.AUTHORED_MAPS=new AuthoredRegistry();
}(window.GBTRPG));
