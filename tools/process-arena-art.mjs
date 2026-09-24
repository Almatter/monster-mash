import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const sharp=require(process.env.SHARP_PATH||'C:/Users/novam/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const size=512,edge=36;
const {data}=await sharp('art-source/arena/floor-master.png').resize(size,size).modulate({brightness:.76,saturation:.76}).removeAlpha().raw().toBuffer({resolveWithObject:true});
for(let y=0;y<size;y++)for(let t=0;t<edge;t++){const a=(y*size+t)*3,b=(y*size+size-1-t)*3,k=.5*(1-t/edge);for(let c=0;c<3;c++){const l=data[a+c],r=data[b+c];data[a+c]=Math.round(l*(1-k)+r*k);data[b+c]=Math.round(r*(1-k)+l*k);}}
for(let x=0;x<size;x++)for(let t=0;t<edge;t++){const a=(t*size+x)*3,b=((size-1-t)*size+x)*3,k=.5*(1-t/edge);for(let c=0;c<3;c++){const l=data[a+c],r=data[b+c];data[a+c]=Math.round(l*(1-k)+r*k);data[b+c]=Math.round(r*(1-k)+l*k);}}
await sharp(data,{raw:{width:size,height:size,channels:3}}).webp({quality:84}).toFile('public/assets/arena/floor.webp');
