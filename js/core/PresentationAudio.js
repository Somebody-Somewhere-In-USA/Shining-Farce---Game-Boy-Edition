(function(G){
 "use strict";
 // There was no gameplay audio engine. Hosts may register media here; detached boot
 // audio is deliberately never part of the resumable gameplay group.
 class GameAudio {
  constructor(dom=window.document){this.dom=dom;this.media=new Set();this.paused=[];this.notice=null;}
  register(media){this.media.add(media);return()=>this.media.delete(media);}
  pause(){this.paused=[...new Set([...this.media,...Array.from(this.dom?.querySelectorAll?.('audio,video')||[])])].filter(m=>!m.paused&&!m.ended);for(const m of this.paused)m.pause();}
  resume(){for(const m of this.paused){try{const p=m.play();p?.catch?.(()=>{this.notice='GAME AUDIO RESUME BLOCKED';});}catch{this.notice='GAME AUDIO RESUME BLOCKED';}}this.paused=[];}
 }
 class BootAudio {
  constructor(factory=()=>new Audio(G.config.BOOT.audio)){this.factory=factory;this.stop();}
  prepare(manual=false){this.stop();this.done=false;this.state='ready';this.elapsed=0;const token=this.token;
   try{this.media=this.factory();this.media.loop=false;this.media.preload='auto';this.media.onended=()=>{if(this.token===token&&this.state==='playing')this.finish();};this.media.onerror=()=>{if(this.token===token&&this.started)this.fallback('AUDIO LOAD ERROR');};
    // A manual power click prepares the element, but never plays even a muted
    // chant early. The one playback attempt happens only at the specified cue.
    if(manual)this.media.load?.();
   }catch{this.media=null;}
  }
  duration(){const ms=this.media?.duration*1000;return Number.isFinite(ms)&&ms>0?ms:G.config.BOOT.audioFallbackMs;}
  start(){if(this.started)return;this.started=true;this.elapsed=0;this.state='pending';const token=this.token;
   if(!this.media){this.fallback('AUDIO UNAVAILABLE');return;}
   try{this.media.pause();this.media.currentTime=0;this.media.muted=false;const p=this.media.play();const played=()=>{if(this.token!==token)return;if(this.state!=='pending'){this.media.pause();return;}this.state='playing';};p?.then? p.then(played,()=>{if(this.token===token&&this.state==='pending')this.fallback('AUDIO PLAYBACK BLOCKED');}):played();}catch{this.fallback('AUDIO PLAYBACK BLOCKED');}
  }
  fallback(reason){this.media?.pause();this.state='fallback';this.notice=reason;}
  update(ms){if(!this.started||this.done)return;this.elapsed+=ms;if(this.state==='pending'&&this.elapsed>=1000)this.fallback('AUDIO START TIMED OUT');if(this.state==='fallback'&&this.elapsed>=this.duration())this.finish();else if(this.state==='playing'&&this.elapsed>=this.duration()+5000){this.notice='AUDIO END TIMED OUT';this.finish();}}
  finish(){this.media?.pause();this.done=true;this.state='done';}
  stop(){this.token=(this.token||0)+1;if(this.media){this.media.onended=null;this.media.onerror=null;this.media.pause();}this.media=null;this.started=false;this.done=true;this.state='idle';this.notice=null;}
 }
 G.core.GameAudio=GameAudio;G.core.BootAudio=BootAudio;
}(window.GBTRPG));
