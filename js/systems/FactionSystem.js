(function(G){
 "use strict";
 G.data.COMBAT_FACTIONS={PLAYER:{name:"PLAYER"},ZEON:{name:"ZEON"},WILDERNESS:{name:"WILDERNESS"}};
 G.systems.FactionSystem={hostile(a,b){return!!G.data.COMBAT_FACTIONS[a]&&!!G.data.COMBAT_FACTIONS[b]&&a!==b;}};
}(window.GBTRPG));
