import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),sharp=require(process.env.SHARP_PATH||'C:/Users/novam/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
for(const id of ['hostile-elite-warning','hostile-titan-warning']){
 const source='art-source/vfx/'+id+'.png';
 if(!(await sharp(source).metadata()).hasAlpha)throw Error(id+' requires transparency');
 await sharp(source).resize(512,512).webp({quality:90,alphaQuality:100,effort:5}).toFile('public/assets/vfx/'+id+'.webp');
 console.log(id+': 512px transparent warning sprite');
}
