(function(G){
  "use strict";
  function families(entries){
    const groups=new Map();
    for(const e of entries){const key=e.spellFamily||e.abilityId;if(!groups.has(key))groups.set(key,{familyId:key,name:e.spellFamilyName||e.spellFamily||e.name,levels:[]});groups.get(key).levels.push(e);}
    for(const group of groups.values())group.levels.sort((a,b)=>(a.spellLevel||1)-(b.spellLevel||1)||a.abilityId.localeCompare(b.abilityId));
    return [...groups.values()];
  }
  function castingOptions(unit,entry,provider=()=>[]){const options=provider(unit,entry);G.campaign.Validation.assert(Array.isArray(options)&&options.every(o=>G.campaign.Validation.validId(o.id)&&o.id!=="normal")&&new Set(options.map(o=>o.id)).size===options.length,"invalid casting options");return options.length?[{id:"normal",name:"NORMAL"},...options]:[];}
  function selectMethod(options,modifierId=null){G.campaign.Validation.assert(modifierId===null||typeof modifierId==="string"&&options.some(o=>o.id===modifierId),"one available casting modifier required");return modifierId;}
  G.systems.SpellMenuSystem={families,castingOptions,selectMethod};
}(window.GBTRPG));
