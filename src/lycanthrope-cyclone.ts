import type {Game,Enemy} from './simulation.ts';
import type {AbilityDef} from './content-monsters.ts';
export const CYCLONE={windup:.55,speed:360,heavySpeed:110,range:650,tick:.2,max:3};
export type CycloneSpin={elapsed:number;angle:number;power:AbilityDef};
export type Cyclone={x:number;y:number;angle:number;radius:number;damage:number;life:number;total:number;tick:number;distance:number;range:number;source:string;origin:{x:number;y:number};scattered:Set<number>};
export const cycloneRange=(g:Game)=>CYCLONE.range*(1+.06*g.release);
export const cycloneHeavy=(e:Enemy)=>e.kind==='brute'||e.kind==='elite'||e.kind==='titan'||!!e.court||e.realm?.role==='guardian';
// Bounded candidate rays prefer useful visible groups and significant threats.
export function cycloneSuggestedPoint(g:Game){const p=g.player,range=cycloneRange(g),width=86*g.releaseStats.radius;
 const prey=g.enemies.filter(e=>e.active&&g.canTarget(e)&&!e.grabbed&&!(e.realm?.role==='boss'&&!g.realm?.engaged)&&Math.abs(e.x-p.x)<g.targetView.x-20&&Math.abs(e.y-p.y)<g.targetView.y-20&&Math.hypot(e.x-p.x,e.y-p.y)<range+width).sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y)).slice(0,80);
 const candidates=[g.movementAngle,...prey.slice(0,12).map(e=>Math.atan2(e.y-p.y,e.x-p.x)),...Array.from({length:16},(_,i)=>i*Math.PI/8)];let angle=g.movementAngle,best=-Infinity;
 for(const a of candidates){let score=.025*Math.cos(a-g.movementAngle);for(const e of prey){const dx=e.x-p.x,dy=e.y-p.y,along=dx*Math.cos(a)+dy*Math.sin(a),side=Math.abs(dx*Math.sin(a)-dy*Math.cos(a));if(along>=-width*.4&&along<=range&&side<width)score+=(e.realm?.role==='boss'?(g.realm?.open||g.realm?.relics.some(r=>r.shrine===null&&r.ability==='mooncyclone'&&r.nature===g.realm?.pattern[g.realm.layer])?7:.1):e.colossus?7:e.court?.role==='captain'||e.realm?.role==='guardian'?5:cycloneHeavy(e)?2:1)*(1-side/width*.45);}if(score>best){best=score;angle=a;}}
 const length=Math.min(range,g.targetView.x*.88/Math.max(.001,Math.abs(Math.cos(angle))),g.targetView.y*.88/Math.max(.001,Math.abs(Math.sin(angle))));return {x:p.x+Math.cos(angle)*length,y:p.y+Math.sin(angle)*length};
}
export function castCyclone(g:Game,power:AbilityDef){const target=g.targetPoint||cycloneSuggestedPoint(g),dx=target.x-g.player.x,dy=target.y-g.player.y;g.cycloneSpin={elapsed:0,angle:Math.hypot(dx,dy)>5?Math.atan2(dy,dx):g.movementAngle,power};}
export function updateCyclones(g:Game,dt:number){const spin=g.cycloneSpin;if(spin){spin.elapsed+=dt;if(spin.elapsed>=CYCLONE.windup){g.cycloneSpin=null;const life=spin.power.duration||3;if(g.cyclones.length<CYCLONE.max)g.cyclones.push({x:g.player.x,y:g.player.y,angle:spin.angle,radius:spin.power.radius,damage:spin.power.damage,life,total:life,tick:0,distance:0,range:cycloneRange(g),source:g.realm?'relic:lycanthrope:mooncyclone':'mooncyclone',origin:{x:g.player.x,y:g.player.y},scattered:new Set()});g.sound('cyclone.launch');}}
 for(let i=g.cyclones.length-1;i>=0;i--){const w=g.cyclones[i];w.life-=dt;w.tick-=dt;let heavy=false;g.nearby(w.x,w.y,w.radius+65,e=>{if(cycloneHeavy(e)&&Math.hypot(e.x-w.x,e.y-w.y)<w.radius+40)heavy=true;});const step=Math.min(w.range-w.distance,(heavy?CYCLONE.heavySpeed:CYCLONE.speed)*dt),from={x:w.x,y:w.y},ax=Math.cos(w.angle),ay=Math.sin(w.angle);w.x+=ax*step;w.y+=ay*step;w.distance+=step;
 if(w.tick<=0){w.tick=CYCLONE.tick;let kills=0;g.nearby(w.x,w.y,w.radius+65+step,e=>{const dx=e.x-from.x,dy=e.y-from.y,t=Math.max(0,Math.min(step,dx*ax+dy*ay));if(Math.hypot(dx-ax*t,dy-ay*t)>w.radius+20)return;if(g.damage(e,w.damage*g.powerScale(),w.source,w.origin))kills++;else if(e.active&&!cycloneHeavy(e)&&!w.scattered.has(e.serial)){w.scattered.add(e.serial);const side=dx*(-ay)+dy*ax>=0?1:-1;e.vx+=ax*360-ay*side*220;e.vy+=ay*360+ax*side*220;} });g.completeAttack(kills,{},w.source);}
 if(w.life<=0||w.distance>=w.range)g.cyclones.splice(i,1);
 }
}
