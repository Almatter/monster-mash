import test from 'node:test';import assert from 'node:assert/strict';
import {Game} from '../src/simulation.ts';import {COURT_BOUNDS,COURT_ROCKS,COURT_BORDER,COURT_BORDER_EDGES,COURT_SITES,COURT_SHRINES,courtBoundaryAt,insideCourt,slideCourt,courtSteer,courtArtVisible} from '../src/court-map.ts';
const idle={x:0,y:0,aimX:400,aimY:0,aiming:true};
const fixture=id=>{const g=new Game(77,{monsterId:id},1);g.court.initialized=true;g.spawn=()=>undefined;g.attack=1e6;return g;};

test('a blocked chained Lunge ends at every map edge and immediately permits an inward retreat',()=>{
 for(const angle of [-Math.PI/2,Math.PI/2,0,Math.PI])for(const haste of [0,3]){
  const g=fixture('devourer');g.court.upgrades=Array(haste).fill('haste');g.time=180;
  const b=courtBoundaryAt(0,0,23),out={x:Math.cos(angle),y:Math.sin(angle)};
  g.player.x=angle===0?b.right-2:angle===Math.PI?b.left+2:0;g.player.y=angle<0?b.top+2:angle===Math.PI/2?b.bottom-2:0;
  g.setMovementDirection(out.x,out.y);for(let n=0;n<3;n++)assert.ok(g.cast(0));
  g.update(1/60,{...idle,...out});assert.equal(g.dash,null,'outward impulse cannot keep pinning the body');assert.ok(insideCourt(g.player.x,g.player.y,22.99));
  const before={...g.player};for(let n=0;n<30;n++)g.update(1/60,{...idle,x:-out.x,y:-out.y});
  assert.ok((g.player.x-before.x)*-out.x+(g.player.y-before.y)*-out.y>100);
 }
});

test('Titan Stampede stops at a solid edge and ordinary Stage 1 dash behavior is untouched',()=>{
 const g=fixture('titan'),b=courtBoundaryAt(0,0,23);g.player.y=b.top+2;g.setMovementDirection(0,-1);assert.ok(g.cast(1));g.update(1/60,{...idle,x:0,y:-1});assert.equal(g.dash,null);
 const old=new Game(77,{monsterId:'devourer'},0);old.release=4;old.player.y=-1490;old.setMovementDirection(0,-1);old.cast(0);old.update(1/60,{...idle,x:0,y:-1});assert.ok(old.dash);
});

test('uneven border clamps bodies onto its inner face at samples and corners without trapping inward movement',()=>{
 assert.equal(COURT_BORDER_EDGES.length,4);assert.ok(COURT_BORDER.length<160);
 for(const edge of COURT_BORDER_EDGES)assert.ok(new Set(edge.points.map(p=>Math.round(edge.axis==='x'?p.y:p.x))).size>20);
 for(const radius of [12,23,48])for(const [x,y] of [[-1e5,-1e5],[1e5,-1e5],[-1e5,1e5],[1e5,1e5],...Array.from({length:41},(_,i)=>[-9600+i*480,-9000]),...Array.from({length:31},(_,i)=>[11000,-7200+i*480])]){
  const body={x,y};slideCourt(body,radius);assert.ok(insideCourt(body.x,body.y,radius-.01),JSON.stringify({body,radius}));
  const before={...body},d=courtSteer(body.x,body.y,0,0);body.x+=d.x*50;body.y+=d.y*50;slideCourt(body,radius);assert.ok(Math.hypot(body.x-before.x,body.y-before.y)>20);
 }
 for(const p of [...COURT_SITES,...COURT_SHRINES])assert.ok(insideCourt(p.x,p.y,48));
});

test('cross-map horizontal and vertical traverses encounter interior formations in the actual bounded view',()=>{
 assert.ok(COURT_ROCKS.length>=45&&COURT_ROCKS.length<=65);
 const encountered=(x,y)=>COURT_ROCKS.some(r=>courtArtVisible(r.x,r.y,r.width,r.height,r.angle,x,y,600,380));
 for(let y=-6500;y<=6500;y+=100)assert.ok(Array.from({length:65},(_,i)=>-8000+i*250).some(x=>encountered(x,y)),'empty horizontal route at '+y);
 for(let x=-8900;x<=8900;x+=100)assert.ok(Array.from({length:49},(_,i)=>-6000+i*250).some(y=>encountered(x,y)),'empty vertical route at '+x);
});

test('a mass of wall-contact enemies finds routes instead of staying jammed on the navigation margin',()=>{
 const g=new Game(77,{monsterId:'devourer'},1);g.court.initialized=true;g.player.invuln=1e6;g.attack=1e6;const r=COURT_ROCKS.find(r=>r.kind==='crescent'),local=(x,y)=>({x:r.x+Math.cos(r.angle)*x-Math.sin(r.angle)*y,y:r.y+Math.sin(r.angle)*x+Math.cos(r.angle)*y});Object.assign(g.player,local(0,130));
 const starts=[];for(let n=0;n<200;n++){const e=g.spawn('thrall'),t=.25+(n%40)/80;Object.assign(e,local(-188+191*t-10,-123-32*t-63),{hp:1e9,maxHp:1e9});starts.push({e,x:e.x,y:e.y});}g.spawn=()=>undefined;g.rebuildGrid();
 for(let frame=0;frame<1200;frame++)g.update(1/60,idle);
 assert.ok(starts.filter(s=>Math.hypot(s.e.x-s.x,s.e.y-s.y)>200).length>=190);
 assert.ok(starts.filter(s=>Math.hypot(s.e.x-g.player.x,s.e.y-g.player.y)<250).length>=180);
});
