import {createRequire} from 'node:module';import {mkdir,writeFile,stat} from 'node:fs/promises';
import {COURT_REGIONS,COURT_LANES,REGION_SIZE,MAP_CHUNKS} from '../src/court-layout.ts';
const require=createRequire('C:/Users/novam/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/package.json'),sharp=require('sharp');
const root='public/assets/arena/five-regions';await mkdir(root,{recursive:true});
const ground=(await sharp('art-source/stage2/ash-terrain.png').resize(768,768).modulate({brightness:1.12,saturation:1.05}).jpeg({quality:94}).toBuffer()).toString('base64');
const cliff=(await sharp('art-source/stage2/regions/cliff.png').resize(1536,1536).modulate({brightness:.76,saturation:.72}).jpeg({quality:94}).toBuffer()).toString('base64');
await sharp('art-source/stage2/regions/cliff.png').resize(512,512).modulate({brightness:.76,saturation:.72}).webp({quality:92}).toFile('public/assets/arena/floor-regions-cliff.webp');
const masters=[];for(const region of COURT_REGIONS){
 const {data}=await sharp('art-source/stage2/regions/'+region.id+'.png').resize(REGION_SIZE,REGION_SIZE).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const half=REGION_SIZE/2;
 for(let q=0;q<4;q++){
  const detail=await sharp('art-source/stage2/regions/details/'+region.id+'-'+q+'.png').resize(half,half).ensureAlpha().raw().toBuffer();
  const ox=(q%2)*half,oy=Math.floor(q/2)*half;
  // Preserve shared edges from the original master; fade detail sections through a 90px join.
  for(let y=0;y<half;y++)for(let x=0;x<half;x++){
   const edge=Math.min(q%2?x:half-1-x,q<2?half-1-y:y),a=Math.min(1,edge/90),i=(y*half+x)*4,j=((y+oy)*REGION_SIZE+x+ox)*4;
   for(let c=0;c<3;c++)data[j+c]=Math.round(data[j+c]*(1-a)+detail[i+c]*a);
  }
 }
 await sharp(data,{raw:{width:REGION_SIZE,height:REGION_SIZE,channels:4}}).webp({quality:96}).toFile('art-source/stage2/regions/'+region.id+'-finished.webp');
 masters.push({...region,data,left:region.x-half,top:region.y-half});
}
let bytes=0;const {size,cols,rows,left,top}=MAP_CHUNKS,gutter=2,width=size+gutter*2;
for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){
 const px=left+x*size-gutter,py=top+y*size-gutter;
 const lines=COURT_LANES.map(l=>{
 const angle=Math.atan2(l.b.y-l.a.y,l.b.x-l.a.x),length=Math.hypot(l.b.x-l.a.x,l.b.y-l.a.y),steps=Math.max(1,Math.ceil(length/35)),points=[];
 const at=(x,y,angle)=>{const px=x+Math.cos(angle)*l.radius,py=y+Math.sin(angle)*l.radius,jitter=8*Math.sin(px/36+py/31)+5*Math.sin(px/19-py/27),radius=l.radius+jitter;points.push([x+Math.cos(angle)*radius,y+Math.sin(angle)*radius]);};
 for(let n=0;n<=steps;n++)at(l.a.x+(l.b.x-l.a.x)*n/steps,l.a.y+(l.b.y-l.a.y)*n/steps,angle-Math.PI/2);
 for(let n=1;n<=32;n++)at(l.b.x,l.b.y,angle-Math.PI/2+n*Math.PI/32);
 for(let n=1;n<=steps;n++)at(l.b.x-(l.b.x-l.a.x)*n/steps,l.b.y-(l.b.y-l.a.y)*n/steps,angle+Math.PI/2);
 for(let n=1;n<=32;n++)at(l.a.x,l.a.y,angle+Math.PI/2+n*Math.PI/32);
 return '<path fill="white" d="M'+points.map(p=>p.join(' ')).join(' L')+' Z"/>';
}).join('');
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${width}" viewBox="${px} ${py} ${width} ${width}"><defs><pattern id="rock" width="1536" height="1536" patternUnits="userSpaceOnUse"><image width="1536" height="1536" href="data:image/jpeg;base64,${cliff}"/></pattern><pattern id="earth" width="768" height="768" patternUnits="userSpaceOnUse"><image width="768" height="768" href="data:image/jpeg;base64,${ground}"/></pattern><mask id="lanes" maskUnits="userSpaceOnUse" x="${px}" y="${py}" width="${width}" height="${width}">${lines}</mask></defs><rect x="${px}" y="${py}" width="${width}" height="${width}" fill="url(#rock)"/><rect x="${px}" y="${py}" width="${width}" height="${width}" fill="url(#earth)" mask="url(#lanes)"/></svg>`;
 const overlays=[];
 for(const m of masters){const sx=Math.max(px,m.left),sy=Math.max(py,m.top),ex=Math.min(px+width,m.left+REGION_SIZE),ey=Math.min(py+width,m.top+REGION_SIZE);if(ex<=sx||ey<=sy)continue;const w=ex-sx,h=ey-sy,raw=Buffer.alloc(w*h*4);for(let row=0;row<h;row++){const source=((sy-m.top+row)*REGION_SIZE+sx-m.left)*4;m.data.copy(raw,row*w*4,source,source+w*4);for(let col=0;col<w;col++){const rx=sx-m.left+col,ry=sy-m.top+row,d=Math.min(rx,ry,REGION_SIZE-1-rx,REGION_SIZE-1-ry),alpha=Math.min(1,d/140);raw[(row*w+col)*4+3]=Math.round(255*alpha);}}overlays.push({input:raw,raw:{width:w,height:h,channels:4},left:sx-px,top:sy-py});}
 const file=root+'/'+x+'-'+y+'.webp';await sharp(Buffer.from(svg)).composite(overlays).webp({quality:94}).toFile(file);bytes+=(await stat(file)).size;
 if(x===cols-1&&y%4===0)console.log('Packed row',y+1,'of',rows);
}
await writeFile(root+'/manifest.json',JSON.stringify({...MAP_CHUNKS,gutter,tiles:cols*rows,bytes,regions:COURT_REGIONS.map(r=>({id:r.id,name:r.name,x:r.x,y:r.y}))},null,2));
console.log('Finished scenery:',cols*rows,'sections,',(bytes/1048576).toFixed(2),'MiB on disk; decoded cache capped at',MAP_CHUNKS.cacheLimit*width*width*4/1048576,'MiB.');
