import {createRequire} from 'node:module';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
const require=createRequire('C:/Users/novam/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/package.json'),sharp=require('sharp');
await mkdir('public/assets/stage3',{recursive:true});
const root='art-source/stage3/',out='public/assets/stage3/';
async function cells(name,cols,rows,ids,size){const path=root+name+'.png',meta=await sharp(path).metadata(),w=Math.floor(meta.width/cols),h=Math.floor(meta.height/rows);for(const [i,id] of ids.entries()){const extracted=await sharp(path).extract({left:i%cols*w,top:Math.floor(i/cols)*h,width:w,height:h}).png().toBuffer();let cell=sharp(extracted);if(name==='effects'||name==='relics')cell=cell.trim();await cell.resize(size,size,{fit:'contain',background:{r:0,g:0,b:0,alpha:0}}).webp({quality:94,alphaQuality:100}).toFile(out+id+'.webp');}}
await cells('titan-parts',2,3,['titan-body','titan-head-0','titan-head-1','titan-head-2','titan-mantle-0','titan-mantle-1'],512);
await cells('relics',4,2,['relic-unknown','relic-overlord','relic-calamity','relic-devourer','relic-titan','relic-sovereign','relic-reaper','relic-dormant'],384);
await cells('servants',3,1,['guardian','acolyte','shardhound'],384);
await cells('effects',2,2,['boundary','slam','bolt','breach'],512);
await sharp(root+'floor.png').resize(512,512).webp({quality:88}).toFile(out+'floor.webp');
// The current map is composed from nine fully generated connecting sectors.
await import('./finish-realm-art.mjs');
