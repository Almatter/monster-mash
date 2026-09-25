import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
const {chromium}=await import(pathToFileURL(process.env.PLAYWRIGHT_PATH).href);
const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_PATH});
const origin=process.env.SITE_ORIGIN||'https://almatter.github.io',base='/monster-mash/',marker=process.env.PAGES_UPDATE_MARKER||'PAGES-ASSET-REFRESH-2026-09-25-B';
try{
 const context=await browser.newContext({serviceWorkers:'allow'}),page=await context.newPage();
 await page.goto(origin+base);await page.waitForFunction(()=>navigator.serviceWorker.controller,{timeout:20000});
 const old=await page.evaluate(async()=>({scope:(await navigator.serviceWorker.ready).scope,caches:await caches.keys(),icon:await fetch('icon.svg').then(r=>r.text())}));
 assert.equal(old.scope,origin+base);assert.ok(!old.icon.includes(marker));
 const oldKey=old.caches.find(k=>k.startsWith('monster-mash-static-'));assert.ok(oldKey);console.log('OLD BUILD LOADED '+oldKey);
 let newKey='';for(let i=0;i<60;i++){
  const worker=await fetch(origin+base+'sw.js?probe='+Date.now(),{cache:'no-store'}).then(r=>r.text());
  newKey=worker.match(/monster-mash-static-[0-9a-f]{16}/)?.[0]||'';
  if(newKey&&newKey!==oldKey)break;
  await new Promise(resolve=>setTimeout(resolve,5000));
 }
 assert.ok(newKey&&newKey!==oldKey,'Timed out waiting for hosted update');
 await page.evaluate(async()=>{await (await navigator.serviceWorker.ready).update();});
 await page.waitForFunction(async key=>(await caches.keys()).includes(key),newKey,{timeout:30000});
 await page.waitForFunction(async key=>!(await caches.keys()).includes(key),oldKey,{timeout:30000});
 await page.reload();await page.waitForFunction(async marker=>(await fetch('icon.svg',{cache:'no-cache'}).then(r=>r.text())).includes(marker),marker,{timeout:120000,polling:5000});const updated=await page.evaluate(async()=>({scope:(await navigator.serviceWorker.ready).scope,icon:await fetch('icon.svg').then(r=>r.text()),caches:await caches.keys()}));
 assert.equal(updated.scope,origin+base);assert.ok(updated.icon.includes(marker));assert.ok(updated.caches.includes(newKey));assert.ok(!updated.caches.includes(oldKey));
 await context.setOffline(true);await page.reload();assert.equal(await page.locator('#menu').isVisible(),true);await page.goto(origin+base+'verify/');assert.equal(await page.title(),'Verify a Run · Monster Mash');
 console.log('HOSTED UPDATE PASS '+oldKey+' -> '+newKey+'; changed asset, offline menu, offline direct verifier');
 await context.close();
}finally{await browser.close();}
