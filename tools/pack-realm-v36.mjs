import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
const sharp=createRequire(import.meta.url)('C:/Users/novam/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
for(const id of ['portal','sealed-gate','warning','landing','mist']){await sharp('art-source/stage3/'+id+'-v36.png').trim().resize(id==='sealed-gate'||id==='mist'?768:512,id==='sealed-gate'||id==='mist'?384:512,{fit:'contain',background:'#00000000'}).webp({quality:94,alphaQuality:100}).toFile('public/assets/stage3/'+id+'.webp');}
await sharp('public/assets/stage3/landing.webp').webp({lossless:true}).toFile('public/assets/vfx/lycanthrope-landing.webp');
const source=[],overlays=[],fog=await sharp('public/assets/stage3/mist.webp').trim().resize(1536,180,{fit:'fill'}).png().toBuffer();
for(let y=0;y<3;y++)for(let x=0;x<3;x++)source.push({input:await sharp(`art-source/stage3/sectors/${x}-${y}.png`).resize(1536,1536).png().toBuffer(),left:256+x*1536,top:256+y*1536});
for(const seam of [1792,3328])for(let k=0;k<3;k++){overlays.push({input:fog,left:256+k*1536,top:seam-90});overlays.push({input:await sharp(fog).rotate(90).png().toBuffer(),left:seam-90,top:256+k*1536});}
const edgeFog=await sharp('public/assets/stage3/mist.webp').trim().resize(1536,256,{fit:'fill'}).png().toBuffer();
for(let k=0;k<3;k++){for(const edge of [0,4864]){overlays.push({input:edgeFog,left:256+k*1536,top:edge});overlays.push({input:await sharp(edgeFog).rotate(90).png().toBuffer(),left:edge,top:256+k*1536});}}
const base=await sharp({create:{width:5120,height:5120,channels:4,background:'#090913'}}).composite(source).png().toBuffer(),map=await sharp(base).composite(overlays).png().toBuffer();
await mkdir('public/assets/stage3/map-v36',{recursive:true});
for(let y=0;y<10;y++)for(let x=0;x<10;x++)await writeFile(`public/assets/stage3/map-v36/${x}-${y}.webp`,await sharp(map).extract({left:x*512,top:y*512,width:512,height:512}).webp({quality:90}).toBuffer());
await sharp(map).resize(1280,1280).png().toFile('art-source/stage3/layout-v36-overview.png');console.log('Packed production portal, sealed gate, warnings, landing and veiled map sectors.');
