import assert from 'node:assert/strict';import {pathToFileURL} from 'node:url';import {execFileSync} from 'node:child_process';import {stripTypeScriptTypes} from 'node:module';import {writeFile} from 'node:fs/promises';
const {chromium}=await import(pathToFileURL(process.env.PLAYWRIGHT_PATH).href),browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_PATH});
const base='9647e0649825e9ab33cc01225a6629709a08c849',previous=new Map();
for(const f of execFileSync('git',['ls-tree','-r','--name-only',base,'src'],{encoding:'utf8'}).trim().split(/\r?\n/).filter(f=>f.endsWith('.ts')))previous.set(f.slice(4,-3)+'.js',stripTypeScriptTypes(execFileSync('git',['show',base+':'+f],{encoding:'utf8'}),{mode:'strip'}).replaceAll(/from '(\.\/[^']+)\.ts'/g,"from '$1.js'"));
const rows=[];
try{for(const version of ['v21','current'])for(const scenario of ['crescent','landmark']){
 const context=await browser.newContext({viewport:{width:1280,height:720},serviceWorkers:'block'}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 if(version==='v21')await page.route('**/src/*.js',route=>{const source=previous.get(new URL(route.request().url()).pathname.split('/').at(-1));return source?route.fulfill({contentType:'text/javascript',body:source}):route.continue();});
 await page.goto('http://127.0.0.1:4173/stage2-test/');await page.evaluate(async()=>{
  const {Game}=await import('./src/simulation.js'),u=Game.prototype.update;Game.prototype.update=function(...args){window.g=this;const at=performance.now();const result=u.apply(this,args);if(window.updateCosts)updateCosts.push(performance.now()-at);return result;};
  const {Renderer}=await import('./src/renderer.js'),draw=Renderer.prototype.draw;Renderer.prototype.draw=function(...args){window.r=this;const at=performance.now();const result=draw.apply(this,args);if(window.drawCosts)drawCosts.push(performance.now()-at);return result;};
  const {AudioEngine}=await import('./src/audio.js'),m=AudioEngine.prototype.setMusic;AudioEngine.prototype.setMusic=function(...args){window.a=this;return m.apply(this,args);};
 });
 await page.locator('[data-monster=devourer]').click();await page.locator('#startForm button[type=submit]').click();await page.locator('#pause').click();
 await page.waitForFunction(()=>r.courtFormations.size===2&&r.courtLandmarks.size===4&&a.procedural?.buffers.length===7);
 await page.evaluate(async scenario=>{
  const {COURT_ROCKS}=await import('./src/court-map.js');g.enemies.forEach(e=>e.active=false);g.alive=0;g.serial=0;g.rng=77;g.court.initialized=true;g.court.camps=[];g.player.invuln=1e6;g.attack=1e6;g.pressureTime=1e6;g.time=180;g.wave=7;
  const rock=COURT_ROCKS.find(p=>p.kind==='crescent'),local=(x,y)=>({x:rock.x+Math.cos(rock.angle)*x-Math.sin(rock.angle)*y,y:rock.y+Math.sin(rock.angle)*x+Math.cos(rock.angle)*y});Object.assign(g.player,scenario==='crescent'?local(0,130):{x:6615,y:-3940});
  for(let n=0;n<120;n++){const e=g.spawn('thrall'),t=.25+(n%40)/80;Object.assign(e,scenario==='crescent'?local(-188+191*t-10,-123-32*t-63):{x:6615+(n%20-10)*.6,y:-3627},{hp:1e9,maxHp:1e9});}g.spawn=()=>undefined;g.rebuildGrid();
 },scenario);
 const cdp=await context.newCDPSession(page);await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});await page.locator('#resume').click();await page.waitForTimeout(1200);
 const result=await page.evaluate(async()=>{window.updateCosts=[];window.drawCosts=[];let frames=0,start=performance.now(),last=start;await new Promise(resolve=>{const tick=now=>{frames++;last=now;if(now-start<4000)requestAnimationFrame(tick);else resolve();};requestAnimationFrame(tick);});const metrics=values=>{values.sort((a,b)=>a-b);return {mean:+(values.reduce((a,b)=>a+b,0)/values.length).toFixed(2),p95:+values[Math.floor(values.length*.95)].toFixed(2)};};return {fps:+(frames*1000/(last-start)).toFixed(1),updateMs:metrics(updateCosts),drawMs:metrics(drawCosts),enemies:g.alive,fxLevel:r.fxLevel};});
 assert.deepEqual(errors,[]);rows.push({version,scenario,...result});console.log(JSON.stringify(rows.at(-1)));await context.close();
}await writeFile('test-results/stage2-v22-terrain-browser-performance.json',JSON.stringify({cpuThrottle:4,enemies:120,rows},null,2));}finally{await browser.close();}
