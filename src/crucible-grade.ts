import type {CrucibleRunSummary} from './crucible-rules.ts';
const cap=(n:number,max:number)=>Math.min(max,Math.max(0,Number.isFinite(n)?n:0));
export const CRUCIBLE_GRADE_LIMITS={victory:40,crystals:21,guardians:14,rivals:15,troops:10};
// Dominance is uncapped. This separate objective rubric always has a real 100-point ceiling.
export function crucibleGrade(s:CrucibleRunSummary){
 const parts=[{label:'Victory',points:s.cleared?40:0,max:40,detail:'Win the battle'}, {label:'Crystals shattered',points:cap(s.crystals,7)*3,max:21,detail:'3 points each; full credit at seven'}, {label:'Guardians defeated',points:cap(s.guardians,14),max:14,detail:'1 point each; full credit at fourteen'}, {label:'Rival champions slain',points:cap(s.champions,6)*2.5,max:15,detail:'2.5 points each; full credit at six'}, {label:'Minions farmed',points:cap(s.troops,1000)/100,max:10,detail:'1 point per hundred; full credit at one thousand'}];
 const base=parts.reduce((n,p)=>n+p.points,0),build=cap(s.perks,18)*5/18,survival=s.cleared?Math.max(0,5-cap(s.deaths,5)):0,combat=cap(Math.max(0,s.champions-6)+Math.max(0,s.troops-1000)/200,5),availableGrace=build+survival+combat,grace=Math.min(100-base,availableGrace),points=Math.floor(Math.min(100,base+grace)*10+1e-8)/10;
 return {limits:CRUCIBLE_GRADE_LIMITS,maximum:100,points,percent:points,letter:points>=100?'S':points>=90?'A':points>=80?'B':points>=70?'C':points>=60?'D':points>=50?'E':'F',base,grace,availableGrace,graceMaximum:15,parts,graceParts:[{label:'Build development',points:build,max:5},{label:'Victory survival',points:survival,max:5},{label:'Surplus combat',points:combat,max:5}]};
}
