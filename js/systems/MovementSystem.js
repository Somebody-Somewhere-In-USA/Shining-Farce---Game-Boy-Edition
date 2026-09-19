(function (G) {
  "use strict";

  class MovementSystem {
    constructor(terrainSystem) {
      this.terrainSystem = terrainSystem;
    }

    canEnter(map, x, y) {
      if (x < 0 || y < 0 || x >= map.width || y >= map.height) {
        return false;
      }

      return this.terrainSystem.isPassable(map.tiles[y][x]);
    }

    tryMove(unit, map, dx, dy) {
      const nextX = unit.x + dx;
      const nextY = unit.y + dy;

      if (!this.canEnter(map, nextX, nextY)) return false;

      unit.x = nextX;
      unit.y = nextY;
      return true;
    }
    tryTacticalPath(unit,map,position,turn,steps,occupant=()=>null) {
      return G.systems.TacticalMovementRules.traverse(unit,position,turn,steps,{inBounds:(x,y)=>x>=0&&y>=0&&x<map.width&&y<map.height,canEnter:(x,y)=>this.canEnter(map,x,y),occupant});
    }
  }

  G.systems.MovementSystem = MovementSystem;
}(window.GBTRPG));
