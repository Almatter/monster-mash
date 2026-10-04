import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
const sharp=createRequire(import.meta.url)(process.env.SHARP_PATH||'C:/Users/novam/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
sharp.cache(false);
const root='art-source/reaper',out='public/assets/monsters/reaper',channels=['base','primary','secondary','accent','power','skin'];
await fs.mkdir(out,{recursive:true});
async function writeAsset(path,bytes){const next=path+'.next';await fs.writeFile(next,bytes);for(let n=0;;n++)try{await fs.rename(next,path);return;}catch(error){if(n>=5)throw error;await new Promise(resolve=>setTimeout(resolve,100*(n+1)));}}
// Generated continuous region guides supply material boundaries; source pixels supply shading.
async function split(name,guideName){
 const {data,info}=await sharp(root+'/'+name).ensureAlpha().raw().toBuffer({resolveWithObject:true}),{width,height}=info;
 const guide=await sharp(root+'/'+guideName).resize(width,height,{fit:'fill'}).ensureAlpha().raw().toBuffer(),labels=new Uint8Array(width*height),colors=[[0,0,255],[255,0,255],[255,255,0],[255,0,0],[0,255,255]],layers=Object.fromEntries(channels.map(k=>[k,Buffer.alloc(data.length)]));
 for(let p=0;p<labels.length;p++){const i=p*4,r=data[i],g=data[i+1],b=data[i+2],bright=Math.max(r,g,b),skin=r>g*1.025&&r>b*1.02&&(bright-Math.min(r,g,b))/(bright||1)<.36;
  if(data[i+3]<3)continue;data.copy(layers.base,i,i,i+4);
  if(guide[i+3]<20||Math.max(guide[i],guide[i+1],guide[i+2])<90||bright<32)continue;
  let best=Infinity;for(let channel=0;channel<5;channel++){const rgb=colors[channel],d=(guide[i]-rgb[0])**2+(guide[i+1]-rgb[1])**2+(guide[i+2]-rgb[2])**2;if(d<best){best=d;labels[p]=channel+1;}}
 }
 // Keep continuous labels, preserve fine source ink and clip every mask to source alpha.
 const count={};for(let channel=0;channel<5;channel++){const pixels=layers[channels[channel+1]];count[channels[channel+1]]=0;for(let p=0;p<labels.length;p++){if(labels[p]!==channel+1)continue;const i=p*4,bright=Math.max(data[i],data[i+1],data[i+2]),shade=Math.min(255,Math.round(bright*.98));pixels[i]=pixels[i+1]=pixels[i+2]=channel===4?Math.min(255,Math.round(bright*1.04)):shade;pixels[i+3]=Math.round(data[i+3]*Math.min(1,(bright-24)/24));count[channels[channel+1]]++;}}
 console.log(name,{width,height,count});return {layers,width,height};
}
const master=await split('selection-master.png','selection-color-guide.png'),battle=await split('gameplay-master.png','gameplay-color-guide.png');
// A generated pose can overlap a neighbouring sheet cell. Retain its main
// connected silhouette and nearby small details, never the neighbour's scraps.
for(let pose=0;pose<6;pose++){
 const ox=pose%3*512,oy=Math.floor(pose/3)*512,seen=new Uint8Array(512*512),components=[];
 for(let start=0;start<seen.length;start++){const x=start%512,y=Math.floor(start/512);if(seen[start]||battle.layers.base[((oy+y)*battle.width+ox+x)*4+3]<32)continue;const queue=[start];seen[start]=1;let left=x,right=x,top=y,bottom=y;
  for(let q=0;q<queue.length;q++){const p=queue[q],px=p%512,py=Math.floor(p/512);left=Math.min(left,px);right=Math.max(right,px);top=Math.min(top,py);bottom=Math.max(bottom,py);for(const n of [p-512,p+512,...(px>0?[p-1]:[]),...(px<511?[p+1]:[])])if(n>=0&&n<seen.length&&!seen[n]&&battle.layers.base[((oy+Math.floor(n/512))*battle.width+ox+n%512)*4+3]>=32){seen[n]=1;queue.push(n);}}
  components.push({pixels:queue,left,right,top,bottom});
 }
 components.sort((a,b)=>b.pixels.length-a.pixels.length);const main=components[0];if(!main)throw Error('Missing Reaper pose '+pose);
 const allowed=new Uint8Array(512*512);for(const component of components)if(component===main||component.pixels.length>=80&&component.left<=main.right+12&&component.right>=main.left-12&&component.top<=main.bottom+12&&component.bottom>=main.top-12)for(const p of component.pixels)allowed[p]=1;
 for(let y=0;y<512;y++)for(let x=0;x<512;x++){let near=false;for(let dy=-2;dy<=2&&!near;dy++)for(let dx=-2;dx<=2;dx++)if(x+dx>=0&&x+dx<512&&y+dy>=0&&y+dy<512&&allowed[(y+dy)*512+x+dx]){near=true;break;}if(!near){const i=((oy+y)*battle.width+ox+x)*4;for(const layer of Object.values(battle.layers))layer.fill(0,i,i+4);}}
}
async function presentation(type,extract,width,height){for(const channel of channels){let image=sharp(master.layers[channel],{raw:{width:master.width,height:master.height,channels:4}});if(extract)image=image.extract(extract);const small=await image.resize(width-32,height-32,{fit:'contain',background:{r:0,g:0,b:0,alpha:0}}).extend({left:16,right:16,top:16,bottom:16,background:{r:0,g:0,b:0,alpha:0}}).webp({lossless:true,effort:5}).toBuffer();await writeAsset(out+'/'+type+'-'+channel+'.webp',small);}}
await presentation('selection',null,768,1024);
await presentation('portrait',{left:Math.round(master.width*.16),top:Math.round(master.height*.075),width:Math.round(master.width*.68),height:Math.round(master.height*.49)},512,512);
await presentation('cutin',{left:0,top:Math.round(master.height*.08),width:master.width,height:Math.round(master.height*.58)},1024,512);
const cells=[];const cw=Math.floor(battle.width/3),ch=Math.floor(battle.height/2);
for(let pose=0;pose<6;pose++){const x=pose%3*cw,y=Math.floor(pose/3)*ch;let left=cw,right=0,top=ch,bottom=0;for(let py=0;py<ch;py++)for(let px=0;px<cw;px++)if(battle.layers.base[((y+py)*battle.width+x+px)*4+3]>32){left=Math.min(left,px);right=Math.max(right,px);top=Math.min(top,py);bottom=Math.max(bottom,py);}left=Math.max(0,left-2);top=Math.max(0,top-2);right=Math.min(cw-1,right+2);bottom=Math.min(ch-1,bottom+2);cells.push({left:x+left,top:y+top,width:right-left+1,height:bottom-top+1});}
for(const channel of channels){const overlays=[];for(let row=0;row<5;row++)for(let frame=0;frame<[4,6,6,2,6][row];frame++){const count=[4,6,6,2,6][row],phase=frame/count*Math.PI*2,pose=row===2?(frame<3?2:5):row,angle=row===3?(frame?5:-5):row===2?Math.sin(phase)*4:row===1?Math.sin(phase)*2:0;
  const {data,info}=await sharp(battle.layers[channel],{raw:{width:battle.width,height:battle.height,channels:4}}).extract(cells[pose]).resize(222,222,{fit:'inside'}).rotate(angle,{background:{r:0,g:0,b:0,alpha:0}}).ensureAlpha().raw().toBuffer({resolveWithObject:true});const left=frame*256+Math.round((256-info.width)/2+(row===1?Math.sin(phase)*2:0)),top=row*256+Math.round(242-info.height+(row===0?Math.sin(phase)*1.5:row===4?-3:row===1?Math.abs(Math.sin(phase))*2:0));overlays.push({input:data,raw:{width:info.width,height:info.height,channels:4},left,top});}
 await writeAsset(out+'/gameplay-'+channel+'.webp',await sharp({create:{width:1536,height:1280,channels:4,background:{r:0,g:0,b:0,alpha:0}}}).composite(overlays).webp({lossless:true,effort:5}).toBuffer());}
// Resampling independent masks can overshoot alpha along a fine strand.
// Clip the packed masks to the matching packed source after every transform.
for(const type of ['selection','portrait','cutin','gameplay']){const {data:base,info}=await sharp(await fs.readFile(out+'/'+type+'-base.webp')).ensureAlpha().raw().toBuffer({resolveWithObject:true});for(const channel of channels.slice(1)){const path=out+'/'+type+'-'+channel+'.webp',mask=await sharp(await fs.readFile(path)).ensureAlpha().raw().toBuffer();for(let i=3;i<mask.length;i+=4){mask[i]=Math.min(mask[i],base[i]);if(!mask[i])mask[i-3]=mask[i-2]=mask[i-1]=0;}await writeAsset(path,await sharp(mask,{raw:{width:info.width,height:info.height,channels:4}}).webp({lossless:true,effort:5}).toBuffer());}}
const catalogPath='public/assets/catalog.json',catalog=JSON.parse(await fs.readFile(catalogPath,'utf8'));catalog.reaper=Object.fromEntries(['selection','portrait','cutin','gameplay'].map(type=>[type,Object.fromEntries(channels.map(channel=>[channel,'assets/monsters/reaper/'+type+'-'+channel+'.webp']))]));await fs.writeFile(catalogPath,JSON.stringify(catalog,null,2)+'\n');
for(const id of ['wave','sweep','blink','volley','eclipse','unbound','siphon'])await sharp(root+'/reaper-'+id+'.png').resize(512,512,{fit:'contain',background:{r:0,g:0,b:0,alpha:0}}).webp({lossless:true,effort:5}).toFile('public/assets/vfx/reaper-'+id+'.webp');
await fs.copyFile('public/assets/vfx/reaper-wave.webp','public/assets/vfx/reaper.webp');
console.log('Reaper: four presentation sets, five animated states, seven generated effects, continuous shaded color masks.');
