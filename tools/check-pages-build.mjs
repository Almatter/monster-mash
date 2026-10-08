import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {join} from 'node:path';
const files=[];
async function walk(dir){for(const entry of await readdir(dir,{withFileTypes:true})){const path=join(dir,entry.name);if(entry.isDirectory())await walk(path);else files.push(path.replaceAll('\\','/').replace(/^dist\//,''));}}
await walk('dist');
for(const required of ['test/index.html','stage3-test/index.html','src/stage-three.js','src/titan-realm-map.js','assets/stage3/titan-body.webp','assets/stage3/map-v35/5-5.webp','src/champion-kits.js','src/titan-fissure.js','assets/vfx/titan-fissure.webp','src/ashen-colossus.js','assets/enemies/ashen-colossus.webp','assets/enemies/ashen-colossus-cast.webp','assets/vfx/colossus-warning.webp','assets/vfx/colossus-eruption.webp','boot.js','index.html','stage2-test/index.html','verify/index.html','manifest.webmanifest','sw.js','src/main.js','src/reaper.js','src/champion-access.js','src/music-worker.js','assets/monsters/reaper/gameplay-base.webp','assets/monsters/reaper/selection-power.webp','assets/vfx/reaper-eclipse.webp','src/verify.js','src/camera.js','src/court-terrain.js','src/court-layout.js','src/court-structures.js','assets/arena/floor-court-links.webp','assets/arena/five-regions/manifest.json','assets/arena/five-regions/11-10.webp','assets/arena/floor-regions-cliff.webp','assets/vfx/court-spent-standard.webp','assets/arena/court-crescent.webp','assets/arena/court-fork.webp','assets/arena/court-border.webp','assets/vfx/court-ash-trace.webp','assets/catalog.json','assets/arena/floor-adaptation.webp'])assert.ok(files.includes(required),`Missing ${required}`);
for(const file of files)assert.ok(!/^(art-lab\.html|music-lab\.html|_headers|node_modules\/)|\.(ts|psd)$/i.test(file),`Development file in Pages artifact: ${file}`);
const manifest=JSON.parse(await readFile('dist/manifest.webmanifest','utf8'));
assert.equal(manifest.start_url,'./');assert.equal(manifest.scope,'./');
const worker=await readFile('dist/sw.js','utf8');assert.match(worker,/SCOPE=new URL\(self\.registration\.scope\)/);assert.ok(!worker.includes('__BUILD_HASH__'));
for(const name of ['src/titan-fissure.js','assets/vfx/titan-fissure.webp','src/ashen-colossus.js','assets/enemies/ashen-colossus.webp','assets/enemies/ashen-colossus-cast.webp','assets/vfx/colossus-warning.webp','assets/vfx/colossus-eruption.webp','index.html','stage2-test/index.html','verify/index.html']){const html=await readFile('dist/'+name,'utf8');assert.doesNotMatch(html,/(?:src|href)="\//i);assert.doesNotMatch(html,/BETA BUILD|noindex,nofollow/);}
assert.ok(!files.some(file=>file.startsWith('.github/')||file.startsWith('art-source/')||file.startsWith('tests/')));
console.log(`GitHub Pages artifact: ${files.length} production files; relative routes and PWA scope verified.`);

for(const entry of ['index.html','stage2-test/index.html']){const html=await readFile('dist/'+entry,'utf8');assert.match(html,/boot\.js\?v=[0-9a-f]{16}/);assert.doesNotMatch(html,/__BUILD_HASH__/);}
