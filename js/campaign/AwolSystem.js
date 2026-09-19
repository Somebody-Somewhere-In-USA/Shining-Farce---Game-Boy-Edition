(function(G){
  "use strict";
  const V=G.campaign.Validation,R=G.core.DeterministicRandom;
  function initial(){return{seed:R.seedFromId("awol-returns"),pending:{}};}
  function removedIds(r){return new Set(r.battleResults.flatMap(b=>(b.awolUnitIds||[]).filter(id=>b.scenario.participants.find(p=>p.unitIds.includes(id)).faction!==b.winnerFaction)));}
  function outcome(won,rng,integer=R.integer){if(won)return{kind:"SQUAD"};return integer(rng,0,1)===0?{kind:"DEAD"}:{kind:"ABSENT",delay:integer(rng,2,4)};}
  function apply(s,r){const rng=R.create(s.awol.seed);for(const b of r.battleResults)for(const id of [...(b.awolUnitIds||[])].sort()){
    const u=s.units[id],p=b.scenario.participants.find(p=>p.unitIds.includes(id)),result=outcome(p.faction===b.winnerFaction,rng);
    if(result.kind==="SQUAD")continue;
    for(const q of Object.values(s.squads))q.unitIds=q.unitIds.filter(x=>x!==id);
    delete s.travelerOrders["unit_"+id];u.unassignedLocationId=b.scenario.locationId||r.frozenWorld.squads[p.squadId].currentLocationId;
    if(result.kind==="DEAD")G.campaign.BattleCasualtySystem.markDead(s,id,u.unassignedLocationId);
    else{u.status="AWOL";s.awol.pending[id]={unitId:id,faction:u.faction,battleLocationId:b.scenario.locationId,routeId:b.scenario.routeId,returnDay:r.resolutionDay+result.delay,blockedReason:null};}
  }s.awol.seed=rng.state;}
  function distance(d,s,a,b){return G.campaign.WorldPathfindingSystem.find(d,s,a,b)?.totalCost??Infinity;}
  function settlement(d,s,record,rng,integer=R.integer){
    // Node battles and route midpoints share the authoritative campaign-distance contract.
    const candidates=Object.values(d.locations).filter(l=>["CAPITAL","VILLAGE","PORT","FORTRESS","SHRINE"].includes(l.locationType)&&s.locations[l.id].controller===record.faction).map(l=>({id:l.id,cost:G.campaign.BattleLocationSystem.distance(d,s,record,l.id)})).filter(l=>Number.isFinite(l.cost));
    if(!candidates.length)return{locationId:null,reason:"NO REACHABLE FRIENDLY SETTLEMENT"};
    const closest=Math.min(...candidates.map(l=>l.cost));let tied=candidates.filter(l=>l.cost===closest);
    if(tied.length>1){const enemies=Object.values(s.squads).filter(q=>q.faction!==record.faction&&q.unitIds.some(id=>s.units[id]?.status==="ACTIVE"));for(const c of tied)c.safety=Math.min(...enemies.map(q=>distance(d,s,c.id,q.currentLocationId)));const safest=Math.max(...tied.map(l=>l.safety));tied=tied.filter(l=>l.safety===safest);}
    return{locationId:tied[tied.length===1?0:integer(rng,0,tied.length-1)].id,reason:null};
  }
  function update(d,s,events,legacyRouteHolds=[]){const rng=R.create(s.awol.seed);for(const id of Object.keys(s.awol.pending).sort()){
    const record=s.awol.pending[id];if(record.returnDay>s.day+1)continue;
    // Replay only: preserve an old, already-completed World Update without drawing new outcomes.
    if(legacyRouteHolds.includes(id)){record.blockedReason="BATTLE ROUTE POSITION UNRESOLVED";continue;}
    const chosen=settlement(d,s,record,rng);if(!chosen.locationId){if(record.blockedReason!==chosen.reason)events.push({type:"AWOL_RETURN_UNRESOLVED",unitId:id,message:s.units[id].name+": "+chosen.reason});record.blockedReason=chosen.reason;continue;}
    const u=s.units[id];u.status="ACTIVE";u.unassignedLocationId=chosen.locationId;delete s.awol.pending[id];events.push({type:"AWOL_RETURNED",unitId:id,locationId:chosen.locationId,message:u.name+" has returned from the wilderness."});
  }s.awol.seed=rng.state;}
  function validate(d,s){V.assert(s.awol&&R.isSeed(s.awol.seed)&&s.awol.pending&&!Array.isArray(s.awol.pending),"invalid AWOL schedule");for(const [id,p]of Object.entries(s.awol.pending))V.assert(p.unitId===id&&s.units[id]?.status==="AWOL"&&p.faction===s.units[id].faction&&Number.isSafeInteger(p.returnDay)&&p.returnDay>0&&(p.battleLocationId?!!d.locations[p.battleLocationId]:!!d.routes[p.routeId])&&(p.blockedReason===null||typeof p.blockedReason==="string"),"invalid AWOL return record");for(const u of Object.values(s.units))V.assert(u.status!=="AWOL"||s.awol.pending[u.id],"AWOL unit missing return record");}
  G.campaign.AwolSystem={initial,removedIds,outcome,apply,distance,settlement,update,validate};
}(window.GBTRPG));
