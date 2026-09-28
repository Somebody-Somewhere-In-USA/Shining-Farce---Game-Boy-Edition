(function(G){
 "use strict";
 const shells=G.config.PRESENTATION_SHELLS;
 const manifest=Object.fromEntries(Object.entries(shells).flatMap(([size,shell])=>shell.components.flatMap(c=>[[size+':'+c.id+':normal',c.normal],...Object.entries(c.states).map(([state,path])=>[size+':'+c.id+':'+state,path])])));
 class PresentationShell {
  static get manifest(){return manifest;}
  constructor(renderer,display,input,dom=window.document){
   Object.assign(this,{renderer,display,input});this.canvas=renderer.canvas;this.size=display.presentationSize;this.powered=true;this.wheelElapsed=null;this.nodes=new Map();this.assets=new G.core.Assets(manifest);
   if(dom?.createElement&&this.canvas.parentNode){
    this.root=dom.createElement('div');this.root.id='game-presentation';this.canvas.parentNode.insertBefore(this.root,this.canvas);
    this.art=dom.createElement('div');this.art.className='game-boy-art';this.art.setAttribute('aria-hidden','true');this.root.appendChild(this.art);this.powerButton=dom.createElement('button');this.powerButton.className='game-boy-power';this.powerButton.type='button';this.powerButton.tabIndex=-1;this.powerButton.setAttribute('aria-label','Game Boy power switch');this.powerButton.onclick=event=>{event.preventDefault();this.onPower?.();this.canvas.focus?.();};Object.assign(this.powerButton.style,{left:G.config.POWER_SWITCH.x+'px',top:G.config.POWER_SWITCH.y+'px',width:G.config.POWER_SWITCH.width+'px',height:G.config.POWER_SWITCH.height+'px'});this.root.appendChild(this.powerButton);this.root.appendChild(this.canvas);
    for(const c of shells[1].components){const node=dom.createElement('img');node.alt='';node.draggable=false;node.dataset.slot=c.id;this.art.appendChild(node);this.nodes.set(c.id,node);}
   }
   this.renderer.onDisplayResize=(width,height)=>{if(this.size===3&&this.root){this.root.style.width=width+'px';this.root.style.height=height+'px';}};
   this.unsubscribe=display.subscribe(change=>{if(change.sizeChanged)this.setSize(display.presentationSize);if(change.paletteChanged){this.wheelElapsed=this.size===3?null:0;this.render();}});
   this.setSize(this.size);
  }
  async loadAll(){await this.assets.loadAll();for(const [size,shell]of Object.entries(shells))for(const c of shell.components)for(const state of ['normal',...Object.keys(c.states)]){const image=this.assets.getImage(size+':'+c.id+':'+state);if(image.width!==c.width||image.height!==c.height)throw Error('Shell component dimensions differ: '+size+'/'+c.id+'/'+state);}}
  setSize(size){
   const mode=G.config.PRESENTATION_MODES.find(m=>m.id===size);if(!mode)throw Error('Unknown presentation mode');
   if(size===3||this.size===3)this.wheelElapsed=null;this.size=size;this.mode=mode;const shell=shells[mode.shell],screen=mode.screen||{x:0,y:0};
   this.canvas.style.imageRendering=mode.sampling;this.canvas.style.left=screen.x+'px';this.canvas.style.top=screen.y+'px';
   if(this.root){this.art.hidden=!shell;this.powerButton.hidden=!shell;if(shell){this.root.style.width=shell.width+'px';this.root.style.height=shell.height+'px';}}
   if(shell)this.renderer.setDisplaySize(screen.width,screen.height);else this.renderer.setResponsiveDisplay();
   this.render();
  }
  setPower(powered,transition=false){this.powered=powered;if(this.powerButton){this.powerButton.disabled=transition;this.powerButton.setAttribute('aria-label',powered?'Power off Game Boy':'Power on Game Boy');}this.render();}
  stateFor(id){
   if(id==='top'||id==='battery')return this.powered?'on':'normal';
   if(id==='contrast-wheel')return this.wheelElapsed!==null&&Math.floor(this.wheelElapsed/200)%2===1?'scroll':'normal';
   if(id==='d-pad')return this.input.activeDirection||'normal';
   const actions={'a-button':['confirm'],'b-button':['cancel'],'select-button':['select'],'start-button':['start','menu']}[id];
   return actions?.some(action=>this.input.isHeld(action))?'pressed':'normal';
  }
  update(ms){if(this.wheelElapsed!==null){this.wheelElapsed+=Math.max(0,Number.isFinite(ms)?ms:0);if(this.wheelElapsed>=1200)this.wheelElapsed=null;}this.render();}
  render(){const shell=shells[this.mode.shell];if(!shell)return;for(const c of shell.components){const node=this.nodes.get(c.id);if(!node)continue;const state=this.stateFor(c.id),path=c.states[state]||c.normal;if(node.getAttribute('src')!==path)node.setAttribute('src',path);Object.assign(node.style,{left:c.x+'px',top:c.y+'px',width:c.width+'px',height:c.height+'px'});}}
 }
 G.rendering.PresentationShell=PresentationShell;
}(window.GBTRPG));
