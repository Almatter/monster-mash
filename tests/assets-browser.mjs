import {pathToFileURL} from 'node:url';import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_PATH?pathToFileURL(process.env.PLAYWRIGHT_PATH).href:'playwright');
const browser=await chromium.launch({headless:true,...(process.env.BROWSER_PATH?{executablePath:process.env.BROWSER_PATH}:{})});const page=await browser.newPage();await page.goto('http://127.0.0.1:4173/verify.html');
const result=await page.evaluate(async()=>{
 const {tintLayer,AssetLibrary}=await import('./src/assets.js');const mask=document.createElement('canvas');mask.width=mask.height=2;const c=mask.getContext('2d');c.fillStyle='#ffffff';c.fillRect(0,0,1,1);c.fillStyle='#808080';c.fillRect(1,0,1,1);const tinted=tintLayer(mask,2,2,'#4080c0'),pixels=Array.from(tinted.getContext('2d').getImageData(0,0,2,2).data);
 const library=new AssetLibrary();while(!library.ready)await new Promise(resolve=>setTimeout(resolve,10));const identity={name:'AZRAEL',title:'',monsterId:'sovereign',colors:{primary:'#ffffff',secondary:'#ffffff',accent:'#ffffff',power:'#ffffff'}};
 const deadline=performance.now()+5000;while(!library.get(identity,'selection')?.selection&&performance.now()<deadline)await new Promise(resolve=>setTimeout(resolve,40));
 return {pixels,selection:library.get(identity,'selection')?.selection?.width,fallback:library.get({...identity,monsterId:'missing'},'selection')===null};
});
assert.deepEqual(result.pixels.slice(0,4),[64,128,192,255]);assert.ok(Math.abs(result.pixels[4]-32)<=1);assert.equal(result.pixels[11],0);assert.equal(result.selection,768);assert.equal(result.fallback,true);console.log('Tint shading, alpha, shipped WebP selection and missing-art fallback pass.');await browser.close();
