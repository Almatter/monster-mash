import {normalizeTitanKit,type TitanKit} from './champion-kits.ts';
import {normalizeBests,type PersonalBests} from './personal-bests.ts';
import {MONSTERS,paletteFor,BASE_TITLES,type Palette} from './content-monsters.ts';
import {createIdentity,sanitizeName,type Identity} from './identity.ts';
import {ACHIEVEMENTS,type Metrics} from './content-records.ts';
import {TITLES,awardTitles,type Progression,type Totals} from './content-titles.ts';
import {STAGE_GATES,eventDay,recordStageTrial,gateChallengeComplete} from './stage-access.ts';
import {GATE_CHAMPIONS} from './gatebreaker.ts';
export type RecordProgress={best:number;unlockedAt?:string;name?:string;monsterId?:string};
export type Profile={version:3;titanKit:TitanKit;identity:Identity;palettes:Record<string,Palette>;records:Record<string,RecordProgress>;progress:Progression;personalBests:PersonalBests};
export interface StorageLike{getItem(key:string):string|null;setItem(key:string,value:string):void}
const object=(v:unknown):v is Record<string,any>=>!!v&&typeof v==='object'&&!Array.isArray(v);
const number=(v:unknown)=>typeof v==='number'&&Number.isFinite(v)?Math.max(0,Math.min(1e12,v)):0;
const totals=(v:unknown):Totals=>object(v)?Object.fromEntries(Object.entries(v).filter(([k])=>/^[a-zA-Z]+$/.test(k)&&!['constructor','prototype','__proto__'].includes(k)).map(([k,n])=>[k,number(n)])):{};
export function emptyProgress():Progression{return {total:{},best:{},archetypes:{},titles:{},legacyTitles:[],ledger:null,finished:[],trials:{}};}
export function normalizeProfile(value:unknown,legacyName=''):Profile{
 const raw=object(value)&&[1,2,3].includes(value.version)?value:{};
 const identity=createIdentity(object(raw.identity)?raw.identity:{name:legacyName});const records:Profile['records']={},palettes:Profile['palettes']={};
 for(const m of Object.values(MONSTERS))palettes[m.id]=paletteFor(m,(object(raw.palettes)?raw.palettes[m.id]:undefined)??(m.id===identity.monsterId?identity.colors:undefined));
 for(const a of ACHIEVEMENTS){const r=object(raw.records)?raw.records[a.id]:null;if(object(r)){const best=number(r.best);records[a.id]={best};if(typeof r.unlockedAt==='string'&&Number.isFinite(Date.parse(r.unlockedAt))&&best>=a.target){records[a.id].unlockedAt=r.unlockedAt;records[a.id].name=sanitizeName(r.name);records[a.id].monsterId=Object.hasOwn(MONSTERS,r.monsterId)?r.monsterId:'sovereign';}}}
 const progress=emptyProgress(),p=raw.version===3&&object(raw.progress)?raw.progress:{};
 progress.total=totals(p.total);progress.best=totals(p.best);for(const id of Object.keys(MONSTERS))progress.archetypes[id]=totals(p.archetypes?.[id]);
 const personalBests=normalizeBests(raw.personalBests);
 // Old saves retained champion totals and individual-stage bests, but no stage-specific
 // playtime ledger. Credit their existing native-champion experience once; all new
 // passage credit is explicitly recorded from Stage 1. Do not invent run histories.
 for(const id of GATE_CHAMPIONS){const kit=progress.archetypes[id];if(kit.stageOneTracked)continue;
  const bests=Object.entries(personalBests).filter(([key])=>{const [,phase,champion]=key.split('|');return phase==='0'&&champion===id;}).map(([,b])=>b);
  if(!Object.keys(kit).length&&!bests.length)continue;
  kit.stageOneTracked=1;kit.stageOneSeconds=kit.seconds||0;kit.stageOneRuns=kit.runs||0;kit.stageOneTitans=Math.max(0,(kit.titans||0)-(kit.courtColossusClears||0));
  kit.stageOneBestSeconds=Math.max(0,...bests.map(b=>b.seconds));kit.stageOneBestKills=Math.max(0,...bests.map(b=>b.kills));
 }
 for(const gate of STAGE_GATES){if(gate.kind!=='daily')continue;const byChampion=object(p.trials)?p.trials[gate.titleId]:null;if(!object(byChampion))continue;const first=eventDay(new Date(gate.qualifiesFrom));for(const id of Object.keys(MONSTERS)){const days=byChampion[id];if(Array.isArray(days)){progress.trials[gate.titleId]??={};progress.trials[gate.titleId][id]=[...new Set(days.filter((day:unknown)=>typeof day==='string'&&/^20\d{2}-\d{2}-\d{2}$/.test(day)&&Number.isFinite(Date.parse(day+'T12:00:00Z'))&&new Date(day+'T12:00:00Z').toISOString().slice(0,10)===day&&day>=first))].sort().slice(-gate.days);}}}
 for(const t of TITLES){const earned=p.titles?.[t.id],gate=STAGE_GATES.find(g=>g.titleId===t.id);if(typeof earned==='string'&&Number.isFinite(Date.parse(earned))&&(!gate||gateChallengeComplete(gate,progress)))progress.titles[t.id]=earned;}
 const legacy=['The Blooded','The World Eater','Kingsbane','The Bloodless King'];
 progress.legacyTitles=raw.version===1||raw.version===2?ACHIEVEMENTS.filter(a=>a.title&&records[a.id]?.unlockedAt).map(a=>a.title!):Array.isArray(p.legacyTitles)?p.legacyTitles.filter((t:unknown)=>legacy.includes(String(t))):[];
 if(object(p.ledger)&&typeof p.ledger.id==='string')progress.ledger={id:p.ledger.id.slice(0,100),values:totals(p.ledger.values)};
 progress.finished=Array.isArray(p.finished)?p.finished.filter((s:unknown)=>typeof s==='string').slice(-64):[];
 // Qualifying festival days also prove the champion's single-run survival/kill milestones.
 for(const id of GATE_CHAMPIONS){const kit=progress.archetypes[id];if(progress.trials.gatebreaker?.[id]?.length){kit.stageOneBestSeconds=Math.max(kit.stageOneBestSeconds||0,STAGE_GATES[0].kind==='daily'?STAGE_GATES[0].minSeconds:0);kit.stageOneBestKills=Math.max(kit.stageOneBestKills||0,15000);}}
 // This historic best was already explicitly restricted to Calamity by the caller.
 const calamity=progress.archetypes.calamity;if((calamity.magic||0)>0&&(progress.best.calamityMulti||0)>0)calamity.masteryBestCalamityMulti=Math.max(calamity.masteryBestCalamityMulti||0,progress.best.calamityMulti);
 awardTitles(progress);
 const profile:Profile={version:3,titanKit:normalizeTitanKit(raw.titanKit),identity,palettes,records,progress,personalBests};identity.colors={...palettes[identity.monsterId]};if(!availableTitles(profile).includes(identity.title))identity.title='';return profile;
}
export function availableTitles(profile:Profile){return [...new Set([...BASE_TITLES,...profile.progress.legacyTitles,...TITLES.filter(t=>profile.progress.titles[t.id]).map(t=>t.name)])];}
export function loadProfile(storage?:StorageLike):Profile{try{return normalizeProfile(JSON.parse(storage?.getItem('mm-profile')||'null'),storage?.getItem('mm-name')||'');}catch{return normalizeProfile(null);}}
export function saveProfile(profile:Profile,storage?:StorageLike){try{storage?.setItem('mm-profile',JSON.stringify(profile));return !!storage;}catch{return false;}}
export function updateRecords(profile:Profile,metrics:Metrics,identity:Identity,now=new Date().toISOString()){
 const unlocked:string[]=[];for(const a of ACHIEVEMENTS){if(a.archetype&&a.archetype!==identity.monsterId)continue;const r=profile.records[a.id]??{best:0};r.best=Math.max(r.best,metrics[a.metric]||0);if(!r.unlockedAt&&r.best>=a.target){r.unlockedAt=now;r.name=identity.name;r.monsterId=identity.monsterId;unlocked.push(a.id);}profile.records[a.id]=r;}return unlocked;
}
export type RunProgress={id:string;monsterId:string;phase?:number;reason?:'overwhelmed'|'retired'|'cleared';values:Totals;best:Totals};
export function recordProgress(profile:Profile,run:RunProgress,finished=false,endedAt=new Date()){
 const p=profile.progress;if(p.finished.includes(run.id)||!Object.hasOwn(MONSTERS,run.monsterId))return [];
 const prior=p.ledger?.id===run.id?p.ledger.values:{},values=totals(run.values),kit=p.archetypes[run.monsterId]??={};
 kit.stageOneTracked=1;
 const gate=STAGE_GATES[0],passage=(run.phase??0)===0&&GATE_CHAMPIONS.includes(run.monsterId)&&gate.kind==='daily'&&endedAt.getTime()>=Date.parse(gate.qualifiesFrom);
 for(const [key,value] of Object.entries(values)){const delta=Math.max(0,value-(prior[key]||0));p.total[key]=(p.total[key]||0)+delta;kit[key]=(kit[key]||0)+delta;values[key]=Math.max(value,prior[key]||0);
  if(passage&&['seconds','titans'].includes(key)){const metric='stageOne'+key[0].toUpperCase()+key.slice(1);kit[metric]=(kit[metric]||0)+delta;}
  if(run.phase===1&&!key.startsWith('court')){const metric='court'+key[0].toUpperCase()+key.slice(1);kit[metric]=(kit[metric]||0)+delta;p.total[metric]=(p.total[metric]||0)+delta;}
 }
 for(const [key,value] of Object.entries(totals(run.best))){p.best[key]=Math.max(p.best[key]||0,value);const metric='masteryBest'+key[0].toUpperCase()+key.slice(1);kit[metric]=Math.max(kit[metric]||0,value);}
 if(finished&&passage){kit.stageOneBestSeconds=Math.max(kit.stageOneBestSeconds||0,values.seconds||0);kit.stageOneBestKills=Math.max(kit.stageOneBestKills||0,values.kills||0);if((values.seconds||0)>=60)kit.stageOneRuns=(kit.stageOneRuns||0)+1;}
 p.ledger={id:run.id,values};if(finished){if((values.seconds||0)>=60){p.total.runs=(p.total.runs||0)+1;kit.runs=(kit.runs||0)+1;}if(Number.isFinite(endedAt.getTime()))recordStageTrial(p.trials,{monsterId:run.monsterId,phase:run.phase??0,reason:run.reason??'retired',seconds:values.seconds||0,kills:values.kills||0},endedAt);p.finished.push(run.id);p.finished=p.finished.slice(-64);p.ledger=null;}
 return awardTitles(p);
}
export function resetProgress(profile:Profile){profile.records={};profile.progress=emptyProgress();profile.personalBests={};if(!BASE_TITLES.includes(profile.identity.title))profile.identity.title='';}
