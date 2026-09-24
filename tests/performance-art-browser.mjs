import {pathToFileURL} from 'node:url';import assert from 'node:assert/strict';
const {chromium}=await import(pathToFileURL(process.env.PLAYWRIGHT_PATH).href);
const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_PATH});
for(const [width,height] of [[1440,900],[844,390]]){
 const page=await browser.newPage({viewport:{width,height}});await page.goto('http://127.0.0.1:4173/verify.html');
 const reports=await page.evaluate(async()=>{
  const [{Game},{Renderer},{MONSTERS}]=await Promise.all([import('./src/simulation.js'),import('./src/renderer.js'),import('./src/content-monsters.js')]);
  const canvas=document.createElement('canvas');document.body.replaceChildren(canvas);const renderer=new Renderer(canvas),reports=[];
  for(const monsterId of Object.keys(MONSTERS)){
   const game=new Game(61,{monsterId});game.wave=24;for(let i=0;i<500;i++)game.spawn(i%6===0?'hound':'thrall');for(let i=0;i<24;i++)game.spawn('elite');game.spawn('titan');
   for(const enemy of game.enemies)if(enemy.active){enemy.x=(game.random()-.5)*1200;enemy.y=(game.random()-.5)*570;enemy.hp=enemy.maxHp=5000;}game.rebuildGrid();
   const deadline=performance.now()+10000;while(!renderer.assets.get(game.identity,'gameplay')?.gameplay&&performance.now()<deadline)await new Promise(resolve=>setTimeout(resolve,50));
   const atlas=renderer.assets.get(game.identity,'gameplay')?.gameplay;if(!atlas)throw Error(monsterId+' gameplay art did not load');
   const samples=[];for(let f=0;f<100;f++){await new Promise(requestAnimationFrame);const start=performance.now();renderer.draw(game,f/60);samples.push(performance.now()-start);}samples.sort((a,b)=>a-b);
   reports.push({monsterId,p50:samples[50],p95:samples[95],alive:game.alive,atlasMiB:atlas.width*atlas.height*4/1048576});
  }
  return reports;
 });
 assert.ok(reports.every(r=>r.p95<16.7),JSON.stringify(reports));console.log(width+'x'+height+' loaded-art render profile',JSON.stringify(reports));await page.close();
}
await browser.close();
