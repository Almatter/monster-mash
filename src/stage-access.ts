// Add later stages here when their challenge, opening date, and map are ready.
// The same title + server-time gate drives every selectable stage after the first.
type GateBase={phase:number;sourcePhase:number;titleId:string;title:string;opensAt:string|null;ready?:boolean};
export type DailyGate=GateBase&{kind:'daily';qualifiesFrom:string;ending:'any'|'overwhelmed';days:number;minSeconds:number;minKills:number};
export type MasteryGoal={metric:'clears'|'colossi'|'boons';target:number;label:string};
export type MasteryGate=GateBase&{kind:'mastery';goals:MasteryGoal[]};
export type StageGate=DailyGate|MasteryGate;
export const MASTERY_BOONS=[{id:'haste',metric:'courtBoonHasteClear',name:'Wayfarer'},{id:'power',metric:'courtBoonPowerClear',name:'Kingslayer'},{id:'reach',metric:'courtBoonReachClear',name:'Far Reach'},{id:'recharge',metric:'courtBoonRechargeClear',name:'Relentless'},{id:'tempo',metric:'courtBoonTempoClear',name:'Rending Rhythm'},{id:'duration',metric:'courtBoonDurationClear',name:'Enduring Power'},{id:'vitality',metric:'courtBoonVitalityClear',name:'Second Heart'}] as const;
export const STAGE_GATES:StageGate[]=[
 {kind:'daily',phase:1,sourcePhase:0,titleId:'gatebreaker',title:'The Gatebreaker',opensAt:'2026-10-08T04:00:00.000Z',qualifiesFrom:'2026-09-25T04:00:00.000Z',ending:'any',days:7,minSeconds:510,minKills:15000},
 {kind:'mastery',phase:2,sourcePhase:1,titleId:'ashenGatebreaker',title:'The Ashen Gatebreaker',opensAt:'2026-10-15T04:00:00.000Z',ready:false,goals:[{metric:'clears',target:12,label:'completed Stage 2 hunts'},{metric:'colossi',target:5,label:'completed hunts with the Colossus slain'},{metric:'boons',target:4,label:'different boons at rank 3 in completed hunts'}]}
];
export const gateForStage=(phase:number)=>STAGE_GATES.find(g=>g.phase===phase);
export function openingText(gate:StageGate){if(!gate.opensAt)return 'Opening date to be announced';return new Intl.DateTimeFormat('en-US',{timeZone:'America/Indiana/Indianapolis',month:'long',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit'}).format(new Date(gate.opensAt))+' Eastern';}
export function openingDay(gate:StageGate){if(!gate.opensAt)return 'Opening date to be announced';return new Intl.DateTimeFormat('en-US',{timeZone:'America/Indiana/Indianapolis',month:'short',day:'numeric'}).format(new Date(gate.opensAt));}
export const briefKillTarget=(gate:DailyGate)=>gate.minKills%1000===0?gate.minKills/1000+'K':gate.minKills.toLocaleString();
export type StageTrials=Record<string,Record<string,string[]>>;
export const trialDays=(trials:StageTrials,gate:StageGate)=>gate.kind==='daily'?Math.max(0,...Object.values(trials[gate.titleId]||{}).map(days=>days.length)):0;
export function eventDay(date:Date){const parts=new Intl.DateTimeFormat('en-US',{timeZone:'America/Indiana/Indianapolis',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date);const get=(key:string)=>parts.find(p=>p.type===key)?.value||'';return `${get('year')}-${get('month')}-${get('day')}`;}
export type StageRun={monsterId:string;phase:number;reason:'overwhelmed'|'retired'|'cleared';seconds:number;kills:number};
export function recordStageTrial(trials:StageTrials,run:StageRun,endedAt:Date){let changed=false;for(const gate of STAGE_GATES){if(gate.kind!=='daily'||run.phase!==gate.sourcePhase||gate.ending==='overwhelmed'&&run.reason!=='overwhelmed'||run.seconds<gate.minSeconds||run.kills<gate.minKills||endedAt.getTime()<Date.parse(gate.qualifiesFrom))continue;const day=eventDay(endedAt),byChampion=trials[gate.titleId]??={},days=byChampion[run.monsterId]??=[];if(!days.includes(day)){days.push(day);days.sort();if(days.length>gate.days)days.splice(0,days.length-gate.days);changed=true;}}return changed;}
export function trialFeedback(gate:DailyGate,trials:StageTrials,run:StageRun,endedAt:Date,previouslyCounted:boolean){const days=trials[gate.titleId]?.[run.monsterId]||[],label=gate.title+' · '+days.length+' / '+gate.days+' days';if(days.includes(eventDay(endedAt)))return label+(previouslyCounted?' · today already counted':' · this run counted');if(endedAt.getTime()<Date.parse(gate.qualifiesFrom))return label+' · qualifying runs have not begun';if(run.seconds<gate.minSeconds||run.kills<gate.minKills)return label+` · needs ${Math.floor(gate.minSeconds/60)}:${String(gate.minSeconds%60).padStart(2,'0')} and ${gate.minKills.toLocaleString()} kills in one run`;if(gate.ending==='overwhelmed'&&run.reason!=='overwhelmed')return label+' · this stage requires a natural ending';return label+' · this run did not qualify';}
export type GateProgress={titles:Record<string,string>;trials:StageTrials;archetypes?:Record<string,Record<string,number>>};
export function masteryProgress(gate:MasteryGate,p:GateProgress,champion:string){const kit=p.archetypes?.[champion]||{};return gate.goals.map(goal=>({...goal,value:goal.metric==='clears'?(kit.courtClears||0):goal.metric==='colossi'?(kit.courtColossusClears||0):MASTERY_BOONS.filter(b=>(kit[b.metric]||0)>0).length}));}
export function masteryChampion(gate:MasteryGate,p:GateProgress){return Object.keys(p.archetypes||{}).sort((a,b)=>{const score=(id:string)=>masteryProgress(gate,p,id).reduce((n,r)=>n+Math.min(1,r.value/r.target),0);return score(b)-score(a);})[0]||'';}
export function gateChallengeComplete(gate:StageGate,p:GateProgress){return gate.kind==='daily'?trialDays(p.trials,gate)>=gate.days:Object.keys(p.archetypes||{}).some(id=>masteryProgress(gate,p,id).every(r=>r.value>=r.target));}
export function stageAccess(phase:number,progress:GateProgress,serverTime:number|null){
 if(phase===0)return 'open' as const;const gate=gateForStage(phase);if(!gate||gate.ready===false||!gate.opensAt)return 'future' as const;
 if(!progress.titles[gate.titleId]||!gateChallengeComplete(gate,progress))return 'title' as const;
 if(gate.sourcePhase>0){const prior=stageAccess(gate.sourcePhase,progress,serverTime);if(prior!=='open')return prior;}
 if(serverTime===null)return 'clock' as const;return serverTime<Date.parse(gate.opensAt)?'date' as const:'open' as const;
}

export async function serverTime(fetcher:typeof fetch=fetch){try{const response=await fetcher('index.html?stage-clock='+Math.random().toString(36).slice(2),{method:'HEAD',cache:'no-store'});if(!response.ok)return null;const stamp=Date.parse(response.headers.get('Date')||'');return Number.isFinite(stamp)?stamp:null;}catch{return null;}}
