(function(G){
  "use strict";
  const V=G.campaign.Validation;
  class TargetingSystem {
    static distance(a,b){return Math.abs(a.x-b.x)+Math.abs(a.y-b.y);}
    static diamond(center,distance){V.assert(Number.isInteger(distance)&&distance>=0,"invalid diamond distance");const out=[];for(let y=-distance;y<=distance;y++)for(let x=-(distance-Math.abs(y));x<=distance-Math.abs(y);x++)out.push({x:center.x+x,y:center.y+y});return out;}
    static affectedTiles(target,radius){V.assert(Number.isInteger(radius)&&radius>=1,"effect radius unresolved");return this.diamond(target,radius-1);}
    static targetTiles(caster,range,inBounds=()=>true){V.assert(Number.isInteger(range)&&range>=0,"casting range unresolved");return this.diamond(caster,range).filter(p=>inBounds(p.x,p.y));}
    static unitAllowed(caster,target,spell){
      if(!G.systems.BattleStatusSystem.active(caster))return false;const life=target.tactical?.life||"ALIVE";if(!["ALIVE","DYING"].includes(life)||target.status&&target.status!=="ACTIVE")return false;
      if(life==="DYING"&&!(spell.canTargetDying&&spell.effect==="RAISE"))return false;
      if(spell.effect==="RAISE"&&life!=="DYING")return false;
      if(caster.id===target.id&&!spell.canTargetCaster)return false;
      return spell.targetAllegiances.includes(caster.faction===target.faction?"FRIENDLY":"ENEMY");
    }
    static ordered(units,positions,center){const angle=p=>(Math.atan2(p.x-center.x,center.y-p.y)+2*Math.PI)%(2*Math.PI);return [...units].sort((a,b)=>this.distance(positions[a.id],center)-this.distance(positions[b.id],center)||angle(positions[a.id])-angle(positions[b.id])||positions[a.id].y-positions[b.id].y||positions[a.id].x-positions[b.id].x||a.id.localeCompare(b.id));}
    static affectedUnits(world,caster,spell,target){const tiles=this.affectedTiles(target,spell.effectRadius);const area=spell.effectRadius>1?{...spell,targetAllegiances:spell.areaAllegiances||spell.targetAllegiances,canTargetCaster:spell.areaCanTargetCaster??spell.canTargetCaster}:spell;return this.ordered(Object.values(world.units).filter(u=>world.positions[u.id]&&tiles.some(p=>this.distance(p,world.positions[u.id])===0)&&this.unitAllowed(caster,u,area)&&!(spell.dealsDamage&&spell.effectRadius>1&&caster.faction===u.faction&&G.campaign.AbilityLoadoutSystem.effects(u,"friendlyOffensiveAreaImmunity").length)),world.positions,target);}
  }
  G.systems.TargetingSystem=TargetingSystem;
}(window.GBTRPG));
