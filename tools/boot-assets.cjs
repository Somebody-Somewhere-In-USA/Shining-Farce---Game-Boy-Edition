const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
function inspect(root,boot){
 const records=JSON.parse(fs.readFileSync(path.join(root,'docs/reference/boot-source-manifest.json'),'utf8'));assert.equal(records.length,29);
 // Provenance is checked by developer QA; only the 29 external resources are runtime requirements.
 for(const r of records){const b=fs.readFileSync(path.join(root,r.path));assert.equal(crypto.createHash('sha256').update(b).digest('hex'),r.sha256,r.path);}
 const frames=Object.values(boot.frames);assert.equal(frames.length,28);for(let i=0;i<28;i++){assert.equal(frames[i],'assets/presentation/boot/sega-logo-'+(i+1)+'.png');const b=fs.readFileSync(path.join(root,frames[i]));assert.equal(b.subarray(0,8).toString('hex'),'89504e470d0a1a0a');assert.equal(b.readUInt32BE(16),171);assert.equal(b.readUInt32BE(20),58);}
 assert.equal(boot.audio,'assets/presentation/boot/sega-chant-game-boy.mp3');const b=fs.readFileSync(path.join(root,boot.audio));assert(b.length>0);return{bootPngs:28,bootAudio:1,bootSourceHashes:records.length};
}
module.exports={inspect};
