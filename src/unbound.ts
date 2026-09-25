import type {AbilityDef} from './content-monsters.ts';
export const RELEASES=[{at:0,name:'BASE FORM'},{at:150,name:'UNBOUND I'},{at:300,name:'UNBOUND II'},{at:420,name:'UNBOUND III'},{at:510,name:'FINAL RELEASE'}] as const;
export function releaseAt(seconds:number){let stage=0;for(let i=1;i<RELEASES.length;i++)if(seconds>=RELEASES[i].at)stage=i;return stage;}
// Each row describes the finite maximum at Final Release. Intermediate seals interpolate.
const KITS:Record<string,{damage:number;radius:number;attack:number;cooldown:number;move:number;knockback:number;beam:number;dash:number}>={
 sovereign:{damage:2.5,radius:1.5,attack:.82,cooldown:.80,move:1.06,knockback:1.3,beam:1.8,dash:1},
 overlord:{damage:2.4,radius:1.45,attack:.9,cooldown:.84,move:1.05,knockback:1,beam:1,dash:1},
 calamity:{damage:2.45,radius:1.6,attack:.86,cooldown:.80,move:1.04,knockback:1,beam:2.4,dash:1},
 devourer:{damage:2.5,radius:1.6,attack:.68,cooldown:.80,move:1.12,knockback:1,beam:1,dash:1.35},
 titan:{damage:2.6,radius:1.65,attack:.85,cooldown:.87,move:1.06,knockback:1.6,beam:1,dash:1.2}
};
export function releaseStats(id:string,stage:number){const t=Math.max(0,Math.min(4,stage))/4,kit=KITS[id]||KITS.sovereign;return Object.fromEntries(Object.entries(kit).map(([key,value])=>[key,1+(value-1)*t])) as typeof kit;}
export function releasedPower(power:AbilityDef,id:string,stage:number){const s=releaseStats(id,stage);return {...power,radius:power.radius*(power.effect==='beam'?1+(s.radius-1)*.35:s.radius),cooldown:power.cooldown*s.cooldown};}
