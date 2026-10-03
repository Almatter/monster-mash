import {createRequire} from 'node:module';
const sharp=createRequire('C:/Users/novam/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/package.json')('sharp');
await sharp('art-source/stage2/enemy-hit.png').resize(256,256,{fit:'contain',background:{r:0,g:0,b:0,alpha:0}}).webp({quality:88,alphaQuality:100}).toFile('public/assets/vfx/enemy-hit.webp');
await sharp('art-source/stage2/healing-shrine.png').trim().resize(256,256,{fit:'contain',background:{r:0,g:0,b:0,alpha:0}}).webp({quality:88,alphaQuality:100}).toFile('public/assets/arena/court-shrine.webp');
