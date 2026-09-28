(function(G){
 "use strict";
 const palettes=G.config.DISPLAY_PALETTES,source=palettes[0].colors;
 const components=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
 let nextFilter=0;
 class DisplayPalette {
  constructor(store=new G.core.LocalStore()){
   this.store=store;const saved=store.read('display.v1');this.id=palettes.some(p=>p.id===saved?.palette)&&[1,2].includes(saved?.version)?saved.palette:'canonical';this.committedId=this.id;this.presentationSize=saved?.version===2&&G.config.PRESENTATION_MODES.some(m=>m.id===saved.presentationMode)?saved.presentationMode:saved?.version===1?({1:2,2:4,3:5}[saved.presentationSize]||5):5;this.listeners=new Set();this.notice=null;
  }
  get selected(){return palettes.find(p=>p.id===this.id);}
  // Solve an affine RGB mapping through all four canonical colors. The matrix
  // is calibrated to explicit palette entries, not a hue/saturation adjustment.
  // SVG output avoids readback of potentially origin-tainted file:// canvases.
  static matrix(palette){const rows=source.map(hex=>[...components(hex).map(n=>n/255),1]),result=[];
   for(let channel=0;channel<3;channel++){
    const a=rows.map((row,i)=>[...row,components(palette.colors[i])[channel]/255]);
    for(let col=0;col<4;col++){let pivot=col;for(let r=col+1;r<4;r++)if(Math.abs(a[r][col])>Math.abs(a[pivot][col]))pivot=r;[a[col],a[pivot]]=[a[pivot],a[col]];const scale=a[col][col];if(Math.abs(scale)<1e-10)throw Error('Canonical palette cannot define an output transform');a[col]=a[col].map(v=>v/scale);for(let r=0;r<4;r++)if(r!==col){const factor=a[r][col];a[r]=a[r].map((v,i)=>v-factor*a[col][i]);}}
    result.push(a[0][4],a[1][4],a[2][4],0,a[3][4]);
   }return[...result,0,0,0,1,0];
  }
  static mapPixel(pixel,palette){if(pixel[3]===0)return[...pixel];const index=source.findIndex(c=>components(c).every((n,i)=>n===pixel[i]));if(index<0)throw Error('Noncanonical source framebuffer pixel');return[...components(palette.colors[index]),pixel[3]];}
  attach(canvas,dom=window.document){
   if(canvas.width!==480||canvas.height!==360)throw Error('Display palette target must be the 480x360 logical framebuffer');
   this.canvas=canvas;this.outerStyle=dom?.documentElement?.style;this.apply();if(!dom?.createElementNS)return; // Offline test hosts can inspect the matrix without a DOM compositor.
   const ns='http://www.w3.org/2000/svg',make=(tag,attrs)=>{const node=dom.createElementNS(ns,tag);for(const [key,value]of Object.entries(attrs||{}))node.setAttribute(key,String(value));return node;};
   const svg=make('svg',{'aria-hidden':'true',width:0,height:0});svg.style.position='absolute';svg.style.pointerEvents='none';
   const defs=make('defs'),id='sf-framebuffer-palette-'+(++nextFilter),filter=make('filter',{id,x:0,y:0,width:1,height:1,filterUnits:'objectBoundingBox','color-interpolation-filters':'sRGB'});
   this.matrixNode=make('feColorMatrix',{type:'matrix'});filter.appendChild(this.matrixNode);defs.appendChild(filter);svg.appendChild(defs);dom.body.appendChild(svg);this.filterId=id;this.apply();
  }
  apply(){this.outerStyle?.setProperty('--clear-color',this.selected.outside);if(!this.canvas||!this.matrixNode)return;this.matrixNode.setAttribute('values',DisplayPalette.matrix(this.selected).map(n=>Number(n.toPrecision(15))).join(' '));this.canvas.style.filter=this.id==='canonical'?'none':'url("#'+this.filterId+'")';}
  subscribe(listener){this.listeners.add(listener);return()=>this.listeners.delete(listener);}
  preview(id){if(!palettes.some(p=>p.id===id))throw Error('Unknown display palette');const changed=id!==this.id;this.id=id;this.apply();if(changed)for(const listener of this.listeners)listener({paletteChanged:true});}
  choose(id){this.preview(id);this.committedId=id;return this.save();}
  chooseSize(size){if(!G.config.PRESENTATION_MODES.some(m=>m.id===size))throw Error('Unknown presentation size');const changed=size!==this.presentationSize;this.presentationSize=size;if(changed)for(const listener of this.listeners)listener({sizeChanged:true});return this.save();}
  cycleSize(){this.chooseSize(this.presentationSize%5+1);return this.presentationSize;}
  save(){const saved=this.store.write('display.v1',{version:2,palette:this.committedId,presentationMode:this.presentationSize});this.notice=saved?null:'DISPLAY ACTIVE / PREFERENCE NOT SAVED: '+this.store.error;return saved;}
  cycle(){this.choose(palettes[(palettes.findIndex(p=>p.id===this.id)+1)%palettes.length].id);return this.selected;}
 }
 G.rendering.DisplayPalette=DisplayPalette;
}(window.GBTRPG));
