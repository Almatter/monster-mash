import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../src/simulation.ts';
import {MONSTERS} from '../src/content-monsters.ts';
import {courtProgress} from '../src/stage-two.ts';
import {normalizeProfile,recordProgress,availableTitles} from '../src/profile.ts';
import {STAGE_GATES,MASTERY_BOONS,masteryProgress,gateChallengeComplete,stageAccess} from '../src/stage-access.ts';
import {TITLES} from '../src/content-titles.ts';
import {defaultContentAccess,titleVisible} from '../src/content-visibility.ts';
import {progressExport,parseProgressExport,mergeProgress} from '../src/progress-transfer.ts';

const gate=STAGE_GATES[1],date=new Date('2026-10-08T16:00:00Z');
function hunt(p,id,champion='devourer',{boss=true,boons=['haste','power','reach'],clear=true,finished=true}={}){
 const g=new Game(77,{monsterId:champion},1);g.time=660;g.court.cleared=clear;g.court.stats.captains=clear?10:8;g.court.colossus.status=boss?'defeated':'expired';g.court.upgrades=boons.flatMap(b=>[b,b,b]);
 const stats=courtProgress(g,finished),run={id,monsterId:champion,phase:1,reason:clear?'cleared':'overwhelmed',values:{...stats.values,seconds:g.time},best:stats.best};
 recordProgress(p,run,finished,date);return {g,run};
}
function qualify(p,id='devourer'){for(let n=1;n<=7;n++)recordProgress(p,{id:'gate'+n,monsterId:id,phase:0,reason:'retired',values:{seconds:510,kills:15000},best:{}},true,new Date(Date.UTC(2026,9,n,16)));}

test('every champion can earn the Ashen gate in one day through 12 clears, 5 Colossi and 4 distinct mastered boons',()=>{
 for(const champion of Object.keys(MONSTERS)){
  const p=normalizeProfile(null);for(let n=0;n<11;n++)hunt(p,champion+n,champion,{boss:n<5,boons:n===0?['recharge']:['haste','power','reach']});
  assert.equal(p.progress.titles.ashenGatebreaker,undefined);hunt(p,champion+'12',champion,{boss:false});
  assert.ok(p.progress.titles.ashenGatebreaker,champion);assert.ok(availableTitles(p).includes(gate.title));assert.deepEqual(masteryProgress(gate,p.progress,champion).map(r=>r.value),[12,5,4]);
  assert.equal(p.progress.trials.ashenGatebreaker,undefined);assert.equal(gateChallengeComplete(gate,p.progress),true);
 }
});

test('all mastery conditions belong to one champion; kills and boon types cannot combine across champions',()=>{
 const p=normalizeProfile(null);for(let n=0;n<12;n++)hunt(p,'d'+n,'devourer',{boss:false});for(let n=0;n<5;n++)hunt(p,'t'+n,'titan',{boons:['recharge']});
 assert.equal(gateChallengeComplete(gate,p.progress),false);assert.equal(p.progress.titles.ashenGatebreaker,undefined);
 for(let n=0;n<5;n++)hunt(p,'d-boss'+n,'devourer',{boons:n===0?['recharge']:['haste']});assert.ok(p.progress.titles.ashenGatebreaker);
});

test('unfinished or failed hunts, expired Colossi, rank 2 and repeated boon types never satisfy missing conditions',()=>{
 const p=normalizeProfile(null);hunt(p,'dead','sovereign',{clear:false});hunt(p,'playing','sovereign',{finished:false});assert.deepEqual(masteryProgress(gate,p.progress,'sovereign').map(r=>r.value),[0,0,0]);
 for(let n=0;n<12;n++)hunt(p,'clear'+n,'sovereign',{boss:false,boons:['haste']});assert.deepEqual(masteryProgress(gate,p.progress,'sovereign').map(r=>r.value),[12,0,1]);assert.equal(p.progress.titles.ashenGatebreaker,undefined);
 const g=new Game(77,{monsterId:'sovereign'},1);g.court.cleared=true;g.court.upgrades=['duration','duration'];assert.equal(courtProgress(g,true).values.courtBoonDurationClear,0);
});

test('incremental saves and duplicate completion count one qualifying hunt exactly once',()=>{
 const p=normalizeProfile(null),{g}=hunt(p,'live','reaper',{finished:false});recordProgress(p,{id:'live',monsterId:'reaper',phase:1,values:{...courtProgress(g,false).values,seconds:660},best:{}},false,date);
 const run={id:'live',monsterId:'reaper',phase:1,reason:'cleared',values:{...courtProgress(g,true).values,seconds:660},best:{}};recordProgress(p,run,true,date);recordProgress(p,run,true,date);
 assert.deepEqual(masteryProgress(gate,p.progress,'reaper').map(r=>r.value),[1,1,3]);
});

test('existing v3 clears and Colossi survive; old global boon bests cannot invent per-champion mastery',()=>{
 const p=normalizeProfile({version:3,progress:{archetypes:{overlord:{courtClears:12,courtColossusClears:5}},best:{courtHasteClear:1,courtTempoClear:1,courtDurationClear:1}}});
 assert.deepEqual(masteryProgress(gate,p.progress,'overlord').map(r=>r.value),[12,5,0]);assert.equal(p.progress.titles.ashenGatebreaker,undefined);
 hunt(p,'new','overlord');hunt(p,'other','overlord',{boons:['recharge']});assert.ok(p.progress.titles.ashenGatebreaker);const saved=normalizeProfile(JSON.parse(JSON.stringify(p)));assert.ok(saved.progress.titles.ashenGatebreaker);
 assert.equal(normalizeProfile({version:3,progress:{titles:{ashenGatebreaker:date.toISOString()}}}).progress.titles.ashenGatebreaker,undefined);
});

test('device handoffs retain all mastery and first gate progress; repeated imports cannot manufacture clears or variety',()=>{
 const phone=normalizeProfile(null);qualify(phone);for(let n=0;n<6;n++)hunt(phone,'p'+n);let pc=parseProgressExport(progressExport(phone));for(let n=0;n<6;n++)hunt(pc,'pc'+n,'devourer',{boons:n===0?['recharge']:['haste']});
 const merged=mergeProgress(phone,parseProgressExport(progressExport(pc)));assert.ok(merged.progress.titles.ashenGatebreaker);assert.deepEqual(merged.progress.trials.gatebreaker.devourer,phone.progress.trials.gatebreaker.devourer);assert.deepEqual(mergeProgress(merged,pc),merged);assert.deepEqual(mergeProgress(pc,phone),merged);
 const repeat=normalizeProfile(null);for(let n=0;n<6;n++)hunt(repeat,'r'+n);assert.equal(mergeProgress(repeat,repeat).progress.titles.ashenGatebreaker,undefined);assert.equal(masteryProgress(gate,repeat.progress,'devourer')[0].value,6);
 for(const b of MASTERY_BOONS)assert.equal(parseProgressExport(progressExport(merged)).progress.archetypes.devourer[b.metric],merged.progress.archetypes.devourer[b.metric]);
});

test('the next title is hidden before Stage 2 access, and becomes visible when Stage 2 actually unlocks',()=>{
 const p=normalizeProfile(null),title=TITLES.find(t=>t.id===gate.titleId);qualify(p);const access=at=>({champion:()=>true,stage:phase=>stageAccess(phase,p.progress,at)==='open'});
 assert.equal(titleVisible(title,access(Date.parse(STAGE_GATES[0].opensAt)-1)),false);assert.equal(titleVisible(title,access(Date.parse(STAGE_GATES[0].opensAt))),true);assert.equal(titleVisible(title,defaultContentAccess()),false);assert.equal(titleVisible(title,defaultContentAccess(true)),true);
});

test('Stage 3 opens October 15 with title and prior access, but cannot select a map that is still unbuilt',()=>{
 assert.equal(Date.parse(gate.opensAt)-Date.parse(STAGE_GATES[0].opensAt),7*24*60*60*1000);const p=normalizeProfile(null);qualify(p);for(let n=0;n<12;n++)hunt(p,'open'+n,'devourer',{boons:n===0?['recharge']:['haste','power','reach']});
 assert.equal(stageAccess(2,p.progress,Date.parse(gate.opensAt)+1),'future');const ready=gate.ready;
 try{gate.ready=true;assert.equal(stageAccess(2,p.progress,Date.parse(gate.opensAt)-1),'date');assert.equal(stageAccess(2,p.progress,null),'clock');assert.equal(stageAccess(2,p.progress,Date.parse(gate.opensAt)),'open');delete p.progress.titles.gatebreaker;assert.equal(stageAccess(2,p.progress,Date.parse(gate.opensAt)),'title');}finally{gate.ready=ready;}
});
