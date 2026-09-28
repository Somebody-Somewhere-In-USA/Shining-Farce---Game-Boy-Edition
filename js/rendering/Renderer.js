(function (G) {
  "use strict";

  class Renderer {
    constructor(canvas, assets) {
      this.canvas = canvas;
      this.assets = assets;
      this.ctx = canvas.getContext("2d", { alpha: false });

      canvas.width = G.config.GRAPHICS.internalWidth;
      canvas.height = G.config.GRAPHICS.internalHeight;

      this.ctx.imageSmoothingEnabled = G.config.GRAPHICS.smoothing;
      this.resize = this.resize.bind(this);
      window.addEventListener("resize", this.resize);
      this.resize();
    }

    setDisplaySize(width,height){this.responsiveDisplay=false;this.displaySize={width,height};this.resize();}
    setResponsiveDisplay(){this.displaySize=null;this.responsiveDisplay=true;this.resize();}

    resize() {
      if(this.responsiveDisplay){
        const width=window.innerWidth>0?window.innerWidth:this.canvas.width,height=window.innerHeight>0?window.innerHeight:this.canvas.height;
        this.scale=Math.min(width/this.canvas.width,height/this.canvas.height);
        const w=this.canvas.width*this.scale,h=this.canvas.height*this.scale;
        this.canvas.style.width=w+'px';this.canvas.style.height=h+'px';this.onDisplayResize?.(w,h);return;
      }
      if(this.displaySize){this.canvas.style.width=this.displaySize.width+"px";this.canvas.style.height=this.displaySize.height+"px";this.scale=this.displaySize.width/this.canvas.width;return;}
      // Integer CSS scale: viewport resizing never changes logical coordinates.
      const scale = Math.max(1, Math.floor(Math.min(window.innerWidth / this.canvas.width, window.innerHeight / this.canvas.height)));
      this.canvas.style.width = (this.canvas.width * scale) + "px";
      this.canvas.style.height = (this.canvas.height * scale) + "px";
      this.scale = scale;
    }

    clear() {
      this.ctx.fillStyle = G.config.PALETTE.background;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  G.rendering.Renderer = Renderer;
}(window.GBTRPG));
