import type {Comparison} from './personal-bests.ts';
import {MONSTERS,type Palette} from './content-monsters.ts';
import {EVENT} from './data.ts';
import {releaseAt} from './unbound.ts';
export type RunRecord={version:1|2|3|4;rules:string;phase:number;name:string;title?:string;monsterId?:string;colors?:Palette;newRecords?:string[];newTitles?:string[];sources?:Record<string,number>;comparison?:Comparison;seed:number;duration:number;score:number;kills:number;wave:number;elites:number;titans:number;multi:number;peak:number;feats:Record<string,number>;ended:string;reason:'overwhelmed'|'retired';release?:number;build?:string};
// Retain shipped MM4 rules even after EVENT.rules advances.
export const MM4_RULESETS=['2026.10-v6-tester','2026.10-v7-movement',EVENT.rules] as const;
export const KNOWN_RULESETS=['2026.10-v1','2026.10-v2','2026.10-v3','2026.10-v4-unbound','2026.10-v5-feast',...MM4_RULESETS] as const;
// Client-side deterrence only. Not authoritative anti-cheat: shipped source contains
// everything needed to reconstruct this seal, so a determined attacker can forge codes.
const a=[42,194,16,177,95,202,112,18,221,64,175,42,88,17,200,97,215,33,154,54,3,214,119,81,242,7,130,55,188,14,75,206];
const b=[138,17,97,43,222,70,23,202,48,159,12,234,2,197,65,18,75,170,29,192,113,40,201,6,49,156,7,183,60,238,100,22];
let keyPromise:Promise<CryptoKey>|null=null;
function sealKey(){return keyPromise??=crypto.subtle.digest('SHA-256',Uint8Array.from(a,(v,i)=>v^b[(i*7)%b.length])).then(raw=>crypto.subtle.importKey('raw',raw,'AES-GCM',false,['encrypt','decrypt']));}
const ad=new TextEncoder().encode('MM4');
async function digest(bytes:Uint8Array){return new Uint8Array(await crypto.subtle.digest('SHA-256',bytes));}
const hex=(bytes:Uint8Array)=>Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
const encodeBytes=(bytes:Uint8Array)=>btoa(String.fromCharCode(...bytes)).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');
const decodeBytes=(payload:string)=>Uint8Array.from(atob(payload.replaceAll('-','+').replaceAll('_','/')),c=>c.charCodeAt(0));
const palette=(p:Palette)=>[p.primary,p.secondary,p.accent,p.power];
function compact(run:RunRecord){if(!run.colors)throw Error('Missing cosmetic identity.');return [run.rules,run.phase,run.name,run.title,run.monsterId,palette(run.colors),run.seed,run.duration,run.score,run.kills,run.wave,run.elites,run.titans,run.multi,run.peak,run.feats,run.ended,run.reason,run.release,run.build];}
export async function encodeRun(run:RunRecord){validateRun(run);const bytes=new TextEncoder().encode(JSON.stringify(run.version>=3?compact(run):run));if(run.version===4){const iv=crypto.getRandomValues(new Uint8Array(12)),cipher=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:ad},await sealKey(),bytes));const packed=new Uint8Array(iv.length+cipher.length);packed.set(iv);packed.set(cipher,iv.length);return 'MM4.'+encodeBytes(packed);}return `MM${run.version}.${encodeBytes(bytes)}.${hex((await digest(bytes)).slice(0,12))}`;}
function expand(parts:unknown,version:3|4):RunRecord{if(!Array.isArray(parts)||parts.length!==20)throw Error('Invalid compact payload.');const [rules,phase,name,title,monsterId,c,seed,duration,score,kills,wave,elites,titans,multi,peak,feats,ended,reason,release,build]=parts;const colors=Array.isArray(c)&&c.length===4?{primary:c[0],secondary:c[1],accent:c[2],power:c[3]}:undefined;return {version,rules,phase,name,title,monsterId,colors,seed,duration,score,kills,wave,elites,titans,multi,peak,feats,ended,reason,release,build} as RunRecord;}
const integer=(v:unknown,max:number)=>typeof v==='number'&&Number.isSafeInteger(v)&&v>=0&&v<=max;
export function validateRun(run:RunRecord){
 if(!run||![1,2,3,4].includes(run.version)||typeof run.name!=='string'||Array.from(run.name).length<1||Array.from(run.name).length>32||!KNOWN_RULESETS.includes(run.rules as typeof KNOWN_RULESETS[number])||!['overwhelmed','retired'].includes(run.reason))throw Error('Invalid run metadata or unknown ruleset.');
 if(!integer(run.phase,3)||!integer(run.seed,4294967295)||!integer(run.duration,86400)||!integer(run.score,1e12)||!integer(run.kills,1e9)||!integer(run.wave,2882)||!integer(run.elites,1e9)||!integer(run.titans,1e9)||!integer(run.multi,1e9)||typeof run.peak!=='number'||!Number.isFinite(run.peak)||run.peak<1||run.peak>5)throw Error('Invalid run statistics.');
 if(Math.abs(run.wave-(Math.floor(run.duration/EVENT.waveSeconds)+1))>1||run.multi>run.kills||run.elites+run.titans>run.kills||run.kills>run.duration*160+1000)throw Error('Inconsistent run statistics.');
 if(typeof run.ended!=='string'||!Number.isFinite(Date.parse(run.ended))||Date.parse(run.ended)<Date.UTC(2020,0,1)||Date.parse(run.ended)>Date.UTC(2100,0,1))throw Error('Invalid completion date.');
 if(!run.feats||typeof run.feats!=='object'||Array.isArray(run.feats)||Object.keys(run.feats).length>100||Object.entries(run.feats).some(([key,value])=>!/^[-.a-zA-Z0-9_]{1,64}$/.test(key)||!integer(value,1e6)))throw Error('Invalid feats.');
 if(run.version>=2){if(!Object.hasOwn(MONSTERS,run.monsterId)||typeof run.title!=='string'||Array.from(run.title).length>32||!run.colors||!['primary','secondary','accent','power'].every(k=>/^#[0-9a-f]{6}$/i.test(run.colors![k as keyof Palette])))throw Error('Invalid monster identity.');}
 if(run.version>=3){if(!integer(run.release,4)||typeof run.build!=='string'||!/^[0-9a-f]{16}$/.test(run.build))throw Error('Invalid release or build metadata.');if(run.release!<releaseAt(Math.max(0,run.duration-.51))||run.release!>releaseAt(run.duration+.51))throw Error('Inconsistent release stage.');}
 if(run.version===3&&!['2026.10-v4-unbound','2026.10-v5-feast'].includes(run.rules))throw Error('Invalid MM3 ruleset.');
 if(run.version===4&&!MM4_RULESETS.includes(run.rules as typeof MM4_RULESETS[number]))throw Error('Invalid MM4 ruleset.');
}
export async function decodeRun(code:string):Promise<RunRecord>{
 const value=code.trim();if(value.length>10000)throw Error('Run code is too long.');const [prefix,payload,checksum,...rest]=value.split('.');if(!payload||!/^[A-Za-z0-9_-]+$/.test(payload))throw Error('Unrecognized run code.');
 let bytes:Uint8Array;try{bytes=decodeBytes(payload);}catch{throw Error('Malformed run code.');}
 if(prefix==='MM4'){if(checksum||rest.length||bytes.length<29)throw Error('Unrecognized run code.');let plain:Uint8Array;try{plain=new Uint8Array(await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes.slice(0,12),additionalData:ad},await sealKey(),bytes.slice(12)));}catch{throw Error('INVALID / MODIFIED RUN CODE: authentication failed.');}let parsed:unknown;try{parsed=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(plain));}catch{throw Error('Malformed run data.');}const run=expand(parsed,4);validateRun(run);if(JSON.stringify(compact(run))!==new TextDecoder().decode(plain))throw Error('Noncanonical run data.');return run;}
 if(!['MM1','MM2','MM3'].includes(prefix)||!checksum||rest.length||!/^[0-9a-f]{24}$/.test(checksum))throw Error('Unrecognized run code.');
 if(hex((await digest(bytes)).slice(0,12))!==checksum)throw Error('INVALID / MODIFIED RUN CODE: integrity check failed.');
 let parsed:unknown;try{parsed=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));}catch{throw Error('Malformed run data.');}
 const run=prefix==='MM3'?expand(parsed,3):parsed as RunRecord;if(prefix!=='MM'+run.version)throw Error('Format mismatch.');validateRun(run);
 if(prefix==='MM3'&&JSON.stringify(compact(run))!==new TextDecoder().decode(bytes))throw Error('Noncanonical run data.');return run;
}
