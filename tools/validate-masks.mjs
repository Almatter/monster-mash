import fs from 'node:fs/promises';import assert from 'node:assert/strict';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),sharp=require(process.env.SHARP_PATH||'C:/Users/novam/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const catalog=JSON.parse(await fs.readFile('public/assets/catalog.json','utf8'));
const dimensions={selection:[768,1024],portrait:[512,512],cutin:[1024,512],gameplay:[1536,1280]};
let checked=0;for(const [monster,entry] of Object.entries(catalog))for(const [type,set] of Object.entries(entry)){
 const [w,h]=dimensions[type]||[];if(!w)continue;
 const base=await sharp('public/'+set.base).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 assert.equal(base.info.width,w,monster+' '+type+' width');assert.equal(base.info.height,h,monster+' '+type+' height');
 if(type==='gameplay'){
  let margin=256;
  for(let row=0;row<5;row++)for(let frame=0;frame<[4,6,6,2,6][row];frame++){
   let pixels=0;
   for(let y=0;y<256;y++)for(let x=0;x<256;x++)if(base.data[((row*256+y)*w+frame*256+x)*4+3]>40){pixels++;margin=Math.min(margin,x,y,255-x,255-y);}
   assert.ok(pixels>100,monster+' missing animation frame '+row+':'+frame);
  }
  assert.ok(margin>0,monster+' silhouette touches an atlas frame boundary');
  console.log(monster+' minimum gameplay crop margin: '+margin+'px');
 }
 const counts={};
 for(const channel of ['primary','secondary','accent','power']){
  assert.ok(set[channel],monster+' '+type+' missing '+channel);
  const mask=await sharp('public/'+set[channel]).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  assert.equal(mask.info.width,w,monster+' '+type+' '+channel+' width');assert.equal(mask.info.height,h,monster+' '+type+' '+channel+' height');
  let covered=0,outside=0,overAlpha=0,chroma=0,clearColor=0,darkLines=0,maxStraight=0;
  for(let y=1;y<h;y++){let straight=0;for(let x=0;x<w;x++){
   const i=(y*w+x)*4,a=mask.data[i+3],baseA=base.data[i+3];
   if(a>8){covered++;if(baseA<2)outside++;if(a>baseA+8)overAlpha++;if(Math.max(mask.data[i],mask.data[i+1],mask.data[i+2])-Math.min(mask.data[i],mask.data[i+1],mask.data[i+2])>2)chroma++;if(base.data[i]+base.data[i+1]+base.data[i+2]<90&&a>160)darkLines++;}
   else if(a===0&&(mask.data[i]||mask.data[i+1]||mask.data[i+2]))clearColor++;
   if(a>170&&mask.data[i-4*w+3]<4)straight++;
  }maxStraight=Math.max(maxStraight,straight);}
  assert.ok(covered>100,monster+' '+type+' '+channel+' empty');
  assert.ok(outside<covered*.02+300,monster+' '+type+' '+channel+' spills outside base: '+outside);
  assert.ok(overAlpha<covered*.03+300,monster+' '+type+' '+channel+' exceeds base alpha: '+overAlpha);
  assert.ok(chroma<covered*.002+20,monster+' '+type+' '+channel+' is not grayscale: '+chroma);
  // Fully transparent RGB is ignored by Canvas; alpha containment is the visible contract.
  assert.ok(maxStraight<w*.4,monster+' '+type+' '+channel+' has a rigid horizontal mask edge: '+maxStraight);
  counts[channel]=covered;
 }
 checked++;console.log(monster,type,counts);
}
assert.equal(checked,20);console.log('Validated 20 registered art sets / 80 tint masks: dimensions, transparency, containment, grayscale, and abrupt horizontal edges.');
