import {pathToFileURL} from 'node:url';
const {chromium}=await import(pathToFileURL(process.env.PLAYWRIGHT_PATH).href),browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_PATH});
try{
 const context=await browser.newContext({serviceWorkers:'allow'}),page=await context.newPage(),responses=[];
 context.on('response',response=>{if(response.url().startsWith('http://127.0.0.1:4173/monster-mash/'))responses.push(response.body().then(body=>({path:new URL(response.url()).pathname.slice('/monster-mash/'.length),bytes:body.length,status:response.status()})).catch(()=>null));});
 await page.goto('http://127.0.0.1:4173/monster-mash/');await page.waitForFunction(()=>navigator.serviceWorker.controller,{timeout:15000});await page.waitForTimeout(3000);
 const entries=(await Promise.all(responses)).filter(Boolean),unique=new Map();for(const entry of entries)if(entry.status===200)unique.set(entry.path,entry.bytes);
 const groups={shell:0,art:0,other:0};for(const [path,bytes] of unique)groups[path.startsWith('assets/monsters/')?'art':path.startsWith('assets/')?'other':'shell']+=bytes;
 console.log(JSON.stringify({files:unique.size,bytes:[...unique.values()].reduce((a,b)=>a+b,0),groups,largest:[...unique].sort((a,b)=>b[1]-a[1]).slice(0,10)},null,2));
}finally{await browser.close();}
