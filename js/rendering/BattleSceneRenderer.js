(function(G){
 "use strict";
 class BattleSceneRenderer {
  constructor(deps){Object.assign(this,deps);}
  draw(scene){const c=this.renderer.ctx,p=G.config.PALETTE,f=scene.current()||scene.frames.at(-1);this.renderer.clear();if(!f)return;
   if(f.type==="BLACK"){c.fillStyle=p.darkest;c.fillRect(0,0,480,360);return;}
   const progress=Math.min(1,scene.elapsed/Math.max(1,f.duration)),world=scene.world,focus=f.focusId,comp=f.composition||G.systems.BattleSceneComposition(world,(f.type==="REACTION"||f.type==="WHIP_PAN"||f.message)?focus:scene.actorId,(f.type==="REACTION"||f.type==="WHIP_PAN"||f.message)?focus:scene.targetIds[0]||scene.actorId),ids=comp.adjacent?comp.sprites:[focus];
   // One continuous backdrop with integer camera translation; no crossfade or second window.
   const anchors={};Object.values(world.units).forEach((u,n)=>anchors[u.id]=(u.faction==="PLAYER"?0:480)+n*640);
   const previous=scene.frames[Math.max(0,scene.index-1)]?.focusId||scene.actorId,start=anchors[previous]||0,end=anchors[focus]||0,camera=f.type==="WHIP_PAN"?Math.round(start+(end-start)*progress):end;
   c.fillStyle=p.lightest;c.fillRect(0,0,480,226);c.fillStyle=p.light;c.fillRect(0,226,480,134);c.fillStyle=p.dark;for(let x=-((camera%96)+96)%96;x<480;x+=96)c.fillRect(x,223,48,3);
   const left=id=>(id===comp.actorId?comp.actorSide:id===comp.targetId?comp.targetSide:world.units[id]?.faction==="PLAYER"?"LEFT":"RIGHT")==="LEFT";
   const drawUnit=(id,x)=>{const u=world.units[id];if(!u)return;const slide=f.type==="ENTRANCE"?Math.round((1-progress)*140)*(left(id)?-1:1):0,bump=f.type==="ACTION"&&id===focus?(progress<.5?12:0)*(left(id)?1:-1):0;c.drawImage(this.assets.getImage(G.data.UNIT_TYPES[u.typeId]?.strategicSpriteId||"unitMage"),x+slide+bump,164,64,64);this.text.draw(c,u.name,x-16,242,24);};
   if(comp.adjacent){drawUnit(comp.actorId,comp.actorSide==="LEFT"?92:324);drawUnit(comp.targetId,comp.targetSide==="LEFT"?92:324);}else if(f.type==="WHIP_PAN"){for(const id of new Set([previous,focus]))drawUnit(id,Math.round((anchors[id]||0)-camera)+(left(id)?104:312));}else drawUnit(ids[0],left(ids[0])?104:312);
   if(f.type==="EFFECT"){const x=left(focus)?136:344;c.fillStyle=p.background;for(let n=0;n<5;n++)c.fillRect(x-24+n*12,158+((n%2)*20),5,38);}
   const result=f.result,message=f.message||(f.type==="RESULT"?(result?.after?"HP "+result.after.hp+" / "+(result.after.life||"ALIVE"):"ACTION RESOLVED"):f.type==="ACTION"?"ACTION":f.type==="REACTION"?"REACTION":"");if(message)this.text.draw(c,message,24,292,70);
   // Ordered opaque pixels preserve the strict four-shade palette during fades.
   if(f.type==="ENTRANCE"||f.type==="EXIT"){const coverage=f.type==="EXIT"?progress:1-progress;c.fillStyle=p.darkest;for(let y=0;y<360;y++)for(let x=0;x<480;x++)if(((x%4)+(y%4)*4)/16<coverage)c.fillRect(x,y,1,1);}
  }
 }
 G.rendering.BattleSceneRenderer=BattleSceneRenderer;
}(window.GBTRPG));
