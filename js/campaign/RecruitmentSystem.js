(function (G) {
  "use strict";
  const V=G.campaign.Validation;
  // Replaceable upper-quartile approximation; low-level recruits cannot dilute a roster mean.
  G.campaign.VeteranBenchmark={calculate(s){const levels=Object.values(s.units).filter(u=>u.faction==="PLAYER"&&u.status==="ACTIVE").map(u=>u.characterLevel).sort((a,b)=>a-b);return levels.length?levels[Math.floor((levels.length-1)*0.75)]:1;}};
  function eligible(location,raceId,classId){const s=location.settlement;return !s||s.enabled&&s.recruitment.races.includes(raceId)&&s.recruitment.classes.includes(classId);}
  const random=G.core.DeterministicRandom.step;
  function generate(d,s,day,benchmark=G.campaign.VeteranBenchmark,classProvider=G.campaign.ClassGrowthProvider){
    const levelBase=benchmark.calculate(s);s.recruitPools={};
    for(const id of Object.keys(d.locations).sort()){
      if(d.locations[id].settlement?.enabled===false)continue;const table=d.locations[id].economy?.recruitment;if(!table)continue;const allowed=table.types.filter(id2=>eligible(d.locations[id],G.data.UNIT_TYPES[id2].raceId,G.data.UNIT_TYPES[id2].classId));if(!allowed.length){s.recruitPools[id]=[];continue;}
      const pool=[];
      for(let i=0;i<table.count;i++){
        s.recruitment.seed=random(s.recruitment.seed);const seed=s.recruitment.seed,typeId=allowed[seed%allowed.length],type=G.data.UNIT_TYPES[typeId];
        const level=Math.min(G.config.CHARACTER_STATS.levelCap,Math.max(1,levelBase-2+(seed%2)+(table.levelModifier||0)));
        const progression=G.campaign.CharacterGrowthSystem.simulateRecruitGrowth({raceId:type.raceId,currentClassId:type.classId,characterLevel:level,seed},classProvider);
        pool.push({id:"candidate"+s.recruitment.nextCandidateId++,typeId,seed,costG:type.recruitBaseG+level*15,...progression});
      }s.recruitPools[id]=pool;
    }
    s.recruitment.lastRefreshDay=day;s.recruitment.nextRefreshDay=day+G.config.RESOURCES.recruitIntervalDays;
  }
  function refresh(d,s,events,classProvider){if(s.day+1>=s.recruitment.nextRefreshDay){generate(d,s,s.day+1,undefined,classProvider);events.push({type:"RECRUIT_POOL_REFRESHED",day:s.day+1,nextRefreshDay:s.recruitment.nextRefreshDay});return true;}return false;}
  function recruit(d,s,locationId,candidateId,events){
    V.assert(d.locations[locationId].settlement?.enabled!==false,"Wilderness has no recruitment");V.assert(s.locations[locationId]?.controller==="PLAYER","ordinary recruitment requires PLAYER control");
    const pool=s.recruitPools[locationId],candidate=pool?.find(c=>c.id===candidateId);V.assert(candidate,"candidate unavailable");
    G.campaign.EconomySystem.change(s,"PLAYER",-candidate.costG,events,"RECRUITMENT");
    const id="recruit"+s.nextUnitId++;s.units[id]=G.campaign.UnitManagementSystem.make(id,candidate.typeId,"PLAYER",locationId,candidate.characterLevel,null,{progression:candidate});
    pool.splice(pool.indexOf(candidate),1);events.push({type:"UNIT_RECRUITED",unitId:id,locationId,candidateId});return id;
  }
  G.campaign.RecruitmentSystem={eligible,generate,refresh,recruit};
}(window.GBTRPG));
