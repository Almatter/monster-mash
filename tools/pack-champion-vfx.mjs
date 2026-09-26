import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const sharp=require(process.env.SHARP_PATH||'C:/Users/novam/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const names=["sovereign-unbound-aura","titan-unbound-aura","calamity-unbound-aura","overlord-unbound-aura","titan-barrier","calamity-ward","devourer-frenzy","devourer-guard","devourer-dodge","sovereign-rage"];
let total=0;
for(const name of names){
 const source=`art-source/vfx/${name}.png`,target=`public/assets/vfx/${name}.webp`;
 if(!(await sharp(source).metadata()).hasAlpha)throw Error(`${source} needs alpha`);
 await sharp(source).resize(768,768).webp({quality:91,alphaQuality:100,effort:5}).toFile(target);
 const {data,info}=await sharp(target).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const center=data[((384*768)+384)*4+3];if(center!==0)throw Error(`${name}: center must be transparent`);
 const size=(await fs.stat(target)).size;total+=size;console.log(`${name}: ${Math.round(size/1024)} KiB, center alpha ${center}`);
}
console.log(`Total runtime art ${(total/1048576).toFixed(2)} MiB`);
