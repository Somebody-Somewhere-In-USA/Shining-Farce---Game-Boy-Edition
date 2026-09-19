(function (G) {
  "use strict";
  const V = G.campaign.Validation;
  function scenario(r, conflict, pair) {
    const snapshot = id => {
      const q = r.frozenWorld.squads[id],dead=G.campaign.BattleCasualtySystem.ids(r),unitIds=q.unitIds.filter(id=>!dead.has(id)&&!G.campaign.AwolSystem.removedIds(r).has(id));
      const resourceWorld = { ...r.frozenWorld, ...r.resourceBefore };
      return { squadId: id, name: q.name, faction: q.faction, unitIds: [...unitIds],
        units: unitIds.map(unitId => {
          const equipment = G.campaign.InventorySystem.equipment(resourceWorld, unitId);
          const possessions = Object.values(resourceWorld.itemInstances).filter(i => i.place.type === "UNIT" && i.place.id === unitId);
          return { ...V.clone(r.frozenWorld.units[unitId]), equipment,
            stats: G.campaign.InventorySystem.stats(resourceWorld, unitId),
            legacyStats: G.campaign.BattleStatAdapter.snapshot(r.frozenWorld.units[unitId],Object.values(equipment).map(id=>G.data.ITEMS[resourceWorld.itemInstances[id].definitionId])),
            possessions: possessions.map(i => ({ instance: V.clone(i), definition: V.clone(G.data.ITEMS[i.definitionId]) })) };
        }) };
    };
    return { scenarioId: r.id + "-" + conflict.id + "-battle" + conflict.battleCount,
      battleType: conflict.type, locationId: conflict.locationId, routeId: conflict.routeId, ...pair,
      participants: [snapshot(pair.attackingSquadId), snapshot(pair.defendingSquadId)],
      context: { resolutionId: r.id, conflictId: conflict.id, resolutionDay: r.resolutionDay,
        attackerMoving: r.outcomes[pair.attackingSquadId] === "ARRIVE", defenderMoving: r.outcomes[pair.defendingSquadId] === "ARRIVE" } };
  }
  function validateResult(scenario, result) {
    V.plainData(result, "BattleResult");
    V.assert(result.scenarioId === scenario.scenarioId, "BattleResult scenario is stale or does not match pending battle");
    V.assert(["PLAYER", "ZEON"].includes(result.winnerFaction), "invalid battle winner faction");
    V.assert(["DEFEATED", "RETREATED"].includes(result.loserOutcome), "invalid losing squad outcome");
    if(result.deadUnitIds!==undefined){const members=scenario.participants.flatMap(p=>p.unitIds);V.assert(Array.isArray(result.deadUnitIds)&&new Set(result.deadUnitIds).size===result.deadUnitIds.length&&result.deadUnitIds.every(id=>members.includes(id)),"invalid battle casualties");const winner=scenario.participants.find(p=>p.faction===result.winnerFaction);V.assert(winner.unitIds.some(id=>!result.deadUnitIds.includes(id)),"winning squad cannot be entirely Dead");}
    const awol=result.awolUnitIds||[],members=scenario.participants.flatMap(p=>p.unitIds);V.assert(Array.isArray(awol)&&new Set(awol).size===awol.length&&awol.every(id=>members.includes(id)&&!(result.deadUnitIds||[]).includes(id)),"invalid AWOL result");if(awol.length)V.assert(scenario.participants.find(p=>p.faction===result.winnerFaction).unitIds.some(id=>!awol.includes(id)&&!(result.deadUnitIds||[]).includes(id)),"winner needs an active survivor");
    const loser = scenario.participants.find(q => q.faction !== result.winnerFaction);
    V.assert(loser, "battle has no opposing loser");
    const moving = loser.squadId === scenario.attackingSquadId ? scenario.context.attackerMoving : scenario.context.defenderMoving;
    V.assert(result.loserOutcome !== "RETREATED" || moving, "stationary defender/participant retreat is not supported yet");
    return loser.squadId;
  }
  function apply(s, result, events) {
    const r = s.resolution, pending = r?.pendingBattleScenario;
    V.assert(s.phase === "RESOLUTION" && pending, "no pending battle to receive a result");
    const loserId = validateResult(pending, result), winnerId = pending.participants.find(q => q.faction === result.winnerFaction).squadId;
    V.assert(!r.battleResults.some(item => item.scenarioId === result.scenarioId), "battle result already applied");
    r.outcomes[loserId] = result.loserOutcome === "DEFEATED" ? "DEFEATED" : "RETREAT";
    // Returning to origin during a crossing would block the winner's destination.
    // Halt both at their own origins; do not invent a chase or hostile co-occupancy.
    if (pending.battleType === "ROUTE_INTERCEPTION" && result.loserOutcome === "RETREATED") r.outcomes[winnerId] = "STAY";
    r.battleResults.push({ ...V.clone(result), winnerSquadId: winnerId, loserSquadId: loserId, scenario: V.clone(pending) });
    r.pendingBattleScenario = null;
    events.push({ type: "BATTLE_RESULT_APPLIED", scenarioId: result.scenarioId, winnerSquadId: winnerId, loserSquadId: loserId, loserOutcome: result.loserOutcome });
  }
  // Temporary testing adapter only. Future tactical code produces this same plain result.
  G.campaign.PlaceholderBattleResolver = { result(scenario, winnerFaction, loserOutcome = "DEFEATED") {
    const result = { scenarioId: scenario.scenarioId, winnerFaction, loserOutcome };
    validateResult(scenario, result); return result;
  } };
  G.campaign.BattleBoundary = { scenario, validateResult, apply };
}(window.GBTRPG));
