import {createRequire} from 'node:module';
const require=createRequire('C:/Users/novam/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/package.json'),sharp=require('sharp');
const points=[[-1040,-930],[1010,-950],[990,930],[-1040,950]],corners=[[-500,-520],[560,-480],[520,540],[-560,500]];
const strokes=[];const line=(a,b,w)=>strokes.push(`<path d="M ${a[0]+1500} ${a[1]+1500} L ${b[0]+1500} ${b[1]+1500}" stroke="#b29262" stroke-width="${w}" stroke-linecap="round"/>`);
for(let i=0;i<4;i++){line(corners[i],corners[(i+1)%4],580);line(corners[i],points[i],500);strokes.push(`<circle cx="${points[i][0]+1500}" cy="${points[i][1]+1500}" r="365" fill="#b29262"/>`);}
for(const [a,b] of [[[0,-1500],[0,-500]],[[1500,0],[540,0]],[[0,1500],[0,520]],[[-1500,0],[-540,0]]])line(a,b,530);
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="3000" height="3000"><rect width="3000" height="3000" fill="#49433d"/>${strokes.join('')}</svg>`;
await sharp(Buffer.from(svg)).resize(1536,1536).png().toFile('art-source/stage2/regions/layout-guide.png');
