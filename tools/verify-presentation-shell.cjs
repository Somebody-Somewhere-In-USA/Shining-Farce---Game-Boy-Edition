// Offline source-integrity and native composition QA; not Brave/file:// acceptance.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {createCanvas,loadImage}=require(process.argv[2]||'@napi-rs/canvas'),root=path.resolve(__dirname,'..'),{shells,paths,modes}=require('./shell-assets.cjs').inspect(root),out=fs.mkdtempSync(path.join(os.tmpdir(),'sf-shell-render-'));
async function main(){
 const records=JSON.parse(fs.readFileSync(path.join(root,'docs/reference/game-boy/source-manifest.json'),'utf8')),images=new Map(),sourceDifferences=[],revisions=JSON.parse(fs.readFileSync(path.join(root,'docs/reference/game-boy/owner-revisions.json'),'utf8'));
 for(const r of records){const bytes=fs.readFileSync(path.join(root,r.path));const hash=crypto.createHash('sha256').update(bytes).digest('hex');if(hash!==r.sha256)sourceDifferences.push({path:r.path,original:r.sha256,current:hash,ownerRevision:revisions.some(v=>v.path===r.path&&v.sha256===hash)});const image=await loadImage(bytes);assert.equal(image.width,r.width);assert.equal(image.height,r.height);images.set(r.path,image);}
 if(sourceDifferences.some(d=>!d.ownerRevision)&&!process.argv.includes('--report-source-differences'))throw Error('Source differences (preserve owner files; use --report-source-differences to inspect): '+JSON.stringify(sourceDifferences));
 assert.equal(records.length,48);assert.equal(paths.size,46);
 const results=[];
 for(const [size,shell]of Object.entries(shells)){
  const reference=images.get('docs/reference/game-boy/size-'+size+'.png'),canvas=createCanvas(shell.width,shell.height),ctx=canvas.getContext('2d'),screen=shell.screen;ctx.imageSmoothingEnabled=false;
  ctx.drawImage(reference,screen.x,screen.y,screen.width,screen.height,screen.x,screen.y,screen.width,screen.height);
  for(const c of shell.components)ctx.drawImage(images.get(c.normal),c.x,c.y);
  fs.writeFileSync(path.join(out,'normal-size-'+size+'.png'),canvas.toBuffer('image/png'));
  const expected=createCanvas(shell.width,shell.height),e=expected.getContext('2d');e.drawImage(reference,0,0);const a=ctx.getImageData(0,0,shell.width,shell.height).data,b=e.getImageData(0,0,shell.width,shell.height).data;let different=0;const bounds={};
  for(let p=0;p<a.length;p+=4){if(!a[p+3]&&!b[p+3])continue;if(a.slice(p,p+4).some((v,i)=>v!==b[p+i])){different++;const x=(p/4)%shell.width,y=Math.floor(p/4/shell.width);bounds.minX=Math.min(bounds.minX??x,x);bounds.minY=Math.min(bounds.minY??y,y);bounds.maxX=Math.max(bounds.maxX??x,x);bounds.maxY=Math.max(bounds.maxY??y,y);}}
  // The owner-supplied small D-Pad/Bottom component pixels differ from its complete reference.
  assert.equal(different,size==='1'?1795:0,'Unexpected reference mismatch');results.push({size:Number(size),differentReferencePixels:different,bounds});
  // Render complete-frame corners + on/held alternates, using palette-independent hardware art.
  const frame=createCanvas(480,360),f=frame.getContext('2d'),colors=['#242424','#666666','#aaaaaa','#e4e4e4'];f.imageSmoothingEnabled=false;for(let n=0;n<4;n++){f.fillStyle=colors[n];f.fillRect(n%2*240,Math.floor(n/2)*180,240,180);}
  for(const pressed of [false,true]){
   ctx.clearRect(0,0,shell.width,shell.height);ctx.fillStyle='#2b2d31';ctx.fillRect(0,0,shell.width,shell.height);
   for(const c of shell.components){const state=c.id==='top'||c.id==='battery'?'on':pressed&&c.id==='d-pad'?'right':pressed&&c.id==='contrast-wheel'?'scroll':pressed?'pressed':'normal';ctx.drawImage(images.get(c.states[state]||c.normal),c.x,c.y);}
   ctx.drawImage(frame,screen.x,screen.y,screen.width,screen.height);
   const pixels=ctx.getImageData(screen.x,screen.y,screen.width,screen.height).data;
   for(const [x,y,n]of [[0,0,0],[screen.width-1,0,1],[0,screen.height-1,2],[screen.width-1,screen.height-1,3]]){const p=(y*screen.width+x)*4;assert.deepEqual([...pixels.slice(p,p+3)],[1,3,5].map(i=>parseInt(colors[n].slice(i,i+2),16)));}
   fs.writeFileSync(path.join(out,(pressed?'held':'powered')+'-dark-size-'+size+'.png'),canvas.toBuffer('image/png'));
  }
 }
 // Same actual game frame for all five comparison modes. Pass a logical 480x360 render.
 const framePath=process.argv[3];let comparison=[];
 if(framePath){
  const source=await loadImage(framePath),factor=source.width/480;assert(Number.isInteger(factor)&&factor>=1);assert.equal(source.height,360*factor);
  // The established regression exporter writes integer-enlarged captures. Recover its
  // logical frame only after proving every source block is uniform (no resampling loss).
  const original=createCanvas(source.width,source.height),oc=original.getContext('2d');oc.drawImage(source,0,0);const px=oc.getImageData(0,0,source.width,source.height).data;
  for(let y=0;y<source.height;y++)for(let x=0;x<source.width;x++){const i=(y*source.width+x)*4,j=(Math.floor(y/factor)*factor*source.width+Math.floor(x/factor)*factor)*4;for(let c=0;c<4;c++)assert.equal(px[i+c],px[j+c],'Capture must be an exact integer enlargement');}
  const frame=createCanvas(480,360),fc=frame.getContext('2d');fc.imageSmoothingEnabled=false;fc.drawImage(source,0,0,480,360);fs.writeFileSync(path.join(out,'underlying-game-frame.png'),frame.toBuffer('image/png'));
  const crops=[];
  for(const mode of modes){
   const shell=shells[mode.shell],viewport={width:1000,height:800},scale=Math.min(viewport.width/480,viewport.height/360),screen=mode.screen||{x:0,y:25,width:480*scale,height:360*scale};
   const canvas=createCanvas(shell?.width||viewport.width,shell?.height||viewport.height),ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;ctx.fillStyle='#6d8508';ctx.fillRect(0,0,canvas.width,canvas.height);
   if(shell){for(const c of shell.components)ctx.drawImage(images.get(c.states.on||c.normal),c.x,c.y);if(mode.backing){ctx.fillStyle=mode.backing;ctx.fillRect(shell.screen.x,shell.screen.y,shell.screen.width,shell.screen.height);}}
   ctx.imageSmoothingEnabled=mode.sampling==='auto';ctx.drawImage(frame,screen.x,screen.y,screen.width,screen.height);
   if(mode.id===1){for(const [x,y]of [[185,155],[484,379],[214,200],[455,200]])assert.deepEqual([...ctx.getImageData(x,y,1,1).data],[114,111,115,255]);}
   const file=path.join(out,'mode-'+mode.id+'.png');fs.writeFileSync(file,canvas.toBuffer('image/png'));comparison.push({mode:mode.id,file,screen,sampling:mode.sampling});
   if(mode.id<=3){const crop=createCanvas(300,225);crop.getContext('2d').drawImage(canvas,185,155,300,225,0,0,300,225);crops.push(crop);}
  }
  assert.notDeepEqual(crops[1].toBuffer('image/png'),crops[2].toBuffer('image/png'),'Crisp and smooth comparison must visibly differ');
  const strip=createCanvas(900,225),ctx=strip.getContext('2d');crops.forEach((c,n)=>ctx.drawImage(c,n*300,0));fs.writeFileSync(path.join(out,'small-modes-1-2-3.png'),strip.toBuffer('image/png'));
 }
 console.log(JSON.stringify({sourcePngsMatchingOriginal:records.length-sourceDifferences.length,sourceDifferences,runtimeComponents:paths.size,asepriteRuntimeFiles:0,referenceComparison:results,comparison,wholeFrameCornerChecks:'passed',artifacts:out,browserVerified:false},null,2));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
