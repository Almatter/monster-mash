import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeProfile,recordProgress,updateRecords} from '../src/profile.ts';
import {TITLES,awardTitles} from '../src/content-titles.ts';
import {STAGE_GATES,stageAccess} from '../src/stage-access.ts';
import {gatebreakerExperience,GATE_CHAMPIONS} from '../src/gatebreaker.ts';
import {championMastery,MASTERY_RANKS} from '../src/champion-mastery.ts';
import {progressExport,parseProgressExport,mergeProgress} from '../src/progress-transfer.ts';
import {championAvailable} from '../src/champion-access.ts';
import {titleVisible} from '../src/content-visibility.ts';

const date=new Date('2026-10-07T16:00:00Z'),opens=Date.parse(STAGE_GATES[0].opensAt);
const run=(id,monsterId='devourer',phase=0,seconds=600)=>({id,monsterId,phase,reason:'overwhelmed',values:{seconds,kills:500,titans:1},best:{seconds,multi:100,carnage:60}});

test('six finished runs can earn passage in one day, with one native champion; date and title still gate all content',()=>{
 for(const id of GATE_CHAMPIONS){const p=normalizeProfile(null);for(let n=0;n<6;n++)recordProgress(p,run(id+n,id),true,date);
  const xp=gatebreakerExperience(p.progress,id);assert.equal(xp.points,100);assert.ok(xp.complete);assert.ok(p.progress.titles.gatebreaker);assert.equal(p.progress.trials.gatebreaker?.[id]?.length||0,0);
  assert.equal(stageAccess(1,p.progress,opens-1),'date');assert.equal(championAvailable('reaper',p.progress,opens-1),false);assert.equal(stageAccess(1,p.progress,null),'clock');assert.equal(stageAccess(1,p.progress,opens),'open');assert.equal(championAvailable('reaper',p.progress,opens),true);
 }
 assert.equal(stageAccess(1,normalizeProfile(null).progress,opens),'title');
});

test('passage cannot combine champions, use Stage 2 runs, or skip the six-run and eight-minute requirements',()=>{
 const p=normalizeProfile(null);for(let n=0;n<3;n++)for(const id of ['titan','devourer'])recordProgress(p,run(id+n,id),true,date);assert.equal(p.progress.titles.gatebreaker,undefined);
 for(let n=0;n<8;n++)recordProgress(p,run('court'+n,'sovereign',1),true,date);assert.equal(gatebreakerExperience(p.progress,'sovereign').points,0);
 recordProgress(p,run('long','calamity',0,10000),true,date);assert.equal(p.progress.titles.gatebreaker,undefined);
 for(let n=0;n<30;n++)recordProgress(p,run('short'+n,'overlord',0,300),true,date);assert.ok(gatebreakerExperience(p.progress,'overlord').points>=100);assert.equal(gatebreakerExperience(p.progress,'overlord').complete,false);
 for(let n=0;n<6;n++)recordProgress(p,run('reaper'+n,'reaper'),true,date);assert.equal(gatebreakerExperience(p.progress,'reaper').complete,false);assert.equal(p.progress.titles.gatebreaker,undefined);
});

test('legacy totals, champion titles, personal bests and days backfill passage without requiring a new run',()=>{
 const raw=normalizeProfile(null);raw.progress.archetypes.sovereign={seconds:3600,runs:6,titans:1,devour:5000,beam:5000};raw.personalBests['2026.10-v15-autotarget-squad|0|sovereign|overwhelmed']={seconds:600,kills:12000,score:9999};
 const p=normalizeProfile(raw);assert.ok(p.progress.titles.sovereign1);assert.ok(p.progress.titles.gatebreaker);assert.ok(gatebreakerExperience(p.progress,'sovereign').complete);assert.equal(p.personalBests[Object.keys(raw.personalBests)[0]].seconds,600);
 const restored=normalizeProfile(p);assert.deepEqual(restored,p);const exported=parseProgressExport(progressExport(p)),merged=mergeProgress(p,exported);assert.deepEqual(merged.progress.archetypes,p.progress.archetypes);assert.equal(gatebreakerExperience(merged.progress,'sovereign').points,gatebreakerExperience(p.progress,'sovereign').points);
 const missing=normalizeProfile(null);missing.progress.archetypes.devourer={seconds:50000,runs:50};assert.equal(normalizeProfile(missing).progress.titles.gatebreaker,undefined,'no unsupported single-run milestone is invented');
});

test('incremental saves and repeated finishes cannot inflate passage, court ability totals or mastery',()=>{
 let p=normalizeProfile(null);const first=run('same','titan');recordProgress(p,first,false,date);p=normalizeProfile(p);recordProgress(p,first,false,date);recordProgress(p,first,true,date);recordProgress(p,first,true,date);
 assert.equal(p.progress.archetypes.titan.stageOneSeconds,600);assert.equal(p.progress.archetypes.titan.stageOneRuns,1);
 const court={...run('hunt','titan',1),values:{seconds:600,kills:1000,fissure:200,courtCaptains:10,courtGuards:40,courtClears:1,courtColossusClears:1,courtBoonPowerClear:1}};
 recordProgress(p,court,false,date);recordProgress(p,court,true,date);recordProgress(p,court,true,date);assert.equal(p.progress.archetypes.titan.courtFissure,200);assert.equal(p.progress.archetypes.titan.stageOneRuns,1);const points=championMastery(p,'titan',true).points;
 p=parseProgressExport(progressExport(p));p=mergeProgress(p,p);assert.equal(championMastery(p,'titan',true).points,points);
});

test('Stage 1 activity can never exceed E, ranks require later-stage pools and account-wide achievements do not leak between champions',()=>{
 assert.deepEqual(MASTERY_RANKS.map(r=>r.rank),['F','E','D','C','B','A','S']);const p=normalizeProfile(null);
 assert.equal(championMastery(p,'devourer').rank,'F');
 for(const id of [...GATE_CHAMPIONS,'reaper']){const kit=p.progress.archetypes[id];for(const r of TITLES.flatMap(t=>t.requirements).filter(r=>r.scope===id&&!r.metric.startsWith('court')))kit[r.metric]=1e9;kit.masteryBestMulti=kit.masteryBestCarnage=kit.masteryBestSeconds=kit.masteryBestCalamityMulti=kit.stageOneBestKills=kit.stageOneTitans=1e9;}
 awardTitles(p.progress);for(const id of [...GATE_CHAMPIONS,'reaper']){const m=championMastery(p,id);assert.equal(m.rank,'E');assert.ok(m.points<10000);assert.equal(m.courtRows.length,0);}
 const independent=normalizeProfile(null);recordProgress(independent,{...run('devourer'),values:{seconds:3600,kills:100000,devour:5000}},true,date);updateRecords(independent,{kills:100000},independent.identity);assert.equal(championMastery(independent,'titan').points,0);
 const kit=p.progress.archetypes.titan;Object.assign(kit,{courtClears:40,courtColossusClears:15,courtCaptains:400,courtGuards:1000,courtFissure:500});for(const boon of ['Haste','Power','Reach','Recharge','Tempo','Duration','Vitality'])kit['courtBoon'+boon+'Clear']=1;awardTitles(p.progress);
 assert.equal(championMastery(p,'titan',false).rank,'E');assert.equal(championMastery(p,'titan',true).rank,'C');assert.ok(championMastery(p,'titan',true).court>championMastery(p,'titan',true).foundations);
});

test('all champions have three additional hunt titles; titles are hidden until Stage 2 and do not count Stage 1 ability kills',()=>{
 const locked={champion:()=>true,stage:n=>n===0},unlocked={champion:()=>true,stage:n=>n<=1};
 for(const id of [...GATE_CHAMPIONS,'reaper']){const p=normalizeProfile(null),titles=TITLES.filter(t=>t.stage===1&&t.requirements.some(r=>r.scope===id));assert.equal(titles.length,3);assert.ok(titles.every(t=>!titleVisible(t,locked)&&titleVisible(t,unlocked)));
  const art=titles.find(t=>t.id.endsWith('WildsArt')),metric=art.requirements.find(r=>r.metric!=='courtClears').metric,source=metric.slice(5);const valueKey=source[0].toLowerCase()+source.slice(1);
  recordProgress(p,{...run('arena',id),values:{seconds:600,[valueKey]:100000}},true,date);assert.equal(p.progress.archetypes[id][metric],undefined);
  for(let n=0;n<5;n++)recordProgress(p,{...run('hunt'+n,id,1),values:{seconds:600,[valueKey]:10000,courtCaptains:10,courtGuards:40,courtClears:1,courtColossusClears:1}},true,date);
  assert.ok(titles.filter(t=>!t.id.endsWith('WildsBane')).every(t=>p.progress.titles[t.id]));assert.equal(p.progress.titles[id+'WildsBane'],undefined);for(let n=5;n<10;n++)recordProgress(p,{...run('hunt'+n,id,1),values:{seconds:600,courtCaptains:10,courtGuards:40,courtClears:1,courtColossusClears:1}},true,date);assert.ok(p.progress.titles[id+'WildsBane']);
 }
});
