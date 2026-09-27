(function(G){
 "use strict";
 // One URL and decode contract for preview and readiness. No shared success cache.
 const url=entry=>entry.path.split('/').map(encodeURIComponent).join('/')+'?v='+encodeURIComponent(entry.hash);
 function load(entry,{createImage=()=>new Image(),timeoutMs=15000,refresh=null}={}){
  const source=url(entry)+(refresh===null?'':'&verify='+encodeURIComponent(refresh));
  return new Promise(resolve=>{let image,timer,finished=false;
   const finish=error=>{if(finished)return;finished=true;clearTimeout(timer);if(image){image.onload=null;image.onerror=null;}resolve({image:error?null:image,error:error?error+' / '+source:null,url:source});};
   try{
    image=createImage();image.onload=async()=>{try{
     if(typeof image.decode==='function')await image.decode();
     if(image.complete===false||(image.naturalWidth??image.width)!==entry.width||(image.naturalHeight??image.height)!==entry.height)finish('PNG dimensions changed; update catalog and refresh');
     else finish(null);
    }catch(error){finish('PNG decode failed; update catalog and refresh');}};
    image.onerror=()=>finish('PNG unavailable; update catalog and refresh');
    timer=setTimeout(()=>finish('PNG verification timed out; retry readiness'),timeoutMs);image.src=source;
   }catch(error){finish('PNG verification failed: '+error.message);}
  });
 }
 G.rendering.SceneAssetLoader={url,load};
}(window.GBTRPG));
