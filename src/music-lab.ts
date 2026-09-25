import {AudioEngine} from './audio.ts';
import {MUSIC,THEMES,type ThemeId} from './procedural-music.ts';
import type {MusicState} from './content-audio.ts';
const audio=new AudioEngine();(document.getElementById('theme') as HTMLSelectElement).onchange=e=>{audio.unlock();const theme=(e.target as HTMLSelectElement).value as ThemeId;audio.setChampion(theme);void audio.setMusic(theme==='menu'?'menu':'combat');};
for(const state of ['menu','combat','escalation','unbound','final','titan','results'] as MusicState[]){const b=document.createElement('button');b.textContent=state==='escalation'?'HIGH CARNAGE':state.toUpperCase();b.onclick=()=>{audio.unlock();void audio.setMusic(state);};document.getElementById('states')!.append(b);}
document.getElementById('duck')!.onclick=()=>audio.procedural?.duck();document.getElementById('pause')!.onclick=()=>audio.setPaused(!audio.paused);document.getElementById('mute')!.onclick=()=>audio.muted=!audio.muted;
(document.getElementById('volume') as HTMLInputElement).oninput=e=>audio.setVolume('music',Number((e.target as HTMLInputElement).value));
document.addEventListener('visibilitychange',()=>audio.setPaused(document.hidden));window.addEventListener('pagehide',()=>audio.dispose());
setInterval(()=>{document.getElementById('status')!.textContent=audio.context?audio.champion.toUpperCase()+' / '+audio.state.toUpperCase()+' · '+audio.context.state+' · '+(audio.procedural?.voices.length||0)+' synchronized stems · '+(audio.procedural?.buffers.length||0)+'/7 prepared'+(audio.muted?' · MUTED':'')+'\n'+THEMES[audio.champion].mode+' · '+THEMES[audio.champion].bpm+' BPM · '+MUSIC.layers.join(' / '):'Audio waits for your gesture.';},250);
