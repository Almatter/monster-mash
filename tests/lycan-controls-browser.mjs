import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {writeFile} from 'node:fs/promises';
const {chromium}=await import(pathToFileURL(process.env.PLAYWRIGHT_PATH).href);
const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_PATH}),rows=[];
try{for(const mobile of [false,true]){
 const context=await browser.newContext({viewport:mobile?{width:844,height:390}:{width:1440,height:900},hasTouch:mobile,isMobile:mobile,serviceWorkers:'block'}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));await page.goto((process.env.HUNT_ORIGIN||'http://127.0.0.1:4173')+'/test/');
 await page.evaluate(async()=>{const {Game}=await import('./src/simulation.js'),{Renderer}=await import('./src/renderer.js');const u=Game.prototype.update,d=Renderer.prototype.draw;Game.prototype.update=function(...a){window.g=this;return u.apply(this,a);};Renderer.prototype.draw=function(...a){window.r=this;return d.apply(this,a);};});
 await page.locator('[data-monster=lycanthrope]').click();await page.locator('#startForm button[type=submit]').click();await page.waitForFunction(()=>window.g?.monster.id==='lycanthrope'&&!document.querySelector('#controls').hidden);
 await page.locator('#pause').click();await page.evaluate(async()=>{g.enemies.forEach(e=>e.active=false);g.alive=0;g.realm.spawnTimer=100;g.player.x=0;g.player.y=1030;g.setMovementDirection(0,1);await r.realmTerrain.prepare(0,1030,900,500);});await page.locator('#resume').click();
 const activate=async index=>{if(mobile){const box=await page.locator('#abilities button').nth(index).boundingBox();await page.touchscreen.tap(box.x+box.width/2,box.y+box.height/2);}else await page.keyboard.press(['q','e','r',' '][index]);};
 const from=await page.evaluate(()=>g.player.y);await activate(0);await page.waitForFunction(()=>r.targeting?.valid);await activate(0);await page.waitForFunction(from=>g.player.y>from+100,from);assert.equal(await page.locator('#targetHint').isVisible(),false);
 await page.locator('#pause').click();await page.evaluate(async()=>{g.player.x=530;g.player.y=50;g.cooldowns[0]=0;g.realm.engaged=false;await r.realmTerrain.prepare(530,50,900,500);});await page.locator('#resume').click();await activate(0);
 const landing=await page.evaluate(()=>{const scale=r.scale;return {x:r.width/2+(430-g.player.x)*scale,y:r.height/2+(150-g.player.y)*scale};});
 if(mobile)await page.touchscreen.tap(landing.x,landing.y);else await page.mouse.click(landing.x,landing.y);await page.waitForFunction(()=>Math.hypot(g.player.x-430,g.player.y-150)<35);
 await page.locator('#pause').click();await page.evaluate(()=>{g.realm.engaged=false;g.realm.spawnTimer=100;g.player.x=0;g.player.y=1030;const e=g.spawn('hound');Object.assign(e,{x:0,y:1100,hp:10000,maxHp:10000});window.prey=e;g.rebuildGrid();g.cooldowns[1]=0;});await page.locator('#resume').click();await activate(1);await page.waitForFunction(()=>prey.fearedUntil>g.time);
 await page.locator('#pause').click();await page.evaluate(()=>{g.player.x=0;g.player.y=1030;g.enemies.forEach(e=>e.active=false);g.alive=0;window.furyPrey=[100,200,300].map((dx,i)=>{const e=g.spawn('thrall');Object.assign(e,{x:dx,y:1030,hp:10000,maxHp:10000});return e;});g.rebuildGrid();g.cooldowns[3]=0;});await page.locator('#resume').click();await activate(3);await page.waitForFunction(()=>furyPrey.every(e=>e.hp<10000));
 await page.waitForTimeout(1000);await page.screenshot({path:'test-results/lycan-controls-'+(mobile?'touch':'desktop')+'.png'});assert.deepEqual(errors,[]);rows.push({mobile,repeatToConfirm:true,tapOrClickGapVault:true,howlFear:true,furyVisitsAllVisible:true});await context.close();
}await writeFile('test-results/lycan-controls-browser.json',JSON.stringify(rows,null,2));console.log(rows);
}finally{await browser.close();}
