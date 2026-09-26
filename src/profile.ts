import {normalizeBests,type PersonalBests} from './personal-bests.ts';
import {MONSTERS,paletteFor,BASE_TITLES,type Palette} from './content-monsters.ts';
import {createIdentity,sanitizeName,type Identity} from './identity.ts';
import {ACHIEVEMENTS,type Metrics} from './content-records.ts';
import {TITLES,awardTitles,type Progression,type Totals} from './content-titles.ts';
export type RecordProgress={best:number;unlockedAt?:string;name?:string;monsterId?:string};
export type Profile={version:3;identity:Identity;palettes:Record<string,Palette>;records:Record<string,RecordProgress>;progress:Progression;personalBests:PersonalBests};
export interface StorageLike{getItem(key:string):string|null;setItem(key:string,value:string):void}
const object=(v:unknown):v is Record<string,any>=>!!v&&typeof v==='object'&&!Array.isArray(v);
const number=(v:unknown)=>typeof v==='number'&&Number.isFinite(v)?Math.max(0,Math.min(1e12,v)):0;
const totals=(v:unknown):Totals=>object(v)?Object.fromEntries(Object.entries(v).filter(([k])=>/^[a-zA-Z]+$/.test(k)&&!['constructor','prototype','__proto__'].includes(k)).map(([k,n])=>[k,number(n)])):{};
export function emptyProgress():Progression{return {total:{},best:{},archetypes:{},titles:{},legacyTitles:[],ledger:null,finished:[]};}
export function normalizeProfile(value:unknown,legacyName=''):Profile{
 const raw=object(value)&&[1,2,3].includes(value.version)?value:{};
 const identity=createIdentity(object(raw.identity)?raw.identity:{name:legacyName});const records:Profile['records']={},palettes:Profile['palettes']={};
 for(const m of Object.values(MONSTERS))palettes[m.id]=paletteFor(m,(object(raw.palettes)?raw.palettes[m.id]:undefined)??(m.id===identity.monsterId?identity.colors:undefined));
 for(const a of ACHIEVEMENTS){const r=object(raw.records)?raw.records[a.id]:null;if(object(r)){const best=number(r.best);records[a.id]={best};if(typeof r.unlockedAt==='string'&&Number.isFinite(Date.parse(r.unlockedAt))&&best>=a.target){records[a.id].unlockedAt=r.unlockedAt;records[a.id].name=sanitizeName(r.name);records[a.id].monsterId=Object.hasOwn(MONSTERS,r.monsterId)?r.monsterId:'sovereign';}}}
 const progress=emptyProgress(),p=raw.version===3&&object(raw.progress)?raw.progress:{};
 progress.total=totals(p.total);progress.best=totals(p.best);for(const id of Object.keys(MONSTERS))progress.archetypes[id]=totals(p.archetypes?.[id]);
 for(const t of TITLES)if(typeof p.titles?.[t.id]==='string'&&Number.isFinite(Date.parse(p.titles[t.id])))progress.titles[t.id]=p.titles[t.id];
 const legacy=['The Blooded','The World Eater','Kingsbane','The Bloodless King'];
 progress.legacyTitles=raw.version===1||raw.version===2?ACHIEVEMENTS.filter(a=>a.title&&records[a.id]?.unlockedAt).map(a=>a.title!):Array.isArray(p.legacyTitles)?p.legacyTitles.filter((t:unknown)=>legacy.includes(String(t))):[];
 if(object(p.ledger)&&typeof p.ledger.id==='string')progress.ledger={id:p.ledger.id.slice(0,100),values:totals(p.ledger.values)};
 progress.finished=Array.isArray(p.finished)?p.finished.filter((s:unknown)=>typeof s==='string').slice(-64):[];
 const profile:Profile={version:3,identity,palettes,records,progress,personalBests:normalizeBests(raw.personalBests)};identity.colors={...palettes[identity.monsterId]};if(!availableTitles(profile).includes(identity.title))identity.title='';return profile;
}
export function availableTitles(profile:Profile){return [...new Set([...BASE_TITLES,...profile.progress.legacyTitles,...TITLES.filter(t=>profile.progress.titles[t.id]).map(t=>t.name)])];}
export function loadProfile(storage?:StorageLike):Profile{try{return normalizeProfile(JSON.parse(storage?.getItem('mm-profile')||'null'),storage?.getItem('mm-name')||'');}catch{return normalizeProfile(null);}}
export function saveProfile(profile:Profile,storage?:StorageLike){try{storage?.setItem('mm-profile',JSON.stringify(profile));return !!storage;}catch{return false;}}
export function updateRecords(profile:Profile,metrics:Metrics,identity:Identity,now=new Date().toISOString()){
 const unlocked:string[]=[];for(const a of ACHIEVEMENTS){if(a.archetype&&a.archetype!==identity.monsterId)continue;const r=profile.records[a.id]??{best:0};r.best=Math.max(r.best,metrics[a.metric]||0);if(!r.unlockedAt&&r.best>=a.target){r.unlockedAt=now;r.name=identity.name;r.monsterId=identity.monsterId;unlocked.push(a.id);}profile.records[a.id]=r;}return unlocked;
}
export type RunProgress={id:string;monsterId:string;values:Totals;best:Totals};
export function recordProgress(profile:Profile,run:RunProgress,finished=false){
 const p=profile.progress;if(p.finished.includes(run.id)||!Object.hasOwn(MONSTERS,run.monsterId))return [];
 const prior=p.ledger?.id===run.id?p.ledger.values:{},values=totals(run.values),kit=p.archetypes[run.monsterId]??={};
 for(const [key,value] of Object.entries(values)){const delta=Math.max(0,value-(prior[key]||0));p.total[key]=(p.total[key]||0)+delta;kit[key]=(kit[key]||0)+delta;values[key]=Math.max(value,prior[key]||0);}
 for(const [key,value] of Object.entries(totals(run.best)))p.best[key]=Math.max(p.best[key]||0,value);
 p.ledger={id:run.id,values};if(finished){if((values.seconds||0)>=60){p.total.runs=(p.total.runs||0)+1;kit.runs=(kit.runs||0)+1;}p.finished.push(run.id);p.finished=p.finished.slice(-64);p.ledger=null;}
 return awardTitles(p);
}
export function resetProgress(profile:Profile){profile.records={};profile.progress=emptyProgress();profile.personalBests={};if(!BASE_TITLES.includes(profile.identity.title))profile.identity.title='';}
