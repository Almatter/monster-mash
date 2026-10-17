import type {Game} from './simulation.ts';
import type {DamageKind} from './combat-damage.ts';

export const WAR_CHAMPION_BODY_SCALE=5;
export const WAR_DUEL={damage:.35,maxHit:.08,burst:.30,window:3};
const pressure=new WeakMap<Game,{at:number;fraction:number}[]>();
// One rolling budget per defender, shared by every champion and damage tick.
// Normalize the fixed five-pool NPC body, preserving actual durability gains
// from War Level and vitality perks.
export function warChampionDamage(defender:Game,amount:number,kind:DamageKind,bodyScale=1){
 if(amount<=0)return 0;
 let hits=pressure.get(defender);if(!hits){hits=[];pressure.set(defender,hits);}
 while(hits.length&&hits[0].at<=defender.time-WAR_DUEL.window)hits.shift();
 const remaining=WAR_DUEL.burst-hits.reduce((n,h)=>n+h.fraction,0);
 if(remaining<=1e-8)return 0;
 const hp=defender.player.hp,max=defender.player.maxHp;
 defender.hurt(amount*WAR_DUEL.damage*bodyScale,max*Math.min(WAR_DUEL.maxHit,remaining),kind);
 const lost=Math.max(0,hp-defender.player.hp);
 if(lost>0)hits.push({at:defender.time,fraction:lost/max});
 return lost;
}
