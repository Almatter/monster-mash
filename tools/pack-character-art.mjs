import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const sharp=require(process.env.SHARP_PATH||'C:/Users/novam/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const root=path.resolve('public/assets/monsters'),files=[];
for(const id of await fs.readdir(root)){const directory=path.join(root,id);if(!(await fs.stat(directory)).isDirectory())continue;for(const name of await fs.readdir(directory))if(name.endsWith('.png'))files.push(path.join(directory,name));}
let before=0,after=0;
for(const source of files){const target=source.slice(0,-4)+'.webp';const stat=await fs.stat(source);before+=stat.size;await sharp(source).webp({lossless:true,effort:4}).toFile(target);after+=(await fs.stat(target)).size;}
const catalogPath='public/assets/catalog.json';const catalog=JSON.parse(await fs.readFile(catalogPath,'utf8'));
for(const entry of Object.values(catalog))for(const set of Object.values(entry))for(const [channel,url] of Object.entries(set))if(url.endsWith('.png'))set[channel]=url.slice(0,-4)+'.webp';
await fs.writeFile(catalogPath,JSON.stringify(catalog,null,2)+'\n');
if(process.argv.includes('--prune-png'))for(const source of files){if(!path.resolve(source).startsWith(root+path.sep))throw Error('Unsafe prune path');await fs.unlink(source);}
console.log(`${files.length} layers: ${(before/1048576).toFixed(1)} MiB PNG -> ${(after/1048576).toFixed(1)} MiB lossless WebP`);
