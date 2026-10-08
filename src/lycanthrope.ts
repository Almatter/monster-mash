import type {Game,Enemy} from './simulation.ts';
import type {AbilityDef} from './content-monsters.ts';
import {upgradeRank} from './stage-two.ts';

export function parkourLanding(g:Game,point?:{x:number;y:number}){
 const p=g.player,max=330*(1+.08*g.release+.08*upgradeRank(g,'reach'));
 const target=point||{x:p.x+Math.cos(g.movementAngle)*max,y:p.y+Math.sin(g.movementAngle)*max};
 if(Math.hypot(target.x-p.x,target.y-p.y)<40)return null;
 if(!Number.isFinite(target.x)||!Number.isFinite(target.y))return null;
 const dx=target.x-p.x,dy=target.y-p.y,d=Math.hypot(dx,dy),scale=Math.min(1,max/(d||1));
 const landing={x:p.x+dx*scale,y:p.y+dy*scale};
 // Crossing scenery is allowed; landing outside a playable floor is not.
 if(!g.insideMap(landing.x,landing.y))return null;
 const resolved={...landing};g.slideArena(resolved,23);
 return Math.hypot(resolved.x-landing.x,resolved.y-landing.y)<35?resolved:null;
}
export function castParkour(g:Game,p:AbilityDef){
 const landing=parkourLanding(g,g.targetPoint||undefined);if(!landing)return;
 const from={x:g.player.x,y:g.player.y};g.player.x=landing.x;g.player.y=landing.y;g.dodgeInvuln=Math.max(g.dodgeInvuln,.25);g.dodgeDeflected=false;
 g.effect(from.x,from.y,'lycanthrope-parkour',170,.5,Math.atan2(landing.y-from.y,landing.x-from.x));
 g.area(landing.x,landing.y,p.radius,p.damage,'wolfbound',250);g.effect(landing.x,landing.y,'lycanthrope-claw',p.radius*1.2,.45,g.movementAngle);
}
export function castHowl(g:Game,p:AbilityDef){
 g.area(g.player.x,g.player.y,p.radius,p.damage,'moonhowl',450);
 g.nearby(g.player.x,g.player.y,p.radius,e=>{if(Math.hypot(e.x-g.player.x,e.y-g.player.y)>p.radius)return;
  if(e.kind==='titan'||e.realm?.role==='guardian'||e.court?.role==='captain')return;
  e.fearedUntil=g.time+(p.duration||3);});
 g.effect(g.player.x,g.player.y,'lycanthrope-howl',p.radius,.9);
}
export function castRavage(g:Game,p:AbilityDef){g.area(g.player.x,g.player.y,p.radius,p.damage,'ravage',350);g.effect(g.player.x,g.player.y,'lycanthrope-claw',p.radius,.5,g.movementAngle);}
export function castMoonfury(g:Game,p:AbilityDef){g.moonFury=p.duration||7;g.moonFuryPulse=0;g.moonFuryVisited.clear();g.moonFuryOrigin={x:g.player.x,y:g.player.y};g.moonFuryView={...g.targetView};g.moonFuryPower=p;}
function furyTarget(g:Game):Enemy|null{
 let target:Enemy|null=null,best=Infinity;for(const e of g.enemies){if(!e.active||g.moonFuryVisited.has(e.serial)||g.realm&&e.realm?.role==='boss'&&!g.realm.engaged)continue;
  const ox=e.x-g.moonFuryOrigin.x,oy=e.y-g.moonFuryOrigin.y;if(Math.abs(ox)>g.moonFuryView.x-30||Math.abs(oy)>g.moonFuryView.y-30)continue;const dx=e.x-g.player.x,dy=e.y-g.player.y;if(Math.abs(dx)>g.targetView.x-30||Math.abs(dy)>g.targetView.y-30)continue;
  const landing={x:e.x,y:e.y+55};if(!g.insideMap(landing.x,landing.y))continue;
  const rank=(e.realm?.role==='boss'||e.colossus?-3000:e.court?.role==='captain'?-2200:e.realm?.role==='guardian'?-1600:e.kind==='elite'?-1000:0)+Math.hypot(dx,dy);
  if(rank<best){best=rank;target=e;}}
 return target;
}
export function updateLycanthrope(g:Game,dt:number){
 if(g.hasTrait('lycanthrope'))g.heal(g.player.maxHp*(.015+.0008*g.release)*dt,true);
 if(g.moonFury<=0)return;g.moonFury=Math.max(0,g.moonFury-dt);g.moonFuryPulse-=dt;
 if(g.moonFuryPulse>0)return;g.moonFuryPulse=.24;let e=furyTarget(g);if(!e&&g.moonFuryVisited.size){g.moonFuryVisited.clear();e=furyTarget(g);}if(!e)return;g.moonFuryVisited.add(e.serial);
 const before={x:g.player.x,y:g.player.y},landing={x:e.x,y:e.y+55};g.slideArena(landing,23);
 if(Math.hypot(landing.x-e.x,landing.y-e.y)>100)return;
 g.player.x=landing.x;g.player.y=landing.y;g.dodgeInvuln=Math.max(g.dodgeInvuln,.18);g.dodgeDeflected=false;
 const source=g.realm?'relic:lycanthrope:moonfury':'moonfury';
 const kills=g.area(e.x,e.y,115,g.moonFuryPower.damage,source,0,false);g.completeAttack(kills,{},source);
 g.effect(before.x,before.y,'lycanthrope-parkour',100,.3);g.effect(e.x,e.y,'lycanthrope-claw',150,.35,g.movementAngle);
}
