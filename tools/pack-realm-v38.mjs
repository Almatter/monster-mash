import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import {REALM_EDGE} from '../src/titan-realm-map.ts';
const sharp=createRequire(import.meta.url)('C:/Users/novam/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
// Mirrored quarters give the opaque generated texture exactly matching repeat edges.
const quarter=await sharp('art-source/stage3/ether-fog-v38.png').removeAlpha().resize(512,512).modulate({brightness:.65}).png().toBuffer();
const fog=await sharp({create:{width:1024,height:1024,channels:3,background:'#192859'}}).composite([
 {input:quarter,left:0,top:0},
 {input:await sharp(quarter).flop().png().toBuffer(),left:512,top:0},
 {input:await sharp(quarter).flip().png().toBuffer(),left:0,top:512},
 {input:await sharp(quarter).flip().flop().png().toBuffer(),left:512,top:512}
]).png().toBuffer();
await sharp(fog).webp({quality:94}).toFile('public/assets/stage3/ether-fog.webp');
const backdrop=[];for(let y=0;y<5;y++)for(let x=0;x<5;x++)backdrop.push({input:fog,left:x*1024,top:y*1024});
const background=await sharp({create:{width:5120,height:5120,channels:3,background:'#192859'}}).composite(backdrop).png().toBuffer();
const source=[],overlays=[];
for(let y=0;y<3;y++)for(let x=0;x<3;x++)source.push({input:await sharp(`art-source/stage3/sectors/${x}-${y}.png`).resize(1536,1536).png().toBuffer(),left:256+x*1536,top:256+y*1536});
// Light seam wisps join sectors; the opaque ether starts only beyond the outer paths.
const mist=await sharp('public/assets/stage3/mist.webp').trim().resize(1536,120,{fit:'fill'}).ensureAlpha().png().toBuffer();
for(const seam of [1792,3328])for(let k=0;k<3;k++){overlays.push({input:mist,left:256+k*1536,top:seam-60});overlays.push({input:await sharp(mist).rotate(90).png().toBuffer(),left:seam-60,top:256+k*1536});}
const curtain=await sharp('public/assets/stage3/mist.webp').trim().resize(1536,112,{fit:'fill'}).png().toBuffer();
for(let k=0;k<3;k++)for(const side of [-1,1]){const edge=2560+side*(REALM_EDGE+56)-56;overlays.push({input:curtain,left:256+k*1536,top:edge});overlays.push({input:await sharp(curtain).rotate(90).png().toBuffer(),left:edge,top:256+k*1536});}
const terrain=await sharp({create:{width:5120,height:5120,channels:4,background:'#00000000'}}).composite(source).png().toBuffer();
const layers=await sharp(terrain).composite(overlays).png().toBuffer();
// Fade illustration to the SAME globally aligned fog texture before its image ends.
function mask(vertical){const gradient=vertical?'x1="0" y1="0" x2="0" y2="1"':'x1="0" y1="0" x2="1" y2="0"';return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="5120" height="5120"><defs><linearGradient id="fade" ${gradient}><stop offset="5%" stop-color="white" stop-opacity="0"/><stop offset="${(2560-REALM_EDGE)/5120*100}%" stop-color="white" stop-opacity="1"/><stop offset="${(2560+REALM_EDGE)/5120*100}%" stop-color="white" stop-opacity="1"/><stop offset="95%" stop-color="white" stop-opacity="0"/></linearGradient></defs><rect width="5120" height="5120" fill="url(#fade)"/></svg>`);}
const horizontal=await sharp(layers).composite([{input:mask(false),blend:'dest-in'}]).png().toBuffer();
const feathered=await sharp(horizontal).composite([{input:mask(true),blend:'dest-in'}]).png().toBuffer();
const map=await sharp(background).composite([{input:feathered,left:0,top:0}]).png().toBuffer();
await mkdir('public/assets/stage3/map-v38',{recursive:true});
for(let y=0;y<10;y++)for(let x=0;x<10;x++)await writeFile(`public/assets/stage3/map-v38/${x}-${y}.webp`,await sharp(map).extract({left:x*512,top:y*512,width:512,height:512}).webp({quality:90}).toBuffer());
await sharp(map).resize(1280,1280).png().toFile('art-source/stage3/layout-v38-overview.png');
console.log('Packed opaque infinite ether, outer mana curtains and 100 bounded map tiles.');
