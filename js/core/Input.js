(function(G){
 "use strict";
 const keyboard={up:["ArrowUp","KeyW"],down:["ArrowDown","KeyS"],left:["ArrowLeft","KeyA"],right:["ArrowRight","KeyD"],confirm:["Enter","Space","KeyZ"],cancel:["Escape","Backspace","KeyX"],menu:["Tab","KeyM"],start:["KeyP"],select:["KeyQ"],terminal:["Backquote"],devmenu:["BracketRight"],presentation:["KeyH"]};
 const buttons={up:[12],down:[13],left:[14],right:[15],confirm:[0],cancel:[1],menu:[7],start:[9],select:[4],terminal:[8],devmenu:[5],presentation:[]},directions=["up","down","left","right"],required=[...directions,"confirm","cancel","menu"];
 const clone=v=>JSON.parse(JSON.stringify(v));
 class Input {
  static label(action){return action==="presentation"?"CYCLE PRESENTATION SIZE":action.toUpperCase();}
  static upgrade(profile){const next=clone(profile);if(next?.version===1&&next.keyboard&&next.buttons){if(!Object.hasOwn(next.keyboard,"presentation"))next.keyboard.presentation=Object.values(next.keyboard).some(c=>Array.isArray(c)&&c.includes("KeyH"))?[]:["KeyH"];if(!Object.hasOwn(next.buttons,"presentation"))next.buttons.presentation=[];}return next;}
  static defaults(){return{version:1,keyboard:clone(keyboard),buttons:clone(buttons)};}
  static validate(profile){if(profile?.version!==1)throw Error("Unsupported controls profile");for(const source of ["keyboard","buttons"]){const seen=new Set();for(const action of Object.keys(keyboard)){const codes=profile[source]?.[action];if(!Array.isArray(codes)||required.includes(action)&&!codes.length)throw Error("Required navigation binding missing");for(const code of codes){if(source==="buttons"?(!Number.isInteger(code)||code<0||code>31):(typeof code!=="string"||!(/^(Key[A-Z]|Digit[0-9]|Arrow(Up|Down|Left|Right)|F([1-9]|1[0-2])|Enter|Space|Escape|Backspace|Tab|Backquote|BracketLeft|BracketRight|Comma|Period|Slash|Semicolon|Quote|Minus|Equal|Backslash|Home|End|PageUp|PageDown|Delete|Insert)$/.test(code))))throw Error("Unsupported binding");if(seen.has(code))throw Error("Conflicting input assignments");seen.add(code);}}}return true;}
  constructor(bindings=null,store=new G.core.LocalStore()){
   this.store=store;this.profile=Input.defaults();const saved=store.read("controls.v1");if(saved)try{const upgraded=Input.upgrade(saved);Input.validate(upgraded);this.profile=upgraded;}catch(e){this.notice="INVALID SAVED CONTROLS - DEFAULTS RESTORED";}
   if(bindings){this.profile.keyboard={...this.profile.keyboard,...clone(bindings)};Input.validate(this.profile);}this.bindings=this.profile.keyboard;this.queue=[];this.held={};this.textHandler=null;this.capture=null;this.time=0;this.sources=new Map();this.pressOrder=0;this.focused=true;for(const name of ["onKeyDown","onKeyUp","onBlur","onFocus"])this[name]=this[name].bind(this);
  }
  start(){for(const [event,method]of [['keydown','onKeyDown'],['keyup','onKeyUp'],['blur','onBlur'],['focus','onFocus']])window.addEventListener(event,this[method]);}
  stop(){for(const [event,method]of [['keydown','onKeyDown'],['keyup','onKeyUp'],['blur','onBlur'],['focus','onFocus']])window.removeEventListener(event,this[method]);this.releaseAll();}
  releaseAll(){this.sources.clear();this.held={};this.clear();}
  onBlur(){this.focused=false;this.releaseAll();}
  onFocus(){this.focused=true;}
  get activeDirection(){if(this.textHandler||this.capture)return null;let latest=null;for(const held of this.sources.values())if(directions.includes(held.action)&&(!latest||held.order>latest.order))latest=held;return latest?.action||null;}
  isHeld(action){return !this.textHandler&&!this.capture&&[...this.sources.values()].some(s=>s.action===action);}
  hold(code,action,fresh=false){if(fresh||!this.sources.has(code))this.sources.set(code,{action,order:++this.pressOrder});}
  pruneDirections(){const direction=this.activeDirection;if(direction)this.queue=this.queue.filter(action=>!directions.includes(action)||action===direction);}
  physicalAction(action,repeat=false){if(this.capture||this.textHandler&&action!=="terminal")return;if(directions.includes(action)&&action!==this.activeDirection)return;this.enqueueAction(action,{repeat});}
  onKeyUp(event){const before=this.activeDirection;this.sources.delete('key:'+event.code);if(before!==this.activeDirection)this.pruneDirections();if(before!==this.activeDirection&&this.activeDirection)this.physicalAction(this.activeDirection);}

  actionFor(source,code){return Object.keys(keyboard).find(action=>this.profile[source][action].includes(code));}
  onKeyDown(event){if(event.ctrlKey||event.altKey||event.metaKey)return;if(this.capture){event.preventDefault();if(!event.repeat)this.capture("keyboard",event.code);return;}const action=this.actionFor("keyboard",event.code);if(this.textHandler&&action!=="terminal"){event.preventDefault();this.textHandler(event);return;}if(action){event.preventDefault();this.hold("key:"+event.code,action,!event.repeat);if(directions.includes(action))this.pruneDirections();this.physicalAction(action,event.repeat);}}
  remap(source,action,code,resolve=false){if(!["keyboard","buttons"].includes(source)||!Object.hasOwn(keyboard,action))throw Error("Invalid mapping target");const other=this.actionFor(source,code);if(other===action)return{status:"UNCHANGED"};if(other&&!resolve)return{status:"CONFLICT",other};const next=clone(this.profile),old=next[source][action][0];if(other){next[source][other]=next[source][other].filter(c=>c!==code);if(!next[source][other].length&&old!==undefined)next[source][other].push(old);}next[source][action]=[code];Input.validate(next);this.profile=next;this.bindings=next.keyboard;this.releaseAll();const saved=this.store.write("controls.v1",next);return{status:"MAPPED",saved};}
  restoreDefaults(){this.profile=Input.defaults();this.bindings=this.profile.keyboard;this.releaseAll();return this.store.write("controls.v1",this.profile);}
  pollGamepads(ms=16,pads){this.time+=ms;if(!this.focused)return;const before=this.activeDirection;this.polledActions=new Set();this.physicalEvents=[];const active=new Set();try{pads=pads??window.navigator?.getGamepads?.()??[];}catch{pads=[];}
   for(const pad of Array.from(pads).filter(Boolean)){if(pad.mapping&&pad.mapping!=="standard")continue;for(let n=0;n<pad.buttons.length;n++){const b=pad.buttons[n],pressed=typeof b==="number"?b>.5:b?.pressed||b?.value>.5;if(pressed){const code="pad"+pad.index+":"+n;if(this.capture&&!this.held[code]){this.capture("buttons",n);active.add(code);this.held[code]={next:Infinity};continue;}const action=this.actionFor("buttons",n);if(action)this.gamepadAction(code,action,active);}}
    if(!this.capture)for(const [axis,negative,positive]of [[0,"left","right"],[1,"up","down"]]){const value=pad.axes?.[axis]||0;if(Math.abs(value)>=.55)this.gamepadAction("axis"+pad.index+":"+axis+(value<0?"-":"+"),value<0?negative:positive,active);}}
   for(const code of Object.keys(this.held))if(!active.has(code)){delete this.held[code];this.sources.delete(code);}
   if(before!==this.activeDirection||this.physicalEvents.some(e=>directions.includes(e.action)))this.pruneDirections();for(const {action,repeat}of this.physicalEvents)this.physicalAction(action,repeat);
   if(before!==this.activeDirection&&this.activeDirection&&!this.physicalEvents.some(e=>e.action===this.activeDirection))this.physicalAction(this.activeDirection);
  }
  gamepadAction(code,action,active){active.add(code);const held=this.held[code];if(!this.capture&&!this.textHandler)this.hold(code,action);else this.sources.delete(code);if(!held){if(!this.polledActions.has(action))this.physicalEvents.push({action,repeat:false});this.polledActions.add(action);this.held[code]={next:this.time+350};}else if(directions.includes(action)&&this.time>=held.next){if(!this.polledActions.has(action))this.physicalEvents.push({action,repeat:true});this.polledActions.add(action);held.next=this.time+110;}}
  enqueueAction(action,{repeat=false}={}){if(action==="accept")action="confirm";if(!Object.hasOwn(keyboard,action))throw Error("Unknown input action: "+action);if(repeat&&!directions.includes(action))return;if(this.queue.length<32)this.queue.push(action);}
  clear(){this.queue.length=0;}
  consumeAction(){return this.queue.shift()||null;}
 }
 G.core.Input=Input;
}(window.GBTRPG));
