// Passage credit is deliberately separate from the month-long champion mastery rank.
export const GATE_CHAMPIONS=['sovereign','titan','calamity','overlord','devourer'];
type PassageProgress={titles:Record<string,string>;archetypes?:Record<string,Record<string,number>>};
export function gatebreakerExperience(p:PassageProgress,id:string){
 const kit=p.archetypes?.[id]||{},eligible=GATE_CHAMPIONS.includes(id);
 const minutes=(kit.stageOneSeconds||0)/60,runs=kit.stageOneRuns||0,bestSeconds=kit.stageOneBestSeconds||0;
 const rows=[
  {label:'Stage 1 playtime · 1 point per minute',points:minutes},
  {label:'Finished Stage 1 runs ≥60s · 5 points each, up to 30',points:Math.min(30,runs*5)},
  {label:'First champion mastery title · 10 points',points:p.titles[id+'1']?10:0},
  {label:'500 slain in one Stage 1 run · 5 points',points:(kit.stageOneBestKills||0)>=500?5:0},
  {label:'Slay a Stage 1 Titan · 5 points',points:(kit.stageOneTitans||0)>0?5:0}
 ];
 const points=eligible?rows.reduce((n,r)=>n+r.points,0):0;
 return {points,runs,bestSeconds,rows,complete:eligible&&points>=100&&runs>=6&&bestSeconds>=480};
}
export function gatebreakerLeader(p:PassageProgress){return GATE_CHAMPIONS.reduce((best,id)=>gatebreakerExperience(p,id).points>gatebreakerExperience(p,best).points?id:best,GATE_CHAMPIONS[0]);}
export function gatebreakerSummary(p:PassageProgress,id=gatebreakerLeader(p)){const r=gatebreakerExperience(p,id);return Math.floor(r.points)+' / 100 passage points · '+Math.min(r.runs,6)+' / 6 runs · '+(r.bestSeconds>=480?'8-minute run achieved':'needs an 8-minute run');}
