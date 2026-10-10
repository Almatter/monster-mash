import{createRequire}from'node:module';import{mkdir,writeFile}from'node:fs/promises';import{REALM_GROTTOS,REALM_DECKS,REALM_SCALE}from'../src/realm-layout.ts';
const sharp=createRequire(import.meta.url)('C:/Users/novam/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp'),root='art-source/stage3/v42/',n=1254,factor=3;
const layers=[];
for(let y=0;y<3;y++)for(let x=0;x<3;x++){const left=Math.max(0,x*418-32),top=Math.max(0,y*418-32),right=Math.min(n,(x+1)*418+32),bottom=Math.min(n,(y+1)*418+32),width=(right-left)*factor,height=(bottom-top)*factor;
 const {data,info}=await sharp(root+`sectors/${x}-${y}.png`).resize(width,height,{fit:'fill'}).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 for(let py=0;py<height;py++)for(let px=0;px<width;px++){let a=1;const feather=32*factor;if(x>0)a*=Math.min(1,px/feather);if(x<2)a*=Math.min(1,(width-1-px)/feather);if(y>0)a*=Math.min(1,py/feather);if(y<2)a*=Math.min(1,(height-1-py)/feather);data[(py*width+px)*4+3]*=a;}
 layers.push({input:await sharp(data,{raw:info}).png().toBuffer(),left:left*factor,top:top*factor});
}
const assembled=await sharp(root+'master.png').resize(n*factor,n*factor).composite(layers).png().toBuffer();await sharp(assembled).png().toFile(root+'assembled.png');await sharp(assembled).resize(n,n).png().toFile(root+'overview.png');
const width=Math.round(n*REALM_SCALE),terrain=await sharp(assembled).resize(width,width).ensureAlpha().raw().toBuffer({resolveWithObject:true});
// Only the outer fog crop is feathered; no walkable structure is near this edge.
for(let y=0;y<width;y++)for(let x=0;x<width;x++){const edge=Math.min(x,y,width-1-x,width-1-y);if(edge<170)terrain.data[(y*width+x)*4+3]*=edge/170;}
const fog=await sharp('public/assets/stage3/ether-fog.webp').png().toBuffer(),back=[];for(let y=0;y<10;y++)for(let x=0;x<10;x++)back.push({input:fog,left:x*1024,top:y*1024});
const left=Math.round(5120-632*REALM_SCALE),top=Math.round(5120-524*REALM_SCALE-38),input=await sharp(terrain.data,{raw:terrain.info}).png().toBuffer();
// Master crop may extend beyond the finite terrain through non-walkable fog.
const cropped=await sharp(input).extract({left:0,top:0,width:Math.min(width,10240-left),height:Math.min(width,10240-top)}).png().toBuffer();
const map=await sharp({create:{width:10240,height:10240,channels:3,background:'#192859'}}).composite([...back,{input:cropped,left,top}]).png().toBuffer();
await mkdir('public/assets/stage3/map-v42',{recursive:true});for(let y=0;y<20;y++){for(let x=0;x<20;x++)await writeFile(`public/assets/stage3/map-v42/${x}-${y}.webp`,await sharp(map).extract({left:x*512,top:y*512,width:512,height:512}).webp({quality:90}).toBuffer());console.log('Packed terrain row',y);}
const poly=p=>p.map(q=>`${q.x/REALM_SCALE+632},${(q.y+38)/REALM_SCALE+524}`).join(' ');const outlines=[...REALM_DECKS,...REALM_GROTTOS.map(s=>({points:s.floor.map(([x,y])=>({x:s.x+x,y:s.y+y}))}))];const svg=`<svg width="1254" height="1254" xmlns="http://www.w3.org/2000/svg">${outlines.map(s=>`<polygon points="${poly(s.points)}" fill="#66ff6628" stroke="#00ff77" stroke-width="1"/>`).join('')}<ellipse cx="632" cy="524" rx="${1065/REALM_SCALE}" ry="${747/REALM_SCALE}" fill="#66ff6628" stroke="#00ff77"/><ellipse cx="632" cy="524" rx="${805/REALM_SCALE}" ry="${644/REALM_SCALE}" fill="none" stroke="#ff7766"/></svg>`;
await sharp(assembled).resize(n,n).composite([{input:Buffer.from(svg)}]).png().toFile('test-results/v42-floor-overlay.png');console.log('Nine master-referenced art sectors; 400 streamed tiles; 24 decoded maximum.');
