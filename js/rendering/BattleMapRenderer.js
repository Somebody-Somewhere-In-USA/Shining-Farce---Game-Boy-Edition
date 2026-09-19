(function(G){
 "use strict";
 class BattleMapRenderer {
  constructor(deps){Object.assign(this,deps);this.view={x:0,y:40,width:352,height:288};this.camera={x:0,y:0};}
  follow(map,p){this.camera.x=Math.max(0,Math.min(map.width*16-this.view.width,p.x*16-176));this.camera.y=Math.max(0,Math.min(map.height*16-this.view.height,p.y*16-144));}
  draw(battle,map,cursor,forecast,offset=0,targeting=null){this.renderer.clear();const c=this.renderer.ctx,p=G.config.PALETTE,v=this.view;this.follow(map,cursor);
   const entries=forecast.slice(offset,offset+19);entries.forEach((e,n)=>{const u=battle.units[e.unitId],x=4+n*25;c.drawImage(this.assets.getImage(G.data.UNIT_TYPES[u.typeId]?.strategicSpriteId||"unitMage"),x,3);this.text.draw(c,String(offset+n+1),x,22,3);if(n===0&&offset===0){c.fillStyle=p.darkest;c.fillRect(x,34,17,2);}});
   c.save();c.beginPath();c.rect(v.x,v.y,v.width,v.height);c.clip();
   for(let y=Math.floor(this.camera.y/16);y<Math.min(map.height,Math.ceil((this.camera.y+v.height)/16));y++)for(let x=Math.floor(this.camera.x/16);x<Math.min(map.width,Math.ceil((this.camera.x+v.width)/16));x++){const d=G.systems.BattleTerrainSystem.definition(map,x,y),px=x*16-this.camera.x,py=y*16-this.camera.y+v.y;c.drawImage(this.assets.getImage(d.spriteId),px,py);if(d.id==="road"||d.id==="stone"){c.fillStyle=p.lightest;c.fillRect(px+2,py+2,12,12);}if(d.id==="river"){c.fillStyle=p.dark;c.fillRect(px,py+6,16,3);}}
   const at=q=>({x:q.x*16-this.camera.x,y:q.y*16-this.camera.y+v.y});
   if(targeting){for(const [tiles,color,inset]of [[targeting.range,p.dark,1],[targeting.area,p.background,3]])for(const tile of tiles){const q=at(tile);c.strokeStyle=color;c.strokeRect(q.x+inset+.5,q.y+inset+.5,15-inset*2,15-inset*2);}}
   for(const pair of Object.values(battle.portals))for(const end of pair.endpoints){const q=at(end);c.drawImage(this.assets.getImage(pair.faction==="PLAYER"?"portalFriendly":"portalEnemy"),q.x,q.y);}
   for(const u of Object.values(battle.units)){const pos=battle.positions[u.id];if(!pos)continue;const q=at(pos);c.drawImage(this.assets.getImage(G.data.UNIT_TYPES[u.typeId]?.strategicSpriteId||"unitMage"),q.x,q.y);if(u.tactical.life==="DYING"){c.fillStyle=p.background;c.fillRect(q.x+9,q.y+7,7,9);this.text.draw(c,String(u.tactical.dyingCounter),q.x+10,q.y+8,1);}else if(u.faction==="WILDERNESS"){this.text.draw(c,"W",q.x+9,q.y+8,1);}else if(u.faction==="ZEON"){c.fillStyle=p.darkest;c.fillRect(q.x+2,q.y+15,12,1);}}
   const q=at(cursor);c.strokeStyle=p.darkest;c.strokeRect(q.x+.5,q.y+.5,15,15);c.restore();
   c.fillStyle=p.dark;c.fillRect(352,40,1,288);const id=battle.controlledUnitId,u=battle.units[id];if(u){const t=battle.turns[id],lines=[u.name,u.faction,"HP "+u.tactical.hp+"/"+u.tactical.maxHp,"MP "+u.tactical.mp+"/"+u.tactical.maxMp,"CT "+battle.timeline.ct[id],"MOV "+t.remainingMov+"/"+t.effectiveMov,"MAJOR "+t.majorSpent+"/"+t.majorBudget,"",...u.tactical.statuses.map(s=>s.id),u.tactical.life];lines.forEach((line,n)=>this.text.draw(c,line,360,48+n*12,19));}
   this.text.draw(c,"TILE "+cursor.x+","+cursor.y,360,268,19);this.text.draw(c,G.systems.BattleTerrainSystem.definition(map,cursor.x,cursor.y).id.toUpperCase(),360,280,19);this.text.draw(c,"ARROWS CURSOR  Z ACTION  Q TIMELINE  X RETURN",6,336,77);this.text.draw(c,map.testOnly?"TEST BATTLE / FIXTURE BALANCE":"BATTLE MAP",6,348,77);
   if(battle.presentation.phase==="BANNER"){c.fillStyle=p.background;c.fillRect(150,150,180,38);this.text.draw(c,battle.presentation.banner,205,165,16);}
  }
 }
 G.rendering.BattleMapRenderer=BattleMapRenderer;
}(window.GBTRPG));
