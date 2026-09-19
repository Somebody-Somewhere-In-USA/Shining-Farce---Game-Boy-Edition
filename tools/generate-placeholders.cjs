// Optional asset AUTHORING utility. Never loaded by the game; shipped PNGs need no tooling.
// Uses only Node built-ins, reads the authoritative palette, and writes replaceable pixel art.
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const context = { window: { GBTRPG: { config: {} } } };
vm.runInNewContext(fs.readFileSync(path.join(root, 'js/config/palette.js'), 'utf8'), context);
const palette = context.window.GBTRPG.config.PALETTE;
const colors = ['darkest', 'dark', 'light', 'lightest'].map(key => {
  const hex = palette[key].slice(1); return [0, 2, 4].map(i => parseInt(hex.slice(i, i + 2), 16)).concat(255);
});
function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) { crc ^= byte; for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0); }
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, bytes) {
  const name = Buffer.from(type), size = Buffer.alloc(4), crc = Buffer.alloc(4);
  size.writeUInt32BE(bytes.length); crc.writeUInt32BE(crc32(Buffer.concat([name, bytes])));
  return Buffer.concat([size, name, bytes, crc]);
}
function art(width, height, shade = null) {
  const pixels = Buffer.alloc(width * height * 4);
  const dot = (x, y, color) => { if (x >= 0 && y >= 0 && x < width && y < height) pixels.set(colors[color], (y * width + x) * 4); };
  const box = (x, y, w, h, color) => { for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) dot(xx, yy, color); };
  if (shade !== null) box(0, 0, width, height, shade);
  return { dot, box, save(relative) {
    const header = Buffer.alloc(13); header.writeUInt32BE(width); header.writeUInt32BE(height, 4); header[8] = 8; header[9] = 6;
    const rows = Buffer.alloc((width * 4 + 1) * height);
    for (let y = 0; y < height; y++) pixels.copy(rows, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
    const dest = path.join(root, relative); fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]), chunk('IHDR', header), chunk('IDAT', zlib.deflateSync(rows)), chunk('IEND', Buffer.alloc(0))]));
    console.log(relative + ' ' + width + 'x' + height);
  } };
}
// Compact 5x7 glyph designs. This authoring source is separate from the external runtime atlas.
const glyphs = {
  ' ': '00000/00000/00000/00000/00000/00000/00000',
  A:'01110/10001/10001/11111/10001/10001/10001', B:'11110/10001/10001/11110/10001/10001/11110',
  C:'01111/10000/10000/10000/10000/10000/01111', D:'11110/10001/10001/10001/10001/10001/11110',
  E:'11111/10000/10000/11110/10000/10000/11111', F:'11111/10000/10000/11110/10000/10000/10000',
  G:'01111/10000/10000/10111/10001/10001/01111', H:'10001/10001/10001/11111/10001/10001/10001',
  I:'11111/00100/00100/00100/00100/00100/11111', J:'00111/00010/00010/00010/10010/10010/01100',
  K:'10001/10010/10100/11000/10100/10010/10001', L:'10000/10000/10000/10000/10000/10000/11111',
  M:'10001/11011/10101/10101/10001/10001/10001', N:'10001/11001/10101/10011/10001/10001/10001',
  O:'01110/10001/10001/10001/10001/10001/01110', P:'11110/10001/10001/11110/10000/10000/10000',
  Q:'01110/10001/10001/10001/10101/10010/01101', R:'11110/10001/10001/11110/10100/10010/10001',
  S:'01111/10000/10000/01110/00001/00001/11110', T:'11111/00100/00100/00100/00100/00100/00100',
  U:'10001/10001/10001/10001/10001/10001/01110', V:'10001/10001/10001/10001/10001/01010/00100',
  W:'10001/10001/10001/10101/10101/11011/10001', X:'10001/10001/01010/00100/01010/10001/10001',
  Y:'10001/10001/01010/00100/00100/00100/00100', Z:'11111/00001/00010/00100/01000/10000/11111',
  '0':'01110/10001/10011/10101/11001/10001/01110', '1':'00100/01100/00100/00100/00100/00100/01110',
  '2':'01110/10001/00001/00010/00100/01000/11111', '3':'11110/00001/00001/01110/00001/00001/11110',
  '4':'00010/00110/01010/10010/11111/00010/00010', '5':'11111/10000/10000/11110/00001/00001/11110',
  '6':'01110/10000/10000/11110/10001/10001/01110', '7':'11111/00001/00010/00100/01000/01000/01000',
  '8':'01110/10001/10001/01110/10001/10001/01110', '9':'01110/10001/10001/01111/00001/00001/01110',
  '!':'00100/00100/00100/00100/00100/00000/00100', '?':'01110/10001/00001/00010/00100/00000/00100',
  '.':'00000/00000/00000/00000/00000/00000/00100', ',':'00000/00000/00000/00000/00000/00100/01000',
  ':':'00000/00100/00000/00000/00100/00000/00000', ';':'00000/00100/00000/00000/00100/01000/00000',
  '/':'00001/00010/00010/00100/01000/01000/10000', '-':'00000/00000/00000/11111/00000/00000/00000',
  '+':'00000/00100/00100/11111/00100/00100/00000', '=':'00000/00000/11111/00000/11111/00000/00000',
  '<':'00010/00100/01000/10000/01000/00100/00010', '>':'01000/00100/00010/00001/00010/00100/01000',
  '(':'00010/00100/01000/01000/01000/00100/00010', ')':'01000/00100/00010/00010/00010/00100/01000',
  '[':'01110/01000/01000/01000/01000/01000/01110', ']':'01110/00010/00010/00010/00010/00010/01110',
  "'":'00100/00100/00000/00000/00000/00000/00000', '"':'01010/01010/00000/00000/00000/00000/00000',
  '#':'01010/11111/01010/01010/11111/01010/00000', '%':'11001/11010/00100/01000/10110/00110/00000',
  '&':'01100/10010/10100/01000/10101/10010/01101', '*':'00000/10101/01110/11111/01110/10101/00000',
  '@':'01110/10001/10111/10101/10111/10000/01110', '\\':'10000/01000/01000/00100/00010/00010/00001',
  '^':'00100/01010/10001/00000/00000/00000/00000', '_':'00000/00000/00000/00000/00000/00000/11111',
  '$':'00100/01111/10100/01110/00101/11110/00100'
};
const font = art(96, 32);
for (let code = 32; code <= 95; code++) {
  const index = code - 32, rows = (glyphs[String.fromCharCode(code)] || glyphs['?']).split('/');
  rows.forEach((row, y) => [...row].forEach((v, x) => { if (v === '1') font.dot(index % 16 * 6 + x, Math.floor(index / 16) * 8 + y, 0); }));
}
font.save('assets/fonts/placeholder-font.png');
const frame = art(12, 12, 3);
frame.box(0, 0, 12, 1, 0); frame.box(0, 11, 12, 1, 0); frame.box(0, 0, 1, 12, 0); frame.box(11, 0, 1, 12, 0);
frame.dot(1, 1, 1); frame.dot(10, 1, 1); frame.dot(1, 10, 1); frame.dot(10, 10, 1);
frame.save('assets/ui/placeholder-window.png');
const cursor = art(24, 16);
for (const [x,y] of [[0,0],[12,0],[0,12],[12,12]]) {
  cursor.box(x,y,4,4,3);
  cursor.box(x, y === 0 ? 0 : 15,4,1,0); cursor.box(x === 0 ? 0 : 15,y,1,4,0);
}
for (let y = 0; y < 7; y++) cursor.box(17, y, 4 - Math.abs(3-y), 1, 0);
cursor.save('assets/ui/placeholder-cursors.png');
const markers = art(32, 8);
markers.box(1,1,6,6,3); markers.box(2,0,4,1,0); markers.box(2,7,4,1,0); markers.box(0,2,1,4,0); markers.box(7,2,1,4,0);
for (const [x,y] of [[1,1],[6,1],[1,6],[6,6]]) markers.dot(x,y,0);
markers.box(9,0,6,8,3); markers.box(10,0,1,8,0); markers.box(11,1,4,3,0); markers.box(9,7,4,1,0);
markers.box(16,0,8,8,3);
for(let i=0;i<6;i++){ markers.dot(17+i,1+i,0); markers.dot(22-i,1+i,0); }
markers.box(25,1,1,7,0); markers.box(26,1,4,3,0); markers.dot(29,3,3);
markers.save('assets/world/placeholder-markers.png');
const world = art(160, 84, 3);
for (let y=0;y<84;y++) {
  const coast = 8 + Math.floor(y/12)%3*3;
  world.box(0,y,coast,1,2); world.dot(coast,y,1);
  if (y%8===4) world.box(1,y,4,1,3);
}
function mountain(x,y) { for(let row=0;row<8;row++){ world.box(x-row,y+row,row*2+1,1,1); if(row>2) world.box(x-row+2,y+row,row,1,2); } world.dot(x,y+1,3); }
for(const [x,y] of [[37,3],[48,6],[56,1],[105,5],[117,8],[96,33],[105,38],[89,43]]) mountain(x,y);
function tree(x,y) { world.box(x+3,y+6,2,3,1); for(let row=0;row<5;row++) world.box(x+3-Math.floor(row/2),y+row,1+Math.floor(row/2)*2,1,row%2?1:2); }
for(const [x,y] of [[26,54],[33,61],[40,58],[43,68],[49,57],[61,72],[72,67],[74,58],[18,12],[25,18]]) tree(x,y);
for(let y=8;y<80;y+=13) for(let x=20;x<157;x+=19) { if((x+y)%3===0){world.dot(x,y,2);world.dot(x+2,y-1,2);} }
for(let y=39;y<84;y++){ const x=119+Math.floor(y/9)%3;world.box(x,y,3,1,2); }
world.save('assets/world/placeholder-borderlands.png');
