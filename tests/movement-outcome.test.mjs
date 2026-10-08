import test from 'node:test';import assert from 'node:assert/strict';
import {Game} from '../src/simulation.ts';import {ABILITIES,MONSTERS,abilityLabel} from '../src/content-monsters.ts';
import {runOutcome,outcomeDescription,resultText} from '../src/results.ts';
const idle={x:0,y:0,aimX:400,aimY:0,aiming:true};

test('all champion sprites remember horizontal walking direction independently of aim',()=>{
 for(const monsterId of Object.keys(MONSTERS)){
  const g=new Game(19,{monsterId});assert.equal(g.facingX,1);
  g.update(1/60,{...idle,x:-1});assert.equal(g.facingX,-1);
  g.update(1/60,{...idle,y:-1});assert.equal(g.facingX,-1,'vertical walking keeps the last side');
  g.update(1/60,idle);assert.equal(g.facingX,-1,'standing still keeps the last side');
  g.update(1/60,{...idle,x:1,aimX:-1000});assert.equal(g.facingX,1,'movement wins over opposite pointer aim');
  assert.equal(new Game(19,{monsterId}).facingX,1,'fresh runs reset visual direction');
 }
});
test('Lunge follows cardinal/diagonal movement despite opposite aim, and actual displacement agrees',()=>{
 for(const [x,y] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1]]){
  const g=new Game(77,{monsterId:'devourer'});g.update(1/60,{...idle,x,y,aimX:-x*400,aimY:-y*400});const angle=Math.atan2(y,x);assert.equal(g.cast(0),true);assert.ok(Math.abs(g.dash.angle-angle)<1e-10);
  const start={x:g.player.x,y:g.player.y};g.update(1/60,idle);assert.ok((g.player.x-start.x)*x+(g.player.y-start.y)*y>0);
 }
});
test('stationary Lunge remembers travel, fresh casts face right, recasts redirect, invalid vectors do not corrupt direction',()=>{
 const fresh=new Game(1,{monsterId:'devourer'});fresh.player.angle=Math.PI;fresh.cast(0);assert.equal(fresh.dash.angle,0);
 const g=new Game(77,{monsterId:'devourer'});g.time=300;g.update(1/60,{...idle,x:0,y:-1});g.update(1/60,idle);g.cast(0);assert.equal(g.dash.angle,-Math.PI/2);const remaining=g.dash.remaining;
 g.setMovementDirection(-1,0);g.cast(0);assert.equal(g.dash.angle,Math.PI);assert.ok(g.dash.remaining>remaining);assert.equal(g.lungeCharges,0);assert.ok(g.dodgeInvuln>0);
 g.setMovementDirection(0,0);g.setMovementDirection(NaN,1);g.setMovementDirection(1,Infinity);assert.equal(g.movementAngle,Math.PI);
});
test('Titan Stampede follows movement rather than aim, remembering the last direction while standing; ability labels stay canonical',()=>{
 const g=new Game(1,{monsterId:'titan'});g.setMovementDirection(0,1);g.player.angle=Math.PI;g.cast(1);assert.equal(g.dash.angle,Math.PI/2);
 const fresh=new Game(1,{monsterId:'titan'});fresh.player.angle=Math.PI;fresh.cast(1);assert.equal(fresh.dash.angle,0);
 const start={x:g.player.x,y:g.player.y};g.update(1/60,idle);assert.ok(g.player.y>start.y);
 for(const monster of Object.values(MONSTERS))for(const id of monster.abilities){const p=ABILITIES[id],label=abilityLabel(p);assert.ok(label.includes(p.short));assert.ok(label.includes(p.name));}
 assert.equal(ABILITIES.frenzy.short,'Feast');assert.ok(!MONSTERS.devourer.basic.description.includes('Frenzy'));
});
test('Overlord and Calamity ranged basics fire at the nearest enemy despite opposite pointer aim',()=>{
 for(const monsterId of ['overlord','calamity']){
  const g=new Game(23,{monsterId});g.spawn('thrall');const near=g.enemies.find(e=>e.active&&e.serial===g.serial);Object.assign(near,{x:110,y:0,hp:1e9,maxHp:1e9});
  g.spawn('titan');const far=g.enemies.find(e=>e.active&&e.serial===g.serial);Object.assign(far,{x:-240,y:0,hp:1e9,maxHp:1e9});g.rebuildGrid();
  g.update(1/60,{...idle,aimX:-1000});assert.ok(g.bolts.length>0,monsterId+' fired');assert.ok(g.bolts[0].vx>0,monsterId+' fired toward closer prey');
 }
});
test('Calamity Ray and Sovereign Death Beam track the nearest enemy while pointer aim points away',()=>{
 for(const [monsterId,ability] of [['calamity',0],['sovereign',2]]){
  const g=new Game(23,{monsterId});g.spawn('thrall');const east=g.enemies.find(e=>e.active&&e.serial===g.serial);Object.assign(east,{x:130,y:0,hp:1e9,maxHp:1e9});
  g.spawn('thrall');const west=g.enemies.find(e=>e.active&&e.serial===g.serial);Object.assign(west,{x:-300,y:0,hp:1e9,maxHp:1e9});g.rebuildGrid();
  g.attack=100;g.cast(ability);g.update(1/60,{...idle,aimX:-1000});assert.ok(Math.cos(g.player.angle)>.99,monsterId+' chose nearer east enemy');assert.ok(east.hp<east.maxHp);
  east.x=900;west.x=-130;g.rebuildGrid();g.update(1/60,{...idle,aimX:1000});assert.ok(Math.cos(g.player.angle)<-.99,monsterId+' retargeted west after movement');
 }
});
test('outcome milestones celebrate survival without changing retirement category or ending the engine',()=>{
 assert.equal(runOutcome({reason:'overwhelmed',duration:509,release:3}),'A LEGEND IN THE MAKING');
 assert.equal(runOutcome({reason:'overwhelmed',duration:510,release:4}),'FULLY UNBOUND');
 assert.equal(runOutcome({reason:'overwhelmed',duration:599,release:4}),'FULLY UNBOUND');
 assert.equal(runOutcome({reason:'overwhelmed',duration:600,release:4}),'TEN-MINUTE LEGEND');
 assert.equal(runOutcome({reason:'retired',duration:1000,release:4}),'MANUALLY ENDED');
 const g=new Game(1,{monsterId:'devourer'});g.time=600;g.update(1/60,idle);assert.equal(g.ended,false);
 const r={name:'Night',title:'The Unbound',monsterId:'devourer',rules:'2026.10-v7-movement',phase:0,reason:'overwhelmed',duration:600,release:4,score:100,kills:12,wave:21,multi:3,titans:0};
 assert.ok(resultText(r).includes('TEN-MINUTE LEGEND'));assert.ok(!resultText(r).includes('OVERWHELMED'));assert.match(outcomeDescription(r),/ten-minute milestone/);
});
