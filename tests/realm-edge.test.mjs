import test from 'node:test';
import assert from 'node:assert/strict';
import {REALM_EDGE,REALM_PATHS,insideRealm,moveRealm,slideRealm,REALM_GROTTOS,REALM_START,realmWaypoint,realmAltar,realmPortal,REALM_CLUES,inTitanArena} from '../src/titan-realm-map.ts';
import {Game} from '../src/simulation.ts';
import {parkourLanding} from '../src/lycanthrope.ts';
test('walking, knockback and dashes cannot escape floor edges or cross the outer mana boundary',()=>{for(const shrine of REALM_GROTTOS)for(const radius of [23,24,30])for(const direction of [{x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1}]){const from=realmPortal(shrine.id),body={x:from.x+direction.x*5000,y:from.y+direction.y*5000};moveRealm(body,from,radius);assert.ok(insideRealm(body.x,body.y,radius));assert.ok(Math.abs(body.x)<=REALM_EDGE-radius&&Math.abs(body.y)<=REALM_EDGE-radius);assert.equal(insideRealm(body.x+direction.x*5000,body.y+direction.y*5000,radius),false);const displaced={x:direction.x*5000,y:direction.y*5000};slideRealm(displaced,radius);assert.ok(insideRealm(displaced.x,displaced.y,radius));}});
test('all eleven routes curve and stairs, altar approaches and portals stay on walkable floors',()=>{assert.equal(REALM_PATHS.length,11);assert.equal(REALM_PATHS.filter(p=>p.stairs).length,4);for(const p of REALM_PATHS){assert.ok(p.curve.length>3);assert.ok(new Set(p.curve.map(q=>Math.round(q.x))).size>3);assert.ok(new Set(p.curve.map(q=>Math.round(q.y))).size>3);}for(const s of REALM_GROTTOS){for(const p of [realmAltar(s.id),realmPortal(s.id)])assert.ok(insideRealm(p.x,p.y,30),s.name);assert.equal(insideRealm(s.x+s.altar.x,s.y+s.altar.y,23),false);}});
test('Vault rejects ether landings while all seven shrines have a connected swept approach',()=>{const g=new Game(17,{monsterId:'lycanthrope'},2);Object.assign(g.player,REALM_START);assert.equal(parkourLanding(g,{x:REALM_EDGE+40,y:0}),null);assert.equal(parkourLanding(g,{x:700,y:700}),null);for(const s of REALM_GROTTOS){const goal=realmAltar(s.id),p={...REALM_START};for(let i=0;i<7000&&Math.hypot(p.x-goal.x,p.y-goal.y)>30;i++){const q=realmWaypoint(p.x,p.y,goal.x,goal.y),d=Math.hypot(q.x-p.x,q.y-p.y)||1,from={...p};p.x+=(q.x-p.x)/d*4;p.y+=(q.y-p.y)/d*4;moveRealm(p,from,23);}assert.ok(Math.hypot(p.x-goal.x,p.y-goal.y)<30,s.name);}});
test('every inscription is reachable by swept walking without entering the Titan seal',()=>{
 for(const start of [REALM_START,...REALM_CLUES])for(const goal of REALM_CLUES){
  const p={...start};
  for(let i=0;i<6000&&Math.hypot(p.x-goal.x,p.y-goal.y)>15;i++){
   const q=realmWaypoint(p.x,p.y,goal.x,goal.y,true),d=Math.hypot(q.x-p.x,q.y-p.y)||1,step=Math.min(d,8),from={...p};
   p.x+=(q.x-p.x)/d*step;p.y+=(q.y-p.y)/d*step;moveRealm(p,from,23);
   assert.ok(!inTitanArena(p.x,p.y));
  }
  assert.ok(Math.hypot(p.x-goal.x,p.y-goal.y)<15,JSON.stringify({start,goal,p}));
 }
});
