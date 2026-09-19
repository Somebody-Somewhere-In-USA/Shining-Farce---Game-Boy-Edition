(function(G){
 "use strict";
 const V=G.campaign.Validation;
 function definitions(document){return{...V.clone(document.world),locations:Object.fromEntries(Object.entries(document.world.locations).map(([id,l])=>[id,G.editor.LocationModel.compile(l)]))};}
 function campaign(document){const d=definitions(document),demo=V.clone(G.data.DEMO_CAMPAIGN);for(const id of Object.keys(d.polities))demo.allegiance[id]??="NEUTRAL";for(const [id,l]of Object.entries(d.locations))demo.controllers[id]??=l.settlement.enabled?l.settlement.allegiance:"NEUTRAL";V.assert(demo.squads.every(q=>d.locations[q.currentLocationId]),"authored data removes a required starting location");return new G.campaign.Campaign(d,G.campaign.CampaignState.create(d,demo));}
 function select(location,maps,context={}){const refs=location.battleMaps||[];const matching=refs.map(id=>maps[id]).filter(map=>map&&(map.conditions.controller===null||map.conditions.controller===context.controller)&&map.conditions.storyKeys.every(key=>context.story?.[key]===true));if(matching.length===1)return matching[0];if(matching.length>1&&context.choose){const selected=context.choose(matching);V.assert(matching.includes(selected),"invalid static map selection");return selected;}return{status:matching.length?"AMBIGUOUS_STATIC_MAP":"NO_APPLICABLE_STATIC_MAP"};}
 G.editor.AuthoredContent={definitions,campaign,select};
}(window.GBTRPG));
