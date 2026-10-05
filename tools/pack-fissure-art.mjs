import {createRequire} from 'node:module';
const sharp=createRequire(import.meta.url)(process.env.SHARP_PATH||'sharp');
await sharp('art-source/titan-fissure/fissure.png').trim({threshold:8}).resize(752,176,{fit:'contain',background:'#00000000'}).extend({top:8,bottom:8,left:8,right:8,background:'#00000000'}).webp({quality:88,alphaQuality:100}).toFile('public/assets/vfx/titan-fissure.webp');
console.log(await sharp('public/assets/vfx/titan-fissure.webp').metadata());
