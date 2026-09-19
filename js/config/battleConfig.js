(function(G){
 "use strict";
 G.config.BATTLE={ctThreshold:1000,ctCarryover:"PRESERVE_OVERSHOOT",timelineSlots:16,minimumWidth:30,minimumHeight:30,
  deploymentDefaults:{mage:"BACK",archer:"BACK",cleric:"BACK",thief:"BACK",fighter:"FRONT",knight:"FRONT",paladin:"FRONT"},
  actions:{ATTACK:{economy:"MAJOR",presentation:"SCENE"},SKILLS:{economy:"MAJOR",presentation:"SCENE"},MAGIC:{economy:"MAJOR",presentation:"SCENE"},STEAL:{economy:"MAJOR",presentation:"SCENE"},ITEM:{economy:"MAJOR",presentation:"SCENE"},EQUIP:{economy:"MAJOR",presentation:"MAP"},STANCE:{economy:"MAJOR",presentation:"MAP"},SCROUNGE:{economy:"MAJOR",presentation:"MAP"},MOVE:{economy:"MINOR",presentation:"MAP"},TRADE:{economy:"MINOR",presentation:"MAP"},"ENTER PORTAL":{economy:"MINOR",presentation:"MAP"},ESCAPE:{economy:"MINOR",presentation:"MAP"}},
  sceneTiming:{black:100,entrance:350,idle:1000,action:250,pan:180,effect:250,result:2500,exit:250}};
}(window.GBTRPG));

