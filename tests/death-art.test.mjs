import test from 'node:test';import assert from 'node:assert/strict';import {Game} from '../src/simulation.ts';
test('vortex and catastrophe remains retain source and creature art without altering projectile physics',()=>{
 for(const phase of [0,1])for(const source of ['vortex','ultimate']){const g=new Game(41,{monsterId:'calamity'},phase),e=g.spawn('thrall');Object.assign(e,{x:0,y:0,hp:1,vx:140,vy:20});const rng=g.rng;assert.equal(g.damage(e,999,source),true);const death=g.effects.find(e=>e.kind==='blood').death;assert.deepEqual(death,{source,sprite:'thrall'});assert.deepEqual(g.debris[0].death,death);assert.equal(g.debris[0].vx,140);assert.equal(g.debris[0].vy,20);assert.equal(g.debris[0].life,.6);assert.equal(g.rng,rng);}
});
