import test from 'node:test';
import assert from 'node:assert/strict';
import {THEMES,MUSIC,renderMusicLayer,renderDuelHerald} from '../src/procedural-music.ts';
import {AudioEngine} from '../src/audio.ts';

test('the final duel changes key, tempo and musical phrases within the mobile memory budget',async()=>{
 const war=THEMES['throne-war'],duel=THEMES['throne-duel'];
 assert.ok(duel.bpm>=war.bpm*1.2);assert.notEqual(duel.roots[0]%12,war.roots[0]%12);assert.notDeepEqual(duel.motif,war.motif);
 const stems=[];for(let i=0;i<7;i++)stems.push(await renderMusicLayer(i,MUSIC.sampleRate,'throne-duel'));
 assert.ok(stems.every(s=>s.length===stems[0].length));assert.ok(stems.reduce((n,s)=>n+s.byteLength,0)<24*1048576);
 for(const stem of stems){let square=0,peak=0;for(const v of stem){assert.ok(Number.isFinite(v));square+=v*v;peak=Math.max(peak,Math.abs(v));}assert.ok(peak<.7);assert.ok(Math.sqrt(square/stem.length)>.001);}
 const normal=await renderMusicLayer(3,MUSIC.sampleRate,'throne-war');assert.notDeepEqual(stems[3].slice(0,22050),normal.slice(0,22050));
 const herald=renderDuelHerald();assert.equal(herald.length,Math.ceil(2.8*MUSIC.sampleRate));assert.ok(herald.every(v=>Number.isFinite(v)&&Math.abs(v)<1));
 for(const [start,end] of [[0,.6],[.8,1.3],[1.5,2.6]])assert.ok(herald.slice(start*MUSIC.sampleRate,end*MUSIC.sampleRate).some(v=>Math.abs(v)>.1));
});

test('only Stage 4 final duel switches score; repeated updates do not restart it and results restore the war theme',async()=>{
 const audio=new AudioEngine(),calls=[];audio.context={currentTime:0};audio.procedural={setTheme:t=>calls.push(['theme',t]),setState:s=>calls.push(['state',s])};audio.champion='throne-war';
 await audio.setMusic('combat');await audio.setMusic('final');await audio.setMusic('final');await audio.setMusic('results');
 assert.deepEqual(calls,[['theme','throne-war'],['state','combat'],['theme','throne-duel'],['state','final'],['theme','throne-war'],['state','results']]);
 calls.length=0;audio.champion='hag';audio.activeState=null;await audio.setMusic('final');assert.deepEqual(calls,[['theme','hag'],['state','final']]);
});
