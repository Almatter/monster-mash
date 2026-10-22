import {test} from 'node:test';
import assert from 'node:assert/strict';
import {CUES} from '../src/content-audio.ts';
import {synthesizeCue} from '../src/synth-sfx.ts';

test('victory fanfare has an audible melody and resolving chord within safe sample levels',()=>{
 const rate=24000,context={sampleRate:rate,createBuffer(channels,length,sampleRate){const pcm=new Float32Array(length);return {duration:length/sampleRate,getChannelData:()=>pcm};}};
 const buffer=synthesizeCue(context,'victory'),pcm=buffer.getChannelData(0);
 assert.equal(CUES.victory.bus,'ui','results tune can sound while the battlefield is paused');
 assert.equal(buffer.duration,3.6);
 for(const [start,end] of [[0,.7],[.8,1.8],[2.1,3.3]]){const samples=pcm.slice(start*rate,end*rate),rms=Math.sqrt(samples.reduce((sum,x)=>sum+x*x,0)/samples.length);assert.ok(rms>.025,'each phrase remains audible');}
 assert.ok(pcm.every(x=>Number.isFinite(x)&&Math.abs(x)<=1),'no clipping or invalid samples');
});
