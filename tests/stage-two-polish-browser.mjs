import assert from 'node:assert/strict';import {pathToFileURL} from 'node:url';
const {chromium}=await import(pathToFileURL(process.env.PLAYWRIGHT_PATH).href),browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_PATH});
try{
 for(const viewport of [{width:1440,height:900},{width:3440,height:1440},{width:842,height:390},{width:390,height:842}]){
  const context=await browser.newContext({viewport,serviceWorkers:'block'}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:4173/stage2-test/');
  await page.evaluate(async()=>{
   const {Game}=await import('./src/simulation.js'),update=Game.prototype.update;Game.prototype.update=function(...args){window.testGame=this;return update.apply(this,args);};
   const {Renderer}=await import('./src/renderer.js'),draw=Renderer.prototype.draw;Renderer.prototype.draw=function(...args){window.testRenderer=this;return draw.apply(this,args);};
   const {AudioEngine}=await import('./src/audio.js'),music=AudioEngine.prototype.setMusic;AudioEngine.prototype.setMusic=function(...args){window.testAudio=this;return music.apply(this,args);};
  });
  await page.locator('[data-monster=devourer]').click();await page.locator('#startForm button[type=submit]').click();await page.locator('#pause').click();
  await page.waitForFunction(()=>testRenderer.courtFormations.size===2&&testRenderer.vfx.has('court-ash-trace')&&testRenderer.sprites.get('court-captain')?.naturalWidth);
  const geometry=await page.evaluate(async()=>{
   const {initializeCourt,updateCourt,COURT}=await import('./src/stage-two.js'),r=testRenderer,g=testGame,c=r.ctx,draw=c.drawImage;
   assertCamera();function assertCamera(){const w=r.viewWidth/r.scale,h=r.viewHeight/r.scale;if(Math.abs(w*h-912000)>1e-5||Math.max(w,h)>1200.001)throw Error('Camera grants extra area');}
   const screen=r.worldToScreen(g.player.x+123,g.player.y-76,g),world=r.screenToWorld(screen.x,screen.y,g);if(Math.abs(world.x-g.player.x-123)>1e-8||Math.abs(world.y-g.player.y+76)>1e-8)throw Error('Pointer mapping changed');
   g.enemies.forEach(e=>e.active=false);g.alive=0;initializeCourt(g);g.court.camps.forEach((p,i)=>{p.spawned=false;p.slain=i!==0;});const camp=g.court.camps[0];camp.x=2000;camp.y=0;
   let captain=null,draws=0,firstVisibleAt=0,spawnAt=0;const image=r.sprites.get('court-captain');c.drawImage=function(im,...args){if(im===image)draws++;return draw.call(this,im,...args);};
   try{for(let distance=1100;distance>=500;distance-=10){g.player.x=camp.x-distance;g.player.y=0;updateCourt(g,.01);captain=g.enemies.find(e=>e.active&&e.court?.role==='captain');if(captain&&!spawnAt)spawnAt=distance;draws=0;r.draw(g,0);if(draws&&!firstVisibleAt)firstVisibleAt=distance;}}
   finally{c.drawImage=draw;}
   if(!(spawnAt>firstVisibleAt&&firstVisibleAt>0))throw Error('Captain appeared before preload activation: '+JSON.stringify({spawnAt,firstVisibleAt}));
   const serial=captain.serial;g.player.x=-2000;g.spawn=()=>undefined;g.attack=100;for(let n=0;n<120;n++)g.update(1/60,{x:0,y:0,aimX:0,aimY:0,aiming:false});if(!captain.active||serial!==captain.serial)throw Error('Captain unloaded');
   g.player.x=camp.x-600;g.player.y=0;g.time=900.01;updateCourt(g,.3);let traceDraws=0;c.drawImage=function(im,...args){if(im===r.vfx.get('court-ash-trace'))traceDraws++;return draw.call(this,im,...args);};try{r.draw(g,0);}finally{c.drawImage=draw;}if(traceDraws<2)throw Error('Trail artwork was not rendered');if(!g.court.hint?.trail)throw Error('Late trail missing');
   const [barX,barY]=r.viewWidth<r.width-1?[1,r.height/2]:[r.width/2,1],pixel=[...c.getImageData(barX*r.dpr,barY*r.dpr,1,1).data];
   return {worldWidth:r.viewWidth/r.scale,worldHeight:r.viewHeight/r.scale,spawnAt,firstVisibleAt,pixel};
  });
  assert.ok(Math.abs(geometry.worldWidth*geometry.worldHeight-912000)<1e-5);assert.deepEqual(geometry.pixel,[19,18,23,255]);
  if(viewport.width===1440){await page.evaluate(()=>document.querySelector('#paused').hidden=true);await page.screenshot({path:'test-results/stage2-v21-late-trail.png'});}
  console.log('Camera/captain lifecycle PASS',viewport,geometry);assert.deepEqual(errors,[]);await context.close();
 }
 const context=await browser.newContext({viewport:{width:1440,height:900},serviceWorkers:'block'}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:4173/stage2-test/');
 await page.evaluate(async()=>{const {Game}=await import('./src/simulation.js'),u=Game.prototype.update;Game.prototype.update=function(...args){window.testGame=this;return u.apply(this,args);};const {AudioEngine}=await import('./src/audio.js'),m=AudioEngine.prototype.setMusic;AudioEngine.prototype.setMusic=function(...args){window.testAudio=this;return m.apply(this,args);};});
 await page.locator('[data-monster=devourer]').click();await page.locator('#startForm button[type=submit]').click();await page.locator('#pause').click();
 // Kill immediately: a pending battle-score render must not restart over boon music.
 for(let n=0;n<2;n++){
  await page.evaluate(()=>{const e=testGame.enemies.find(e=>e.active&&e.court?.role==='captain');testGame.damage(e,1e8,'execute');});
  await page.locator('#resume').click();await page.locator('#huntUpgrade').waitFor({state:'visible'});await page.waitForFunction(()=>testAudio.activeState==='boon'&&testAudio.context.state==='running');
  if(n===0)await page.screenshot({path:'test-results/stage2-v21-boon-score.png'});
  const before=await page.evaluate(()=>({time:testGame.time,hp:testGame.player.hp,cooldowns:[...testGame.cooldowns]}));await page.waitForTimeout(1400);
  assert.deepEqual(await page.evaluate(()=>({time:testGame.time,hp:testGame.player.hp,cooldowns:[...testGame.cooldowns]})),before);
  const sound=await page.evaluate(()=>{const a=testAudio;if(window.firstBoon&&firstBoon!==a.boonBuffer)throw Error('Boon buffer regenerated');window.firstBoon=a.boonBuffer;return {duration:a.boonBuffer.duration,bytes:a.boonBuffer.length*4,channels:a.boonBuffer.numberOfChannels,loop:a.musicVoices.at(-1).source.loop,voices:a.musicVoices.length,battleVoices:a.procedural?.voices.length??0};});
  assert.equal(sound.battleVoices,0);assert.equal(sound.channels,1);assert.equal(sound.loop,true);assert.ok(sound.bytes<1.2*1048576&&sound.voices<=2);console.log('Paused boon score PASS',sound);
  await page.locator('[data-upgrade=power]').click();await page.waitForFunction(()=>testAudio.activeState!=='boon'&&testAudio.procedural?.voices?.length===7);await page.locator('#pause').click();await page.waitForFunction(()=>testAudio.context.state==='suspended');
 }
 assert.deepEqual(errors,[]);await context.close();
}finally{await browser.close();}
