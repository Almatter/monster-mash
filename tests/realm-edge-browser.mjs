import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {mkdir,writeFile} from 'node:fs/promises';
const {chromium}=await import(pathToFileURL(process.env.PLAYWRIGHT_PATH).href);
const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_PATH});
const origin=process.env.HUNT_ORIGIN||'http://127.0.0.1:4173',report=[];
await mkdir('test-results',{recursive:true});
try{for(const viewport of [{width:1920,height:1080},{width:844,height:390},{width:390,height:844}]){
 const mobile=viewport.width<1000,context=await browser.newContext({viewport,deviceScaleFactor:2,hasTouch:mobile,isMobile:mobile,serviceWorkers:'block'}),page=await context.newPage(),errors=[],failures=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)failures.push(r.url());});
 await page.goto(origin+'/verify.html');
 const spots=await page.evaluate(async()=>{
  const [{Game},{Renderer},map,layout]=await Promise.all([import('./src/simulation.js'),import('./src/renderer.js'),import('./src/titan-realm-map.js'),import('./src/realm-layout.js')]);
  const c=document.createElement('canvas');c.id='arena';document.body.replaceChildren(c);window.g=new Game(39,{monsterId:'lycanthrope'},2);g.seedOpening();window.r=new Renderer(c);r.setStage(2);
  g.enemies.forEach(e=>e.active=false);g.alive=0;g.fields.length=g.effects.length=g.shots.length=0;g.shake=0;
  await r.assets.prepare(g.identity,'gameplay',true);await r.realmArt.prepare();await r.prepareChampionVfx(['lycanthrope']);
  window.map=map;
  return [{name:'arena',x:0,y:0},...layout.REALM_GROTTOS.map(s=>({name:s.nature,...layout.realmAltar(s.id)})),...layout.REALM_PATHS.map(p=>({name:p.id,...p.curve[Math.floor(p.curve.length/2)]})),{name:'outer-fog',x:2200,y:2200}];
 });
 let coloredProbes=0;
 for(const spot of spots){
  const result=await page.evaluate(async spot=>{
   Object.assign(g.player,{x:spot.x,y:spot.y});await r.realmTerrain.prepare(spot.x,spot.y,r.viewWidth/r.scale/2+80,r.viewHeight/r.scale/2+80);r.draw(g,0);
   const pixels=[];const halfW=r.viewWidth/r.scale/2,halfH=r.viewHeight/r.scale/2;
   for(const [dx,dy] of [[-.85,-.85],[.85,-.85],[-.85,.85],[.85,.85]]){const p=r.worldToScreen(spot.x+dx*halfW,spot.y+dy*halfH,g);const sample=r.ctx.getImageData(Math.floor(p.x*r.dpr)-12,Math.floor(p.y*r.dpr)-12,24,24).data;let max=0,min=255;for(let i=0;i<sample.length;i+=4){const value=Math.max(sample[i],sample[i+1],sample[i+2]);max=Math.max(max,value);min=Math.min(min,value);}pixels.push([max,max-min,0,255]);}
   const body={x:spot.x,y:spot.y},from={...body};body.x+=1500;body.y+=1500;map.moveRealm(body,from,23);
   return {pixels,confined:map.insideRealm(body.x,body.y,23),peak:r.realmTerrain.peak,capacity:r.realmTerrain.capacity,root:r.realmTerrain.assetRoot,pixelCount:r.canvas.width*r.canvas.height};
  },spot);
  assert.equal(result.root,'assets/stage3/map-v43');assert.ok(result.peak<=result.capacity);assert.ok(result.pixelCount<=2105000);
  if(spot.name!=='outer-fog')assert.ok(result.confined,spot.name+' sweep escaped floor');
  for(const pixel of result.pixels){if(Math.max(...pixel.slice(0,3))<=20){console.log(spot,result);await page.screenshot({path:'test-results/v42-dark-probe.png'});}assert.ok(Math.max(...pixel.slice(0,3))>20,'Black gap at '+spot.name);coloredProbes++;}
  if(['arena','devourer','overlord','lycanthrope','south-ascent','outer-fog'].includes(spot.name))await page.screenshot({path:`test-results/v40-map-${viewport.width}-${spot.name}.png`});
 }
 assert.deepEqual(errors,[]);assert.deepEqual(failures,[]);
 report.push({viewport,regions:7,connectors:12,coloredProbes,walkableConfinement:true,boundedTerrainCache:true,assetErrors:0});await context.close();
}
await writeFile('test-results/realm-edge-browser.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));}finally{await browser.close();}
