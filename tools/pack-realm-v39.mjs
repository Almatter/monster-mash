import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import {REALM_GROTTOS,REALM_PATHS,REALM_REGION_SIZE,REALM_ARENA_ART} from '../src/realm-layout.ts';
const sharp=createRequire(import.meta.url)('C:/Users/novam/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const source='art-source/stage3/v39/',output='public/assets/stage3/map-v39/';
await mkdir(output,{recursive:true});
const quarter=await sharp('art-source/stage3/ether-fog-v39.png').resize(512,512).removeAlpha().png().toBuffer();const fog=await sharp({create:{width:1024,height:1024,channels:3,background:'#192859'}}).composite([{input:quarter,left:0,top:0},{input:await sharp(quarter).flop().png().toBuffer(),left:512,top:0},{input:await sharp(quarter).flip().png().toBuffer(),left:0,top:512},{input:await sharp(quarter).flip().flop().png().toBuffer(),left:512,top:512}]).png().toBuffer();await sharp(fog).webp({quality:93}).toFile('public/assets/stage3/ether-fog.webp');
const background=[];for(let y=0;y<5;y++)for(let x=0;x<5;x++)background.push({input:fog,left:x*1024,top:y*1024});
const backdrop=await sharp({create:{width:5120,height:5120,channels:3,background:'#192859'}}).composite(background).png().toBuffer();
const textures={};for(const id of ['bridge','stairs'])textures[id]=await sharp(source+id+'.png').ensureAlpha().raw().toBuffer({resolveWithObject:true});
// Offline texture bending: the runtime draws only bounded 512px terrain chunks.
// The very same sampled centerline defines the navigation floor and illustrated deck.
const roads=[];
for(const path of REALM_PATHS){
 const fullWidth=path.radius*2/.60,extent=fullWidth/2+4;
 const left=Math.floor(Math.min(...path.curve.map(p=>p.x))-extent),top=Math.floor(Math.min(...path.curve.map(p=>p.y))-extent);
 const width=Math.ceil(Math.max(...path.curve.map(p=>p.x))+extent)-left,height=Math.ceil(Math.max(...path.curve.map(p=>p.y))+extent)-top,n=width*height;
 const nearest=new Float32Array(n).fill(Infinity),across=new Float32Array(n),along=new Float32Array(n);let length=0;
 for(let i=1;i<path.curve.length;i++){
  const a=path.curve[i-1],b=path.curve[i],dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy),l2=len*len;
  const x0=Math.max(0,Math.floor(Math.min(a.x,b.x)-extent-left)),x1=Math.min(width-1,Math.ceil(Math.max(a.x,b.x)+extent-left)),y0=Math.max(0,Math.floor(Math.min(a.y,b.y)-extent-top)),y1=Math.min(height-1,Math.ceil(Math.max(a.y,b.y)+extent-top));
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const vx=x+left-a.x,vy=y+top-a.y,t=Math.max(0,Math.min(1,(vx*dx+vy*dy)/l2)),qx=vx-t*dx,qy=vy-t*dy,d=qx*qx+qy*qy,index=y*width+x;if(d<nearest[index]){nearest[index]=d;across[index]=(-vx*dy+vy*dx)/len;along[index]=length+t*len;}}
  length+=len;
 }
 const texture=textures[path.stairs?'stairs':'bridge'],tw=texture.info.width,th=texture.info.height,scale=tw/fullWidth,buf=Buffer.alloc(n*4);
 for(let i=0;i<n;i++){if(nearest[i]>extent*extent)continue;const u=tw/2+across[i]*scale,v=(along[i]*scale)%th;if(u<0||u>=tw-1)continue;const x=Math.floor(u),y=Math.floor(v),fx=u-x,fy=v-y;for(let c=0;c<4;c++){const a=texture.data[(y*tw+x)*4+c],b=texture.data[(y*tw+x+1)*4+c],d=texture.data[(((y+1)%th)*tw+x)*4+c],e=texture.data[(((y+1)%th)*tw+x+1)*4+c];buf[i*4+c]=Math.round((a+(b-a)*fx)*(1-fy)+(d+(e-d)*fx)*fy);}}
 roads.push({input:await sharp(buf,{raw:{width,height,channels:4}}).png().toBuffer(),left:left+2560,top:top+2560});
 console.log('Bent',path.id);
}
const deck=await sharp(backdrop).composite(roads).png().toBuffer(),regions=[];await sharp(deck).resize(1280,1280).png().toFile(source+'routes-preview.png');
for(const region of [...REALM_GROTTOS,{nature:'arena',x:0,y:0}]){
 const arena=region.nature==='arena',rw=arena?REALM_ARENA_ART.width:REALM_REGION_SIZE,rh=arena?REALM_ARENA_ART.height:REALM_REGION_SIZE;const {data,info}=await sharp(source+region.nature+'.png').resize(rw,rh,{fit:'fill'}).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 // Feather only the artwork's rectangular crop; illustrated cliffs keep their shape.
 for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++){const edge=Math.min(x,y,info.width-1-x,info.height-1-y);if(edge<64)data[(y*info.width+x)*4+3]*=Math.min(1,edge/64);}
 regions.push({input:await sharp(data,{raw:info}).png().toBuffer(),left:2560+(arena?REALM_ARENA_ART.left:region.x-REALM_REGION_SIZE/2),top:2560+(arena?REALM_ARENA_ART.top:region.y-REALM_REGION_SIZE/2)});
}
const map=await sharp(deck).composite(regions).png().toBuffer();
for(let y=0;y<10;y++)for(let x=0;x<10;x++)await writeFile(output+x+'-'+y+'.webp',await sharp(map).extract({left:x*512,top:y*512,width:512,height:512}).webp({quality:90}).toBuffer());
await sharp(map).resize(1536,1536).png().toFile(source+'overview.png');
await sharp(map).png().toFile(source+'assembled.png');
console.log('Packed seven distinct grottos, raised arena and eleven winding routes into 100 terrain chunks.');
