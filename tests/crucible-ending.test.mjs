import {test} from 'node:test';
import assert from 'node:assert/strict';
import {MONSTERS} from '../src/content-monsters.ts';
import {createIdentity} from '../src/identity.ts';
import {crucibleEnding,crucibleMusicState} from '../src/crucible-ending.ts';
import {CrucibleCelebration} from '../src/crucible-celebration.ts';
import {CUES} from '../src/content-audio.ts';
import {synthesizeCue} from '../src/synth-sfx.ts';

test('every champion receives a personal coronation and a distinct speech about the winter invasion',()=>{
 const speeches=new Set(),actions=new Set();
 for(const id of Object.keys(MONSTERS)){const identity=createIdentity({monsterId:id,name:'Ash Crow',title:'The Deep Gatebreaker'}),ending=crucibleEnding(identity,true);assert.match(ending.claim,/Ash Crow, The Deep Gatebreaker/);assert.match(ending.claim,/undisputed Lord of the Horde/);assert.match(ending.future,/winter.*legions of monsters.*Second Continent/);speeches.add(ending.speech);actions.add(ending.body);}
 assert.equal(speeches.size,8);assert.equal(actions.size,8);
});
test('defeat feeds the victor and asks the player whether they will rise again, without inventing a live winner',()=>{
 const identity=createIdentity({monsterId:'hag',name:'Thorn Queen',title:'Hag Grandmaster'}),unresolved=crucibleEnding(identity,false),resolved=crucibleEnding(identity,false,'titan');
 assert.match(unresolved.claim,/Thorn Queen, Hag Grandmaster/);assert.match(unresolved.body,/Another champion will take/);assert.match(unresolved.body,/power and sacrifice feed/);assert.match(resolved.body,/The Titan takes/);assert.match(resolved.future,/Will you rise again.*\?/);assert.equal(resolved.again,'Rise again');
});
test('two remaining claimants change only the score intensity, while defeat has its own music state',()=>{
 for(const n of [8,7,3])assert.equal(crucibleMusicState(n),'combat');assert.equal(crucibleMusicState(2),'final');assert.equal(crucibleMusicState(1,true,true),'results');assert.equal(crucibleMusicState(4,true,false),'defeat');
});
test('Hell uses real native attack and ultimate frames, then settles on the high-resolution portrait; reduced motion stays still',()=>{
 const calls=[],context={clearRect(){},save(){},restore(){},translate(){},rotate(){},scale(){},drawImage(...args){calls.push(args);}},canvas={getContext:()=>context},portrait={width:512,height:512},atlas={width:1536,height:1280},identity=createIdentity({monsterId:'hag'});
 const animation=new CrucibleCelebration(canvas,identity,portrait,atlas,undefined,true,true);animation.started=0;animation.draw(500);assert.ok(calls.some(c=>c[0]===atlas&&c[2]===512));calls.length=0;animation.draw(1200);assert.ok(calls.some(c=>c[0]===atlas&&c[2]===1024));calls.length=0;animation.draw(4000);assert.equal(animation.settled,true);assert.ok(calls.every(c=>c[0]===portrait));
 for(const [hell,motion] of [[false,true],[true,false]]){calls.length=0;const still=new CrucibleCelebration(canvas,identity,portrait,atlas,undefined,hell,motion);still.draw(performance.now());assert.equal(still.animated,false);assert.equal(still.settled,true);assert.ok(calls.every(c=>c[0]===portrait));}
});
test('all selected champions have a distinct, bounded defeat lament audible in the results interface',()=>{
 const rate=12000,ctx={sampleRate:rate,createBuffer(c,n,s){const data=new Float32Array(n);return {duration:n/s,getChannelData:()=>data};}},signatures=new Set();
 for(const id of Object.keys(MONSTERS)){const cue='defeat.'+id;assert.equal(CUES[cue].bus,'ui');const audio=synthesizeCue(ctx,cue),data=audio.getChannelData(0);assert.equal(audio.duration,3);assert.ok(data.every(v=>Number.isFinite(v)&&Math.abs(v)<=1));assert.ok(data.some(v=>Math.abs(v)>.1));signatures.add(data.slice(0,400).reduce((n,v,i)=>n+v*(i+1),0).toFixed(4));}
 assert.ok(signatures.size>=6,'character themes retain their different tonal centers');
});
