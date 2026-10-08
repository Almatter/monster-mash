import {FEATS} from './data.ts';
import {FEAT_CONDITIONS} from './content-records.ts';
import type {Game,Enemy} from './simulation.ts';
export const COURT_FEATS=[
 {id:'hunt_claim',name:'Quick Claim',bonus:25000,legacyBonus:2000,condition:'Claim a fallen captain’s seal within 8 seconds.'},
 {id:'hunt_break',name:'Breakthrough',bonus:35000,legacyBonus:3000,condition:'Break the protection of all four guards in one captain’s retinue.'},
 {id:'hunt_pace',name:'Relentless Hunt',bonus:35000,legacyBonus:3000,condition:'Slay the next captain within 90 seconds of the previous one.'},
 {id:'hunt_dodge',name:'Read the Threat',bonus:25000,legacyBonus:2000,condition:'Leave a captain’s slam warning before it lands.'},
 {id:'hunt_focus',name:'Decisive Strike',bonus:35000,legacyBonus:3000,condition:'Slay a captain within 60 seconds of first damaging it.'}
].map(f=>({...f,cooldown:0}));
export const featsForStage=(phase:number)=>phase===2?[]:phase===1?COURT_FEATS:FEATS.map(f=>({...f,condition:FEAT_CONDITIONS[f.id]}));
export const featDefinition=(id:string)=>[...COURT_FEATS,...featsForStage(0)].find(f=>f.id===id);
export type CourtFeatState={earned:Set<string>;firstHit:Map<number,number>;guards:Map<number,Set<number>>;lastCaptainAt:number|null};
export const createCourtFeats=():CourtFeatState=>({earned:new Set(),firstHit:new Map(),guards:new Map(),lastCaptainAt:null});
export const courtFeatScore=(counts:Record<string,number>)=>COURT_FEATS.reduce((sum,f)=>sum+f.bonus*(counts[f.id]||0),0);
export const courtFeatMaximum=()=>courtFeatScore(Object.fromEntries(COURT_FEATS.map(f=>[f.id,f.id==='hunt_pace'?9:10])));
function earn(g:Game,id:string,serial:number){const state=g.court?.feats,definition=featDefinition(id);if(!state||!definition||state.earned.has(id+':'+serial))return;state.earned.add(id+':'+serial);g.score.feats[id]=(g.score.feats[id]||0)+1;const credit=definition.bonus;g.court!.scoring.feats=(g.court!.scoring.feats||0)+credit;g.score.dominance+=credit;g.announce('RUN FEAT · '+definition.name+' · +'+credit.toLocaleString());g.sound('feat');}
export function courtFeatHit(g:Game,e:Enemy,damage:number){if(e.court?.role==='captain'&&damage>0&&!g.court!.feats.firstHit.has(e.serial))g.court!.feats.firstHit.set(e.serial,g.time);}
export function courtFeatGuard(g:Game,e:Enemy){if(e.court?.role!=='vanguard'||e.court.site===undefined)return;const state=g.court!.feats,site=e.court.site,guards=state.guards.get(site)??new Set<number>();guards.add(e.serial);state.guards.set(site,guards);if(guards.size===4)earn(g,'hunt_break',site);}
export function courtFeatCaptain(g:Game,e:Enemy){const state=g.court!.feats,first=state.firstHit.get(e.serial);if(first!==undefined&&g.time-first<=60)earn(g,'hunt_focus',e.serial);if(state.lastCaptainAt!==null&&g.time-state.lastCaptainAt<=90)earn(g,'hunt_pace',e.serial);state.lastCaptainAt=g.time;}
export function courtFeatClaim(g:Game,serial:number,fallenAt:number|undefined){if(fallenAt!==undefined&&g.time-fallenAt<=8)earn(g,'hunt_claim',serial);}
export function courtSlamStart(g:Game,e:Enemy,inWarning:boolean){if(e.court?.role==='captain')e.court.slamThreatened=inWarning;}
export function courtSlamEnd(g:Game,e:Enemy,inWarning:boolean){if(e.court?.role!=='captain')return;if(e.court.slamThreatened&&!inWarning)earn(g,'hunt_dodge',e.serial);e.court.slamThreatened=false;}
