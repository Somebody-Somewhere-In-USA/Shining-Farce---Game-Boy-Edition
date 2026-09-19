(function (G) {
  "use strict";
  const list = [
    {id:"delivery",name:"F REMOTE DELIVERY",description:"STEEL SWORD FROM GALAM TO AREN. TWO DAYS."},
    {id:"supplyInterception",name:"G WAGON INTERCEPTION",description:"ZEON AND WAGON ARRIVE AT CROSSROADS. CARGO LOST."},
    {id:"loneTravel",name:"H LONE RECRUIT",description:"UNASSIGNED RECRUIT TRAVELS TO GALAM. TWO DAYS."},
    { id: "peaceful", name: "A PEACEFUL TRAVEL", description: "GRANSEAL TO GALAM. TWO EDGES, TWO DAYS." },
    { id: "crossing", name: "B OPPOSITE CROSSING", description: "GROVE AND FORT SQUADS CROSS ON MARSH WAY." },
    { id: "arrival", name: "C SAME DESTINATION", description: "BOTH FACTIONS HEAD TO GALAM CAPITAL." },
    { id: "defender", name: "D ATTACK DEFENDER", description: "VANGUARD ATTACKS THE ZEON BORDER FORT." },
    { id: "multiple", name: "E TWO BATTLES", description: "MARSH CROSSING AND GALAM ATTACK, SAME DAY." }
  ];
  function createState(definitions, id) {
    G.campaign.Validation.assert(list.some(item => item.id === id), "unknown development scenario");
    const demo = G.campaign.Validation.clone(G.data.DEMO_CAMPAIGN);
    const player = demo.squads.find(q => q.id === "vanguard"), ranger = demo.squads.find(q => q.id === "rangers"), zeon = demo.squads.find(q => q.id === "zeonGuard");
    if (["crossing", "defender", "multiple"].includes(id)) player.currentLocationId = "grove";
    if (id === "arrival") { player.currentLocationId = "crossroads"; zeon.currentLocationId = "port"; demo.controllers.port = "ZEON"; }
    if (id === "multiple") {
      ranger.currentLocationId = "crossroads";
      demo.units.push("orc4"); demo.squads.push({ id: "zeonSecond", name: "ZEON SECOND", faction: "ZEON", unitIds: ["orc4"], currentLocationId: "galam" });
      demo.controllers.galam = "ZEON";
    }
    if (["delivery","supplyInterception"].includes(id)) demo.controllers.galam="PLAYER";
    if(id==="supplyInterception")zeon.currentLocationId="galam";
    const s = G.campaign.CampaignState.create(definitions, demo), queue = (squad, to) =>
      G.campaign.StrategicOrderSystem.queue(definitions, s, squad, to, null, s.squads[squad].faction, []);
    if (id === "peaceful") queue("vanguard", "galam");
    if (["crossing", "defender", "multiple"].includes(id)) queue("vanguard", "fortress");
    if (["crossing", "multiple"].includes(id)) queue("zeonGuard", "grove");
    if (id === "arrival") { queue("vanguard", "galam"); queue("zeonGuard", "galam"); }
    if (id === "multiple") queue("rangers", "galam");
    if(["delivery","supplyInterception"].includes(id)) {
      const old=G.campaign.EconomySystem.purchase(definitions,s,"granseal","ironSword",[]);
      G.campaign.InventorySystem.assign(definitions,s,old,"mc",G.campaign.TravelerSystem.knowledge(s),[]);
      const item=G.campaign.EconomySystem.purchase(definitions,s,"galam","steelSword",[]);
      G.campaign.InventorySystem.assign(definitions,s,item,"mc",G.campaign.TravelerSystem.knowledge(s),[]);
      if(id==="supplyInterception")queue("zeonGuard","crossroads");
    }
    if(id==="loneTravel") {
      const unitId=G.campaign.RecruitmentSystem.recruit(definitions,s,"granseal",s.recruitPools.granseal[0].id,[]);
      G.campaign.TravelerSystem.queueUnit(definitions,s,unitId,"galam",[]);
    }
    G.campaign.Validation.state(definitions, s); return s;
  }
  G.campaign.DevelopmentScenarios = { list, createState };
}(window.GBTRPG));
