// Add later stages here when their challenge, opening date, and map are ready.
// The same title + server-time gate drives every selectable stage after the first.
export type StageGate={phase:number;sourcePhase:number;titleId:string;title:string;opensAt:string;qualifiesFrom:string;days:number;minSeconds:number;minKills:number};
export const STAGE_GATES:StageGate[]=[
 {phase:1,sourcePhase:0,titleId:'gatebreaker',title:'The Gatebreaker',opensAt:'2026-10-08T04:00:00.000Z',qualifiesFrom:'2026-10-01T04:00:00.000Z',days:7,minSeconds:510,minKills:15000}
];
export const gateForStage=(phase:number)=>STAGE_GATES.find(g=>g.phase===phase);
export function openingText(gate:StageGate){return new Intl.DateTimeFormat('en-US',{timeZone:'America/Indiana/Indianapolis',month:'long',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit'}).format(new Date(gate.opensAt))+' Eastern';}
export type StageTrials=Record<string,Record<string,string[]>>;
export const trialDays=(trials:StageTrials,gate:StageGate)=>Math.max(0,...Object.values(trials[gate.titleId]||{}).map(days=>days.length));
export function eventDay(date:Date){const parts=new Intl.DateTimeFormat('en-US',{timeZone:'America/Indiana/Indianapolis',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date);const get=(key:string)=>parts.find(p=>p.type===key)?.value||'';return `${get('year')}-${get('month')}-${get('day')}`;}
export type StageRun={monsterId:string;phase:number;reason:'overwhelmed'|'retired';seconds:number;kills:number};
export function recordStageTrial(trials:StageTrials,run:StageRun,endedAt:Date){let changed=false;for(const gate of STAGE_GATES){if(run.phase!==gate.sourcePhase||run.reason!=='overwhelmed'||run.seconds<gate.minSeconds||run.kills<gate.minKills||endedAt.getTime()<Date.parse(gate.qualifiesFrom))continue;const day=eventDay(endedAt),byChampion=trials[gate.titleId]??={},days=byChampion[run.monsterId]??=[];if(!days.includes(day)){days.push(day);days.sort();if(days.length>gate.days)days.splice(0,days.length-gate.days);changed=true;}}return changed;}
export function stageAccess(phase:number,progress:{titles:Record<string,string>;trials:StageTrials},serverTime:number|null){if(phase===0)return 'open' as const;const gate=gateForStage(phase);if(!gate)return 'future' as const;if(!progress.titles[gate.titleId]||trialDays(progress.trials,gate)<gate.days)return 'title' as const;if(serverTime===null)return 'clock' as const;return serverTime<Date.parse(gate.opensAt)?'date' as const:'open' as const;}
export async function serverTime(fetcher:typeof fetch=fetch){try{const response=await fetcher('index.html?stage-clock='+Math.random().toString(36).slice(2),{method:'HEAD',cache:'no-store'});if(!response.ok)return null;const stamp=Date.parse(response.headers.get('Date')||'');return Number.isFinite(stamp)?stamp:null;}catch{return null;}}
