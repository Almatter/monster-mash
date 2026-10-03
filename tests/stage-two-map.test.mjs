import test from 'node:test';
import assert from 'node:assert/strict';
import {blindDiscovery} from './stage-two-discovery.mjs';
import {Game} from '../src/simulation.ts';
import {initializeCourt} from '../src/stage-two.ts';
import {COURT_ROCKS,COURT_RIDGE_ART,COURT_LANDMARKS,COURT_SITE_GROUPS,insideCourt,slideCourt,courtArtVisible} from '../src/court-map.ts';

test('all ten captain regions are occupied, deterministic, and rotate between seeded runs',()=>{
 const seen=COURT_SITE_GROUPS.map(()=>new Set());
 for(let seed=1;seed<=100;seed++){
  const g=new Game(Math.imul(seed,2654435761)>>>0,{},1);initializeCourt(g);
  assert.equal(g.court.camps.length,10);
  COURT_SITE_GROUPS.forEach((group,i)=>{
   const selected=g.court.camps.filter(c=>group.some(p=>p.x===c.x&&p.y===c.y));
   assert.equal(selected.length,1);seen[i].add(selected[0].x+':'+selected[0].y);
  });
 }
 seen.forEach(choices=>assert.equal(choices.size,2));
});

test('stone footprints block only their compact core and leave adjacent ground walkable',()=>{
 for(const r of COURT_ROCKS.filter(r=>r.kind==='ridge')){
  assert.equal(insideCourt(r.x,r.y,23),false);
  const body={x:r.x-Math.sin(r.angle)*90,y:r.y+Math.cos(r.angle)*90},before={...body};
  assert.equal(insideCourt(body.x,body.y,23),true);
  slideCourt(body,23);assert.deepEqual(body,before);
 }
 for(const id of ['rib-gate','broken-bell']){
  const p=COURT_LANDMARKS.find(p=>p.id===id);
  assert.equal(insideCourt(p.x,p.y,23),true,'open arch remains walkable');
  for(const f of p.feet)assert.equal(insideCourt(p.x+f.x,p.y+f.y,23),false);
 }
});

test('partly visible terrain stays drawn on every viewport edge, including rotated ridges',()=>{
 const {width,height}=COURT_RIDGE_ART,halfW=700,halfH=450;
 for(const angle of [0,Math.PI/2,Math.PI/4]){
  const xHalf=(Math.abs(Math.cos(angle))*width+Math.abs(Math.sin(angle))*height)/2;
  const yHalf=(Math.abs(Math.sin(angle))*width+Math.abs(Math.cos(angle))*height)/2;
  for(const sign of [-1,1]){
   assert.equal(courtArtVisible(sign*(halfW+xHalf-1),0,width,height,angle,0,0,halfW,halfH),true);
   assert.equal(courtArtVisible(0,sign*(halfH+yHalf-1),width,height,angle,0,0,halfW,halfH),true);
   assert.equal(courtArtVisible(sign*(halfW+xHalf+33),0,width,height,angle,0,0,halfW,halfH),false);
   assert.equal(courtArtVisible(0,sign*(halfH+yHalf+33),width,height,angle,0,0,halfW,halfH),false);
  }
 }
});

// Movement has no knowledge of sites, hidden captains or the search route.
// No dashes, damage immunity, healing injection or teleports. Phone landscape
// visibility is checked against the actual spawned captain, not just camp range.
test('blind walking finds a visible captain before two minutes for every kit and tested opening direction',()=>{
 for(const id of ['devourer','titan','sovereign','calamity','overlord'])for(const seed of [77,123,444])for(let h=0;h<16;h++)for(const style of ['straight','curved','wandering']){
  const seconds=blindDiscovery(id,seed,h*Math.PI/8,style);
  assert.ok(seconds<=120,id+' seed '+seed+' heading '+h+' '+style+' discovery '+seconds);
 }
});
