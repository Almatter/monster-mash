// Continuous generated material guides, original shading and original registered bases.
// No generated guide is ever rendered in the game; only grayscale tint masks ship.
import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
import {materialLabels} from './material-masks.mjs';
const sharp=createRequire(import.meta.url)(process.env.SHARP_PATH||'C:/Users/novam/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
sharp.cache(false);
const catalogPath='public/assets/catalog.json',catalog=JSON.parse(await fs.readFile(catalogPath,'utf8'));
const configs={
 sovereign:{portrait:[305,75,420,480],cutin:[120,30,780,900],sw:146,sh:222,refs:[200,160,235,250,240,160]},
 calamity:{portrait:[170,80,760,690],cutin:[65,65,900,840],sw:154,sh:228,refs:[205,160,225,215,245],contain:true},
 overlord:{portrait:[430,80,620,700],cutin:[300,50,800,740],sw:235,sh:205,refs:[150,160,225,230,245]},
 titan:{portrait:[320,95,690,690],cutin:[145,35,1020,900],sw:220,sh:195,refs:[190,140,235,245]}
};
const transparent={r:0,g:0,b:0,alpha:0},clamp=n=>Math.max(0,Math.min(1,n));
for(const [id,cfg] of Object.entries(configs)){
 const channels=['primary','secondary','accent','power',...(id==='titan'?[]:['skin']),...(id==='sovereign'?['hair']:[])],root='art-source/'+id,out='public/assets/monsters/'+id;
 async function split(kind){const {data,info}=await sharp(root+'/'+kind+'-master.png').ensureAlpha().raw().toBuffer({resolveWithObject:true}),{width,height}=info;
  // Use exactly the established gameplay chroma key so masks remain registered.
  if(kind==='gameplay')for(let i=0;i<data.length;i+=4){const key=clamp((data[i+1]-Math.max(data[i],data[i+2])-38)/150);data[i+3]=Math.round(data[i+3]*(1-key));if(data[i+3]&&key>0)data[i+1]=Math.max(0,Math.min(255,Math.round((data[i+1]-key*255)/(1-key))));}
  const guide=await sharp(root+'/'+kind+'-color-guide.png').resize(width,height,{fit:'fill'}).ensureAlpha().raw().toBuffer(),labels=materialLabels(data,guide,width,height,channels.length),layers=channels.map(()=>Buffer.alloc(data.length)),counts=channels.map(()=>0);
  for(let p=0;p<labels.length;p++){const c=labels[p]-1,i=p*4;if(c<0||data[i+3]<3)continue;const bright=Math.max(data[i],data[i+1],data[i+2]),ink=clamp((bright-25)/28),value=Math.min(255,Math.round(bright/cfg.refs[c]*220));const pixels=layers[c];pixels[i]=pixels[i+1]=pixels[i+2]=value;pixels[i+3]=Math.round(data[i+3]*ink);if(pixels[i+3]>8)counts[c]++;}
  console.log(id,kind,Object.fromEntries(channels.map((c,i)=>[c,counts[i]])));return {layers,width,height};
 }
 const master=await split('selection'),battle=await split('gameplay');
 async function save(type,c,bytes){const file=out+'/'+type+'-'+channels[c]+'.webp',base=await sharp(await fs.readFile(out+'/'+type+'-base.webp')).ensureAlpha().raw().toBuffer({resolveWithObject:true}),mask=await sharp(bytes).ensureAlpha().raw().toBuffer();
  for(let i=3;i<mask.length;i+=4){mask[i]=Math.min(mask[i],base.data[i]);if(!mask[i])mask[i-3]=mask[i-2]=mask[i-1]=0;}
  await fs.writeFile(file,await sharp(mask,{raw:{width:base.info.width,height:base.info.height,channels:4}}).webp({lossless:true,effort:5}).toBuffer());catalog[id][type][channels[c]]=file.slice(7);
 }
 for(const [type,w,h,crop] of [['selection',768,1024],['portrait',512,512,cfg.portrait],['cutin',1024,512,cfg.cutin]])for(let c=0;c<channels.length;c++){
  let img=sharp(master.layers[c],{raw:{width:master.width,height:master.height,channels:4}});if(crop){const [left,top,width,height]=crop;img=img.extract({left,top,width,height});}
  await save(type,c,await img.resize(w,h,{fit:'contain',background:transparent}).png().toBuffer());
 }
 for(let c=0;c<channels.length;c++){const atlas=Buffer.alloc(1536*1280*4),original=sharp(battle.layers[c],{raw:{width:battle.width,height:battle.height,channels:4}});
  for(let row=0;row<5;row++)for(let frame=0;frame<[4,6,6,2,6][row];frame++){
   const phase=frame/[4,6,6,2,6][row]*Math.PI*2,move=row===1,attack=row===2,hurt=row===3,ultimate=row===4,scale=ultimate?1.06:attack?1.03:1;
   const angle=hurt?(frame?8:-8):attack?Math.sin(phase)*7:move?Math.sin(phase)*4:0;
   const tile=await original.clone().resize(Math.round(cfg.sw*scale),Math.round(cfg.sh*scale),cfg.contain?{fit:'contain',background:transparent}:{}).rotate(angle,{background:transparent}).ensureAlpha().raw().toBuffer({resolveWithObject:true});
   const ox=frame*256+Math.round((256-tile.info.width)/2+(move?Math.sin(phase)*3:attack?Math.sin(phase)*4:0)),oy=row*256+Math.round((256-tile.info.height)/2+(move?Math.abs(Math.sin(phase))*3:ultimate?-6:0));
   for(let y=0;y<tile.info.height;y++)for(let x=0;x<tile.info.width;x++){const dx=ox+x,dy=oy+y;if(dx<frame*256||dx>=(frame+1)*256||dy<row*256||dy>=(row+1)*256)continue;const si=(y*tile.info.width+x)*4;tile.data.copy(atlas,(dy*1536+dx)*4,si,si+4);}
  }
  await save('gameplay',c,await sharp(atlas,{raw:{width:1536,height:1280,channels:4}}).png().toBuffer());
 }
}
await fs.writeFile(catalogPath,JSON.stringify(catalog,null,2)+'\n');
console.log('Refined four character material sets; registered bases and animation geometry retained.');
