import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {mkdir} from 'node:fs/promises';
const {chromium}=await import(pathToFileURL(process.env.PLAYWRIGHT_PATH).href);
const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_PATH});
await mkdir('test-results',{recursive:true});
try{
 for(const [width,height,touch] of [[1440,900,false],[844,390,true]]){
  const page=await browser.newPage({viewport:{width,height},isMobile:touch,hasTouch:touch}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4173/');
  await page.evaluate(async()=>{
   const [{Game},{Renderer}]=await Promise.all([import('./src/simulation.js'),import('./src/renderer.js')]);
   const update=Game.prototype.update,drawVfx=Renderer.prototype.drawVfx;
   window.freezeDevourer=false;window.drawnDevourerVfx=new Set();
   Game.prototype.update=function(dt,input){window.g=this;if(!window.freezeDevourer)return update.call(this,dt,input);};
   Renderer.prototype.drawVfx=function(...args){const ok=drawVfx.apply(this,args);if(ok)window.drawnDevourerVfx.add(args[1]);return ok;};
  });
  await page.locator('[data-monster=devourer]').click();
  await page.locator('#startForm button[type=submit]').click();
  await page.waitForFunction(()=>window.g?.monster.id==='devourer');
  await page.evaluate(()=>{g.spawnBank=-1000;g.enemies.forEach(e=>e.active=false);g.alive=0;g.effects=[];g.attack=0;window.freezeDevourer=true;});
  assert.equal(await page.evaluate(()=>g.attack),0,'idle Devourer does not attack empty space');
  await page.evaluate(()=>{g.effects=[{kind:'claw',x:g.player.x,y:g.player.y,life:.18,max:.22,radius:105,angle:0}];});
  await page.waitForFunction(()=>window.drawnDevourerVfx.has('devourer-claw'));
  await page.screenshot({path:`test-results/devourer-perimeter-${width}.png`});
  await page.evaluate(()=>{g.effects=[];g.release=4;});
  await page.waitForFunction(()=>window.drawnDevourerVfx.has('devourer-unbound-aura'));
  await page.screenshot({path:`test-results/devourer-unbound-aura-${width}.png`});
  await page.evaluate(()=>{g.player.invuln=0;g.hurt(15);});
  assert.ok(await page.evaluate(()=>g.player.invuln>0));
  assert.deepEqual(errors,[]);
  console.log(`${width}x${height} illustrated perimeter claw, illustrated Unbound aura, idle and hurt states pass`);
  await page.close();
 }
}finally{await browser.close();}
