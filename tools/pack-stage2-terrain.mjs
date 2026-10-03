import {createRequire} from 'node:module';
const require=createRequire('C:/Users/novam/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/package.json'),sharp=require('sharp');
await sharp('art-source/stage2/ash-terrain.png').resize(512,512).webp({quality:86}).toFile('public/assets/arena/floor-court.webp');
await sharp('art-source/stage2/rock-ridge.png').trim({threshold:5}).resize(600,320,{fit:'contain',background:{r:0,g:0,b:0,alpha:0}}).webp({quality:90,alphaQuality:100}).toFile('public/assets/arena/court-ridge.webp');
