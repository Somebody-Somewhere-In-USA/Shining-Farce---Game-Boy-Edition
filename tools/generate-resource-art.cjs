// Optional native 16px authoring utility; no enlarged 8px source artwork is used.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {createCanvas}=require(process.argv[2]||'@napi-rs/canvas'),root=path.resolve(__dirname,'..');
const sandbox={window:{GBTRPG:{config:{}}}};vm.runInNewContext(fs.readFileSync(path.join(root,'js/config/palette.js'),'utf8'),sandbox);
const p=sandbox.window.GBTRPG.config.PALETTE,c=[p.background,p.darkest,p.dark,p.light,p.lightest];
function art(name,w,h,paint){const canvas=createCanvas(w,h),ctx=canvas.getContext('2d');const rect=(x,y,w,h,shade)=>{ctx.fillStyle=c[shade];ctx.fillRect(x,y,w,h);};paint(rect);fs.writeFileSync(path.join(root,'assets/world',name+'.png'),canvas.toBuffer('image/png'));}
art('terrain16',96,16,r=>{for(let frame=0;frame<6;frame++){
 const o=frame*16,q=(x,y,w,h,c)=>r(o+x,y,w,h,c);q(0,0,16,16,frame===1?2:0);
 if(frame===0){q(3,5,1,2,3);q(2,6,3,1,3);q(11,12,2,1,3);}
 if(frame===1){for(const[x,y]of[[2,3],[9,9],[1,13]]){q(x,y,4,1,0);q(x+1,y+1,3,1,4);}}
 if(frame===2){q(7,10,2,5,1);q(5,3,6,8,1);q(3,6,10,5,1);q(6,2,4,2,1);q(6,4,3,2,3);q(4,7,4,2,2);q(7,9,4,1,3);}
 if(frame===3){for(let y=2;y<14;y++){const half=Math.floor((y-1)/2);q(8-half,y,half*2+1,1,1);if(half>0)q(9-half,y,half*2-1,1,y<7?0:2);}q(5,11,2,1,3);q(9,13,4,1,3);}
 if(frame===4){q(0,0,16,16,3);q(2,4,2,1,4);q(11,12,3,1,4);}
 if(frame===5){q(3,7,1,4,2);q(5,6,1,5,2);q(2,11,6,1,3);q(11,13,3,1,2);}
}});
function unit(name,kind){art(name,16,16,r=>{
 if(kind==='centaur'){r(6,2,5,5,1);r(7,3,3,3,0);r(5,7,7,4,2);r(2,9,10,3,1);r(3,10,7,2,3);r(2,12,2,3,1);r(9,12,2,3,1);r(13,1,1,13,1);r(12,0,3,2,0);return;}
 r(5,2,6,6,1);r(6,3,4,4,0);r(5,8,6,5,1);r(6,9,4,3,kind==='healer'?0:kind==='mage'?2:3);r(4,9,1,3,1);r(11,9,1,3,1);r(5,13,2,2,1);r(9,13,2,2,1);
 if(kind==='sword'||kind==='aren'){r(5,2,6,2,2);r(4,3,1,3,1);r(11,3,1,3,1);r(2,6,1,8,1);r(1,10,3,1,0);r(12,9,3,4,1);r(13,10,1,2,0);}
 if(kind==='aren'){r(4,1,8,1,3);r(4,0,1,2,1);r(7,0,1,2,1);r(11,0,1,2,1);r(3,11,2,3,3);r(11,12,2,2,3);}
 if(kind==='healer'){r(7,0,2,4,1);r(5,1,6,1,1);r(2,4,1,11,1);r(1,3,3,2,0);r(7,9,2,4,3);}
 if(kind==='mage'){r(7,0,2,1,1);r(6,1,4,1,2);r(5,2,6,1,2);r(3,3,10,1,1);r(3,13,10,1,2);r(13,5,1,10,1);r(12,4,3,2,0);}
 if(kind==='orc'){r(3,0,2,3,1);r(11,0,2,3,1);r(5,3,6,1,2);r(6,5,1,1,1);r(9,5,1,1,1);r(7,7,2,1,1);r(13,6,1,9,1);r(12,5,3,3,2);}
});}
for(const[n,k]of[['unit-aren','aren'],['unit-swordsman','sword'],['unit-healer','healer'],['unit-mage','mage'],['unit-centaur','centaur'],['unit-orc','orc']])unit(n,k);
art('empty-squad16',16,16,r=>{r(4,2,1,13,1);r(5,2,8,6,1);r(6,3,5,4,0);r(7,4,3,1,2);r(7,5,1,1,2);r(2,15,6,1,1);});
art('wagon16',16,16,r=>{r(1,6,13,6,1);r(2,7,11,4,3);r(3,3,9,4,1);r(4,4,7,3,0);r(7,4,1,7,2);r(2,12,4,3,1);r(10,12,4,3,1);r(3,13,2,1,0);r(11,13,2,1,0);r(14,10,2,1,1);});
art('report16',16,16,r=>{r(4,1,8,2,1);r(3,3,2,3,1);r(11,3,2,4,1);r(8,7,4,2,1);r(7,9,2,2,1);r(7,13,2,2,1);});
art('cursor16',16,16,r=>{for(const[x,y]of[[0,0],[10,0],[0,15],[10,15]])r(x,y,6,1,0);for(const[x,y]of[[0,0],[15,0],[0,10],[15,10]])r(x,y,1,6,0);for(const[x,y]of[[1,1],[11,1],[1,14],[11,14]])r(x,y,4,1,1);for(const[x,y]of[[1,1],[14,1],[1,11],[14,11]])r(x,y,1,4,1);});
art('locations16',64,16,r=>{for(let f=0;f<4;f++){const o=f*16,q=(x,y,w,h,c)=>r(o+x,y,w,h,c);
 if(f===0){q(2,7,12,8,1);q(3,8,10,6,0);for(let y=2;y<7;y++)q(8-(y-1),y,(y-1)*2,1,2);q(7,11,3,4,1);q(4,9,2,2,2);q(11,9,2,2,2);}
 if(f===1){q(7,2,2,13,1);q(3,4,10,4,1);q(4,5,7,2,0);q(5,14,6,1,1);}
 if(f===2){q(3,6,10,9,1);q(4,7,8,7,2);q(2,3,3,4,1);q(7,3,3,4,1);q(12,3,2,4,1);q(6,11,4,4,1);q(4,8,2,2,0);q(10,8,2,2,0);}
 if(f===3){q(7,1,2,8,1);q(4,3,8,2,1);q(3,10,10,5,1);q(4,11,8,3,0);q(6,8,4,2,2);q(7,11,2,3,2);}
}});
art('capital32',32,32,r=>{r(2,10,28,21,1);r(4,12,24,17,2);r(2,7,6,24,1);r(24,7,6,24,1);r(3,9,4,20,0);r(25,9,4,20,0);for(const x of[2,6,24,28])r(x,4,2,5,1);r(11,3,10,24,1);r(12,6,8,19,0);r(12,2,2,4,1);r(18,2,2,4,1);r(14,16,4,14,1);r(15,17,2,13,3);for(const x of[4,26,14,18]){r(x,11,2,3,1);r(x,7,1,2,2);}r(15,0,1,3,1);r(16,0,5,2,3);});
console.log('Wrote 13 native strategic assets.');

art("ocean16",16,16,r=>{r(0,0,16,16,2);for(const [x,y]of [[2,3],[9,9],[1,13]]){r(x,y,4,1,0);r(x+1,y+1,3,1,4);}});
