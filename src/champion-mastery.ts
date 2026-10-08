import {TITLES} from './content-titles.ts';
import type {Profile} from './profile.ts';

export const MASTERY_RANKS=[{rank:'F',points:0},{rank:'E',points:1000},{rank:'D',points:10000},{rank:'C',points:30000},{rank:'B',points:75000},{rank:'A',points:150000},{rank:'S',points:300000}] as const;
// Each later stage supplies its own capped pool. Future stages can add pools without
// changing saves or rewarding the same earlier-stage totals at a higher multiplier.
export const MASTERY_POOLS={foundations:9000,court:60000};
const PRACTICE:Record<string,{metric:string;target:number;label:string}[]>={
 titan:[{metric:'collision',target:50000,label:'Collision kills'},{metric:'trample',target:10000,label:'Stampede kills'}],
 devourer:[{metric:'devour',target:50000,label:'Consumed prey'},{metric:'eliteDevoured',target:50,label:'Elites devoured'}],
 calamity:[{metric:'magic',target:250000,label:'Spell kills'},{metric:'masteryBestCalamityMulti',target:300,label:'Largest spell multikill'}],
 overlord:[{metric:'owned',target:100000,label:'Servant kills'},{metric:'chain',target:25000,label:'Corruption kills'}],
 sovereign:[{metric:'devour',target:50000,label:'Consumed prey'},{metric:'beam',target:50000,label:'Death Beam kills'}],
 reaper:[{metric:'reaped',target:50000,label:'Scythe kills'},{metric:'moonstorm',target:15000,label:'Eclipse kills'},{metric:'graveshift',target:2000,label:'Blink kills'}]
};
export type MasteryRow={label:string;value:number;target:number;points:number;max:number};
const row=(label:string,value:number,target:number,max:number):MasteryRow=>({label,value,target,points:Math.floor(max*Math.min(1,Math.max(0,value)/target)),max});
export function championMastery(profile:Profile,id:string,courtAvailable=false){
 const p=profile.progress,kit=p.archetypes[id]||{},titles=TITLES.filter(t=>t.requirements.some(r=>r.scope===id));
 const baseTitles=titles.filter(t=>t.stage===undefined),courtTitles=titles.filter(t=>t.stage===1),practice=PRACTICE[id]||[];
 const bests=Object.entries(profile.personalBests).filter(([key])=>{const [,stage,champion]=key.split('|');return champion===id&&(stage==='0'||courtAvailable&&stage==='1');}).map(([,b])=>b);
 const bestSeconds=Math.max(kit.masteryBestSeconds||0,kit.stageOneBestSeconds||0,...bests.map(b=>b.seconds)),bestKills=Math.max(kit.stageOneBestKills||0,...bests.map(b=>b.kills));
 const milestones=[bestKills>=500,bestSeconds>=480,(kit.stageOneTitans||0)>0,(kit.masteryBestMulti||0)>=100,(kit.masteryBestCarnage||0)>=60].filter(Boolean).length;
 const abilityGoals=practice.map(r=>({...r,value:kit[r.metric]||0}));
 const foundationRows=[row('Playtime · 10 points per minute',(kit.seconds||0)/60,450,4500),row('Finished runs ≥60s · 20 points each',kit.runs||0,50,1000),row('Champion titles · 500 points each',baseTitles.filter(t=>p.titles[t.id]).length,3,1500),row('Ability practice',abilityGoals.reduce((n,r)=>n+Math.min(1,r.value/r.target),0),practice.length||1,1500),row('Combat milestones',milestones,5,500)];
 const courtRows=courtAvailable?[
  row('Completed hunts · 500 points each',kit.courtClears||0,40,20000),
  row('Colossus victories in completed hunts · 1,000 points each',kit.courtColossusClears||0,15,15000),
  row('Captains slain · 25 points each',kit.courtCaptains||0,400,10000),
  row('Guards broken · 5 points each',kit.courtGuards||0,1000,5000),
  row('Champion hunt titles · 2,000 points each',courtTitles.filter(t=>p.titles[t.id]).length,3,6000),
  row('Different rank-3 boons in completed hunts',Object.entries(kit).filter(([key,n])=>/^courtBoon\w+Clear$/.test(key)&&n>0).length,7,4000)
 ]:[];
 const foundations=Math.min(MASTERY_POOLS.foundations,foundationRows.reduce((n,r)=>n+r.points,0)),court=Math.min(MASTERY_POOLS.court,courtRows.reduce((n,r)=>n+r.points,0)),points=foundations+court;
 const level=[...MASTERY_RANKS].reverse().find(r=>points>=r.points)!,next=MASTERY_RANKS.find(r=>r.points>points);
 return {rank:level.rank,points,next,foundations,court,foundationRows,courtRows,abilityGoals,titles:titles.filter(t=>t.stage===undefined||courtAvailable)};
}
