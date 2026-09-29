import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeProfile,recordProgress,availableTitles} from '../src/profile.ts';
import {STAGE_GATES,stageAccess,serverTime,trialDays,eventDay} from '../src/stage-access.ts';
import {Game} from '../src/simulation.ts';

const gate=STAGE_GATES[0];
const run=(id,monsterId='sovereign',phase=0,reason='overwhelmed',seconds=510,kills=15000)=>({id,monsterId,phase,reason,values:{seconds,kills},best:{seconds}});
const day=n=>new Date(Date.UTC(2026,9,n,16));

test('Stage 2 needs seven qualifying days on one champion; other champions cannot combine their runs',()=>{
 const p=normalizeProfile(null);for(let n=1;n<=4;n++)recordProgress(p,run('s'+n),true,day(n));for(let n=1;n<=3;n++)recordProgress(p,run('t'+n,'titan'),true,day(n));
 assert.equal(trialDays(p.progress.trials,gate),4);assert.equal(p.progress.titles.gatebreaker,undefined);
 for(let n=5;n<=7;n++)recordProgress(p,run('s'+n),true,day(n));
 assert.equal(trialDays(p.progress.trials,gate),7);assert.ok(p.progress.titles.gatebreaker);assert.ok(availableTitles(p).includes('The Gatebreaker'));
 assert.equal(stageAccess(1,p.progress,Date.parse(gate.opensAt)-1),'date');assert.equal(stageAccess(1,p.progress,Date.parse(gate.opensAt)),'open');
});

test('only natural Stage 1 finishes at Final Release with 15,000 kills count once per festival day',()=>{
 const p=normalizeProfile(null);for(const candidate of [run('short','titan',0,'overwhelmed',509,20000),run('few','titan',0,'overwhelmed',700,14999),run('retired','titan',0,'retired',700,20000),run('wrong-stage','titan',1,'overwhelmed',700,20000)])recordProgress(p,candidate,true,day(1));
 recordProgress(p,run('before-launch','titan'),true,new Date('2026-10-01T03:59:59Z'));assert.equal(trialDays(p.progress.trials,gate),0);
 recordProgress(p,run('first','titan'),true,day(1));recordProgress(p,run('same-day','titan'),true,day(1));recordProgress(p,run('first','titan'),true,day(2));
 assert.equal(trialDays(p.progress.trials,gate),1);assert.equal(eventDay(day(1)),'2026-10-01');assert.equal(stageAccess(1,p.progress,Date.parse(gate.opensAt)+1),'title');
 assert.equal(stageAccess(2,p.progress,Date.parse(gate.opensAt)+1),'future');
});

test('earned gate persists but malformed dates or a title without seven days cannot grant access',()=>{
 const p=normalizeProfile(null);for(let n=1;n<=7;n++)recordProgress(p,run('day'+n,'devourer'),true,day(n));
 const restored=normalizeProfile(JSON.parse(JSON.stringify(p)));assert.equal(stageAccess(1,restored.progress,Date.parse(gate.opensAt)),'open');
 restored.progress.trials.gatebreaker.devourer=['2026-10-01','bad date'];const suspect=normalizeProfile(restored);assert.equal(trialDays(suspect.progress.trials,gate),1);assert.equal(suspect.progress.titles.gatebreaker,undefined);assert.equal(stageAccess(1,suspect.progress,Date.parse(gate.opensAt)),'title');
});

test('the release clock comes from a fresh network HEAD response and fails closed offline',async()=>{
 let called;const fetcher=async(url,options)=>{called={url,options};return {ok:true,headers:new Headers({Date:'Thu, 08 Oct 2026 04:00:00 GMT'})};};
 assert.equal(await serverTime(fetcher),Date.parse(gate.opensAt));assert.equal(called.options.method,'HEAD');assert.equal(called.options.cache,'no-store');assert.match(called.url,/stage-clock=/);
 assert.equal(await serverTime(async()=>{throw Error('offline');}),null);assert.equal(stageAccess(1,{titles:{gatebreaker:'2026-10-07'},trials:{gatebreaker:{titan:['2026-10-01','2026-10-02','2026-10-03','2026-10-04','2026-10-05','2026-10-06','2026-10-07']}}},null),'clock');
});

test('selected Stage 2 uses the existing harder Adaptation scenario instead of Stage 1 pressure',()=>{
 const base=new Game(11,{monsterId:'titan'},0),next=new Game(11,{monsterId:'titan'},1),input={x:0,y:0,aimX:0,aimY:0,aiming:false};base.update(1/60,input);next.update(1/60,input);
 assert.equal(next.phase,1);assert.ok(next.spawnBank>base.spawnBank);assert.equal(new Game(11,{monsterId:'titan'},99).phase,0);
});
