import test from 'node:test';import assert from 'node:assert/strict';
import {PLAYER_VFX,colorPowerPixels} from '../src/power-vfx.ts';
import {CHAMPION_VFX} from '../src/content-vfx.ts';
import {calamitySuggestedPoint} from '../src/calamity-target.ts';
import {Game} from '../src/simulation.ts';

test('every champion magic asset follows power color, while enemy and navigation art stay distinct',()=>{
 for(const [id,p] of Object.entries(CHAMPION_VFX))for(const kind of [id,p.unbound,...p.perks])assert.ok(PLAYER_VFX.has(kind),kind);
 for(const kind of ['hostile-bolt','hostile-elite','hostile-titan','hostile-elite-warning','hostile-titan-warning','enemy-hit','court-guard-front','court-slam','colossus-warning','court-ash-trace'])assert.equal(PLAYER_VFX.has(kind),false,kind);
 const data=new Uint8ClampedArray([20,160,70,123,3,40,10,255,255,255,255,255,90,30,20,0]);
 colorPowerPixels(data,'#e975bc');assert.ok(data[0]>data[1]&&data[2]>data[1]);assert.ok(data[4]<data[0]);assert.deepEqual([...data.slice(8,12)],[255,245,255,255]);assert.deepEqual([data[3],data[7],data[11],data[15]],[123,255,255,0]);assert.deepEqual([...data.slice(12)],[90,30,20,0]);
 const stone=new Uint8ClampedArray([45,40,35,255,230,80,25,230]);colorPowerPixels(stone,'#49b3aa',true);assert.deepEqual([...stone.slice(0,4)],[45,40,35,255]);assert.ok(stone[5]>stone[4]);
});
function arena(){const g=new Game(41,{monsterId:'calamity'});g.targetView={x:640,y:360};return g;}
function enemy(g,x,y,kind='thrall'){const e=g.spawn(kind);Object.assign(e,{x,y});return e;}
test('Calamity suggestions favor a visible major threat over fodder, without changing combat state',()=>{
 const g=arena();enemy(g,100,0);const captain=enemy(g,510,0,'brute');captain.court={role:'captain'};const offscreen=enemy(g,100,-400,'titan');const before={rng:g.rng,focus:g.reaperFocus,cooldowns:[...g.cooldowns]};
 assert.deepEqual(calamitySuggestedPoint(g,1),{x:510,y:0});assert.deepEqual(calamitySuggestedPoint(g,2),{x:510,y:0});assert.deepEqual({rng:g.rng,focus:g.reaperFocus,cooldowns:[...g.cooldowns]},before);
 captain.active=false;assert.deepEqual(calamitySuggestedPoint(g,1),{x:100,y:0});offscreen.y=300;assert.deepEqual(calamitySuggestedPoint(g,1),{x:100,y:300});
});
test('Calamity clusters prey, excludes out-of-range positions, and supplies legal empty-arena placement',()=>{
 const g=arena();enemy(g,-450,0);for(let n=0;n<5;n++)enemy(g,260+n*30,50);enemy(g,900,0,'titan');
 assert.ok(calamitySuggestedPoint(g,1).x>200);g.enemies.forEach(e=>e.active=false);g.player.x=1000;g.movementAngle=0;
 const p=calamitySuggestedPoint(g,1);assert.ok(g.insideMap(p.x,p.y));assert.ok(Math.hypot(p.x-g.player.x,p.y-g.player.y)<=750);
});
