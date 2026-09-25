import {MONSTERS,type Palette} from './content-monsters.ts';
import {EVENT} from './data.ts';
import {releaseAt} from './unbound.ts';
export type RunRecord={version:1|2|3;rules:string;phase:number;name:string;title?:string;monsterId?:string;colors?:Palette;newRecords?:string[];newTitles?:string[];sources?:Record<string,number>;seed:number;duration:number;score:number;kills:number;wave:number;elites:number;titans:number;multi:number;peak:number;feats:Record<string,number>;ended:string;reason:'overwhelmed'|'retired';release?:number;build?:string};
export const KNOWN_RULESETS=['2026.10-v1','2026.10-v2','2026.10-v3','2026.10-v4-unbound',EVENT.rules] as const;
// Public SHA-256 detects corruption and casual editing. Client code cannot certify honest play.
async function digest(bytes:Uint8Array){return new Uint8Array(await crypto.subtle.digest('SHA-256',bytes));}
const hex=(bytes:Uint8Array)=>Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
const encodeBytes=(bytes:Uint8Array)=>btoa(String.fromCharCode(...bytes)).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');
const palette=(p:Palette)=>[p.primary,p.secondary,p.accent,p.power];
function compact(run:RunRecord){if(!run.colors)throw Error('Missing cosmetic identity.');return [run.rules,run.phase,run.name,run.title,run.monsterId,palette(run.colors),run.seed,run.duration,run.score,run.kills,run.wave,run.elites,run.titans,run.multi,run.peak,run.feats,run.ended,run.reason,run.release,run.build];}
export async function encodeRun(run:RunRecord){validateRun(run);const bytes=new TextEncoder().encode(JSON.stringify(run.version===3?compact(run):run));return `MM${run.version}.${encodeBytes(bytes)}.${hex((await digest(bytes)).slice(0,12))}`;}
function expand(parts:unknown):RunRecord{if(!Array.isArray(parts)||parts.length!==20)throw Error('Invalid MM3 payload.');const [rules,phase,name,title,monsterId,c,seed,duration,score,kills,wave,elites,titans,multi,peak,feats,ended,reason,release,build]=parts;const colors=Array.isArray(c)&&c.length===4?{primary:c[0],secondary:c[1],accent:c[2],power:c[3]}:undefined;return {version:3,rules,phase,name,title,monsterId,colors,seed,duration,score,kills,wave,elites,titans,multi,peak,feats,ended,reason,release,build} as RunRecord;}
const integer=(v:unknown,max:number)=>typeof v==='number'&&Number.isSafeInteger(v)&&v>=0&&v<=max;
export function validateRun(run:RunRecord){
 if(!run||![1,2,3].includes(run.version)||typeof run.name!=='string'||Array.from(run.name).length<1||Array.from(run.name).length>32||!KNOWN_RULESETS.includes(run.rules as typeof KNOWN_RULESETS[number])||!['overwhelmed','retired'].includes(run.reason))throw Error('Invalid run metadata or unknown ruleset.');
 if(!integer(run.phase,3)||!integer(run.seed,4294967295)||!integer(run.duration,86400)||!integer(run.score,1e12)||!integer(run.kills,1e9)||!integer(run.wave,2882)||!integer(run.elites,1e9)||!integer(run.titans,1e9)||!integer(run.multi,1e9)||typeof run.peak!=='number'||!Number.isFinite(run.peak)||run.peak<1||run.peak>5)throw Error('Invalid run statistics.');
 if(Math.abs(run.wave-(Math.floor(run.duration/EVENT.waveSeconds)+1))>1||run.multi>run.kills||run.elites+run.titans>run.kills||run.kills>run.duration*160+1000)throw Error('Inconsistent run statistics.');
 if(typeof run.ended!=='string'||!Number.isFinite(Date.parse(run.ended))||Date.parse(run.ended)<Date.UTC(2020,0,1)||Date.parse(run.ended)>Date.UTC(2100,0,1))throw Error('Invalid completion date.');
 if(!run.feats||typeof run.feats!=='object'||Array.isArray(run.feats)||Object.keys(run.feats).length>100||Object.entries(run.feats).some(([key,value])=>!/^[-.a-zA-Z0-9_]{1,64}$/.test(key)||!integer(value,1e6)))throw Error('Invalid feats.');
 if(run.version>=2){if(!Object.hasOwn(MONSTERS,run.monsterId)||typeof run.title!=='string'||Array.from(run.title).length>32||!run.colors||!['primary','secondary','accent','power'].every(k=>/^#[0-9a-f]{6}$/i.test(run.colors![k as keyof Palette])))throw Error('Invalid monster identity.');}
 if(run.version===3){if(!['2026.10-v4-unbound',EVENT.rules].includes(run.rules)||!integer(run.release,4)||typeof run.build!=='string'||!/^[0-9a-f]{16}$/.test(run.build))throw Error('Invalid release or build metadata.');if(run.rules==='2026.10-v4-unbound'&&(run.release!<releaseAt(Math.max(0,run.duration-.51))||run.release!>releaseAt(run.duration+.51)))throw Error('Inconsistent release stage.');}
}
export async function decodeRun(code:string):Promise<RunRecord>{
 if(code.length>10000)throw Error('Run code is too long.');const [prefix,payload,checksum,...rest]=code.trim().split('.');if(!['MM1','MM2','MM3'].includes(prefix)||!payload||!checksum||rest.length||!/^[A-Za-z0-9_-]+$/.test(payload)||!/^[0-9a-f]{24}$/.test(checksum))throw Error('Unrecognized run code.');
 let bytes:Uint8Array;try{bytes=Uint8Array.from(atob(payload.replaceAll('-','+').replaceAll('_','/')),c=>c.charCodeAt(0));}catch{throw Error('Malformed run code.');}
 if(hex((await digest(bytes)).slice(0,12))!==checksum)throw Error('INVALID / MODIFIED RUN CODE: integrity check failed.');
 let parsed:unknown;try{parsed=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));}catch{throw Error('Malformed run data.');}
 const run=prefix==='MM3'?expand(parsed):parsed as RunRecord;if(prefix!=='MM'+run.version)throw Error('Format mismatch.');validateRun(run);
 if(prefix==='MM3'&&JSON.stringify(compact(run))!==new TextDecoder().decode(bytes))throw Error('Noncanonical run data.');return run;
}
