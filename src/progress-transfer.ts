import {normalizeProfile,type Profile,type StorageLike} from './profile.ts';
import {awardTitles,type Totals} from './content-titles.ts';
import {STAGE_GATES} from './stage-access.ts';

export const MAX_PROGRESS_BYTES=1024*1024;
export const IMPORT_BACKUP_KEY='mm-profile-before-import';
const object=(v:unknown):v is Record<string,any>=>!!v&&typeof v==='object'&&!Array.isArray(v);
export function progressExport(profile:Profile,now=new Date()){
 const snapshot=normalizeProfile(profile);snapshot.progress.ledger=null;
 return JSON.stringify({format:'monster-mash-progress',version:1,exportedAt:now.toISOString(),profile:snapshot},null,2);
}
export function parseProgressExport(text:string):Profile{
 if(new TextEncoder().encode(text).length>MAX_PROGRESS_BYTES)throw Error('This file is too large to be a progress backup.');
 let data:unknown;try{data=JSON.parse(text);}catch{throw Error('This file is not valid JSON. Choose an exported progress backup.');}
 if(!object(data)||data.format!=='monster-mash-progress')throw Error('Choose a Monster Mash progress backup, rather than a run code or result card.');
 if(data.version!==1)throw Error('This backup format is not supported by this version of Monster Mash.');
 const p=data.profile;
 if(!object(p)||p.version!==3||!object(p.identity)||typeof p.identity.name!=='string'||!object(p.palettes)||!object(p.records)||!object(p.personalBests)||!object(p.progress)||!['total','best','archetypes','titles'].every(k=>object(p.progress[k]))||!Array.isArray(p.progress.finished)||!Array.isArray(p.progress.legacyTitles))throw Error('This backup is incomplete or uses an unsupported save format. Your current progress has not changed.');
 const profile=normalizeProfile(p);profile.progress.ledger=null;return profile;
}
const maxima=(a:Totals,b:Totals):Totals=>Object.fromEntries([...new Set([...Object.keys(a),...Object.keys(b)])].map(k=>[k,Math.max(a[k]||0,b[k]||0)]));
const earlier=(a:string|undefined,b:string|undefined)=>!a?b:!b?a:Date.parse(a)<=Date.parse(b)?a:b;
export function mergeProgress(local:Profile,incoming:Profile):Profile{
 const a=normalizeProfile(local),b=normalizeProfile(incoming),merged=normalizeProfile(b),p=merged.progress;
 p.total=maxima(a.progress.total,b.progress.total);p.best=maxima(a.progress.best,b.progress.best);
 for(const id of Object.keys(p.archetypes))p.archetypes[id]=maxima(a.progress.archetypes[id],b.progress.archetypes[id]);
 for(const id of new Set([...Object.keys(a.records),...Object.keys(b.records)])){
  const left=a.records[id],right=b.records[id],date=earlier(left?.unlockedAt,right?.unlockedAt);
  merged.records[id]={...(date===left?.unlockedAt?left:right),best:Math.max(left?.best||0,right?.best||0)};
 }
 for(const id of new Set([...Object.keys(a.progress.titles),...Object.keys(b.progress.titles)]))p.titles[id]=earlier(a.progress.titles[id],b.progress.titles[id])!;
 p.legacyTitles=[...new Set([...a.progress.legacyTitles,...b.progress.legacyTitles])];
 p.finished=[...new Set([...a.progress.finished,...b.progress.finished])].slice(-64);p.ledger=null;
 for(const gate of STAGE_GATES){p.trials[gate.titleId]??={};for(const id of Object.keys(p.archetypes))p.trials[gate.titleId][id]=[...new Set([...(a.progress.trials[gate.titleId]?.[id]||[]),...(b.progress.trials[gate.titleId]?.[id]||[])])].sort().slice(-gate.days);}
 for(const [key,best] of Object.entries(a.personalBests)){const other=merged.personalBests[key];merged.personalBests[key]={score:Math.max(best.score,other?.score||0),kills:Math.max(best.kills,other?.kills||0),seconds:key.endsWith('|cleared')?Math.min(best.seconds,other?.seconds??best.seconds):Math.max(best.seconds,other?.seconds||0)};}
 awardTitles(p);
 return normalizeProfile(merged);
}
// Write before mutating the shared profile. Failed writes leave the running app untouched.
export function applyProgressImport(profile:Profile,incoming:Profile,storage:StorageLike){
 const merged=mergeProgress(profile,incoming);
 storage.setItem(IMPORT_BACKUP_KEY,progressExport(profile));
 storage.setItem('mm-profile',JSON.stringify(merged));
 Object.assign(profile,merged);
}
export function undoProgressImport(profile:Profile,storage:StorageLike){
 const backup=storage.getItem(IMPORT_BACKUP_KEY);if(!backup)throw Error('There is no import to undo.');
 const previous=parseProgressExport(backup);storage.setItem('mm-profile',JSON.stringify(previous));
 Object.assign(profile,previous);
 try{storage.setItem(IMPORT_BACKUP_KEY,'');}catch{/* Restoring progress already succeeded. */}
}
