import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {mkdir,writeFile} from 'node:fs/promises';
const {chromium}=await import(pathToFileURL(process.env.PLAYWRIGHT_PATH).href);
const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_PATH}),origin=process.env.HUNT_ORIGIN||'http://127.0.0.1:4173',report=[];
await mkdir('test-results',{recursive:true});
try{
 for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
  const context=await browser.newContext({viewport,hasTouch:viewport.width<1000,serviceWorkers:'block'}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));let clock='Wed, 07 Oct 2026 16:00:00 GMT';
  await page.route('**/index.html?stage-clock=*',r=>r.fulfill({status:200,headers:{Date:clock},body:''}));
  await page.goto(origin+'/');await page.locator('#recordsButton').click();assert.equal(await page.locator('[data-title=ashenGatebreaker]').count(),0);
  await page.evaluate(async()=>{const {normalizeProfile,recordProgress}=await import('./src/profile.js'),p=normalizeProfile(null);p.identity.monsterId='devourer';p.identity.colors={...p.palettes.devourer};for(let n=1;n<=7;n++)recordProgress(p,{id:'s'+n,monsterId:'devourer',phase:0,reason:'retired',values:{seconds:510,kills:15000},best:{}},true,new Date(Date.UTC(2026,9,n,16)));p.progress.archetypes.devourer={...p.progress.archetypes.devourer,courtClears:11,courtColossusClears:4,courtBoonHasteClear:1,courtBoonPowerClear:1,courtBoonReachClear:1,courtBoonRechargeClear:1};localStorage.setItem('mm-profile',JSON.stringify(p));});
  await page.reload();await page.locator('#recordsButton').click();assert.equal(await page.locator('[data-title=ashenGatebreaker]').count(),0);
  clock='Thu, 08 Oct 2026 05:00:00 GMT';await page.reload();await page.locator('[data-monster=reaper]').waitFor();await page.locator('#recordsButton').click();
  await page.locator('[data-family="Stage passage"]>summary').click();await page.locator('[data-title=ashenGatebreaker]>summary').click();assert.equal(await page.locator('[data-mastery-champion]').count(),6);
  await page.locator('[data-mastery-champion=devourer]>summary').click();const card=page.locator('[data-title=ashenGatebreaker]');assert.match(await card.textContent(),/No daily limit/);assert.match(await card.textContent(),/Oct 15/);
  assert.deepEqual(await page.locator('[data-mastery-champion=devourer] progress').evaluateAll(nodes=>nodes.map(n=>[n.value,n.max])),[[11,12],[4,5],[4,4]]);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await page.locator('[data-mastery-champion=devourer]').scrollIntoViewIfNeeded();await page.screenshot({path:'test-results/stage3-mastery-'+viewport.width+'.png',fullPage:true});
  await page.locator('#closeRecords').click();await page.locator('[data-phase="2"]').click();assert.equal(await page.locator('[data-phase="2"]').getAttribute('aria-pressed'),'false');assert.match(await page.locator('#stageStatus').textContent(),/October 15/);
  await page.locator('[data-phase="1"]').click();await page.waitForFunction(()=>document.querySelector('[data-phase="1"]').getAttribute('aria-pressed')==='true');
  await page.evaluate(async()=>{const {Game}=await import('./src/simulation.js'),update=Game.prototype.update;Game.prototype.update=function(...a){window.g=this;return update.apply(this,a);};});
  if(viewport.width<1000)await page.setViewportSize({width:844,height:390});await page.locator('#startForm button[type=submit]').click();await page.locator('#pause').click();
  await page.evaluate(async()=>{const {spawnCourtHunt,chooseCourtUpgrade}=await import('./src/stage-two.js'),{summonColossus,colossusEnemy}=await import('./src/ashen-colossus.js');g.time=420;g.wave=15;g.player.invuln=10000;for(let n=0;n<8;n++){spawnCourtHunt(g);const cap=g.enemies.find(e=>e.active&&e.court?.role==='captain');g.player.x=cap.x-70;g.player.y=cap.y;g.damage(cap,1e9,'execute');chooseCourtUpgrade(g,['haste','haste','haste','power','power','power','reach','reach'][n]);}g.player.x=g.player.y=0;if(!summonColossus(g))throw Error('No Colossus summoned');g.time=450;const boss=colossusEnemy(g);g.player.x=boss.x-70;g.player.y=boss.y;g.damage(boss,1e9,'execute');for(let n=8;n<10;n++){spawnCourtHunt(g);const cap=g.enemies.find(e=>e.active&&e.court?.role==='captain');g.player.x=cap.x-70;g.player.y=cap.y;g.damage(cap,1e9,'execute');if(n===8)chooseCourtUpgrade(g,'reach');}});
  await page.locator('#result').waitFor({state:'visible'});await page.waitForFunction(()=>document.querySelector('#runCode').value.startsWith('MM4.'));
  assert.match(await page.locator('#stageProgress').textContent(),/12 \/ 12 hunts.*5 \/ 5 Colossus victories.*4 \/ 4 mastered boons/);assert.match(await page.locator('#newTitles').textContent(),/The Ashen Gatebreaker/);
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('mm-profile')));assert.ok(saved.progress.titles.ashenGatebreaker);assert.equal(saved.progress.trials.gatebreaker.devourer.length,7);
  const decoded=await page.evaluate(async()=>{const {decodeRun}=await import('./src/run-code.js');return decodeRun(document.querySelector('#runCode').value);});assert.equal(decoded.reason,'cleared');assert.equal(decoded.mission.colossus.reward,1200000);
  await page.locator('#back').click();await page.reload();await page.locator('#title option[value="The Ashen Gatebreaker"]').waitFor({state:'attached'});await page.locator('#title').selectOption('The Ashen Gatebreaker');
  clock='Thu, 15 Oct 2026 05:00:00 GMT';await page.reload();await page.locator('[data-phase="2"]').click();assert.equal(await page.locator('[data-phase="2"]').getAttribute('aria-pressed'),'false');assert.match(await page.locator('#stageStatus').textContent(),/not available yet/);
  assert.deepEqual(errors,[]);report.push({viewport,hiddenBeforeStage2:true,sixSeparateChampionTrackers:true,completedHuntAwardsTitle:true,saveReload:true,stage3UnbuiltMapLocked:true});await context.close();
 }
 const context=await browser.newContext({serviceWorkers:'block'}),page=await context.newPage();await page.goto(origin+'/stage2-test/');await page.locator('#recordsButton').click();assert.equal(await page.locator('[data-title=ashenGatebreaker]').count(),1);assert.equal(await page.locator('[data-mastery-champion]').count(),6);assert.equal(await page.evaluate(()=>localStorage.getItem('mm-profile')),null);await context.close();
 await writeFile('test-results/stage3-mastery-browser.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}finally{await browser.close();}
