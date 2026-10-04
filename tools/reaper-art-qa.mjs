import {createRequire} from 'node:module';
const sharp=createRequire(import.meta.url)('C:/Users/novam/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const effects=['wave','sweep','blink','volley','eclipse','unbound','siphon'];
const overlays=[];
for(let i=0;i<effects.length;i++)overlays.push({input:await sharp('public/assets/vfx/reaper-'+effects[i]+'.webp').resize(260,260).png().toBuffer(),left:i%4*280+10,top:Math.floor(i/4)*280+10});
overlays.push({input:await sharp('public/assets/monsters/reaper/selection-base.webp').resize(260,540,{fit:'contain',background:'#24212c'}).png().toBuffer(),left:1120,top:10});
await sharp({create:{width:1400,height:560,channels:4,background:'#24212c'}}).composite(overlays).png().toFile('test-results/reaper-effects-qa.png');
await sharp('public/assets/monsters/reaper/gameplay-base.webp').flatten({background:'#24212c'}).png().toFile('test-results/reaper-atlas-qa.png');
