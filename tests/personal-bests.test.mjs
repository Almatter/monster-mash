import test from 'node:test';import assert from 'node:assert/strict';
import {bestKey,recordBest,normalizeBests,comparisonText} from '../src/personal-bests.ts';
import {normalizeProfile,resetProgress} from '../src/profile.ts';
import {resultText} from '../src/results.ts';
import {releaseGuidance} from '../src/player-guidance.ts';
const run={monsterId:'calamity',rules:'2026.10-v6-tester',phase:0,reason:'overwhelmed',score:100,kills:12,duration:90};
test('personal bests compare only identical champion, week, rules and ending',()=>{
 const bests={};assert.equal(recordBest(bests,run).status,'first');
 assert.deepEqual(recordBest(bests,{...run,score:150}),{previous:100,delta:50,status:'record'});
 assert.equal(recordBest(bests,{...run,score:150}).status,'tie');assert.equal(recordBest(bests,{...run,score:10,kills:20,duration:120}).status,'below');
 assert.deepEqual(bests[bestKey(run)],{score:150,kills:20,seconds:120});
 for(const change of [{monsterId:'titan'},{phase:1},{rules:'2026.10-v7-next'},{reason:'retired'}])assert.equal(recordBest(bests,{...run,...change,score:500}).status,'first');
 assert.equal(bests[bestKey(run)].score,150);assert.equal(Object.keys(bests).length,5);
});
test('scoped bests persist without inventing historical competition scores and reset with progress',()=>{
 const p=normalizeProfile({version:3,progress:{best:{dominance:5000000}}});assert.deepEqual(p.personalBests,{});
 recordBest(p.personalBests,run);const next=normalizeProfile(JSON.parse(JSON.stringify(p)));assert.deepEqual(next.personalBests,p.personalBests);resetProgress(next);assert.deepEqual(next.personalBests,{});
 assert.deepEqual(normalizeBests({[bestKey(run)]:{score:NaN,kills:1,seconds:1},'__proto__':{},'bad|0|calamity|overwhelmed':{score:1,kills:1,seconds:1}}),{});
});
test('local history stays bounded while preserving the current result',()=>{const b={};for(let i=0;i<200;i++)recordBest(b,{...run,rules:'2026.10-v'+i});assert.equal(Object.keys(b).length,160);assert.equal(b[bestKey({...run,rules:'2026.10-v199'})].score,100);});
test('share copy carries prestige, week, rules and practice status; release guidance matches actual seals',()=>{
 const text=resultText({...run,name:'Night Crown',title:'The Unbound',wave:4,multi:7,titans:0,reason:'retired',comparison:{previous:50,delta:50,status:'record'}},'CODE');
 for(const part of ['Night Crown','The Unbound','WEEK 1','THE SWARM','2026.10-v6-tester','PRACTICE / MANUALLY ENDED','7 slain','practice best','CODE'])assert.ok(text.includes(part),part);
 assert.match(comparisonText({previous:150,delta:-50,status:'below'}),/50 Dominance below/);assert.match(releaseGuidance(149,0),/0:01/);assert.match(releaseGuidance(510,4),/FULL POWER/);
});

test('shipped MM4 codes stay readable when the active ruleset advances',async()=>{
 const {EVENT}=await import('../src/data.ts');const {encodeRun,decodeRun}=await import('../src/run-code.ts');
 const fixture={...run,version:4,name:'History',title:'',colors:{primary:'#112233',secondary:'#445566',accent:'#778899',power:'#aabbcc'},seed:1,wave:4,elites:0,titans:0,multi:3,peak:1,feats:{},ended:'2026-09-26T00:00:00.000Z',release:0,build:'0123456789abcdef'};
 const code=await encodeRun(fixture),movementCode=await encodeRun({...fixture,rules:'2026.10-v7-movement'}),current=EVENT.rules;
 try{EVENT.rules='2026.10-v8-next';assert.equal((await decodeRun(code)).rules,'2026.10-v6-tester');assert.equal((await decodeRun(movementCode)).rules,'2026.10-v7-movement');}finally{EVENT.rules=current;}
 await assert.rejects(()=>encodeRun({...fixture,rules:'2026.10-unknown'}));
});
