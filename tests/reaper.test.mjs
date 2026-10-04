import test from 'node:test';import assert from 'node:assert/strict';
import {championAvailable} from '../src/champion-access.ts';import {normalizeProfile,recordProgress} from '../src/profile.ts';import {STAGE_GATES} from '../src/stage-access.ts';import {Game} from '../src/simulation.ts';import {harvestLife,scytheWave,updateReaper,reaperAim,scythePath,reaperTarget} from '../src/reaper.ts';import {rulesForStage,COURT_RULES,REAPER_RULES,chooseCourtUpgrade} from '../src/stage-two.ts';import {courtMission} from '../src/stage-two.ts';import {encodeRun,decodeRun} from '../src/run-code.ts';
const input={x:0,y:0,aimX:-600,aimY:0,aiming:true},make=phase=>new Game(77,{monsterId:'reaper'},phase);
test('Reaper uses the shared Stage 2 gate, including date and same-champion progress; testing bypasses it',()=>{
 const p=normalizeProfile(null),opened=Date.parse(STAGE_GATES[0].opensAt);
 assert.equal(championAvailable('reaper',p.progress,opened),false);assert.equal(championAvailable('reaper',p.progress,null,true),true);
 for(let n=1;n<=7;n++)recordProgress(p,{id:'gate'+n,monsterId:'titan',phase:0,reason:'overwhelmed',values:{seconds:510,kills:15000},best:{seconds:510}},true,new Date(Date.UTC(2026,9,n,16)));
 assert.equal(championAvailable('reaper',p.progress,opened-1),false);assert.equal(championAvailable('reaper',p.progress,null),false);assert.equal(championAvailable('reaper',p.progress,opened),true);
 for(const id of ['titan','devourer','sovereign','calamity','overlord'])assert.equal(championAvailable(id,p.progress,null),true);
 assert.equal(rulesForStage(0,false,'sovereign'),'2026.10-v15-autotarget-squad');assert.equal(rulesForStage(0,false,'reaper'),REAPER_RULES);assert.equal(rulesForStage(1,false,'reaper'),COURT_RULES);
});
test('curved scythes cross off-axis prey once and spin in their curve direction',()=>{
 const g=make(0);scytheWave(g,0,500,28,100);const w=g.scytheWaves[0],middle=scythePath(w,.5);assert.ok(middle.y>40);const e=g.spawn('brute');Object.assign(e,{...middle,hp:10000,maxHp:10000});g.rebuildGrid();updateReaper(g,.34);assert.equal(e.hp,9900);const hp=e.hp;updateReaper(g,.01);assert.equal(e.hp,hp);assert.ok(w.rotation<0);
 const left=make(0);left.movementAngle=Math.PI;left.facingX=-1;scytheWave(left,0,500,28,100);assert.ok(scythePath(left.scytheWaves[0],.5).y<0);
});
test('Eclipse prioritizes captains over nearby fodder and keeps a damaging near aura each pulse',()=>{
 const g=make(0),fodder=g.spawn('brute'),captain=g.spawn('brute');Object.assign(fodder,{x:90,y:0,hp:10000,maxHp:10000});Object.assign(captain,{x:400,y:80,hp:10000,maxHp:10000,court:{role:'captain'}});g.rebuildGrid();assert.equal(reaperTarget(g,700,true),captain);assert.ok(g.cast(3));updateReaper(g,.01);assert.ok(fodder.hp<10000);assert.deepEqual(g.scytheWaves[0].end,{x:400,y:80});
});
test('Blink taps choose visible distant prey and reject empty, offscreen and invalid taps without cooldown',()=>{
 const g=make(0),near=g.spawn('brute'),chosen=g.spawn('brute');Object.assign(near,{x:90,y:0,hp:10000,maxHp:10000});Object.assign(chosen,{x:600,y:200,hp:10000,maxHp:10000});g.rebuildGrid();for(const point of [{x:400,y:-200},{x:NaN,y:0},{x:900,y:0}]){assert.equal(g.cast(1,point),false);assert.equal(g.cooldowns[1],0);}assert.equal(g.cast(1,{x:600,y:200}),true);assert.ok(Math.hypot(g.player.x-chosen.x,g.player.y-chosen.y)<100);assert.ok(chosen.hp<9300);assert.equal(near.hp,10000);
 const released=make(1);released.player.x=released.player.y=0;const enemy=released.spawn('brute');Object.assign(enemy,{x:200,y:0,hp:100000,maxHp:100000});released.enemies.forEach(e=>{if(e!==enemy)e.active=false;});released.rebuildGrid();released.court.pending=1;chooseCourtUpgrade(released,'power');assert.ok(released.cast(1,{x:200,y:0}));assert.ok(100000-enemy.hp>2000);
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

test('Reaper skin defaults without discarding old colors, survives transfer and authenticates in old/new run codes',async()=>{
 const {createIdentity}=await import('../src/identity.ts'),{progressExport,parseProgressExport}=await import('../src/progress-transfer.ts');const old={primary:'#202433',secondary:'#49b3aa',accent:'#d9af61',power:'#8862c7'};
 const p=normalizeProfile({version:3,identity:{monsterId:'reaper',colors:old},palettes:{reaper:old}});assert.equal(p.identity.colors.skin,'#f3dfd1');assert.equal(p.identity.colors.secondary,old.secondary);p.identity.colors.skin='#784c35';p.palettes.reaper={...p.identity.colors};assert.equal(parseProgressExport(progressExport(p)).identity.colors.skin,'#784c35');
 const base={version:4,rules:REAPER_RULES,phase:0,name:'x',title:'',monsterId:'reaper',colors:p.identity.colors,seed:77,duration:60,score:0,kills:0,wave:3,elites:0,titans:0,multi:0,peak:1,feats:{},ended:'2026-10-08T16:00:00Z',reason:'retired',release:0,build:'0123456789abcdef'};assert.deepEqual((await decodeRun(await encodeRun(base))).colors,base.colors);const historical={...base,rules:'2026.10-v25-reaper',colors:old};assert.deepEqual((await decodeRun(await encodeRun(historical))).colors,old);await assert.rejects(encodeRun({...base,colors:{...old,skin:'invalid'}}));assert.equal(createIdentity({monsterId:'sovereign',colors:p.identity.colors}).colors.skin,undefined);
});
