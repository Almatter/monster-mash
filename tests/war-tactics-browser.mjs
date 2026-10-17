import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
const {chromium}=await import(pathToFileURL(process.env.PLAYWRIGHT_PATH||'C:/Users/novam/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs').href);
const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_PATH||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
const origin=process.env.HUNT_ORIGIN||'http://127.0.0.1:4173';
try{for(const mobile of [false,true]){
 const context=await browser.newContext({viewport:mobile?{width:844,height:390}:{width:1440,height:900},isMobile:mobile,hasTouch:mobile,serviceWorkers:'block'}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(origin+'/test/?stage=4');
 await page.evaluate(async()=>{const {WarGame}=await import('./src/stage-four.js'),{Renderer}=await import('./src/renderer.js'),update=WarGame.prototype.update,draw=Renderer.prototype.draw;WarGame.prototype.update=function(...args){window.g=this;return update.apply(this,args);};Renderer.prototype.draw=function(...args){window.r=this;return draw.apply(this,args);};});
 await page.locator('[data-monster=hag]').click();await page.locator('#startForm button[type=submit]').click();await page.waitForFunction(()=>window.g?.war&&g.time>.2&&window.r?.warArt.ready);
 await page.locator('#warManage').click();await page.locator('[data-war-banners]').waitFor();assert.equal(await page.locator('[data-war-banners] span').count(),8);assert.match(await page.locator('#warCouncil').innerText(),/Green rings: your troops/);
 await page.screenshot({path:`test-results/war-council-colors-${mobile?'touch':'desktop'}.png`});
 const result=await page.evaluate(async()=>{
  const {warBanner}=await import('./src/war-colors.js'),{WarGame}=await import('./src/stage-four.js');
  const screenTest=new WarGame(77,{monsterId:'hag'});screenTest.time=1;screenTest.war.allies=[];screenTest.targetView={x:r.viewWidth/r.scale/2,y:r.viewHeight/r.scale/2};for(const body of screenTest.enemies)body.active=false;
  const rival=screenTest.war.leaders.find(l=>l.monsterId==='reaper').actor,unit=screenTest.war.actors.get(rival.serial),brain=unit.brain,cast=brain.cast.bind(brain);let casts=0;brain.cast=(...args)=>{const ok=cast(...args);if(ok)casts++;return ok;};rival.active=true;rival.x=screenTest.player.x;rival.y=screenTest.player.y+screenTest.targetView.y+20;screenTest.brain(rival,unit,.1);if(casts||brain.nearestEnemy(1000))throw Error('Offscreen rival initiated an attack');
  rival.x=screenTest.player.x+60;rival.y=screenTest.player.y;screenTest.brain(rival,unit,.1);if(!casts)throw Error('Visible rival did not engage');
  const fixture=new WarGame(77,{monsterId:'hag'});fixture.war.allies=[[0,1]];
  const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=680;const c=canvas.getContext('2d');c.fillStyle='#18141f';c.fillRect(0,0,1200,680);
  const colors=[];for(let team=0;team<8;team++){
   const col=team%4,row=Math.floor(team/4),x=col*300,y=row*330,banner=warBanner(fixture,team);colors.push(banner.color);
   c.fillStyle=banner.color;c.font='bold 19px Arial';c.textAlign='center';c.fillText(fixture.war.leaders[team].monsterId.toUpperCase(),x+150,y+32);c.fillStyle='#fff';c.font='13px Arial';c.fillText(team===0?'YOUR ARMY':team===1?'ALLY':'ENEMY',x+150,y+54);
   for(const [i,role] of ['infantry','arbalist','siege'].entries()){
    const e=fixture.actor(team,role,team,0,0);e.x=x+55+i*95;e.y=y+190;r.warArt.drawActor(r,c,fixture,e,0,1,600,340,1000,1000);
    c.fillStyle='#d4cbdc';c.font='12px Arial';c.fillText(role.toUpperCase(),e.x,y+225);
   }
   const a=r.warArt.troop('infantry',banner.color),b=r.warArt.troop('infantry',banner.color);if(a!==b)throw Error('Troop recolor is not cached');
  }
  const hp=g.player.hp,e=g.war.leaders[1].actor;for(let i=0;i<4;i++){g.time=10+i*.4;g.player.invuln=0;g.shield=0;g.hit(null,1e7,1,e.serial,'aoe');}const lost=(hp-g.player.hp)/g.player.maxHp;
  window.armySheet=canvas.toDataURL('image/png');return {colors,healthLost:lost,cached:r.warArt.troopColors.size,viewport:screenTest.targetView,visibleCasts:casts};
 });assert.equal(new Set(result.colors).size,8);assert.ok(result.healthLost<=.300001);assert.ok(result.cached<=32);
 if(!mobile){const fs=await import('node:fs/promises');const data=await page.evaluate(()=>window.armySheet);await fs.writeFile('test-results/war-army-colors.png',Buffer.from(data.split(',')[1],'base64'));}
 await page.locator('#warCouncil button').last().click();await page.screenshot({path:`test-results/war-tactics-${mobile?'touch':'desktop'}.png`});assert.deepEqual(errors,[]);console.log(JSON.stringify({mobile,...result,errors}));await context.close();
 }}finally{await browser.close();}
