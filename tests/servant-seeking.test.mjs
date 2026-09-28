import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../src/simulation.ts';
import {addServant,updateServants} from '../src/servants.ts';

function enemy(g,x,y){g.spawn('thrall');const e=g.enemies.find(e=>e.active&&e.serial===g.serial);e.x=x;e.y=y;e.hp=e.maxHp=1e9;g.rebuildGrid();return e;}

test('raised undead acquire a distant enemy and leave Overlord to attack it',()=>{
 const g=new Game(31,{monsterId:'overlord'});addServant(g,0,0,'summoned');const foe=enemy(g,630,0);updateServants(g,1/60);
 const ally=g.servants.find(s=>s.active);assert.equal(ally.target,foe);assert.ok(ally.x>0);
});

test('servants at opposite flanks pursue different distant prey while Overlord is safe',()=>{
 const g=new Game(31,{monsterId:'overlord'});addServant(g,-120,0,'summoned');addServant(g,120,0,'summoned');
 const west=enemy(g,-600,0),east=enemy(g,600,0);updateServants(g,1/60);
 const [left,right]=g.servants.filter(s=>s.active);assert.equal(left.target,west);assert.equal(right.target,east);
 assert.ok(left.x<-120&&right.x>120);
});

test('undead patrol around Overlord instead of piling onto him when no prey is nearby',()=>{
 const g=new Game(31,{monsterId:'overlord'});for(let i=0;i<6;i++)addServant(g,0,0,'summoned');
 for(let i=0;i<90;i++)updateServants(g,1/60);
 const allies=g.servants.filter(s=>s.active);assert.ok(allies.every(s=>Math.hypot(s.x-g.player.x,s.y-g.player.y)>45));
 assert.ok(Math.hypot(allies[0].x-allies[1].x,allies[0].y-allies[1].y)>20);
});


test('when enemies threaten Overlord, servants retain the close defensive search',()=>{
 const g=new Game(31,{monsterId:'overlord'});addServant(g,0,0,'summoned');const near=enemy(g,120,0),far=enemy(g,630,0);updateServants(g,1/60);
 const ally=g.servants.find(s=>s.active);assert.equal(ally.target,near);assert.notEqual(ally.target,far);
});
