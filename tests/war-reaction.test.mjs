import {test} from 'node:test';
import assert from 'node:assert/strict';
import {WarGame} from '../src/stage-four.ts';
import {WAR_REACTION,createWarReaction,observeWarTarget,warReactionReady} from '../src/war-reaction.ts';

test('rival notice delay varies within bounds and does not restart while tracking the same target',()=>{
 for(const random of [()=>0,()=>.5,()=>1]){
  const r=createWarReaction();observeWarTarget(r,1,{x:1,y:2},10,random);const at=r.readyAt;
  assert.ok(at>=10.45&&at<=10.75);assert.equal(warReactionReady(r,10.44),false);assert.equal(warReactionReady(r,at),true);
  observeWarTarget(r,1,{x:2,y:3},10.1,random);assert.equal(r.readyAt,at);
 }
});

test('target switches, losing sight and reacquisition each require a fresh reaction',()=>{
 const r=createWarReaction(),p={x:0,y:0},random=()=>0;observeWarTarget(r,-1,p,1,random);assert.ok(warReactionReady(r,1.5));
 observeWarTarget(r,42,p,1.6,random);assert.equal(warReactionReady(r,1.7),false);assert.ok(warReactionReady(r,2.1));
 observeWarTarget(r,null,null,2.2,random);assert.equal(warReactionReady(r,10),false);observeWarTarget(r,42,p,10,random);assert.equal(warReactionReady(r,10.1),false);assert.equal(r.readyAt,10.45);
});

test('rival aim uses a copied position and refreshes after its perception interval',()=>{
 const r=createWarReaction(),p={x:20,y:30},random=()=>0;observeWarTarget(r,1,p,1,random);p.x=300;observeWarTarget(r,1,p,1.1,random);assert.equal(r.aim.x,20);observeWarTarget(r,1,p,1.21,random);assert.equal(r.aim.x,300);assert.ok(WAR_REACTION.aimMin>=.2);
});

function setup(){const g=new WarGame(77,{monsterId:'hag'});g.time=1;g.war.allies=[];for(const body of g.enemies)body.active=false;const e=g.war.leaders.find(l=>l.monsterId==='reaper').actor,a=g.war.actors.get(e.serial);e.active=true;e.x=g.player.x+60;e.y=g.player.y;return {g,e,a,b:a.brain};}
test('basic attacks wait for perception, then resume without changing their normal attack speed',()=>{
 const {g,e,a,b}=setup();b.cast=()=>false;g.brain(e,a,.05);assert.equal(b.attack,0);assert.equal(b.scytheWaves.length,0);
 g.time=a.reaction.readyAt-.01;g.brain(e,a,.05);assert.equal(b.attack,0);
 g.time=a.reaction.readyAt+.01;e.x=g.player.x+60;e.y=g.player.y;g.brain(e,a,.05);assert.ok(b.attack>0);assert.ok(b.scytheWaves.length>0);
 e.x=g.player.x+g.targetView.x+100;g.time+=.05;g.brain(e,a,.05);assert.equal(a.reaction.focus,null);
 e.x=g.player.x+60;g.time+=.1;g.brain(e,a,.05);assert.ok(a.reaction.readyAt>=g.time+.45);
});

test('a rival spaces real ability casts rather than issuing rapid ability chains',()=>{
 const {g,e,a,b}=setup(),cast=b.cast.bind(b),times=[];b.attack=999;b.cast=(...args)=>{const ok=cast(...args);if(ok)times.push(g.time);return ok;};
 for(let i=0;i<120;i++){g.time=1+i*.05;e.x=g.player.x+60;e.y=g.player.y;g.brain(e,a,.05);}
 assert.ok(times.length>=3,JSON.stringify(times));assert.ok(times[0]>=1.45);
 for(let i=1;i<times.length;i++)assert.ok(times[i]-times[i-1]>=WAR_REACTION.castMin-.001,JSON.stringify(times));
});
