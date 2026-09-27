(function(G){
 "use strict";
 const A=G.editor.BattleSceneAssets,V=G.campaign.Validation;
 class AssetBrowser {
  constructor(host){this.host=host;this.doc=host.getDocument();this.images=new G.rendering.SceneAssetImages();}
  menu(){const h=this.host;h.screen('BATTLE SCENE ASSET TOOLS',[
   {label:'ASSET BROWSER / SEARCH ALL',run:()=>this.browse()},
   {label:'ANIMATION DEFINITIONS',run:()=>this.animations()},
   {label:'UNIT PRESENTATIONS',run:()=>this.units()},
   {label:'TERRAIN DEFINITIONS / BACKGROUNDS + FLOORS',run:()=>this.terrains()},
   {label:'CHECK SHIPPING READINESS',run:()=>h.verifyScene(this.doc,r=>h.message(r.valid?'BATTLE SCENE READY':'BATTLE SCENE NOT READY',[...r.errors,...r.warnings.map(s=>'OPTIONAL: '+s),...(!r.errors.length&&!r.warnings.length?[A.externalEntries(this.doc.data).length?'REFERENCED PNG AVAILABILITY VERIFIED: '+A.externalEntries(this.doc.data).length:'NO EXTERNAL PNG REFERENCES IN THIS EDITOR DRAFT','NO UNRESOLVED REFERENCES','LEGACY PRESENTATIONS REMAIN PLACEHOLDERS.']:[])],()=>this.menu()),()=>this.menu())},
   {label:'PROCEDURAL EFFECT CONTRACTS',run:()=>h.message('PROCEDURAL FOUNDATIONS',['CHARACTER-CLIPPED-SHINE / NO PNG REQUIRED','CLIPPED TO OPAQUE CURRENT CHARACTER PIXELS.','DEFAULT FOR NON-DAMAGE ACTIONS WITHOUT BESPOKE FX.','PROCEDURAL-DODGE / OPTIONAL DODGE ART FALLBACK','RETURNS TO ORIGINAL ANCHOR.','COMBAT CHOREOGRAPHY ARRIVES IN A LATER STAGE.'],()=>this.menu())},
   {label:'EDITOR FILES / SAVE IMPORT EXPORT',run:()=>h.files(()=>this.menu())}
  ],()=>h.devMenu());}
  browse(options={}){
   const h=this.host,state={search:'',category:options.category||'all',status:options.pick?'valid':'all',kind:options.kind||'all',...options.state};
   const show=()=>{h.screen(options.pick?'SELECT ASSET / FILTERED':'ASSET BROWSER',()=>{const rows=A.rows(this.doc.data,state).sort((a,b)=>A.suggestion(b,options.context)-A.suggestion(a,options.context));return [
    {label:'SEARCH',type:'text',get:()=>state.search,set:v=>{state.search=v;}},
    ...(!options.category?[{label:'CATEGORY',type:'enum',values:['all',...Object.keys(A.categories)],get:()=>state.category,set:v=>{state.category=v;}}]:[{label:A.categories[options.category]}]),
    ...(!options.pick?[{label:'STATUS',type:'enum',values:['all','valid','invalid','unused','broken'],get:()=>state.status,set:v=>{state.status=v;}}]:[]),
    {label:rows.length+' RESULTS / SELECT TO INSPECT'},
    ...(options.context?[{label:'ROLE MATCHES FIRST / ALL COMPATIBLE CHOICES ALLOWED'}]:[]),
    ...rows.map(e=>({label:A.label(e),run:()=>this.details(e,show,options.pick)}))
   ];},options.back||(()=>this.menu()));};show();
  }
  details(entry,back,pick){const h=this.host,e=entry,sequence=A.catalog().sequences.find(s=>s.id===e.sequence);h.screen('ASSET / '+e.id,[
   {label:(e.valid?'VALID':'INVALID / QUARANTINED')+' / '+A.categories[e.category]},
   ...h.text.wrap(e.path||e.name||e.id,70).map(label=>({label})),
   {label:e.kind==='animation'?e.frames.length+' AUTHORED FRAMES / '+(A.asset(e.frames[0]?.asset)?.width??'?')+'x'+(A.asset(e.frames[0]?.asset)?.height??'?'):(e.width??'?')+'x'+(e.height??'?')+' / '+(sequence?.frames.length||1)+' CATALOG FRAMES'},
   ...Object.entries(e.metadata||{}).map(([k,v])=>({label:k.toUpperCase()+': '+v})),
   ...(e.kind==='animation'?e.frames.flatMap((f,i)=>h.text.wrap('FRAME '+(i+1)+': '+(A.catalog().entries.find(a=>a.id===f.asset)?.path||f.asset),70).map(label=>({label}))):[]),
   {label:'PIXEL PREVIEW',run:()=>this.preview(e,()=>this.details(e,back,pick))},
   ...(pick&&e.valid?[{label:'USE THIS '+e.kind.toUpperCase(),run:()=>pick(e)}]:[]),
   ...(sequence?.valid&&!pick?[{label:'CREATE ANIMATION FROM THIS SEQUENCE',run:()=>this.animation(A.fromSequence(this.doc,sequence.id),back)}]:[]),
   ...(e.kind==='animation'&&!pick?[{label:'EDIT ANIMATION',run:()=>this.animation(e.id,back)}]:[]),
   ...e.errors.flatMap(error=>h.text.wrap('ERROR: '+error,70).map(label=>({label}))),
   {label:'ACTUAL USAGES: '+e.usages.length},...e.usages.flatMap(u=>h.text.wrap(u,70).map(label=>({label})))
  ],back);}
  preview(entry,back){const h=this.host,a=entry.kind==='animation'?entry:{frames:[{asset:entry.id,ms:100}],loop:true,final:'HOLD'},player=new G.rendering.SceneAnimationPlayer(a);let paused=false,panX=0,panY=0;
   h.open({update:ms=>{const key=h.input.consumeAction();if(key==='cancel'){back();return;}if(key==='confirm')paused=!paused;if(key==='menu'){player.play(a);panX=panY=0;}if(key==='select'&&a.frames.length){paused=true;player.index=(player.index+1)%a.frames.length;player.time=a.frames.slice(0,player.index).reduce((n,f)=>n+f.ms,0);}if(key==='left')panX-=16;if(key==='right')panX+=16;if(key==='up')panY-=16;if(key==='down')panY+=16;if(!paused)player.update(ms||0);},render:()=>{
    const c=h.renderer.ctx;h.renderer.clear();h.ui.window(c,0,0,480,360);h.text.draw(c,'PIXEL PREVIEW / '+entry.id,8,8,76);
    const f=player.sample(),e=A.asset(f?.asset),image=this.images.get(e),w=464,height=230;
    c.save();c.beginPath();c.rect(8,38,w,height);c.clip();c.imageSmoothingEnabled=false;
    c.fillStyle=G.config.PALETTE.light;for(let y=38;y<268;y+=8)for(let x=8;x<472;x+=8)if(((x-8)/8+(y-38)/8)%2===0)c.fillRect(x,y,8,8);
    if(image){const scale=Math.max(1,Math.floor(Math.min(w/image.width,height/image.height)));c.drawImage(image,Math.floor(240-image.width*scale/2)+panX,Math.floor(153-image.height*scale/2)+panY,image.width*scale,image.height*scale);}else if(f){c.fillStyle=G.config.PALETTE.darkest;c.fillRect(208,120,64,64);h.text.draw(c,'?',236,148,1);}c.restore();
    h.text.draw(c,'FRAME '+(player.index+1)+' / '+a.frames.length+' / '+(paused?'PAUSED':player.finished?'FINISHED':'PLAYING'),8,280,76);
    h.text.draw(c,(this.images.errors.get(f?.asset)||(!entry.valid?'INVALID PIXELS ARE NOT RENDERED':f?f.ms+' MS / INTEGER SCALE / DIRECTIONS MOVE IMAGE':'FINAL FRAME HIDDEN')),8,294,76);
    h.text.draw(c,'ACCEPT PAUSE / MENU RESTART / SELECT NEXT FRAME\nCANCEL BACK / OVERSIZED EFFECTS CLIP; DIRECTIONS MOVE IMAGE',8,320,76);
   }});
  }
  animations(){this.host.screen('ANIMATION DEFINITIONS',[
   {label:'CREATE FROM CATALOG SEQUENCE',run:()=>this.host.screen('VALID SEQUENCES',A.catalog().sequences.filter(s=>s.valid).map(s=>({label:s.id,run:()=>this.animation(A.fromSequence(this.doc,s.id),()=>this.animations())})),()=>this.animations())},
   ...Object.values(A.content(this.doc.data).animations).map(a=>({label:a.id+' / '+a.name,run:()=>this.animation(a.id,()=>this.animations())}))
  ],()=>this.menu());}
  animation(id,back){const h=this.host,show=()=>this.animation(id,back),get=()=>A.content(this.doc.data).animations[id],set=(k,v)=>A.mutate(this.doc,p=>p.animations[id][k]=v),a=get();h.screen('ANIMATION / '+id,()=>[
   {label:'NAME',type:'text',get:()=>get().name,set:v=>set('name',v)},
   {label:'LOOP',type:'toggle',get:()=>get().loop,set:v=>set('loop',v)},
   {label:'FINAL FRAME',type:'enum',values:['HOLD','HIDE','FIRST'],get:()=>get().final,set:v=>set('final',v)},
   ...(a.category==='effects'?[{label:'ANCHOR',type:'enum',values:['PARTICIPANT','VIEWPORT'],get:()=>get().anchor,set:v=>set('anchor',v)},...['x','y'].map(k=>({label:k.toUpperCase()+' OFFSET',type:'number',min:-4096,max:4096,get:()=>get()[k],set:v=>set(k,v)}))]:[]),
   {label:'PREVIEW / RESTART',run:()=>this.preview({...get(),kind:'animation',valid:!A.animationErrors(get()).length},show)},
   {label:'VALIDATE',run:()=>h.message('ANIMATION VALIDATION',A.animationErrors(get()).length?A.animationErrors(get()):['VALID'],show)},
   {label:'SAVE WORKING COPY',run:()=>{const ok=this.doc.save();h.message(ok?'DRAFT SAVED':'SAVE FAILED',ok?this.doc.store.workingCopyNotice():[this.doc.store.error],show);}},
   {label:'ADD FRAME',run:()=>this.browse({category:a.category,kind:'asset',back:show,pick:e=>{A.mutate(this.doc,p=>p.animations[id].frames.push({asset:e.id,ms:100}));show();}})},
   ...get().frames.map((f,i)=>({label:'FRAME '+(i+1)+' / '+f.ms+' MS / '+f.asset,run:()=>this.frame(id,i,show)})),
   {label:'DELETE DEFINITION / LEAVE REFERENCES VISIBLE',run:()=>h.confirm('DELETE ANIMATION '+id+'?',()=>{A.mutate(this.doc,p=>delete p.animations[id]);back();},show)}
  ],back);}
  frame(id,index,back){const h=this.host,get=()=>A.content(this.doc.data).animations[id],change=fn=>A.mutate(this.doc,p=>fn(p.animations[id].frames));h.screen('FRAME '+(index+1),[
   {label:'DURATION MS',type:'number',min:1,max:600000,get:()=>get().frames[index].ms,set:v=>change(f=>f[index].ms=v)},
   {label:'INSPECT PIXELS',run:()=>this.preview({id:get().frames[index].asset,kind:'asset',valid:!!A.asset(get().frames[index].asset)},()=>this.frame(id,index,back))},
   {label:'REPLACE FRAME',run:()=>this.browse({category:get().category,kind:'asset',back:()=>this.frame(id,index,back),pick:e=>{change(f=>f[index].asset=e.id);this.frame(id,index,back);}})},
   ...[-1,1].map(dir=>({label:dir<0?'MOVE EARLIER':'MOVE LATER',run:()=>{const to=index+dir;V.assert(to>=0&&to<get().frames.length,'Already at sequence boundary');change(f=>[f[index],f[to]]=[f[to],f[index]]);back();}})),
   {label:'DUPLICATE FRAME',run:()=>{change(f=>f.splice(index+1,0,V.clone(f[index])));back();}},
   {label:'REMOVE FRAME',run:()=>{change(f=>f.splice(index,1));back();}}
  ],back);}
  units(){const h=this.host;h.screen('UNIT PRESENTATIONS',[
   {label:'CREATE PRESENTATION',run:()=>{const id=A.mutate(this.doc,(p,d)=>{const id=this.doc.id(d,'presentation');p.units[id]={id,faction:'PLAYER',race:Object.keys(G.data.RACES)[0],class:'fighter',idle:null,attack:null,dodge:null};return id;});this.unit(id);}},
   ...Object.values(A.content(this.doc.data).units).map(u=>({label:u.faction+' / '+u.race+' / '+u.class,run:()=>this.unit(u.id)}))
  ],()=>this.menu());}
  unit(id){const h=this.host,show=()=>this.unit(id),get=()=>A.content(this.doc.data).units[id];h.screen('UNIT PRESENTATION / '+id,()=>[
   ...Object.entries({faction:G.data.COMBAT_FACTIONS,race:G.data.RACES,class:G.data.CLASSES}).map(([key,table])=>({label:key.toUpperCase(),type:'enum',values:Object.keys(table),get:()=>get()[key],set:v=>A.mutate(this.doc,p=>p.units[id][key]=v)})),
   ...['idle','attack','dodge'].map(role=>({label:role.toUpperCase()+': '+(get()[role]||'UNASSIGNED'),run:()=>h.screen('ASSIGN '+role.toUpperCase(),[{label:'CHOOSE ANIMATION',run:()=>this.browse({category:'units',kind:'animation',context:{...get(),role},back:show,pick:e=>{A.mutate(this.doc,p=>p.units[id][role]=e.id);show();}})},{label:'CLEAR ASSOCIATION',run:()=>{A.mutate(this.doc,p=>p.units[id][role]=null);show();}}],show)})),
   {label:'DELETE PRESENTATION',run:()=>h.confirm('DELETE PRESENTATION?',()=>{A.mutate(this.doc,p=>delete p.units[id]);this.units();},show)}
  ],()=>this.units());}
  terrains(){this.host.screen('BATTLE MAP TERRAIN DEFINITIONS',Object.keys(G.data.BATTLE_TERRAIN).map(id=>({label:id,run:()=>this.terrain(id)})),()=>this.menu());}
  terrain(id,back=()=>this.terrains()){const h=this.host,show=()=>this.terrain(id,back),set=(role,v)=>A.mutate(this.doc,p=>{p.terrains[id]??={background:null,floor:null};p.terrains[id][role]=v;});h.screen('TERRAIN PRESENTATION / '+id,()=>[
   {label:'GLOBAL TERRAIN ASSOCIATION / ALL BATTLE MAPS'},
   ...['background','floor'].map(role=>({label:role.toUpperCase()+': '+(A.content(this.doc.data).terrains[id]?.[role]||'UNASSIGNED'),run:()=>h.screen('ASSIGN '+role.toUpperCase(),[{label:'CHOOSE ASSET',run:()=>this.browse({category:role==='floor'?'floors':'backgrounds',kind:'asset',back:show,pick:e=>{set(role,e.id);show();}})},{label:'CLEAR ASSOCIATION',run:()=>{set(role,null);show();}}],show)})),
   {label:'REMOVE TERRAIN PRESENTATION / KEEP LEGACY',run:()=>h.confirm('REMOVE TERRAIN PRESENTATION?',()=>{A.mutate(this.doc,p=>delete p.terrains[id]);show();},show)}
  ],back);}
 }
 G.editor.AssetBrowser=AssetBrowser;
}(window.GBTRPG));
