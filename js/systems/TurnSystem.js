(function (G) {
  "use strict";

  class TurnSystem {
    static start(mov){G.campaign.Validation.assert(Number.isSafeInteger(mov)&&mov>=0,"invalid MOV budget");return{effectiveMov:mov,movSpent:0,majorBudget:1,majorSpent:0,remainingMov:mov,tilesMoved:0,majorUsed:false,ended:false,attacked:false,movementLocked:false,usedCommands:[],pendingStep:null};}
    static metadata(command,ability=null,policy={}){const base=G.config.BATTLE.actions[command]||(command.endsWith("STANCE")?G.config.BATTLE.actions.STANCE:G.config.BATTLE.actions.SKILLS);let economy=ability?.majorAction===false?"MINOR":base.economy;if(command==="ITEM"&&policy.itemOutsideMajor===true&&!ability)economy="MINOR";if(command==="TRADE"&&policy.tradeMajorAction!==undefined)economy=policy.tradeMajorAction?"MAJOR":"MINOR";return{economy,presentation:ability?.presentation||base.presentation};}
    static consumesMajor(command,ability=null,policy={}){return this.metadata(command,ability,policy).economy==="MAJOR";}
    static availability(turn,command,ability=null,policy={}){
      if(turn.escapeRequired)return{allowed:false,reason:"ESCAPE ILLEGAL TERRAIN FIRST"};
      if(turn.incapacitated)return{allowed:false,reason:"DYING OR DEAD"};
      if(turn.ended)return{allowed:false,reason:"TURN ENDED"};
      const major=this.consumesMajor(command,ability,policy);
      if(major===null)return{allowed:false,reason:"ACTION ECONOMY UNRESOLVED"};
      if(major&&(turn.majorSpent??Number(turn.majorUsed))>=(turn.majorBudget??1))return{allowed:false,reason:"MAJOR ACTION ALREADY USED"};
      if(command==="EQUIP"&&turn.usedCommands.includes("EQUIP"))return{allowed:false,reason:"ONE EQUIP PER TURN"};
      if(ability?.effect.oncePerTurn&&turn.usedCommands.includes(ability.id))return{allowed:false,reason:"ONCE PER TURN"};
      return{allowed:true,reason:null};
    }
    static consume(turn,command,ability=null,policy={}){const result=this.availability(turn,command,ability,policy);G.campaign.Validation.assert(result.allowed,result.reason);if(this.consumesMajor(command,ability,policy)){turn.majorSpent=(turn.majorSpent||0)+1;turn.majorUsed=turn.majorSpent>=(turn.majorBudget??1);}turn.usedCommands.push(ability?.id||command);if(command==="ATTACK")turn.attacked=true;}
    static end(turn){turn.ended=true;return{tilesMoved:turn.tilesMoved};}
  }

  G.systems.TurnSystem = TurnSystem;
}(window.GBTRPG));
