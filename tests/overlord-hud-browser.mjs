import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
const {chromium}=await import(pathToFileURL(process.env.PLAYWRIGHT_PATH).href);
const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_PATH});
try {
 for(const [width,height,touch] of [[1440,900,false],[844,390,true]]){
  const page=await browser.newPage({viewport:{width,height},isMobile:touch,hasTouch:touch});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4173/');
  await page.evaluate(async()=>{const {Game}=await import('./src/simulation.js'),update=Game.prototype.update;Game.prototype.update=function(dt,input){window.g=this;return update.call(this,dt,input);};});
  await page.locator('[data-monster=overlord]').click();await page.locator('#startForm button[type=submit]').click();
  await page.waitForFunction(()=>window.g?.monster.id==='overlord');
  await page.evaluate(()=>{g.spawnBank=-1000;g.enemies.forEach(e=>e.active=false);g.alive=0;g.rebuildGrid();for(let i=0;i<4;i++){g.spawn('thrall');const e=g.enemies.find(e=>e.active&&e.serial===g.serial);e.x=80+i*20;e.y=0;}g.rebuildGrid();g.cast(0);});
  await page.waitForFunction(()=>document.querySelector('#allyCount').textContent.includes('CONTROLLED 4'));
  assert.match(await page.locator('#allyCount').textContent(),/CONTROLLED 4 · HORDE 4 \/ 24/);
  assert.equal(await page.locator('#allyCount').isVisible(),true);
  assert.deepEqual(errors,[]);
  console.log(`${width}x${height} Overlord controlled and shared army HUD pass`);
  await page.close();
 }
} finally {await browser.close();}
