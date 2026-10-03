import assert from 'node:assert/strict';import {pathToFileURL} from 'node:url';
const {chromium}=await import(pathToFileURL(process.env.PLAYWRIGHT_PATH).href),browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_PATH});
try{for(const viewport of [{width:1440,height:900},{width:842,height:390}]){
 const context=await browser.newContext({viewport,serviceWorkers:'block'}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:4173/stage2-test/');
 await page.evaluate(async()=>{const {Game}=await import('./src/simulation.js'),u=Game.prototype.update;Game.prototype.update=function(...args){window.g=this;return u.apply(this,args);};const {Renderer}=await import('./src/renderer.js'),d=Renderer.prototype.draw;Renderer.prototype.draw=function(...args){window.r=this;return d.apply(this,args);};});
 await page.locator('[data-monster=devourer]').click();await page.locator('#startForm button[type=submit]').click();await page.locator('#pause').click();await page.waitForFunction(()=>r.courtBorder&&r.courtFormations.size===2);
 const result=await page.evaluate(async()=>{
  const {COURT_BORDER,courtBoundaryAt,insideCourt}=await import('./src/court-map.js');g.shake=0;g.player.invuln=1e6;g.enemies.forEach(e=>e.active=false);g.alive=0;g.spawn=()=>undefined;g.court.camps=[];g.court.initialized=true;
  const b=courtBoundaryAt(0,0,23);g.player.x=0;g.player.y=b.top+2;g.setMovementDirection(0,-1);for(let i=0;i<3;i++)g.cast(0);g.update(1/60,{x:0,y:-1,aimX:0,aimY:0,aiming:false});if(g.dash)throw Error('Dash remains pinned');const before=g.player.y;for(let i=0;i<30;i++)g.update(1/60,{x:0,y:1,aimX:0,aimY:0,aiming:false});if(g.player.y<before+100)throw Error('Cannot retreat from northern edge');
  g.player.x=0;g.player.y=courtBoundaryAt(0,-7000,23).top+140;document.querySelector('#paused').hidden=true;
  let count=0;const draw=r.ctx.drawImage;r.ctx.drawImage=function(image,...args){if(image===r.courtBorder)count++;return draw.call(this,image,...args);};try{r.draw(g,0);}finally{r.ctx.drawImage=draw;}
  const part=COURT_BORDER[15],half=r.viewWidth/r.scale/2,hw=(Math.abs(Math.cos(part.angle))*part.width+Math.abs(Math.sin(part.angle))*part.height)/2;
  let edges=0;r.ctx.drawImage=function(image,...args){if(image===r.courtBorder)edges++;return draw.call(this,image,...args);};try{g.player.x=part.x+half+hw-10;g.player.y=part.y;r.draw(g,0);}finally{r.ctx.drawImage=draw;}
  g.player.x=0;g.player.y=courtBoundaryAt(0,-7000,23).top+140;r.draw(g,0);
  return {retreat:g.player.y-before,borderDraws:count,edgeDraws:edges,walkable:insideCourt(g.player.x,g.player.y,23),texture:[r.courtBorder.naturalWidth,r.courtBorder.naturalHeight]};
 });assert.ok(result.borderDraws>1&&result.edgeDraws>0&&result.walkable);assert.deepEqual(result.texture,[768,256]);await page.screenshot({path:'test-results/stage2-v22-border-'+viewport.width+'.png'});
 if(viewport.width===1440){await page.evaluate(()=>{g.player.x=0;g.player.y=0;r.scale=.06;document.querySelector('#hud').hidden=true;document.querySelector('#controls').hidden=true;document.querySelector('#combatInfo').hidden=true;r.draw(g,0);});await page.screenshot({path:'test-results/stage2-v22-map-overview.png'});}
 assert.deepEqual(errors,[]);console.log('Border art, edge drawing and chained dash retreat PASS',viewport,result);await context.close();
}}finally{await browser.close();}
