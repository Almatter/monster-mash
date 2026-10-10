import { readdir, readFile, mkdir, writeFile, rm } from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {join,resolve,dirname} from 'node:path';
import { stripTypeScriptTypes } from 'node:module';
const distRoot=resolve('dist');
if(dirname(distRoot)!==resolve('.'))throw Error('Build output must stay inside this project.');
await rm(distRoot,{recursive:true,force:true});
await mkdir('dist/src', { recursive: true });
for (const name of await readdir('src')) {
  if (!name.endsWith('.ts')||['art-lab.ts','music-lab.ts'].includes(name)) continue;
  const source = await readFile(`src/${name}`, 'utf8');
  const js = stripTypeScriptTypes(source, { mode: 'strip' }).replaceAll(/from '(\.\/[^']+)\.ts'/g, "from '$1.js'");
  await writeFile(`dist/src/${name.replace('.ts', '.js')}`, js);
}
const {cp}=await import('node:fs/promises');await cp('public','dist',{recursive:true});
for(const lab of ['art-lab.html','music-lab.html'])await rm('dist/'+lab);
await rm('dist/_headers',{force:true});
await mkdir('dist/stage2-test',{recursive:true});
const testEntry=(await readFile('dist/index.html','utf8')).replace('<head>','<head>\n<base href="../">');
for(const route of ['test','stage2-test','stage3-test']){await mkdir('dist/'+route,{recursive:true});await writeFile('dist/'+route+'/index.html',testEntry);}
const modules=(await readdir('src')).filter(n=>n.endsWith('.ts')&&!['art-lab.ts','music-lab.ts'].includes(n)).map(n=>'src/'+n.replace('.ts','.js'));
await writeFile('dist/boot.js',(await readFile('dist/boot.js','utf8')).replace('/*__MODULES__*/[]',JSON.stringify(modules)));
const assets=['./','index.html','stage2-test/','stage2-test/index.html','test/','test/index.html','stage3-test/','stage3-test/index.html','boot.js','style.css','event.css','icon.svg','manifest.webmanifest','verify.html','verify/','verify/index.html','assets/catalog.json','assets/audio/catalog.json',...modules];
const digest=createHash('sha256');
async function hashTree(dir){for(const item of (await readdir(dir,{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name))){const path=join(dir,item.name);if(item.isDirectory())await hashTree(path);else if(item.isFile()&&path!==join('dist','sw.js')){digest.update(path);digest.update(await readFile(path));}}}
await writeFile('dist/robots.txt','User-agent: *\nAllow: /\n');
await hashTree('dist');const version=digest.digest('hex').slice(0,16);
await writeFile('dist/src/config.js',(await readFile('dist/src/config.js','utf8')).replace('__BUILD_HASH__',version));
for(const file of ['dist/index.html','dist/stage2-test/index.html','dist/stage3-test/index.html','dist/test/index.html'])await writeFile(file,(await readFile(file,'utf8')).replaceAll('__BUILD_HASH__',version));
const worker=(await readFile('public/sw.js','utf8')).replace('__BUILD_HASH__',version).replace(/const ASSETS=\[[\s\S]*?\];/, 'const ASSETS='+JSON.stringify([...assets,...modules.map(path=>path+'?v='+version)])+';');await writeFile('dist/sw.js',worker);
console.log('Production build ready in dist/ (no runtime dependencies).');
