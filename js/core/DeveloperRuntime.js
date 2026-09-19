(function(G){
 "use strict";
 G.core.DeveloperRuntime={godmode:false,greedisgood:false,devmode:false,
  protected(unit){return this.godmode&&unit?.faction==="PLAYER";},
  costG(price){if(!Number.isSafeInteger(price)||price<0)throw Error("invalid G cost");return this.greedisgood?0:price;},
  execute(text){const words=text.trim().toLowerCase().split(/\s+/),key=words[0];if(words.length!==1||!["godmode","greedisgood","devmode"].includes(key))return"UNKNOWN COMMAND / GODMODE GREEDISGOOD DEVMODE";this[key]=!this[key];return key.toUpperCase()+" "+(this[key]?"ENABLED":"DISABLED");},
  reset(){this.godmode=false;this.greedisgood=false;this.devmode=false;}
 };
}(window.GBTRPG));
