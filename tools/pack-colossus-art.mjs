import {createRequire} from 'node:module';
const sharp=createRequire(import.meta.url)(process.env.SHARP_PATH||'sharp');
import {mkdir,stat} from 'node:fs/promises';
for(const [source,output,size] of [['idle','enemies/ashen-colossus',512],['cast','enemies/ashen-colossus-cast',512],['warning','vfx/colossus-warning',384],['eruption','vfx/colossus-eruption',384]]){
 await mkdir('public/assets/'+output.split('/')[0],{recursive:true});
 const path='public/assets/'+output+'.webp';
 await sharp('art-source/ashen-colossus/'+source+'.png').trim({threshold:8}).resize(size-16,size-16,{fit:'contain',background:'#00000000'}).extend({top:8,bottom:8,left:8,right:8,background:'#00000000'}).webp({quality:86,alphaQuality:100}).toFile(path);
 const meta=await sharp(path).metadata();if(!meta.hasAlpha)throw Error('Missing transparency: '+path);
 console.log(path,meta.width,meta.height,(await stat(path)).size);
}
