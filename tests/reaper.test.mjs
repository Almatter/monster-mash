import test from 'node:test';import assert from 'node:assert/strict';
import {championAvailable} from '../src/champion-access.ts';import {normalizeProfile,recordProgress} from '../src/profile.ts';import {STAGE_GATES} from '../src/stage-access.ts';import {Game} from '../src/simulation.ts';import {harvestLife,scytheWave,updateReaper,reaperAim} from '../src/reaper.ts';import {rulesForStage,COURT_RULES,REAPER_RULES,chooseCourtUpgrade} from '../src/stage-two.ts';import {courtMission} from '../src/stage-two.ts';import {encodeRun,decodeRun} from '../src/run-code.ts';
const input={x:0,y:0,aimX:-600,aimY:0,aiming:true},make=phase=>new Game(77,{monsterId:'reaper'},phase);
test('Reaper uses the shared Stage 2 gate, including date and same-champion progress; testing bypasses it',()=>{
 const p=normalizeProfile(null),opened=Date.parse(STAGE_GATES[0].opensAt);
 assert.equal(championAvailable('reaper',p.progress,opened),false);assert.equal(championAvailable('reaper',p.progress,null,true),true);
 for(let n=1;n<=7;n++)recordProgress(p,{id:'gate'+n,monsterId:'titan',phase:0,reason:'overwhelmed',values:{seconds:510,kills:15000},best:{seconds:510}},true,new Date(Date.UTC(2026,9,n,16)));
 assert.equal(championAvailable('reaper',p.progress,opened-1),false);assert.equal(championAvailable('reaper',p.progress,null),false);assert.equal(championAvailable('reaper',p.progress,opened),true);
 for(const id of ['titan','devourer','sovereign','calamity','overlord'])assert.equal(championAvailable(id,p.progress,null),true);
 assert.equal(rulesForStage(0,false,'sovereign'),'2026.10-v15-autotarget-squad');assert.equal(rulesForStage(0,false,'reaper'),REAPER_RULES);assert.equal(rulesForStage(1,false,'reaper'),COURT_RULES);
});
test('ranged scythe aim selects nearby prey and piercing waves cannot hit the same prey twice',()=>{
 const g=make(0),a=g.spawn('brute'),b=g.spawn('brute');Object.assign(a,{x:150,y:0,hp:10000,maxHp:10000});Object.assign(b,{x:260,y:0,hp:10000,maxHp:10000});g.rebuildGrid();assert.equal(reaperAim(g,660),0);g.player.angle=Math.PI;scytheWave(g,0,500,28,100);updateReaper(g,.3);const hp=a.hp;assert.equal(hp,9900);assert.equal(b.hp,9900);updateReaper(g,.1);assert.equal(a.hp,hp);assert.equal(b.hp,9900);
});
test('all scythe damage shares a bounded healing budget, with useful Stage 2 sustain and no healing on misses',()=>{
 for(const phase of [0,1]){const g=make(phase);g.player.hp=100;const cap=42+5*g.release;harvestLife(g,100000);harvestLife(g,100000);assert.ok(Math.abs(g.player.hp-100-cap*(phase===1?.4:1))<1e-6);g.time=1;harvestLife(g,100000);assert.ok(Math.abs(g.player.hp-100-2*cap*(phase===1?.4:1))<1e-6);const hp=g.player.hp;updateReaper(g,.1);assert.equal(g.player.hp,hp);}
});
test('Eclipse continues to launch waves without a basic target; duration boon extends its active state',()=>{
 const g=make(1);g.update(1/60,input);g.enemies.forEach(e=>e.active=false);g.alive=0;g.rebuildGrid();assert.ok(g.cast(3));assert.equal(g.reaperStorm,8);updateReaper(g,.01);assert.equal(g.scytheWaves.length,2);const upgraded=make(1);upgraded.court.pending=1;assert.ok(chooseCourtUpgrade(upgraded,'duration'));upgraded.update(1/60,input);assert.ok(upgraded.cast(3));assert.ok(Math.abs(upgraded.reaperStorm-9.6)<1e-6);
});
test('Reaper current result codes round-trip in either stage without using historical champion rules',async()=>{
 for(const phase of [0,1]){const g=make(phase),r={version:4,rules:rulesForStage(phase,false,'reaper'),phase,...g.identity,seed:77,duration:60,score:0,kills:0,wave:3,elites:0,titans:0,multi:0,peak:1,feats:{},ended:'2026-10-08T16:00:00Z',reason:'retired',release:phase?4:0,build:'0123456789abcdef',...(phase?{court:g.court.stats,mission:courtMission(g),testing:false}:{})};assert.deepEqual(await decodeRun(await encodeRun(r)),r);}
});
test('Reaper mastery belongs to Reaper and persists across both stages and device saves',()=>{
 const p=normalizeProfile(null);for(let i=0;i<5;i++)recordProgress(p,{id:'other'+i,monsterId:'titan',phase:0,values:{seconds:60,reaped:10000,graveshift:2000},best:{seconds:60}},true);assert.equal(p.progress.titles.reaper1,undefined);
 for(let i=0;i<5;i++)recordProgress(p,{id:'scythe'+i,monsterId:'reaper',phase:i%2,values:{seconds:60,reaped:1000,graveshift:400},best:{seconds:60}},true);
 assert.ok(p.progress.titles.reaper1);assert.ok(p.progress.titles.reaperBlink);const restored=normalizeProfile(JSON.parse(JSON.stringify(p)));assert.deepEqual(restored.progress.titles,p.progress.titles);assert.equal(restored.progress.archetypes.reaper.reaped,5000);
});
