(function (G) {
  "use strict";
  class WorldMapRenderer {
    constructor(assets, text, ui) { this.assets = assets; this.text = text; this.ui = ui; }
    line(ctx, a, b, shade, pattern = null) {
      let x = a.x, y = a.y, step = 0;
      const dx = Math.abs(b.x-x), dy = -Math.abs(b.y-y), sx = x<b.x?1:-1, sy = y<b.y?1:-1;
      let error = dx+dy; ctx.fillStyle = shade;
      while (true) {
        if (!pattern || pattern === "CONFIRMED" || (pattern === "PROPOSED" ? step%4<2 : step%3===0)) ctx.fillRect(x,y,pattern === "CONFIRMED"?2:1,1);
        if (x===b.x && y===b.y) break;
        const e = 2*error; if(e>=dy){error+=dy;x+=sx;} if(e<=dx){error+=dx;y+=sy;} step++;
      }
    }
    draw(ctx, definitions, state, view) {
      const p = G.config.PALETTE, v = G.config.MAP_VIEW, terrain = view.terrain || G.data.WORLD_VISUALS, camera = view.camera;
      ctx.save(); ctx.beginPath(); ctx.rect(v.x,v.y,v.width,v.height); ctx.clip();
      const atlas = this.assets.getImage("worldTerrain");
      for (let y=Math.floor(camera.y/16); y<Math.min(terrain.height,Math.ceil((camera.y+v.height)/16)); y++) {
        for(let x=Math.floor(camera.x/16);x<Math.min(terrain.width,Math.ceil((camera.x+v.width)/16));x++) {
          const pos=camera.worldToScreen(x*16,y*16), frame=terrain.tiles[terrain.rows[y][x]];
          ctx.drawImage(atlas,frame*16,0,16,16,pos.x,pos.y,16,16);
        }
      }
      for (const route of Object.values(definitions.routes)) {
        const a=definitions.locations[route.locationAId].mapPosition,b=definitions.locations[route.locationBId].mapPosition;
        const chosen=view.path?.routeIds.includes(route.id), active=state.routes[route.id].available&&!state.routes[route.id].blocked;
        this.line(ctx,camera.worldToScreen(a.x+8,a.y+8),camera.worldToScreen(b.x+8,b.y+8),chosen?p.darkest:p.dark,chosen?view.routeKind:active?null:"CLOSED");
      }
      for (const object of view.objects) {
        const selectedInStack=view.selected && view.selected.objectType!=="location" && view.selected.worldX===object.worldX && view.selected.worldY===object.worldY;
        if (selectedInStack ? object.key!==view.selected.key : !object.drawSprite) continue;
        const pos=camera.worldToScreen(object.worldX,object.worldY);
        ctx.drawImage(this.assets.getImage(object.spriteId),(object.spriteFrame||0)*object.width,0,object.width,object.height,pos.x,pos.y,object.width,object.height);
        if(object.objectType==="location") {
          // Shape-coded physical control, separate from the location's building silhouette.
          ctx.fillStyle=p.lightest;ctx.fillRect(pos.x,pos.y+object.height+1,8,3);ctx.fillStyle=p.darkest;
          if(object.controller==="PLAYER") ctx.fillRect(pos.x,pos.y+object.height+1,8,1);
          else if(object.controller==="ZEON") {ctx.fillRect(pos.x,pos.y+object.height+1,3,3);ctx.fillRect(pos.x+5,pos.y+object.height+1,3,3);}
          else {ctx.fillRect(pos.x,pos.y+object.height+1,1,3);ctx.fillRect(pos.x+7,pos.y+object.height+1,1,3);}
          this.text.draw(ctx,object.name,pos.x-4,pos.y-10,26);
        } else {
          if(object.stationed) {ctx.fillStyle=p.darkest;ctx.fillRect(pos.x,pos.y+object.height+1,8,1);}
          if(object.stackCount) this.text.draw(ctx,"+"+object.stackCount,pos.x+17,pos.y,5);
        }
      }
      const cursor=camera.worldToScreen(view.cursor.x,view.cursor.y);
      ctx.drawImage(this.assets.getImage("mapCursor"),cursor.x,cursor.y);
      ctx.restore();
      this.ui.window(ctx,0,0,G.config.INTERNAL_WIDTH,16);
      this.text.draw(ctx,view.routeKind ? view.routeKind+" / "+view.selectedSquad.name : "SHINING FARCE / THE BORDERLANDS",6,4,43);
      this.text.draw(ctx,"D"+String(state.day).padStart(3,"0"),G.config.INTERNAL_WIDTH-38,4,5);
      this.ui.window(ctx,0,G.config.INTERNAL_HEIGHT-32,G.config.INTERNAL_WIDTH,32);
      const o=view.selected;
      this.text.draw(ctx,o ? o.name+(o.stationed?" / STATIONED":"")+(o.hasMC?" / MC":"") : "OPEN TERRAIN",7,G.config.INTERNAL_HEIGHT-27,50);
      this.text.draw(ctx,view.routeKind==="PROPOSED" ? "SELECT A LOCATION: Z REVIEW  X CANCEL" : "Z SELECT  Q CYCLE  M MENU  ARROWS MOVE",7,G.config.INTERNAL_HEIGHT-15,50);
    }
  }
  G.rendering.WorldMapRenderer=WorldMapRenderer;
}(window.GBTRPG));
