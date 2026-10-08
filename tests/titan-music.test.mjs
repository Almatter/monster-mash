import test from 'node:test';
import assert from 'node:assert/strict';
import {renderMusicLayer,THEMES,MUSIC} from '../src/procedural-music.ts';
import {AudioEngine} from '../src/audio.ts';

test('TITAN has a distinct finite loop with bounded memory and room for warning sounds',async()=>{
 const stems=[];for(let i=0;i<7;i++)stems.push(await renderMusicLayer(i,MUSIC.sampleRate,'titan-realm'));
 assert.ok(stems.every(s=>s.length===stems[0].length));
 assert.ok(stems.reduce((sum,s)=>sum+s.byteLength,0)<32*1048576);
 for(const stem of stems){let square=0,peak=0;for(const value of stem){assert.ok(Number.isFinite(value));square+=value*value;peak=Math.max(peak,Math.abs(value));}assert.ok(peak<.7);assert.ok(Math.sqrt(square/stem.length)>.002);}
 const old=await renderMusicLayer(3,MUSIC.sampleRate,'overlord');assert.notDeepEqual(stems[3].slice(0,10000),old.slice(0,10000));
 assert.equal(THEMES['titan-realm'].texture,'dream');
});
test('switching stages refreshes music even when both stages use the combat state',()=>{
 const audio=new AudioEngine(),themes=[];audio.catalog={music:{combat:{file:'assets/audio/combat.wav'}}};audio.activeState='combat';audio.procedural={setTheme:id=>themes.push(id)};
 audio.setChampion('titan-realm');assert.equal(audio.activeState,null);assert.deepEqual(themes,['titan-realm']);
 audio.setChampion('titan-realm');assert.deepEqual(themes,['titan-realm']);
});
