import {test} from 'node:test';
import assert from 'node:assert/strict';
import {MONSTERS} from '../src/content-monsters.ts';
import {TITLES,awardTitles,titleProgress} from '../src/content-titles.ts';
import {normalizeProfile,availableTitles} from '../src/profile.ts';
import {championMastery,MASTERY_RANKS} from '../src/champion-mastery.ts';

test('each champion has a distinct Grandmaster title at S mastery, without self-funding mastery',()=>{
 const goal=MASTERY_RANKS.find(r=>r.rank==='S').points,names=new Set();
 for(const id of Object.keys(MONSTERS)){
  const p=normalizeProfile(null),kit=p.progress.archetypes[id],title=TITLES.find(t=>t.id===id+'MasterS');
  assert.ok(title);names.add(title.name);assert.equal(title.requirements[0].target,goal);
  kit.seconds=(goal-10)*6;awardTitles(p.progress);assert.equal(p.progress.titles[title.id],undefined);
  kit.seconds+=60;const before=championMastery(p,id,true,true,true).points;
  assert.ok(awardTitles(p.progress).includes(title.id));assert.equal(championMastery(p,id,true,true,true).points,before);
  assert.equal(titleProgress(p.progress,title)[0].value,goal);assert.ok(availableTitles(p).includes(title.name));
  assert.deepEqual(awardTitles(p.progress),[]);
  for(const other of Object.keys(MONSTERS).filter(v=>v!==id))assert.equal(p.progress.titles[other+'MasterS'],undefined);
  const loaded=normalizeProfile(JSON.parse(JSON.stringify(p)));assert.ok(loaded.progress.titles[title.id]);
 }
 assert.equal(names.size,8);
});

test('existing S-rank saves receive their title on load, including mastery earned in Stage 4',()=>{
 const p=normalizeProfile(null);p.progress.archetypes.hag.warClears=18;
 assert.equal(championMastery(p,'hag',true,true,true).rank,'S');
 const loaded=normalizeProfile(JSON.parse(JSON.stringify(p)));assert.ok(loaded.progress.titles.hagMasterS);
});

test('saved combat milestones count identically for the visible S rank and its title',()=>{
 const p=normalizeProfile(null);p.progress.archetypes.hag.seconds=(600000-100)*6;
 p.personalBests['2026.10-v53-crucible-hell|3|hag|cleared']={score:1,kills:500,seconds:1};
 assert.equal(championMastery(p,'hag',true,true,true).rank,'S');
 const loaded=normalizeProfile(JSON.parse(JSON.stringify(p)));assert.equal(championMastery(loaded,'hag',true,true,true).rank,'S');assert.ok(loaded.progress.titles.hagMasterS);
});
