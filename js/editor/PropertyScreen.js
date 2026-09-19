(function(G){
 "use strict";
 class PropertyScreen {
  constructor(host,title,fields,onBack){Object.assign(this,{host,title,fields,onBack});this.index=0;this.focus=null;this.error=null;}
  items(){return typeof this.fields==="function"?this.fields():this.fields;}
  update(){const a=this.host.input.consumeAction(),fields=this.items(),f=fields[this.index];if(this.error){if(a)this.error=null;return;}try{if(this.focus){if(a==="cancel"){this.focus=null;return;}if(a==="confirm"){f.set(this.focus.value);this.focus=null;return;}const dir=["up","right"].includes(a)?1:["down","left"].includes(a)?-1:0;if(dir){if(f.type==="number")this.focus.value=Math.max(f.min??0,Math.min(f.max??Number.MAX_SAFE_INTEGER,this.focus.value+dir));else{const choices=f.values;this.focus.value=choices[(choices.indexOf(this.focus.value)+dir+choices.length)%choices.length];}}return;}
   if(a==="cancel"){this.onBack();return;}if(a==="up"||a==="down"){this.index=(this.index+(a==="up"?-1:1)+fields.length)%fields.length;return;}if(a!=="confirm"||!f)return;
   if(f.type==="toggle")f.set(!f.get());else if(["number","enum"].includes(f.type))this.focus={value:f.get()};else if(f.type==="text")this.host.editText(f.label,f.get(),value=>f.set(value),this);else f.run?.();
  }catch(e){this.error=e.message;}}
  render(){const {renderer,text,ui}=this.host;renderer.clear();ui.window(renderer.ctx,0,0,480,360);text.draw(renderer.ctx,this.title,8,8,76);const fields=this.items(),start=Math.floor(this.index/24)*24;fields.slice(start,start+24).forEach((f,n)=>{const index=start+n,value=this.focus&&index===this.index?this.focus.value:f.get?.(),label=f.label+(value!==undefined?": "+(typeof value==="boolean"?(value?"YES":"NO"):value):"");if(index===this.index){renderer.ctx.fillStyle=G.config.PALETTE.dark;renderer.ctx.fillRect(6,30+n*12,468,1);text.draw(renderer.ctx,this.focus?"*":">",8,32+n*12,1);}text.draw(renderer.ctx,label,20,32+n*12,73);});text.draw(renderer.ctx,this.focus?"EDITING / DIRECTIONS CHANGE / ACCEPT COMMIT / CANCEL RESTORE":"DIRECTIONS NAVIGATE / ACCEPT SELECT / CANCEL BACK",8,338,76);if(this.error){ui.window(renderer.ctx,12,120,456,110);text.draw(renderer.ctx,text.wrap(this.error,70).join("\n"),20,132,70);}}
 }
 G.editor.PropertyScreen=PropertyScreen;
}(window.GBTRPG));
