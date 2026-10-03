import test from 'node:test';import assert from 'node:assert/strict';
import {cameraViewport} from '../src/camera.ts';
import {Game} from '../src/simulation.ts';
import {COURT,initializeCourt,updateCourt,courtHintTarget,courtHintPath,chooseCourtUpgrade,courtSpeedBonus} from '../src/stage-two.ts';
import {COURT_ROCKS,insideCourt,slideCourt,courtSteer,COURT_NAV_NODE_COUNT} from '../src/court-map.ts';
import {CLAW_WAVE} from '../src/balance.ts';
import {renderBoonScore,renderMusicLayer} from '../src/procedural-music.ts';
const idle={x:0,y:0,aimX:-1000,aimY:0,aiming:true};
const local=(r,x,y)=>({x:r.x+Math.cos(r.angle)*x-Math.sin(r.angle)*y,y:r.y+Math.sin(r.angle)*x+Math.cos(r.angle)*y});

test('monitor resolution and landscape aspect ratio never increase the visible battlefield',()=>{
 for(const [w,h] of [[842,390],[1280,720],[1440,900],[1920,1080],[3440,1440],[5120,1440]]){
  const v=cameraViewport(w,h);assert.equal(v.worldWidth,1200);assert.equal(v.worldHeight,760);
  assert.ok(v.width<=w+.001&&v.height<=h+.001);assert.ok(Math.abs(v.width/v.scale-1200)<1e-8);
 }
 const portrait=cameraViewport(390,842);assert.equal(portrait.worldWidth,760);assert.equal(portrait.worldHeight,1200);
 assert.equal(portrait.worldWidth*portrait.worldHeight,1200*760);
});

test('camps activate outside the bounded camera before their captain can become visible, and persist after leaving',()=>{
 const g=new Game(77,{},1);initializeCourt(g);g.court.camps.forEach(c=>{c.x=8000;c.y=6000;});g.court.camps[0].x=900;g.court.camps[0].y=0;
 updateCourt(g,.01);const captain=g.enemies.find(e=>e.active&&e.court?.role==='captain');
 assert.ok(captain);assert.ok(captain.x>600+114/2);assert.ok(COURT.activationRadius>Math.hypot(600,380)+114/2);
 const serial=captain.serial;g.player.x=-2500;g.spawn=()=>undefined;g.attack=100;
 for(let i=0;i<120;i++)g.update(1/60,idle);
 assert.equal(captain.active,true);assert.equal(captain.serial,serial);g.player.x=0;g.update(.01,idle);
 assert.equal(g.court.stats.hunts,1);assert.equal(captain.serial,serial);
});

test('Stage 2 Feast swings and emits bounded movement-directed waves even without a melee target',()=>{
 const g=new Game(77,{monsterId:'devourer'},1);g.court.initialized=true;g.spawn=()=>undefined;let swings=0;g.sound=k=>{if(k==='basic.devourer')swings++;};g.cast(3);
 for(let i=0;i<90;i++){g.update(1/60,{...idle,x:0,y:-1});assert.ok(g.clawWaves.length<=CLAW_WAVE.maxActive);}
 assert.ok(swings>=5);assert.ok(g.clawWaves.length>0);assert.ok(g.clawWaves.every(w=>w.angle===-Math.PI/2));assert.equal(g.score.kills,0);assert.equal(g.sustainStats.healed,0);
 const count=swings;g.frenzy=0;for(let i=0;i<150;i++)g.update(1/60,idle);assert.equal(swings,count);assert.equal(g.clawWaves.length,0);
 const old=new Game(77,{monsterId:'devourer'},0);old.release=4;old.time=510;old.spawn=()=>undefined;old.cast(3);old.update(1/60,idle);assert.equal(old.clawWaves.length,0);
});

test('continuous Feast reaches a captain beyond melee range and retains its existing healing cap',()=>{
 const g=new Game(77,{monsterId:'devourer'},1);g.court.initialized=true;
 g.player.x=2000;const e=g.spawn('brute');Object.assign(e,{x:2440,y:0,hp:1e6,maxHp:1e6,court:{role:'captain',guard:0,maxGuard:0,facing:Math.PI,broken:true,homeX:2440,homeY:0,homeAngle:0,tier:0}});g.spawn=()=>undefined;g.rebuildGrid();
 assert.equal(g.findBasicTarget(g.monster.basic.radius*g.releaseStats.radius,false),null);
 g.player.hp=300;g.cast(3);const cap=g.frenzyHealing,hp=e.hp;
 for(let i=0;i<40;i++)g.update(1/60,idle);
 assert.ok(e.hp<hp);assert.equal(g.frenzyHealing,cap);assert.equal(g.player.hp,300,'nonlethal wave damage does not invent leech');
});

test('late captain bearings start at twelve minutes; persistent route guidance follows the expired bonus window',()=>{
 const g=new Game(77,{},1);initializeCourt(g);
 g.time=COURT.hintStart-.01;updateCourt(g,.01);assert.equal(g.court.hint,null);assert.equal(courtHintTarget(g),null);
 g.time=COURT.hintStart;updateCourt(g,.01);assert.ok(courtHintTarget(g));assert.equal(g.court.hint.trail,false);assert.equal(courtHintPath(g).length,1);
 assert.ok(courtSpeedBonus(g.time)<COURT.speedMax);
 g.time=COURT.hintTrail;updateCourt(g,.01);assert.equal(g.court.hint.trail,true);assert.equal(courtSpeedBonus(g.time),0);
 assert.ok(courtHintPath(g).length>1);for(const p of courtHintPath(g))assert.ok(insideCourt(p.x,p.y,24));
});

test('guidance retargets living captains after a kill and boon deliberation cannot advance its clock',()=>{
 const g=new Game(77,{},1);initializeCourt(g);g.time=901;updateCourt(g,.01);const site=g.court.hint.site,target=courtHintTarget(g);
 g.damage(target,1e8,'execute');assert.equal(g.court.camps[site].slain,true);assert.equal(courtHintTarget(g),null);
 const time=g.time,next=g.court.nextHintAt;g.update(60,idle);assert.equal(g.time,time);assert.equal(g.court.nextHintAt,next);
 chooseCourtUpgrade(g,'power');g.update(.3,idle);assert.ok(courtHintTarget(g));assert.notEqual(g.court.hint.site,site);
 g.court.cleared=true;updateCourt(g,.01);assert.equal(courtHintTarget(g),null);
});

test('sculpted hollows are walkable and navigation can enter and leave every rotated basin',()=>{
 assert.ok(COURT_NAV_NODE_COUNT<=737);
 for(const rock of COURT_ROCKS.filter(r=>r.kind==='crescent')){
  const inside=local(rock,0,130),outside=local(rock,80,800),side=local(rock,-700,0);
  assert.ok(insideCourt(inside.x,inside.y,24));
  for(const [start,goal] of [[outside,inside],[inside,outside],[side,inside],[inside,side]]){
   const body={...start};for(let i=0;i<3000&&Math.hypot(body.x-goal.x,body.y-goal.y)>60;i++){const dir=courtSteer(body.x,body.y,goal.x,goal.y);body.x+=dir.x*5;body.y+=dir.y*5;slideCourt(body,23);}
   assert.ok(Math.hypot(body.x-goal.x,body.y-goal.y)<=60,JSON.stringify({rock,start,goal,body}));
  }
 }
});

test('nearby goals across each small ridge route around its solid core',()=>{
 for(const rock of COURT_ROCKS.filter(r=>r.kind==='ridge')){
  const start=local(rock,0,110),goal=local(rock,0,-110),body={...start};
  for(let i=0;i<3000&&Math.hypot(body.x-goal.x,body.y-goal.y)>30;i++){const d=courtSteer(body.x,body.y,goal.x,goal.y);body.x+=d.x*4;body.y+=d.y*4;slideCourt(body,23);}
  assert.ok(Math.hypot(body.x-goal.x,body.y-goal.y)<=30,JSON.stringify({rock,body,goal}));
 }
});

test('boon selection has a distinct finite score in one small reusable mono buffer',async()=>{
 const score=await renderBoonScore(),battle=await renderMusicLayer(3);assert.ok(score.length<22050*15);assert.notEqual(score.length,battle.length);
 let peak=0,square=0;for(const v of score){assert.ok(Number.isFinite(v));peak=Math.max(peak,Math.abs(v));square+=v*v;}
 assert.ok(peak>.01&&peak<.5);assert.ok(Math.sqrt(square/score.length)>.002);
});
