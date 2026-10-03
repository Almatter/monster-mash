import {createRequire} from 'node:module';import {MAP_CHUNKS} from '../src/court-layout.ts';
const require=createRequire('C:/Users/novam/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/package.json'),sharp=require('sharp'),{cols,rows}=MAP_CHUNKS,scale=80,overlays=[];
for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){const input=await sharp('public/assets/arena/five-regions/'+x+'-'+y+'.webp').extract({left:2,top:2,width:512,height:512}).resize(scale,scale).toBuffer();overlays.push({input,left:x*scale,top:y*scale});}
await sharp({create:{width:cols*scale,height:rows*scale,channels:3,background:'#29231e'}}).composite(overlays).jpeg({quality:93}).toFile('test-results/stage2-v23-map-overview.jpg');
