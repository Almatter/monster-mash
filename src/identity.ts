import {MONSTERS,paletteFor,type Palette} from './content-monsters.ts';
export type Identity={name:string;title:string;monsterId:string;colors:Palette};
export const FALLBACK_NAME='Unnamed Calamity';
export function sanitizeName(value:unknown,fallback=FALLBACK_NAME){if(typeof value!=='string')return fallback;return Array.from(value.normalize('NFC').replace(/[\u0000-\u001f\u007f-\u009f\u202a-\u202e\u2066-\u2069]/g,'').replace(/\s+/g,' ').trim()).slice(0,32).join('')||fallback;}
export function createIdentity(value:Partial<Identity>={}):Identity{const monster=MONSTERS[value.monsterId||'']||MONSTERS.sovereign;return {name:sanitizeName(value.name),title:sanitizeName(value.title,''),monsterId:monster.id,colors:paletteFor(monster,value.colors)};}
