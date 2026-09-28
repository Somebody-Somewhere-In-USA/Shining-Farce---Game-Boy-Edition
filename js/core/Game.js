(function (G) {
  "use strict";
  class Game {
    constructor(canvas, statusElement) {
      this.canvas = canvas; this.statusElement = statusElement;
      this.assets = new G.core.Assets(G.data.ASSET_MANIFEST);
      this.input = new G.core.Input(); this.displayPalette=new G.rendering.DisplayPalette(this.input.store); this.states = new G.core.GameStateManager();
      this.lastTime = 0; this.loop = this.loop.bind(this);
    }
    async start() {
      this.renderer = new G.rendering.Renderer(this.canvas, this.assets);
      this.displayPalette.attach(this.renderer.canvas);
      this.presentation=new G.rendering.PresentationShell(this.renderer,this.displayPalette,this.input);
      this.gameAudio=new G.core.GameAudio();this.power=new G.rendering.PowerPresentation(this);this.power.prepareStartup();
      await Promise.all([this.assets.loadAll(),this.presentation.loadAll(),this.power.loadAll()]);
      this.text = new G.rendering.PixelTextRenderer(this.assets);
      this.ui = new G.rendering.CampaignUIRenderer(this.assets, this.text);
      this.resetCurrent();
      this.developer = new G.editor.DeveloperShell(this);
      this.input.start(); this.canvas.focus();this.power.startInitial();
      this.statusElement.textContent = this.displayPalette.notice || "Ready. Arrows move the map cursor, Enter selects, Select changes display palette (or cycles stacked squads), M opens the campaign menu. H cycles presentation size (remappable).";
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
    handlePresentationSize(){if(this.power?.blocked)return false;if(this.input.queue[0]!=="presentation"||this.input.textHandler||this.input.capture||this.developer?.terminal)return false;this.input.consumeAction();const size=this.displayPalette.cycleSize();this.statusElement.textContent=this.displayPalette.notice||("PRESENTATION: "+G.config.PRESENTATION_MODES.find(m=>m.id===size).label);return true;}
    handleDisplaySelect(){if(this.power?.blocked)return false;if(this.input.queue[0]!=="select"||this.input.textHandler||this.input.capture||this.developer?.overlay||this.developer?.terminal||!this.states.current?.displayPaletteSelectAllowed?.())return false;this.input.consumeAction();const palette=this.displayPalette.cycle();this.statusElement.textContent=this.displayPalette.notice||("DISPLAY PALETTE: "+palette.name);return true;}
    step(deltaMs,elapsed=deltaMs){
      this.input.pollGamepads(deltaMs); this.presentation?.update(elapsed);
      if(this.power?.blocked){try{this.power.update(elapsed);if(this.power.blocked)this.power.render();else if(this.developer.overlay||this.developer.terminal)this.developer.render();else this.states.render();}catch(error){this.power.abort(error);}return;}
      this.handlePresentationSize(); const overlay=this.developer.update(deltaMs); if(!overlay){this.handleDisplaySelect();this.states.update(deltaMs);} if(this.developer.overlay||this.developer.terminal)this.developer.render();else this.states.render();
    }
    loop(time) {
      if (!this.running) return;
      const elapsed=this.lastTime?Math.max(0,time-this.lastTime):0,deltaMs=Math.min(elapsed,100);
      this.lastTime=time;this.step(deltaMs,elapsed);
      requestAnimationFrame(this.loop);
    }
  }
  G.core.Game = Game;
}(window.GBTRPG));
