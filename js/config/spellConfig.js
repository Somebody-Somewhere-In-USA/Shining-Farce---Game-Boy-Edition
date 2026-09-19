(function(G){
  "use strict";
  // No temporary gameplay balance values: callers may explicitly inject a test/balance profile.
  G.config.SPELLS={balance:{},rounding:null,counterSpellSelection:null,prayerChance:0.25,portalFlashMs:600};
  G.systems.RuleNumbers={integer(value,kind,rounding=G.config.SPELLS.rounding){
    G.campaign.Validation.assert(Number.isFinite(value)&&value>=0,"invalid "+kind);
    if(Math.abs(value-Math.round(value))<1e-9)return Math.round(value);
    G.campaign.Validation.assert(typeof rounding==="function","UNRESOLVED ROUNDING: "+kind);
    const n=rounding(value,kind);G.campaign.Validation.assert(Number.isSafeInteger(n)&&n>=0,"invalid rounded "+kind);return n;
  }};
}(window.GBTRPG));
