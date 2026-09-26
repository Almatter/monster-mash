import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {mkdir} from 'node:fs/promises';
const {chromium}=await import(pathToFileURL(process.env.PLAYWRIGHT_PATH).href);
const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_PATH});
await mkdir('test-results',{recursive:true});
try{
 for(const [width,height,touch] of [[1440,900,false],[844,390,true]]){
  const context=await browser.newContext({viewport:{width,height},isMobile:touch,hasTouch:touch}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:4173/');
  await page.evaluate(async()=>{const {Game}=await import('./src/simulation.js'),update=Game.prototype.update;Game.prototype.update=function(dt,input){window.g=this;return update.call(this,dt,input);};});
  await page.locator('#audioButton').click();await page.locator('#showPerf').check();await page.locator('#closeAudio').click();
  await page.locator('[data-monster=calamity]').click();await page.locator('#startForm button[type=submit]').click();await page.waitForFunction(()=>window.g);
  await page.waitForFunction(()=>document.querySelector('#perfOverlay').textContent.includes('FPS '));
  const point={x:Math.round(width*.65),y:Math.round(height*.48)};
  if(touch)await page.locator('.ability').nth(1).tap();else await page.locator('.ability').nth(1).click();
  assert.equal(await page.locator('#targetHint').isVisible(),true);assert.equal(await page.evaluate(()=>g.cooldowns[1]),0);
  await page.screenshot({path:`test-results/calamity-target-${width}.png`});
  if(touch)await page.locator('#arena').tap({position:point});else await page.locator('#arena').click({position:point});
  await page.waitForFunction(()=>window.g.fields.some(f=>f.kind==='meteor'));assert.ok(await page.evaluate(()=>g.cooldowns[1]>0));
  if(touch)await page.locator('.ability').nth(2).tap();else await page.locator('.ability').nth(2).click();
  await page.locator('#cancelTarget').click();assert.equal(await page.locator('#targetHint').isVisible(),false);assert.equal(await page.evaluate(()=>g.cooldowns[2]),0);
  if(touch)await page.locator('.ability').nth(2).tap();else await page.locator('.ability').nth(2).click();
  if(touch)await page.locator('#arena').tap({position:point});else await page.locator('#arena').click({position:point});
  await page.waitForFunction(()=>window.g.fields.some(f=>f.kind==='vortex'));assert.ok(await page.evaluate(()=>g.cooldowns[2]>0));
  await page.screenshot({path:`test-results/calamity-placed-${width}.png`});assert.deepEqual(errors,[]);console.log(`${width}x${height} performance overlay, Nuke/Vortex placement and cancel pass`);
  await context.close();
 }
}finally{await browser.close();}
