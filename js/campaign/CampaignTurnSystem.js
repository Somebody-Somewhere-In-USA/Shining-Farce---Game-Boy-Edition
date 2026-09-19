(function (G) {
  "use strict";
  G.campaign.CampaignTurnSystem = {
    advance(s, events) {
      G.campaign.Validation.assert(s.phase === "DAY_ADVANCE" && s.resolution?.worldUpdated && !s.resolution.dayAdvanced, "day advances only after complete End Day resolution");
      const previousDay = s.day;
      s.day += 1;
      events.push({ type: "DAY_ADVANCED", previousDay, day: s.day });
    }
  };
}(window.GBTRPG));
