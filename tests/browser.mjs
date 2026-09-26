// Optional real-browser smoke test. Set PLAYWRIGHT_PATH if Playwright is not installed locally.
import { mkdir } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_PATH?pathToFileURL(process.env.PLAYWRIGHT_PATH).href:'playwright');
const browser=await chromium.launch({headless:true,...(process.env.BROWSER_PATH?{executablePath:process.env.BROWSER_PATH}:{})});
await mkdir('test-results',{recursive:true});
const errors=[];
const page=await browser.newPage({viewport:{width:1440,height:900}});
page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:4173');await page.screenshot({path:'test-results/menu.png'});
await page.locator('#name').fill('Test Sovereign');await page.locator('#startForm button[type=submit]').click();
const initial=await page.locator('#kills').textContent();await page.keyboard.down('d');await page.waitForTimeout(900);await page.keyboard.up('d');
for(const key of ['q','e','r',' ']){await page.keyboard.press(key);await page.waitForTimeout(100);}
await page.waitForTimeout(6000);assert.notEqual(await page.locator('#kills').textContent(),initial);
await page.screenshot({path:'test-results/combat.png'});
await page.keyboard.press('Escape');assert.equal(await page.locator('#paused').isVisible(),true);
const clock=await page.locator('#clock').textContent();await page.waitForTimeout(1100);assert.equal(await page.locator('#clock').textContent(),clock);
await page.locator('#endRun').click();await page.waitForFunction(()=>document.querySelector('#runCode').value.startsWith('MM4.'));
const code=await page.locator('#runCode').inputValue();await page.screenshot({path:'test-results/result.png'});
const downloadPromise=page.waitForEvent('download');await page.locator('#saveCard').click();const download=await downloadPromise;await download.saveAs('test-results/result-card.png');
for(let i=0;i<3;i++){await page.locator('#again').click();await page.waitForTimeout(100);assert.equal(await page.locator('#result').isVisible(),false);await page.keyboard.press('Escape');await page.locator('#endRun').click();}
await page.goto('http://127.0.0.1:4173/verify/');await page.locator('#code').fill(code);await page.locator('#verify').click();await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('Checksum valid'));
const mobile=await browser.newContext({viewport:{width:844,height:390},isMobile:true,hasTouch:true,deviceScaleFactor:2});const touch=await mobile.newPage();touch.on('pageerror',e=>errors.push(e.message));await touch.goto('http://127.0.0.1:4173');await touch.locator('#startForm button[type=submit]').tap();
const joystick=touch.locator('#joystick'),box=await joystick.boundingBox();assert.ok(box);
const client=await mobile.newCDPSession(touch);
await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:box.x+box.width/2,y:box.y+box.height/2,id:1}]});
await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:box.x+box.width*.85,y:box.y+box.height/2,id:1}]});await touch.waitForTimeout(700);
await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await touch.locator('.ability').first().tap();await touch.waitForTimeout(500);await touch.screenshot({path:'test-results/mobile.png'});
await touch.setViewportSize({width:390,height:844});assert.equal(await touch.locator('#rotate').isVisible(),true);await touch.setViewportSize({width:844,height:390});assert.equal(await touch.locator('#paused').isVisible(),true);
assert.deepEqual(errors,[]);console.log('Browser smoke passed: launch, keyboard combat, pause, results, PNG, restarts, verifier, touch, orientation.');await browser.close();
