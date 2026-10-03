import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),sharp=require(process.env.SHARP_PATH||'C:/Users/novam/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
for(const name of ['captain','vanguard']){
 const image=sharp('art-source/stage2/'+name+'.png');
 await image.trim({threshold:5}).resize(296,296,{fit:'contain',background:'#0000'}).extend({top:12,bottom:12,left:12,right:12,background:'#0000'}).webp({quality:90,alphaQuality:100,effort:5}).toFile('public/assets/enemies/court-'+name+'.webp');
}
console.log('Packed two transparent 320px Court enemy sprites.');
