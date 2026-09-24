import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const sharp=require(process.env.SHARP_PATH||'C:/Users/novam/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const root='art-source/sovereign',out='public/assets/monsters/sovereign';
await fs.mkdir(out,{recursive:true});
const channels=['base','primary','secondary','accent','power'];
const clamp=n=>Math.max(0,Math.min(1,n));
async function split(name,keyGreen){
 const {data,info}=await sharp(path.join(root,name)).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const layers=Object.fromEntries(channels.map(k=>[k,Buffer.alloc(info.width*info.height*4)]));
 const counts=Object.fromEntries(channels.map(k=>[k,0]));
 for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++){
  const i=(y*info.width+x)*4;let r=data[i],g=data[i+1],b=data[i+2],a=data[i+3];
  if(keyGreen){const key=clamp((g-Math.max(r,b)-38)/150);a=Math.round(a*(1-key));if(a>0&&key>0){g=Math.max(0,Math.min(255,Math.round((g-key*255)/(1-key))));}}
  if(a<3)continue;
  const face=keyGreen?x>380&&x<655&&y>275&&y<470:x>385&&x<660&&y>85&&y<330;
  let channel='base',shade=0;
  if(!face&&g>r*1.35&&b>r*1.45&&g>78&&b>90&&g>b*.77){channel='power';shade=Math.max(g,b)/250;}
  else if(!face&&r>103&&g>67&&r>g*1.12&&g>b*1.34){channel='accent';shade=r/235;}
  else if(!face&&b>r*1.32&&b>g*1.12&&b>75&&g<155){channel='primary';shade=b/200;}
  else if(!face&&b>g*1.34&&r>g*1.23&&b>r*.86&&b+r>115){channel='secondary';shade=Math.max(r,b)/160;}
  counts[channel]++;
  if(channel==='base'){const target=layers.base;target[i]=r;target[i+1]=g;target[i+2]=b;target[i+3]=a;}
  else {const target=layers[channel],v=Math.round(Math.max(.22,Math.min(1.3,shade))*220);target[i]=v;target[i+1]=v;target[i+2]=v;target[i+3]=a;}
 }
 return {layers,info,counts};
}
const master=await split('selection-master.png',false),battle=await split('gameplay-master.png',true);
console.log('Masked pixels',master.counts,battle.counts);
async function presentation(type,source,extract,width,height){
 for(const channel of channels){let image=sharp(source.layers[channel],{raw:{width:source.info.width,height:source.info.height,channels:4}});if(extract)image=image.extract(extract);const scaled=await image.resize(width,height,{fit:'contain',background:{r:0,g:0,b:0,alpha:0}}).png().toBuffer();await fs.writeFile(path.join(out,type+'-'+channel+'.png'),scaled);}
}
await presentation('selection',master,null,768,1024);
await presentation('portrait',master,{left:305,top:75,width:420,height:480},512,512);
await presentation('cutin',master,{left:120,top:30,width:780,height:900},1024,512);
for(const channel of channels){
 const atlas=Buffer.alloc(1536*1280*4);const original=sharp(battle.layers[channel],{raw:{width:battle.info.width,height:battle.info.height,channels:4}});
 for(let row=0;row<5;row++)for(let frame=0;frame<[4,6,6,2,6][row];frame++){
  const count=[4,6,6,2,6][row],phase=frame/count*Math.PI*2;
  const move=row===1,attack=row===2,hurt=row===3,ultimate=row===4;
  const sw=Math.round(146*(ultimate?1.06:attack?1.03:1)),sh=Math.round(222*(ultimate?1.06:attack?1.03:1));
  const angle=hurt?(frame?8:-8):attack?Math.sin(phase)*7:move?Math.sin(phase)*4:0;
  const tile=await original.clone().resize(sw,sh).rotate(angle,{background:{r:0,g:0,b:0,alpha:0}}).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  const tileW=tile.info.width,tileH=tile.info.height,ox=frame*256+Math.round((256-tileW)/2+(move?Math.sin(phase)*3:attack?Math.sin(phase)*4:0)),oy=row*256+Math.round(10+(256-tileH)/2-10+(move?Math.abs(Math.sin(phase))*3:ultimate?-6:0));
  for(let y=0;y<tileH;y++){const dy=oy+y;if(dy<row*256||dy>=(row+1)*256)continue;for(let x=0;x<tileW;x++){const dx=ox+x;if(dx<frame*256||dx>=(frame+1)*256)continue;const si=(y*tileW+x)*4,di=(dy*1536+dx)*4;tile.data.copy(atlas,di,si,si+4);}}
 }
 await sharp(atlas,{raw:{width:1536,height:1280,channels:4}}).png({compressionLevel:9,palette:false}).toFile(path.join(out,'gameplay-'+channel+'.png'));
}
console.log('Sovereign art layers written to',out);
