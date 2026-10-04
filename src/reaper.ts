import type {Game,Enemy} from './simulation.ts';
import type {AbilityDef} from './content-monsters.ts';
import {ENEMIES} from './data.ts';
type Point={x:number;y:number};
export type ScytheWave={x:number;y:number;angle:number;rotation:number;spin:number;remaining:number;width:number;damage:number;source:string;kills:number;hit:Set<number>;origin:Point;control:Point;end:Point;length:number;travel:number};
export const REAPER={maxWaves:24,speed:850,leech:.035,healPerSecond:42,healPerRelease:5};
export function harvestLife(g:Game,damage:number){if(g.time>=g.soulWindow){g.soulWindow=g.time+1;g.soulBudget=REAPER.healPerSecond+REAPER.healPerRelease*g.release;}const healed=Math.min(g.soulBudget,damage*REAPER.leech);g.soulBudget-=healed;if(healed>0&&g.player.hp<g.player.maxHp)g.soulGlow=.45;g.heal(healed);}
export function visibleReaperEnemy(g:Game,e:Enemy){return e.active&&Math.abs(e.x-g.player.x)<=g.targetView.x&&Math.abs(e.y-g.player.y)<=g.targetView.y;}
// An empty Blink tap never spends its cooldown.
export function reaperTappedEnemy(g:Game,point:Point){let best:Enemy|null=null,distance=Infinity;g.nearby(g.player.x,g.player.y,Math.hypot(g.targetView.x,g.targetView.y)+100,e=>{if(!visibleReaperEnemy(g,e))return;const d=Math.hypot(e.x-point.x,e.y-point.y);if(d<=ENEMIES[e.kind].radius+48&&d<distance){best=e;distance=d;}});return best;}
export function reaperTarget(g:Game,range:number,priority=false){let best:Enemy|null=null,rank=Infinity;g.nearby(g.player.x,g.player.y,range,e=>{const d=Math.hypot(e.x-g.player.x,e.y-g.player.y);if(d>range)return;const value=priority?(e.court?.role==='captain'?0:e.kind==='titan'?1:e.kind==='elite'?2:e.court?.role==='guard'?3:e.kind==='shooter'?4:5):0,score=value*100000+d;if(score<rank){rank=score;best=e;}});return best;}
export function reaperAim(g:Game,range:number){const enemy=reaperTarget(g,range);return enemy?Math.atan2(enemy.y-g.player.y,enemy.x-g.player.x):g.movementAngle;}
export function scythePath(w:ScytheWave,t:number):Point{if(t>1){const angle=Math.atan2(w.end.y-w.control.y,w.end.x-w.control.x),radius=Math.max(180,Math.min(900,Math.hypot(w.end.x-w.origin.x,w.end.y-w.origin.y)*1.1)),turn=(t-1)*w.length/radius*w.spin;return {x:w.end.x+radius/w.spin*(Math.sin(angle+turn)-Math.sin(angle)),y:w.end.y-radius/w.spin*(Math.cos(angle+turn)-Math.cos(angle))};}const u=1-t;return {x:u*u*w.origin.x+2*u*t*w.control.x+t*t*w.end.x,y:u*u*w.origin.y+2*u*t*w.control.y+t*t*w.end.y};}
export function scytheWave(g:Game,angle:number,range:number,width:number,damage:number,source='scythe',target?:Point,bendScale=1){
 if(g.scytheWaves.length>=REAPER.maxWaves)return;const origin={x:g.player.x,y:g.player.y},end=target?{x:target.x,y:target.y}:{x:origin.x+Math.cos(angle)*range,y:origin.y+Math.sin(angle)*range},dx=end.x-origin.x,dy=end.y-origin.y,d=Math.hypot(dx,dy)||1;
 const cross=Math.cos(g.movementAngle)*dy-Math.sin(g.movementAngle)*dx,sign=Math.abs(cross)>.01?Math.sign(cross):g.facingX<0?-1:1,spin=-sign*Math.sign(bendScale),bend=Math.min(230,Math.max(30,d*.32))*sign*bendScale,control={x:(origin.x+end.x)/2-dy/d*bend,y:(origin.y+end.y)/2+dx/d*bend};
 const w:ScytheWave={...origin,angle,rotation:angle,spin,remaining:range,width,damage:damage*g.powerScale(),source,kills:0,hit:new Set(),origin,control,end,length:0,travel:0};let last=origin;for(let n=1;n<=8;n++){const next=scythePath(w,n/8);w.length+=Math.hypot(next.x-last.x,next.y-last.y);last=next;}w.length=Math.max(1,w.length);w.remaining=Math.max(range,w.length+width);g.scytheWaves.push(w);
}
export function reaperSweep(g:Game,p:AbilityDef){g.area(g.player.x,g.player.y,p.radius,p.damage,'reapersweep',800);g.effect(g.player.x,g.player.y,'reaper-sweep',p.radius,.45,g.movementAngle);}
export function reaperBlink(g:Game,p:AbilityDef){
 const prey=g.targetPoint?reaperTappedEnemy(g,g.targetPoint):reaperTarget(g,p.radius,true);if(!prey)return;const old={x:g.player.x,y:g.player.y},angle=Math.atan2(prey.y-old.y,prey.x-old.x),landing={x:prey.x-Math.cos(angle)*70,y:prey.y-Math.sin(angle)*70};g.slideArena(landing,23);if(!g.insideMap(landing.x,landing.y))return;
 g.effect(old.x,old.y,'reaper-blink',100,.4);g.player.x=landing.x;g.player.y=landing.y;g.dodgeInvuln=Math.max(g.dodgeInvuln,.28);g.dodgeDeflected=true;
 // Selected prey receives one heavy strike plus the smaller arrival sweep.
 const killed=g.damage(prey,p.damage*g.powerScale()*1.8,'graveshift',old);const nearby=g.area(landing.x,landing.y,145*g.releaseStats.radius,p.damage*.45,'graveshift',420,false);g.completeAttack((killed?1:0)+nearby,{},'graveshift');g.effect(landing.x,landing.y,'reaper-blink',145,.5,angle);
}
export function reaperVolley(g:Game,p:AbilityDef){const target=(g.targetPoint?(reaperTappedEnemy(g,g.targetPoint)??g.targetPoint):null)??reaperTarget(g,p.radius,true)??{x:g.player.x+Math.cos(g.movementAngle)*p.radius,y:g.player.y+Math.sin(g.movementAngle)*p.radius},angle=Math.atan2(target.y-g.player.y,target.x-g.player.x);for(const bend of [-1.2,.6,1.5])scytheWave(g,angle,p.radius,48*g.releaseStats.radius,p.damage,'reapingarc',target,bend);g.effect(g.player.x,g.player.y,'reaper-volley',140,.4,angle);}
export function updateReaper(g:Game,dt:number){
 g.soulGlow=Math.max(0,g.soulGlow-dt);if(g.reaperStorm>0){g.reaperStorm=Math.max(0,g.reaperStorm-dt);g.reaperPulse-=dt;if(g.reaperPulse<=0){g.reaperPulse=.38;const power=g.powers[3],range=power.radius*g.releaseStats.radius,target=reaperTarget(g,range,true)??{x:g.player.x+Math.cos(g.movementAngle)*range,y:g.player.y+Math.sin(g.movementAngle)*range},angle=Math.atan2(target.y-g.player.y,target.x-g.player.x);for(const bend of [-.85,1.1])scytheWave(g,angle,range,55*g.releaseStats.radius,power.damage,'moonstorm',target,bend);
 // Every pulse damages the near aura, at the prior total tick budget.
 g.area(g.player.x,g.player.y,180*g.releaseStats.radius,power.damage/3,'moonstorm',140);if(++g.reaperSweeps%3===0)g.effect(g.player.x,g.player.y,'reaper-sweep',180*g.releaseStats.radius,.4,angle);
 }}
 for(let i=g.scytheWaves.length-1;i>=0;i--){const w=g.scytheWaves[i],distance=Math.min(w.remaining,REAPER.speed*dt),steps=Math.max(1,Math.ceil(distance/24));for(let n=0;n<steps;n++){
 const sx=w.x,sy=w.y;w.travel+=distance/steps;const next=scythePath(w,w.travel/w.length),dx=next.x-sx,dy=next.y-sy,len=Math.hypot(dx,dy)||1,ax=dx/len,ay=dy/len;
 g.nearby((sx+next.x)/2,(sy+next.y)/2,w.width+len/2+65,e=>{if(w.hit.has(e.serial))return;const ex=e.x-sx,ey=e.y-sy,along=Math.max(0,Math.min(len,ex*ax+ey*ay)),r=w.width+ENEMIES[e.kind].radius;if((ex-ax*along)**2+(ey-ay*along)**2>=r*r)return;w.hit.add(e.serial);if(g.damage(e,w.damage,w.source,{x:sx-ax*100,y:sy-ay*100}))w.kills++;});w.x=next.x;w.y=next.y;w.angle=Math.atan2(dy,dx);
 }w.rotation+=w.spin*dt*11;w.remaining-=distance;if(w.remaining<=0){g.completeAttack(w.kills,{},w.source);g.scytheWaves.splice(i,1);}}
}
