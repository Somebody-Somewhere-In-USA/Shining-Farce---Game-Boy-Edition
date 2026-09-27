(function(G){
 "use strict";
 // Session-only evidence from local Image loads; never persisted as authored content.
 class SceneAssetAvailability {
  constructor(){this.records=new Map();this.serial=0;}
  key(e){return JSON.stringify([e.id,e.path,e.hash,e.width,e.height]);}
  status(e){return this.records.get(this.key(e))?.status||'UNVERIFIED';}
  async probe(entries,{createImage=()=>new Image(),timeoutMs=15000}={}){
   const unique=[...new Map(entries.map(e=>[this.key(e),e])).values()];let next=0;
   const batch=Date.now()+'-'+(++this.serial);
   const load=async e=>{
    const key=this.key(e),record={status:'PENDING'};this.records.set(key,record);
    // A fresh-query success alone proves nothing about the URL preview uses.
    // Require BOTH actual runtime URL and supplemental fresh-token loads.
    const options={createImage,timeoutMs},runtime=await G.rendering.SceneAssetLoader.load(e,options);
    const fresh=runtime.error?null:await G.rendering.SceneAssetLoader.load(e,{...options,refresh:batch});
    const error=runtime.error||fresh?.error;
    if(this.records.get(key)!==record)return;
    record.status=error?'FAILED':'AVAILABLE';record.error=error||null;record.url=runtime.url;
    const failures=G.editor.BattleSceneAssets.loadFailures;if(error)failures.set(e.id,error);else failures.delete(e.id);
   };
   await Promise.all(Array.from({length:Math.min(8,unique.length)},async()=>{while(next<unique.length)await load(unique[next++]);}));
  }
 }
 G.editor.SceneAssetAvailability=SceneAssetAvailability;
 G.editor.sceneAssetAvailability=new SceneAssetAvailability();
}(window.GBTRPG));
