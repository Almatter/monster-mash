import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const sharp=require(process.env.SHARP_PATH||'C:/Users/novam/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
for(const name of ['devourer-claw','devourer-unbound-aura']){
 const source=`art-source/vfx/${name}.png`,target=`public/assets/vfx/${name}.webp`;
 const metadata=await sharp(source).metadata();
 if(!metadata.hasAlpha)throw Error(`${source} must retain transparency`);
 await sharp(source).resize(768,768).webp({quality:91,alphaQuality:100,effort:5}).toFile(target);
 const output=await sharp(target).metadata(),size=(await fs.stat(target)).size;
 if(!output.hasAlpha||output.width!==768||output.height!==768)throw Error(`Invalid ${target}`);
 console.log(`${target}: ${Math.round(size/1024)} KiB, transparent ${output.width}×${output.height}`);
}
