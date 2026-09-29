import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const sharp=require(process.env.SHARP_PATH||'C:/Users/novam/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const source='art-source/arena/stage2-adaptation-floor.png',target='public/assets/arena/floor-adaptation.webp';
const core=await sharp(source).resize(256,256,{fit:'cover'}).png().toBuffer();
const east=await sharp(core).flop().png().toBuffer(),south=await sharp(core).flip().png().toBuffer(),southeast=await sharp(core).flip().flop().png().toBuffer();
await sharp({create:{width:512,height:512,channels:4,background:'#19171f'}}).composite([{input:core,left:0,top:0},{input:east,left:256,top:0},{input:south,left:0,top:256},{input:southeast,left:256,top:256}]).webp({quality:87,effort:5}).toFile(target);
const {width,height}=await sharp(target).metadata();if(width!==512||height!==512)throw Error('Stage 2 floor must be 512px square');
console.log('Stage 2 adaptation floor: mirrored seamless 512px WebP');
