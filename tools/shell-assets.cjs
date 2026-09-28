// Fixed presentation resources, deliberately separate from canonical game PNGs.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
function inspect(root){
 const context=vm.createContext({window:{GBTRPG:{config:{}}}});vm.runInContext(fs.readFileSync(path.join(root,'js/config/presentationShell.js'),'utf8'),context);
 const shells=context.window.GBTRPG.config.PRESENTATION_SHELLS,paths=new Set();
 for(const shell of Object.values(shells))for(const c of shell.components)for(const file of [c.normal,...Object.values(c.states)]){
  assert(/^assets\/presentation\/game-boy\/size-[12]\/[a-z-]+\.png$/.test(file),'Unexpected shell resource path');
  const bytes=fs.readFileSync(path.join(root,file));assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a',file);
  assert.equal(bytes.readUInt32BE(16),c.width,file);assert.equal(bytes.readUInt32BE(20),c.height,file);paths.add(file);
 }
 assert.equal(paths.size,46);return{shells,paths,modes:context.window.GBTRPG.config.PRESENTATION_MODES};
}
module.exports={inspect};
