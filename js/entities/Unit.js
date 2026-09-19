(function (G) {
  "use strict";

  class Unit {
    constructor(data) {
      this.id = data.id;
      this.name = data.name;
      this.team = data.team;
      this.classId = data.classId;
      this.characterModel = G.campaign.CharacterGrowthSystem.simulateRecruitGrowth({raceId:data.raceId,characterLevel:data.characterLevel,currentClassId:data.classId,seed:data.growthSeed});
      this.characterLevel = this.characterModel.characterLevel;
      this.xp = data.xp;
      this.x = data.position.x;
      this.y = data.position.y;
      // Transient tactical resources. Re-derivation must pass this.stats to preserve damage/MP use.
      this.stats = { ...G.campaign.BattleStatAdapter.snapshot(this.characterModel,[],data.currentResources) };
      this.mapAssetId = data.mapAssetId;
      this.animationSet = data.animationSet;
      this.equipment = {};
      this.statusEffects = [];
    }
    refreshDerivedStats(equipmentDefinitions = [], context = {}) {
      this.stats = { ...G.campaign.BattleStatAdapter.snapshot(this.characterModel,equipmentDefinitions,this.stats,context) };
      this.characterLevel = this.characterModel.characterLevel;
    }
  }

  G.entities.Unit = Unit;
}(window.GBTRPG));
