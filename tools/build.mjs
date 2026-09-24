import { readdir, readFile, mkdir, writeFile, copyFile } from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {join} from 'node:path';
import { stripTypeScriptTypes } from 'node:module';
await mkdir('dist/src', { recursive: true });
for (const name of await readdir('src')) {
  if (!name.endsWith('.ts')) continue;
  const source = await readFile(`src/${name}`, 'utf8');
  const js = stripTypeScriptTypes(source, { mode: 'strip' }).replaceAll(/from '(\.\/[^']+)\.ts'/g, "from '$1.js'");
  await writeFile(`dist/src/${name.replace('.ts', '.js')}`, js);
}
const {cp}=await import('node:fs/promises');await cp('public','dist',{recursive:true});
const modules=(await readdir('src')).filter(n=>n.endsWith('.ts')).map(n=>'src/'+n.replace('.ts','.js'));
const assets=['./','index.html','style.css','event.css','icon.svg','manifest.webmanifest','verify.html','assets/catalog.json','assets/audio/catalog.json',...modules];
const digest=createHash('sha256');
async function hashTree(dir){for(const item of (await readdir(dir,{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name))){const path=join(dir,item.name);if(item.isDirectory())await hashTree(path);else if(item.isFile()&&path!==join('dist','sw.js')){digest.update(path);digest.update(await readFile(path));}}}
await hashTree('public');await hashTree('dist/src');const version=digest.digest('hex').slice(0,16);
const worker=(await readFile('public/sw.js','utf8')).replace('__BUILD_HASH__',version).replace(/const ASSETS=\[[\s\S]*?\];/, 'const ASSETS='+JSON.stringify(assets)+';');await writeFile('dist/sw.js',worker);
console.log('Production build ready in dist/ (no runtime dependencies).');
