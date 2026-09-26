import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {mkdir} from 'node:fs/promises';
const {chromium}=await import(pathToFileURL(process.env.PLAYWRIGHT_PATH).href);
const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_PATH});
await mkdir('test-results',{recursive:true});
try{for(const [width,height] of [[1440,900],[844,390]]){
 const page=await browser.newPage({viewport:{width,height}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:4173/verify.html');
 await page.evaluate(async()=>{
  const [{Game},{Renderer},{CHAMPION_VFX}]=await Promise.all([import('./src/simulation.js'),import('./src/renderer.js'),import('./src/content-vfx.js')]);
  Object.assign(window,{Game,CHAMPION_VFX});const canvas=document.createElement('canvas');document.body.replaceChildren(canvas);window.r=new Renderer(canvas);window.drawn=[];
  const draw=r.drawVfx;r.drawVfx=function(...args){const ok=draw.apply(this,args);if(ok)drawn.push(args[1]);return ok;};
 });
 for(const id of ['sovereign','titan','calamity','overlord','devourer']){
  await page.evaluate(async id=>{window.g=new Game(61,{monsterId:id});r.loadChampionVfx(id);const pack=CHAMPION_VFX[id],deadline=performance.now()+15000;
   while((![pack.unbound,...pack.perks].every(n=>r.vfx.has(n))||!r.assets.get(g.identity,'gameplay')?.gameplay)&&performance.now()<deadline)await new Promise(resolve=>setTimeout(resolve,50));
   if(![pack.unbound,...pack.perks].every(n=>r.vfx.has(n))||!r.assets.get(g.identity,'gameplay')?.gameplay)throw Error(id+' assets missing');
   g.release=4;g.shield=['titan','calamity'].includes(id)?100:0;g.player.rage=id==='sovereign'?5:0;g.frenzy=0;if(id==='devourer'){const slot=g.powers.findIndex(p=>p.effect==='frenzy');g.cast(slot);if(g.frenzy<=0)throw Error('Real Devourer ultimate did not activate');}
  },id);
  const expected=[id+'-unbound-aura',...({sovereign:['sovereign-rage'],titan:['titan-barrier'],calamity:['calamity-ward'],overlord:[],devourer:['devourer-frenzy']}[id])];
  if(id==='devourer')await page.evaluate(()=>{g.time=600;g.update(2,{x:0,y:0,aimX:400,aimY:0,aiming:true});g.release=4;if(g.ultimateTime>0||g.frenzy<=0)throw Error('Frenzy should outlive the cut-in');g.frenzyGuard=0;g.enemies.forEach(e=>e.active=false);g.alive=0;g.effects=[];});
  for(const low of [false,true]){const drawn=await page.evaluate(low=>{r.low=low;window.drawn=[];r.draw(g,3);return drawn;},low);for(const name of expected)assert.ok(drawn.includes(name),JSON.stringify({id,low,drawn,name}));}
  await page.screenshot({path:`test-results/aura-${id}-${width}.png`});
  if(id==='devourer'){
   const guard=await page.evaluate(()=>{g.frenzyGuard=3;g.dodgeInvuln=.15;window.drawn=[];r.draw(g,3);return drawn;});assert.ok(guard.includes('devourer-guard'));assert.ok(guard.includes('devourer-dodge'));assert.ok(!guard.includes('devourer-frenzy'));
   await page.screenshot({path:`test-results/aura-devourer-guard-${width}.png`});
  }
  const expired=await page.evaluate(()=>{g.release=0;g.shield=0;g.player.rage=0;g.frenzy=g.frenzyGuard=g.dodgeInvuln=0;window.drawn=[];r.draw(g,3);return drawn;});assert.equal(expired.length,0,'Expired states must remove art');
  const perf=await page.evaluate(()=>{g.release=4;g.shield=100;g.frenzy=8;g.frenzyGuard=3;g.dodgeInvuln=.1;g.player.rage=5;for(let i=0;i<700;i++)g.spawn(i%6===0?'hound':'thrall');for(const e of g.enemies)if(e.active){e.x=(g.random()-.5)*1200;e.y=(g.random()-.5)*570;}const samples=[];for(let f=0;f<100;f++){const start=performance.now();r.draw(g,f/60);samples.push(performance.now()-start);}samples.sort((a,b)=>a-b);return {alive:g.alive,p95:samples[95]};});assert.ok(perf.p95<16.7,{id,width,perf});console.log(`${id} ${width}x${height}: layers, low FX, expiry pass; ${perf.alive} enemies p95 ${perf.p95.toFixed(2)}ms`);
 }
 assert.deepEqual(errors,[]);await page.close();
}}finally{await browser.close();}
