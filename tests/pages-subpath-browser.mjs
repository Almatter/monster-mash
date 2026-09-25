import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
const {chromium}=await import(pathToFileURL(process.env.PLAYWRIGHT_PATH).href);
const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_PATH});
const origin='http://127.0.0.1:4173',base='/monster-mash/';
try{
 const context=await browser.newContext({viewport:{width:1440,height:900},serviceWorkers:'allow'}),page=await context.newPage(),errors=[],paths=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('requestfailed',r=>errors.push(r.url()+': '+r.failure()?.errorText));page.on('response',r=>{if(r.status()>=400)errors.push(r.url()+': '+r.status());});page.on('request',r=>paths.push(new URL(r.url()).pathname));
 await page.goto(origin+base);await page.waitForFunction(()=>navigator.serviceWorker.controller,{timeout:20000});
 assert.equal(await page.locator('#menu').isVisible(),true);
 const pwa=await page.evaluate(async()=>{const m=await fetch('manifest.webmanifest').then(r=>r.json());const reg=await navigator.serviceWorker.ready;return {scope:reg.scope,manifestStart:new URL(m.start_url,location.href).pathname,manifestScope:new URL(m.scope,location.href).pathname,icon:new URL(m.icons[0].src,new URL('manifest.webmanifest',location.href)).pathname};});
 assert.deepEqual(pwa,{scope:origin+base,manifestStart:base,manifestScope:base,icon:base+'icon.svg'});
 let code='';
 for(const id of ['sovereign','overlord','titan','devourer','calamity']){
  await page.locator(`[data-monster=${id}]`).click();await page.locator('.swatch').nth(1).click();
  assert.equal(await page.locator(`[data-monster=${id}]`).getAttribute('aria-pressed'),'true');
  await page.locator('#name').fill('Pages '+id);await page.locator('#startForm button[type=submit]').click();
  assert.equal(await page.locator('#hud').isVisible(),true);await page.waitForTimeout(450);
  await page.locator('#pause').click();await page.locator('#endRun').click();await page.waitForFunction(()=>document.querySelector('#runCode').value.startsWith('MM3.'));
  code=await page.locator('#runCode').inputValue();await page.locator('#back').click();
 }
 await page.goto(origin+base+'verify/');await page.locator('#code').fill(code);await page.locator('#verify').click();
 assert.match(await page.locator('#status').textContent(),/VALID MONSTER MASH RUN CODE/);
 assert.ok(paths.every(p=>p.startsWith(base)),`Request escaped project path: ${paths.filter(p=>!p.startsWith(base))}`);
 assert.ok(paths.some(p=>p.includes('/assets/monsters/')));assert.deepEqual(errors,[]);
 await context.close();
 const mobile=await browser.newContext({viewport:{width:844,height:390},isMobile:true,hasTouch:true,serviceWorkers:'allow'}),touch=await mobile.newPage();
 await touch.goto(origin+base);assert.equal(await touch.locator('#menu').isVisible(),true);await touch.locator('[data-monster=devourer]').tap();await touch.locator('#startForm button[type=submit]').tap();assert.equal(await touch.locator('#hud').isVisible(),true);await touch.setViewportSize({width:390,height:844});assert.equal(await touch.locator('#rotate').isVisible(),true);await touch.goto(origin+base+'verify/');assert.equal(await touch.title(),'Verify a Run · Monster Mash');await mobile.close();
 console.log('Project subpath: five champions, palettes, gameplay, result codes, direct verifier, mobile landscape, all requests scoped to '+base);
}finally{await browser.close();}
