import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const sharp=require(process.env.SHARP_PATH||'C:/Users/novam/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const root='art-source/devourer',out='public/assets/monsters/devourer';
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
  const preserve=0; // Bone carapace and metal faces are customizable material, not human skin.
  let channel='base',shade=0;
  if(r>g*1.7&&r>b*1.7&&r>120&&g<115){channel='power';shade=r/215;}
  else if(r>125&&g>85&&r>g*1.16&&g>b*1.35){channel='accent';shade=r/225;}
  else if(r>140&&g>130&&b>105&&r>b*1.09){channel='primary';shade=Math.max(r,g)/238;}
  else if(r>46&&r<184&&r>g*1.13&&g>b*1.04){channel='secondary';shade=r/160;}
  if(Math.max(r,g,b)<32)channel='base'; // Keep ink and deepest occlusion neutral.
  const neutral=layers.base;neutral[i]=r;neutral[i+1]=g;neutral[i+2]=b;neutral[i+3]=a;
  if(channel!=='base'){const target=layers[channel],v=Math.round(Math.max(.22,Math.min(1.3,shade))*220),opacity=Math.round(a*(1-preserve));if(opacity>0){target[i]=v;target[i+1]=v;target[i+2]=v;target[i+3]=opacity;counts[channel]++;}else counts.base++;}else counts.base++;
 }
 return {layers,info,counts};
}
const master=await split('selection-master.png',false),battle=await split('gameplay-master.png',true);
console.log('Masked pixels',master.counts,battle.counts);
async function presentation(type,source,extract,width,height){
 for(const channel of channels){let image=sharp(source.layers[channel],{raw:{width:source.info.width,height:source.info.height,channels:4}});if(extract)image=image.extract(extract);const scaled=await image.resize(width,height,{fit:'contain',background:{r:0,g:0,b:0,alpha:0}}).png().toBuffer();await fs.writeFile(path.join(out,type+'-'+channel+'.png'),scaled);}
}
await presentation('selection',master,null,768,1024);
await presentation('portrait',master,{left:170,top:80,width:760,height:690},512,512);
await presentation('cutin',master,{left:155,top:65,width:950,height:840},1024,512);
for(const channel of channels){
 const atlas=Buffer.alloc(1536*1280*4);const original=sharp(battle.layers[channel],{raw:{width:battle.info.width,height:battle.info.height,channels:4}});
 for(let row=0;row<5;row++)for(let frame=0;frame<[4,6,6,2,6][row];frame++){
  const count=[4,6,6,2,6][row],phase=frame/count*Math.PI*2;
  const move=row===1,attack=row===2,hurt=row===3,ultimate=row===4;
  const sw=Math.round(216*(ultimate?1.06:attack?1.03:1)),sh=Math.round(182*(ultimate?1.06:attack?1.03:1));
  const angle=hurt?(frame?8:-8):attack?Math.sin(phase)*7:move?Math.sin(phase)*4:0;
  const tile=await original.clone().resize(sw,sh).rotate(angle,{background:{r:0,g:0,b:0,alpha:0}}).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  const tileW=tile.info.width,tileH=tile.info.height,ox=frame*256+Math.round((256-tileW)/2+(move?Math.sin(phase)*3:attack?Math.sin(phase)*4:0)),oy=row*256+Math.round(10+(256-tileH)/2-10+(move?Math.abs(Math.sin(phase))*3:ultimate?-6:0));
  for(let y=0;y<tileH;y++){const dy=oy+y;if(dy<row*256||dy>=(row+1)*256)continue;for(let x=0;x<tileW;x++){const dx=ox+x;if(dx<frame*256||dx>=(frame+1)*256)continue;const si=(y*tileW+x)*4,di=(dy*1536+dx)*4;tile.data.copy(atlas,di,si,si+4);}}
 }
 await sharp(atlas,{raw:{width:1536,height:1280,channels:4}}).png({compressionLevel:9,palette:false}).toFile(path.join(out,'gameplay-'+channel+'.png'));
}
console.log('Devourer art layers written to',out);
