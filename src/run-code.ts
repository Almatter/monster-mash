import {MONSTERS,type Palette} from './content-monsters.ts';
export type RunRecord = {version:1|2;rules:string;phase:number;name:string;title?:string;monsterId?:string;colors?:Palette;newRecords?:string[];sources?:Record<string,number>;seed:number;duration:number;score:number;kills:number;wave:number;elites:number;titans:number;multi:number;peak:number;feats:Record<string,number>;ended:string;reason:'overwhelmed'|'retired'};
// Public checksum protects against accidental edits only. No client can keep a secret.
// This envelope is deliberately versioned so a future API can sign server-issued runs.
async function digest(bytes:Uint8Array) { return new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)); }
const hex=(bytes:Uint8Array)=>Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
export async function encodeRun(run:RunRecord) {
 const bytes=new TextEncoder().encode(JSON.stringify(run));
 const payload=btoa(String.fromCharCode(...bytes)).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');
 return `MM${run.version}.${payload}.${hex((await digest(bytes)).slice(0,12))}`;
}
export async function decodeRun(code:string):Promise<RunRecord> {
 if(code.length>10000) throw Error('Run code is too long.');
 const [prefix,payload,checksum,...rest]=code.trim().split('.');
 if(!['MM1','MM2'].includes(prefix)||!payload||!checksum||rest.length)throw Error('Unrecognized run code.');
 const bytes=Uint8Array.from(atob(payload.replaceAll('-','+').replaceAll('_','/')),c=>c.charCodeAt(0));
 if(hex((await digest(bytes)).slice(0,12))!==checksum) throw Error('Checksum mismatch: damaged or edited run code.');
 const run=JSON.parse(new TextDecoder().decode(bytes));
 if(prefix!=='MM'+run.version||typeof run.name!=='string'||Array.from(run.name).length>32||typeof run.rules!=='string'||!['overwhelmed','retired'].includes(run.reason))throw Error('Invalid run metadata.');
 if(run.version===2){if(!MONSTERS[run.monsterId]||typeof run.title!=='string'||Array.from(run.title).length>32||!run.colors||!['primary','secondary','accent','power'].every(k=>/^#[0-9a-f]{6}$/i.test(run.colors[k])))throw Error('Invalid monster identity.');}
 for(const field of ['phase','seed','duration','score','kills','wave','elites','titans','multi','peak']) if(!Number.isFinite(run[field])||run[field]<0) throw Error(`Invalid ${field}.`);
 if(!Number.isInteger(run.phase)||run.phase>3||run.peak<1||run.peak>5||run.multi>run.kills||run.elites+run.titans>run.kills) throw Error('Inconsistent run statistics.');
 if(!run.feats||typeof run.feats!=='object'||Array.isArray(run.feats)||Object.values(run.feats).some(n=>!Number.isInteger(n)||Number(n)<0)) throw Error('Invalid feats.');
 return run;
}
