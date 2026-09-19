(function (G) {
  "use strict";
  // Provisional compatibility provider: no class growth/MOV balance is invented.
  // Future class data replaces this provider, without reconstructing past growth.
  G.campaign.LegacyRecruitGrowthProvider={getGrowth:id=>id==="mage"?{}:G.campaign.ClassGrowthProvider.getGrowth(id)};
  G.campaign.ClassGrowthProvider = {
    getGrowth(classId) { return G.data.CLASSES[classId]?.growth ?? G.config.CLASSES.unresolvedGrowthFallback; },
    getMovementModifier(classId) { return G.data.CLASSES[classId]?.movModifier ?? G.config.CLASSES.unresolvedMovementFallback; }
  };
}(window.GBTRPG));
