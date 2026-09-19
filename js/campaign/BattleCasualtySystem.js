(function(G){
  "use strict";
  function ids(r){return new Set(r.battleResults.flatMap(b=>b.deadUnitIds||[]));}
  function markDead(s,id,locationId){const u=s.units[id];u.status="DEAD";u.unassignedLocationId=locationId;for(const squad of Object.values(s.squads))squad.unitIds=squad.unitIds.filter(x=>x!==id);delete s.travelerOrders["unit_"+id];}
  function apply(s,r){for(const id of ids(r)){const u=s.units[id],q=Object.values(r.frozenWorld.squads).find(q=>q.unitIds.includes(id)),result=r.battleResults.find(b=>b.deadUnitIds?.includes(id));markDead(s,id,result.scenario.locationId||q.currentLocationId);}}
  G.campaign.BattleCasualtySystem={ids,apply,markDead};
}(window.GBTRPG));
