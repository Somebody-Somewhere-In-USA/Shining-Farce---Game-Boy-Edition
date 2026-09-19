(function(G){
 "use strict";
 const V=G.campaign.Validation,R=G.core.DeterministicRandom;
 const opposite={NORTH:"SOUTH",SOUTH:"NORTH",EAST:"WEST",WEST:"EAST"};
 function designation(unit,overrides={}){const value=overrides[unit.id]??G.data.CLASSES[unit.currentClassId]?.deploymentDefault??G.config.BATTLE.deploymentDefaults[unit.currentClassId];V.assert(["FRONT","BACK"].includes(value),"UNRESOLVED DEPLOYMENT DESIGNATION: "+unit.id);return value;}
 function rows(map,side,count,meta){V.assert(opposite[side],"invalid deployment side");const vertical=side==="EAST"||side==="WEST",size=vertical?map.height:map.width;
   // Row depths belong to source metadata. Centering does not decide distance from the edge.
   V.assert(Number.isInteger(meta?.frontDepth)&&Number.isInteger(meta?.backDepth)&&meta.frontDepth>meta.backDepth&&meta.backDepth>=0,"deployment row depths required");
   const result={};for(const key of ["FRONT","BACK"]){const n=Math.max(6,count[key]),depth=key==="FRONT"?meta.frontDepth:meta.backDepth,start=Math.floor((size-n)/2);result[key]=Array.from({length:n},(_,i)=>{const cross=start+i;return side==="NORTH"?{x:cross,y:depth}:side==="SOUTH"?{x:cross,y:map.height-1-depth}:side==="WEST"?{x:depth,y:cross}:{x:map.width-1-depth,y:cross};});}return result;
 }
 function assign(map,participants,orientation,overrides={},seed=0){
  V.assert(participants.length===2&&G.systems.FactionSystem.hostile(participants[0].faction,participants[1].faction),"exactly two opposing squads required");
  V.assert(opposite[orientation?.[participants[0].squadId]]===orientation?.[participants[1].squadId],"UNRESOLVED OR INVALID DEPLOYMENT ORIENTATION");
  const ids=participants.flatMap(q=>q.units.map(u=>u.id));V.assert(new Set(ids).size===ids.length,"duplicate deployment unit ID");
  const rng=R.create(seed),positions={},used=new Set(),authored=new Set(),rowData={},prepared=[];
  const key=p=>p.x+","+p.y;
  const reserve=p=>{V.assert(p&&Number.isInteger(p.x)&&Number.isInteger(p.y)&&p.x>=0&&p.y>=0&&p.x<map.width&&p.y<map.height,"invalid authored deployment tile");V.assert(!authored.has(key(p)),"conflicting starting deployment coordinates");authored.add(key(p));};
  // Specials are reserved separately and never enter an ordinary position pool.
  for(const p of map.specialDeployments||[])reserve(p);
  for(const squad of participants){
   V.assert(squad.units.length>0&&squad.units.length<=12&&squad.units.every(u=>u.faction===squad.faction),"invalid starting squad");
   const side=orientation[squad.squadId],groups={FRONT:[],BACK:[]};for(const u of squad.units)groups[designation(u,overrides)].push(u);
   const meta=map.deployment?.[side];V.assert(meta,"missing static/procedural deployment metadata");
   const available=meta.positions?V.clone(meta.positions):rows(map,side,{FRONT:groups.FRONT.length,BACK:groups.BACK.length},meta);rowData[squad.squadId]=available;
   for(const category of ["FRONT","BACK"]){
    const pool=available[category];V.assert(Array.isArray(pool),"missing authored deployment category");V.assert(pool.length>=6,"author at least six "+side+" "+category+" spots");
    for(const p of pool){reserve(p);V.assert(G.systems.BattleTerrainSystem.definition(map,p.x,p.y)?.traversable,"impassable authored deployment tile");}
   }
   V.assert(available.FRONT.length+available.BACK.length>=squad.units.length,"insufficient total authored deployment capacity");
   // Generated rows retain their established centering/depth rules; authored spots are arbitrary.
   const axis=p=>side==="NORTH"?p.y:side==="SOUTH"?-p.y:side==="WEST"?p.x:-p.x;
   V.assert(meta.positions||Math.min(...available.FRONT.map(axis))>Math.max(...available.BACK.map(axis)),"Front row must be closer to enemy");
   prepared.push({groups,available});
  }
  for(const {groups,available}of prepared){
   const pending=[];
   const place=(unit,pool)=>{
    const valid=pool.filter(p=>!used.has(key(p))&&G.systems.BattleTerrainSystem.canOccupy(map,unit,p.x,p.y));
    if(!valid.length)return false;
    const p=valid[R.integer(rng,0,valid.length-1)];positions[unit.id]={...p};used.add(key(p));return true;
   };
   // Reserve both groups' preferred positions before either group spills into the other.
   for(const category of ["FRONT","BACK"])for(const unit of groups[category])if(!place(unit,available[category]))pending.push(unit);
   const all=[...available.FRONT,...available.BACK];
   for(const unit of pending)V.assert(place(unit,all),"insufficient total valid deployment capacity");
  }
  return{positions,rows:rowData,rngState:rng.state};
 }

 G.systems.DeploymentSystem={designation,rows,assign,opposite};
}(window.GBTRPG));
