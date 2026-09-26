import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const sharp=require(process.env.SHARP_PATH||'C:/Users/novam/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
for(const name of ['calamity-starfall-preview','calamity-vortex-preview']){
 const source=`art-source/vfx/${name}.png`,target=`public/assets/vfx/${name}.webp`;
 if(!(await sharp(source).metadata()).hasAlpha)throw Error('Missing source alpha');
 await sharp(source).resize(512,512).webp({quality:90,alphaQuality:100,effort:5}).toFile(target);
 const {data}=await sharp(target).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 if(data[(256*512+256)*4+3]!==0)throw Error('Target center must remain transparent');
 console.log(name+': '+Math.round((await fs.stat(target)).size/1024)+' KiB; transparent center; 1 MiB decoded RGBA');
}
