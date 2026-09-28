import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {mkdir} from 'node:fs/promises';

const {chromium}=await import(pathToFileURL(process.env.PLAYWRIGHT_PATH).href);
const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_PATH});
await mkdir('test-results',{recursive:true});
try{
 for(const [width,height] of [[1440,900],[844,390]]){
  const page=await browser.newPage({viewport:{width,height}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(process.env.SITE_URL || 'http://127.0.0.1:4173/verify.html');
  await page.evaluate(async()=>{
   const [{Game},{Renderer},{MONSTERS}]=await Promise.all([import('./src/simulation.js'),import('./src/renderer.js'),import('./src/content-monsters.js')]);
   const canvas=document.createElement('canvas');document.body.replaceChildren(canvas);window.g=null;window.r=new Renderer(canvas);window.Game=Game;window.ids=Object.keys(MONSTERS);window.drawn=[];window.flips=0;
   const original=Renderer.prototype.drawVfx;Renderer.prototype.drawVfx=function(...args){const ok=original.apply(this,args);if(ok)drawn.push(args[1]);return ok;};
   const scale=CanvasRenderingContext2D.prototype.scale;CanvasRenderingContext2D.prototype.scale=function(x,y){if(x===-1)flips++;return scale.call(this,x,y);};
  });
  for(const id of ['sovereign','overlord','titan','devourer','calamity']){
   const state=await page.evaluate(async id=>{
    window.g=new Game(31,{monsterId:id});r.loadChampionVfx(id);
    const deadline=performance.now()+15000;while((!r.assets.get(g.identity,'gameplay')?.gameplay||!r.vfx.has(id==='titan'?'titan-cleave':id==='overlord'?'overlord-soul-brand':id))&&performance.now()<deadline)await new Promise(resolve=>setTimeout(resolve,50));
    if(!r.assets.get(g.identity,'gameplay')?.gameplay)throw Error(id+' atlas missing');
    g.update(1/60,{x:-1,y:0,aimX:1000,aimY:0,aiming:true});flips=0;r.draw(g,g.time);const left=flips;
    g.update(1/60,{x:0,y:-1,aimX:1000,aimY:0,aiming:true});flips=0;r.draw(g,g.time);const vertical=flips;
    g.update(1/60,{x:1,y:0,aimX:-1000,aimY:0,aiming:true});flips=0;r.draw(g,g.time);const right=flips;
    return {left,vertical,right};
   },id);
   const authoredLeft=['sovereign','titan','devourer'].includes(id);
   assert.deepEqual(state,{left:authoredLeft?0:1,vertical:authoredLeft?0:1,right:authoredLeft?1:0},`${id} sprite must face the direction of travel`);
  }
  const art=await page.evaluate(async()=>{
   window.g=new Game(41,{monsterId:'titan'});r.loadChampionVfx('titan');g.player.invuln=100;g.spawn('thrall');const e=g.enemies.find(e=>e.active);Object.assign(e,{x:90,y:0,hp:1e9,maxHp:1e9});g.rebuildGrid();g.spawn=()=>{};g.update(1/60,{x:0,y:0,aimX:1000,aimY:0,aiming:true});
   drawn=[];r.draw(g,g.time);const titan=drawn.includes('titan-cleave');r.low=true;drawn=[];r.draw(g,g.time);const titanLow=drawn.includes('titan-cleave');r.low=false;return {titan,titanLow};
  });
  assert.ok(art.titan&&art.titanLow);await page.screenshot({path:`test-results/titan-cleave-${width}.png`});
  const brand=await page.evaluate(async()=>{
   window.g=new Game(42,{monsterId:'overlord'});r.loadChampionVfx('overlord');g.player.invuln=100;g.spawn('thrall');const e=g.enemies.find(e=>e.active);Object.assign(e,{x:80,y:0,hp:1e9,maxHp:1e9});g.rebuildGrid();g.cast(1);g.cast(2);drawn=[];r.draw(g,g.time);const normal=drawn.filter(n=>n==='overlord-soul-brand').length;r.low=true;drawn=[];r.draw(g,g.time);const low=drawn.filter(n=>n==='overlord-soul-brand').length;return {normal,low,servants:g.servants.filter(s=>s.active).length,corrupt:e.corruptUntil>g.time};
  });
  assert.ok(brand.corrupt&&brand.servants>=8&&brand.normal>=brand.servants+1&&brand.low>=brand.servants+1,JSON.stringify(brand));
  await page.screenshot({path:`test-results/overlord-soul-brand-${width}.png`});await page.evaluate(()=>{g.effects=[];r.draw(g,g.time+.6);});await page.screenshot({path:`test-results/overlord-soul-brand-clean-${width}.png`});
  const perf=await page.evaluate(()=>{
   window.g=new Game(43,{monsterId:'overlord'});g.player.invuln=100;g.time=540;g.release=4;g.wave=19;
   for(let i=0;i<400;i++){g.spawn(i%7===0?'brute':'thrall');const e=g.enemies.find(e=>e.active&&e.serial===g.serial);e.x=(g.random()-.5)*1100;e.y=(g.random()-.5)*600;e.corruptUntil=g.time+8;}
   for(let i=0;i<3;i++){g.cooldowns[2]=0;g.cast(2);}g.effects=[];g.rebuildGrid();r.low=false;
   const samples=[];for(let i=0;i<100;i++){const start=performance.now();r.draw(g,g.time+i/60);samples.push(performance.now()-start);}samples.sort((a,b)=>a-b);
   return {corrupted:400,servants:g.servants.filter(s=>s.active).length,p95:samples[95]};
  });
  assert.ok(perf.servants>=24&&perf.p95<16.7,JSON.stringify(perf));
  console.log(`${width}x${height}: dense Overlord soul-brand rendering p95 ${perf.p95.toFixed(2)}ms`);
  assert.deepEqual(errors,[]);console.log(`${width}x${height}: five champion sprite flips, Titan cleave and Overlord soul brands in normal/Low FX`);await page.close();
 }
}finally{await browser.close();}
