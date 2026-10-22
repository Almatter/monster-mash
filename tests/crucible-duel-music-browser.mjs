import assert from 'node:assert/strict';import {pathToFileURL} from 'node:url';
const {chromium}=await import(pathToFileURL(process.env.PLAYWRIGHT_PATH).href),browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_PATH});
try{const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:4173/verify.html');
await page.evaluate(async()=>{const {AudioEngine}=await import('./src/audio.js');window.a=new AudioEngine();a.setChampion('throne-war');document.body.innerHTML='<button>Start</button>';document.querySelector('button').onclick=()=>{a.unlock();void a.setMusic('combat');};});await page.locator('button').click();
await page.waitForFunction(()=>a.procedural?.theme==='throne-war'&&a.procedural.voices.length===7,{},{timeout:30000});
const entry=await page.evaluate(async()=>{await a.setMusic('final');const m=a.procedural;window.entry=m.herald;return {herald:!!entry,theme:m.requestedTheme};});assert.equal(entry.herald,true);assert.equal(entry.theme,'throne-duel');
await page.waitForFunction(()=>a.procedural?.theme==='throne-duel'&&a.procedural.voices.length===7,{},{timeout:30000});
await page.evaluate(async()=>{const refs=a.procedural.voices.map(v=>v.source);for(let i=0;i<20;i++)await a.setMusic('final');if(!refs.every((s,i)=>s===a.procedural.voices[i].source))throw Error('Final score restarted');if(a.procedural.herald&&a.procedural.herald!==entry)throw Error('Herald repeated');a.setPaused(true);});
await page.waitForFunction(()=>a.context.state==='suspended');await page.evaluate(()=>a.setPaused(false));await page.waitForFunction(()=>a.context.state==='running');
await page.evaluate(()=>a.setMusic('results'));await page.waitForFunction(()=>a.procedural?.theme==='throne-war'&&a.procedural.voices.length===7,{},{timeout:30000});assert.equal(await page.evaluate(()=>a.procedural.herald),null);await page.evaluate(()=>a.dispose());assert.deepEqual(errors,[]);console.log('Stage 4 duel: distinct score, one herald, stable playback, pause/resume, results restoration and cleanup passed');
}finally{await browser.close();}
