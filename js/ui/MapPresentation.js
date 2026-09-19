(function (G) {
  "use strict";
  const compare = (a, b) => a.selectionPriority - b.selectionPriority || (a.objectId < b.objectId ? -1 : a.objectId > b.objectId ? 1 : 0);
  // Development visibility is explicit. Later intel can supply visible/reported/hidden.
  const developmentVisibility = () => ({ visibility: "visible" });
  function derive(campaign, visibility = developmentVisibility) {
    const s = campaign.state, d = campaign.definitions, objects = [];
    for (const id of Object.keys(d.locations).sort()) {
      const l = d.locations[id];
      const appearance=G.editor?.LocationModel.appearances[l.appearanceId];
      objects.push({ objectType: "location", objectId: id, key: "location:" + id, locationId: id, name: l.name,
        worldX: l.mapPosition.x, worldY: l.mapPosition.y, width: l.locationType === "CAPITAL" ? 32 : 16, height: l.locationType === "CAPITAL" ? 32 : 16, spriteId: l.locationType === "CAPITAL" ? "capitalMarker" : "locationMarkers",
        spriteFrame: { CAPITAL: 0, VILLAGE: 0, CROSSROADS: 1, PORT: 0, FORTRESS: 2, SHRINE: 3 }[l.locationType] ?? 2,
        ...(appearance?{spriteId:appearance.spriteId,spriteFrame:appearance.frame,width:appearance.size,height:appearance.size}:{}),
        controller: s.locations[id].controller, visible: true, selectable: true, selectionPriority: 100, drawSprite: true });
    }
    for (const id of Object.keys(s.squads).sort()) {
      const q = s.squads[id], knowledge = q.faction === "PLAYER" ? { visibility: "visible" } : visibility(q, s);
      if (!knowledge || knowledge.visibility === "hidden") continue;
      const reported = knowledge.visibility === "reported";
      const locationId = reported ? knowledge.locationId : q.currentLocationId;
      if (!d.locations[locationId]) continue; // Approximate reports require their own reported position.
      const pos = d.locations[locationId].mapPosition, mc = q.unitIds.includes("mc");
      const stationed = !reported && s.locations[locationId].stationedSquadIds[q.faction] === q.id;
      objects.push({ objectType: reported ? "report" : "squad", objectId: id, key: (reported ? "report:" : "squad:") + id,
        locationId, name: reported ? "ZEON REPORT" : q.name, faction: q.faction, hasMC: !reported && mc, stationed,
        worldX: pos.x + (d.locations[locationId].locationType === "CAPITAL" ? 48 : 32), worldY: pos.y, width: 16, height: 16,
        spriteId: reported ? "reportedSquad" : G.campaign.UnitManagementSystem.sprite(s,q), spriteFrame: 0,
        visible: true, selectable: true, selectionPriority: (stationed ? 0 : 20) + (mc ? 0 : q.faction === "PLAYER" ? 2 : 4), drawSprite: false });
    }
    for (const w of Object.values(s.shipments)) {
      const p=d.locations[w.currentLocationId].mapPosition;
      objects.push({objectType:"wagon",objectId:w.id,key:"wagon:"+w.id,locationId:w.currentLocationId,name:"SUPPLY WAGON",worldX:p.x,worldY:p.y+48,width:16,height:16,spriteId:"supplyWagon",spriteFrame:0,visible:true,selectable:true,selectionPriority:50,drawSprite:false});
    }
    for (const u of Object.values(s.units).filter(u=>u.faction==="PLAYER"&&u.status==="ACTIVE"&&!G.campaign.UnitManagementSystem.squadFor(s,u.id))) {
      const p=d.locations[u.unassignedLocationId].mapPosition;
      objects.push({objectType:"unit",objectId:u.id,key:"unit:"+u.id,locationId:u.unassignedLocationId,name:u.name,worldX:p.x+32,worldY:p.y+48,width:16,height:16,spriteId:G.data.UNIT_TYPES[u.typeId].strategicSpriteId,spriteFrame:0,visible:true,selectable:true,selectionPriority:60,drawSprite:false});
    }
    const groups = {};
    for (const o of objects.filter(o => o.objectType !== "location")) (groups[o.worldX + ":" + o.worldY] ||= []).push(o);
    for (const group of Object.values(groups)) {
      group.sort(compare); group.forEach(o => { o.stackCount = group.length - 1; }); group[0].drawSprite = true;
    }
    return objects.sort(compare);
  }
  function atCell(objects, x, y) {
    const tile = G.config.WORLD_TILE_SIZE;
    return objects.filter(o => o.visible && o.selectable && x < o.worldX + o.width && x + tile > o.worldX && y < o.worldY + o.height && y + tile > o.worldY).sort(compare);
  }
  function commands(campaign, object) {
    const s = campaign.state;
    if (object.objectType === "report") return [{ id: "reportInfo", label: "REPORT INFO" }];
    if (object.objectType === "wagon") return [{id:"wagonInfo",label:"DELIVERY INFO"}];
    if (object.objectType === "unit") return [{id:"unitManage",label:"UNIT / EQUIPMENT"}];
    if (object.objectType === "location") {
      const items=[{id:"locationInfo",label:"INFO"},{id:"squadsHere",label:"SQUADS HERE"}];
      if(s.phase==="PLANNING"&&s.locations[object.objectId].controller==="PLAYER") {
        if(G.campaign.EconomySystem.available(campaign.definitions,s,object.objectId).length)items.push({id:"shop",label:"SHOP"});
        if(s.recruitPools[object.objectId])items.push({id:"recruit",label:"RECRUIT"});
      }return items;
    }
    const q = s.squads[object.objectId]; if (!q) return [];
    const items = [{ id: "squadInfo", label: "STATUS" }];
    if (q.faction === "PLAYER" && s.phase === "PLANNING") {
      items.push({id:"manage",label:"MANAGE"});
      items.unshift({ id: "move", label: s.orders[q.id] ? "CHANGE ROUTE" : "MOVE" });
      if (s.orders[q.id]) items.push({ id: "route", label: "ROUTE" }, { id: "cancelRoute", label: "CANCEL ROUTE" });
      if (s.locations[q.currentLocationId].stationedSquadIds.PLAYER !== q.id) items.push({ id: "station", label: "STATION" });
    }
    return items;
  }
  function menuBounds(anchor, title, items) {
    const width = Math.min(256, Math.max(112, Math.ceil((Math.max(title.length, ...items.map(i => i.label.length)) * 6 + 24) / 8) * 8));
    const height = Math.ceil((40 + items.length * 12) / 8) * 8;
    let x = anchor.x + 12; if (x + width > G.config.INTERNAL_WIDTH - 4) x = anchor.x - width - 4;
    return { x: Math.max(4, Math.min(x, G.config.INTERNAL_WIDTH - width - 4)),
      y: Math.max(4, Math.min(anchor.y, G.config.INTERNAL_HEIGHT - height - 4)), width, height };
  }
  G.ui.MapPresentation = { derive, atCell, commands, menuBounds, developmentVisibility };
}(window.GBTRPG));
