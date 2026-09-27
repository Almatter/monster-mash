import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),sharp=require(process.env.SHARP_PATH||'C:/Users/novam/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const source='art-source/vfx/devourer-claw-wave.png',target='public/assets/vfx/devourer-claw-wave.webp';
if(!(await sharp(source).metadata()).hasAlpha)throw Error('Claw wave needs transparent alpha');
await sharp(source).resize(512,512).webp({quality:91,alphaQuality:100,effort:5}).toFile(target);
console.log('Devourer claw wave packed at 512 square with alpha.');
