import {createRequire} from 'node:module';
const require=createRequire('C:/Users/novam/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/package.json'),sharp=require('sharp');
await sharp('art-source/stage2/ash-terrain.png').resize(512,512).webp({quality:86}).toFile('public/assets/arena/floor-court.webp');
await sharp('art-source/stage2/rock-ridge.png').trim({threshold:5}).resize(1024,342,{fit:'contain',background:{r:0,g:0,b:0,alpha:0}}).webp({quality:94,alphaQuality:100}).toFile('public/assets/arena/court-ridge.webp');

// Extract equal atlas cells and pack native-resolution silhouettes. No enlargement.
const atlas='art-source/stage2/landmarks.png',meta=await sharp(atlas).metadata(),cell=Math.floor(meta.width/2);
for(const [i,id] of ['swordfall','rib-gate','sun-spire','broken-bell'].entries()){
 const png=await sharp(atlas).extract({left:(i%2)*cell,top:Math.floor(i/2)*cell,width:cell,height:cell}).png().toBuffer();
 await sharp(png).trim({threshold:5}).resize(384,432,{fit:'contain',background:{r:0,g:0,b:0,alpha:0},withoutEnlargement:true}).webp({quality:94,alphaQuality:100}).toFile('public/assets/arena/court-'+id+'.webp');
}

for(const kind of ['crescent','fork'])await sharp('art-source/stage2/rock-'+kind+'.png').trim({threshold:5}).resize(1024,960,{fit:'contain',background:{r:0,g:0,b:0,alpha:0}}).webp({quality:94,alphaQuality:100}).toFile('public/assets/arena/court-'+kind+'.webp');
await sharp('art-source/stage2/ash-trace.png').trim({threshold:5}).resize(256,144,{fit:'contain',background:{r:0,g:0,b:0,alpha:0}}).webp({quality:92,alphaQuality:100}).toFile('public/assets/vfx/court-ash-trace.webp');

await sharp('art-source/stage2/border-ridge.png').trim({threshold:5}).resize(768,256,{fit:'contain',background:{r:0,g:0,b:0,alpha:0}}).webp({quality:94,alphaQuality:100}).toFile('public/assets/arena/court-border.webp');
