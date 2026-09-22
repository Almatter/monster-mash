import {MONSTERS,paletteFor,BASE_TITLES,type Palette} from './content-monsters.ts';
import {createIdentity,sanitizeName,type Identity} from './identity.ts';
import {ACHIEVEMENTS,type Metrics} from './content-records.ts';
export type RecordProgress={best:number;unlockedAt?:string;name?:string;monsterId?:string};
export type Profile={version:2;identity:Identity;palettes:Record<string,Palette>;records:Record<string,RecordProgress>};
export interface StorageLike{getItem(key:string):string|null;setItem(key:string,value:string):void}
const object=(v:unknown):v is Record<string,any>=>!!v&&typeof v==='object'&&!Array.isArray(v);
export function normalizeProfile(value:unknown,legacyName=''):Profile{
 const raw=object(value)&&(value.version===2||value.version===1)?value:{};
 const identity=createIdentity(object(raw.identity)?raw.identity:{name:legacyName});const records:Profile['records']={},palettes:Profile['palettes']={};
 for(const m of Object.values(MONSTERS))palettes[m.id]=paletteFor(m,object(raw.palettes)?raw.palettes[m.id]:undefined);
 for(const a of ACHIEVEMENTS){const r=object(raw.records)?raw.records[a.id]:null;if(object(r)){const best=Number.isFinite(r.best)?Math.max(0,Math.min(1e9,r.best)):0;records[a.id]={best};if(typeof r.unlockedAt==='string'&&Number.isFinite(Date.parse(r.unlockedAt))&&best>=a.target){records[a.id].unlockedAt=r.unlockedAt;records[a.id].name=sanitizeName(r.name);records[a.id].monsterId=MONSTERS[r.monsterId]?r.monsterId:'sovereign';}}}
 const profile:Profile={version:2,identity,palettes,records};identity.colors={...palettes[identity.monsterId]};if(!availableTitles(profile).includes(identity.title))identity.title='';return profile;
}
export function availableTitles(profile:Profile){return [...BASE_TITLES,...ACHIEVEMENTS.filter(a=>a.title&&profile.records[a.id]?.unlockedAt).map(a=>a.title!)];}
export function loadProfile(storage?:StorageLike):Profile{try{return normalizeProfile(JSON.parse(storage?.getItem('mm-profile')||'null'),storage?.getItem('mm-name')||'');}catch{return normalizeProfile(null);}}
export function saveProfile(profile:Profile,storage?:StorageLike){try{storage?.setItem('mm-profile',JSON.stringify(profile));return !!storage;}catch{return false;}}
export function updateRecords(profile:Profile,metrics:Metrics,identity:Identity,now=new Date().toISOString()){
 const unlocked:string[]=[];for(const a of ACHIEVEMENTS){if(a.archetype&&a.archetype!==identity.monsterId)continue;const r=profile.records[a.id]??{best:0};r.best=Math.max(r.best,metrics[a.metric]||0);if(!r.unlockedAt&&r.best>=a.target){r.unlockedAt=now;r.name=identity.name;r.monsterId=identity.monsterId;unlocked.push(a.id);}profile.records[a.id]=r;}return unlocked;
}
