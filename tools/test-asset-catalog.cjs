// No packages or browser needed. Real PNG fixture files live only in the OS temp directory.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),zlib=require('node:zlib'),assert=require('node:assert/strict');
const C=require('./update-asset-catalog.cjs');
function chunk(type,data){const body=Buffer.concat([Buffer.from(type),data]),n=Buffer.alloc(4),checksum=Buffer.alloc(4);n.writeUInt32BE(data.length);checksum.writeUInt32BE(C.crc(body));return Buffer.concat([n,body,checksum]);}
function png(w,h,{pixel=[155,188,15,255],filter=0,depth=8,type=6,interlace=0}={}){
 const header=Buffer.alloc(13);header.writeUInt32BE(w);header.writeUInt32BE(h,4);header[8]=depth;header[9]=type;header[12]=interlace;
 const parts=[],passes=interlace?[[0,0,8,8],[4,0,8,8],[0,4,4,8],[2,0,4,4],[0,2,2,4],[1,0,2,2],[0,1,1,2]]:[[0,0,1,1]];
 for(const [x,y,dx,dy]of passes){const pw=Math.max(0,Math.ceil((w-x)/dx)),ph=Math.max(0,Math.ceil((h-y)/dy));if(!pw||!ph)continue;const bpp=type===3?1:4*(depth/8),length=type===3?Math.ceil(pw*depth/8):pw*bpp;let prev=Buffer.alloc(length);
  for(let yy=0;yy<ph;yy++){const row=Buffer.alloc(length);if(type!==3)for(let xx=0;xx<pw;xx++)for(let k=0;k<4;k++){if(depth===16)row.writeUInt16BE(pixel[k]*257,xx*bpp+k*2);else row[xx*bpp+k]=pixel[k];}
   const coded=Buffer.from(row);for(let i=0;i<length;i++){const a=i>=bpp?row[i-bpp]:0,b=prev[i],c=i>=bpp?prev[i-bpp]:0,p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);coded[i]=(row[i]-[0,a,b,Math.floor((a+b)/2),pa<=pb&&pa<=pc?a:pb<=pc?b:c][filter])&255;}
   parts.push(Buffer.from([filter]),coded);prev=row;
  }
 }
 return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',header),...(type===3?[chunk('PLTE',Buffer.from(pixel.slice(0,3))),chunk('tRNS',Buffer.from([pixel[3]]))]:[]),chunk('IDAT',zlib.deflateSync(Buffer.concat(parts))),chunk('IEND',Buffer.alloc(0))]);
}
function run(){const root=fs.mkdtempSync(path.join(os.tmpdir(),'shining-asset-test-'));let count=0;
 const test=(name,fn)=>{fn();count++;console.log('PASS CATALOG '+name);};
 const put=(category,name,w=128,h=96,opts={})=>{const p=path.join(root,C.directories[category],name);fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,png(w,h,opts));return p;};
 const find=(cat,id)=>cat.entries.find(e=>e.id===id);
 for(let filter=0;filter<=4;filter++)test('RGBA FILTER '+filter,()=>assert.deepEqual(C.png(png(13,7,{filter})),{width:13,height:7}));
 for(const depth of [1,2,4,8])test('INDEXED DEPTH '+depth,()=>assert.equal(C.png(png(13,7,{type:3,depth})).width,13));
 test('16 BIT EXACT PALETTE',()=>assert.equal(C.png(png(13,7,{depth:16})).width,13));
 test('ADAM7 INTERLACE',()=>assert.equal(C.png(png(13,7,{interlace:1,filter:4})).height,7));
 test('TRANSPARENT RGB IGNORED',()=>assert.equal(C.png(png(2,2,{pixel:[255,1,222,0]})).height,2));
 test('PARTIAL ALPHA REJECTED',()=>assert.throws(()=>C.png(png(2,2,{pixel:[155,188,15,127]})),/Partial alpha/));
 test('WRONG PALETTE REJECTED',()=>assert.throws(()=>C.png(png(2,2,{pixel:[255,0,0,255]})),/four-color/));
 test('TRUNCATED PNG REJECTED',()=>assert.throws(()=>C.png(png(2,2).subarray(0,40))));
 test('CORRUPT CRC REJECTED',()=>{const b=png(2,2);b[30]^=1;assert.throws(()=>C.png(b),/checksum/);});
 test('UNSUPPORTED COLOR PROFILE QUARANTINED',()=>{const b=png(2,2),profile=chunk('iCCP',Buffer.from([0]));assert.throws(()=>C.png(Buffer.concat([b.subarray(0,33),profile,b.subarray(33)])),/Color profiles/);});
 put('units','zeon-human-fighter-idle-2.png');put('units','zeon-human-fighter-idle-1.png');put('units','zeon-human-fighter-dodge.png');put('backgrounds','meadow.png',256,96);put('floors','stone.png',96,32);put('effects','blaze-1-2.png',45,19);put('effects','blaze-1-1.png',45,19);
 test('VALID SEQUENCES AND NUMERIC ORDER',()=>{const c=C.catalog(root);assert(c.entries.every(e=>e.valid));assert.deepEqual(c.sequences.find(s=>s.id==='effects:blaze-1').frames,['effects:blaze-1-1','effects:blaze-1-2']);});
 test('DUPLICATE DERIVED IDENTITY (SIMULATED CASE COLLISION)',()=>{const read=fs.readdirSync;try{fs.readdirSync=function(dir,...args){const names=read.call(fs,dir,...args);return String(dir).endsWith('units')?[...names,'zeon-human-fighter-idle-1.png']:names;};const c=C.catalog(root);assert(c.entries.filter(e=>e.id==='units:zeon-human-fighter-idle-1').every(e=>!e.valid&&e.errors.includes('Duplicate derived identity')));}finally{fs.readdirSync=read;}});
 test('SINGLE FRAME WITHOUT SUFFIX',()=>assert(C.catalog(root).sequences.find(s=>s.id==='units:zeon-human-fighter-dodge').valid));
 put('units','wrong-size.png',16,16);put('units','zeon-human-fighter-attack-01.png');put('effects','mix-1.png',1,2);put('effects','mix-2.png',2,2);put('effects','ambiguous.png',3,3);put('effects','ambiguous-1.png',3,3);put('backgrounds','bad-color.png',256,96,{pixel:[255,0,0,255]});
 test('UNRELATED INVALID FILE DOES NOT POISON VALID',()=>{const c=C.catalog(root);assert(find(c,'backgrounds:meadow').valid);assert(!find(c,'units:wrong-size').valid);assert(!find(c,'backgrounds:bad-color').valid);});
 test('AMBIGUOUS NUMBERING QUARANTINED',()=>assert(!C.catalog(root).sequences.find(s=>s.id==='effects:ambiguous').valid));
 test('LEADING ZERO NUMBER REJECTED',()=>assert(!find(C.catalog(root),'units:zeon-human-fighter-attack-01').valid));
 test('EFFECT DIMENSION MISMATCH QUARANTINES GROUP',()=>assert(C.catalog(root).entries.filter(e=>e.sequence==='effects:mix').every(e=>!e.valid)));
 const replace=put('floors','replacement.png',96,32),before=fs.readFileSync(replace),id='floors:replacement',hash=find(C.catalog(root),id).hash;
 test('SAME FILENAME REPLACEMENT KEEPS ID CHANGES HASH',()=>{put('floors','replacement.png',96,32,{pixel:[15,56,15,255]});const e=find(C.catalog(root),id);assert(e.valid&&e.hash!==hash);});
 test('RENAME IS A NEW ID',()=>{fs.renameSync(replace,path.join(path.dirname(replace),'renamed.png'));const c=C.catalog(root);assert(!find(c,id)&&find(c,'floors:renamed'));});
 test('ONLY DESIGNATED DIRECTORIES SCANNED',()=>{fs.mkdirSync(path.join(root,'assets/unrelated'),{recursive:true});fs.writeFileSync(path.join(root,'assets/unrelated/ignored.png'),before);assert(!C.catalog(root).entries.some(e=>e.filename==='ignored.png'));});
 test('NO SOURCE MODIFICATION AND ONLY OWNED OUTPUTS',()=>{const original=C.catalog(root),snap=original.entries.map(e=>[e.path,fs.readFileSync(path.join(root,e.path))]);fs.writeFileSync(path.join(root,'keep.txt'),'sentinel');const r=C.update(root);for(const [p,b]of snap)assert(fs.readFileSync(path.join(root,p)).equals(b));assert.equal(fs.readFileSync(path.join(root,'keep.txt'),'utf8'),'sentinel');assert(r.invalid>0&&r.report.includes('QUARANTINED'));});
 test('DETERMINISTIC REGENERATION',()=>{const file=path.join(root,'js/data/assetCatalog.js'),before=fs.readFileSync(file);C.update(root);assert(fs.readFileSync(file).equals(before));});
 console.log(`${count}/${count} catalog checks passed. Fixtures retained at ${root}`);
 return root;
}
if(require.main===module)run();module.exports={png,run};
