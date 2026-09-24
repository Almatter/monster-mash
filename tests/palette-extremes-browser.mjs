import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
const {chromium}=await import(pathToFileURL(process.env.PLAYWRIGHT_PATH).href);
const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_PATH});
const palettes=[
 {primary:'#202433',secondary:'#a83248',accent:'#d9af61',power:'#e975bc'},
 {primary:'#eee5d4',secondary:'#387ccb',accent:'#d9af61',power:'#49b3aa'},
 {primary:'#8862c7',secondary:'#aab9ce',accent:'#eee5d4',power:'#49b3aa'},
 {primary:'#8cb865',secondary:'#202433',accent:'#d9af61',power:'#e975bc'}
];
const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];page.on('pageerror',error=>errors.push(error.message));await page.goto('http://127.0.0.1:4173/');
for(const id of ['sovereign','titan','devourer','calamity','overlord']){
 await page.locator('[data-monster='+id+']').click();await page.waitForTimeout(1200);const signatures=[];
 for(const [index,palette] of palettes.entries()){
  for(const [channel,color] of Object.entries(palette))await page.locator('[data-channel='+channel+'][data-color="'+color+'"]').click();
  await page.waitForTimeout(1200);
  signatures.push(await page.locator('#preview').evaluate(canvas=>{const c=canvas.getContext('2d'),data=c.getImageData(0,0,canvas.width,canvas.height).data;let sum=0,alpha=0;for(let i=0;i<data.length;i+=16){sum=(Math.imul(sum,31)+data[i]*3+data[i+1]*5+data[i+2]*7+data[i+3])>>>0;alpha+=data[i+3];}return sum+':'+alpha;}));
  if(id==='overlord')await page.screenshot({path:'test-results/overlord-extreme-'+index+'.png'});
 }
 assert.equal(new Set(signatures).size,4,id+' color masks must respond to all extreme palettes');console.log(id+' four extreme palettes produce distinct composited art');
}
assert.deepEqual(errors,[]);await browser.close();
