import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Crucible} from '../src/crucible-sim.ts';
import {CrucibleTerrain} from '../src/crucible-terrain.ts';
import {CRUCIBLE_MAP} from '../src/crucible-layout.ts';
import {realmMaximum} from '../src/hunt-grade.ts';
import {hagState} from '../src/hag.ts';
import {bakeCrucibleRoutes} from '../tools/bake-crucible-routes.mjs';

test('shipped minion lanes are baked clear of pools and fires, and rebaking is stable',()=>{
 const t=new CrucibleTerrain(CRUCIBLE_MAP);
 for(const deck of CRUCIBLE_MAP.decks)for(let i=1;i<deck[2].length;i++){
  const a=deck[2][i-1],b=deck[2][i],count=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])*4/10);
  for(let k=0;k<=count;k++){const p={x:(a[0]+(b[0]-a[0])*k/count)*4,y:(a[1]+(b[1]-a[1])*k/count)*4,radius:16};assert.equal(t.hazardAt(p),0,deck[0]);assert.equal(t.speedAt(p),1,deck[0]);}
 }
 assert.deepEqual(bakeCrucibleRoutes(CRUCIBLE_MAP).decks,CRUCIBLE_MAP.decks);
});
test('marching minions never invoke live terrain pathfinding',()=>{
 const g=quiet();g.teams[0].crystal.active=g.teams[1].crystal.active=true;const u=g.units.find(u=>u.team===0&&u.kind==='infantry');Object.assign(u,{active:true,...g.rally(0),marched:true,invuln:0});g.terrain.steer=()=>{throw Error('Minion requested live pathfinding');};for(let i=0;i<30;i++)g.step(1/30);assert.ok(u.active);
});

function quiet(){const g=new Crucible(17,'hell');for(const u of g.units)u.active=false;for(const t of g.teams){t.wave=t.respawnAt=t.plan=1e9;t.trapReady=[1e9,1e9,1e9];}return g;}
test('AI can walk around each caustic pool while the player can still enter it',()=>{
 for(const method of ['steer']){const t=new CrucibleTerrain(CRUCIBLE_MAP);
 for(const [id,s] of t.slows.entries()){
  const u={x:s.left-110,y:(s.top+s.bottom)/2,radius:13},goal={x:s.right+110,y:u.y};let touches=0;
  for(let i=0;i<350&&Math.hypot(u.x-goal.x,u.y-goal.y)>20;i++){
   const p=t[method](id,u,goal,i/30),d=Math.hypot(p.x-u.x,p.y-u.y)||1,old={...u};u.x+=(p.x-u.x)/d*5;u.y+=(p.y-u.y)/d*5;t.slide(u,27,old);if(t.hazardAt(u))touches++;
  }
  assert.ok(Math.hypot(u.x-goal.x,u.y-goal.y)<25,JSON.stringify(u));assert.equal(touches,0);
  assert.ok(t.walkable((s.left+s.right)/2,(s.top+s.bottom)/2,27));
 }}
});
test('pool damage kills grounded units, respects flight, and grants no self kill',()=>{
 const g=quiet(),s=g.terrain.slows[0],u=g.teams[0].champion;g.controlled=0;Object.assign(u,{active:true,x:(s.left+s.right)/2,y:(s.top+s.bottom)/2,hp:8,invuln:3});g.rebuild();for(let i=0;i<4;i++)g.step(1/30);assert.equal(u.active,false);assert.equal(g.teams[0].deaths,1);assert.equal(g.teams[0].kills,0);
 const h=quiet(),v=h.teams[0].champion;h.controlled=0;Object.assign(v,{active:true,x:(s.left+s.right)/2,y:(s.top+s.bottom)/2,hp:8,invuln:0});hagState(h.combat.actors[0].brain).flight=2;h.step(1/30);assert.ok(v.active&&v.hp>=8);
});
test('a recent attacker receives credit when its victim dies in a hazard',()=>{
 const g=quiet(),s=g.terrain.slows[0],u=g.teams[1].champion;g.controlled=1;Object.assign(u,{active:true,x:(s.left+s.right)/2,y:(s.top+s.bottom)/2,hp:4,invuln:0});u.contributions[0]=g.time;g.step(1/30);assert.equal(u.active,false);assert.equal(g.teams[0].kills,1);assert.equal(u.contributions[0],0);
});
test('every painted fire has matching damage and flight-safe contact rules',()=>{
 const t=new CrucibleTerrain(CRUCIBLE_MAP),fires=CRUCIBLE_MAP.terrain.hazards.filter(h=>h.id.startsWith('fire-'));assert.ok(fires.length>40);
 for(const f of fires){const p={x:f.points.reduce((n,q)=>n+q[0],0)/f.points.length*4,y:f.points.reduce((n,q)=>n+q[1],0)/f.points.length*4};assert.ok(t.hazardAt(p)>=220);assert.equal(t.hazardAt(p,true),0);}
});
test('Iron Will shortens fear once rather than continuously shrinking its remaining duration',()=>{
 const g=quiet(),a=g.teams[1].champion,v=g.teams[0].champion;Object.assign(a,{active:true,x:2400,y:2400});Object.assign(v,{active:true,x:2500,y:2400});g.teams[0].upgrades.resolve=3;g.rebuild();g.combat.prepare(1);const p=g.combat.actors[1].proxies.get(v.id);p.fearedUntil=4;g.combat.flush(1,0);assert.ok(Math.abs(v.fear-1.6)<1e-8);g.time=1;g.combat.actors[1].brain.time=1;v.fear=0;g.combat.flush(1,0);assert.ok(Math.abs(v.fear-.6)<1e-8);
});
test('Rooted Soul reduces displacement and Antivenom shortens real Hag venom',()=>{
 const g=quiet(),a=g.teams[0].champion,v=g.teams[1].champion;Object.assign(a,{active:true,x:2400,y:1700});Object.assign(v,{active:true,x:2500,y:1700});g.teams[1].upgrades.anchor=3;g.teams[1].upgrades.antivenom=3;g.rebuild();g.combat.prepare(0);const b=g.combat.actors[0].brain,p=g.combat.actors[0].proxies.get(v.id);b.damage(p,1,'hagvenom');p.vx=100;p.vy=0;const before=v.x;g.combat.flush(0,.1);assert.ok(Math.abs(v.x-before-.8)<1e-8);assert.ok(Math.abs(hagState(b).venom[0].remaining-1.6)<1e-8);
});
test('relic lasers choose nearest intruder, retaliate, and never shoot outside their platform',()=>{
 const g=quiet(),t=g.teams[0],a=g.teams[1].champion,b=g.teams[2].champion;Object.assign(t.champion,{active:true,x:t.crystal.x,y:t.crystal.y});t.crystal.active=true;
 for(const [u,dx] of [[a,100],[b,180]])Object.assign(u,{active:true,x:t.crystal.x+dx,y:t.crystal.y,invuln:0});g.rebuild();assert.equal(g.target(t.crystal),a);g.damage(t.champion,1,b.team,false,false,b);assert.equal(g.target(t.crystal),b);const before=b.hp;g.fire(t.crystal,b);assert.ok(b.hp<before);assert.equal(g.shots.length,0);assert.equal(g.effects.at(-1).art,'relic-beam');b.x=t.crystal.x+g.baseDomain(0)+10;g.rebuild();assert.equal(g.target(t.crystal),a);
});
test('army orders stop at an active base encountered on the road after half the crystals fall',()=>{
 const g=quiet();for(let i=0;i<4;i++){g.teams[i].crystal.active=true;g.teams[i].guards.forEach(u=>u.active=true);}const nodes=Array.from({length:16},(_,i)=>({x:i*100,y:0}));
 // Army 0 must pass the approach of base 2 to reach base 3.
 g.lanes={nodes,edges:[[0,2],[2,3],[3,11],[2,10]]};g.teams[2].crystal.x=200;g.teams[2].crystal.y=0;g.teams[3].crystal.x=1100;g.teams[3].crystal.y=0;g.teams[1].crystal.x=4000;g.teams[1].crystal.y=4000;g.teams[0].armyGoal=3;assert.equal(g.armyObjective(0).team,2);
});
test('a Normal victory alone exceeds the current Stage 3 maximum without idle-time score farming',()=>{
 const max=Object.values(realmMaximum('2026.10-v47-titan-realm')).reduce((a,b)=>a+b,0),g=new Crucible(17,'normal');g.winner=0;assert.ok(g.result(0).dominance>max);const before=g.result(0).dominance;g.time=10000;assert.equal(g.result(0).dominance,before);assert.equal(g.result(1).bonus,0);
});
