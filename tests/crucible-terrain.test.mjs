import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {CRUCIBLE_MAP} from '../src/crucible-layout.ts';
import {CrucibleTerrain} from '../src/crucible-terrain.ts';
import {Crucible,CRUCIBLE} from '../src/crucible-sim.ts';
import {validateCrucibleMap} from '../tools/import-crucible-map.mjs';
import {documentFloor} from '../src/realm-map-document.ts';

test('the shipped editor document and gameplay compile from identical terrain and anchors',()=>{
 const doc=validateCrucibleMap(JSON.parse(fs.readFileSync('public/assets/crucible/map-document.json','utf8')));doc.background.dataUrl='';assert.deepEqual(doc,CRUCIBLE_MAP);
});
test('all camp spawns, guardians and complete army centerlines have body clearance',()=>{
 const g=new Crucible(17);for(const t of g.teams){assert.ok(g.terrain.walkable(t.champion.x,t.champion.y,27));assert.ok(g.terrain.walkable(t.crystal.x,t.crystal.y,48));for(const u of t.guards)assert.ok(g.terrain.walkable(u.x,u.y,25));}
 const {nodes,edges}=g.laneSegments();for(const [a,b] of edges)for(let i=0;i<=20;i++){const x=nodes[a].x+(nodes[b].x-nodes[a].x)*i/20,y=nodes[a].y+(nodes[b].y-nodes[a].y)*i/20;assert.ok(g.terrain.walkable(x,y,30),`${a}-${b} sample ${i}`);}
});
test('solid ridges block feet and sight, while flight crosses and safely lands',()=>{
 const terrain=new CrucibleTerrain(CRUCIBLE_MAP);for(const s of terrain.solids){const point={x:(s.left+s.right)/2,y:(s.top+s.bottom)/2};assert.equal(terrain.walkable(point.x,point.y),false);const left={x:s.left-100,y:point.y},right={x:s.right+100,y:point.y};assert.equal(terrain.lineVisible(left,right),false);const airborne={...point};terrain.slide(airborne,27,undefined,true);assert.deepEqual(airborne,point);terrain.slide(airborne,27);assert.ok(terrain.walkable(airborne.x,airborne.y,27));}
});
test('shared army vision cannot reveal a rival through a sight blocker',()=>{
 const g=new Crucible(17),s=g.terrain.solids[0],a=g.teams[0].champion,b=g.teams[1].champion;for(const u of g.units)u.active=false;a.active=b.active=true;a.x=s.left-50;b.x=s.right+50;a.y=b.y=(s.top+s.bottom)/2;assert.ok(Math.hypot(a.x-b.x,a.y-b.y)<620);assert.equal(g.intel.sees(0,b),false);b.x=a.x+20;assert.equal(g.intel.sees(0,b),true);
});
test('caustic pools slow grounded units but leave flight unaffected',()=>{
 const t=new CrucibleTerrain(CRUCIBLE_MAP);for(const s of t.slows){const p={x:(s.left+s.right)/2,y:(s.top+s.bottom)/2};assert.ok(t.walkable(p.x,p.y,27));assert.equal(t.speedAt(p),.6);assert.equal(t.speedAt(p,true),1);assert.equal(t.hazardAt(p),180);assert.equal(t.hazardAt(p,true),0);}
});
test('grounded path steering reaches the other side of a ridge instead of sticking at its edge',()=>{
 const t=new CrucibleTerrain(CRUCIBLE_MAP),s=t.solids[0],u={x:s.left-130,y:(s.top+s.bottom)/2},goal={x:s.right+130,y:u.y};for(let step=0;step<1600&&Math.hypot(u.x-goal.x,u.y-goal.y)>25;step++){const target=t.steer(1,u,goal,step/30),dx=target.x-u.x,dy=target.y-u.y,d=Math.hypot(dx,dy)||1,old={...u};u.x+=dx/d*6;u.y+=dy/d*6;t.slide(u,27,old);assert.ok(t.walkable(u.x,u.y,27));}assert.ok(Math.hypot(u.x-goal.x,u.y-goal.y)<30,JSON.stringify(u));
});
test('last paint wins on the compiled grid; solid bases and independent sight remain separate',()=>{
 const doc=structuredClone(CRUCIBLE_MAP),points=[[100,100],[200,100],[200,200],[100,200]];doc.structures=[];doc.terrain={sight:[{id:'cover',name:'Cover',points}],slows:[],hazards:[]};doc.patches.push({add:false,points},{add:true,points});let t=new CrucibleTerrain(doc);assert.equal(t.walkable(600,600,27),true);assert.equal(t.lineVisible({x:350,y:600},{x:850,y:600}),false);doc.patches.push({add:false,points});t=new CrucibleTerrain(structuredClone(doc));assert.equal(t.walkable(600,600),false);
});
test('crystal-less rivals leave the obsolete escort point and continue contesting a defended enemy base',()=>{
 const g=new Crucible(17,'hell'),team=0,t=g.teams[team],target=1;for(const u of g.units)u.active=false;for(const v of g.teams){v.respawnAt=1e9;v.wave=1e9;v.plan=1e9;v.shopping=false;}const enemy=g.teams[target];enemy.crystal.active=true;enemy.guards.forEach(u=>u.active=true);t.champion.active=true;t.champion.hp=t.champion.maxHp;t.champion.invuln=100;t.goal=target;t.plan=1e9;const point=g.escort(team,target);Object.assign(t.champion,{x:point.x,y:point.y});const start={x:t.champion.x,y:t.champion.y},before=Math.hypot(start.x-enemy.crystal.x,start.y-enemy.crystal.y);g.combat.actors[team].nextCast=1e9;for(let i=0;i<90;i++)g.step(1/30);assert.ok(Math.hypot(t.champion.x-start.x,t.champion.y-start.y)>100);assert.ok(Math.hypot(t.champion.x-enemy.crystal.x,t.champion.y-enemy.crystal.y)<before-75);
});
test('imported edits must retain usable camp and guardian positions',()=>{
 const doc=JSON.parse(fs.readFileSync('public/assets/crucible/map-document.json','utf8'));doc.rooms[0][4]=[0,0];assert.throws(()=>validateCrucibleMap(doc),/blocked/);
});
test('many overwritten strokes compile to final floor and do not become navigation layers',()=>{
 const doc=structuredClone(CRUCIBLE_MAP);doc.structures=[];doc.terrain={sight:[],slows:[],hazards:[]};const points=[[100,100],[200,100],[200,200],[100,200]];for(let i=0;i<1000;i++)doc.patches.push({add:i%2===1,points});const t=new CrucibleTerrain(doc);assert.equal(t.nodes.length,0);assert.equal(t.walkable(600,600,27),true);for(let y=100;y<900;y+=32)for(let x=100;x<900;x+=32)assert.equal(t.walkable(x,y),documentFloor(doc,x/4,y/4));
});
test('navigation detours around a painted block without retaining individual paint strokes',()=>{
 const doc=structuredClone(CRUCIBLE_MAP);doc.structures=[];doc.terrain={sight:[],slows:[],hazards:[]};doc.patches.push({add:false,points:[[200,100],[250,100],[250,250],[200,250]]});const t=new CrucibleTerrain(doc),u={x:650,y:700},goal={x:1150,y:700};for(let i=0;i<900&&Math.hypot(u.x-goal.x,u.y-goal.y)>30;i++){const target=t.steer(99,u,goal,i/30),dx=target.x-u.x,dy=target.y-u.y,d=Math.hypot(dx,dy)||1,old={...u};u.x+=dx/d*6;u.y+=dy/d*6;t.slide(u,27,old);}assert.ok(Math.hypot(u.x-goal.x,u.y-goal.y)<35,JSON.stringify(u));
});
