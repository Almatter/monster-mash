import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),sharp=require(process.env.SHARP_PATH||'C:/Users/novam/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
for(const name of ['lycanthrope-cyclone','lycanthrope-spin','guardian-mana-burst']){
 const source='art-source/vfx/cyclone/'+name+'.png',target='public/assets/'+(name.startsWith('guardian-')?'stage3/':'vfx/')+name+'.webp';
 const metadata=await sharp(source).metadata();if(!metadata.hasAlpha)throw Error(name+' requires generated transparency');
 await sharp(source).resize(512,512,{fit:'contain',background:{r:0,g:0,b:0,alpha:0}}).webp({quality:90,alphaQuality:100,effort:5}).toFile(target);
 const {data,info}=await sharp(target).ensureAlpha().raw().toBuffer({resolveWithObject:true});let clear=0,solid=0;for(let i=3;i<data.length;i+=info.channels){clear+=data[i]===0;solid+=data[i]>200;}if(clear<info.width*info.height*.1||solid<info.width*info.height*.05)throw Error('Invalid alpha coverage '+name);console.log(target);
}
