import fs from 'node:fs/promises';import {createRequire} from 'node:module';const require=createRequire(import.meta.url),sharp=require(process.env.SHARP_PATH||'C:/Users/novam/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const catalog=JSON.parse(await fs.readFile('public/assets/catalog.json','utf8'));let cleaned=0;
for(const entry of Object.values(catalog))for(const set of Object.values(entry)){
 const base=await sharp('public/'+set.base).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 for(const channel of ['primary','secondary','accent','power']){if(!set[channel])continue;const file='public/'+set[channel],mask=await sharp(file).ensureAlpha().raw().toBuffer({resolveWithObject:true});if(mask.info.width!==base.info.width||mask.info.height!==base.info.height)throw Error(file+' registration mismatch');
 for(let i=0;i<mask.data.length;i+=4){mask.data[i+3]=Math.min(mask.data[i+3],base.data[i+3]);if(mask.data[i+3]===0){mask.data[i]=0;mask.data[i+1]=0;mask.data[i+2]=0;}}
 const tmp=file+'.tmp.webp';await sharp(mask.data,{raw:{width:mask.info.width,height:mask.info.height,channels:4}}).webp({lossless:true,effort:4}).toFile(tmp);cleaned++;
 }
}
console.log('Prepared '+cleaned+' clipped tint masks for replacement.');
