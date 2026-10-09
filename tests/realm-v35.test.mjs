import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../src/simulation.ts';
import {MONSTERS,ABILITIES} from '../src/content-monsters.ts';
import {FIFTH_POWERS} from '../src/relic-powers.ts';
import {parkourLanding} from '../src/lycanthrope.ts';
import {REALM_GROTTOS,insideRealm} from '../src/titan-realm-map.ts';
import {realmDamage,claimRelic,equipRelic,restoreNativePower,realmProgress,realmSummary,updateTitanRealm,realmEnemyMotion,TITAN_REALM} from '../src/stage-three.ts';
import {normalizeProfile,recordProgress,updateRecords} from '../src/profile.ts';
import {gateForStage,masteryProgress,gateChallengeComplete,stageAccess,MASTERY_RELICS} from '../src/stage-access.ts';
import {titleVisible,defaultContentAccess} from '../src/content-visibility.ts';
import {TITLES} from '../src/content-titles.ts';
import {encodeRun,decodeRun} from '../src/run-code.ts';
const idle={x:0,y:0,aimX:0,aimY:0,aiming:false};
test('new guardians reserve seats in a full crowd and titan warnings remain strictly bounded',()=>{
 const g=new Game(9,{monsterId:'sovereign'},2);g.seedOpening();const shrine=REALM_GROTTOS[0];g.player.x=shrine.x;g.player.y=shrine.y;g.realm.spawnTimer=100;for(let i=1;i<TITAN_REALM.maxCrowd;i++){const e=g.spawn('thrall');e.realm={role:'attendant',homeX:0,homeY:0,variant:4};}assert.equal(g.alive,64);updateTitanRealm(g,0);assert.equal(g.enemies.filter(e=>e.active&&e.realm?.role==='guardian').length,3);assert.equal(g.alive,64);
 g.player.x=0;g.player.y=200;g.realm.engaged=true;g.realm.boss.timer=0;g.realm.attackIndex=2;g.realm.zones=Array.from({length:11},()=>({x:0,y:0,radius:100,warning:100,life:1,damage:1,hit:false}));realmEnemyMotion(g,g.realm.boss,1/60);realmEnemyMotion(g,g.realm.boss,1);assert.equal(g.realm.zones.length,12);
});
test('restoring Titan native powers keeps the stage Fissure kit',()=>{
 const g=new Game(3,{monsterId:'titan'},2);g.seedOpening();const s=REALM_GROTTOS[0];g.player.x=s.x;g.player.y=s.y-150;g.realm.shrines[0].cleared=true;g.realm.relics.find(r=>r.shrine===0).shrine=null;g.powers[2]=ABILITIES.soulwrit;g.relicOwners[2]='overlord';assert.ok(restoreNativePower(g,2));assert.equal(g.powers[2].id,'faultline');
});
test('Bloodmoon Reign visits different visible enemies and cannot chain beyond its original view',()=>{
 const g=new Game(3,{monsterId:'lycanthrope'},1);g.seedOpening();g.court.initialized=true;g.court.camps=[];g.enemies.forEach(e=>e.active=false);g.alive=0;g.player.x=g.player.y=0;g.targetView={x:500,y:300};
 const prey=[100,200,300].map(x=>{const e=g.spawn('thrall');Object.assign(e,{x,y:0,hp:100000,maxHp:100000});return e;});const remote=g.spawn('thrall');Object.assign(remote,{x:650,y:0,hp:100000,maxHp:100000});g.rebuildGrid();assert.ok(g.cast(3));for(let i=0;i<60;i++)g.update(1/60,idle);assert.ok(prey.every(e=>e.hp<100000));assert.equal(remote.hp,100000);assert.ok(g.moonFuryVisited.size<=prey.length);
});
test('native core powers expose guardians for all seven bodies; basic hits and foreign powers cannot finish a warded guardian',()=>{
 for(const id of Object.keys(MONSTERS)){
  const g=new Game(17,{monsterId:id},2);g.seedOpening();const e=g.spawn('brute');Object.assign(e,{x:0,y:0,hp:1000,maxHp:1000,realm:{role:'guardian',shrine:0,homeX:0,homeY:0,variant:0}});
  assert.equal(realmDamage(g,e,10000,'direct'),900);e.hp=100;assert.equal(realmDamage(g,e,10000,'direct'),0);
  g.realm.castNature=id;g.realm.castAbility=g.powers[1].id;assert.equal(realmDamage(g,e,10000,'direct'),id==='titan'?17000:10000);assert.equal(e.realm.exposedUntil,g.time+5);
 }
});
test('native attacks cannot open titan layers even when they belong to the required nature',()=>{
 for(const id of Object.keys(MONSTERS)){const g=new Game(1,{monsterId:id},2);g.seedOpening();g.player.x=g.player.y=0;g.realm.engaged=true;g.realm.pattern[0]=id;g.realm.castNature=id;g.realm.castAbility=g.powers[2].id;assert.equal(realmDamage(g,g.realm.boss,1000,'direct'),0);const r=g.realm.relics.find(r=>r.nature===id);r.ability=FIFTH_POWERS[id];r.shrine=null;assert.equal(realmDamage(g,g.realm.boss,1000,'relic:'+id+':'+r.ability),1000);}
});
test('known relics can only be equipped at their home altar and retain their decoration',()=>{
 const g=new Game(7,{monsterId:'titan'},2),r=g.realm.relics[0],other=g.realm.relics[1];for(const shrine of g.realm.shrines)shrine.cleared=true;r.known=other.known=true;
 const at=REALM_GROTTOS[other.shrine];g.player.x=at.x;g.player.y=at.y-150;assert.equal(equipRelic(g,r.id,0),false);
 const home=REALM_GROTTOS[r.shrine];g.player.x=home.x;g.player.y=home.y-150;const altar=r.shrine;assert.ok(claimRelic(g,altar));assert.ok(equipRelic(g,r.id,0));assert.equal(r.shrine,null);assert.equal(g.realm.shrines[altar].decor,'dormant');
});
test('Moonstrider Vault crosses a gap but cannot land in a chasm or outside the map',()=>{
 const g=new Game(1,{monsterId:'lycanthrope'},2);g.player.x=530;g.player.y=50;const destination={x:380,y:130};assert.equal(insideRealm(480,100,23),false);assert.ok(insideRealm(destination.x,destination.y,23));assert.ok(parkourLanding(g,destination));assert.equal(parkourLanding(g,{x:600,y:600}),null);assert.equal(parkourLanding(g,{x:NaN,y:0}),null);assert.equal(parkourLanding(g,{x:g.player.x,y:g.player.y}),null);
 g.player.x=1920;g.player.y=1536;assert.equal(parkourLanding(g,{x:2600,y:1536}),null);
});
test('Howl fears lesser enemies, preserves boss and guardian behavior, and ended games never regenerate',()=>{
 const g=new Game(1,{monsterId:'lycanthrope'},2);g.seedOpening();g.player.x=0;g.player.y=100;const lesser=g.spawn('hound'),guardian=g.spawn('brute');Object.assign(lesser,{x:0,y:150,hp:10000,maxHp:10000});Object.assign(guardian,{x:0,y:140,realm:{role:'guardian',shrine:0,homeX:0,homeY:140,variant:0}});g.rebuildGrid();g.cast(1);assert.ok(lesser.fearedUntil>g.time);assert.equal(guardian.fearedUntil,undefined);assert.equal(g.realm.boss.fearedUntil,undefined);g.ended=true;g.player.hp=100;g.update(1,idle);assert.equal(g.player.hp,100);
});
test('Stage 3 records and seven-nature passage accumulate idempotently with one champion and no daily limits',()=>{
 const p=normalizeProfile(null),gate=gateForStage(3);for(let i=0;i<8;i++){
  const values={seconds:600,realmClears:1,realmCleanClears:1,...Object.fromEntries(MASTERY_RELICS.map(r=>[r.metric,1]))},run={id:'deep'+i,monsterId:'titan',phase:2,values,best:{}};
  recordProgress(p,run,false);recordProgress(p,run,true);recordProgress(p,run,true);
 }assert.deepEqual(masteryProgress(gate,p.progress,'titan').map(r=>r.value),[8,8,7]);assert.ok(gateChallengeComplete(gate,p.progress));assert.ok(p.progress.titles.deepGatebreaker);assert.equal(p.progress.archetypes.titan.realmClears,8);assert.equal(stageAccess(3,p.progress,Date.parse('2026-10-30')), 'future');
 const saved=normalizeProfile(JSON.parse(JSON.stringify(p)));assert.equal(saved.progress.titles.deepGatebreaker,p.progress.titles.deepGatebreaker);
 const split=normalizeProfile(null);split.progress.archetypes.titan.realmClears=8;split.progress.archetypes.devourer.realmCleanClears=3;for(const r of MASTERY_RELICS)split.progress.archetypes.devourer[r.metric]=1;assert.equal(gateChallengeComplete(gate,split.progress),false);
});
test('Stage 3 titles and Lycanthrope stay concealed from Stage 1 and Stage 2 players',()=>{
 const access={champion:id=>id!=='lycanthrope',stage:phase=>phase<2};for(const t of TITLES.filter(t=>t.stage===2||t.requirements.some(r=>r.scope==='lycanthrope'||r.scope==='stage:deepGatebreaker')))assert.equal(titleVisible(t,access),false,t.id);
 assert.ok(TITLES.filter(t=>titleVisible(t,defaultContentAccess(true))).length>TITLES.filter(t=>titleVisible(t,access)).length);
});
test('stage-specific persistent records never earn in the wrong scenario and prior records survive migration',()=>{
 const p=normalizeProfile(null),g=new Game(7,{monsterId:'titan'},2);assert.deepEqual(updateRecords(p,{realmClear:1,...g.score.metrics()},g.identity,undefined,0),[]);assert.ok(updateRecords(p,{realmClear:1,...g.score.metrics()},g.identity,undefined,2).includes('realmClear'));assert.ok(normalizeProfile(JSON.parse(JSON.stringify(p))).records.realmClear.unlockedAt);
});
test('shipped v34 relic result codes remain valid after fifth-power rules change',async()=>{
 const g=new Game(1,{monsterId:'sovereign'},2);g.seedOpening();g.update(1/60,idle);const run={version:4,rules:'2026.10-v34-titan-test',phase:2,name:g.identity.name,title:g.identity.title,monsterId:'sovereign',colors:g.identity.colors,seed:g.seed,duration:0,score:0,kills:0,wave:1,elites:0,titans:0,multi:0,peak:1,feats:{},ended:'2026-10-08T12:00:00Z',reason:'retired',release:4,build:'1234567890abcdef',testing:true,realm:realmSummary(g)};delete run.realm.precision;assert.equal((await decodeRun(await encodeRun(run))).rules,run.rules);
});
