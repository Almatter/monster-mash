import test from 'node:test';import assert from 'node:assert/strict';
import {Game} from '../src/simulation.ts';
import {COLOSSUS,summonColossus,updateColossus,colossusVolley,colossusEnemy,colossusSpawnPoint,colossusMotion,colossusLocation} from '../src/ashen-colossus.ts';
import {spawnCourtHunt,chooseCourtUpgrade,courtMission,COURT_TEST_RULES} from '../src/stage-two.ts';
import {insideCourt,courtRegionAt,COURT_SITES,courtSteer} from '../src/court-map.ts';import {reaperTarget} from '../src/reaper.ts';
import {encodeRun,decodeRun,validateRun} from '../src/run-code.ts';import {resultText} from '../src/results.ts';
function historical(r,rules){const {feats,...scoring}=r.mission.scoring;return {...r,rules,testing:rules.endsWith('-test'),score:r.score-(feats||0),mission:{...r.mission,scoring}};}
const input={x:0,y:0,aimX:0,aimY:0,aiming:false};
function eligible(id='devourer',time=420){const g=new Game(77,{monsterId:id},1);g.time=time;g.wave=Math.floor(time/30)+1;const spawn=g.spawn;g.spawn=function(kind,...a){return kind==='titan'?undefined:spawn.call(this,kind,...a);};for(let n=0;n<8;n++){assert.ok(spawnCourtHunt(g));const e=g.enemies.find(e=>e.active&&e.court?.role==='captain');g.player.x=e.x-70;g.player.y=e.y;g.damage(e,1e8,'execute');assert.ok(chooseCourtUpgrade(g,['power','power','power','recharge','recharge','recharge','haste','haste'][n]));}g.spawn=spawn;g.court.colossus.retryAt=0;g.player.x=g.player.y=0;g.rebuildGrid();return g;}
const record=g=>({version:4,rules:COURT_TEST_RULES,phase:1,...g.identity,seed:g.seed,duration:Math.ceil(g.time),score:g.score.dominance,kills:g.score.kills,wave:Math.floor(g.time/30)+1,elites:g.score.elites,titans:g.score.titans,multi:g.score.largestMulti,peak:g.score.peak,feats:{...g.score.feats},ended:'2026-10-04T18:00:00Z',reason:g.court.cleared?'cleared':'retired',release:g.release,build:'0123456789abcdef',court:{...g.court.stats},mission:courtMission(g),testing:true});
test('colossus is Stage 2 only, arrives once after eight captains before 9:00, on walkable ground',()=>{for(const time of [0,539.99]){const g=eligible('titan',time);assert.ok(summonColossus(g));const e=colossusEnemy(g);assert.ok(insideCourt(e.x,e.y,62));assert.ok(Math.hypot(e.x,e.y)>180);assert.equal(e.maxHp,COLOSSUS.hp);assert.equal(g.court.colossus.expiresAt,time+180);assert.equal(summonColossus(g),false);}for(const time of [540,720,1200])assert.equal(summonColossus(eligible('reaper',time)),false);const g=eligible();g.court.stats.captains=7;assert.equal(summonColossus(g),false);const s1=new Game(77,{},0);assert.equal(summonColossus(s1),false);});
test('volleys place several small fixed zones with readable warnings, staggered impacts and open gaps',()=>{const g=eligible();summonColossus(g);const e=colossusEnemy(g);for(let i=0;i<3;i++){g.court.colossus.zones.length=0;colossusVolley(g,e);const zones=g.court.colossus.zones;assert.ok(zones.length>=3);assert.ok(zones.every(z=>z.radius===COLOSSUS.radius&&z.impactAt-g.time>=COLOSSUS.warning-.000001));assert.ok(zones.every((z,n)=>n===0||z.impactAt>zones[n-1].impactAt));const positions=zones.map(z=>[z.x,z.y]);g.player.x+=40;g.player.y+=50;g.time+=.5;updateColossus(g);assert.deepEqual(zones.map(z=>[z.x,z.y]),positions);}});
test('warning is harmless, actual impact hurts; leaving its footprint avoids damage and expiry clears hazards',()=>{const g=eligible();summonColossus(g);colossusVolley(g,colossusEnemy(g));const z=g.court.colossus.zones[0];g.player.x=z.x;g.player.y=z.y;g.player.invuln=0;const hp=g.player.hp;g.time=z.impactAt-.01;updateColossus(g);assert.equal(g.player.hp,hp);g.time=z.impactAt;updateColossus(g);assert.ok(g.player.hp<hp);const health=g.player.hp;g.player.y-=110;g.player.invuln=0;g.time+=.45;updateColossus(g);assert.equal(g.player.hp,health);const score=g.score.dominance;g.time=g.court.colossus.expiresAt;updateColossus(g);assert.equal(g.court.colossus.status,'expired');assert.equal(g.court.colossus.zones.length,0);assert.equal(colossusEnemy(g),undefined);assert.equal(g.score.dominance,score);assert.equal(summonColossus(g),false);});
test('colossus kills reward a fixed 1.2M once, outside the minion budget, roundtrip MM4; all fabricated rewards rejected',async()=>{for(const id of ['devourer','titan','sovereign','calamity','overlord','reaper']){const g=eligible(id);assert.ok(summonColossus(g));const e=colossusEnemy(g);g.score.award(1e9);const before=g.score.dominance,combat=g.court.scoring.combat;g.time+=10;assert.ok(g.damage(e,1e9,'direct'));assert.equal(g.score.dominance-before,COLOSSUS.reward);assert.equal(g.court.scoring.combat,combat);assert.equal(g.court.stats.captains,8);assert.equal(g.court.colossus.status,'defeated');assert.equal(g.score.titans,1);assert.equal(g.damage(e,1e9,'direct'),false);const r=record(g),decoded=await decodeRun(await encodeRun(r));assert.deepEqual(decoded.mission.colossus,r.mission.colossus);assert.match(resultText(r),/Ashen Colossus slain · \+1,200,000/);for(const bad of [{reward:1200001},{spawnedAt:540},{defeatedAt:600},{spawnedAt:435},{reward:0},{evil:1}])assert.throws(()=>validateRun({...r,mission:{...r.mission,colossus:{...r.mission.colossus,...bad}}}));assert.throws(()=>validateRun({...r,rules:'2026.10-v27-court-test'}));}});
test('no late-hit reward, no forced boss objective, captain ten still finishes the match',()=>{const g=eligible();summonColossus(g);const e=colossusEnemy(g);g.time=e.colossus.expiresAt;assert.equal(g.damage(e,1e9,'direct'),false);updateColossus(g);validateRun(record(g));const skip=eligible();summonColossus(skip);const boss=colossusEnemy(skip);for(let n=0;n<2;n++){spawnCourtHunt(skip);skip.damage(skip.enemies.find(e=>e.active&&e.court?.role==='captain'),1e9,'execute');if(n===0)chooseCourtUpgrade(skip,'haste');}assert.ok(skip.ended&&skip.court.cleared);assert.equal(boss.active,false);assert.equal(skip.court.colossus.status,'departed');assert.equal(skip.court.colossus.zones.length,0);assert.equal(skip.score.titans,0);validateRun(record(skip));});
test('automatic Reaper attacks prefer the colossus to captains; volleys cannot grow without bound',()=>{const g=eligible('reaper');summonColossus(g);const e=colossusEnemy(g),capt=g.spawn('brute');g.player.x=e.x-200;g.player.y=e.y;Object.assign(capt,{x:g.player.x+100,y:g.player.y,court:{role:'captain',guard:0}});g.rebuildGrid();assert.equal(reaperTarget(g,700,true),e);for(let i=0;i<20;i++)colossusVolley(g,e);assert.ok(g.court.colossus.zones.length<=COLOSSUS.maxZones);});
test('boon deliberation freezes the colossus clock and warnings',()=>{const g=eligible();summonColossus(g);colossusVolley(g,colossusEnemy(g));g.court.pending=1;const time=g.time,zones=JSON.stringify(g.court.colossus.zones);for(let i=0;i<600;i++)g.update(1/60,input);assert.equal(g.time,time);assert.equal(JSON.stringify(g.court.colossus.zones),zones);});

test('only the colossus has a weakness to Titan heavy impacts; unrelated damage stays unchanged',()=>{const g=eligible('titan');summonColossus(g);const e=colossusEnemy(g),hp=e.hp;g.damage(e,100,'shockwave');assert.equal(hp-e.hp,100*COLOSSUS.titanImpact);const before=e.hp;g.damage(e,100,'direct');assert.equal(before-e.hp,100);const ordinary=g.spawn('titan'),health=ordinary.hp;g.damage(ordinary,100,'shockwave');assert.equal(health-ordinary.hp,100);const dev=eligible();summonColossus(dev);const foe=colossusEnemy(dev),initial=foe.hp;dev.damage(foe,100,'shockwave');assert.equal(initial-foe.hp,100);});

test('a fatal eruption and a manually ended hunt dismiss the boss and all remaining hazards',()=>{for(const manual of [false,true]){const g=eligible();summonColossus(g);colossusVolley(g,colossusEnemy(g));if(manual){g.ended=true;courtMission(g);}else{const z=g.court.colossus.zones[0];g.player.x=z.x;g.player.y=z.y;g.player.hp=1;g.player.invuln=0;g.time=z.impactAt;updateColossus(g);}assert.ok(g.ended);assert.equal(g.court.colossus.zones.length,0);assert.equal(colossusEnemy(g),undefined);assert.equal(g.court.colossus.status,'departed');assert.equal(courtMission(g).colossus.reward,0);}});

test('previous v27 hunts still encode and decode without colossus statistics',async()=>{const g=eligible(),r=historical(record(g),'2026.10-v27-court-test');assert.equal(r.mission.colossus,undefined);const decoded=await decodeRun(await encodeRun(r));assert.equal(decoded.rules,r.rules);assert.equal(decoded.mission.colossus,undefined);});

test('pursuer volley intercepts steady straight-line kiting but turning away avoids it',()=>{for(const turn of [false,true]){const g=eligible('sovereign');summonColossus(g);g.moving=true;g.movementAngle=0;g.court.colossus.pattern=2;colossusVolley(g,colossusEnemy(g));const z=g.court.colossus.zones[1],speed=g.monster.speed*g.releaseStats.move;assert.ok(Math.abs(z.x-speed*(z.impactAt-g.time))<.01);assert.ok(Math.abs(z.y)<z.radius+23);const hp=g.player.hp;g.player.invuln=0;g.player.x=turn?0:z.x;g.player.y=turn?-200:0;g.time=z.impactAt;updateColossus(g);assert.equal(g.player.hp<hp,!turn);}});

test('current hunt codes reject arena-only feats while historical codes remain readable',()=>{const r=record(eligible());validateRun(r);assert.throws(()=>validateRun({...r,feats:{...r.feats,apex:1}}),/hunt feat/);validateRun({...historical(r,'2026.10-v28-court-test'),feats:{...r.feats,apex:1}});});


test('remote arrival has a safe separate district for every pair of surviving sites and every player pocket',()=>{
 const g=eligible();let checked=0;
 for(let a=0;a<COURT_SITES.length;a++)for(let b=a+1;b<COURT_SITES.length;b++){
  g.court.camps=COURT_SITES.map((p,i)=>({...p,slain:i!==a&&i!==b,visited:false,spawned:false}));
  for(const player of [{x:0,y:0},...COURT_SITES]){
   Object.assign(g.player,player);const point=colossusSpawnPoint(g);assert.ok(point,`No spawn for ${a}/${b} at ${player.x}/${player.y}`);
   assert.ok(insideCourt(point.x,point.y,65));assert.notEqual(courtRegionAt(point.x,point.y)?.id,courtRegionAt(player.x,player.y)?.id);
   assert.ok(Math.hypot(point.x-player.x,point.y-player.y)>=COLOSSUS.playerSeparation);
   for(const c of g.court.camps.filter(c=>!c.slain)){assert.notEqual(courtRegionAt(point.x,point.y)?.id,courtRegionAt(c.x,c.y)?.id);assert.ok(Math.hypot(point.x-c.x,point.y-c.y)>=COLOSSUS.captainSeparation);}
   assert.deepEqual(colossusSpawnPoint(g),point);checked++;
  }
 }
 assert.equal(checked,3990);
});

test('a remote colossus waits without attacking and returns home when the player declines the fight',()=>{
 const g=eligible();assert.ok(summonColossus(g));const e=colossusEnemy(g),home={...g.court.colossus.home},location=colossusLocation(g);
 for(let n=0;n<90;n++){g.time+=1;updateColossus(g);assert.equal(colossusMotion(g,e).speed,0);assert.equal(g.court.colossus.zones.length,0);}
 assert.deepEqual({x:e.x,y:e.y},home);
 g.player.x=home.x+200;g.player.y=home.y;g.time+=1;updateColossus(g);assert.ok(g.court.colossus.zones.length>0);assert.equal(colossusMotion(g,e).speed,0); // The eruption windup stops walking.
 g.time=g.court.colossus.castUntil+1;assert.equal(colossusMotion(g,e).speed,55);
 e.x=home.x+180;g.player.x=g.player.y=0;const motion=colossusMotion(g,e);assert.ok(motion.dx<0&&motion.speed===55);assert.equal(colossusLocation(g),location);
 const pattern=g.court.colossus.pattern;g.time+=2;updateColossus(g);assert.equal(g.court.colossus.pattern,pattern);
});

test('remote arrival pockets remain reachable through the authored routes',()=>{
 const g=eligible();for(const player of COURT_SITES){Object.assign(g.player,player);const goal=colossusSpawnPoint(g),p={x:player.x,y:player.y};assert.ok(goal);
  for(let n=0;n<12000&&Math.hypot(p.x-goal.x,p.y-goal.y)>35;n++){const v=courtSteer(p.x,p.y,goal.x,goal.y);p.x+=v.x*5;p.y+=v.y*5;}
  assert.ok(Math.hypot(p.x-goal.x,p.y-goal.y)<35,`Remote encounter is unreachable from ${player.x}/${player.y}`);
 }
});

test('v29 hunt results with the previous colossus location rules still roundtrip',async()=>{
 const g=eligible();summonColossus(g);g.time+=10;g.damage(colossusEnemy(g),1e9,'direct');
 for(const rules of ['2026.10-v29-court-test','2026.10-v29-court-hunts']){const r=historical(record(g),rules);assert.deepEqual(await decodeRun(await encodeRun(r)),r);}
});


test('three-minute runtime survives the old cutoff, allows a late reward, then expires exactly at the new cutoff',()=>{
 const g=eligible();summonColossus(g);const spawned=g.time,boss=colossusEnemy(g);
 g.time=spawned+120.1;updateColossus(g);assert.equal(g.court.colossus.status,'active');assert.equal(colossusEnemy(g),boss);
 g.time=spawned+179.99;assert.ok(g.damage(boss,1e9,'direct'));assert.equal(g.court.colossus.status,'defeated');validateRun(record(g));
 const expired=eligible();summonColossus(expired);const foe=colossusEnemy(expired);expired.time=expired.court.colossus.spawnedAt+180;
 assert.equal(expired.damage(foe,1e9,'direct'),false);updateColossus(expired);assert.equal(expired.court.colossus.status,'expired');assert.equal(colossusEnemy(expired),undefined);assert.equal(expired.court.colossus.zones.length,0);
});

test('v31 authenticated codes accept three-minute kills while v28-v30 retain their historical two-minute limits',async()=>{
 const g=eligible();summonColossus(g);g.time+=179;g.damage(colossusEnemy(g),1e9,'direct');const r=record(g);
 assert.deepEqual(await decodeRun(await encodeRun(r)),r);
 for(const v of [28,29,30])for(const suffix of ['test','hunts']){
  const prior=historical(r,`2026.10-v${v}-court-${suffix}`),old={...prior,mission:{...prior.mission,colossus:{...r.mission.colossus,defeatedAt:r.mission.colossus.spawnedAt+120}}};
  assert.deepEqual(await decodeRun(await encodeRun(old)),old);
  assert.throws(()=>validateRun({...old,mission:{...old.mission,colossus:{...old.mission.colossus,defeatedAt:old.mission.colossus.spawnedAt+121}}}),/encounter window/);
 }
 assert.throws(()=>validateRun({...r,duration:r.duration+2,wave:Math.floor((r.duration+2)/30)+1,mission:{...r.mission,colossus:{...r.mission.colossus,defeatedAt:r.mission.colossus.spawnedAt+181}}}),/encounter window/);
});
