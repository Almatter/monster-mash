import type {MusicState} from './content-audio.ts';
export type ThemeId='menu'|'sovereign'|'overlord'|'titan'|'devourer'|'calamity';
type Theme={bpm:number;bars:number;mode:string;roots:number[];third:number[];motif:number[];drums:number[];bass:number[];texture:'bells'|'choir'|'hammer'|'breath'|'arcane'|'dulcimer'};
const repeat=(bars:number[],count:number)=>Array.from({length:count},(_,i)=>bars[i%bars.length]);
export const THEMES:Record<ThemeId,Theme>={
 menu:{bpm:104,bars:16,mode:'D natural minor / festival modal',roots:repeat([38,34,43,36,38,41,36,33],16),third:repeat([3,4,3,4,3,4,4,4],16),motif:[0,7,3,12,7,3,5,0],drums:[0,2.5],bass:[0,2],texture:'dulcimer'},
 sovereign:{bpm:108,bars:16,mode:'D harmonic minor / royal cadence',roots:repeat([38,34,43,33,38,36,34,33],16),third:repeat([3,4,3,4,3,4,4,4],16),motif:[0,12,7,15,12,7,3,0],drums:[0,2,3],bass:[0,1.5,2.5],texture:'bells'},
 overlord:{bpm:100,bars:16,mode:'E Phrygian / funeral march',roots:repeat([40,41,36,40,40,43,41,40],16),third:repeat([3,4,4,3,3,3,4,3],16),motif:[0,1,7,0,10,7,1,0],drums:[0,1,2,3],bass:[0,1,2,3],texture:'choir'},
 titan:{bpm:84,bars:12,mode:'G minor / open-fifth hammering',roots:repeat([31,34,29,31,31,36,34,29],12),third:repeat([3,4,3,3],12),motif:[0,7,0,12,7,0,10,7],drums:[0,2],bass:[0,2],texture:'hammer'},
 devourer:{bpm:144,bars:16,mode:'C Phrygian / predatory 3+3+2 pulse',roots:repeat([36,37,43,36,39,37,34,36],16),third:repeat([3,4,3,3,3,4,4,3],16),motif:[0,1,3,7,1,0,10,7],drums:[0,1.5,3],bass:[0,1.5,3],texture:'breath'},
 calamity:{bpm:132,bars:16,mode:'A harmonic minor / unstable arcana',roots:repeat([45,41,38,40,45,46,43,40],16),third:repeat([3,4,3,3,3,4,3,3],16),motif:[0,12,7,15,19,12,8,7],drums:[0,2.5,3.5],bass:[0,1,2,3.5],texture:'arcane'}
};
export const MUSIC={sampleRate:22050,layers:['drone / harmony','character bass','character percussion','signature motif','Carnage counterline','Unbound and Final Release','Titan threat / results cadence']} as const;
const MIX:Record<MusicState,number[]>={menu:[.72,.35,.22,.58,0,0,.08],combat:[.65,.8,.75,.72,0,0,0],escalation:[.7,.86,.88,.84,.55,.12,0],unbound:[.7,.95,.94,.9,.72,.7,0],final:[.74,1,1,.95,.9,1,.18],titan:[.75,.95,.96,.82,.63,.72,.9],results:[.55,0,0,.13,0,0,.5]};
function midiFrequency(midi:number){return 440*2**((midi-69)/12);}
// Each bar yields to the browser. All notes are authored or selected from a fixed motif;
// seven buffers/sources are reused through every intensity change in a run.
export async function renderMusicLayer(layer:number,sampleRate=MUSIC.sampleRate,themeId:ThemeId='menu'):Promise<Float32Array>{
 const theme=THEMES[themeId],beat=60/theme.bpm,total=theme.bars*4*beat,data=new Float32Array(Math.ceil(total*sampleRate));let seed=9137+layer*7919+Object.keys(THEMES).indexOf(themeId)*1013;
 const noise=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2147483648-1;};
 function note(at:number,duration:number,midi:number,volume:number,kind:'pad'|'bass'|'pluck'|'bell'|'kick'|'tom'|'tick'|'breath'|'arcane'){
  const start=Math.round(at*sampleRate),n=Math.round(duration*sampleRate),freq=midiFrequency(midi);for(let i=0;i<n;i++){const t=i/sampleRate,u=i/n,phase=2*Math.PI*freq*t;let value=0,envelope=1;
   if(kind==='pad'){envelope=Math.sin(Math.PI*u)**1.5;value=(Math.sin(phase)+.2*Math.sin(phase*2+.2*Math.sin(t*3))+.12*Math.sin(phase*3))*.62;}
   else if(kind==='bass'){envelope=Math.min(1,t/.012)*Math.exp(-u*3.4)*(1-u);value=Math.tanh((Math.sin(phase)+.25*Math.sin(phase*2))*1.8)*.7;}
   else if(kind==='pluck'){envelope=Math.min(1,t/.006)*Math.exp(-u*5);value=Math.sin(phase)*.65+Math.sin(phase*2)*.22+Math.sin(phase*3)*.07;}
   else if(kind==='bell'){envelope=Math.min(1,t/.008)*Math.exp(-u*4.5);value=Math.sin(phase)*.65+Math.sin(phase*2.76)*.22+Math.sin(phase*5.4)*.06;}
   else if(kind==='kick'){envelope=Math.exp(-t*11);value=Math.sin(2*Math.PI*(45*t+4*(1-Math.exp(-t*24))))+.05*noise()*Math.exp(-t*50);}
   else if(kind==='tom'){envelope=Math.exp(-t*7);value=.8*Math.sin(phase+2*(1-Math.exp(-t*15)))+.12*noise()*Math.exp(-t*20);}
   else if(kind==='breath'){envelope=Math.sin(Math.PI*u)*Math.exp(-u*2);value=(noise()*.12+Math.sin(phase)*.35+Math.sin(phase*2.4)*.14)*(.65+.35*Math.sin(t*15));}
   else if(kind==='arcane'){envelope=Math.exp(-u*4);value=.4*Math.sin(phase)+.18*Math.sin(phase*2.02)+.07*noise();}
   else{envelope=Math.exp(-t*26);value=noise()*.22+Math.sin(phase)*.13;}
   data[(start+i)%data.length]+=value*envelope*volume;
  }
 }
 for(let bar=0;bar<theme.bars;bar++){const at=bar*4*beat,root=theme.roots[bar],third=theme.third[bar],variation=Math.floor(bar/4);
  if(layer===0){const pad=theme.texture==='choir'?.085:theme.texture==='hammer'?.055:.067;for(const [off,gain] of [[0,pad],[12,pad*.38],[12+third,pad*.25],[19,pad*.35]])note(at,4.3*beat,root+off,gain,'pad');if(theme.texture==='choir')note(at+2*beat,2.5*beat,root+7,.045,'pad');}
  if(layer===1){for(const b of theme.bass){note(at+b*beat,.7*beat,root+(theme.texture==='breath'&&b===3?1:0),theme.texture==='hammer'?.18:.12,'bass');if(theme.texture==='breath')note(at+(b+.25)*beat,.3*beat,root-12,.035,'breath');}}
  if(layer===2){for(const b of theme.drums)note(at+b*beat,theme.texture==='hammer'?.55:.35,theme.texture==='hammer'?29:36,theme.texture==='hammer'?.24:.16,b%2?'tom':'kick');if(theme.texture==='breath')for(const b of [0.75,2.25,3.75])note(at+b*beat,.16,42,.085,'tom');if(theme.texture==='arcane')for(const b of [.75,1.75,2.75])note(at+b*beat,.2,52,.065,'tom');if(theme.texture==='dulcimer')for(const b of [1,3])note(at+b*beat,.24,46,.04,'tom');if(theme.texture==='choir')for(const b of [1,3])note(at+b*beat,.3,38,.09,'tom');if(bar%4===3)for(const b of [3.25,3.5,3.75])note(at+b*beat,.15,46,.04,'tom');}
  if(layer===3){const spacing=theme.texture==='hammer'?1:theme.texture==='arcane'?.25:.5,count=Math.round(4/spacing);for(let i=0;i<count;i++){if(theme.texture==='hammer'&&i%4===3)continue;if(theme.texture==='dulcimer'&&i%4===3)continue;const off=theme.motif[(i+variation+(bar%4===3?2:0))%theme.motif.length],pitch=root+(theme.texture==='hammer'?12:24)+(off===3?third:off),kind=theme.texture==='bells'||theme.texture==='hammer'?'bell':theme.texture==='arcane'?'arcane':'pluck';note(at+i*spacing*beat,(theme.texture==='hammer'?1.1:.55)*beat,pitch,theme.texture==='arcane'?.037:.055,kind);if(theme.texture==='dulcimer'&&i%2===0)note(at+(i*spacing+.28)*beat,.5*beat,pitch+12,.012,'pluck');}}
  if(layer===4){const pulses=theme.texture==='hammer'?8:16;for(let i=0;i<pulses;i++){if(theme.texture==='choir'&&i%4===3)continue;const off=[0,7,third,12][(i+variation)%4];note(at+i*4/pulses*beat,.27*beat,root+12+off,.039,theme.texture==='arcane'?'arcane':'bass');}}
  if(layer===5){for(const b of theme.texture==='hammer'?[0,2]:theme.texture==='breath'?[0,1.5,3]:[0,2.5])note(at+b*beat,.5,31,.09,'tom');const high=root+24+theme.motif[bar%theme.motif.length];note(at+(bar%2)*beat,2.2*beat,high,theme.texture==='breath'?.08:.05,theme.texture==='breath'?'breath':theme.texture==='arcane'?'arcane':'bell');}
  if(layer===6){if(themeId==='menu'){if(bar%2===0)note(at,3.5*beat,root+24,.045,'bell');}else{note(at,3.5*beat,root-12,.09,'pad');if(bar%2===0)note(at,3*beat,root+24,.075,'bell');if(bar%4===3)note(at+3*beat,beat,43,.075,'tom');}}
  await new Promise<void>(resolve=>setTimeout(resolve,0));
 }
 return data;
}
export class ProceduralMusic {
 voices:{source:AudioBufferSourceNode;gain:GainNode}[]=[];buffers:AudioBuffer[]=[];state:MusicState='menu';theme:ThemeId='menu';requestedTheme:ThemeId='menu';ready:Promise<void>|null=null;enabled=true;disposed=false;generation=0;
 context:AudioContext;output:GainNode;filter:BiquadFilterNode;
 constructor(context:AudioContext,destination:AudioNode){this.context=context;this.output=context.createGain();this.filter=context.createBiquadFilter();this.filter.type='lowpass';this.filter.frequency.value=4200;this.filter.Q.value=.4;this.output.gain.value=.75;this.output.connect(this.filter);this.filter.connect(destination);}
 async prepare(theme:ThemeId=this.requestedTheme){if(this.ready&&this.requestedTheme===theme)return this.ready;const gen=++this.generation;this.requestedTheme=theme;this.ready=(async()=>{const next:AudioBuffer[]=[];for(let layer=0;layer<MUSIC.layers.length;layer++){const pcm=await renderMusicLayer(layer,MUSIC.sampleRate,theme);if(this.disposed||gen!==this.generation)return;const buffer=this.context.createBuffer(1,pcm.length,MUSIC.sampleRate);buffer.copyToChannel(pcm,0);next.push(buffer);}if(this.disposed||gen!==this.generation)return;this.stop();this.theme=theme;this.buffers=next;this.enabled=true;this.start();})();return this.ready;}
 setTheme(theme:ThemeId){if(theme===this.requestedTheme)return;void this.prepare(theme);}
 start(){if(this.disposed||!this.enabled||this.voices.length||this.buffers.length!==7)return;const at=this.context.currentTime+.08;for(const buffer of this.buffers){const source=this.context.createBufferSource(),gain=this.context.createGain();source.buffer=buffer;source.loop=true;gain.gain.value=0;source.connect(gain);gain.connect(this.output);source.start(at);this.voices.push({source,gain});}this.mix();}
 setState(state:MusicState){this.state=state;this.enabled=true;void this.prepare(this.requestedTheme);this.start();this.mix();}
 mix(){const t=this.context.currentTime;this.voices.forEach((v,i)=>{v.gain.gain.cancelAndHoldAtTime(t);v.gain.gain.setTargetAtTime(MIX[this.state][i],t,.45);});}
 duck(){const t=this.context.currentTime;this.output.gain.cancelAndHoldAtTime(t);this.output.gain.linearRampToValueAtTime(.48,t+.04);this.output.gain.setTargetAtTime(.75,t+.22,.3);}
 stop(){this.enabled=false;for(const v of this.voices){try{v.source.stop();}catch{}v.source.disconnect();v.gain.disconnect();}this.voices=[];}
 dispose(){this.disposed=true;this.generation++;this.stop();this.buffers=[];this.output.disconnect();this.filter.disconnect();}
}
