import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {join} from 'node:path';
const files=[];
async function walk(dir){for(const entry of await readdir(dir,{withFileTypes:true})){const path=join(dir,entry.name);if(entry.isDirectory())await walk(path);else files.push(path.replaceAll('\\','/').replace(/^dist\//,''));}}
await walk('dist');
for(const required of ['index.html','verify/index.html','manifest.webmanifest','sw.js','src/main.js','src/verify.js','assets/catalog.json'])assert.ok(files.includes(required),`Missing ${required}`);
for(const file of files)assert.ok(!/^(art-lab\.html|music-lab\.html|_headers|node_modules\/)|\.(ts|psd)$/i.test(file),`Development file in Pages artifact: ${file}`);
const manifest=JSON.parse(await readFile('dist/manifest.webmanifest','utf8'));
assert.equal(manifest.start_url,'./');assert.equal(manifest.scope,'./');
const worker=await readFile('dist/sw.js','utf8');assert.match(worker,/SCOPE=new URL\(self\.registration\.scope\)/);assert.ok(!worker.includes('__BUILD_HASH__'));
for(const name of ['index.html','verify/index.html']){const html=await readFile('dist/'+name,'utf8');assert.doesNotMatch(html,/(?:src|href)="\//i);assert.match(html,/name="robots" content="noindex,nofollow"/);}
assert.ok(!files.some(file=>file.startsWith('.github/')||file.startsWith('art-source/')||file.startsWith('tests/')));
console.log(`GitHub Pages artifact: ${files.length} production files; relative routes and PWA scope verified.`);
