import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
const {chromium}=await import(pathToFileURL(process.env.PLAYWRIGHT_PATH).href);
const context=await chromium.launchPersistentContext('',{headless:true,executablePath:process.env.BROWSER_PATH});
const origin=process.env.SITE_ORIGIN||'http://127.0.0.1:4173';
try{
 const page=context.pages()[0]||await context.newPage();await page.goto(origin+'/monster-mash/');await page.waitForFunction(()=>navigator.serviceWorker.controller,{timeout:20000});
 const cdp=await context.newCDPSession(page),result=await cdp.send('Page.getInstallabilityErrors');
 console.log(JSON.stringify(result));assert.deepEqual(result.installabilityErrors,[]);
}finally{await context.close();}
