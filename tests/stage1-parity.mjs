import assert from 'node:assert/strict';import {execFileSync} from 'node:child_process';import {mkdir,writeFile} from 'node:fs/promises';import {resolve} from 'node:path';import {pathToFileURL} from 'node:url';import {createHash} from 'node:crypto';
import {Game} from '../src/simulation.ts';import {MONSTERS} from '../src/content-monsters.ts';
// Compare against the deployed v15 commit, never against a mutable working tree or future HEAD.
const base='5aae6a743281381f3759ebcbd0d892f539bdcd9f',dir=resolve('test-results/stage1-deployed-baseline/src');await mkdir(dir,{recursive:true});
const files=execFileSync('git',['ls-tree','-r','--name-only',base,'src'],{encoding:'utf8'}).trim().split(/\r?\n/).filter(f=>f.endsWith('.ts'));
for(const file of files)await writeFile(resolve(dir,file.slice(4)),execFileSync('git',['show',base+':'+file]));
const {Game:Previous}=await import(pathToFileURL(resolve(dir,'simulation.ts')).href);
const digest=g=>createHash('sha256').update(JSON.stringify({rng:g.rng,time:g.time,wave:g.wave,ended:g.ended,player:g.player,score:g.score,alive:g.alive,enemies:g.enemies,servants:g.servants,shots:g.shots,bolts:g.bolts,clawWaves:g.clawWaves,debris:g.debris,fields:g.fields,shield:g.shield,sustain:g.sustainStats,cooldowns:g.cooldowns})).digest('hex');
for(const id of Object.keys(MONSTERS))for(const seed of [77,444]){
 const a=new Previous(seed,{monsterId:id},0),b=new Game(seed,{monsterId:id},0),input={x:0,y:0,aimX:400,aimY:0,aiming:true};for(const g of [a,b]){g.update(1/60,input);g.seedOpening();}
 for(let frame=0;frame<600*60&&!a.ended;frame++){const angle=a.time*.17,x=Math.cos(angle),y=Math.sin(angle),next={x,y,aimX:a.player.x+400,aimY:a.player.y,aiming:true};for(const g of [a,b]){g.update(1/60,next);if(frame%12===0)for(let i=0;i<4;i++){if(g.powers[i].effect==='devour'&&g.player.hp>g.player.maxHp*.8)continue;g.cast(i);}}}
 assert.equal(digest(b),digest(a),id+' seed '+seed+' changed Stage 1 state');console.log(id+' seed '+seed+': exact deployed Stage 1 state preserved through '+Math.round(a.time)+'s');
}
