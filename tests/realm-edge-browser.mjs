import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {mkdir,writeFile} from 'node:fs/promises';
const {chromium}=await import(pathToFileURL(process.env.PLAYWRIGHT_PATH).href);
const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_PATH});
const origin=process.env.HUNT_ORIGIN||'http://127.0.0.1:4173',report=[];
await mkdir('test-results',{recursive:true});
try{for(const viewport of [{width:1440,height:900},{width:844,height:390},{width:390,height:844}]){
 const mobile=viewport.width<1000,context=await browser.newContext({viewport,hasTouch:mobile,isMobile:mobile,serviceWorkers:'block'}),page=await context.newPage(),errors=[],failures=[];
 page.on('pageerror',error=>errors.push(error.message));page.on('response',r=>{if(r.status()>=400)failures.push(r.url());});
 await page.goto(origin+'/test/');
 await page.evaluate(async()=>{const [{Game},{Renderer}]=await Promise.all([import('./src/simulation.js'),import('./src/renderer.js')]);const update=Game.prototype.update,draw=Renderer.prototype.draw;Game.prototype.update=function(...args){window.g=this;return update.apply(this,args);};Renderer.prototype.draw=function(...args){window.r=this;return draw.apply(this,args);};});
 await page.locator('[data-monster=lycanthrope]').click();await page.locator('#startForm button[type=submit]').click();await page.waitForFunction(()=>window.g?.realm&&!document.querySelector('#controls').hidden);await page.evaluate(()=>{document.querySelector('#pause').click();document.querySelector('#paused').style.display='none';document.querySelector('#rotate').style.display='none';});
 const edges=await page.evaluate(async()=>{const {REALM_EDGE,REALM_LANES}=await import('./src/titan-realm-map.js');return REALM_LANES.filter(l=>l.a.x!==l.b.x||l.a.y!==l.b.y).flatMap(l=>[l.a,l.b].map(end=>{const axis=l.a.x!==l.b.x?'x':'y',sign=Math.sign(end[axis]);return {axis,sign,x:axis==='x'?sign*(REALM_EDGE-32):end.x,y:axis==='y'?sign*(REALM_EDGE-32):end.y,edge:REALM_EDGE};}));});
 let probes=0;
 for(const [index,edge] of edges.entries()){
  const result=await page.evaluate(async edge=>{const {moveRealm,insideRealm}=await import('./src/titan-realm-map.js');g.enemies.forEach(e=>e.active=false);g.alive=0;g.fields.length=g.effects.length=g.shots.length=0;g.shake=0;Object.assign(g.player,{x:edge.x,y:edge.y});await r.realmTerrain.prepare(edge.x,edge.y,r.viewWidth/r.scale/2+80,r.viewHeight/r.scale/2+80);r.draw(g,0);
   const points=[];for(const distance of [180,220,430]){const q={x:edge.x,y:edge.y};q[edge.axis]=edge.sign*(edge.edge+distance);const p=r.worldToScreen(q.x,q.y,g);if(p.x>8&&p.x<r.width-8&&p.y>8&&p.y<r.height-8){const color=[...r.ctx.getImageData(Math.floor(p.x*r.dpr),Math.floor(p.y*r.dpr),1,1).data];points.push({distance,color});}}
   const body={x:edge.x,y:edge.y},from={...body};body[edge.axis]=edge.sign*(edge.edge+500);moveRealm(body,from,23);
   return {points,confined:insideRealm(body.x,body.y,23)&&Math.abs(body[edge.axis])<=edge.edge-23+.001,peak:r.realmTerrain.peak,capacity:r.realmTerrain.capacity,fogLoaded:r.realmArt.images.has('ether-fog'),assetRoot:r.realmTerrain.assetRoot};
  },edge);
  assert.ok(result.confined);assert.ok(result.fogLoaded);assert.match(result.assetRoot,/map-v38$/);assert.ok(result.peak<=result.capacity);assert.ok(result.points.length>0);
  for(const {color} of result.points){assert.ok(color[2]>45&&color[1]>15&&color[2]>color[0]+15,'Void or old ground exposed: '+JSON.stringify({edge,color}));probes++;}
  if(index===3||index===7)await page.screenshot({path:`test-results/realm-edge-${viewport.width}-${index}.png`});
 }
 assert.deepEqual(errors,[]);assert.deepEqual(failures,[]);report.push({viewport,allTwelveEdges:true,fogPixelProbes:probes,walkableConfinement:true,boundedTerrainCache:true});await context.close();
}
await writeFile('test-results/realm-edge-browser.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));}finally{await browser.close();}
