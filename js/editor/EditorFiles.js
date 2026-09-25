(function(G){
 "use strict";
 G.editor.EditorFiles={
  download(name,text,type="application/json"){const blob=new Blob([text],{type}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);},
  import(onText,onError,onCancel=()=>{},dom=document){const input=dom.createElement("input");input.type="file";input.accept=".json,application/json";input.addEventListener("cancel",onCancel);input.addEventListener("change",async()=>{try{if(input.files?.[0])onText(await input.files[0].text());else onCancel();}catch(e){onError(e);}});input.click();return input;},
  // Uncompressed ZIP: no library, server, or multiple-download permission needed.
  // Fixed timestamps and UTF-8 names keep identical authored packages byte-identical.
  zip(files){
   const utf8=text=>{const bytes=[];for(const c of text){const n=c.codePointAt(0);if(n<128)bytes.push(n);else if(n<2048)bytes.push(192|(n>>6),128|(n&63));else if(n<65536)bytes.push(224|(n>>12),128|((n>>6)&63),128|(n&63));else bytes.push(240|(n>>18),128|((n>>12)&63),128|((n>>6)&63),128|(n&63));}return Uint8Array.from(bytes);};
   const crc=bytes=>{let n=0xffffffff;for(const b of bytes){n^=b;for(let i=0;i<8;i++)n=(n>>>1)^((n&1)?0xedb88320:0);}return(n^0xffffffff)>>>0;};
   const chunks=[],central=[],paths=new Set();let offset=0,total=0;
   G.campaign.Validation.assert(files.length<65536,"too many shipping files");
   for(const file of files){
    G.campaign.Validation.assert(!paths.has(file.path)&&/^[a-zA-Z0-9_./-]+$/.test(file.path)&&!file.path.startsWith("/")&&!file.path.split("/").includes(".."),"invalid or duplicate shipping path");paths.add(file.path);
    const name=utf8(file.path),data=utf8(file.text),sum=crc(data),local=new Uint8Array(30+name.length),lv=new DataView(local.buffer),entry=new Uint8Array(46+name.length),ev=new DataView(entry.buffer);
    G.campaign.Validation.assert(name.length<65536&&offset+data.length+local.length<0xffffffff,"shipping package exceeds ZIP limits");
    lv.setUint32(0,0x04034b50,true);lv.setUint16(4,20,true);lv.setUint16(6,0x800,true);lv.setUint16(12,33,true);lv.setUint32(14,sum,true);lv.setUint32(18,data.length,true);lv.setUint32(22,data.length,true);lv.setUint16(26,name.length,true);local.set(name,30);
    ev.setUint32(0,0x02014b50,true);ev.setUint16(4,20,true);ev.setUint16(6,20,true);ev.setUint16(8,0x800,true);ev.setUint16(14,33,true);ev.setUint32(16,sum,true);ev.setUint32(20,data.length,true);ev.setUint32(24,data.length,true);ev.setUint16(28,name.length,true);ev.setUint32(42,offset,true);entry.set(name,46);
    chunks.push(local,data);central.push(entry);offset+=local.length+data.length;total+=entry.length;
   }
   G.campaign.Validation.assert(offset+total+22<0xffffffff,"shipping package exceeds ZIP limits");
   const end=new Uint8Array(22),view=new DataView(end.buffer);view.setUint32(0,0x06054b50,true);view.setUint16(8,files.length,true);view.setUint16(10,files.length,true);view.setUint32(12,total,true);view.setUint32(16,offset,true);
   const result=new Uint8Array(offset+total+22);let cursor=0;for(const chunk of [...chunks,...central,end]){result.set(chunk,cursor);cursor+=chunk.length;}return result;
  }
 };
}(window.GBTRPG));
