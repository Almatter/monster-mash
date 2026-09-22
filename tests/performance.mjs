import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_PATH?pathToFileURL(process.env.PLAYWRIGHT_PATH).href:'playwright');
const browser=await chromium.launch({headless:true,...(process.env.BROWSER_PATH?{executablePath:process.env.BROWSER_PATH}:{})});
const page=await browser.newPage({viewport:{width:1440,height:900}});await page.goto('http://127.0.0.1:4173/verify.html');
const metrics=await page.evaluate(async()=>{
 const {Game}=await import('./src/simulation.js'),{Renderer}=await import('./src/renderer.js');
 const canvas=document.createElement('canvas');document.body.replaceChildren(canvas);const renderer=new Renderer(canvas),g=new Game(77);g.wave=22;
 for(let i=0;i<1076;i++)g.spawn('thrall');for(let i=0;i<24;i++)g.spawn('elite');
 const durations=[],intervals=[];let last=performance.now();
 for(let frame=0;frame<240;frame++){await new Promise(requestAnimationFrame);let start=performance.now();intervals.push(start-last);last=start;g.player.hp=1000;g.ended=false;g.update(1/60,{x:0,y:0,aimX:500,aimY:0,aiming:true});renderer.draw(g,g.time);durations.push(performance.now()-start);}
 durations.sort((a,b)=>a-b);intervals.sort((a,b)=>a-b);return {maxPool:g.enemies.length,alive:g.alive,frameWorkP50:durations[120],frameWorkP95:durations[228],frameIntervalP50:intervals[120],effects:g.effects.length,shots:g.shots.length};
});console.log('Browser stress:',JSON.stringify(metrics));assert.ok(metrics.alive>500);assert.equal(metrics.maxPool,1100);
await page.goto('http://127.0.0.1:4173');await page.evaluate(()=>navigator.serviceWorker.ready);await page.reload();await page.context().setOffline(true);await page.reload();assert.equal(await page.locator('#startForm').isVisible(),true);await page.locator('#startForm button').click();assert.equal(await page.locator('#hud').isVisible(),true);console.log('Offline replay passed.');await browser.close();
