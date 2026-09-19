(function (G) {
  "use strict";
  const V = G.campaign.Validation;
  class Campaign {
    #state;
    #busy = false;
    #zeonProvider;
    #knowledgeProvider;
    constructor(definitions, initialState, events = new G.core.EventBus(), zeonProvider = new G.campaign.ZeonOrderProvider(), knowledgeProvider = G.campaign.TravelerSystem.knowledge) {
      initialState = G.campaign.CampaignState.migrate(initialState, definitions);
      V.definitions(definitions); V.state(definitions, initialState);
      Object.defineProperty(this, "definitions", { value: V.freeze(V.clone(definitions)), enumerable: true });
      this.#state = V.freeze(V.clone(initialState));
      this.events = events;
      this.#zeonProvider = zeonProvider; this.#knowledgeProvider = knowledgeProvider;
    }
    get state() { return this.#state; }
    snapshot() { return V.clone(this.#state); }
    validate() { return V.state(this.definitions, this.#state); }
    // A failed command never changes the authoritative state or emits partial events.
    // Subscribers see the fully committed state; reentrant mutation is rejected.
    #command(apply, duringResolution = false) {
      V.assert(!this.#busy, "commands may not run inside campaign event listeners");
      V.assert(duringResolution || this.#state.phase === "PLANNING", "command requires PLANNING; orders/world are locked during resolution");
      this.#busy = true;
      try {
        const draft = this.snapshot(), events = [];
        const result = apply(draft, events);
        V.state(this.definitions, draft);
        this.#state = V.freeze(draft);
        for (const event of events) this.events.emit(event.type, V.freeze(V.clone(event)));
        return result;
      } finally { this.#busy = false; }
    }
    // Compatibility name now performs a complete End Day; never bypasses the pipeline.
    advanceDay() { return this.endDay(); }
    queueMovement(squadId, destinationId, path) { return this.#command((s, e) => G.campaign.StrategicOrderSystem.queue(this.definitions, s, squadId, destinationId, path, "PLAYER", e)); }
    queueZeonDemoMovement(squadId, destinationId, path) { return this.#command((s, e) => G.campaign.StrategicOrderSystem.queue(this.definitions, s, squadId, destinationId, path, "ZEON", e)); }
    cancelMovement(squadId) { return this.#command((s, e) => {
      V.assert(s.squads[squadId]?.faction === "PLAYER", "only PLAYER orders can be cancelled here");
      G.campaign.StrategicOrderSystem.cancel(s, squadId, e);
    }); }
    startEndDay() { return this.#command((s, e) => G.campaign.EndDayResolutionSystem.start(s, this.definitions, this.#zeonProvider, e, this.#known(s))); }
    stepResolution() { return this.#command((s, e) => G.campaign.EndDayResolutionSystem.step(s, this.definitions, e), true); }
    resumeResolution() {
      V.assert(this.state.phase !== "PLANNING", "no active resolution to resume");
      let steps = 0;
      while (this.state.phase !== "PLANNING" && !this.state.resolution.pendingBattleScenario) {
        V.assert(steps++ < 10000, "resolution exceeded its progress guard"); this.stepResolution();
      }
      return this.state.resolution?.pendingBattleScenario ?? null;
    }
    endDay() { this.startEndDay(); return this.resumeResolution(); }
    applyBattleResult(result) {
      this.#command((s, e) => G.campaign.BattleBoundary.apply(s, result, e), true);
      return this.resumeResolution();
    }
    loadDevelopmentScenario(id) { return this.#command(s => {
      const fresh = G.campaign.DevelopmentScenarios.createState(this.definitions, id);
      for (const key of Object.keys(s)) delete s[key]; Object.assign(s, fresh);
    }); }
    supportPolity(id) { return this.#command((s, e) => G.campaign.PoliticalControlSystem.join(s, this.definitions, id, e)); }
    setController(id, controller) { return this.#command((s, e) => G.campaign.PoliticalControlSystem.setController(s, id, controller, e)); }
    createSquad(spec) { V.plainData(spec, "squad specification"); return this.#command((s, e) => G.campaign.SquadSystem.create(s, V.clone(spec), e)); }
    dismissSquad(id) { return this.#command((s, e) => G.campaign.SquadSystem.dismiss(s, id, e)); }
    setSquadMembers(id, unitIds) {
      return this.#command((s, e) => {
        G.campaign.UnitManagementSystem.setMembers(s, id, unitIds, e);
      });
    }
    #known(s) { const known = this.#knowledgeProvider(G.campaign.Validation.freeze(G.campaign.Validation.clone(s))); G.campaign.Validation.plainData(known); return known; }
    purchase(locationId, itemId) { return this.#command((s,e)=>G.campaign.EconomySystem.purchase(this.definitions,s,locationId,itemId,e)); }
    changeClass(unitId,classId) {return this.#command((s,e)=>G.campaign.ClassManagementSystem.change(s,unitId,classId,e));}
    setAbilityLoadout(unitId,slot,abilityId) {return this.#command((s,e)=>G.campaign.ClassManagementSystem.loadout(s,unitId,slot,abilityId,e));}
    purchaseAbility(unitId,abilityId) {return this.#command((s,e)=>{const u=s.units[unitId];V.assert(u?.faction==="PLAYER"&&u.status==="ACTIVE","active PLAYER character required");G.campaign.AbilityLearningSystem.purchase(u,abilityId);e.push({type:"ABILITY_PURCHASED",unitId,abilityId});});}
    // Explicit inspection commands; these are not CP award formulas or free purchases.
    grantClassCPForInspection(unitId,classId,amount) {return this.#command((s,e)=>{const u=s.units[unitId];V.assert(u?.faction==="PLAYER"&&u.status==="ACTIVE"&&G.data.CLASSES[classId],"invalid debug character/class");G.campaign.ClassProgressionSystem.earn(u,classId,amount);e.push({type:"DEBUG_PROGRESSION_CHANGED",unitId,classId,amount});});}
    grantAbilityForInspection(unitId,abilityId) {return this.#command((s,e)=>{const u=s.units[unitId],a=G.data.ABILITIES[abilityId];V.assert(u?.faction==="PLAYER"&&u.status==="ACTIVE"&&a,"invalid debug character/ability");V.assert(G.campaign.ClassProgressionSystem.progress(u,a.classId).classLevel>=a.level,"debug grant still requires Class Level");if(!u.learnedAbilityIds.includes(abilityId))u.learnedAbilityIds.push(abilityId);e.push({type:"DEBUG_PROGRESSION_CHANGED",unitId,abilityId});});}
    // Explicit progression command; XP awards and thresholds remain deferred.
    advanceCharacterLevel(unitId) { return this.#command((s,e)=>{
      const unit=s.units[unitId];V.assert(unit?.status==="ACTIVE","active unit required");
      G.campaign.CharacterGrowthSystem.advanceLevel(unit);
      e.push({type:"CHARACTER_LEVEL_CHANGED",unitId,characterLevel:unit.characterLevel});
    }); }
    recruit(locationId, candidateId) { return this.#command((s,e)=>G.campaign.RecruitmentSystem.recruit(this.definitions,s,locationId,candidateId,e)); }
    assignItem(itemId, unitId) { return this.#command((s,e)=>G.campaign.InventorySystem.assign(this.definitions,s,itemId,unitId,this.#known(s),e)); }
    releaseItem(itemId) { return this.#command((s,e)=>G.campaign.InventorySystem.release(s,itemId,e)); }
    reorderRoster(squadId, unitId, delta) { return this.#command((s,e)=>G.campaign.UnitManagementSystem.reorder(s,squadId,unitId,delta,e)); }
    transferUnit(unitId, squadId) { return this.#command((s,e)=>G.campaign.UnitManagementSystem.transfer(s,unitId,squadId,e)); }
    removeUnit(unitId) { return this.#command((s,e)=>{ const q=G.campaign.UnitManagementSystem.squadFor(s,unitId); V.assert(q?.faction==="PLAYER","PLAYER squad member required"); G.campaign.UnitManagementSystem.setMembers(s,q.id,q.unitIds.filter(id=>id!==unitId),e); }); }
    queueLoneUnit(unitId, destinationId) { return this.#command((s,e)=>G.campaign.TravelerSystem.queueUnit(this.definitions,s,unitId,destinationId,e)); }
    cancelLoneUnit(unitId) { return this.#command((s,e)=>{ V.assert(s.units[unitId]?.faction === "PLAYER" && !G.campaign.UnitManagementSystem.squadFor(s,unitId), "unassigned PLAYER unit required"); delete s.travelerOrders["unit_"+unitId]; e.push({type:"TRAVELER_ORDER_CANCELLED",unitId}); }); }
    stationSquad(locationId, squadId) { return this.#command((s, e) => G.campaign.StationingSystem.choose(s, locationId, squadId, e)); }
    squadsAt(id, faction) { return G.campaign.StationingSystem.present(this.#state, id, faction); }
    neighbors(id) { return G.campaign.WorldPathfindingSystem.neighbors(this.definitions, this.#state, id); }
    findPath(from, to, weight) { return G.campaign.WorldPathfindingSystem.find(this.definitions, this.#state, from, to, weight); }
    setRouteAvailability(id, { blocked, available }) {
      return this.#command((s, e) => {
        V.assert(V.has(s.routes, id), "unknown route: " + id);
        if (blocked !== undefined) s.routes[id].blocked = blocked;
        if (available !== undefined) s.routes[id].available = available;
        if (!s.routes[id].available || s.routes[id].blocked) for (const squadId of Object.keys(s.orders).sort()) {
          if (s.orders[squadId].plannedRouteIds.includes(id)) G.campaign.StrategicOrderSystem.cancel(s, squadId, e, "ROUTE_UNAVAILABLE");
        }
        if (!s.routes[id].available || s.routes[id].blocked) for (const [key, order] of Object.entries(s.travelerOrders)) if(order.plannedRouteIds.includes(id)) delete s.travelerOrders[key];
        e.push({ type: "ROUTE_AVAILABILITY_CHANGED", routeId: id, ...s.routes[id] });
      });
    }
    // Debug-only relocation, NOT a strategic order or End Day resolver.
    relocateForInspection(id, destinationId) {
      return this.#command((s, e) => {
        const q = s.squads[id]; V.assert(q, "unknown squad: " + id);
        V.assert(this.neighbors(q.currentLocationId).some(n => n.locationId === destinationId), "inspection relocation requires an available adjacent route");
        V.assert(s.locations[destinationId].controller !== (q.faction === "PLAYER" ? "ZEON" : "PLAYER") &&
          !this.squadsAt(destinationId).some(other => other.faction !== q.faction), "hostile destinations require future movement resolution");
        G.campaign.StrategicOrderSystem.cancel(s, id, e, "INSPECTION_RELOCATION");
        G.campaign.SquadSystem.relocate(s, id, destinationId, e);
      });
    }
  }
  G.campaign.Campaign = Campaign;
  G.campaign.createDemo = () => new Campaign(G.data.WORLD, G.campaign.CampaignState.create(G.data.WORLD, G.data.DEMO_CAMPAIGN));
}(window.GBTRPG));
