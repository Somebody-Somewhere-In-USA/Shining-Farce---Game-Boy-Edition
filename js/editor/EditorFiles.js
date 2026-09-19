(function(G){
 "use strict";
 G.editor.EditorFiles={
  download(name,text,type="application/json"){const blob=new Blob([text],{type}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);},
  import(onText,onError){const input=document.createElement("input");input.type="file";input.accept=".json,application/json";input.addEventListener("change",async()=>{try{if(input.files[0])onText(await input.files[0].text());}catch(e){onError(e);}});input.click();}
 };
}(window.GBTRPG));
