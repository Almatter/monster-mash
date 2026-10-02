// The generated guide supplies continuous material regions; the original drawing supplies every shaded pixel.
// Only the four selection masks are rebuilt. Gameplay, portraits, and the selection base are untouched.
import fs from 'node:fs/promises';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const sharp=require(process.env.SHARP_PATH||'C:/Users/novam/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const root='public/assets/monsters/devourer',channels=['primary','secondary','accent','power'];
const source=await sharp('art-source/devourer/selection-master.png').ensureAlpha().raw().toBuffer({resolveWithObject:true});
const {width,height}=source.info;
const guide=await sharp('art-source/devourer/selection-color-guide.png').resize(width,height,{fit:'fill'}).ensureAlpha().raw().toBuffer();
const labels=new Uint8Array(width*height),colors=[[0,0,255],[255,0,255],[255,255,0],[255,0,0]];
for(let p=0;p<labels.length;p++){
 const i=p*4;if(guide[i+3]<24||Math.max(guide[i],guide[i+1],guide[i+2])<90)continue;
 let best=Infinity;
 for(let channel=0;channel<4;channel++){const rgb=colors[channel],distance=(guide[i]-rgb[0])**2+(guide[i+1]-rgb[1])**2+(guide[i+2]-rgb[2])**2;if(distance<best){best=distance;labels[p]=channel+1;}}
}
// Bridge the guide's thin black ink gaps. The source ink is preserved separately below.
const filled=labels.slice();
for(let y=0;y<height;y++)for(let x=0;x<width;x++){
 const p=y*width+x;if(labels[p]||source.data[p*4+3]<16)continue;
 search:for(let radius=1;radius<=3;radius++)for(let dy=-radius;dy<=radius;dy++)for(let dx=-radius;dx<=radius;dx++){
  if(Math.max(Math.abs(dx),Math.abs(dy))!==radius||x+dx<0||x+dx>=width||y+dy<0||y+dy>=height)continue;
  const label=labels[(y+dy)*width+x+dx];if(label){filled[p]=label;break search;}
 }
}
const refs=[238,160,225,215],base=await sharp(root+'/selection-base.webp').ensureAlpha().raw().toBuffer({resolveWithObject:true});
await fs.mkdir('test-results/devourer-selection-before',{recursive:true});
for(let channel=0;channel<channels.length;channel++){
 const file=root+'/selection-'+channels[channel]+'.webp';
 const backup='test-results/devourer-selection-before/selection-'+channels[channel]+'.webp';
 try{await fs.access(backup);}catch{await fs.copyFile(file,backup);}
 const pixels=Buffer.alloc(width*height*4);
 for(let p=0;p<labels.length;p++){
  if(filled[p]!==channel+1)continue;const i=p*4,r=source.data[i],g=source.data[i+1],b=source.data[i+2],bright=Math.max(r,g,b);
  const ink=Math.max(0,Math.min(1,(bright-27)/35)),shade=Math.max(.1,Math.min(1.15,bright/refs[channel]));
  const value=Math.min(255,Math.round(shade*220));pixels[i]=pixels[i+1]=pixels[i+2]=value;pixels[i+3]=Math.round(source.data[i+3]*ink);
 }
 const resized=await sharp(pixels,{raw:{width,height,channels:4}}).resize(768,1024,{fit:'contain',background:{r:0,g:0,b:0,alpha:0}}).ensureAlpha().raw().toBuffer();
 for(let i=0;i<resized.length;i+=4){resized[i+3]=Math.min(resized[i+3],base.data[i+3]);if(!resized[i+3])resized[i]=resized[i+1]=resized[i+2]=0;}
 await sharp(resized,{raw:{width:768,height:1024,channels:4}}).webp({lossless:true,effort:5}).toFile(file);
}
console.log('Refined four Devourer selection masks with registered material regions, source shading, preserved ink, and clipped alpha.');
