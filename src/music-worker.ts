import {renderMusicLayer,MUSIC,type ThemeId} from './procedural-music.ts';
// Generate authored scores away from the canvas/input thread on supported browsers.
self.onmessage=async(event:MessageEvent<{theme:ThemeId}>)=>{try{for(let layer=0;layer<MUSIC.layers.length;layer++){const pcm=await renderMusicLayer(layer,MUSIC.sampleRate,event.data.theme);self.postMessage({layer,pcm}, {transfer:[pcm.buffer]});}self.postMessage({complete:true});}catch(error){self.postMessage({error:String(error)});}};
