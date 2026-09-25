import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {mkdir} from 'node:fs/promises';
const {chromium}=await import(pathToFileURL(process.env.PLAYWRIGHT_PATH).href);
const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_PATH});
await mkdir('test-results',{recursive:true});
try{for(const [width,height] of [[1440,900],[844,390]]){
 const page=await browser.newPage({viewport:{width,height},isMobile:width===844,hasTouch:width===844}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:4173/monster-mash/');
 await page.evaluate(async()=>{const {Game}=await import('./src/simulation.js'),update=Game.prototype.update;Game.prototype.update=function(dt,input){window.g=this;return update.call(this,dt,input);};});
 await page.locator('[data-monster=devourer]').click();assert.match(await page.locator('#kit').textContent(),/every 20 kills grants brief 40–60% damage reduction/);
 await page.locator('#name').fill('FEAST TEST');await page.locator('#startForm button[type=submit]').click();await page.waitForFunction(()=>window.g);
 await page.evaluate(()=>{g.time=520;g.release=4;g.wave=18;g.player.hp=200;g.cast(3);for(let i=0;i<20;i++){g.spawn('thrall');const e=g.enemies.find(e=>e.active&&e.serial===g.serial);g.damage(e,10000,'direct');}});
 await page.waitForFunction(()=>window.g.frenzyGuard>0);assert.ok((await page.locator('#healthText').textContent()).includes('FEAST GUARD'));await page.waitForTimeout(900);assert.ok(await page.evaluate(()=>g.frenzyGuard>0&&g.release===4));
 await page.screenshot({path:`test-results/devourer-feast-${width}.png`});assert.deepEqual(errors,[]);console.log(width+'x'+height+' Devourer Feast Guard cue and kill-fed recovery pass');await page.close();
}}finally{await browser.close();}
