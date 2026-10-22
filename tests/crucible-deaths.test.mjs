import {test} from 'node:test';
import assert from 'node:assert/strict';
import {CrucibleDeaths,damageDetail} from '../src/crucible-deaths.ts';
import {Crucible} from '../src/crucible-sim.ts';
import {CRUCIBLE_MAP} from '../src/crucible-layout.ts';
test('death histories aggregate health and ward damage over eight seconds and identify the actual last attacker',()=>{
 const log=new CrucibleDeaths();log.record(0,1,'old','aoe',500,0);log.record(0,10,'A','ranged',100,50);log.record(0,10.05,'B','contact',30,0);log.record(0,10.1,'A','ranged',20,0);
 assert.equal(log.lastSources[0],'A');const report=log.finish(0,11,'Hag',log.lastSources[0],['Poisoned']);assert.equal(report.health,150);assert.equal(report.shield,50);assert.equal(report.finalBlow,'A');assert.equal(report.sources.length,2);assert.deepEqual(report.effects,['Poisoned']);assert.equal(log.hits[0].length,0);assert.equal(report.sources[0].health,120);
});
test('continuous hits and long matches have bounded report storage',()=>{
 const log=new CrucibleDeaths();for(let i=0;i<2000;i++)log.record(1,i/100,'beam','aoe',1,0);assert.ok(log.hits[1].length<=33);for(let i=0;i<200;i++){log.record(1,20+i,'beam','aoe',1,0);log.finish(1,20+i,'Titan','beam');}assert.equal(log.reports.length,64);
});
test('actual Stage 4 champion deaths retain defenses, shield absorption, effects and a detailed battle-log entry',()=>{
 const map={...CRUCIBLE_MAP,structures:[],zones:[],terrain:{sight:[],slows:[],hazards:[]}},g=new Crucible(17,'hell',map),hero=g.teams[0].champion,attacker=g.teams[1].champion,guard=g.teams[1].guards[0];
 hero.invuln=0;g.combat.actors[0].brain.shield=120;g.damage(hero,100,1,false,false,attacker,'aoe',undefined,false,false,false,'Ignited Miasma');hero.poison=2;hero.stun=1;g.damage(hero,1e6,1,false,true,guard,'ranged');
 const report=g.deaths.reports[0];assert.equal(hero.active,false);assert.ok(report.shield>0);assert.ok(report.health>0);assert.match(report.finalBlow,/Guardian bolt/);assert.ok(report.sources.some(r=>r.source.includes('Ignited Miasma')));assert.deepEqual(report.effects,['Poisoned','Stunned']);assert.ok(g.events.some(e=>e.recap===report));
});
test('native power sources are named without revealing an unseen build',()=>{
 assert.equal(damageDetail('direct','Widow Venom',[]),'Widow Venom');assert.equal(damageDetail('hagignite','',[]),'Ignited Miasma');assert.equal(damageDetail('beam','',[{id:'ray',name:'Death Beam',effect:'beam'}]),'Death Beam');
});
