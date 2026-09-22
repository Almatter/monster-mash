import test from 'node:test';
import assert from 'node:assert/strict';
import { Score } from '../src/scoring.ts';
import { Game } from '../src/simulation.ts';
import { encodeRun, decodeRun } from '../src/run-code.ts';
import { EVENT } from '../src/data.ts';
const still={x:0,y:0,aimX:100,aimY:0,aiming:true};
test('Carnage rewards momentum and decays smoothly, bounded at one and five',()=>{
 const s=new Score();for(let i=0;i<500;i++)s.kill(10,'thrall',0);
 assert.equal(s.carnage,5);assert.equal(s.kills,500);assert.ok(s.dominance>5000);
 s.update(2,2);assert.ok(s.carnage<5&&s.carnage>4);s.update(100,102);assert.equal(s.carnage,1);
});
test('multikills, elite kills and feats award explicit bonuses with cooldowns',()=>{
 const s=new Score();s.kill(250,'elite',0);assert.equal(s.elites,1);const before=s.dominance;
 s.multikill(40);assert.equal(s.dominance,before+200);assert.equal(s.largestMulti,40);
 assert.equal(s.evaluate(1,{multi:40}).length,1);assert.equal(s.evaluate(2,{multi:40}).length,0);assert.equal(s.evaluate(22,{multi:40}).length,1);
});
test('run codes round trip Unicode and reject edits, malformed or inconsistent statistics',async()=>{
 const r={version:1,rules:'2026.10-v1',phase:0,name:'鬼王 🦇',seed:123,duration:600,score:40000,kills:2000,wave:21,elites:3,titans:1,multi:88,peak:4.2,feats:{massacre:2},ended:'2026-10-01T00:00:00Z',reason:'overwhelmed'};
 const code=await encodeRun(r);assert.deepEqual(await decodeRun(code),r);
 await assert.rejects(()=>decodeRun(code.slice(0,-1)+(code.endsWith('0')?'1':'0')));
 await assert.rejects(()=>decodeRun('MM1.nonsense.bad'));
 await assert.rejects(async()=>decodeRun(await encodeRun({...r,peak:10})));
});
test('all powers, healing, damage, cooldowns and restart isolation',()=>{
 const g=new Game(42);g.wave=1;g.player.hp=500;
 for(let i=0;i<30;i++){g.spawn('thrall');const e=g.enemies.find(e=>e.active&&e.hp===22&&Math.abs(e.x)>0);e.x=50;e.y=i;}
 g.rebuildGrid();assert.equal(g.cast(1),true);assert.ok(g.player.hp>500);assert.ok(g.score.kills>0);assert.equal(g.cast(1),false);
 for(const i of [0,2,3])assert.equal(g.cast(i),true);
 g.player.invuln=0;g.hurt(10000);assert.equal(g.ended,true);
 const fresh=new Game(42);assert.equal(fresh.score.kills,0);assert.equal(fresh.alive,0);assert.equal(fresh.effects.length,0);assert.deepEqual(fresh.cooldowns,[0,0,0,0]);
});
test('fixed seed and input produce identical combat outcomes',()=>{
 const a=new Game(1337),b=new Game(1337);
 for(let frame=0;frame<1800;frame++){for(const g of [a,b]){g.update(1/60,still);if(frame%120===0)g.cast(0);}}
 assert.equal(a.score.dominance,b.score.dominance);assert.equal(a.player.hp,b.player.hp);assert.equal(a.rng,b.rng);
});
test('12 minute soak at high density stays bounded and finite',()=>{
 const g=new Game(88);let maxAlive=0;const start=performance.now();
 for(let frame=0;frame<60*720;frame++){
  g.player.hp=1000;g.ended=false;
  const a=frame/600;g.update(1/60,{x:Math.cos(a),y:Math.sin(a),aimX:g.player.x+400,aimY:g.player.y,aiming:true});
  for(let i=0;i<4;i++)if(frame%30===0)g.cast(i);
  maxAlive=Math.max(maxAlive,g.alive);
  assert.ok(g.alive<=EVENT.maxEnemies);assert.ok(g.effects.length<=180);assert.ok(g.shots.length<=180);
 }
 assert.ok(g.score.kills>3000);assert.ok(Number.isFinite(g.score.dominance));assert.equal(g.enemies.filter(e=>e.active).length,g.alive);
 console.log(`12-minute soak: ${g.score.kills} kills; peak ${maxAlive} active; ${(performance.now()-start).toFixed(0)} ms simulated.`);
});
