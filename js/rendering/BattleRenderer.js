(function(G){
 "use strict";
 class BattleRenderer {
  constructor({renderer,assets,text,width=12,height=10}={}){Object.assign(this,{renderer,assets,text,width,height});}
  draw(state,cursor=null,interaction=null,elapsed=0,targeting=null,illegalTiles=[]){if(!this.renderer)return;this.renderer.clear();const ctx=this.renderer.ctx,p=G.config.PALETTE,ox=8,oy=24,tile=16;
   this.text.draw(ctx,"DEBUG SPELL LAB",8,6,50);
   for(let y=0;y<this.height;y++)for(let x=0;x<this.width;x++){ctx.drawImage(this.assets.getImage(illegalTiles.some(p=>p.x===x&&p.y===y)?"tileWall":"tileGrass"),0,0,16,16,ox+x*tile,oy+y*tile,16,16);}
   if(targeting){for(const tile of targeting.rangeTiles){ctx.strokeStyle=p.dark;ctx.strokeRect(ox+tile.x*16+1.5,oy+tile.y*16+1.5,13,13);}for(const tile of targeting.effectTiles.filter(p=>p.x>=0&&p.y>=0&&p.x<this.width&&p.y<this.height)){ctx.strokeStyle=p.background;ctx.strokeRect(ox+tile.x*16+2.5,oy+tile.y*16+2.5,11,11);}}
   for(const pair of Object.values(state.portals)){const selected=G.systems.PortalSystem.highlighted(state,pair,cursor,interaction),flash=selected&&Math.floor(elapsed/G.config.SPELLS.portalFlashMs)%2===1;
    for(const e of pair.endpoints){const x=ox+e.x*tile,y=oy+e.y*tile;ctx.drawImage(this.assets.getImage(pair.faction==="PLAYER"?"portalFriendly":"portalEnemy"),x,y);if(flash){ctx.strokeStyle=p.background;ctx.strokeRect(x+0.5,y+0.5,15,15);}}
   }
   for(const u of Object.values(state.units)){const pos=state.positions[u.id];if(!pos)continue;const x=ox+pos.x*tile,y=oy+pos.y*tile;ctx.drawImage(this.assets.getImage(G.data.UNIT_TYPES[u.typeId]?.strategicSpriteId||"unitMage"),x,y);
    if(u.tactical.life==="DYING"){ctx.fillStyle=p.background;ctx.fillRect(x+9,y+7,7,9);this.text.draw(ctx,String(u.tactical.dyingCounter),x+10,y+8,1);}else if(u.faction==="ZEON"){ctx.fillStyle=p.darkest;ctx.fillRect(x+3,y+15,10,1);}
   }
   if(cursor){ctx.strokeStyle=p.darkest;ctx.strokeRect(ox+cursor.x*tile+0.5,oy+cursor.y*tile+0.5,15,15);}
   const u=state.units[state.controlledUnitId]||Object.values(state.units)[0];if(u){const t=u.tactical,turn=state.turns[u.id],lines=[u.name,u.faction,t.life,"HP "+t.hp+"/"+t.maxHp,"MP "+t.mp+"/"+t.maxMp,"MOV "+turn.remainingMov,"MAJOR "+(!G.systems.BattleStatusSystem.active(u)?"BLOCKED":turn.majorUsed?"USED":"READY"),"DYING "+(t.dyingCounter??"-"),...(t.escapeRequired?["ESCAPE REQUIRED"]:[]),...t.statuses.map(s=>s.id+(s.remaining!==undefined?" "+s.remaining:""))];lines.forEach((line,n)=>this.text.draw(ctx,line,207,26+n*11,18));}
   this.text.draw(ctx,"ARROWS CURSOR  Z MENU  Q UNIT",8,192,50);this.text.draw(ctx,"TEST BALANCE ONLY / X EXIT",8,204,50);
   if(state.presentation.phase==="BANNER"){ctx.fillStyle=p.background;ctx.fillRect(48,86,220,32);this.text.draw(ctx,state.presentation.banner,122,98,20);}
  }
 }
 G.rendering.BattleRenderer=BattleRenderer;
}(window.GBTRPG));
