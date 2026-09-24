import {ABILITIES} from './content-monsters.ts';
import {CUES} from './content-audio.ts';
type Style='impact'|'slash'|'magic'|'chime'|'rumble'|'horn';
function design(kind:string):{style:Style;duration:number;pitch:number}{
 const ability=kind.startsWith('ability.')?ABILITIES[kind.slice(8)]:undefined;
 if(ability){const effect=ability.effect;if(['shockwave','blast','meteor','dominion','launch','execute'].includes(effect))return {style:'impact',duration:effect==='blast'||effect==='dominion'?.65:.35,pitch:95};if(['lunge','charge','frenzy'].includes(effect))return {style:'slash',duration:.3,pitch:230};return {style:'magic',duration:['beam','vortex'].includes(effect)?.38:.32,pitch:240+ability.radius*.08};}
 if(kind.startsWith('basic.'))return {style:['titan','devourer','sovereign'].some(id=>kind.endsWith(id))?'slash':'magic',duration:kind.endsWith('titan')?.26:.13,pitch:kind.endsWith('titan')?100:250};
 if(['enemyDeath','collision'].includes(kind))return {style:'slash',duration:.15,pitch:170};
 if(['heavyDeath','eliteDeath','hurt','ultimateImpact','meteorImpact','multikill'].includes(kind))return {style:'impact',duration:kind==='ultimateImpact'?.65:.32,pitch:kind==='heavyDeath'?85:125};
 if(['titanArrival','titanDeath','defeat','lowHealth'].includes(kind))return {style:'rumble',duration:kind==='lowHealth'?.38:.85,pitch:kind==='lowHealth'?68:58};
 if(['devour','corruption','ultimateStart','shield'].includes(kind))return {style:'magic',duration:kind==='ultimateStart'?.55:.3,pitch:kind==='devour'?130:270};
 if(kind==='wave')return {style:'horn',duration:.48,pitch:180};
 return {style:'chime',duration:Math.max(.1,Math.min(.65,CUES[kind]?.duration||.32)),pitch:CUES[kind]?.frequency||550};
}
function hash(value:string){let h=2166136261;for(const char of value){h^=char.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}
export function synthesizeCue(context:AudioContext,kind:string,variant=0){
 const {style,duration,pitch}=design(kind),sampleRate=context.sampleRate,length=Math.max(128,Math.ceil(duration*sampleRate));
 const buffer=context.createBuffer(1,length,sampleRate),samples=buffer.getChannelData(0);let seed=hash(kind)+variant*91891,phase=0,low=0,peak=0;
 const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296*2-1;};
 for(let i=0;i<length;i++){
  const t=i/sampleRate,p=i/length,attack=Math.min(1,t/.006),decay=Math.pow(1-p,style==='rumble'?1.4:2.3),n=random();low=low*.86+n*.14;
  const sweep=style==='magic'?pitch*(1.9-.9*p):style==='slash'?pitch*(1.45-1.1*p):pitch*(1.25-.8*p);phase+=Math.PI*2*sweep/sampleRate;
  let sound=0;
  if(style==='impact')sound=.6*low*(1-p)+.75*Math.sin(phase)*Math.exp(-p*7)+.18*n*Math.exp(-p*15);
  else if(style==='slash')sound=.68*(n-low)*Math.sin(Math.PI*p)+.4*Math.sin(phase)*Math.exp(-p*8);
  else if(style==='magic')sound=.34*Math.sin(phase)+.22*Math.sin(phase*1.51)+.22*(n-low)*Math.sin(Math.PI*p)+.16*Math.sin(phase*2.2);
  else if(style==='rumble')sound=.5*low+.45*Math.sin(phase)+.23*Math.sin(phase*.5)+.12*n;
  else if(style==='horn')sound=.55*Math.sin(phase)+.28*Math.sin(phase*2)+.18*Math.sin(phase*3)+.1*low;
  else {const note=p<.34?1:p<.67?1.26:1.5;sound=.55*Math.sin(phase*note)+.2*Math.sin(phase*note*2.01)+.13*Math.sin(phase*note*3.02);}
  const value=sound*attack*decay;samples[i]=value;peak=Math.max(peak,Math.abs(value));
 }
 const gain=peak>0?.82/peak:1;for(let i=0;i<length;i++)samples[i]*=gain;
 return buffer;
}
