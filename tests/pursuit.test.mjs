import test from 'node:test';import assert from 'node:assert/strict';
import {Game} from '../src/simulation.ts';import {MONSTERS} from '../src/content-monsters.ts';import {ENEMIES} from '../src/data.ts';
import {ENEMY_SPEED_LIMITS,enemyMovementSpeed,threatAt} from '../src/balance.ts';
const idle={x:0,y:0,aimX:0,aimY:0,aiming:false},dt=1/60;
function fixture(id,time,kind='thrall',distance=600){
 const g=new Game(77,{monsterId:id});g.time=time;g.wave=Math.floor(time/30)+1;g.spawn(kind);
 const e=g.enemies.find(e=>e.active),angle=.25;e.x=-Math.cos(angle)*distance;e.y=-Math.sin(angle)*distance;e.hp=e.maxHp=1e9;e.rushing=true;
 g.spawn=()=>{};g.rebuildGrid();return {g,e,angle};
}
test('species pursuit is independent of all champion speeds throughout long matches',()=>{
 for(const time of [0,120,480,600,720,900,1200,1800])for(const kind of Object.keys(ENEMIES)){
  const rows=Object.keys(MONSTERS).map(id=>{const {g,e}=fixture(id,time,kind),x=e.x,y=e.y;g.update(dt,idle);return {g,speed:Math.hypot(e.x-x,e.y-y)/dt};});
  for(const r of rows){assert.ok(Math.abs(r.speed-rows[0].speed)<1e-8);assert.ok(r.speed<=Math.hypot(ENEMY_SPEED_LIMITS[kind],kind==='wing'?45:0)+1e-8);}
 }
});
test('wave acceleration stops erasing movement bonuses after ten minutes',()=>{
 for(const kind of Object.keys(ENEMIES))for(const rushing of [false,true]){
  const atTen=enemyMovementSpeed(kind,21,threatAt(720).pursuit,rushing);
  for(const wave of [25,31,41,61,1000])assert.equal(enemyMovementSpeed(kind,wave,threatAt(1800).pursuit,rushing),atTen);
 }
 assert.equal(enemyMovementSpeed('hound',61,1.4,true),235);
 assert.equal(enemyMovementSpeed('thrall',61,1.4,true),155);
});
function flee(id,time,kind,fed=false){
 const {g,e,angle}=fixture(id,time,kind);if(fed)g.score.recent=Array(50).fill(time);
 const start=Math.hypot(e.x-g.player.x,e.y-g.player.y);let previous=start;
 for(let frame=0;frame<180;frame++){g.update(dt,{...idle,x:Math.cos(angle),y:Math.sin(angle)});const gap=Math.hypot(e.x-g.player.x,e.y-g.player.y);assert.ok(e.active);assert.equal(g.dash,null);assert.ok(gap>previous,`${id} fails to separate at ${time}s, frame ${frame}`);previous=gap;}
 return {g,gained:previous-start};
}
test('Devourer gains visible sustained distance from the fastest pursuer without dashing, even at thirty minutes',()=>{
 for(const time of [510,600,720,900,1200,1800]){const base=flee('devourer',time,'hound'),fed=flee('devourer',time,'hound',true);assert.ok(base.gained>117);assert.ok(fed.gained>240);assert.ok(fed.gained>base.gained+120);assert.equal(base.g.score.kills,0);assert.equal(fed.g.score.kills,0);}
});
test('every fully released champion can steadily outpace the ordinary swarm without abilities',()=>{
 for(const id of Object.keys(MONSTERS))for(const time of [510,720,1200,1800])assert.ok(flee(id,time,'thrall').gained>59);
});
test('escaping ordinary enemies awards no kills; elites and titans remain at their actual positions',()=>{
 for(const kind of Object.keys(ENEMIES)){const {g,e}=fixture('devourer',900,kind,1200),x=e.x,y=e.y;g.update(dt,idle);assert.equal(g.score.kills,0);if(kind==='elite'||kind==='titan'){assert.ok(e.active);assert.equal(g.alive,1);assert.ok(Math.hypot(e.x-x,e.y-y)<=ENEMY_SPEED_LIMITS[kind]*dt+1e-8);}else{assert.equal(e.active,false);assert.equal(g.alive,0);}}
});
test('nearby slow prey retains its natural early movement',()=>{
 const {g,e}=fixture('devourer',0,'brute',120);e.rushing=false;const x=e.x,y=e.y;g.update(dt,idle);assert.equal(e.rushing,false);assert.ok(Math.abs(Math.hypot(e.x-x,e.y-y)/dt-ENEMIES.brute.speed*1.025)<1e-8);
});
