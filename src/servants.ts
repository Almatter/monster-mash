import type {Game,Enemy} from './simulation.ts';
import {ENEMIES} from './data.ts';
export type Servant={active:boolean;x:number;y:number;life:number;hp:number;hitTimer:number;source:'controlled'|'summoned';timer:number;search:number;target:Enemy|null;serial:number};
export function createServants():Servant[]{return Array.from({length:32},()=>({active:false,x:0,y:0,life:0,hp:0,hitTimer:0,source:'summoned',timer:0,search:0,target:null,serial:0}));}
export const servantCap=(release:number)=>24+release;
export function addServant(g:Game,x:number,y:number,source:Servant['source'],life=28){const active=g.servants.filter(s=>s.active);let s=active.length<servantCap(g.release)?g.servants.find(s=>!s.active):undefined;if(!s&&source==='controlled')s=active.reduce<Servant|null>((best,item)=>!best||item.life+item.hp/100<best.life+best.hp/100?item:best,null)||undefined;if(!s)return false;Object.assign(s,{active:true,x,y,source,life,hp:220,hitTimer:0,timer:0,search:0,target:null,serial:0});return true;}
export function dominate(g:Game,radius:number,count:number){let converted=0;g.nearby(g.player.x,g.player.y,radius,e=>{if(converted>=count||!['thrall','hound','wing'].includes(e.kind)||Math.hypot(e.x-g.player.x,e.y-g.player.y)>radius)return;if(addServant(g,e.x,e.y,'controlled')){e.active=false;g.alive--;converted++;}});return converted;}
export function corrupt(g:Game,radius:number,duration=8){g.nearby(g.player.x,g.player.y,radius+65,e=>{if(Math.hypot(e.x-g.player.x,e.y-g.player.y)<radius)e.corruptUntil=g.time+duration;});}
export function updateServants(g:Game,dt:number){
 for(const s of g.servants){if(!s.active)continue;s.life-=dt;if(s.life<=0){s.active=false;s.target=null;continue;}s.timer-=dt;s.search-=dt;
  s.hitTimer-=dt;if(s.hitTimer<=0){let attacker:Enemy|null=null;g.nearby(s.x,s.y,34,e=>{if(!attacker&&Math.hypot(e.x-s.x,e.y-s.y)<ENEMIES[e.kind].radius+18)attacker=e;});if(attacker){s.hp-=ENEMIES[(attacker as Enemy).kind].damage*.55;s.hitTimer=.65;if(s.hp<=0){s.active=false;s.target=null;g.effect(s.x,s.y,'blood',24,.3);continue;}}}
  if(s.search<=0){s.search=.25;s.target=null;let best=360;g.nearby(s.x,s.y,360,e=>{const d=Math.hypot(e.x-s.x,e.y-s.y),rank=d-(e.kind==='titan'?260:e.kind==='elite'?100:0);if(d<=360&&rank<best){best=rank;s.target=e;s.serial=e.serial;}});}
  const target=s.target?.active&&s.target.serial===s.serial?s.target:null,dx=(target?.x??g.player.x)-s.x,dy=(target?.y??g.player.y)-s.y,d=Math.hypot(dx,dy)||1;s.x+=dx/d*180*dt;s.y+=dy/d*180*dt;
  if(target&&d<75&&s.timer<=0){s.timer=.7;g.area(s.x,s.y,65,95,s.source);g.effect(s.x,s.y,'servant',65,.2);}
 }
 g.corruptionTick-=dt;if(g.corruptionTick<=0){g.corruptionTick=.5;for(const e of g.enemies)if(e.active&&(e.corruptUntil||0)>g.time)g.damage(e,18*g.powerScale(),'dot');}
 // An iterative capped queue prevents recursive chain overflows and frame spikes.
 let chainKills=0;for(let count=0;count<16&&g.chains.length;count++){const b=g.chains.shift()!;g.nearby(b.x,b.y,150*g.releaseStats.radius,e=>{if(Math.hypot(e.x-b.x,e.y-b.y)<105*g.releaseStats.radius){e.corruptUntil=g.time+5;if(g.damage(e,65*g.powerScale(),'chain'))chainKills++;}});g.effect(b.x,b.y,'corruption',105*g.releaseStats.radius,.35);}if(chainKills)g.resolveFeats({corruption:chainKills});
}
