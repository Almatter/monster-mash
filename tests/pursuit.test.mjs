import test from 'node:test';import assert from 'node:assert/strict';
import {Game} from '../src/simulation.ts';import {MONSTERS} from '../src/content-monsters.ts';import {ENEMIES} from '../src/data.ts';
import {HORDE_PURSUIT_SPEED,threatAt} from '../src/balance.ts';
const idle={x:0,y:0,aimX:0,aimY:0,aiming:false},dt=1/60;
function chase(id,time,{fed=false,boost=false,moving=false,kind='thrall'}={}){
 const g=new Game(77,{monsterId:id});g.time=time;if(fed)g.score.recent=Array(50).fill(time);if(boost)g.monster={...g.monster,speed:g.monster.speed*2};
 g.spawn(kind);const e=g.enemies.find(e=>e.active);e.x=600;e.y=0;e.rushing=true;g.rebuildGrid();const x=e.x;
 g.update(dt,{...idle,x:moving?-1:0});return {g,e,enemySpeed:(x-e.x)/dt,gap:e.x-g.player.x};
}
test('same enemy pursuit speed across all five champions at early, release and late-match times',()=>{
 for(const time of [0,120,480,720]){const rows=Object.keys(MONSTERS).map(id=>chase(id,time));for(const r of rows){assert.ok(Math.abs(r.enemySpeed-rows[0].enemySpeed)<1e-8);const natural=ENEMIES.thrall.speed*(1+r.g.wave*.025+Math.max(0,r.g.wave-12)*.10);assert.ok(Math.abs(r.enemySpeed-Math.max(natural,HORDE_PURSUIT_SPEED*threatAt(time+dt).pursuit))<1e-8);}}
});
test('higher champion base speed and Devourer kill bonuses widen escape space without speeding up prey',()=>{
 const base=chase('devourer',480,{moving:true}),fed=chase('devourer',480,{moving:true,fed:true}),boosted=chase('devourer',480,{moving:true,boost:true});
 assert.ok(fed.g.player.x<base.g.player.x);assert.ok(fed.gap>base.gap);assert.ok(boosted.gap>fed.gap);
 assert.ok(Math.abs(base.enemySpeed-fed.enemySpeed)<1e-8);assert.ok(Math.abs(base.enemySpeed-boosted.enemySpeed)<1e-8);
 const sovereign=chase('sovereign',480,{moving:true});assert.ok(base.gap>sovereign.gap);
});
test('enemy species and wave acceleration remain meaningful; near prey returns to its natural speed',()=>{
 const thrall=chase('devourer',720),hound=chase('devourer',720,{kind:'hound'});assert.ok(hound.enemySpeed>thrall.enemySpeed);
 const g=new Game(1,{monsterId:'devourer'});g.spawn('brute');const e=g.enemies.find(e=>e.active);e.x=120;e.y=0;e.hp=e.maxHp=1e9;g.rebuildGrid();g.update(dt,idle);assert.equal(e.rushing,false);assert.ok(Math.abs((120-e.x)/dt-ENEMIES.brute.speed*1.025)<1e-8);
});
