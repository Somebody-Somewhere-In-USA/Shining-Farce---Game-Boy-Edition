// Optional authoring tool. The game loads the resulting PNGs and static map data.
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const { createCanvas } = require(process.argv[2] || '@napi-rs/canvas');
const root = path.resolve(__dirname, '..'), context = { window: { GBTRPG: { config: {} } } };
vm.runInNewContext(fs.readFileSync(path.join(root,'js/config/palette.js'),'utf8'), context);
const p = context.window.GBTRPG.config.PALETTE;
const colors = [null,p.darkest,p.dark,p.light,p.lightest,p.background];
function save(name, frames) {
  const canvas = createCanvas(frames.length * 8, 8), ctx = canvas.getContext('2d');
  frames.forEach((rows,f) => rows.forEach((row,y) => [...row].forEach((v,x) => {
    if (+v) { ctx.fillStyle = colors[+v]; ctx.fillRect(f*8+x,y,1,1); }
  })));
  fs.writeFileSync(path.join(root,'assets/world',name+'.png'),canvas.toBuffer('image/png'));
}
save('terrain', [
 ['55555555','55555555','55355555','55555555','55555555','55555555','55555355','55555555'],
 ['22222222','22222222','24422222','22222442','22222222','22222222','22244222','22222222'],
 ['55515555','55121555','51232155','51111155','55515555','51555155','12151215','11151115'],
 ['55515555','55141555','51444155','14434415','14333415','13333331','11111111','55555555'],
 ['33333333','33333333','33333333','33343333','33333333','33333333','33333333','33333333'],
 ['55555555','55255555','55225555','55555555','55552255','55552555','55555555','55555555']
]);
save('locations', [
 ['10101010','11111110','12222210','12424210','12222210','12211210','11111110','00000000'],
 ['00010000','00121000','01232100','11111110','01444100','01414100','01111100','00000000'],
 ['00010000','00010000','01111110','01222100','00010000','00010000','00111000','00000000'],
 ['00010000','00141000','01444100','00141000','00141000','01111100','01222100','01111100']
]);
save('squad-mc', [['00111000','01141100','01444100','00111000','01313100','13333310','00101000','01101100']]);
save('squad-player', [['00111000','01222100','01444100','00111000','01222100','01222100','00101000','01101100']]);
save('squad-zeon', [['01000100','01111100','01414100','00111000','01222100','11111110','00101000','01101100']]);
save('squad-report', [['00111000','01444100','00004100','00041000','00010000','00000000','00010000','00000000']]);
save('map-cursor', [['44400444','41000014','40000004','00000000','00000000','40000004','41000014','44400444']]);
const rows = Array.from({length:40},(_,y) => Array.from({length:64},(_,x) => {
  if (x>57 || y>36 || (x<5 && y<12)) return 'w';
  if (y<5 && x>16 && x<44 || x>32 && x<39 && y<21) return 'm';
  if (x>15 && x<29 && y>19 && y<32 || x<8 && y>23) return 'f';
  if (x>29 && x<47 && y>25 && y<35) return 's';
  return '.';
}));
const points = [[8,18],[18,11],[22,26],[32,8],[50,13],[39,24],[56,32]];
for (const [a,b] of [[0,1],[0,2],[1,3],[3,4],[3,5],[2,5],[5,6]]) {
  let [x,y] = points[a], [tx,ty] = points[b];
  const dx=Math.abs(tx-x),dy=-Math.abs(ty-y),sx=Math.sign(tx-x),sy=Math.sign(ty-y);let error=dx+dy;
  while (true) {
    rows[y][x]='r';if(x===tx&&y===ty)break;
    const e=2*error;if(e>=dy){error+=dy;x+=sx;}if(e<=dx){error+=dx;y+=sy;}
  }
}
for (const [x,y] of points) for(let dy=-1;dy<=1;dy++) for(let dx=-1;dx<=4;dx++) rows[y+dy][x+dx]='.';
fs.writeFileSync(path.join(root,'js/data/worldVisuals.js'), '(function (G) {\n  "use strict";\n  // Decorative terrain; graph routes alone govern travel.\n  G.data.WORLD_VISUALS = Object.freeze({ tileSize: 16, width: 64, height: 40,\n    tiles: Object.freeze({".":0,w:1,f:2,m:3,r:4,s:5}),\n    rows: Object.freeze('+JSON.stringify(rows.map(r=>r.join('')),null,2)+')\n  });\n}(window.GBTRPG));\n');
console.log('Wrote seven strategic PNGs and static terrain data.');
