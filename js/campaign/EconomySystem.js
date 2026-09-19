(function (G) {
  "use strict";
  const V=G.campaign.Validation;
  function income(d,s,id){if(d.locations[id].settlement?.enabled===false)return 0;return Math.floor((d.locations[id].economy?.dailyIncomeG||0)*(s.locations[id].recovery?.incomeMultiplier??1));}
  function expected(d,s,faction){return Object.keys(d.locations).filter(id=>s.locations[id].controller===faction).reduce((sum,id)=>sum+income(d,s,id),0);}
  function change(s,faction,amount,events,reason){if(amount<0)amount=-G.core.DeveloperRuntime.costG(-amount);V.assert(Number.isSafeInteger(amount)&&s.treasuries[faction]+amount>=0,"insufficient G or invalid amount");s.treasuries[faction]+=amount;events.push({type:"TREASURY_CHANGED",faction,amount,balance:s.treasuries[faction],reason});}
  function collect(d,s,events){const totals={PLAYER:0,ZEON:0};for(const id of Object.keys(d.locations).sort()){
    const f=s.locations[id].controller,g=income(d,s,id);if(f!=="NEUTRAL"&&g){change(s,f,g,events,"LOCATION_INCOME");totals[f]+=g;events.push({type:"LOCATION_INCOME_COLLECTED",locationId:id,faction:f,amount:g});}
  }return totals;}
  function available(d,s,locationId){if(d.locations[locationId].settlement?.enabled===false||s.locations[locationId]?.controller!=="PLAYER")return[];const tiers=d.locations[locationId].economy?.shops||{};return Object.values(G.data.ITEMS).filter(i=>(tiers[i.category]||0)>=i.shopTier);}
  function price(item){return G.core.DeveloperRuntime.costG(Math.ceil(item.priceG*G.config.RESOURCES.shopPriceMultiplier));}
  function purchase(d,s,locationId,definitionId,events){const item=available(d,s,locationId).find(i=>i.id===definitionId);V.assert(item,"shop access or item tier unavailable");change(s,"PLAYER",-price(item),events,"PURCHASE");const id="item"+s.nextItemId++;s.itemInstances[id]={id,definitionId,ownerFaction:"PLAYER",state:"AVAILABLE",place:{type:"LOCATION",id:locationId},assignedUnitId:null};events.push({type:"ITEM_PURCHASED",itemId:id,locationId,definitionId});return id;}
  G.campaign.EconomySystem={income,expected,change,collect,available,price,purchase};
}(window.GBTRPG));
