(function (G) {
  "use strict";
  class Game {
    constructor(canvas, statusElement) {
      this.canvas = canvas; this.statusElement = statusElement;
      this.assets = new G.core.Assets(G.data.ASSET_MANIFEST);
      this.input = new G.core.Input(); this.states = new G.core.GameStateManager();
      this.lastTime = 0; this.loop = this.loop.bind(this);
    }
    async start() {
      document.documentElement.style.setProperty("--clear-color", G.config.PALETTE.background);
      this.renderer = new G.rendering.Renderer(this.canvas, this.assets);
      await this.assets.loadAll();
      this.text = new G.rendering.PixelTextRenderer(this.assets);
      this.ui = new G.rendering.CampaignUIRenderer(this.assets, this.text);
      this.resetCurrent();
      this.developer = new G.editor.DeveloperShell(this);
      this.input.start(); this.canvas.focus();
      this.statusElement.textContent = "Ready. Arrows move the map cursor, Enter selects, Q cycles squads, M opens the campaign menu.";
      this.running = true; requestAnimationFrame(this.loop);
    }
    resetCurrent(){
      G.core.DeveloperRuntime.reset();
      this.authoredContent=G.data.AUTHORED_MAPS.assemble(G.campaign.createDemo(),G.data.AUTHORED_CONTENT,true);
      if(this.authoredContent){this.campaign=G.editor.AuthoredContent.campaign(this.authoredContent);G.data.WORLD_VISUALS=G.campaign.Validation.freeze(G.campaign.Validation.clone(this.authoredContent.visuals));this.battleProviders={staticMaps:this.authoredContent.battleMaps};}
      else this.campaign=G.campaign.createDemo();
      this.campaignMap=new G.states.CampaignMapState({campaign:this.campaign,renderer:this.renderer,input:this.input,text:this.text,ui:this.ui,managedDeveloperLayer:true,openOptions:()=>this.developer.controls(),worldRenderer:new G.rendering.WorldMapRenderer(this.assets,this.text,this.ui),openBattleFoundation:()=>this.openBattleFoundation(),openSpellLab:()=>this.openSpellLab(),openTactical:()=>this.openTactical(),openEndDay:()=>this.openEndDay()});
      this.states.change(this.campaignMap);if(this.developer?.document)this.developer.document.campaign=this.campaign;
    }
    openBattleFoundation(){this.states.change(new G.states.BattleMapState({renderer:this.renderer,assets:this.assets,text:this.text,ui:this.ui,input:this.input,onReturn:()=>this.states.change(this.campaignMap)}));}
    openSpellLab(){this.states.change(new G.states.SpellLabState({renderer:this.renderer,assets:this.assets,text:this.text,ui:this.ui,input:this.input,onReturn:()=>this.states.change(this.campaignMap)}));}
    openEndDay() {
      const endDay=new G.states.EndDayState({ managedDeveloperLayer:true,campaign:this.campaign,renderer:this.renderer,input:this.input,text:this.text,ui:this.ui,
        openBattle:scenario=>{const prepared=G.systems.BattleInitializationSystem.prepare(scenario,this.campaign.definitions,{...this.battleProviders,campaignState:this.campaign.state});G.campaign.Validation.assert(prepared.status==="READY",prepared.status);
          const battleMap=new G.states.BattleMapState({fixture:prepared,rules:this.battleRules||{},renderer:this.renderer,assets:this.assets,text:this.text,ui:this.ui,input:this.input,onReturn:()=>{if(battleMap.battle.state.presentation.phase==="BANNER"&&["PLAYER","ZEON"].includes(battleMap.battle.state.presentation.pendingWinner))this.campaign.applyBattleResult(battleMap.battle.result());this.states.change(endDay);}});this.states.change(battleMap);},
        onReturn:()=>this.states.change(this.campaignMap)});
      this.states.change(endDay);
    }
    openTactical() {
      const terrainSystem = new G.systems.TerrainSystem(G.data.TERRAIN);
      const tactical = new G.states.ExplorationState({
        input: this.input, renderer: this.renderer, mapRenderer: new G.rendering.MapRenderer(this.assets, terrainSystem),
        unitRenderer: new G.rendering.UnitRenderer(this.assets), movementSystem: new G.systems.MovementSystem(terrainSystem),
        map: G.data.TEST_MAP, hero: new G.entities.Character(G.data.CHARACTERS.hero),
        returnToCampaign: () => this.states.change(this.campaignMap)
      });
      // This isolated legacy movement test has no access to campaign simulation.
      this.states.change(tactical);
    }
    loop(time) {
      if (!this.running) return;
      const deltaMs = this.lastTime ? Math.min(time - this.lastTime, 100) : 0;
      this.lastTime = time; this.input.pollGamepads(deltaMs); const overlay=this.developer.update(deltaMs); if(!overlay)this.states.update(deltaMs); if(this.developer.overlay||this.developer.terminal)this.developer.render();else this.states.render();
      requestAnimationFrame(this.loop);
    }
  }
  G.core.Game = Game;
}(window.GBTRPG));
