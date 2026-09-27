import test from 'node:test';import assert from 'node:assert/strict';
import {Game} from '../src/simulation.ts';import {SUSTAIN} from '../src/balance.ts';
const idle={x:0,y:0,aimX:400,aimY:0,aiming:true},dt=1/60;
function fixture(stage=4,id='sovereign'){const g=new Game(77,{monsterId:id});g.time=stage===4?510:0;g.release=stage;g.wave=Math.floor(g.time/30)+1;g.attack=100;return g;}
function prey(g,count,kind='thrall'){for(let i=0;i<count;i++){g.spawn(kind);const e=g.enemies.find(e=>e.active&&e.serial===g.serial);e.x=80+i*.1;e.y=0;}g.rebuildGrid();}
test('Devour earns health and Release-scaled Aegis from real kills, with separate finite caps',()=>{
 for(const stage of [0,4]){const g=fixture(stage);g.player.hp=400;prey(g,10);assert.ok(g.cast(1));assert.equal(g.player.hp,580);assert.equal(g.score.sources.devour,10);assert.equal(g.shield,stage===4?80:40);assert.equal(g.shieldTime,8);
  g.cooldowns[1]=0;prey(g,50);assert.ok(g.cast(1));assert.equal(g.player.hp,980);assert.equal(g.shield,stage===4?180:100);assert.equal(g.alive,0);}
});
test('full-health feeding earns Aegis; empty and nonlethal casts never grant or refresh ward',()=>{
 const g=fixture();prey(g,10);g.cast(1);assert.equal(g.player.hp,g.player.maxHp);assert.equal(g.sustainStats.healed,0);assert.equal(g.shield,80);
 g.shieldTime=3;g.cooldowns[1]=0;g.cast(1);assert.equal(g.shield,80);assert.equal(g.shieldTime,3);
 prey(g,1,'elite');const e=g.enemies.find(e=>e.active);e.hp=e.maxHp=1e9;g.cooldowns[1]=0;g.cast(1);assert.ok(e.active);assert.equal(g.shield,80);assert.equal(g.shieldTime,3);
 const other=fixture(4,'devourer');prey(other,10);other.cast(1);assert.equal(other.shield,0);
});
test('Catastrophe earns a smaller ward from kills; Rupture and ordinary attacks do not grant it',()=>{
 for(const stage of [0,4]){const g=fixture(stage);prey(g,30);g.cast(3);assert.equal(g.shield,stage===4?40:20);assert.equal(g.score.sources.ultimate,30);assert.equal(g.player.hp,g.player.maxHp);
 g.shield=0;g.shieldTime=0;prey(g,30);g.cast(0);assert.equal(g.shield,0);assert.equal(g.score.sources.shockwave,30);}
 const empty=fixture();empty.cast(3);assert.equal(empty.shield,0);
});
test('Death Beam rebuilds ward once on completion, including at full health; a missed beam earns nothing',()=>{
 for(const hits of [0,30]){const g=fixture();prey(g,hits);g.spawn=()=>{};g.cast(2);g.update(dt,idle);assert.equal(g.shield,0);
  for(let i=0;i<190;i++)g.update(dt,idle);assert.equal(g.beam<=0,true);assert.equal(g.shield,hits?40:0);assert.equal(g.score.sources.beam||0,hits);assert.equal(g.player.hp,g.player.maxHp);
  const remaining=g.shieldTime;for(let i=0;i<30;i++)g.update(dt,idle);assert.equal(g.shield,hits?40:0);assert.ok(g.shieldTime<remaining);}
});
test('feeding and magic share one modest capacity; Rage reduces damage before ward absorbs it',()=>{
 const g=fixture();prey(g,10);g.cast(1);for(let i=0;i<4;i++){g.cooldowns[3]=0;prey(g,30);g.cast(3);}assert.equal(g.shield,180);assert.ok(g.shield<SUSTAIN.calamity.cap/2);
 g.hurt(200);assert.equal(g.shield,30);assert.equal(g.player.hp,1000);g.player.invuln=0;g.hurt(100);assert.equal(g.shield,0);assert.equal(g.player.hp,955);assert.equal(g.sustainStats.absorbed,180);
});
test('Aegis expires without a fresh successful activation and resets on a new run',()=>{
 const g=fixture();prey(g,10);g.cast(1);g.spawn=()=>{};for(let i=0;i<490;i++)g.update(dt,idle);assert.equal(g.shield,0);assert.equal(new Game(77,{monsterId:'sovereign'}).shield,0);
});
