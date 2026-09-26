import {ABILITIES,MONSTERS} from './content-monsters.ts';
import {CUES,isDeathCue,isOrganicCue} from './content-audio.ts';
type Style='tear'|'stone'|'infernal'|'ossuary'|'rift'|'death'|'cataclysm'|'rune';
type Design={style:Style;duration:number;pitch:number;weight:number};
function design(kind:string):Design{
 const ability=kind.startsWith('ability.')?ABILITIES[kind.slice(8)]:undefined;
 const owner=ability?Object.values(MONSTERS).find(m=>m.abilities.includes(ability.id))?.id:kind.startsWith('basic.')?kind.slice(6):'';
 const styles:Record<string,Style>={devourer:'tear',titan:'stone',sovereign:'infernal',overlord:'ossuary',calamity:'rift'};
 if(owner){const ultimate=ability&&['blast','dominion','frenzy'].includes(ability.effect);return {style:styles[owner]||'infernal',duration:ultimate?.8:ability?.42:owner==='titan'?.29:.2,pitch:owner==='titan'?62:owner==='devourer'?136:owner==='calamity'?104:86,weight:ultimate?1:.67};}
 if(kind==='multikill.extinction')return {style:'cataclysm',duration:1.25,pitch:43,weight:1};
 if(kind==='multikill.annihilation')return {style:'cataclysm',duration:.95,pitch:54,weight:.92};
 if(kind==='multikill.bloodbath'||kind==='multikill')return {style:'cataclysm',duration:.68,pitch:72,weight:.78};
 if(['titanArrival','titanDeath','defeat','ultimateImpact','meteorImpact'].includes(kind))return {style:'cataclysm',duration:kind==='titanDeath'?1.2:.8,pitch:kind==='titanDeath'?39:53,weight:1};
 if(kind==='enemyDeath'||kind.startsWith('enemyDeath.')){const species=kind.split('.')[1]||'thrall',pitches:Record<string,number>={thrall:170,hound:118,wing:235,spitter:145};return {style:species==='hound'?'tear':species==='spitter'?'ossuary':'death',duration:species==='wing'?.18:species==='hound'?.25:.22,pitch:pitches[species]||170,weight:.4};}
 if(['heavyDeath','eliteDeath','hurt','collision'].includes(kind))return {style:kind==='heavyDeath'||kind==='eliteDeath'?'stone':'death',duration:kind==='enemyDeath'?.22:.4,pitch:kind==='enemyDeath'?170:90,weight:kind==='enemyDeath'?.4:.75};
 if(['devour','corruption'].includes(kind))return {style:'tear',duration:.4,pitch:140,weight:.7};
 if(['ultimateStart','carnage','lowHealth','shield','heal'].includes(kind))return {style:'rift',duration:kind==='ultimateStart'?.7:.42,pitch:89,weight:.6};
 return {style:'rune',duration:Math.max(.1,Math.min(.65,CUES[kind]?.duration||.32)),pitch:kind==='title'?124:kind==='achievement'?176:218,weight:kind==='title'?.8:.4};
}
function hash(value:string){let h=2166136261;for(const char of value){h^=char.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}
export function synthesizeCue(context:AudioContext,kind:string,variant=0){
 const base=design(kind),devourerBasic=kind==='basic.devourer',organic=isOrganicCue(kind),death=isDeathCue(kind),style=base.style,duration=base.duration*(organic?[.84,.93,1,1.08,1.16][variant%5]:1),pitch=base.pitch*(organic?1+((variant*7)%11-5)*(death?.022:.014):1),weight=base.weight,rate=context.sampleRate,length=Math.max(128,Math.ceil(duration*rate));
 const buffer=context.createBuffer(1,length,rate),samples=buffer.getChannelData(0);
 let seed=hash(kind)+variant*91891,phase=0,subPhase=0,low=0,lowSlow=0,drift=0,delay=0,peak=0;
 const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2147483648-1;};
 for(let i=0;i<length;i++){
  const t=i/rate,p=i/length,n=random();low+=.14*(n-low);lowSlow+=.025*(n-lowSlow);drift+=.0007*(n-drift);
  const hiss=n-low,grit=low-lowSlow;
  const unstable=1+.045*Math.sin((43+variant*2)*t+variant)+.018*Math.sin(131*t)+drift*.1;
  const sweep=style==='rift'?.58+1.55*p:style==='tear'?1.8-1.1*p:style==='death'?2.1-1.65*p:1.2-.45*p;
  phase+=Math.PI*2*pitch*sweep*unstable/rate;subPhase+=Math.PI*2*pitch*.5*(1-.5*p)/rate;
  const throat=Math.tanh(2.8*(Math.sin(phase)+.33*Math.sin(phase*2.07)+.15*Math.sin(phase*3.7)));
  const choir=.5*Math.sin(phase*.51+Math.sin(phase*.08)*2.6)+.31*Math.sin(phase*.76)+.19*Math.sin(phase*1.48);
  const sub=Math.sin(subPhase);
  const shift=organic?Math.sin(variant*1.9)*.018:0,crack=Math.max(0,1-Math.abs(p-(.06+shift))/.018)+.7*Math.max(0,1-Math.abs(p-(.21-shift))/.015)+.43*Math.max(0,1-Math.abs(p-(.43+shift))/.011);
  const reverse=Math.pow(p,1.7)*Math.pow(1-p,.6)*3;
  let sample=0;
  if(style==='tear'){const bite=devourerBasic?1+.18*Math.sin(variant*1.7):1,rasp=devourerBasic?1+.16*Math.cos(variant*2.1):1;sample=.48*bite*throat*Math.sin(phase*.18+1)+.45*rasp*hiss*(.4+.6*Math.abs(Math.sin(phase*.11)))+.25*sub+.43*grit*crack;}
  else if(style==='stone')sample=.7*sub*Math.exp(-p*5)+.55*grit+.8*hiss*crack+.12*choir;
  else if(style==='infernal')sample=.62*choir+.25*throat+.22*sub+.32*grit*crack;
  else if(style==='ossuary')sample=.64*choir+.31*lowSlow+.32*hiss*Math.abs(Math.sin(phase*.37))+.2*sub;
  else if(style==='rift')sample=.39*throat+.53*hiss*reverse+.43*sub*Math.exp(-p*2)+.25*grit*crack;
  else if(style==='death')sample=(.43+(death?Math.sin(variant*1.7)*.08:0))*throat+(.55+(death?Math.cos(variant*2.1)*.1:0))*hiss*Math.pow(1-p,1.5)+.16*sub;
  else if(style==='cataclysm')sample=.65*sub+.36*choir+.5*grit+.73*hiss*crack;
  else sample=.32*choir+.18*grit*crack+.22*hiss*Math.exp(-p*11)+.08*sub;
  const attack=Math.min(1,t/(style==='rift'?.035:.006));
  const release=Math.pow(1-p,style==='cataclysm'?1.2:style==='rune'?2.4:1.65);
  const envelope=attack*release*(style==='rift'?.35+.65*Math.min(1,p*4):1);
  sample=Math.tanh(sample*1.85)*envelope*weight;
  // A short, filtered ghost reflection adds scale without keeping additional audio voices alive.
  delay=delay*.985+sample*.015;
  const value=sample+delay*.16;samples[i]=value;peak=Math.max(peak,Math.abs(value));
 }
 const gain=peak>0?.72/peak:1;for(let i=0;i<length;i++)samples[i]*=gain;
 return buffer;
}
