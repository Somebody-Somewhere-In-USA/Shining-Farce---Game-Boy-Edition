(function(G){
 "use strict";
 // Isolated test content: these dimensions, approach, balance and AI are not production rules.
 function map(width=30,height=30){const tiles=Array.from({length:height},(_,y)=>Array.from({length:width},(_,x)=>x===Math.floor(width/2)?"road":y===Math.floor(height/2)&&x<5?"river":x===4&&y>7&&y<14?"impassableTree":"grassland"));return{id:"testBattleMap",testOnly:true,width,height,tiles,deployment:Object.fromEntries(["NORTH","SOUTH","EAST","WEST"].map(s=>[s,{frontDepth:3,backDepth:2}]))};}
 function create(axis="NORTH",width=30,height=30){const f=G.data.SpellLabScenario.create(),board=map(width,height),opposite=G.systems.DeploymentSystem.opposite[axis],orientation={PLAYER:axis,ZEON:opposite},deployment=G.systems.DeploymentSystem.assign(board,f.scenario.participants,orientation,{labWizard:"BACK",labEnemy:"BACK"},77);f.scenario.positions=deployment.positions;return{...f,map:board,deployment,orientation};}
 function attack(s,id,targetId,context){const T=G.systems.TargetingSystem,B=G.systems.BattleStatusSystem,target=s.units[targetId];G.campaign.Validation.assert(B.active(target)&&target.faction!==s.units[id].faction&&T.distance(s.positions[id],s.positions[targetId])===1,"TEST ATTACK REQUIRES ADJACENT ENEMY");const before={hp:target.tactical.hp},reactions=[],out=B.damage(s,targetId,20,{...context,emitReaction:r=>reactions.push(r)});return{executed:true,successful:true,before,after:{hp:out.hp,life:out.life},reactions};}
 function choose(snapshot,candidates){return candidates.find(a=>a.command==="ATTACK")||candidates.find(a=>a.command==="MOVE")||candidates.find(a=>a.command==="END TURN");}
 G.data.BattleFoundationFixture={map,create,attack,choose};
}(window.GBTRPG));
