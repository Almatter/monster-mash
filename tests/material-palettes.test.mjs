import test from 'node:test';import assert from 'node:assert/strict';
import {MONSTERS} from '../src/content-monsters.ts';
import {createIdentity} from '../src/identity.ts';
import {normalizeProfile,recordProgress} from '../src/profile.ts';
import {progressExport,parseProgressExport} from '../src/progress-transfer.ts';
import {encodeRun,decodeRun} from '../src/run-code.ts';
import {EVENT} from '../src/data.ts';

test('new material colors default into existing saves without discarding palettes, titles or gate days',()=>{
 const colors={primary:'#387ccb',secondary:'#a83248',accent:'#d9af61',power:'#8862c7'};
 for(const id of ['sovereign','calamity','overlord']){
  const p=normalizeProfile({version:3,identity:{monsterId:id,colors},palettes:{[id]:colors}});
  for(let day=1;day<=3;day++)recordProgress(p,{id:id+day,monsterId:id,phase:0,reason:'overwhelmed',values:{seconds:510,kills:15000},best:{}},true,new Date(Date.UTC(2026,9,day,16)));
  p.progress.titles.slaughter0='2026-10-06';p.identity.colors.skin='#8cb865';if(id==='sovereign')p.identity.colors.hair='#e975bc';p.palettes[id]={...p.identity.colors};
  const restored=parseProgressExport(progressExport(p));assert.deepEqual(restored.identity.colors,p.identity.colors);assert.deepEqual(restored.progress,p.progress);
  for(const [key,value] of Object.entries(colors))assert.equal(restored.identity.colors[key],value);
 }
 assert.equal(createIdentity({monsterId:'devourer',colors:{...colors,skin:'#8cb865',hair:'#e975bc'}}).colors.skin,undefined);
});
test('five and six channel identities authenticate and historical four-color runs retain their exact identity',async()=>{
 for(const id of ['sovereign','calamity','overlord']){
  const identity=createIdentity({monsterId:id}),run={version:4,rules:EVENT.rules,phase:0,...identity,seed:77,duration:60,score:0,kills:0,wave:3,elites:0,titans:0,multi:0,peak:1,feats:{},ended:'2026-10-06T16:00:00Z',reason:'retired',release:0,build:'0123456789abcdef'};
  assert.deepEqual(await decodeRun(await encodeRun(run)),run);
  const {skin,hair,...oldColors}=identity.colors,old={...run,colors:oldColors};assert.deepEqual(await decodeRun(await encodeRun(old)),old);
  await assert.rejects(encodeRun({...run,colors:{...identity.colors,skin:'invalid'}}));
  if(id!=='sovereign')await assert.rejects(encodeRun({...run,colors:{...identity.colors,hair:'#e975bc'}}));
 }
 assert.equal(MONSTERS.sovereign.channels.length,6);assert.equal(MONSTERS.calamity.channels.find(c=>c.id==='skin').label,'Mask / arms');
});
