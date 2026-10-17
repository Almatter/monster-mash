import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {writeFile} from 'node:fs/promises';
const {chromium}=await import(pathToFileURL('C:/Users/novam/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs').href);
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
try{for(const mobile of [false,true]){
 const context=await browser.newContext({viewport:mobile?{width:844,height:390}:{width:1440,height:900},isMobile:mobile,hasTouch:mobile,serviceWorkers:'block'}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto((process.env.HUNT_ORIGIN||'http://127.0.0.1:4173')+'/test/?stage=4');
 await page.evaluate(async()=>{const {WarGame}=await import('./src/stage-four.js'),{Renderer}=await import('./src/renderer.js'),update=WarGame.prototype.update,draw=Renderer.prototype.draw;WarGame.prototype.update=function(...args){window.g=this;return update.apply(this,args);};Renderer.prototype.draw=function(...args){window.r=this;return draw.apply(this,args);};});
 await page.locator('[data-monster=hag]').click();await page.locator('#startForm button[type=submit]').click();await page.waitForFunction(()=>window.g?.war&&g.time>.2&&window.r?.warArt.ready);
 await page.locator('#warManage').click();await page.locator('[data-war-banners]').waitFor();
 const result=await page.evaluate(async()=>{
  const {WarGame}=await import('./src/stage-four.js');const fixture=new WarGame(77,{monsterId:'hag'}),sheet=document.createElement('canvas');sheet.width=1280;sheet.height=600;const out=sheet.getContext('2d');out.fillStyle='#18141f';out.fillRect(0,0,1280,600);const counts=[];
  for(let camp=0;camp<8;camp++){
   const e=fixture.enemies.find(e=>fixture.war.actors.get(e.serial)?.role==='sentry'&&fixture.war.actors.get(e.serial)?.camp===camp),canvas=document.createElement('canvas');canvas.width=320;canvas.height=280;const c=canvas.getContext('2d'),id=e.coverStructure,pixels=[];
   for(const old of [true,false]){c.clearRect(0,0,320,280);c.save();c.translate(160-e.x,210-e.y);e.coverStructure=old?undefined:id;r.warArt.drawActor(r,c,fixture,e,0,1,e.x,e.y,1000,1000);c.restore();const data=c.getImageData(0,0,320,280).data;let n=0;for(let k=3;k<data.length;k+=4)if(data[k])n++;pixels.push(n);}
   e.coverStructure=id;counts.push(pixels);out.drawImage(canvas,camp%4*320,Math.floor(camp/4)*300);out.fillStyle='#fff';out.font='14px Arial';out.fillText(fixture.war.leaders[fixture.war.owners[camp]].monsterId, camp%4*320+90,Math.floor(camp/4)*300+270);
  }
  window.sentrySheet=sheet.toDataURL();return {counts};
 });
 for(const [old,fixed] of result.counts)assert.ok(fixed>old+1000,JSON.stringify({old,fixed}));
 if(!mobile)await writeFile('test-results/war-sentry-visibility.png',Buffer.from((await page.evaluate(()=>window.sentrySheet)).split(',')[1],'base64'));
 assert.deepEqual(errors,[]);console.log(JSON.stringify({mobile,...result,errors}));await context.close();
}}finally{await browser.close();}
