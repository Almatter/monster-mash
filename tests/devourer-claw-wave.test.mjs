import test from 'node:test';import assert from 'node:assert/strict';
import {Game} from '../src/simulation.ts';import {CLAW_WAVE} from '../src/balance.ts';
const input={x:0,y:0,aimX:1000,aimY:0,aiming:true},dt=1/60;
function fixture(stage=4,id='devourer'){const g=new Game(77,{monsterId:id});g.time=[0,150,300,420,510][stage];g.release=stage;g.wave=Math.floor(g.time/30)+1;g.attack=0;g.player.invuln=100;return g;}
function prey(g,x,y=0,hp){g.spawn('thrall');const e=g.enemies.find(e=>e.active&&e.serial===g.serial);Object.assign(e,{x,y});if(hp)e.hp=e.maxHp=hp;g.rebuildGrid();return e;}
function lockSpawn(g){g.spawn=()=>{};}
test('only Devourer Feast claws from Unbound II onward emit waves; an idle or normal attack does not',()=>{
 for(const id of ['devourer','sovereign'])for(const stage of [0,1,2,3,4])for(const feast of [false,true]){const g=fixture(stage,id);if(feast)g.frenzy=8;prey(g,80,0,1e9);lockSpawn(g);g.update(dt,input);assert.equal(g.clawWaves.length,id==='devourer'&&stage>=2&&feast?1:0);}
 const empty=fixture();empty.cast(3);lockSpawn(empty);empty.update(dt,input);assert.equal(empty.clawWaves.length,0);
});
test('piercing waves kill distant ranks with ordinary score credit, sharing capped Feast healing',()=>{
 const g=fixture();g.player.hp=400;prey(g,80,0,1e9);for(let i=0;i<30;i++)prey(g,350+i*.2,(i%5-2)*25);lockSpawn(g);g.cast(3);
 for(let i=0;i<35;i++)g.update(dt,input);assert.equal(g.score.sources.clawwave,30);assert.equal(g.score.kills,30);assert.ok(g.score.dominance>0);assert.equal(g.player.hp,820);assert.equal(g.sustainStats.healed,420);assert.equal(g.frenzyHealing,850*.65-420);assert.ok(g.frenzyGuard>0,'existing Feast guard still follows kills');
});
test('a wave damages each enemy serial once, and settles its multikill once on expiry',()=>{
 const g=fixture();const near=prey(g,80,0,1e9),far=prey(g,350,0,1e9);lockSpawn(g);g.cast(3);g.update(dt,input);const w=g.clawWaves[0],hp=near.hp,farHp=far.hp;g.attack=100;
 for(let i=0;i<70;i++)g.update(dt,input);assert.ok(Math.abs(near.hp-(hp-w.damage))<1e-5);assert.ok(Math.abs(far.hp-(farHp-w.damage))<1e-5);assert.equal(g.clawWaves.length,0);
});
test('swept collision catches targets between frames and preserves near-claw feeding',()=>{
 const g=fixture();prey(g,80,0,1e9);const far=prey(g,350),outside=prey(g,350,400);lockSpawn(g);g.cast(3);g.update(dt,input);g.attack=100;g.update(.5,input);assert.equal(far.active,false);assert.equal(outside.active,true);
 const close=fixture();close.player.hp=400;close.cast(3);const victim=prey(close,80);assert.equal(close.damage(victim,10000,'clawwave'),true);assert.equal(close.player.hp,414);
});
test('outgoing waves finish after Feast ends, never emit outside it, and remain bounded',()=>{
 const g=fixture();prey(g,80,0,1e9);lockSpawn(g);g.monster={...g.monster,basic:{...g.monster.basic,interval:.00001}};g.cast(3);
 for(let i=0;i<300;i++){g.update(dt,input);assert.ok(g.clawWaves.length<=CLAW_WAVE.maxActive);}assert.ok(g.clawWaves.length>0);g.frenzy=0;g.attack=100;for(let i=0;i<70;i++)g.update(dt,input);assert.equal(g.clawWaves.length,0);assert.equal(new Game(77,{monsterId:'devourer'}).clawWaves.length,0);
});

test('waves follow facing independently of movement, leaving prey outside the travel corridor untouched',()=>{
 const g=fixture();prey(g,80,0,1e9);const forward=prey(g,0,350),side=prey(g,350,0);lockSpawn(g);g.cast(3);g.update(dt,{...input,x:1,aimX:0,aimY:1000});const w=g.clawWaves[0];assert.ok(w.angle>1.5);g.attack=100;for(let i=0;i<35;i++)g.update(dt,input);assert.equal(forward.active,false);assert.equal(side.active,true);
});


test('nearby Feast claws retain circular cleave in every direction while a wave launches',()=>{
 const g=fixture();g.player.hp=100;for(let i=0;i<8;i++){const a=i*Math.PI/4;prey(g,Math.cos(a)*80,Math.sin(a)*80);}lockSpawn(g);g.cast(3);g.update(dt,input);
 assert.equal(g.score.sources.direct,8);assert.equal(g.score.kills,8);assert.equal(g.player.hp,212);assert.equal(g.clawWaves.length,1);
});

test('all Feast kill sources share one unchanged healing budget, and distant kills cannot renew it',()=>{
 for(const stage of [2,4]){const g=fixture(stage);g.player.hp=10;g.cast(3);const cap=g.player.maxHp*(.25+.1*stage);
  for(let i=0;i<100;i++){const e=prey(g,500);g.damage(e,1e9,['clawwave','direct','execute','lunge'][i%4]);}
  assert.ok(Math.abs(g.sustainStats.healed-cap)<1e-9);assert.equal(g.frenzyHealing,0);assert.ok(g.frenzyGuard>0);
  g.player.hp=10;g.damage(prey(g,500),1e9,'clawwave');assert.equal(g.player.hp,10,'wave kills cannot refill an exhausted pool');
  g.cooldowns[3]=0;g.cast(3);assert.equal(g.frenzyHealing,cap);g.damage(prey(g,500),1e9,'clawwave');assert.equal(g.player.hp,10+8+1.5*stage);
  g.frenzy=0;g.player.hp=10;const remaining=g.frenzyHealing;g.damage(prey(g,500),1e9,'clawwave');assert.equal(g.player.hp,10);assert.equal(g.frenzyHealing,remaining,'outgoing kills after Feast cannot feed');
 }
});
