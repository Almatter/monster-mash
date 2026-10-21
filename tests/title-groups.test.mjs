import test from 'node:test';
import assert from 'node:assert/strict';
import {TITLES,awardTitles} from '../src/content-titles.ts';
import {MONSTERS} from '../src/content-monsters.ts';
import {titleBuckets,titleStage} from '../src/title-groups.ts';
import {titleVisible,defaultContentAccess} from '../src/content-visibility.ts';
import {normalizeProfile,availableTitles} from '../src/profile.ts';
test('every visible title belongs to exactly one area, champion-area, champion-activity, lifetime or passage bucket',()=>{
 for(const access of [defaultContentAccess(),defaultContentAccess(true),{champion:()=>true,stage:n=>n<=1}]){const visible=TITLES.filter(t=>titleVisible(t,access)),buckets=titleBuckets(visible),flat=buckets.flatMap(b=>b.titles);assert.equal(flat.length,visible.length);assert.equal(new Set(flat.map(t=>t.id)).size,visible.length);for(const b of buckets){if(b.category==='champion-area'){assert.ok(b.champion);assert.notEqual(b.stage,null);assert.ok(b.titles.every(t=>t.requirements.some(r=>r.scope===b.champion)));}if(b.category==='champion-activity'){assert.ok(b.champion);assert.equal(b.stage,null);}if(b.category==='area'){assert.equal(b.champion,undefined);assert.notEqual(b.stage,null);}}}
 const all=titleBuckets(TITLES),war=all.find(b=>b.category==='area'&&b.stage===3);assert.equal(war.titles[0].name,'Horde Lord');assert.equal(war.titles.length,3);assert.equal(titleStage(TITLES.find(t=>t.id==='wildsFast')),1);assert.ok(all.some(b=>b.category==='champion-activity'&&b.champion==='hag'));assert.ok(!titleBuckets(TITLES.filter(t=>titleVisible(t,defaultContentAccess()))).some(b=>b.stage!==null));
});
test('Horde Lord requires Hell and all champion war titles have varied, correctly scoped requirements',()=>{
 assert.equal(TITLES.filter(t=>t.name==='Horde Lord').length,1);const main=TITLES.find(t=>t.id==='warHell');assert.deepEqual(main.requirements.map(r=>[r.scope,r.metric,r.target]),[['total','warHellClears',1]]);
 const signatures=new Set();for(const id of Object.keys(MONSTERS)){const title=TITLES.find(t=>t.id===id+'WarHell'),extra=title.requirements.find(r=>r.metric!=='warHellClears');assert.ok(extra);signatures.add(extra.metric+extra.target);const p=normalizeProfile(null),kit=p.progress.archetypes[id];kit.warHellClears=1;p.progress.total.warHellClears=1;awardTitles(p.progress);assert.ok(p.progress.titles.warHell);assert.equal(p.progress.titles[title.id],undefined);kit[extra.metric]=extra.target-1;awardTitles(p.progress);assert.equal(p.progress.titles[title.id],undefined);kit[extra.metric]++;awardTitles(p.progress);assert.ok(p.progress.titles[title.id]);for(const other of Object.keys(MONSTERS).filter(other=>other!==id))assert.equal(p.progress.titles[other+'WarHell'],undefined);}
 assert.equal(signatures.size,8);
});
test('renaming the existing Hell title preserves earned ownership and an equipped selection',()=>{const p=normalizeProfile(null);p.progress.titles.warHell='2026-10-22T04:00:00.000Z';p.identity.title='The Hell-Crowned';const restored=normalizeProfile(p);assert.equal(restored.identity.title,'Horde Lord');assert.ok(availableTitles(restored).includes('Horde Lord'));assert.ok(!availableTitles(restored).includes('The Hell-Crowned'));p.progress.titles={};assert.equal(normalizeProfile(p).identity.title,'');});
