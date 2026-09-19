// Optional PNG authoring utility, matching the existing native pixel-art pipeline.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {createCanvas}=require(process.argv[2]||'@napi-rs/canvas');const root=path.resolve(__dirname,'..'),s={window:{GBTRPG:{config:{}}}};
vm.runInNewContext(fs.readFileSync(path.join(root,'js/config/palette.js'),'utf8'),s);const p=s.window.GBTRPG.config.PALETTE;
for(const enemy of [false,true]){const c=createCanvas(16,16),ctx=c.getContext('2d'),r=(x,y,w,h,color)=>{ctx.fillStyle=color;ctx.fillRect(x,y,w,h);};
 r(3,1,10,14,p.darkest);r(1,3,14,10,p.darkest);r(3,2,10,12,p.light);r(2,3,12,10,p.light);r(4,3,8,10,p.background);
 r(4,5,2,2,p.darkest);r(10,5,2,2,p.darkest);
 if(enemy){r(3,3,2,1,p.darkest);r(5,4,2,1,p.darkest);r(11,3,2,1,p.darkest);r(9,4,2,1,p.darkest);r(5,10,6,1,p.darkest);r(4,11,1,1,p.darkest);r(11,11,1,1,p.darkest);}
 else{r(4,9,1,2,p.darkest);r(11,9,1,2,p.darkest);r(5,11,6,1,p.darkest);}
 fs.writeFileSync(path.join(root,'assets/world',enemy?'portal-enemy.png':'portal-friendly.png'),c.toBuffer('image/png'));
}
