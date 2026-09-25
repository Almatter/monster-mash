import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../src/simulation.ts';
import {SUSTAIN} from '../src/balance.ts';
const input={x:0,y:0,aimX:500,aimY:0,aiming:true};
function kill(g){g.spawn('thrall');const enemy=g.enemies.find(e=>e.active&&e.serial===g.serial);assert.ok(enemy);assert.equal(g.damage(enemy,10000,'direct'),true);}

test('late Feast earns a brief reprieve through kills and restores a bounded amount of real health',()=>{
 const g=new Game(31,{monsterId:'devourer'});g.release=4;g.player.hp=1;
 assert.equal(g.cast(3),true);assert.equal(g.frenzyGuard,0);assert.equal(g.player.hp,1,'empty cast gives no recovery');
 for(let i=0;i<19;i++)kill(g);assert.equal(g.frenzyGuard,0);
 kill(g);assert.equal(g.frenzyGuard,2.5);assert.equal(g.player.hp,281);
 g.hurt(100);assert.equal(g.player.hp,241,'earned guard reduces a late hit by 60%');
 for(let i=20;i<80;i++)kill(g);
 assert.equal(g.sustainStats.healed,g.player.maxHp*.65,'actual Feast healing has a per-cast cap');
 assert.equal(g.score.kills,80);assert.equal(g.shield,0,'Feast stays a kill-driven defense rather than a ward');
 g.frenzyGuard=.01;g.update(1/60,input);assert.equal(g.frenzyGuard,0);
 g.player.invuln=0;const hp=g.player.hp;g.hurt(100);assert.equal(g.player.hp,hp-100,'guard expires');
 g.frenzy=0;const budget=g.frenzyHealing;kill(g);assert.equal(g.frenzyHealing,budget,'feeding after Feast cannot heal');
});

test('Feast scales with Release and never spends healing budget at full health',()=>{
 const early=new Game(7,{monsterId:'devourer'});early.player.hp=400;early.cast(3);
 for(let i=0;i<20;i++)kill(early);
 assert.equal(early.frenzyGuard,SUSTAIN.devourer.guardBaseSeconds);
 early.hurt(100);assert.equal(early.player.hp,400+20*SUSTAIN.devourer.frenzyHealBase-60);
 const full=new Game(8,{monsterId:'devourer'});full.release=4;full.cast(3);const budget=full.frenzyHealing;
 for(let i=0;i<20;i++)kill(full);
 assert.equal(full.frenzyHealing,budget,'overheal does not waste a future recovery window');
 full.player.hp=full.player.maxHp-100;kill(full);assert.equal(full.player.hp,full.player.maxHp-86);
});
