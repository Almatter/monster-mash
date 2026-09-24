import fs from 'node:fs/promises';import {createRequire} from 'node:module';const require=createRequire(import.meta.url),sharp=require(process.env.SHARP_PATH||'C:/Users/novam/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
for(const id of ['sovereign','titan','devourer','calamity','overlord','hostile-elite','hostile-titan']){
 const source='art-source/vfx/'+id+'.png',target='public/assets/vfx/'+id+'.packed.webp';await sharp(source).resize(384,384).webp({quality:id.startsWith('hostile-')?84:86,effort:6}).toFile(target);
}
await sharp('art-source/vfx/hostile-bolt.svg').resize(128,128).webp({quality:86,effort:6}).toFile('public/assets/vfx/hostile-bolt.packed.webp');
await sharp('art-source/arena/brazier.png').resize(256,384).webp({quality:84,effort:6}).toFile('public/assets/arena/brazier.packed.webp');
console.log('Prepared nine transparent WebP assets for PowerShell replacement.');
