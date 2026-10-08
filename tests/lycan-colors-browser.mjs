import assert from 'node:assert/strict';import {pathToFileURL} from 'node:url';import {mkdir,writeFile} from 'node:fs/promises';
const {chromium}=await import(pathToFileURL(process.env.PLAYWRIGHT_PATH).href),browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_PATH}),origin=process.env.HUNT_ORIGIN||'http://127.0.0.1:4173';await mkdir('test-results',{recursive:true});
try{const context=await browser.newContext({serviceWorkers:'block',viewport:{width:1440,height:900}}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(origin+'/stage2-test/');
 for(const [id,count] of [['lycanthrope',5]]){await page.locator('[data-monster='+id+']').click();assert.equal(await page.locator('#colors fieldset').count(),count);if(id==='sovereign')await page.locator('[data-channel=hair][data-color="#49b3aa"]').click();if(['sovereign','calamity','overlord'].includes(id))await page.locator('[data-channel=skin]').first().click();}
 const proof=await page.evaluate(async()=>{
  const {compose}=await import('./src/assets.js'),{MONSTERS}=await import('./src/content-monsters.js'),{resultCard}=await import('./src/results.js'),catalog=await(await fetch('assets/catalog.json')).json(),rows=[],shots={};
  const load=async url=>{const img=new Image();img.src=url;await img.decode();return img;},pixels=c=>c.getContext('2d').getImageData(0,0,c.width,c.height).data;
  for(const id of ['lycanthrope'])for(const type of ['selection','portrait','cutin','gameplay']){
   const set=catalog[id][type],images={};for(const [key,url] of Object.entries(set))images[key]=await load(url);const loader=async url=>images[Object.keys(set).find(k=>set[k]===url)],colors={...MONSTERS[id].palette,primary:'#387ccb',secondary:'#e975bc',accent:'#d9af61',power:'#8cb865',...(set.skin?{skin:'#eee5d4'}:{}),...(set.hair?{hair:'#49b3aa'}:{})},original=await compose(set,colors,type,loader),base=pixels(original),counts={};
   for(const channel of MONSTERS[id].channels.map(c=>c.id)){
    const changed=await compose(set,{...colors,[channel]:colors[channel]==='#202433'?'#eee5d4':'#202433'},type,loader),after=pixels(changed),mask=document.createElement('canvas');mask.width=original.width;mask.height=original.height;mask.getContext('2d').drawImage(images[channel],0,0);const own=pixels(mask);let changedPixels=0,unrelated=0;
    for(let i=0;i<base.length;i+=4){const d=Math.abs(base[i]-after[i])+Math.abs(base[i+1]-after[i+1])+Math.abs(base[i+2]-after[i+2]);if(own[i+3]>200&&d>15)changedPixels++;if(own[i+3]===0&&d>2)unrelated++;}
    if(changedPixels<100||unrelated>0)throw Error(id+' '+type+' '+channel+' changes '+changedPixels+' unrelated '+unrelated);counts[channel]=changedPixels;
   }
   if(type==='selection')shots[id]=original.toDataURL();if(id==='sovereign'&&type==='portrait'){const run={version:4,rules:'2026.10-v15-autotarget-squad',phase:0,name:'Material Proof',title:'The Unbound',monsterId:id,colors,seed:77,duration:610,score:2192025,kills:25359,wave:21,elites:0,titans:0,multi:30,peak:5,feats:{},ended:'2026-10-08T16:00:00Z',reason:'overwhelmed',release:4,build:'0123456789abcdef'};shots.card=resultCard(run,original).toDataURL();}
   rows.push({id,type,counts});for(const image of Object.values(images))image.src='';original.width=original.height=1;
  }return {rows,shots};
 });
 for(const [id,url] of Object.entries(proof.shots))await writeFile('test-results/material-'+id+'-lycan-v35.png',Buffer.from(url.split(',')[1],'base64'));await writeFile('test-results/material-colors-lycan-v35.json',JSON.stringify(proof.rows,null,2));assert.equal(proof.rows.length,4);assert.deepEqual(errors,[]);console.log(proof.rows);
}finally{await browser.close();}
