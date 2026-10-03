import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
const {chromium}=await import(pathToFileURL(process.env.PLAYWRIGHT_PATH).href);
const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_PATH});
try{
 for(const viewport of [{width:1440,height:900},{width:842,height:390}]){
  const context=await browser.newContext({viewport,serviceWorkers:'block'}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4173/stage2-test/');
  await page.evaluate(async()=>{
   const {Game}=await import('./src/simulation.js'),update=Game.prototype.update;
   Game.prototype.update=function(...args){window.testGame=this;return update.apply(this,args);};
   const {Renderer}=await import('./src/renderer.js'),draw=Renderer.prototype.draw;
   Renderer.prototype.draw=function(...args){window.testRenderer=this;return draw.apply(this,args);};
  });
  await page.locator('[data-monster=devourer]').click();
  await page.locator('#startForm button[type=submit]').click();await page.locator('#pause').click();
  await page.waitForFunction(()=>testRenderer.courtRidge&&testRenderer.courtLandmarks.size===4&&testRenderer.vfx.has('court-slam'));
  const geometry=await page.evaluate(async()=>{
   const {COURT_ROCKS,COURT_RIDGE_ART,COURT_LANDMARKS,insideCourt}=await import('./src/court-map.js');
   const r=testRenderer,g=testGame,c=r.ctx,drawImage=c.drawImage,drawVfx=r.drawVfx;
   const stone=COURT_ROCKS.find(p=>p.angle===0),halfW=r.width/r.scale/2,halfH=r.height/r.scale/2;
   const calls=[],warnings=[];g.shake=0;
   c.drawImage=function(image,...args){if(image===r.courtRidge)calls.push({args,e:c.getTransform().e,f:c.getTransform().f});return drawImage.call(this,image,...args);};
   r.drawVfx=function(c,kind,...args){warnings.push(kind);return drawVfx.call(this,c,kind,...args);};
   const edgeChecks=[];
   try{
    for(const stone of [COURT_ROCKS[0],COURT_ROCKS.find(p=>p.angle===0)]){
     const hw=(Math.abs(Math.cos(stone.angle))*COURT_RIDGE_ART.width+Math.abs(Math.sin(stone.angle))*COURT_RIDGE_ART.height)/2;
     const hh=(Math.abs(Math.sin(stone.angle))*COURT_RIDGE_ART.width+Math.abs(Math.cos(stone.angle))*COURT_RIDGE_ART.height)/2;
     for(const edge of ['left','right','top','bottom'])for(const offset of [-8,-2,2,8]){
      g.player.x=stone.x+(['left','right'].includes(edge)?(edge==='left'?1:-1)*(halfW+hw-20+offset):0);
      g.player.y=stone.y+(['top','bottom'].includes(edge)?(edge==='top'?1:-1)*(halfH+hh-20+offset):0);
      calls.length=0;r.draw(g,0);
      edgeChecks.push({edge,offset,rotated:stone.angle!==0,drawn:calls.some(p=>Math.abs(p.e-r.dpr*(r.width/2+(stone.x-g.player.x)*r.scale))<1&&Math.abs(p.f-r.dpr*(r.height/2+(stone.y-g.player.y)*r.scale))<1)});
     }
    }
    const {spawnCourtHunt}=await import('./src/stage-two.js');spawnCourtHunt(g);
    const captain=g.enemies.find(e=>e.active&&e.court?.role==='captain');for(const e of g.enemies)if(e!==captain)e.active=false;
    g.player.x=0;g.player.y=0;captain.x=halfW+130;captain.y=0;captain.windup=.7;
    warnings.length=0;r.draw(g,0);
    if(!warnings.includes('court-slam'))throw Error('Partly visible captain warning culled');
    captain.active=false;
   }finally{c.drawImage=drawImage;r.drawVfx=drawVfx;}
   const landmark=COURT_LANDMARKS[0];
   g.player.x=landmark.x+230;g.player.y=landmark.y-60;
   document.querySelector('#paused').hidden=true;r.draw(g,0);
   return {edgeChecks,landmarks:[...r.courtLandmarks.keys()],ridge:[r.courtRidge.naturalWidth,r.courtRidge.naturalHeight],walkable:insideCourt(stone.x,stone.y+90,23)};
  });
  assert.ok(geometry.edgeChecks.every(c=>c.drawn));assert.equal(geometry.landmarks.length,4);assert.deepEqual(geometry.ridge,[1024,342]);assert.equal(geometry.walkable,true);
  await page.screenshot({path:'test-results/stage2-navigation-'+viewport.width+'.png'});
  await page.evaluate(async()=>{const {COURT_LANDMARKS}=await import('./src/court-map.js'),p=COURT_LANDMARKS[1];testGame.player.x=p.x;testGame.player.y=p.y+110;testRenderer.draw(testGame,0);});
  await page.screenshot({path:'test-results/stage2-rib-gate-'+viewport.width+'.png'});
  await page.evaluate(async()=>{const {COURT_ROCKS}=await import('./src/court-map.js'),p=COURT_ROCKS.find(p=>p.angle===0);testGame.player.x=p.x+80;testGame.player.y=p.y+100;testRenderer.draw(testGame,0);});
  await page.screenshot({path:'test-results/stage2-compact-rock-'+viewport.width+'.png'});
  assert.deepEqual(errors,[]);console.log('Terrain browser PASS',viewport,{edges:geometry.edgeChecks.length,landmarks:geometry.landmarks,ridge:geometry.ridge,walkable:geometry.walkable});
  await context.close();
 }
}finally{await browser.close();}
