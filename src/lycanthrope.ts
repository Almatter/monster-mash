import type {Game,Enemy} from './simulation.ts';
import type {AbilityDef} from './content-monsters.ts';
import {realmWaypoint,moveRealm} from './titan-realm-map.ts';
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
 const from={x:g.player.x,y:g.player.y};g.vault={from,to:landing,elapsed:0,duration:.64,power:p};
 g.effect(from.x,from.y,'lycanthrope-parkour',170,.5,Math.atan2(landing.y-from.y,landing.x-from.x));

}
export function castHowl(g:Game,p:AbilityDef){
 g.area(g.player.x,g.player.y,p.radius,p.damage,'moonhowl',450);
 g.nearby(g.player.x,g.player.y,p.radius,e=>{if(Math.hypot(e.x-g.player.x,e.y-g.player.y)>p.radius)return;
  if(e.kind==='titan'||e.realm?.role==='guardian'||e.court?.role==='captain')return;
  e.fearedUntil=g.time+(p.duration||3);});
 g.effect(g.player.x,g.player.y,'lycanthrope-howl',p.radius,.9);
}
export type Grip={serial:number;remaining:number;total:number;tick:number;power:AbilityDef;mass:number};
export function gripTarget(g:Game){let target:Enemy|null=null,best=Infinity;g.nearby(g.player.x,g.player.y,220,e=>{if(e.grabbed||e.kind==='titan'||e.court||e.realm?.role==='guardian')return;if(e.kind==='brute'&&g.release<2||e.kind==='elite'&&(g.release<4||e.hp/e.maxHp>.35))return;const d=Math.hypot(e.x-g.player.x,e.y-g.player.y);if(d<=180+g.release*10&&d<best){best=d;target=e;}});return target;}
export function releaseGrip(g:Game,finish=false){const grip=g.grip;if(!grip)return;g.grip=null;const e=g.enemies.find(e=>e.active&&e.serial===grip.serial);if(!e)return;e.grabbed=false;g.slideArena(e,25);if(finish){if(g.damage(e,e.hp+1,'ravage'))g.completeAttack(1,{},'ravage');}g.rebuildGrid();}
export function castRavage(g:Game,p:AbilityDef){const e=gripTarget(g);if(!e)return;releaseGrip(g);const total=(p.duration||4)+g.release*.5;e.grabbed=true;e.vx=e.vy=0;g.grip={serial:e.serial,remaining:total,total,tick:0,power:p,mass:e.kind==='elite'?1.4:e.kind==='brute'?1.2:1};g.effect(e.x,e.y,'lycanthrope-grip',150,.55,g.movementAngle);g.sound('devour');g.rebuildGrid();}
function updateGrip(g:Game,dt:number){const grip=g.grip;if(!grip)return;const e=g.enemies.find(e=>e.active&&e.serial===grip.serial);if(!e){g.grip=null;return;}grip.remaining=Math.max(0,grip.remaining-dt);grip.tick-=dt;const angle=g.movementAngle+Math.sin(g.time*7)*.7;e.x=g.player.x+Math.cos(angle)*62;e.y=g.player.y+Math.sin(angle)*62;
 if(grip.tick<=0){grip.tick=.8;const source=g.realm?'relic:lycanthrope:ravage':'ravage';g.area(g.player.x,g.player.y,(190+g.release*12)*grip.mass,grip.power.damage*grip.mass,source,100);g.effect(g.player.x,g.player.y,'lycanthrope-grip',240,.3,angle);}
 if(grip.remaining<=0)releaseGrip(g,true);
}
export function castMoonfury(g:Game,p:AbilityDef){g.moonFury=g.moonFuryTotal=p.duration||7;g.moonFuryTarget=null;g.moonFuryFree=false;g.moonFuryHits.clear();g.moonFuryPulse=0;g.moonFuryVisited.clear();g.moonFuryOrigin={x:g.player.x,y:g.player.y};g.moonFuryView={...g.targetView};g.moonFuryPower=p;}
function furyTarget(g:Game):Enemy|null{
 let target:Enemy|null=null,best=Infinity;for(const e of g.enemies){if(!e.active||e.grabbed||g.moonFuryVisited.has(e.serial)||g.realm&&e.realm?.role==='boss'&&!g.realm.engaged)continue;
  const ox=e.x-g.moonFuryOrigin.x,oy=e.y-g.moonFuryOrigin.y;if(Math.abs(ox)>g.moonFuryView.x-30||Math.abs(oy)>g.moonFuryView.y-30)continue;const dx=e.x-g.player.x,dy=e.y-g.player.y;if(Math.abs(dx)>g.targetView.x-30||Math.abs(dy)>g.targetView.y-30)continue;
  const landing={x:e.x,y:e.y+55};if(!g.insideMap(landing.x,landing.y))continue;
  const rank=(e.realm?.role==='boss'||e.colossus?-3000:e.court?.role==='captain'?-2200:e.realm?.role==='guardian'?-1600:e.kind==='elite'?-1000:0)+Math.hypot(dx,dy);
  if(rank<best){best=rank;target=e;}}
 return target;
}
export function updateLycanthrope(g:Game,dt:number){
 updateGrip(g,dt);
 if(g.hasTrait('lycanthrope'))g.heal(g.player.maxHp*(.015+.0008*g.release)*dt,true);
 if(g.vault){const v=g.vault;v.elapsed=Math.min(v.duration,v.elapsed+dt);const t=v.elapsed/v.duration;
  g.player.x=v.from.x+(v.to.x-v.from.x)*t;g.player.y=v.from.y+(v.to.y-v.from.y)*t;
  g.setMovementDirection(v.to.x-v.from.x,v.to.y-v.from.y);g.moving=true;
  if(t>=1){g.vault=null;const source=g.realm?'relic:lycanthrope:wolfbound':'wolfbound';g.area(v.to.x,v.to.y,v.power.radius,v.power.damage,source,430);g.effect(v.to.x,v.to.y,'lycanthrope-landing',v.power.radius,.65);g.sound('wolfLanding');g.shake=10;}
  return;
 }
 if(g.moonFury<=0)return;
 const remaining=Math.min(dt,g.moonFury);g.moonFury=Math.max(0,g.moonFury-dt);g.moonFuryPulse-=dt;g.heal(g.player.maxHp*.01*remaining,true);
 let e=g.moonFuryTarget;
 if(!e?.active||g.moonFuryPulse<=0){e=furyTarget(g);if(!e&&g.moonFuryVisited.size){g.moonFuryVisited.clear();e=furyTarget(g);}g.moonFuryTarget=e;g.moonFuryHits.clear();g.moonFuryPulse=.65;if(e)g.moonFuryVisited.add(e.serial);}
 if(!e){g.moonFuryFree=true;return;}g.moonFuryFree=false;
 const before={x:g.player.x,y:g.player.y},goal=g.realm?realmWaypoint(before.x,before.y,e.x,e.y+45):{x:e.x,y:e.y+45},dx=goal.x-before.x,dy=goal.y-before.y,d=Math.hypot(dx,dy),step=Math.min(d,800*remaining);
 if(d>1){g.player.x+=dx/d*step;g.player.y+=dy/d*step;g.setMovementDirection(dx,dy);g.moving=true;if(g.realm)moveRealm(g.player,before,23);else g.slideArena(g.player,23);}
 const source=g.realm?'relic:lycanthrope:moonfury':'moonfury';let kills=0;
 // Every pass can cut a body once, including bodies crossed between fixed steps.
 for(const prey of g.enemies){if(!prey.active||prey.grabbed||g.moonFuryHits.has(prey.serial))continue;const vx=g.player.x-before.x,vy=g.player.y-before.y,t=Math.max(0,Math.min(1,((prey.x-before.x)*vx+(prey.y-before.y)*vy)/(vx*vx+vy*vy||1))),distance=Math.hypot(prey.x-before.x-vx*t,prey.y-before.y-vy*t);
  if(distance>115)continue;g.moonFuryHits.add(prey.serial);if(g.damage(prey,g.moonFuryPower.damage*g.powerScale(),source,{x:g.player.x,y:g.player.y}))kills++;g.effect(prey.x,prey.y,'lycanthrope-claw',120,.32,g.movementAngle);
 }
 g.completeAttack(kills,{},source);if(Math.hypot(g.player.x-e.x,g.player.y-e.y)<100)g.moonFuryPulse=Math.min(g.moonFuryPulse,.38);
 if(g.moonFury<=0){g.moonFuryTarget=null;g.moonFuryHits.clear();}
}
