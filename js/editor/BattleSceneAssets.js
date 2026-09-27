(function(G){
 "use strict";
 const V=G.campaign.Validation;
 const categories={units:"BATTLE SCENE UNITS",backgrounds:"BATTLE SCENE BACKGROUNDS",floors:"BATTLE FLOORS",effects:"BATTLE SCENE EFFECTS",world:"CAMPAIGN GRAPHICS",tiles:"BATTLE MAP TILES",map:"MAP UNITS",ui:"UI",fonts:"FONTS"};
 const empty=()=>({version:1,animations:{},units:{},terrains:{}});
 const content=data=>data.battleScene||empty();
 const catalog=()=>G.data.ASSET_CATALOG||{version:1,entries:[],sequences:[]};
 const loadFailures=new Map();
 const asset=id=>catalog().entries.find(e=>e.id===id&&e.valid&&!loadFailures.has(id))||null;
 const dictionary=v=>v&&typeof v==="object"&&!Array.isArray(v);
 const ref=v=>v===null||typeof v==="string"&&v.length>0&&v.length<=512;
 function shape(p){
  if(p===undefined)return true;V.plainData(p);V.assert(p?.version===1&&['animations','units','terrains'].every(k=>dictionary(p[k])),"invalid Battle Scene document");
  for(const [id,a]of Object.entries(p.animations)){
   V.assert(V.validId(id)&&a.id===id&&typeof a.name==="string"&&['units','effects'].includes(a.category)&&Array.isArray(a.frames)&&typeof a.loop==="boolean"&&['HOLD','HIDE','FIRST'].includes(a.final),"invalid animation definition: "+id);
   for(const f of a.frames)V.assert(ref(f.asset)&&f.asset!==null&&Number.isSafeInteger(f.ms)&&f.ms>0&&f.ms<=600000,"invalid frame/timing: "+id);
   if(a.category==='effects')V.assert(['PARTICIPANT','VIEWPORT'].includes(a.anchor)&&Number.isSafeInteger(a.x)&&Number.isSafeInteger(a.y),"invalid effect anchor/offset: "+id);
  }
  for(const [id,u]of Object.entries(p.units))V.assert(V.validId(id)&&u.id===id&&typeof u.faction==="string"&&typeof u.race==="string"&&typeof u.class==="string"&&['idle','attack','dodge'].every(k=>ref(u[k])),"invalid unit presentation: "+id);
  for(const [id,t]of Object.entries(p.terrains))V.assert(V.validId(id)&&dictionary(t)&&ref(t.background)&&ref(t.floor),"invalid terrain presentation: "+id);
  return true;
 }
 function animationErrors(a){
  const errors=[];if(!a?.frames?.length)return['No frames'];
  const sizes=new Set();for(const f of a.frames){const e=asset(f.asset);if(!e||e.category!==a.category)errors.push('Missing, invalid or wrong-category frame: '+f.asset);else sizes.add(e.width+'x'+e.height);}
  if(sizes.size>1)errors.push('Animation frame canvases differ');return errors;
 }
 function optionalAnimation(p,a){const roles=Object.values(p.units).flatMap(u=>["idle","attack","dodge"].filter(role=>u[role]===a.id));return a.category==="effects"||roles.length>0&&roles.every(role=>role==="dodge");}
 function references(data){const p=content(data),out=[];
  for(const a of Object.values(p.animations))a.frames.forEach((f,i)=>out.push({id:f.asset,kind:'asset',category:a.category,where:'Animation '+a.id+' / frame '+(i+1),required:!optionalAnimation(p,a)}));
  for(const u of Object.values(p.units))for(const role of ['idle','attack','dodge'])if(u[role])out.push({id:u[role],kind:'animation',category:'units',where:u.faction+' / '+u.race+' / '+u.class+' / '+role,required:role!=='dodge'});
  for(const [id,t]of Object.entries(p.terrains))for(const role of ['background','floor'])if(t[role])out.push({id:t[role],kind:'asset',category:role==='floor'?'floors':'backgrounds',where:'Terrain '+id+' / '+role,required:role==='background'});
  return out.map(r=>{const a=p.animations[r.id],e=r.kind==='asset'?asset(r.id):a;return{...r,broken:!e||e.category!==r.category||(r.kind==='animation'&&animationErrors(a).length>0)};});
 }
 function readiness(data,{availability=true}={}){const errors=[],warnings=[],p=content(data);try{shape(data.battleScene);}catch(e){return{valid:false,errors:[e.message],warnings};}
  for(const a of Object.values(p.animations))for(const e of animationErrors(a))(optionalAnimation(p,a)&&e.startsWith('Missing, invalid')?warnings:errors).push(a.id+': '+e);
  const combinations=new Set();for(const u of Object.values(p.units)){
   const key=[u.faction,u.race,u.class].join('/');if(combinations.has(key))errors.push('Duplicate unit presentation '+key);combinations.add(key);
   if(!Object.hasOwn(G.data.COMBAT_FACTIONS,u.faction)||!Object.hasOwn(G.data.RACES,u.race)||!Object.hasOwn(G.data.CLASSES,u.class))errors.push('Unknown faction/race/class: '+key);
   for(const role of ['idle','attack'])if(!u[role])errors.push(key+': required '+role+' missing');
  }
  for(const [id,t]of Object.entries(p.terrains)){if(!Object.hasOwn(G.data.BATTLE_TERRAIN,id))errors.push('Unknown terrain '+id);if(!t.background)errors.push(id+': required background missing');}
  for(const r of references(data).filter(r=>r.broken))(r.required?errors:warnings).push(r.where+': unresolved '+r.id);
  if(availability)for(const r of references(data).filter(r=>r.kind==='asset'&&!r.broken)){const e=asset(r.id),state=G.editor.sceneAssetAvailability.status(e);if(state!=='AVAILABLE')(r.required?errors:warnings).push(r.where+': PNG '+state+' / '+r.id+'; run current asset verification');}
  return{valid:!errors.length,errors,warnings};
 }
 function externalEntries(data){const ids=new Set(references(data).filter(r=>r.kind==='asset').map(r=>r.id));return catalog().entries.filter(e=>e.valid&&ids.has(e.id));}
 async function verify(data,options){shape(data.battleScene);await G.editor.sceneAssetAvailability.probe(externalEntries(data),options);return readiness(data,{availability:true});}
 function label(entry){return(entry.valid?'OK ':'INVALID ')+(entry.kind==='animation'?(entry.name||entry.id)+' / '+entry.id:entry.id+' / '+entry.kind);}
 function suggestion(entry,context){if(!context||entry.kind!=='animation')return 0;const metadata=entry.frames.map(f=>catalog().entries.find(e=>e.id===f.asset)?.metadata||{});return(metadata.some(m=>m.animation===context.role)?8:0)+['faction','race','class'].reduce((score,key)=>score+(metadata.some(m=>m[key]===context[key]?.toLowerCase())?1:0),0);}
 function rows(data,{search='',category='all',status='all',kind='all'}={}){
  const p=content(data),refs=references(data);
  const list=catalog().entries.map(e=>({...e,kind:'asset',valid:e.valid&&!loadFailures.has(e.id),errors:[...e.errors,...(loadFailures.has(e.id)?[loadFailures.get(e.id)]:[])],usages:[...refs.filter(r=>r.kind==='asset'&&r.id===e.id).flatMap(r=>{const animationId=Object.values(p.animations).find(a=>r.where.startsWith('Animation '+a.id+' /'))?.id;return[r.where,...refs.filter(u=>u.kind==='animation'&&u.id===animationId).map(u=>u.where+' via '+animationId)];}),...Object.entries(G.data.ASSET_MANIFEST).filter(([,path])=>path===e.path).map(([id])=>'Installed runtime manifest: '+id)]}));
  for(const a of Object.values(p.animations))list.push({...a,kind:'animation',valid:!animationErrors(a).length,errors:animationErrors(a),usages:refs.filter(r=>r.kind==='animation'&&r.id===a.id).map(r=>r.where)});
  for(const r of refs.filter(r=>r.broken))if(!list.some(e=>e.id===r.id&&e.kind===r.kind))list.push({id:r.id,kind:r.kind,category:r.category,valid:false,errors:['Unresolved authored reference'],usages:refs.filter(q=>q.id===r.id&&q.kind===r.kind).map(q=>q.where),broken:true});
  const query=search.toLowerCase();return list.filter(e=>(category==='all'||e.category===category)&&(kind==='all'||e.kind===kind)&&JSON.stringify([e.id,e.name,e.filename,e.path,categories[e.category],e.metadata,e.usages]).toLowerCase().includes(query)&&(status==='all'||status==='valid'&&e.valid||status==='invalid'&&!e.valid||status==='unused'&&!e.usages.length||status==='broken'&&refs.some(r=>r.broken&&r.id===e.id&&r.kind===e.kind)));
 }
 function mutate(doc,fn){return doc.command(d=>{d.battleScene??=empty();return fn(d.battleScene,d);});}
 function fromSequence(doc,sequence){const s=catalog().sequences.find(s=>s.id===sequence&&s.valid);V.assert(s,'Choose a valid frame sequence');return mutate(doc,(p,d)=>{const id=doc.id(d,'animation');p.animations[id]={id,name:sequence,category:s.category,frames:s.frames.map(asset=>({asset,ms:100})),loop:true,final:'HOLD',...(s.category==='effects'?{anchor:'PARTICIPANT',x:0,y:0}:{})};return id;});}
 // Pure foundation lookups, intentionally not wired into combat until Stage 3.
 function resolveUnit(data,unit,role){const p=content(data),u=Object.values(p.units).find(v=>v.faction===unit.faction&&v.race===(unit.raceId||unit.race)&&v.class===(unit.currentClassId||unit.classId||unit.class));
  const usable=id=>{const a=p.animations[id];return a?.category==='units'&&!animationErrors(a).length?a:null;};const requested=usable(u?.[role]),idle=usable(u?.idle);
  return{animation:requested||idle,procedural:!requested&&role==='dodge'?'procedural-dodge':null,placeholder:!(requested||idle)};
 }
 function resolveTerrain(data,targetTerrain,playerTerrain,faction){const p=content(data),background=asset(p.terrains[targetTerrain]?.background),floor=asset(p.terrains[playerTerrain]?.floor);return{background:background?.category==='backgrounds'?background:null,floor:faction==='PLAYER'&&floor?.category==='floors'?floor:null,fallback:background?.category!=='backgrounds'?'generic-background':null};}
 const procedural=Object.freeze({shine:{id:'character-clipped-shine',requiresPNG:false,clip:'OPAQUE_CURRENT_CHARACTER_FRAME',paletteOnly:true},dodge:{id:'procedural-dodge',requiresPNG:false,returnToAnchor:true}});
 function resolveEffect(data,id,ordinaryDamage=false){const a=content(data).animations[id];return a?.category==='effects'&&!animationErrors(a).length?{animation:a,procedural:null}:{animation:null,procedural:ordinaryDamage?'impact-jitter':procedural.shine.id};}
 G.editor.BattleSceneAssets={categories,empty,content,catalog,asset,loadFailures,shape,animationErrors,references,readiness,externalEntries,verify,label,suggestion,rows,mutate,fromSequence,resolveUnit,resolveTerrain,resolveEffect,procedural};
}(window.GBTRPG));
