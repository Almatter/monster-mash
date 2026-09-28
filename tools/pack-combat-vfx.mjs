import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const sharp=require(process.env.SHARP_PATH||'C:/Users/novam/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');

for(const name of ['titan-cleave','overlord-soul-brand']){
 const source=`art-source/vfx/${name}.png`,target=`public/assets/vfx/${name}.webp`;
 const metadata=await sharp(source).metadata();
 if(!metadata.hasAlpha)throw Error(`${source} needs transparency`);
 await sharp(source).resize(512,512).webp({quality:90,alphaQuality:100,effort:5}).toFile(target);
 const {data,info}=await sharp(target).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const center=data[((info.height>>1)*info.width+(info.width>>1))*info.channels+3];
 if(center!==0)throw Error(`${name} must have a transparent center`);
 console.log(`${name}: 512px transparent combat sprite`);
}
