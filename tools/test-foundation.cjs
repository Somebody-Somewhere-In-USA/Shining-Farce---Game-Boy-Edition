// Optional developer runner. The same harness is available in the game without Node.
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const files = [...fs.readFileSync(path.join(root, 'index.html'), 'utf8').matchAll(/<script src="([^"]+)"/g)].map(m => m[1]);
const context = vm.createContext({ window: {}, console });
for (const file of files.filter(file => file !== 'js/main.js')) vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context, { filename: file });
const results = context.window.GBTRPG.debug.runFoundationTests();
for (const result of results) console.log((result.pass ? 'PASS ' : 'FAIL ') + result.name + (result.error ? ': ' + result.error : ''));
console.log(results.filter(r => r.pass).length + '/' + results.length + ' passed');
process.exitCode = results.every(r => r.pass) ? 0 : 1;
