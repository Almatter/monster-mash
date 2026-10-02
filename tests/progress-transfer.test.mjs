import test from 'node:test';import assert from 'node:assert/strict';
import {normalizeProfile,recordProgress,availableTitles,updateRecords} from '../src/profile.ts';
import {progressExport,parseProgressExport,mergeProgress,applyProgressImport,undoProgressImport,IMPORT_BACKUP_KEY} from '../src/progress-transfer.ts';
import {stageAccess,STAGE_GATES} from '../src/stage-access.ts';
import {EVENT} from '../src/data.ts';
const run=(p,day,champion='devourer',kills=15000)=>recordProgress(p,{id:champion+day,monsterId:champion,phase:0,reason:'retired',values:{kills,seconds:510},best:{seconds:510}},true,new Date(`2026-10-${String(day).padStart(2,'0')}T16:00:00Z`));
const memory=()=>{const entries=new Map();return {getItem:k=>entries.get(k)||null,setItem:(k,v)=>entries.set(k,v)};};
test('progress roundtrip preserves v3 identity, all palettes, rewards, trials and scoped bests; clears unfinished ledger',()=>{
 const p=normalizeProfile(null);p.identity.name='Traveler';for(let n=1;n<=7;n++)run(p,n);p.identity.title='The Gatebreaker';p.palettes.devourer.primary='#387ccb';p.identity.monsterId='devourer';p.identity.colors={...p.palettes.devourer};
 p.personalBests[EVENT.rules+'|0|devourer|overwhelmed']={score:700000,kills:15000,seconds:510};p.progress.ledger={id:'incomplete',values:{kills:1}};
 const restored=parseProgressExport(progressExport(p));assert.equal(restored.version,3);assert.equal(restored.identity.name,'Traveler');assert.equal(restored.identity.title,'The Gatebreaker');assert.deepEqual(restored.palettes,p.palettes);assert.deepEqual(restored.personalBests,p.personalBests);assert.deepEqual(restored.progress.trials,p.progress.trials);assert.equal(restored.progress.ledger,null);assert.equal(stageAccess(1,restored.progress,Date.parse(STAGE_GATES[0].opensAt)-1),'date');assert.equal(p.progress.ledger.id,'incomplete');
});
test('repeated transfer is idempotent, combines days per champion, and never sums duplicated totals',()=>{
 const a=normalizeProfile(null),b=normalizeProfile(null);for(let n=1;n<=4;n++)run(a,n);for(let n=4;n<=7;n++)run(b,n);const before=JSON.stringify(a);
 const merged=mergeProgress(a,b);assert.equal(merged.progress.total.kills,60000);assert.equal(merged.progress.total.runs,4);assert.equal(merged.progress.trials.gatebreaker.devourer.length,7);assert.ok(availableTitles(merged).includes('The Gatebreaker'));assert.deepEqual(mergeProgress(merged,b),merged);assert.equal(JSON.stringify(a),before);
 const c=normalizeProfile(null);for(let n=1;n<=3;n++)run(c,n,'titan');assert.equal(mergeProgress(a,c).progress.titles.gatebreaker,undefined);
});
test('sequential device handoffs keep all cumulative totals and rewards without duplication',()=>{
 let phone=normalizeProfile(null);run(phone,1);let pc=mergeProgress(normalizeProfile(null),parseProgressExport(progressExport(phone)));run(pc,2);phone=mergeProgress(phone,parseProgressExport(progressExport(pc)));run(phone,3);pc=mergeProgress(pc,parseProgressExport(progressExport(phone)));assert.equal(pc.progress.total.kills,45000);assert.equal(pc.progress.total.runs,3);assert.equal(pc.progress.trials.gatebreaker.devourer.length,3);assert.deepEqual(mergeProgress(pc,phone),pc);
});
test('local achievements, titles, legacy rewards and personal bests survive an older backup',()=>{
 const a=normalizeProfile(null),b=normalizeProfile(null);run(a,1);run(a,2);updateRecords(a,{kills:30000},a.identity,'2026-10-01T12:00:00Z');a.progress.legacyTitles=['The Blooded'];a.personalBests[EVENT.rules+'|0|titan|retired']={score:10,kills:20,seconds:30};b.personalBests[EVENT.rules+'|1|titan|retired']={score:100,kills:2,seconds:60};const merged=mergeProgress(a,b);assert.deepEqual(merged.records,a.records);assert.ok(availableTitles(merged).includes('The Butcher'));assert.ok(availableTitles(merged).includes('The Blooded'));assert.equal(Object.keys(merged.personalBests).length,2);assert.equal(merged.progress.total.kills,30000);
});
test('malformed, oversized, unrelated and future backups are rejected before mutation',()=>{
 for(const file of ['not json','null','{}',JSON.stringify({format:'monster-mash-progress',version:2}),JSON.stringify({format:'monster-mash-progress',version:1,profile:{version:3}}),' '.repeat(1024*1024+1)])assert.throws(()=>parseProgressExport(file));
});
test('import persists a recoverable backup and undo restores the exact original profile',()=>{
 const a=normalizeProfile(null),b=normalizeProfile(null),storage=memory();a.identity.name='Local';b.identity.name='Phone';run(b,1);const before=normalizeProfile(a);applyProgressImport(a,b,storage);assert.equal(a.identity.name,'Phone');assert.equal(JSON.parse(storage.getItem('mm-profile')).progress.total.kills,15000);assert.equal(parseProgressExport(storage.getItem(IMPORT_BACKUP_KEY)).identity.name,'Local');undoProgressImport(a,storage);assert.deepEqual(a,before);assert.deepEqual(JSON.parse(storage.getItem('mm-profile')),before);assert.equal(storage.getItem(IMPORT_BACKUP_KEY),null);
});
test('storage failures do not mutate the shared profile or destroy a previously saved profile',()=>{
 for(const failedKey of [IMPORT_BACKUP_KEY,'mm-profile']){const a=normalizeProfile(null),b=normalizeProfile(null),storage=memory(),before=JSON.stringify(a);storage.setItem('mm-profile',before);const write=storage.setItem;storage.setItem=(k,v)=>{if(k===failedKey)throw Error('quota');write(k,v);};run(b,1);assert.throws(()=>applyProgressImport(a,b,storage));assert.equal(JSON.stringify(a),before);assert.equal(storage.getItem('mm-profile'),before);}
});
