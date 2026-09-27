(function (G) {
  "use strict";
  class CampaignMapState {
    constructor(dependencies) {
      Object.assign(this, dependencies);
      this.selectedId = "granseal"; this.mode = "map"; this.debugEnabled = false;
      this.selectedSquadId = "vanguard";
      this.stack = []; this.path = null; this.eventLog = [];
      this.resources = new G.ui.CampaignResourceUI(this);
      this.visibilityPolicy = G.ui.MapPresentation.developmentVisibility;
      const world = G.data.WORLD_VISUALS;
      this.camera = new G.rendering.WorldCamera(world.width * 16, world.height * 16);
      this.cursor = { x: 80, y: 144 }; this.overlapIndex = 0;
      this.focusLocation(this.selectedId, true);
      for (const name of Object.values(G.campaign.Events)) this.campaign.events.on(name, event => {
        if(event.type==="AWOL_RETURNED"||event.type==="AWOL_RETURN_UNRESOLVED")(this.returnMessages||=[]).push(event.message);this.eventLog.push(event); if (this.eventLog.length > 24) this.eventLog.shift();
      });
    }
    pushView() { this.stack.push({ mode: this.mode, list: this.list, title: this.title, lines: this.lines, page: this.page, popupBounds: this.popupBounds }); }
    back() { Object.assign(this, this.stack.pop() || { mode: "map" }); }
    showList(title, items) { this.pushView(); this.mode = "list"; this.title = title; this.list = new G.ui.SelectableList(items); }
    showPage(title, lines) { this.pushView(); this.mode = "page"; this.title = title; this.lines = lines.flatMap(line => this.text.wrap(line, G.config.UI.pageColumns)); this.page = 0; }
    objects() { return G.ui.MapPresentation.derive(this.campaign, this.visibilityPolicy); }
    displayPaletteSelectAllowed(){return this.mode==="map"&&!this.returnMessages?.length&&G.ui.MapPresentation.atCell(this.objects(),this.cursor.x,this.cursor.y).length<=1;}
    selectedObject() {
      const hits = G.ui.MapPresentation.atCell(this.objects(), this.cursor.x, this.cursor.y);
      return hits[this.overlapIndex % Math.max(1, hits.length)] || null;
    }
    focusLocation(id, squad = false) {
      const p = this.campaign.definitions.locations[id].mapPosition;
      this.selectedId = id; this.cursor = { x: p.x + (squad ? (this.campaign.definitions.locations[id].locationType === "CAPITAL" ? 48 : 32) : 0), y: p.y }; this.overlapIndex = 0;
      this.camera.set(this.cursor.x - G.config.MAP_VIEW.width / 2 + 8, this.cursor.y - G.config.MAP_VIEW.height / 2 + 8);
    }
    showPopup(title, items, object = this.selectedObject()) {
      const anchor = this.camera.worldToScreen(object?.worldX ?? this.cursor.x, object?.worldY ?? this.cursor.y);
      this.pushView(); this.mode = "context"; this.title = title;
      this.list = new G.ui.SelectableList(items, items.length);
      this.popupBounds = G.ui.MapPresentation.menuBounds(anchor, title, items);
    }
    contextMenu(object) {
      if (!object) return;
      this.cursor = { x: object.worldX, y: object.worldY };
      this.camera.follow(this.cursor.x, this.cursor.y);
      this.overlapIndex = Math.max(0, G.ui.MapPresentation.atCell(this.objects(), this.cursor.x, this.cursor.y).findIndex(o => o.key === object.key));
      this.selectedId = object.locationId;
      if (object.objectType === "squad") this.selectedSquadId = object.objectId;
      const items = G.ui.MapPresentation.commands(this.campaign, object).map(command => ({
        label: command.label, run: () => this.runCommand(command.id, object)
      }));
      this.showPopup(object.name, items, object);
    }
    runCommand(command, object) {
      const c = this.campaign, id = object.objectId;
      if (command === "manage") this.resources.manage(id);
      if (command === "shop") this.resources.shop(id);
      if (command === "recruit") this.resources.recruitment(id);
      if (command === "unitManage") this.resources.unit(id);
      if (command === "wagonInfo") this.resources.wagon(id);
      if (command === "squadInfo") this.showSquad(id);
      if (command === "reportInfo") this.showPage("ZEON REPORT", ["REPORTED NEAR " + c.definitions.locations[object.locationId].name, "POSITION IS APPROXIMATE."]);
      if (command === "locationInfo") this.inspect(id);
      if (command === "squadsHere") this.showList("SQUADS HERE", this.objects().filter(o => ["squad","report"].includes(o.objectType) && o.locationId === id).map(o => ({ label: o.name + (o.stationed ? " / STATIONED" : ""), run: () => { this.focusLocation(o.locationId, true); this.contextMenu(o); } })));
      if (command === "move") {
        this.selectedSquadId = id; this.focusLocation(c.state.squads[id].currentLocationId);
        this.stack = []; this.mode = "routePreview"; this.path = null;
      }
      if (command === "route") { this.focusLocation(c.state.orders[id].destinationLocationId); this.mode = "map"; this.stack = []; this.path = null; }
      if (command === "cancelRoute") { c.cancelMovement(id); this.path = null; this.mode = "map"; this.stack = []; }
      if (command === "station") { c.stationSquad(object.locationId, id); this.mode = "map"; this.stack = []; this.overlapIndex = 0; }
    }
    inspect(id) {
      const c = this.campaign, d = c.definitions, s = c.state, l = d.locations[id], p = d.polities[l.polityId];
      const visible = this.objects().filter(o => o.objectType === "squad" && o.locationId === id);
      const squads = visible.map(o => s.squads[o.objectId]), defenders = s.locations[id].stationedSquadIds;
      this.showPage(l.name, [l.locationType, "CONTROL: " + s.locations[id].controller,
        "POLITY: " + p.name, ...(l.settlement?["SETTLEMENT ALLEGIANCE: "+(G.editor.LocationModel.effective(l).allegiance||"NONE")]:["SUPPORT: " + s.polities[p.id].allegiance]),
        ...Object.entries(defenders).map(([faction, squadId]) => faction + " DEF: " + (visible.some(o => o.objectId === squadId) ? s.squads[squadId].name : faction === "ZEON" ? "NO VISIBLE DEFENDER" : "NONE")),
        "SQUADS HERE: " + squads.length, ...squads.map(q => q.name + " " + q.unitIds.length + "/12"),
        "ROUTES:", ...c.neighbors(id).map(n => d.locations[n.locationId].name + " " + (n.route.travelDays ?? 1) + "D")]);
    }
    showSquad(id) {
      const c = this.campaign, q = c.state.squads[id];
      this.showPage(q.name, [q.faction, "AT " + c.definitions.locations[q.currentLocationId].name,
        "MEMBERS: " + q.unitIds.length + "/12", ...q.unitIds.map(unit => c.state.units[unit].name),
        "JEWEL OF LIGHT: " + (q.artifacts.jewelOfLight ? "YES" : "NO"),
        "JEWEL OF EVIL: " + (q.artifacts.jewelOfEvil ? "YES" : "NO"), "CREATED DAY " + q.createdDay,
        "ARRIVAL ORDER " + q.arrivalOrder, "MISSION: NONE"]);
    }
    menu() {
      const c = this.campaign;
      this.showList("CAMPAIGN", [
        {label:"ECONOMY",run:()=>this.resources.economy()},
        {label:"INVENTORY",run:()=>this.resources.inventory()},
        {label:"UNITS",run:()=>this.resources.units()},
        {label:"SHIPMENTS",run:()=>this.resources.shipments()},
        { label: "SQUAD ORDERS", run: () => this.showList("SELECT PLAYER SQUAD", Object.values(c.state.squads).filter(q => q.faction === "PLAYER").map(q => ({ label: q.name, run: () => this.squadOrders(q.id) }))) },
        { label: "LOCATIONS", run: () => this.showList("LOCATIONS", Object.values(c.definitions.locations).map(l => ({ label: l.name, run: () => { this.focusLocation(l.id); this.stack = []; this.mode = "map"; } }))) },
        { label: "SQUADS", run: () => this.showList("SQUADS", this.objects().filter(o => ["squad","report"].includes(o.objectType)).map(o => ({ label: o.name, run: () => this.contextMenu(o) }))) },
        { label: "POLITIES", run: () => this.showList("POLITIES", Object.values(c.definitions.polities).map(p => ({ label: p.name, run: () => this.showPage(p.name,
          [p.category, "SUPPORT: " + c.state.polities[p.id].allegiance, "SEAT:", c.definitions.locations[p.capitalLocationId || p.petitionLocationId]?.name || "NONE",
            "LOCATIONS / CONTROL:", ...p.locationIds.flatMap(id => [c.definitions.locations[id].name, c.state.locations[id].controller])]) }))) },
        { label: "ROUTES HERE", run: () => this.showList("ROUTES HERE", Object.values(c.definitions.routes)
          .filter(r => [r.locationAId, r.locationBId].includes(this.selectedId)).map(r => ({ label: r.id.toUpperCase(), run: () => this.showPage("ROUTE / " + r.routeType,
            ["ID: " + r.id, c.definitions.locations[r.locationAId].name, "TO " + c.definitions.locations[r.locationBId].name,
              "TERRAIN: " + r.primaryTerrain, "TRAVEL: " + (r.travelDays ?? 1) + " DAY", "BLOCKED: " + (c.state.routes[r.id].blocked ? "YES" : "NO"),
              "AVAILABLE: " + (c.state.routes[r.id].available ? "YES" : "NO")]) }))) },
        { label: "QUEUED ORDERS", run: () => this.showPage("QUEUED ORDERS", this.orderLines(c.state.orders)) },
        { label: "END DAY", run: () => { c.startEndDay(); this.path = null; this.stack = []; this.mode = "map"; this.openEndDay(); } },
        { label: "HELP / LEGEND", run: () => this.help() },
        ...(!this.managedDeveloperLayer?[{ label: "DEBUG " + (this.debugEnabled ? "ON" : "OFF"), run: () => { this.debugEnabled = !this.debugEnabled; this.stack = []; this.mode = "map"; this.menu(); } }]:[]),
        ...(!this.managedDeveloperLayer&&this.debugEnabled ? [{ label: "DEBUG TOOLS", run: () => this.debugMenu() }] : []),
        ...(!this.managedDeveloperLayer?[{ label: "TACTICAL TEST", run: () => this.openTactical() }]:[]),
        ...(this.openOptions?[{label:"OPTIONS / CONTROLS",run:()=>this.openOptions()}]:[])
      ]);
    }
    orderLines(orders) {
      const c = this.campaign;
      return Object.keys(orders).length ? Object.values(orders).flatMap(order => [c.state.squads[order.squadId]?.name || order.squadId,
        "TO " + c.definitions.locations[order.destinationLocationId].name, order.plannedRouteIds.length + " EDGES REMAIN"]) : ["NO QUEUED ORDERS"];
    }
    squadOrders(id) {
      const object = this.objects().find(o => o.objectType === "squad" && o.objectId === id);
      if (object) { this.focusLocation(object.locationId, true); this.contextMenu(object); }
    }
    confirmRoute() {
      if (!this.path?.routeIds.length) { this.showPage("NO ROUTE", ["SELECT A DIFFERENT", "REACHABLE LOCATION."]); return; }
      const id = this.selectedSquadId, destinationId = this.selectedId, path = this.path;
      this.showPopup("TO " + this.campaign.definitions.locations[destinationId].name + "?", [
        { label: "YES " + path.routeIds.length + " DAYS / " + path.routeIds.length + " EDGES", run: () => {
          this.campaign.queueMovement(id, destinationId, path); this.path = null; this.mode = "map"; this.stack = [];
        } },
        { label: "NO / CHANGE", run: () => this.back() }
      ]);
    }
    help() {
      this.showPage("FIELD GUIDE", ["ARROWS / WASD: MOVE CURSOR ONE TILE", "Z / ENTER: SELECT OBJECT / CONFIRM", "Q: CYCLE SQUADS IN THE SAME CELL", "X / ESC: BACK / CANCEL PREVIEW", "M / TAB OR P: CAMPAIGN MENU", "SELECT A SQUAD: MOVE, THEN PICK A LOCATION.", "Z REVIEWS ROUTE; CONFIRM TO QUEUE.", "END DAY MOVES ONE GRAPH EDGE.", "DASHED ROUTE: PREVIEW; THICK: CONFIRMED", "ROSTER SLOT 1 DETERMINES SQUAD SPRITE", "MANAGE: REORDER / EQUIP / TRANSFER", "M: ECONOMY / INVENTORY / UNITS", "WAGONS DELIVER ONE EDGE PER DAY", "UNDERLINED SQUAD: STATIONED; +N: RESERVES", "CONTROL BAR: HOLLOW NEUTRAL, LINE PLAYER,", "TWO BLOCKS ZEON. SUPPORT IS SEPARATE.", "NEUTRAL LAND STAYS NEUTRAL ON PLAYER ARRIVAL.", "BATTLE RESULTS ARE TEMPORARY TEST CHOICES.", "M DURING END DAY: INSPECT LOCKED STATE"]);
    }
    debugMenu() {
      const c = this.campaign;
      this.showList("DEBUG TOOLS", [
        {label:"RESOURCE INSPECTION",run:()=>this.resources.debug()},
        {label:"RACES / STAT PREVIEWS",run:()=>this.resources.racePreviews()},
        {label:"DEBUG CHARACTER LEVEL UP",run:()=>this.resources.debugLevelUp()},
        { label: "LOAD TEST SCENARIO", run: () => this.showList("RESETS DEMO STATE", G.campaign.DevelopmentScenarios.list.map(item => ({ label: item.name, run: () => {
          c.loadDevelopmentScenario(item.id); this.eventLog = []; this.path = null; this.selectedSquadId = "vanguard"; this.focusLocation(c.state.squads.vanguard.currentLocationId, true);
          this.stack = []; this.mode = "map"; this.showPage("SCENARIO LOADED", [item.description, "ORDERS ALREADY QUEUED.", "CHOOSE END DAY."]);
        } }))) },
        ...(this.openBattleFoundation?[{label:"BATTLE FOUNDATION TEST",run:()=>this.openBattleFoundation()}]:[]),
        ...(this.openSpellLab?[{label:"SPELL / PORTAL LAB",run:()=>this.openSpellLab()}]:[]),
        { label: "RUN RULE CHECKS", run: () => { const results = G.debug.runFoundationTests(); this.showPage("RULE CHECKS", [results.filter(r => r.pass).length + "/" + results.length + " PASSED", ...results.flatMap(r => [(r.pass ? "OK " : "FAIL ") + r.name, ...(r.error ? [r.error] : [])])]); } },
        { label: "RESOLUTION RECORD", run: () => this.showPage("RESOLUTION RECORD", G.ui.resolutionInspection(c)) },
        { label: "INSPECT STATE", run: () => {
          c.validate(); const id = this.selectedId, s = c.state;
          this.showPage("STATE / VALID", ["DAY: " + s.day, "PHASE: " + s.phase, "LOCATION: " + id, "CONTROL: " + s.locations[id].controller,
            "POLITY: " + c.definitions.locations[id].polityId, "DEFENDERS:", ...Object.entries(s.locations[id].stationedSquadIds).map(([faction, defender]) => faction + ": " + (defender || "NONE")),
            "PRESENT:", ...c.squadsAt(id).map(q => q.id), "ROUTE IDS:", ...c.neighbors(id).map(n => n.route.id)]);
        } },
        { label: "GALAM SUPPORTS MC", run: () => { c.supportPolity("galam"); this.showPage("GALAM JOINED", ["SUPPORT: PLAYER", "CAPITAL: " + c.state.locations.galam.controller, "PORT: " + c.state.locations.port.controller, "FORT: " + c.state.locations.fortress.controller]); } },
        { label: "STATION SQUAD HERE", run: () => this.showList("CHOOSE DEFENDER", c.squadsAt(this.selectedId).map(q => ({ label: q.name, run: () => { c.stationSquad(this.selectedId, q.id); this.showPage("DEFENDER SET", [q.name]); } }))) },
        { label: "RELOCATE TEST SQUAD", run: () => this.showList("CHOOSE PLAYER SQUAD", Object.values(c.state.squads).filter(q => q.faction === "PLAYER").map(q => ({ label: q.name, run: () => this.showList("ADJACENT DESTINATION", c.neighbors(q.currentLocationId).map(n => ({ label: c.definitions.locations[n.locationId].name, run: () => {
          c.relocateForInspection(q.id, n.locationId); this.path = null; this.showPage("TEST RELOCATION", [q.name, "AT " + c.definitions.locations[n.locationId].name, "DAY UNCHANGED", "NO TRAVEL RESOLVED"]);
        } }))) }))) },
        { label: "EVENT LOG", run: () => this.showPage("CAMPAIGN EVENTS", this.eventLog.length ? this.eventLog.slice().reverse().map(e => e.message||e.type) : ["NO EVENTS YET"]) }
      ]);
    }
    update() {
      if(this.returnMessages?.length){this.showPage("WILDERNESS",this.returnMessages.splice(0).flatMap(message=>this.text.wrap(message,48)));return;}
        const action = this.input.consumeAction(); if (!action) return;
      try {
        if (action === "cancel") {
          if (this.mode === "routePreview") { this.mode = "map"; this.path = null; this.stack = []; }
          else this.back();
          return;
        }
        if (action === "menu" || action === "start") {
          if (this.mode === "map") this.menu();
          else { this.mode = "map"; this.path = null; this.stack = []; }
          return;
        }
        if (this.mode === "list" || this.mode === "context") {
          if (action === "up" || action === "down") this.list.move(action === "up" ? -1 : 1);
          if (action === "confirm") this.list.selected?.run();
          return;
        }
        if (this.mode === "page") {
          const count = Math.max(1, Math.ceil(this.lines.length / G.config.UI.pageRows));
          if (["right", "down", "confirm"].includes(action)) this.page = (this.page + 1) % count;
          if (["left", "up"].includes(action)) this.page = (this.page - 1 + count) % count;
          return;
        }
        const delta = { left: [-16,0], right: [16,0], up: [0,-16], down: [0,16] }[action];
        if (delta) {
          this.cursor.x = Math.max(0, Math.min(this.camera.worldWidth - 16, this.cursor.x + delta[0]));
          this.cursor.y = Math.max(0, Math.min(this.camera.worldHeight - 16, this.cursor.y + delta[1]));
          this.overlapIndex = 0; this.camera.follow(this.cursor.x, this.cursor.y);
        }
        if (action === "select") this.overlapIndex++;
        const selected = this.selectedObject();
        if (selected) this.selectedId = selected.locationId;
        if (selected?.objectType === "squad" && this.mode === "map") this.selectedSquadId = selected.objectId;
        if (this.mode === "routePreview") {
          this.path = selected?.objectType === "location" ? this.campaign.findPath(this.campaign.state.squads[this.selectedSquadId].currentLocationId, selected.locationId) : null;
          if (action === "confirm" && selected?.objectType === "location") this.confirmRoute();
        } else if (action === "confirm") this.contextMenu(selected);
      } catch (error) { this.showPage("COMMAND REJECTED", [error.message]); }
    }
    render() {
      this.renderer.clear(); const ctx = this.renderer.ctx;
      if (!this.campaign.state.squads[this.selectedSquadId]) this.selectedSquadId = Object.values(this.campaign.state.squads).find(q => q.faction === "PLAYER")?.id ?? null;
      const order = this.campaign.state.orders[this.selectedSquadId];
      const planning = this.mode === "routePreview" || this.stack.some(v => v.mode === "routePreview");
      const shownPath = planning ? this.path : order ? { routeIds: order.plannedRouteIds, locationIds: order.plannedLocationIds } : null;
      if (this.mode === "list") this.ui.list(ctx, this.title, this.list);
      else if (this.mode === "page") this.ui.page(ctx, this.title, this.lines, this.page);
      else {
        this.worldRenderer.draw(ctx, this.campaign.definitions, this.campaign.state, {
          camera: this.camera, cursor: this.cursor, objects: this.objects(), selected: this.selectedObject(),
          path: shownPath, routeKind: planning ? "PROPOSED" : order ? "CONFIRMED" : null,
          selectedSquad: this.campaign.state.squads[this.selectedSquadId] || null
        });
        if (this.mode === "context") this.ui.popup(ctx, this.title, this.list, this.popupBounds);
      }
    }
  }
  G.states.CampaignMapState = CampaignMapState;
}(window.GBTRPG));
