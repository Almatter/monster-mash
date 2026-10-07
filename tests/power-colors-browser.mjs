import assert from 'node:assert/strict';import {pathToFileURL} from 'node:url';import {mkdir,writeFile} from 'node:fs/promises';
const {chromium}=await import(pathToFileURL(process.env.PLAYWRIGHT_PATH).href),browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_PATH}),origin=process.env.HUNT_ORIGIN||'http://127.0.0.1:4173';await mkdir('test-results',{recursive:true});
try{
 const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(origin+'/verify.html');
 const proof=await page.evaluate(async()=>{
  const {Renderer}=await import('./src/renderer.js'),{CHAMPION_VFX}=await import('./src/content-vfx.js'),{PLAYER_VFX}=await import('./src/power-vfx.js'),{Game}=await import('./src/simulation.js');
  const r=new Renderer(document.createElement('canvas')),all=[...PLAYER_VFX,'hostile-bolt','hostile-elite','hostile-titan','hostile-elite-warning','hostile-titan-warning','court-slam','colossus-warning','court-ash-trace'];for(const key of all)r.loadVfx(key);
  const deadline=performance.now()+20000;while(all.some(k=>!r.vfx.has(k))){if(performance.now()>deadline)throw Error('Missing effect art');await new Promise(resolve=>setTimeout(resolve,30));}
  const board=document.createElement('canvas');board.width=960;board.height=all.length*100;const ctx=board.getContext('2d');ctx.fillStyle='#1b1820';ctx.fillRect(0,0,board.width,board.height);let row=0;const results=[];
  for(const key of all){const source=r.vfx.get(key),signatures=[];for(const [column,color] of ['','#e975bc','#49b3aa'].entries()){r.vfxColor=color;const out=r.tintVfx(key,source),c=document.createElement('canvas');c.width=c.height=96;c.getContext('2d').drawImage(out,0,0,96,96);const d=c.getContext('2d').getImageData(0,0,96,96).data;let hash=0,opaque=0;for(let i=0;i<d.length;i+=4){hash=(Math.imul(hash,31)+d[i]*3+d[i+1]*5+d[i+2]*7+d[i+3])>>>0;if(d[i+3]>20)opaque++;}if(opaque<40)throw Error('Empty effect '+key);signatures.push(hash);ctx.drawImage(c,340+column*180,row*100,96,96);}
   const owned=PLAYER_VFX.has(key);if(new Set(signatures).size!==(owned?3:1))throw Error('Wrong color ownership '+key);results.push({key,owned,signatures});ctx.fillStyle='#eee5d4';ctx.font='16px Arial';ctx.fillText(key,12,row*100+50);row++;
  }
  if(r.tintedVfx.size>16)throw Error('Unbounded tint cache');
  const warnings=[];for(const kind of ['elite','titan']){const g=new Game(99,{monsterId:'devourer',colors:{power:'#49b3aa'}}),e=g.spawn(kind);Object.assign(e,{x:150,y:0,windup:.6});g.rebuildGrid();const calls=[],draw=r.drawVfx.bind(r);r.drawVfx=(c,key,...args)=>{calls.push(key);return draw(c,key,...args);};r.low=true;r.draw(g,0);if(!calls.includes('hostile-'+kind+'-warning'))throw Error('Warning art not used '+kind);g.effect(150,0,'slam-'+kind,kind==='titan'?240:140);r.draw(g,.1);if(!calls.includes('hostile-'+kind))throw Error('Impact art not used '+kind);warnings.push({kind,warning:true,impact:true});r.drawVfx=draw;}
  return {results,warnings,cache:r.tintedVfx.size,board:board.toDataURL()};
 });
 await writeFile('test-results/power-effects.png',Buffer.from(proof.board.split(',')[1],'base64'));delete proof.board;await writeFile('test-results/power-effects.json',JSON.stringify(proof,null,2));assert.deepEqual(errors,[]);console.log(proof);
}finally{await browser.close();}
