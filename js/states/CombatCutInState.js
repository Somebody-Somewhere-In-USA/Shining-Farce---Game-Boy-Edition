(function(G){
  "use strict";
  class CombatCutInState {
    constructor({animation,draw=()=>{},onComplete=()=>{}}={}){this.player=new G.rendering.AnimationPlayer();this.draw=draw;this.onComplete=onComplete;this.completed=false;if(animation)this.player.play(animation);}
    enter() {}
    update(ms){if(this.completed)return;this.player.update(ms);if(this.player.finished){this.completed=true;this.onComplete();}}
    render(){this.draw(this.player.frameIndex);}
    exit() {}
  }
  G.states.CombatCutInState=CombatCutInState;
}(window.GBTRPG));
