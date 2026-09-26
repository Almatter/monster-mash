import {MONSTERS} from './content-monsters.ts';
export type BestRun={score:number;kills:number;seconds:number};
export type PersonalBests=Record<string,BestRun>;
export type ComparableRun={monsterId?:string;rules:string;phase:number;reason:'overwhelmed'|'retired';score:number;kills:number;duration:number};
export type Comparison={previous:number|null;delta:number;status:'first'|'record'|'tie'|'below'};
export const bestKey=(run:Pick<ComparableRun,'monsterId'|'rules'|'phase'|'reason'>)=>[run.rules,run.phase,run.monsterId||'sovereign',run.reason].join('|');
export function normalizeBests(value:unknown):PersonalBests{
 const result:PersonalBests={};if(!value||typeof value!=='object'||Array.isArray(value))return result;
 for(const [key,best] of Object.entries(value).slice(-160)){
  const [rules,phase,id,reason,...extra]=key.split('|');
  if(extra.length||!/^20\d{2}\.\d{2}-[a-z0-9-]{1,48}$/.test(rules)||!['0','1','2','3'].includes(phase)||!Object.hasOwn(MONSTERS,id)||!['overwhelmed','retired'].includes(reason)||!best||typeof best!=='object')continue;
  const b=best as BestRun;if(![b.score,b.kills,b.seconds].every(n=>Number.isSafeInteger(n)&&n>=0&&n<=1e12))continue;
  result[key]={score:b.score,kills:b.kills,seconds:b.seconds};
 }return result;
}
export function recordBest(bests:PersonalBests,run:ComparableRun):Comparison{
 const key=bestKey(run),old=bests[key],previous=old?.score??null,delta=run.score-(previous??0);
 bests[key]={score:Math.max(run.score,old?.score??0),kills:Math.max(run.kills,old?.kills??0),seconds:Math.max(run.duration,old?.seconds??0)};
 // Keep bounded local history; never combine different rules, weeks, champions or endings.
 const keys=Object.keys(bests);if(keys.length>160)for(const stale of keys.filter(k=>k!==key).slice(0,keys.length-160))delete bests[stale];
 return {previous,delta,status:previous===null?'first':delta>0?'record':delta===0?'tie':'below'};
}
export function comparisonText(value:Comparison,practice=false){
 const label=practice?'practice best':'personal best';
 if(value.status==='first')return 'First '+(practice?'practice':'completed')+' run in these conditions';
 if(value.status==='record')return 'New '+label+' · +'+value.delta.toLocaleString()+' Dominance';
 if(value.status==='tie')return 'Matched your '+label+' · '+value.previous!.toLocaleString();
 return Math.abs(value.delta).toLocaleString()+' Dominance below your '+label+' ('+value.previous!.toLocaleString()+')';
}
