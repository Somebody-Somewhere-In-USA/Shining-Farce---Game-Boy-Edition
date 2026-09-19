// Optional offline QA; no runtime dependency. Requires the same existing Canvas2D package as rendering QA.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const AUTHORIZED=['#9BBC0F','#8BAC0F','#306230','#0F380F'];
function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(path.join(dir,e.name)):[path.join(dir,e.name)]);}
async function validate(root,canvasLibrary){
 const {createCanvas,loadImage}=canvasLibrary,allowed=new Set(AUTHORIZED),pngs=files(path.join(root,'assets')).filter(f=>/\.png$/i.test(f)),sourceFiles=[path.join(root,'index.html'),...files(path.join(root,'css')),...files(path.join(root,'js')).filter(f=>!f.includes(path.sep+'debug'+path.sep))];
 let pixels=0;const used=new Set();
 for(const file of pngs){const image=await loadImage(file),canvas=createCanvas(image.width,image.height),c=canvas.getContext('2d');c.drawImage(image,0,0);const data=c.getImageData(0,0,canvas.width,canvas.height).data;
  for(let i=0;i<data.length;i+=4){if(data[i+3]===0)continue;const color='#'+Array.from(data.slice(i,i+3)).map(n=>n.toString(16).padStart(2,'0')).join('').toUpperCase();if(data[i+3]!==255||!allowed.has(color))throw Error(path.relative(root,file)+': forbidden pixel '+color+' alpha '+data[i+3]);used.add(color);pixels++;}
 }
 for(const file of sourceFiles){const source=fs.readFileSync(file,'utf8');for(const m of source.matchAll(/#[0-9a-fA-F]{6}\b/g))if(!allowed.has(m[0].toUpperCase()))throw Error(path.relative(root,file)+': forbidden hardcoded color '+m[0]);if(/(?:fillStyle|strokeStyle)\s*=\s*["'](?!transparent)[a-z]+["']|rgba?\s*\(|hsla?\s*\(/.test(source))throw Error(path.relative(root,file)+': color literal needs explicit palette review');}
 const c=vm.createContext({window:{GBTRPG:{config:{}}}});vm.runInContext(fs.readFileSync(path.join(root,'js/config/palette.js'),'utf8'),c);const configured=[...new Set(Object.values(c.window.GBTRPG.config.PALETTE))].sort();if(JSON.stringify(configured)!==JSON.stringify([...allowed].sort()))throw Error('Authoritative palette is not exactly the four required colors');
 return{shippingPngsChecked:pngs.length,opaquePixelsChecked:pixels,runtimeSourceFilesChecked:sourceFiles.length,authorizedColors:AUTHORIZED,colorsObserved:[...used].sort(),forbiddenColors:0,partialAlphaPixels:0};
}
module.exports={validate,AUTHORIZED};
if(require.main===module)validate(path.resolve(__dirname,'..'),require(process.argv[2]||'@napi-rs/canvas')).then(r=>console.log(JSON.stringify(r,null,2))).catch(e=>{console.error(e);process.exitCode=1;});
