import {execFileSync} from 'node:child_process';import {mkdir,writeFile} from 'node:fs/promises';import {pathToFileURL} from 'node:url';import {resolve} from 'node:path';import assert from 'node:assert/strict';
import {Game} from '../src/simulation.ts';import {spawnCourtHunt,chooseCourtUpgrade} from '../src/stage-two.ts';
const base='63ed42f64b5bed443d44d2f2b08bca62c1f4e797',dir=resolve('test-results/v34-baseline/src');await mkdir(dir,{recursive:true});
for(const file of execFileSync('git',['ls-tree','-r','--name-only',base,'src'],{encoding:'utf8'}).trim().split(/\r?\n/).filter(f=>f.endsWith('.ts')))await writeFile(resolve(dir,file.slice(4)),execFileSync('git',['show',base+':'+file]));
const {Game:Previous}=await import(pathToFileURL(resolve(dir,'simulation.ts')).href),oldCourt=await import(pathToFileURL(resolve(dir,'stage-two.ts')).href);
const keys=['rng','time','wave','ended','player','score','alive','enemies','servants','shots','bolts','clawWaves','debris','fields','shield','sustainStats','cooldowns','court'];
const snapshot=g=>JSON.stringify(Object.fromEntries(keys.map(k=>[k,g[k]])));
for(const phase of [0,1])for(const id of ['overlord','calamity','devourer','titan','sovereign','reaper']){
 const a=new Previous(77,{monsterId:id},phase),b=new Game(77,{monsterId:id},phase);for(const g of [a,b])g.seedOpening();if(phase===1){oldCourt.spawnCourtHunt(a,0);spawnCourtHunt(b,0);}
 for(let f=0;f<36000&&!a.ended;f++){const angle=a.time*.17,input={x:Math.cos(angle),y:Math.sin(angle),aimX:a.player.x+400,aimY:a.player.y,aiming:true};for(const g of [a,b]){if(g.court?.pending)(g===a?oldCourt.chooseCourtUpgrade:chooseCourtUpgrade)(g,'power');g.update(1/60,input);if(f%12===0)for(let i=0;i<4;i++)g.cast(i);}}
 assert.equal(snapshot(b),snapshot(a),id+' Stage '+(phase+1)+' changed');console.log(id+' Stage '+(phase+1)+': exact v34 state preserved ('+Math.round(a.time)+'s)');
}
