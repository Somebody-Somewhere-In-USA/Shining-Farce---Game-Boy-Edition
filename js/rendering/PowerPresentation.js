(function(G){
 "use strict";
 class PowerPresentation {
  constructor(game,{dom=window.document,chant=new G.core.BootAudio(),random=Math.random}={}){
   Object.assign(this,{game,dom,chant,random});this.assets=new G.core.Assets(G.config.BOOT.frames);this.phase='running';this.elapsed=0;this.frame=null;this.snapshot=null;
   game.presentation.onPower=()=>{try{return this.toggle();}catch(error){this.abort(error);return false;}};
  }
  get blocked(){return this.phase!=='running';}
  async loadAll(){await this.assets.loadAll();for(const image of this.assets.images.values())if(image.width!==171||image.height!==58)throw Error('Boot logo dimensions must be 171x58');}
  prepareStartup(){if(this.game.presentation.mode.shell){this.phase='loading';this.game.input.setSuspended(true);this.game.gameAudio.pause();this.game.presentation.setPower(false,true);this.render();}}
  startInitial(){if(this.phase==='loading')this.startBoot(false);}
  toggle(){if(!this.game.presentation.mode.shell)return false;if(this.phase==='running'){this.powerOff();return true;}if(this.phase==='off'){this.startBoot(true);return true;}return false;}
  enter(phase){this.phase=phase;this.elapsed=0;}
  powerOff(){
   this.game.input.setSuspended(true);this.game.gameAudio.pause();this.enter('dissolve');this.game.presentation.setPower(false,true);
   this.snapshot=this.dom.createElement('canvas');this.snapshot.width=480;this.snapshot.height=360;this.snapshot.getContext('2d').drawImage(this.game.canvas,0,0);
   this.rows=Array.from({length:360},(_,i)=>i);for(let i=359;i>0;i--){const j=Math.floor(this.random()*(i+1));[this.rows[i],this.rows[j]]=[this.rows[j],this.rows[i]];}this.render();
  }
  startBoot(manual){this.game.input.setSuspended(true);this.chant.prepare(manual);this.enter('boot-off');this.frame=null;this.game.presentation.setPower(false,true);this.render();}
  update(ms){
   if(!this.blocked||this.phase==='off'||this.phase==='loading'||this.phase==='error')return;
   if(this.phase==='chant'){this.chant.update(ms);if(this.chant.done)this.enter('hold');return;}
   this.elapsed+=Math.max(0,ms);
   const durations={'dissolve':1000,'boot-off':1000,'forward':1250,'blank':1000,'reveal':300,'hold':1000,'reverse':300,'final':1000};
   while(this.elapsed>=durations[this.phase]){this.elapsed-=durations[this.phase];switch(this.phase){
    case 'dissolve':this.enter('off');this.game.presentation.setPower(false,false);return;
    case 'boot-off':this.phase='forward';this.game.presentation.setPower(true,true);break;
    case 'forward':this.phase='blank';break;
    case 'blank':this.phase='reveal';break;
    case 'reveal':this.enter('chant');this.chant.start();return;
    case 'hold':this.phase='reverse';break;
    case 'reverse':this.phase='final';break;
    case 'final':this.finish();return;
   }}
  }
  get logoFrame(){if(this.phase==='forward')return 1+Math.floor(this.elapsed/50);if(this.phase==='reveal')return 26+Math.floor(this.elapsed/100);if(this.phase==='chant'||this.phase==='hold')return 28;if(this.phase==='reverse')return 28-Math.floor(this.elapsed/100);return null;}
  render(){
   if(!this.blocked)return;const ctx=this.game.renderer.ctx;ctx.fillStyle=G.config.PALETTE.background;ctx.fillRect(0,0,480,360);
   if(this.phase==='dissolve'){ctx.drawImage(this.snapshot,0,0);const n=Math.min(360,Math.floor(this.elapsed*360/1000));for(let i=0;i<n;i++)ctx.fillRect(0,this.rows[i],480,1);return;}
   const frame=this.logoFrame;if(frame){const image=this.assets.getImage(frame.toString());ctx.drawImage(image,Math.floor((480-image.width)/2),Math.floor((360-image.height)/2));}
  }
  finish(){this.chant.stop();this.enter('running');this.game.input.setSuspended(false);this.game.presentation.setPower(true,false);if(this.snapshot){this.game.renderer.ctx.drawImage(this.snapshot,0,0);this.snapshot=null;}this.game.gameAudio.resume();}
  abort(error){this.chant.stop();this.enter('error');this.game.input.setSuspended(true);this.game.presentation.setPower(false,true);this.render();this.game.statusElement.textContent='POWER PRESENTATION ERROR: '+error.message;this.game.statusElement.classList?.remove('accessible-status');}
 }
 G.rendering.PowerPresentation=PowerPresentation;
}(window.GBTRPG));
