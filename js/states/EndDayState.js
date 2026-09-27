(function (G) {
  "use strict";
  G.ui.resolutionInspection = function (campaign) {
    const s = campaign.state, r = s.resolution || s.lastResolution;
    const lines = ["DAY " + s.day, "PHASE " + s.phase, "QUEUED ORDERS:", ...Object.values(s.orders).map(o => o.squadId + " > " + o.destinationLocationId)];
    if (r) lines.push("RESOLUTION: " + r.id, "LOCKED ORDERS:", ...Object.values(r.frozenOrders).map(o => o.squadId + " > " + o.destinationLocationId),
      "INTENTS:", ...r.movementIntents.flatMap(i => [i.squadId, i.originLocationId + " > " + i.destinationLocationId]),
      "CONFLICTS:", ...r.conflicts.flatMap(c => [c.id + " " + c.status, c.type, c.locationId || c.routeId]),
      "PENDING BATTLE:", r.pendingBattleScenario?.scenarioId || "NONE", "COMMITTED: " + r.movementCommitted, "WORLD UPDATE: " + r.worldUpdated);
    lines.push("SQUAD POSITIONS:", ...Object.values(s.squads).map(q => q.id + " @ " + q.currentLocationId), "DEFENDERS:",
      ...Object.entries(s.locations).flatMap(([id, l]) => [id, "P " + (l.stationedSquadIds.PLAYER || "NONE"), "Z " + (l.stationedSquadIds.ZEON || "NONE")]));
    lines.push("PLAYER G: " + s.treasuries.PLAYER, "TRAVELER ORDERS:", ...Object.values(s.travelerOrders).map(o => o.travelerType + " " + o.travelerId + " > " + o.destinationLocationId));
    if (r?.travelerIntents) lines.push("FROZEN TRAVELER INTENTS:", ...r.travelerIntents.map(i => i.travelerId + " " + i.originLocationId + " > " + i.destinationLocationId),
      "TRAVELER OUTCOMES:", ...r.travelerOutcomes.map(o => o.travelerId + " " + o.outcome));
    return lines;
  };
  class EndDayState {
    constructor(dependencies) { Object.assign(this, dependencies); this.elapsed = 0; this.scenarioId = null; this.inspect = false; this.page = 0; this.error = null; }
    battleList(b) {
      const items = [
        ...(this.openBattle?[{label:"OPEN BATTLE MAP",openBattle:true}]:[]),
        ...(!this.managedDeveloperLayer?[{ label: "TEST PLAYER WIN", winner: "PLAYER", loser: "DEFEATED" },
        { label: "TEST ZEON WIN", winner: "ZEON", loser: "DEFEATED" }]:[])
      ];
      for (const p of b.participants) {
        const moving = p.squadId === b.attackingSquadId ? b.context.attackerMoving : b.context.defenderMoving;
        if (moving&&!this.managedDeveloperLayer) items.push({ label: p.faction + " RETREATS", winner: p.faction === "PLAYER" ? "ZEON" : "PLAYER", loser: "RETREATED" });
      }
      return new G.ui.SelectableList(items, 4);
    }
    displayPaletteSelectAllowed(){return !this.inspect&&!this.error&&!this.campaign.state.resolution?.pendingBattleScenario;}
    update(deltaMs = 0) {
      const c = this.campaign, action = this.input.consumeAction();
      if (this.error) { if (action === "cancel" || action === "confirm") this.error = null; return; }
      if (action === "menu") { this.inspect = !this.inspect; this.page = 0; }
      if (this.inspect) {
        const count = Math.max(1, Math.ceil(this.inspectionLines().length / G.config.UI.pageRows));
        if (["right", "down", "confirm"].includes(action)) this.page = (this.page + 1) % count;
        if (["left", "up"].includes(action)) this.page = (this.page - 1 + count) % count;
        if (action === "cancel") this.inspect = false;
        return;
      }
      if (c.state.phase === "PLANNING") { if (["confirm", "cancel"].includes(action)) this.onReturn(); return; }
      const pending = c.state.resolution.pendingBattleScenario;
      try {
        if (pending) {
          if (this.scenarioId !== pending.scenarioId) { this.scenarioId = pending.scenarioId; this.list = this.battleList(pending); }
          if (action === "up" || action === "down") this.list.move(action === "up" ? -1 : 1);
          if (action === "confirm") {
            const choice = this.list.selected;
            if(choice.openBattle)this.openBattle(pending);else c.applyBattleResult(G.campaign.PlaceholderBattleResolver.result(pending, choice.winner, choice.loser));
          }
        } else {
          this.elapsed += deltaMs;
          if (this.elapsed >= 550 || action === "confirm") { this.elapsed = 0; c.stepResolution(); }
        }
      } catch (error) { this.error = error.message; }
    }
    inspectionLines() { return G.ui.resolutionInspection(this.campaign).flatMap(line => this.text.wrap(line, G.config.UI.pageColumns)); }
    render() {
      this.renderer.clear(); const ctx = this.renderer.ctx, c = this.campaign, s = c.state, r = s.resolution || s.lastResolution;
      if (this.error) { this.ui.page(ctx, "COMMAND REJECTED", this.text.wrap(this.error, G.config.UI.pageColumns), 0); return; }
      if (this.inspect) { this.ui.page(ctx, "RESOLUTION RECORD", this.inspectionLines(), this.page); return; }
      if (s.phase === "PLANNING") {
        this.ui.page(ctx, "DAY " + r.resolutionDay + " COMPLETE", ["NOW DAY " + s.day, "PHASE: PLANNING",
          "ARRIVED: " + Object.values(r.outcomes).filter(v => v === "ARRIVE").length, "BATTLES: " + r.battleResults.length,
          "DEFEATED: " + Object.values(r.outcomes).filter(v => v === "DEFEATED").length, "WORLD UPDATED", "INCOME: +"+(r.resourceSummary?.income.PLAYER||0)+" G", "DELIVERED: "+(r.resourceSummary?.delivered||0)+" ITEMS", ...((r.travelerOutcomes||[]).some(o=>o.outcome==="DESTROY_CARGO")?["SHIPMENTS LOST: "+r.travelerOutcomes.filter(o=>o.outcome==="DESTROY_CARGO").length+" / CARGO DESTROYED"]:[]), ...((r.travelerOutcomes||[]).some(o=>o.outcome==="CAPTURE")?["LONE UNITS CAPTURED: "+r.travelerOutcomes.filter(o=>o.outcome==="CAPTURE").length]:[]), ...(r.resourceSummary?.refreshed?["RECRUIT POOLS REFRESHED"]:[]), "Z RETURN TO MAP", "M INSPECT RECORD"], 0); return;
      }
      const b = r.pendingBattleScenario;
      if (b) {
        if (this.scenarioId !== b.scenarioId) { this.scenarioId = b.scenarioId; this.list = this.battleList(b); }
        this.ui.window(ctx, 0, 0, G.config.INTERNAL_WIDTH, G.config.INTERNAL_HEIGHT);
        this.text.draw(ctx, "BATTLE TEST / DAY " + s.day, 8, 8, 50);
        this.text.draw(ctx, b.battleType.replaceAll("_", " "), 8, 20, 50);
        this.text.draw(ctx, "A " + b.participants[0].name, 8, 32, 50);
        this.text.draw(ctx, "D " + b.participants[1].name, 8, 42, 50);
        this.text.draw(ctx, b.locationId ? c.definitions.locations[b.locationId].name : b.routeId, 8, 54, 50);
        this.list.items.forEach((item, i) => { this.text.draw(ctx, item.label, 18, 104 + i * 16, 48); if (this.list.index === i) this.ui.cursor(ctx, 7, 104 + i * 16); });
        this.text.draw(ctx, "Z APPLY  M INSPECT", 8, G.config.INTERNAL_HEIGHT-18, 50); return;
      }
      this.ui.page(ctx, "END DAY " + s.day, [s.phase.replaceAll("_", " "), "LOCKED: " + Object.keys(r.frozenOrders).length,
        "CONFLICTS: " + r.conflicts.length, ...r.movementIntents.slice(0, 2).flatMap(i => [i.squadId.toUpperCase(), i.originLocationId + ">" + i.destinationLocationId]),
        "Z CONTINUE", "M INSPECT RECORD"].flatMap(line => this.text.wrap(line, G.config.UI.pageColumns)), 0);
    }
  }
  G.states.EndDayState = EndDayState;
}(window.GBTRPG));
