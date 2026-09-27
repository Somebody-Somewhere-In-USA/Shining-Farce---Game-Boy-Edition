// Developer-only, dependency-free PNG cataloger. Never loaded by the game.
const fs=require('node:fs'), path=require('node:path'), zlib=require('node:zlib'), crypto=require('node:crypto');
const directories={units:'assets/battle-scene/units',backgrounds:'assets/battle-scene/backgrounds',floors:'assets/battle-scene/floors',effects:'assets/battle-scene/effects',world:'assets/world',tiles:'assets/tiles',map:'assets/sprites/map',ui:'assets/ui',fonts:'assets/fonts'};
const palette=new Set(['9bbc0f','8bac0f','306230','0f380f']);
function demand(ok,message){if(!ok)throw Error(message);}
const crcTable=Array.from({length:256},(_,n)=>{for(let i=0;i<8;i++)n=n&1?0xedb88320^(n>>>1):n>>>1;return n>>>0;});
function crc(b){let n=0xffffffff;for(const v of b)n=crcTable[(n^v)&255]^(n>>>8);return(n^0xffffffff)>>>0;}
function png(b){
 demand(b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),'Not a PNG');
 let pos=8,header,colors,alpha,end=false,idat=[],seen=new Set(),closedIDAT=false;
 while(pos<b.length){
  demand(pos+12<=b.length,'Truncated PNG chunk');const size=b.readUInt32BE(pos),type=b.toString('ascii',pos+4,pos+8),stop=pos+12+size;
  demand(stop<=b.length,'Truncated PNG data');demand(/^[A-Za-z]{2}[A-Z][A-Za-z]$/.test(type),'Invalid PNG chunk type');demand(crc(b.subarray(pos+4,stop-4))===b.readUInt32BE(stop-4),'PNG checksum mismatch');
  const data=b.subarray(pos+8,stop-4);demand(header||type==='IHDR','IHDR must be first');
  if(type==='IHDR'){demand(!header&&size===13,'Invalid IHDR');header=data;}
  else if(type==='PLTE'){demand(!seen.has(type)&&!idat.length&&size>0&&size%3===0&&size<=768,'Invalid PNG palette');colors=data;}
  else if(type==='tRNS'){demand(!seen.has(type)&&!idat.length,'Invalid PNG transparency');alpha=data;}
  else if(type==='IDAT'){demand(!closedIDAT,'Noncontiguous image data');idat.push(data);}
  else if(type==='IEND'){demand(size===0&&idat.length&&stop===b.length,'Invalid PNG end');end=true;pos=stop;break;}
  else {demand(type[0]===type[0].toLowerCase(),'Unsupported critical PNG chunk '+type);if(idat.length)closedIDAT=true;demand(type!=='acTL','Animated PNG is not an individual frame');
   demand(!['iCCP','cICP'].includes(type),'Color profiles must be removed/exported as sRGB to preserve exact palette pixels');
   if(type==='gAMA')demand(size===4&&data.readUInt32BE(0)===45455,'Export PNG with standard sRGB gamma or without gamma metadata');
   if(type==='sRGB')demand(size===1&&data[0]<=3,'Invalid sRGB intent');
   if(type==='cHRM')demand(size===32&&[31270,32900,64000,33000,30000,60000,15000,6000].every((v,i)=>data.readUInt32BE(i*4)===v),'Export PNG with standard sRGB chromaticity');
  }
  seen.add(type);pos=stop;
 }
 demand(end&&header,'Incomplete PNG');
 const width=header.readUInt32BE(0),height=header.readUInt32BE(4),depth=header[8],type=header[9],interlace=header[12];
 demand(width>0&&height>0&&width*height<=16777216,'PNG dimensions exceed decoder safety limit (16M pixels)');
 const channels={0:1,2:3,3:1,4:2,6:4}[type];
 demand(channels&&({0:[1,2,4,8,16],2:[8,16],3:[1,2,4,8],4:[8,16],6:[8,16]}[type].includes(depth)),'Unsupported PNG color format');
 demand(header[10]===0&&header[11]===0&&interlace<=1,'Unsupported PNG encoding');
 if(type===3)demand(colors&&colors.length/3<=2**depth,'Missing/invalid indexed palette');
 if(alpha)demand(type===0?alpha.length===2:type===2?alpha.length===6:type===3?colors&&alpha.length<=colors.length/3:false,'Invalid transparency chunk');
 const passes=interlace?[[0,0,8,8],[4,0,8,8],[0,4,4,8],[2,0,4,4],[0,2,2,4],[1,0,2,2],[0,1,1,2]]:[[0,0,1,1]];
 const dims=passes.map(([x,y,dx,dy])=>[Math.max(0,Math.ceil((width-x)/dx)),Math.max(0,Math.ceil((height-y)/dy))]);
 const expected=dims.reduce((n,[w,h])=>n+(w&&h?h*(1+Math.ceil(w*channels*depth/8)):0),0);
 const raw=zlib.inflateSync(Buffer.concat(idat),{maxOutputLength:expected+1});demand(raw.length===expected,'PNG pixel data length mismatch');let offset=0;
 const bpp=Math.max(1,Math.ceil(channels*depth/8));
 for(const [w,h]of dims){if(!w||!h)continue;const length=Math.ceil(w*channels*depth/8);let previous=Buffer.alloc(length);
  for(let y=0;y<h;y++){const filter=raw[offset++];demand(filter<=4,'Invalid PNG filter');const row=Buffer.from(raw.subarray(offset,offset+length));offset+=length;
   for(let i=0;i<length;i++){const a=i>=bpp?row[i-bpp]:0,b=previous[i],c=i>=bpp?previous[i-bpp]:0,p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);row[i]=(row[i]+[0,a,b,Math.floor((a+b)/2),pa<=pb&&pa<=pc?a:pb<=pc?b:c][filter])&255;}
   const sample=i=>depth===16?row.readUInt16BE(i*2):depth===8?row[i]:(row[Math.floor(i*depth/8)]>>(8-depth-(i*depth)%8))&((1<<depth)-1);
   const max=2**depth-1;
   for(let x=0;x<w;x++){const s=Array.from({length:channels},(_,k)=>sample(x*channels+k));let rgb,a=max;
    if(type===3){demand(s[0]*3+2<colors.length,'Invalid palette index');rgb=[...colors.subarray(s[0]*3,s[0]*3+3)];a=alpha?.[s[0]]??255;demand(a===0||a===255,'Partial alpha is forbidden');}
    else {if(type===0||type===4)rgb=[s[0],s[0],s[0]];else rgb=s.slice(0,3);if(type===4||type===6)a=s.at(-1);else if(alpha&&(type===0?s[0]===alpha.readUInt16BE(0):s.slice(0,3).every((v,k)=>v===alpha.readUInt16BE(k*2))))a=0;demand(a===0||a===max,'Partial alpha is forbidden');rgb=rgb.map(v=>v*255/max);}
    if(a!==0)demand(rgb.every(Number.isInteger)&&palette.has(rgb.map(v=>v.toString(16).padStart(2,'0')).join('')),'Pixel outside the four-color palette');
   }previous=row;
  }
 }
 return{width,height};
}
function catalog(root){
 const entries=[];
 for(const [category,dir]of Object.entries(directories)){
  const folder=path.join(root,dir);if(!fs.existsSync(folder))continue;
  demand(!fs.lstatSync(folder).isSymbolicLink(),'Asset directory must not be a link: '+dir);
  // Deliberately flat directories: no recursive traversal or arbitrary filesystem scanning.
  for(const filename of fs.readdirSync(folder).filter(n=>/\.png$/i.test(n)).sort()){
   const file=path.join(folder,filename),stem=filename.slice(0,-4),entry={id:category+':'+stem.toLowerCase(),category,path:dir+'/'+filename,filename,width:null,height:null,sequence:null,frame:null,metadata:{},errors:[]};
   try{
    demand(fs.lstatSync(file).isFile()&&!fs.lstatSync(file).isSymbolicLink(),'PNG must be an ordinary file');
    const bytes=fs.readFileSync(file);entry.hash=crypto.createHash('sha256').update(bytes).digest('hex');Object.assign(entry,png(bytes));
   }catch(e){entry.errors.push(e.message);}
   if(['units','backgrounds','floors','effects'].includes(category)){
    if(!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*\.png$/.test(filename))entry.errors.push('Use lowercase hyphen-separated PNG names');
    if(category==='units'){
     const m=/^([a-z][a-z0-9]*)-([a-z][a-z0-9]*)-([a-z][a-z0-9]*)-([a-z][a-z0-9]*)(?:-([0-9]+))?$/.exec(stem);
     if(!m)entry.errors.push('Expected faction-race-class-animation[-frame].png');else{entry.metadata={faction:m[1],race:m[2],class:m[3],animation:m[4]};entry.sequence='units:'+m.slice(1,5).join('-');entry.frame=m[5]===undefined?null:Number(m[5]);}
    }else if(category==='effects'){const m=/^([a-z][a-z0-9]*(?:-[a-z0-9]+)*?)(?:-([0-9]+))?$/.exec(stem);if(m){entry.sequence='effects:'+m[1];entry.frame=m[2]===undefined?null:Number(m[2]);entry.metadata={effect:m[1]};}else entry.errors.push('Invalid effect filename');}
    const size={units:[128,96],backgrounds:[256,96],floors:[96,32]}[category];if(size&&(entry.width!==size[0]||entry.height!==size[1]))entry.errors.push('Required canvas '+size.join('x'));
    if(entry.frame!==null&&(!Number.isSafeInteger(entry.frame)||entry.frame<1||/-0[0-9]+\.png$/.test(filename)))entry.errors.push('Frame suffix must be a positive integer without leading zeroes');
   }
   entries.push(entry);
  }
 }
 for(const e of entries)if(entries.filter(v=>v.id===e.id).length>1)e.errors.push('Duplicate derived identity');
 const sequences=[];
 for(const id of [...new Set(entries.map(e=>e.sequence).filter(Boolean))].sort()){
  const frames=entries.filter(e=>e.sequence===id).sort((a,b)=>(a.frame??1)-(b.frame??1)||a.path.localeCompare(b.path));
  if(frames.length>1&&(frames.some(e=>e.frame===null)||new Set(frames.map(e=>e.frame)).size!==frames.length))for(const e of frames)e.errors.push('Ambiguous frame numbering');
  if(frames[0].category==='effects'&&new Set(frames.filter(e=>e.width).map(e=>e.width+'x'+e.height)).size>1)for(const e of frames)e.errors.push('Effect sequence canvases differ');
  sequences.push({id,category:frames[0].category,frames:frames.map(e=>e.id),valid:frames.every(e=>!e.errors.length)});
 }
 for(const e of entries)e.valid=e.errors.length===0;
 return{version:1,entries,sequences};
}
function update(root){const data=catalog(root),valid=data.entries.filter(e=>e.valid).length,invalid=data.entries.length-valid;
 const report=['SHINING FARCE / ASSET CATALOG',`${valid} VALID / ${invalid} QUARANTINED / ${data.sequences.length} SEQUENCES`,'Source PNGs were not modified. Refresh the game after updating.',...data.entries.map(e=>`${e.valid?'VALID':'INVALID'} ${e.path} (${e.width??'?'}x${e.height??'?'})${e.errors.length?' / '+e.errors.join('; '):''}`)].join('\n')+'\n';
 fs.mkdirSync(path.join(root,'js/data'),{recursive:true});fs.mkdirSync(path.join(root,'assets/battle-scene'),{recursive:true});
 fs.writeFileSync(path.join(root,'js/data/assetCatalog.js'),'// GENERATED by Update Asset Catalog.bat. Do not author definitions here.\nwindow.GBTRPG.data.ASSET_CATALOG = '+JSON.stringify(data,null,2)+';\n');
 fs.writeFileSync(path.join(root,'assets/battle-scene/catalog-report.txt'),report);return{data,report,invalid};
}
if(require.main===module){try{const r=update(path.resolve(__dirname,'..'));console.log(r.report);process.exitCode=r.invalid?2:0;}catch(e){console.error('CATALOG UPDATE FAILED: '+e.message);process.exitCode=1;}}
module.exports={png,crc,catalog,update,directories};
