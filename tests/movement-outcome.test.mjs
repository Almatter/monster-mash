import test from 'node:test';import assert from 'node:assert/strict';
import {Game} from '../src/simulation.ts';import {ABILITIES,MONSTERS,abilityLabel} from '../src/content-monsters.ts';
import {runOutcome,outcomeDescription,resultText} from '../src/results.ts';
const idle={x:0,y:0,aimX:400,aimY:0,aiming:true};
test('Lunge follows cardinal/diagonal movement despite opposite aim, and actual displacement agrees',()=>{
 for(const [x,y] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1]]){
  const g=new Game(77,{monsterId:'devourer'});g.update(1/60,{...idle,x,y,aimX:-x*400,aimY:-y*400});const angle=Math.atan2(y,x);assert.equal(g.cast(0),true);assert.ok(Math.abs(g.dash.angle-angle)<1e-10);
  const start={x:g.player.x,y:g.player.y};g.update(1/60,idle);assert.ok((g.player.x-start.x)*x+(g.player.y-start.y)*y>0);
 }
});
test('stationary Lunge remembers travel, fresh casts face right, recasts redirect, invalid vectors do not corrupt direction',()=>{
 const fresh=new Game(1,{monsterId:'devourer'});fresh.player.angle=Math.PI;fresh.cast(0);assert.equal(fresh.dash.angle,0);
 const g=new Game(77,{monsterId:'devourer'});g.time=300;g.update(1/60,{...idle,x:0,y:-1});g.update(1/60,idle);g.cast(0);assert.equal(g.dash.angle,-Math.PI/2);const remaining=g.dash.remaining;
 g.setMovementDirection(-1,0);g.cast(0);assert.equal(g.dash.angle,Math.PI);assert.ok(g.dash.remaining>remaining);assert.equal(g.lungeCharges,0);assert.ok(g.dodgeInvuln>0);
 g.setMovementDirection(0,0);g.setMovementDirection(NaN,1);g.setMovementDirection(1,Infinity);assert.equal(g.movementAngle,Math.PI);
});
test('Titan Stampede retains aimed direction; all 20 ability action labels resolve to their canonical kit names',()=>{
 const g=new Game(1,{monsterId:'titan'});g.setMovementDirection(0,1);g.player.angle=Math.PI;g.cast(1);assert.equal(g.dash.angle,Math.PI);
 for(const monster of Object.values(MONSTERS))for(const id of monster.abilities){const p=ABILITIES[id],label=abilityLabel(p);assert.ok(label.includes(p.short));assert.ok(label.includes(p.name));}
 assert.equal(ABILITIES.frenzy.short,'Feast');assert.ok(!MONSTERS.devourer.basic.description.includes('Frenzy'));
});
test('outcome milestones celebrate survival without changing retirement category or ending the engine',()=>{
 assert.equal(runOutcome({reason:'overwhelmed',duration:509,release:3}),'A LEGEND IN THE MAKING');
 assert.equal(runOutcome({reason:'overwhelmed',duration:510,release:4}),'FULLY UNBOUND');
 assert.equal(runOutcome({reason:'overwhelmed',duration:599,release:4}),'FULLY UNBOUND');
 assert.equal(runOutcome({reason:'overwhelmed',duration:600,release:4}),'TEN-MINUTE LEGEND');
 assert.equal(runOutcome({reason:'retired',duration:1000,release:4}),'PRACTICE / MANUALLY ENDED');
 const g=new Game(1,{monsterId:'devourer'});g.time=600;g.update(1/60,idle);assert.equal(g.ended,false);
 const r={name:'Night',title:'The Unbound',monsterId:'devourer',rules:'2026.10-v7-movement',phase:0,reason:'overwhelmed',duration:600,release:4,score:100,kills:12,wave:21,multi:3,titans:0};
 assert.ok(resultText(r).includes('TEN-MINUTE LEGEND'));assert.ok(!resultText(r).includes('OVERWHELMED'));assert.match(outcomeDescription(r),/ten-minute milestone/);
});
