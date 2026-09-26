import assert from 'node:assert/strict';import {pathToFileURL} from 'node:url';import {mkdir} from 'node:fs/promises';
const {chromium}=await import(pathToFileURL(process.env.PLAYWRIGHT_PATH).href),browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_PATH});await mkdir('test-results',{recursive:true});
try{for(const touch of [false,true]){
 const page=await browser.newPage({viewport:touch?{width:844,height:390}:{width:1440,height:900},hasTouch:touch,isMobile:touch}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.clock.install();await page.goto('http://127.0.0.1:4173/');
 await page.evaluate(async()=>{const {Game}=await import('./src/simulation.js');const update=Game.prototype.update;Game.prototype.update=function(...args){window.g=this;if(window.forceEnd){window.forceEnd=false;this.ended=true;return;}return update.apply(this,args);};});
 for(const id of ['sovereign','titan','calamity','overlord','devourer']){
  await page.locator(`[data-monster=${id}]`).click();const definitions=await page.evaluate(async id=>{const {MONSTERS,ABILITIES,abilityLabel}=await import('./src/content-monsters.js');return MONSTERS[id].abilities.map(k=>({...ABILITIES[k],label:abilityLabel(ABILITIES[k])}));},id);
  const kit=await page.locator('#kit').textContent();for(const p of definitions)assert.ok(kit.includes(p.label),p.label);
  await page.locator('#startForm button.primary').click();for(let i=0;i<4;i++){const b=page.locator('#abilities button').nth(i);assert.equal(await b.locator('.title').textContent(),definitions[i].short.toUpperCase());assert.equal(await b.getAttribute('title'),definitions[i].label);assert.ok((await b.getAttribute('aria-label')).includes(definitions[i].name));}
  await page.locator('#pause').click();await page.locator('#endRun').click();await page.waitForSelector('#result:not([hidden])');await page.waitForFunction(()=>document.querySelector('#runCode').value.startsWith('MM4.'));await page.locator('#back').click();
 }
 await page.locator('#startForm button.primary').click();await page.waitForTimeout(500);await page.clock.pauseAt(await page.evaluate(()=>Date.now()+100));
 await page.evaluate(()=>{g.time=300;g.wave=11;g.release=2;g.lungeCharges=2;g.cooldowns[0]=0;g.player.angle=0;g.player.invuln=100;});
 if(!touch){
  await page.mouse.move(1200,450);await page.keyboard.down('a');await page.keyboard.press('q');assert.equal(await page.evaluate(()=>g.dash.angle),Math.PI,'Current key must win even before next simulation frame');await page.keyboard.up('a');
  const start=await page.evaluate(()=>g.player.x);await page.clock.runFor(50);assert.ok(await page.evaluate(x=>g.player.x<x,start));await page.mouse.move(1200,300);await page.clock.runFor(20);await page.keyboard.press('q');assert.equal(await page.evaluate(()=>g.dash.angle),Math.PI,'Stationary cast retains travel direction despite mouse change');
 }else{
  const stick=await page.locator('#joystick').boundingBox(),ability=await page.locator('#abilities button').first().boundingBox(),cdp=await page.context().newCDPSession(page);
  const p1={id:1,x:stick.x+stick.width/2,y:stick.y+stick.height/2-25},p2={id:2,x:ability.x+ability.width/2,y:ability.y+ability.height/2};
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[p1]});await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[p1,p2]});
  assert.ok(Math.abs(await page.evaluate(()=>g.dash.angle)+Math.PI/2)<.001,'Held joystick direction must win over aimed facing');
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.clock.runFor(20);
 }
 await page.locator('#pause').click();await page.locator('#endRun').click();await page.waitForSelector('#result:not([hidden])');await page.waitForFunction(()=>document.querySelector('#runCode').value.startsWith('MM4.'));assert.match(await page.locator('.share-guide').textContent(),/summary and run code.*PNG/);await page.locator('#back').click();
 for(const [seconds,label] of [[100,'A LEGEND IN THE MAKING'],[510,'FULLY UNBOUND'],[600,'TEN-MINUTE LEGEND']]){
  await page.locator('#startForm button.primary').click();await page.evaluate(seconds=>{g.time=seconds;g.release=seconds>=510?4:0;g.wave=Math.floor(seconds/30)+1;g.score.dominance=1200;g.score.kills=12;g.player.invuln=100;window.forceEnd=true;},seconds);await page.clock.runFor(60);await page.waitForSelector('#result:not([hidden])');await page.waitForFunction(()=>document.querySelector('#runCode').value.startsWith('MM4.'));assert.equal(await page.locator('#resultOutcome').textContent(),label);assert.ok(!(await page.locator('#resultIdentity').textContent()).includes('OVERWHELMED'));
  const payload=await page.evaluate(async()=>{const {decodeRun}=await import('./src/run-code.js');return decodeRun(document.querySelector('#runCode').value);});const cardLabels=await page.evaluate(async payload=>{const {resultCard}=await import('./src/results.js');const captured=[],original=CanvasRenderingContext2D.prototype.fillText;CanvasRenderingContext2D.prototype.fillText=function(text,...args){captured.push(text);return original.call(this,text,...args);};try{resultCard(payload);}finally{CanvasRenderingContext2D.prototype.fillText=original;}return captured;},payload);assert.ok(cardLabels.some(text=>text.includes(label)),'Saved card must use the same milestone');assert.equal(payload.reason,'overwhelmed');assert.equal(payload.rules,'2026.10-v7-movement');await page.clock.runFor(200);await page.screenshot({path:`test-results/outcome-${seconds}-${touch?'touch':'desktop'}.png`});await page.locator('#back').click();
 }
 assert.deepEqual(errors,[]);console.log(`${touch?'Touch landscape':'Desktop'}: all five kits/action labels, fresh movement input, stationary fallback, milestone outcomes, sharing explanation and sealed ending pass`);await page.close();
}}finally{await browser.close();}
