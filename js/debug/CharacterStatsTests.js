(function (G) {
  "use strict";
  G.debug.runCharacterStatsTests=function(){
    const results=[],V=G.campaign.Validation,R=G.core.DeterministicRandom,F=G.campaign.CharacterGrowthSystem,S=G.campaign.CharacterStatsSystem,I=G.campaign.InventorySystem;
    const keys=G.config.CHARACTER_STATS.primaryKeys,clone=V.clone;
    const check=(x,m="assertion failed")=>{if(!x)throw Error(m);};
    const same=(a,b)=>check(JSON.stringify(a)===JSON.stringify(b),"values differ");
    const test=(name,fn)=>{try{fn();results.push({name,pass:true});}catch(e){results.push({name,pass:false,error:e.message});}};
    const rejects=fn=>{let failed=false;try{fn();}catch(e){failed=true;}check(failed,"expected rejection");};
    const make=(raceId="HUMAN",characterLevel=1,seed=12345,extra={},provider)=>F.simulateRecruitGrowth({raceId,characterLevel,seed,currentClassId:"swordsman",...extra},provider);
    const restore=c=>new G.campaign.Campaign(c.definitions,clone(c.state));
    const altered=fn=>{const c=G.campaign.createDemo(),s=c.snapshot();fn(s);return new G.campaign.Campaign(c.definitions,s);};
    test("EXACTLY SEVEN ORDINARY RACES",()=>same(Object.keys(G.data.RACES),["HUMAN","ELF","DWARF","CENTAUR","BIRDFOLK","BEASTMAN","FAIRY"]));
    for(const race of Object.values(G.data.RACES)) {
      test(race.id+" STARTING AND GROWTH RANGES",()=>{
        const endpoints={};for(const key of keys)endpoints[key]=new Set();
        for(let seed=0;seed<80;seed++) {
          const rng=R.create(R.seedFromId("race-check-"+seed)),start=F.generateLevelOneStats(race.id,rng);
          const growth=F.getRacialGrowth(race.id,rng);
          for(const key of keys) {
            check(start[key]>=race.starting[key][0]&&start[key]<=race.starting[key][1]);
            check(growth[key]>=race.growth[key][0]&&growth[key]<=race.growth[key][1]);endpoints[key].add(growth[key]);
          }
        }
        for(const key of keys)check(endpoints[key].has(race.growth[key][0])&&endpoints[key].has(race.growth[key][1]),"inclusive growth endpoints");
      });
    }
    test("PRNG KNOWN VECTOR AND SERIALIZED CONTINUATION",()=>{const rng=R.create(12345);R.integer(rng,0,100);check(rng.state===87628868);const loaded=JSON.parse(JSON.stringify(rng));same(R.integer(rng,0,100),R.integer(loaded,0,100));same(rng,loaded);});
    test("LEVEL ONE HAS ZERO GROWTH EVENTS",()=>{let calls=0;const unit=make("HUMAN",1,8,{}, {getGrowth(){calls++;return{};}}),rng=R.create(8);same(unit.basePrimary,F.generateLevelOneStats("HUMAN",rng));check(calls===0&&unit.growthRngState===rng.state);});
    test("LEVEL TEN HAS EXACTLY NINE GROWTH EVENTS",()=>{let calls=0;const unit=make("ELF",10,8,{}, {getGrowth(){calls++;return{};}});check(calls===9&&unit.characterLevel===10);});
    test("GENERATED AND ORDINARY LEVEL TEN ARE IDENTICAL",()=>{for(const id of Object.keys(G.data.RACES)){const unit=make(id);for(let i=0;i<9;i++)F.advanceLevel(unit);same(unit,make(id,10));}});
    test("GROWTH RESTORES MID PROGRESSION WITHOUT REROLL",()=>{let a=make("FAIRY",5);const b=JSON.parse(JSON.stringify(a));for(let n=0;n<4;n++){F.advanceLevel(a);F.advanceLevel(b);}same(a,b);same(a,make("FAIRY",9));});
    test("ATTRIBUTES DRAW INDEPENDENTLY",()=>{const u=make("HUMAN",1,193);check(new Set(Object.values(u.basePrimary)).size>1);});
    test("CLASS BONUSES ADD TO RACIAL GROWTH",()=>{const p={getGrowth:()=>({str:3,wis:2})};const plain=make("HUMAN",10),trained=make("HUMAN",10,12345,{},p);check(trained.basePrimary.str===plain.basePrimary.str+27&&trained.basePrimary.wis===plain.basePrimary.wis+18);check(trained.growthRngState===plain.growthRngState);});
    test("MIXED CLASS ALLOCATIONS LEAVE NO HISTORY",()=>{const p={getGrowth:id=>id==="swordsman"?{str:2}:{wis:3}},unit=make("HUMAN",10,12345,{allocations:[{classId:"swordsman",events:3},{classId:"priest",events:6}]},p),base=make("HUMAN",10);check(unit.basePrimary.str===base.basePrimary.str+6&&unit.basePrimary.wis===base.basePrimary.wis+18);same(Object.keys(unit),F.progressionKeys);same(unit.classProgress,{[unit.currentClassId]:{lifetimeCP:0,currentCP:0,classLevel:1,entryGrantCP:0}});});
    test("CLASS CHANGE CANNOT RECALCULATE ACCUMULATED GROWTH",()=>{const u=make("HUMAN",5),base=clone(u.basePrimary);u.currentClassId="priest";S.deriveStats(u);same(u.basePrimary,base);});
    test("CLASS PROGRESS IS INDEPENDENT OF CHARACTER LEVEL",()=>{const c=altered(s=>s.units.mc.classProgress={swordsman:{lifetimeCP:1350,currentCP:91,classLevel:7,entryGrantCP:0},priest:{lifetimeCP:0,currentCP:0,classLevel:1,entryGrantCP:0}});check(c.state.units.mc.characterLevel===3);});
    test("INVALID GROWTH ALLOCATIONS REJECTED",()=>{for(const events of [-1,1.5,10])rejects(()=>make("HUMAN",10,1,{allocations:[{classId:"x",events}]}));});
    test("NONPRIMARY CLASS GROWTH REJECTED",()=>{for(const key of ["def","mov","maxHp","maxMp","atk"])rejects(()=>make("HUMAN",2,1,{}, {getGrowth:()=>({[key]:1})}));});
    test("LEVEL CAP IS ATOMIC",()=>{const c=altered(s=>Object.assign(s.units.mc,make("HUMAN",100)));const before=clone(c.state);rejects(()=>c.advanceCharacterLevel("mc"));same(before,c.state);});
    test("LEVEL UP USES SHARED ENGINE AND COMMAND GUARD",()=>{const c=G.campaign.createDemo(),u=clone(c.state.units.mc);F.advanceLevel(u);c.advanceCharacterLevel("mc");same(c.state.units.mc,u);c.startEndDay();const before=clone(c.state);rejects(()=>c.advanceCharacterLevel("mc"));same(c.state,before);});
    test("CON AND INT CENTRALLY DERIVE CAPACITIES",()=>{const u=make(),a=S.deriveStats(u);u.basePrimary.con+=2;u.basePrimary.int+=3;const b=S.deriveStats(u),f=G.config.CHARACTER_STATS.capacity;check(b.maxHp-a.maxHp===2*f.hpPerCon&&b.maxMp-a.maxMp===3*f.mpPerInt);});
    test("RACIAL CAPACITY OFFSETS DO NOT MULTIPLY BY LEVEL",()=>{const u=make("ELF",40),e=S.deriveStats(u);u.raceId="HUMAN";const h=S.deriveStats(u);check(e.maxHp-h.maxHp===-4&&e.maxMp-h.maxMp===8);});
    test("DEF ZERO AND MOV CONSTANT THROUGH LEVEL GROWTH",()=>{for(const r of Object.values(G.data.RACES)){const a=S.deriveStats(make(r.id)),b=S.deriveStats(make(r.id,100));check(a.mov===r.mov&&b.mov===r.mov&&a.def===0&&b.def===0);}});
    test("MOV CLASS EQUIPMENT EFFECT COMPOSITION",()=>{const s=S.deriveStats(make(),[{modifiers:{mov:2,def:3}}],{classProvider:{getMovementModifier:()=>1},effects:[{modifiers:{mov:-1,def:2}}]});check(s.mov===7&&s.def===5);});
    test("EQUIPMENT CON INT MODIFIERS UPDATE CAPACITIES",()=>{const u=make(),a=S.deriveStats(u),b=S.deriveStats(u,[{modifiers:{con:2,int:3,maxHp:4,maxMp:5}}]);check(b.maxHp===a.maxHp+8&&b.maxMp===a.maxMp+8);});
    test("DERIVED STATS AND UI READS ARE PURE",()=>{const c=G.campaign.createDemo(),before=clone(c.state);for(let n=0;n<5;n++){I.stats(c.state,"mc");G.ui.CharacterStatView.lines(c.state.units.mc,I.stats(c.state,"mc"));}same(c.state,before);});
    test("RECRUIT PREVIEW SURVIVES PURCHASE AND RESTORE",()=>{const c=G.campaign.createDemo(),candidate=clone(c.state.recruitPools.granseal[0]),before=S.deriveStats(candidate);const id=c.recruit("granseal",candidate.id);same(F.copyProgression(candidate),F.copyProgression(c.state.units[id]));same(before,I.stats(c.state,id));same(I.stats(restore(c).state,id),before);});
    test("RECRUIT PREVIEW DOES NOT ADVANCE RNG",()=>{const c=G.campaign.createDemo(),before=clone(c.state);for(let n=0;n<10;n++)for(const pool of Object.values(c.state.recruitPools))for(const candidate of pool)S.deriveStats(candidate);same(c.state,before);});
    test("ALL PERSISTENT UNITS HAVE EXPLICIT RACES",()=>{const c=G.campaign.createDemo();for(const u of Object.values(c.state.units))check(G.data.RACES[u.raceId]);check(c.state.units.mc.raceId==="HUMAN");});
    test("BEASTMAN RESTRICTIONS COMPOSE WITH CLASS",()=>{const u=make("BEASTMAN");for(const id of ["ironSword","cloth"])check(!G.campaign.EquipmentEligibility.allows(u,G.data.ITEMS[id]));check(G.campaign.EquipmentEligibility.allows(u,G.data.ITEMS.charm));u.raceId="HUMAN";u.currentClassId="healer";check(!G.campaign.EquipmentEligibility.allows(u,G.data.ITEMS.ironSword));});
    test("BEASTMAN LOCAL REMOTE AND UI ELIGIBILITY AGREE",()=>{const c=altered(s=>Object.assign(s.units.mc,make("BEASTMAN")));c.supportPolity("galam");for(const [place,item]of [["granseal","ironSword"],["granseal","cloth"],["galam","steelSword"]]){const id=c.purchase(place,item),before=clone(c.state);check(!I.eligible(c.state,c.state.itemInstances[id],"mc"));rejects(()=>c.assignItem(id,"mc"));same(before,c.state);}const charm=c.purchase("granseal","charm");c.assignItem(charm,"mc");check(I.stats(c.state,"mc").def===1);});
    test("BEASTMAN REMOTE ACCESSORY DELIVERY",()=>{const c=altered(s=>Object.assign(s.units.mc,make("BEASTMAN")));c.supportPolity("galam");const id=c.purchase("galam","charm");c.assignItem(id,"mc");check(I.stats(c.state,"mc").def===0);c.endDay();c.endDay();check(I.equipment(c.state,"mc").accessory===id&&I.stats(c.state,"mc").def===1);});
    test("ILLEGAL EQUIPPED AND ASSIGNED ITEMS REJECTED ON LOAD",()=>{for(const remote of [false,true]){const c=G.campaign.createDemo();c.supportPolity("galam");c.assignItem(c.purchase(remote?"galam":"granseal","ironSword"),"mc");const s=c.snapshot();s.units.mc.raceId="BEASTMAN";rejects(()=>new G.campaign.Campaign(c.definitions,s));}});
    test("FLIGHT AND GROUND MOVEMENT REMAIN DISTINCT",()=>{for(const id of ["BIRDFOLK","FAIRY"])same(S.deriveStats(make(id)).movementTraits,["FLIGHT"]);same(S.deriveStats(make("CENTAUR")).movementTraits,[]);});
    test("FAIRY CURE HOOK HAS NO INVENTED TACTICAL RULES",()=>{const s=S.deriveStats(make("FAIRY"));same(s.racialAbilities,["singleTargetDebuffCure"]);same(Object.keys(G.data.RACIAL_ABILITIES[s.racialAbilities[0]]),["id","source","concept"]);});
    test("TACTICAL ADAPTER PRESERVES SPENT RESOURCES",()=>{const u=make(),a=G.campaign.BattleStatAdapter.snapshot(u,[],{hp:3,mp:0});F.advanceLevel(u);const b=G.campaign.BattleStatAdapter.snapshot(u,[],a);check(b.hp===3&&b.mp===0&&b.maxHp>a.maxHp);});
    test("TACTICAL RECOMPUTE CLAMPS WITHOUT REFILL",()=>{const hero=new G.entities.Character(G.data.CHARACTERS.hero);hero.stats.hp=2;hero.stats.mp=0;hero.refreshDerivedStats([{modifiers:{con:4,int:4}}]);check(hero.stats.hp===2&&hero.stats.mp===0);const out=G.campaign.BattleStatAdapter.snapshot(make(),[],{hp:999,mp:999});check(out.hp===out.maxHp&&out.mp===out.maxMp);});
    test("LEGACY ATK EXISTS ONLY IN ADAPTER",()=>{const u=make(),s=S.deriveStats(u);check(!("atk" in s)&&!("stats" in u));check(G.campaign.BattleStatAdapter.snapshot(u).atk===s.str);});
    test("BATTLE SNAPSHOT CANONICAL STATS AND TRAITS",()=>{const c=altered(s=>Object.assign(s.units.mc,make("FAIRY")));c.relocateForInspection("vanguard","grove");c.queueMovement("vanguard","fortress");const battle=c.endDay(),u=battle.participants.flatMap(q=>q.units).find(x=>x.id==="mc");same(u.stats,I.stats(c.state,"mc"));check(u.legacyStats.atk===u.stats.str&&u.stats.movementTraits[0]==="FLIGHT");const loaded=restore(c);same(loaded.state.resolution.pendingBattleScenario,battle);});
    const badUnits=[
      ["MISSING RACE",u=>delete u.raceId],["UNKNOWN RACE",u=>u.raceId="SECRET"],
      ["MISSING PRIMARY",u=>delete u.basePrimary.wis],["EXTRA PRIMARY",u=>u.basePrimary.atk=2],
      ["NONFINITE PRIMARY",u=>u.basePrimary.con=Infinity],["NEGATIVE PRIMARY",u=>u.basePrimary.str=-1],
      ["ZERO LEVEL",u=>u.characterLevel=0],["OVER CAP",u=>u.characterLevel=101],["FRACTIONAL LEVEL",u=>u.characterLevel=2.5],
      ["INVALID RNG",u=>u.growthRngState=-1],["MISSING RNG",u=>delete u.growthRngState],
      ["PERSISTED DERIVED",u=>u.maxHp=100],["LEGACY LEVEL",u=>u.level=3],["HISTORY LEDGER",u=>u.classHistory=[]],
      ["MALFORMED CLASS PROGRESS",u=>u.classProgress={swordsman:{cp:-1}}]
    ];
    for(const [name,mutate]of badUnits)test("STAT VALIDATION "+name,()=>rejects(()=>altered(s=>mutate(s.units.mc))));
    test("INVALID CANDIDATE RNG REJECTED",()=>rejects(()=>altered(s=>s.recruitPools.granseal[0].seed=4294967296)));
    test("INVALID CANDIDATE PROGRESSION REJECTED",()=>rejects(()=>altered(s=>delete s.recruitPools.granseal[0].basePrimary)));
    test("DERIVED OVERFLOW REJECTED",()=>rejects(()=>altered(s=>s.units.mc.basePrimary.con=Number.MAX_SAFE_INTEGER)));
    function legacy(c){const s=c.snapshot();s.schemaVersion=3;for(const u of [...Object.values(s.units),...Object.values(s.recruitPools).flat()]){u.level=u.characterLevel;for(const key of F.progressionKeys)delete u[key];}return s;}
    test("V3 MIGRATION PRESERVES PHYSICAL AND ECONOMIC STATE",()=>{const c=G.campaign.createDemo();c.supportPolity("galam");c.reorderRoster("vanguard","sara","TOP");c.assignItem(c.purchase("granseal","ironSword"),"mc");c.assignItem(c.purchase("galam","steelSword"),"mc");const old=legacy(c),a=new G.campaign.Campaign(c.definitions,old),b=new G.campaign.Campaign(c.definitions,clone(old));same(a.state,b.state);check(a.state.schemaVersion===8);for(const key of ["squads","locations","treasuries","itemInstances","shipments","travelerOrders","recruitment"])same(a.state[key],old[key]);for(const id of Object.keys(old.units)){check(a.state.units[id].characterLevel===old.units[id].level);check(a.state.units[id].faction===old.units[id].faction&&a.state.units[id].unassignedLocationId===old.units[id].unassignedLocationId);}same(a.state,restore(a).state);});
    test("V3 RECRUIT MIGRATION USES ORIGINAL SEED LEVEL AND COST",()=>{const c=G.campaign.createDemo(),old=legacy(c);const candidate=old.recruitPools.granseal[0];candidate.level=10;const loaded=new G.campaign.Campaign(c.definitions,old),next=loaded.state.recruitPools.granseal[0];same(F.copyProgression(next),make(G.data.UNIT_TYPES[candidate.typeId].raceId,10,candidate.seed,{currentClassId:G.data.UNIT_TYPES[candidate.typeId].classId}));check(next.id===candidate.id&&next.costG===candidate.costG);});
    test("ACTIVE LEGACY RESOLUTION REJECTED WITHOUT RESET",()=>{const c=G.campaign.createDemo();c.startEndDay();const old=legacy(c),before=clone(old);rejects(()=>new G.campaign.Campaign(c.definitions,old));same(old,before);});
    return results;
  };
}(window.GBTRPG));
