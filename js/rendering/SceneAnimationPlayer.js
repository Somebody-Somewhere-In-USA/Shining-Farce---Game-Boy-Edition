(function(G){
 "use strict";
 // Pure per-frame clock. No combat, choreography, global clocks or campaign mutation.
 class SceneAnimationPlayer {
  constructor(animation){this.play(animation);}
  play(animation){this.animation=animation;this.time=0;this.finished=false;this.index=0;}
  update(ms){if(!Number.isFinite(ms)||ms<0)return;this.time+=ms;this.sample();}
  sample(){const a=this.animation;if(!a?.frames?.length){this.index=-1;return null;}const total=a.frames.reduce((n,f)=>n+f.ms,0);if(!(total>0)){this.index=-1;return null;}
   let t=this.time;if(a.loop)t%=total;else if(t>=total){this.finished=true;this.index=a.final==='HIDE'?-1:a.final==='FIRST'?0:a.frames.length-1;return a.frames[this.index]||null;}
   this.index=0;while(this.index<a.frames.length-1&&t>=a.frames[this.index].ms)t-=a.frames[this.index++].ms;return a.frames[this.index];
  }
 }
 // Separate, lazy image cache: missing production artwork cannot abort core startup.
 class SceneAssetImages {
  constructor(){this.images=new Map();this.errors=G.editor.BattleSceneAssets.loadFailures;this.pending=new Set();}
  get(entry){if(!entry?.valid)return null;if(this.images.has(entry.id))return this.images.get(entry.id);if(this.pending.has(entry.id)||this.errors.has(entry.id))return null;
   this.pending.add(entry.id);G.rendering.SceneAssetLoader.load(entry).then(({image,error})=>{this.pending.delete(entry.id);if(error)this.errors.set(entry.id,error);else this.images.set(entry.id,image);});return null;
  }
 }
 G.rendering.SceneAnimationPlayer=SceneAnimationPlayer;G.rendering.SceneAssetImages=SceneAssetImages;
}(window.GBTRPG));
