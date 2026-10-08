import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import {REALM_CHUNKS,REALM_GROTTOS} from '../src/titan-realm-map.ts';
const sharp=createRequire(import.meta.url)('C:/Users/novam/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const root='art-source/stage3/',out='public/assets/stage3/';
await mkdir(out+'map-v35',{recursive:true});
if(!process.env.REALM_SPRITES_ONLY){
const sectors=[];
for(let y=0;y<3;y++)for(let x=0;x<3;x++)sectors.push({input:await sharp(root+`sectors/${x}-${y}.png`).resize(1536,1536).png().toBuffer(),left:256+x*1536,top:256+y*1536});
const map=await sharp({create:{width:5120,height:5120,channels:4,background:'#090913'}}).composite(sectors).png().toBuffer();
await sharp(map).resize(1280,1280).png().toFile(root+'layout-overview.png');
for(let y=0;y<10;y++)for(let x=0;x<10;x++)await writeFile(out+`map-v35/${x}-${y}.webp`,await sharp(map).extract({left:x*512,top:y*512,width:512,height:512}).webp({quality:90}).toBuffer());
}
const natures=['overlord','calamity','devourer','titan','sovereign','reaper','lycanthrope'];
const meta=await sharp(root+'fifth-powers.png').metadata(),w=Math.floor(meta.width/4),h=Math.floor(meta.height/2);
for(const [i,nature] of natures.entries()){
 const cell=await sharp(root+'fifth-powers.png').extract({left:i%4*w,top:Math.floor(i/4)*h,width:w,height:h}).png().toBuffer();
 await sharp(cell).resize(512,512,{fit:'contain',background:'#00000000'}).webp({lossless:true}).toFile('public/assets/vfx/relic-power-'+nature+'.webp');
 if(nature==='lycanthrope')await sharp(cell).trim().resize(384,384,{fit:'contain',background:'#00000000'}).webp({quality:94,alphaQuality:100}).toFile(out+'relic-lycanthrope.webp');
}
const guardian=await sharp(root+'guardians-clean-v35.png').metadata();
for(const [id,left,right] of [['sentinel',0,820],['seer',820,1420],['beast',1420,2172]])await sharp(await sharp(root+'guardians-clean-v35.png').extract({left,top:0,width:Math.min(right,guardian.width)-left,height:guardian.height}).png().toBuffer()).trim().resize(512,512,{fit:'contain',background:'#00000000'}).webp({quality:94,alphaQuality:100}).toFile(out+'guardian-'+id+'.webp');
await sharp(root+'guardian-seer-isolated-v35.png').trim().resize(512,512,{fit:'contain',background:'#00000000'}).webp({quality:94,alphaQuality:100}).toFile(out+'guardian-seer.webp');
for(const id of ['thrall','wing'])await sharp('public/assets/enemies/'+id+'.webp').resize(384,384,{fit:'contain',background:'#00000000'}).webp({quality:94,alphaQuality:100}).toFile(out+'servant-'+id+'.webp');
await writeFile(out+'manifest.json',JSON.stringify({chunks:REALM_CHUNKS,grottos:REALM_GROTTOS,source:'Nine generated connected ruin sectors, streamed in nearby 512px chunks',revision:35},null,2));
console.log('Packed nine connected map sectors, seven altar powers, three guardians and two additional servant species.');
