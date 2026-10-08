import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
const {chromium}=await import(pathToFileURL(process.env.PLAYWRIGHT_PATH).href);
const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_PATH});
const origin=process.env.HUNT_ORIGIN||'http://127.0.0.1:4173';
try{
 const page=await browser.newPage({serviceWorkers:'block'}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(origin+'/verify.html');
 await page.evaluate(async()=>{
  const [{Renderer},{createIdentity},{MONSTERS}]=await Promise.all([import('./src/renderer.js'),import('./src/identity.js'),import('./src/content-monsters.js')]);
  window.makeIdentity=createIdentity;window.monsters=MONSTERS;
  window.preview=document.createElement('canvas');preview.width=768;preview.height=1024;
  window.gameCanvas=document.createElement('canvas');gameCanvas.width=512;gameCanvas.height=512;
  window.renderer=new Renderer(gameCanvas);
 });
 await page.waitForFunction(()=>renderer.assets.ready);
 for(const id of ['sovereign','devourer','titan','calamity','overlord','reaper'])for(const variant of [0,1])for(const type of ['selection','gameplay']){
  await page.evaluate(({id,variant,type})=>{
   const assets=renderer.assets;
   window.identity=makeIdentity({monsterId:id,colors:{...monsters[id].palette,primary:variant?'#49b3aa':'#e975bc',secondary:variant?'#e975bc':'#387ccb',power:variant?'#d9af61':'#8cb865'}});
   renderer.previewIdentity=identity;
   const urls=Object.values(assets.catalog[id][type]),last=urls.at(-1),load=assets.image.bind(assets);
   window.blocked=false;window.releaseArt=undefined;
   const barrier=new Promise(resolve=>window.releaseArt=resolve);
   assets.image=async url=>{if(url===last){window.blocked=true;await barrier;}return load(url);};
   assets.get(identity,type);
  },{id,variant,type});
  await page.waitForFunction(()=>window.blocked);
  const pending=await page.evaluate(type=>{
   const context=(type==='selection'?preview:gameCanvas).getContext('2d'),draw=context.drawImage;
   let calls=0;context.drawImage=function(...args){calls++;return draw.apply(this,args);};
   let gameplayDrawn=false;
   try{for(let n=0;n<5;n++)if(type==='selection')renderer.drawPreview(preview,n);else gameplayDrawn=renderer.assets.drawGameplay(context,identity,256,256,n,'idle');}
   finally{context.drawImage=draw;}
   return {calls,gameplayDrawn,complete:!!renderer.assets.completed(identity,type),pending:renderer.assets.pending.size};
  },type);
  assert.equal(pending.calls,0,`${id} ${type} must not draw an unfinished or previous palette`);
  assert.equal(pending.gameplayDrawn,false);assert.equal(pending.complete,false);assert.ok(pending.pending<=2);
  await page.evaluate(()=>releaseArt());
  await page.waitForFunction(type=>!!renderer.assets.completed(identity,type),type);
  const completed=await page.evaluate(type=>{
   const assets=renderer.assets,art=assets.completed(identity,type),context=(type==='selection'?preview:gameCanvas).getContext('2d'),draw=context.drawImage;
   const images=[];context.drawImage=function(image,...args){images.push(image);return draw.call(this,image,...args);};
   try{if(type==='selection')renderer.drawPreview(preview,1);else assets.drawGameplay(context,identity,256,256,1,'idle');}finally{context.drawImage=draw;}
   return {exact:images.length===1&&images[0]===art,cache:assets.cache.size,lastGood:assets.lastGood.size};
  },type);
  assert.equal(completed.exact,true,`${id} ${type} must draw the fully completed current palette`);
  assert.ok(completed.cache<=4);assert.ok(completed.lastGood<=4);
 }
 await page.close();
 for(const viewport of [{width:1440,height:900},{width:844,height:390}]){
  const p=await browser.newPage({viewport,serviceWorkers:'block'});p.on('pageerror',e=>errors.push(e.message));
  await p.goto(origin+'/');await p.locator('#roster button').first().waitFor();
  await p.evaluate(async()=>{
   const {Renderer}=await import('./src/renderer.js'),draw=Renderer.prototype.drawPreview;
   Renderer.prototype.drawPreview=function(...args){window.renderer=this;return draw.apply(this,args);};
   const {Game}=await import('./src/simulation.js'),update=Game.prototype.update;
   Game.prototype.update=function(...args){window.testGame=this;return update.apply(this,args);};
  });
  await p.waitForFunction(()=>window.renderer?.assets.ready);
  await p.evaluate(()=>{
   const assets=renderer.assets,id=renderer.previewIdentity.monsterId,last=Object.values(assets.catalog[id].gameplay).at(-1),load=assets.image.bind(assets);
   window.blocked=false;const barrier=new Promise(resolve=>window.releaseArt=resolve);
   assets.image=async url=>{if(url===last){window.blocked=true;await barrier;}return load(url);};
  });
  await p.locator('#startForm button.primary').click();await p.waitForFunction(()=>window.blocked);
  assert.equal(await p.locator('#hud').isVisible(),false);
  assert.equal(await p.locator('#menu').isVisible(),true);
  assert.equal(await p.evaluate(()=>!!window.testGame),false);
  assert.match(await p.locator('#startForm button.primary').textContent(),/PREPARING/);
  await p.evaluate(()=>releaseArt());await p.locator('#hud').waitFor({state:'visible'});
  assert.equal(await p.evaluate(()=>!!renderer.assets.completed(testGame.identity,'gameplay')),true);
  await p.close();
 }
 assert.deepEqual(errors,[]);
 console.log('All six champions: selection and gameplay hide incomplete/new palette compositions; bounded artwork caches; desktop and phone matches wait for completed colored atlases.');
}finally{await browser.close();}
