(function(G){
 "use strict";
 const V=G.campaign.Validation;
 // A stack of action frames keeps parent target cursors and nested provenance intact.
 function create(){return{frames:[],history:[],waiting:null,serial:0};}
 function push(queue,action,events){const parent=queue.frames.at(-1);const frame={id:"action"+queue.serial++,parentId:parent?.id??null,action:V.clone(action),events:V.clone(events),cursor:0};queue.frames.push(frame);return frame.id;}
 function step(queue,handlers,context){if(queue.waiting)return{type:"WAITING",...queue.waiting};while(queue.frames.length){const frame=queue.frames.at(-1);if(frame.cursor>=frame.events.length){queue.frames.pop();continue;}const event=frame.events[frame.cursor++],handler=handlers[event.type];V.assert(handler,"missing combat event handler: "+event.type);const result=handler(event,frame,context)||{};queue.history.push({frameId:frame.id,parentId:frame.parentId,type:event.type,...(result.presentation?{presentation:result.presentation}:{})});if(result.wait){queue.waiting={frameId:frame.id,...result.wait};return{type:"WAITING",...queue.waiting};}if(result.reaction)push(queue,result.reaction.action,result.reaction.events);return{type:"EVENT",event,result,frameId:frame.id};}return{type:"COMPLETE"};}
 function resume(queue,action,events){V.assert(queue.waiting,"no pending combat decision");queue.waiting=null;push(queue,action,events);}
 G.systems.CombatEventQueue={create,push,step,resume};
}(window.GBTRPG));
