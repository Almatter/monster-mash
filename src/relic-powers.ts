import type {Game} from './simulation.ts';
import type {AbilityDef} from './content-monsters.ts';
export const FIFTH_POWERS:Record<string,string>={overlord:'soulwrit',calamity:'prismcollapse',devourer:'bloodthread',titan:'gravitonseal',sovereign:'spellsteel',reaper:'soulorbit',lycanthrope:'moonrend'};
export type RelicPulse={nature:string;ability:string;x:number;y:number;radius:number;damage:number;life:number;tick:number;delay:number;moving:boolean;healing:number};
export function castFifthPower(g:Game,p:AbilityDef){
 const nature=Object.keys(FIFTH_POWERS).find(n=>FIFTH_POWERS[n]===p.id)!;
 const target=g.nearestEnemy(p.radius+250),position=target?{x:target.x,y:target.y}:{x:g.player.x,y:g.player.y};
 if(nature==='devourer'){
  if(target){const before=target.hp;g.damage(target,p.damage*g.powerScale(),'relic:devourer:bloodthread');g.heal(Math.min(g.player.maxHp*.16,Math.max(0,before-target.hp)*.12),true);g.completeAttack(target.active?0:1);g.effect(target.x,target.y,'relic-power-devourer',180,.7,Math.atan2(target.y-g.player.y,target.x-g.player.x));}
  return;
 }
 if(nature==='sovereign'){g.ward(150,230,4);g.heal(g.player.maxHp*.08,true);g.dodgeInvuln=Math.max(g.dodgeInvuln,.3);}
 if(nature==='titan')g.ward(90,230,5);
 const at=['sovereign','reaper'].includes(nature)?{x:g.player.x,y:g.player.y}:position;
 g.relicPulses.push({nature,ability:p.id,x:at.x,y:at.y,radius:p.radius,damage:p.damage,life:p.duration||.7,tick:0,delay:nature==='calamity'?1:0,moving:nature==='reaper',healing:g.player.maxHp*.18});
 g.effect(at.x,at.y,'relic-power-'+nature,p.radius,.9);
}
export function updateRelicPowers(g:Game,dt:number){
 for(let i=g.relicPulses.length-1;i>=0;i--){const f=g.relicPulses[i];if(f.delay>0){f.delay-=dt;continue;}f.life-=dt;f.tick-=dt;
  if(f.moving){const a=g.time*3;f.x=g.player.x+Math.cos(a)*150;f.y=g.player.y+Math.sin(a)*150;}
  if(f.tick<=0){f.tick=.55;let hit=0,kills=0;g.nearby(f.x,f.y,f.radius+65,e=>{if(Math.hypot(e.x-f.x,e.y-f.y)>f.radius+25)return;const before=e.hp;if(g.damage(e,f.damage*g.powerScale(),'relic:'+f.nature+':'+f.ability,{x:g.player.x,y:g.player.y}))kills++;hit+=Math.max(0,before-e.hp);if(f.nature==='titan'&&e.kind!=='titan')e.snaredUntil=g.time+.7;});
   const recovery=Math.min(f.healing,hit*.05,g.player.maxHp*.06);f.healing-=recovery;g.heal(recovery,true);g.completeAttack(kills);g.effect(f.x,f.y,'relic-power-'+f.nature,f.radius,.55);
   if(f.nature==='calamity'){g.ward(110,220,4);f.life=0;}
  }
  if(f.life<=0)g.relicPulses.splice(i,1);
 }
}
