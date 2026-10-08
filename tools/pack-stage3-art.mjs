import {createRequire} from 'node:module';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {REALM_CHUNKS,REALM_GROTTOS,REALM_LANES} from '../src/titan-realm-map.ts';
const require=createRequire('C:/Users/novam/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/package.json'),sharp=require('sharp');
await mkdir('public/assets/stage3/map',{recursive:true});
const root='art-source/stage3/',out='public/assets/stage3/';
async function cells(name,cols,rows,ids,size){const path=root+name+'.png',meta=await sharp(path).metadata(),w=Math.floor(meta.width/cols),h=Math.floor(meta.height/rows);for(const [i,id] of ids.entries()){const extracted=await sharp(path).extract({left:i%cols*w,top:Math.floor(i/cols)*h,width:w,height:h}).png().toBuffer();let cell=sharp(extracted);if(name==='effects'||name==='relics')cell=cell.trim();await cell.resize(size,size,{fit:'contain',background:{r:0,g:0,b:0,alpha:0}}).webp({quality:94,alphaQuality:100}).toFile(out+id+'.webp');}}
await cells('titan-parts',2,3,['titan-body','titan-head-0','titan-head-1','titan-head-2','titan-mantle-0','titan-mantle-1'],512);
await cells('relics',4,2,['relic-unknown','relic-overlord','relic-calamity','relic-devourer','relic-titan','relic-sovereign','relic-reaper','relic-dormant'],384);
await cells('servants',3,1,['guardian','acolyte','shardhound'],384);
await cells('effects',2,2,['boundary','slam','bolt','breach'],512);
await sharp(root+'floor.png').resize(512,512).webp({quality:88}).toFile(out+'floor.webp');
// Bake the authored sectors together once; clients decode only nearby 512px chunks.
const size=5120,floor=await sharp(root+'floor.png').resize(512,512).png().toBuffer(),layers=[];
for(let y=0;y<size;y+=512)for(let x=0;x<size;x+=512)layers.push({input:floor,left:x,top:y});
let map=await sharp({create:{width:size,height:size,channels:4,background:'#131019'}}).composite(layers).png().toBuffer();
const darkness=Buffer.alloc(size*size*4);for(let y=0;y<size;y++)for(let x=0;x<size;x++){const at=(y*size+x)*4;darkness[at]=5;darkness[at+1]=4;darkness[at+2]=10;darkness[at+3]=135;}
// Darken the surroundings uniformly; sector floors retain their authored lighting.
map=await sharp(map).composite([{input:darkness,raw:{width:size,height:size,channels:4}}]).png().toBuffer();
async function sector(name,width){const image=await sharp(root+name+'.png').resize(width,width).ensureAlpha().raw().toBuffer();const feather=60;for(let y=0;y<width;y++)for(let x=0;x<width;x++){const d=Math.min(x,y,width-1-x,width-1-y),at=(y*width+x)*4+3;image[at]=Math.round(255*Math.min(1,d/feather));}return sharp(image,{raw:{width,height:width,channels:4}}).png().toBuffer();}
const passage=await sharp(root+'passage.png').resize(512,512).modulate({brightness:.65,saturation:.7}).png().toBuffer(),passages=[];
for(let y=0;y<size;y+=512)for(let x=0;x<size;x+=512)passages.push({input:passage,left:x,top:y});
const mask=Buffer.from(`<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">${REALM_LANES.map(l=>l.a.x===l.b.x&&l.a.y===l.b.y?`<circle cx="${l.a.x+2560}" cy="${l.a.y+2560}" r="${l.radius}" fill="white"/>`:`<path d="M ${l.a.x+2560} ${l.a.y+2560} L ${l.b.x+2560} ${l.b.y+2560}" stroke="white" stroke-width="${l.radius*2}" stroke-linecap="round"/>`).join('')}</svg>`);
let road=await sharp({create:{width:size,height:size,channels:4,background:'#000'}}).composite(passages).png().toBuffer();
road=await sharp(road).composite([{input:await sharp(mask).blur(6).png().toBuffer(),blend:'dest-in'}]).png().toBuffer();
map=await sharp(map).composite([{input:road}]).png().toBuffer();
const arena=await sector('arena',1536),grotto=await sector('grotto',1024);
map=await sharp(map).composite([{input:arena,left:2560-768,top:2560-768},...REALM_GROTTOS.map(s=>({input:grotto,left:s.x+2560-512,top:s.y+2560-512}))]).png().toBuffer();
await sharp(map).resize(1280,1280).png().toFile(root+'layout-overview.png');
for(let y=0;y<10;y++)for(let x=0;x<10;x++)await sharp(map).extract({left:x*512,top:y*512,width:512,height:512}).webp({quality:90}).toFile(out+'map/'+x+'-'+y+'.webp');
await writeFile(out+'manifest.json',JSON.stringify({chunks:REALM_CHUNKS,grottos:REALM_GROTTOS,source:'Generated production artwork; offline sector composition',assets:['titan-body',...Array.from({length:3},(_,i)=>'titan-head-'+i),...Array.from({length:2},(_,i)=>'titan-mantle-'+i),'guardian','acolyte','shardhound','boundary','slam','bolt','breach',...['unknown','overlord','calamity','devourer','titan','sovereign','reaper','dormant'].map(n=>'relic-'+n)]},null,2));
console.log('Stage 3: 100 streamed map sections and 21 generated sprite/effect assets packed.');
