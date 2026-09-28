const fs=require('node:fs'),path=require('node:path');const root=process.cwd(),html=fs.readFileSync('index.html','utf8'),scripts=[...html.matchAll(/<script src="([^"]+)"/g)].map(m=>m[1]),styles=[...html.matchAll(/href="([^"]+\.css)"/g)].map(m=>m[1]);
for(const file of [...scripts,...styles]){if(/^(?:\w+:|\/\/)/.test(file)||!fs.existsSync(path.join(root,file)))throw Error('Remote or missing resource: '+file);}
if(/type\s*=\s*["']module/.test(html))throw Error('Module script');
for(const file of scripts){const source=fs.readFileSync(file,'utf8');if(!file.startsWith("js/debug/")&&/\bfetch\s*\(|\bXMLHttpRequest\b/.test(source))throw Error('Network/module dependency: '+file);new (require('node:vm').Script)(source,{filename:file});}
const shellPngs=require('./shell-assets.cjs').inspect(root).paths.size;
console.log(JSON.stringify({shellPngs,localClassicScripts:scripts.length,localStylesheets:styles.length,missingResources:0,remoteDependencies:0,runtimeFetchOrXhr:0,syntaxErrors:0,framebuffer480x360:/width="480" height="360"/.test(html),browserLaunchVerified:false},null,2));
