import {hagContactImmune} from './hag.ts';
import type {Game,Enemy,Shot} from './simulation.ts';
import {insideRealmGrotto,slideRealmGrotto,realmCachedSteer,moveRealm} from './titan-realm-map.ts';
import {fissureMotion} from './titan-fissure.ts';
export const GUARDIAN_TEAM={skirmisherSpeed:215,lungeSpeed:720,lungeWarning:.45,lungeDuration:.42,lungeCycle:2.8,lungeDamage:95,meleeDamage:65,pushSpeed:680,pushDuration:.22,defenderSpeed:175,guardMax:3600,guardBreak:6,guardRegen:360,guardRadius:260,bashDamage:105,bashWarning:.7,casterSpeed:95,volleyDamage:160,burstDamage:240,bombardDamage:200};
type Point={x:number;y:number};
export type GuardianAction={kind:'lunge'|'bash'|'volley'|'burst'|'bombard';warning:number;total:number;angle:number;remaining:number;hit:boolean;targets:{x:number;y:number;radius:number}[]};
export type GuardianBrain={engaged:boolean;cooldown:number;melee:number;facing:number;guard:number;brokenUntil:number;hitAt:number;guarding:boolean;spellIndex:number;action:GuardianAction|null;lastPlayer:Point;velocity:Point};
export const createGuardianBrain=():GuardianBrain=>({engaged:false,cooldown:1.1,melee:0,facing:0,guard:GUARDIAN_TEAM.guardMax,brokenUntil:0,hitAt:-10,guarding:false,spellIndex:0,action:null,lastPlayer:{x:NaN,y:NaN},velocity:{x:0,y:0}});
const teams=new WeakMap<Game,Map<number,{until:number;defender:Enemy|undefined;caster:Enemy|undefined}>>();
function team(g:Game,shrine:number){let map=teams.get(g);if(!map){map=new Map();teams.set(g,map);}let t=map.get(shrine);if(!t||g.time>=t.until){t={until:g.time+.2,defender:g.enemies.find(e=>e.active&&e.realm?.role==='guardian'&&e.realm.shrine===shrine&&e.realm.variant===0),caster:g.enemies.find(e=>e.active&&e.realm?.role==='guardian'&&e.realm.shrine===shrine&&e.realm.variant===1)};map.set(shrine,t);}return t;}
function brain(e:Enemy){return e.realm!.guardian??=createGuardianBrain();}
const turn=(a:number,b:number,step:number)=>a+Math.max(-step,Math.min(step,Math.atan2(Math.sin(b-a),Math.cos(b-a))));
function readyGuard(g:Game,e:Enemy){const u=e.realm!,a=brain(e),caster=team(g,u.shrine!).caster;return !!(e.active&&caster?.active&&a.guard>0&&a.brokenUntil<=g.time&&Math.hypot(e.x-caster.x,e.y-caster.y)<=GUARDIAN_TEAM.guardRadius);}
export function guardianProtection(g:Game,e:Enemy,amount:number,source:string,origin?:Point){const u=e.realm!;if(u.shrine===undefined)return amount;const point=origin??g.player;
 if(u.variant===0){const a=brain(e);if(!readyGuard(g,e))return amount;const dx=point.x-e.x,dy=point.y-e.y,d=Math.hypot(dx,dy);if(d<1||(dx*Math.cos(a.facing)+dy*Math.sin(a.facing))/d<Math.cos(Math.PI*.43))return amount;
  a.hitAt=g.time;if(['launch','shockwave','collision','trample','lunge','reapersweep','graveshift','fissure-impact','wolfbound','ravage'].includes(source)){a.guard=0;a.brokenUntil=g.time+GUARDIAN_TEAM.guardBreak;a.guarding=false;g.effect(e.x,e.y,'realm-breach',100,.5);g.sound('shield');return amount;}
  const absorbed=Math.min(a.guard,amount*.8);a.guard-=absorbed;if(a.guard<=0){a.brokenUntil=g.time+GUARDIAN_TEAM.guardBreak;a.guarding=false;g.effect(e.x,e.y,'realm-breach',100,.5);}return amount-absorbed;
 }
 if(u.variant!==1)return amount;const ranged=['beam','clawwave','scythe','reapingarc','moonstorm','reapervolley','relic:devourer:bloodthread'].includes(source)||source==='direct'&&g.monster.basic.ranged;if(!ranged)return amount;
 const defender=team(g,u.shrine).defender;if(!defender?.active||!readyGuard(g,defender))return amount;const dx=point.x-e.x,dy=point.y-e.y,d=Math.hypot(dx,dy),gx=defender.x-e.x,gy=defender.y-e.y;if(d<130)return amount;const along=(gx*dx+gy*dy)/d,across=Math.abs(gx*dy-gy*dx)/d,a=brain(defender),toward=Math.atan2(point.y-defender.y,point.x-defender.x);if(along<25||along>Math.min(d,230)||across>65||Math.cos(toward-a.facing)<Math.cos(Math.PI*.43))return amount;
 const absorbed=Math.min(a.guard,amount*.65);a.guard-=absorbed;a.hitAt=g.time;g.effect(defender.x,defender.y,'realm-block',75,.2);if(a.guard<=0){a.brokenUntil=g.time+GUARDIAN_TEAM.guardBreak;a.guarding=false;g.effect(defender.x,defender.y,'realm-breach',100,.5);}return amount-absorbed;
}
function travel(g:Game,e:Enemy,target:Point,speed:number,dt:number){const from={x:e.x,y:e.y},v=speed>0?realmCachedSteer(e,target.x,target.y,g.time):{x:0,y:0},slow=(e.snaredUntil||0)>g.time?.18:1,fissure=g.fissures.length?fissureMotion(g,e):1;e.x+=(v.x*speed*slow*fissure+e.vx)*dt;e.y+=(v.y*speed*slow*fissure+e.vy)*dt;moveRealm(e,from,24,e.realm!.shrine);e.vx*=Math.exp(-dt*4);e.vy*=Math.exp(-dt*4);}
function shove(g:Game,angle:number){if(hagContactImmune(g)||g.vault||g.moonFury>0||g.dodgeInvuln>0||g.player.invuln>0)return false;g.hostilePush={vx:Math.cos(angle)*GUARDIAN_TEAM.pushSpeed,vy:Math.sin(angle)*GUARDIAN_TEAM.pushSpeed,remaining:GUARDIAN_TEAM.pushDuration};return true;}
function sweptHit(from:Point,to:Point,p:Point,r:number){const dx=to.x-from.x,dy=to.y-from.y,t=Math.max(0,Math.min(1,((p.x-from.x)*dx+(p.y-from.y)*dy)/(dx*dx+dy*dy||1)));return Math.hypot(p.x-from.x-dx*t,p.y-from.y-dy*t)<r;}
export function guardianShotHit(g:Game,s:Shot,from:Point){if(s.guardianShrine===undefined)return false;if(!insideRealmGrotto(s.guardianShrine,s.x,s.y,0)){s.life=0;return true;}if(insideRealmGrotto(s.guardianShrine,g.player.x,g.player.y,0)&&sweptHit(from,s,g.player,28)){g.hurt(s.damage,Infinity,'ranged');s.life=0;}return true;}
function startCaster(g:Game,e:Enemy,a:GuardianBrain){const kind=(['volley','burst','bombard'] as const)[a.spellIndex++%3],angle=Math.atan2(g.player.y-e.y,g.player.x-e.x),q={x:g.player.x+a.velocity.x*.3,y:g.player.y+a.velocity.y*.3};slideRealmGrotto(q,e.realm!.shrine!,26);
 const targets=kind==='volley'?[]:[{...q,radius:kind==='burst'?150:112}];if(kind==='bombard')for(const side of [-1,1]){const at={x:q.x-Math.sin(angle)*190*side,y:q.y+Math.cos(angle)*190*side};slideRealmGrotto(at,e.realm!.shrine!,26);if(Math.hypot(at.x-q.x,at.y-q.y)>145)targets.push({...at,radius:112});}
 const warning=kind==='volley'?.8:kind==='burst'?1.25:1.4;a.action={kind,angle,warning,total:warning,remaining:0,hit:false,targets};g.sound('shield');
}
export function guardianMotion(g:Game,e:Enemy,dt:number){const u=e.realm!,id=u.shrine;if(id===undefined)return;const a=brain(e),p=g.player,inside=insideRealmGrotto(id,p.x,p.y,0),allies=team(g,id),caster=allies.caster?.active?allies.caster:undefined,d=Math.hypot(p.x-e.x,p.y-e.y);
 a.cooldown=Math.max(0,a.cooldown-dt);a.melee=Math.max(0,a.melee-dt);if(Number.isFinite(a.lastPlayer.x)&&dt>0){a.velocity.x=Math.max(-320,Math.min(320,(p.x-a.lastPlayer.x)/dt));a.velocity.y=Math.max(-320,Math.min(320,(p.y-a.lastPlayer.y)/dt));}a.lastPlayer={x:p.x,y:p.y};
 const desired=Math.atan2(p.y-e.y,p.x-e.x);a.facing=turn(a.facing,desired,dt*3);if(u.variant===0&&g.time>=a.brokenUntil&&g.time-a.hitAt>3)a.guard=Math.min(GUARDIAN_TEAM.guardMax,a.guard+GUARDIAN_TEAM.guardRegen*dt);a.guarding=u.variant===0&&readyGuard(g,e);
 if(!inside){a.engaged=false;a.action=null;e.windup=0;e.vx=e.vy=0;a.guarding=u.variant===0&&readyGuard(g,e);travel(g,e,{x:u.homeX,y:u.homeY},Math.min(110,Math.hypot(e.x-u.homeX,e.y-u.homeY)*3),dt);return;}
 if(!a.engaged){a.engaged=true;if(u.variant===2)a.cooldown=0;else a.cooldown=Math.min(a.cooldown,u.variant===1?1.1:.4);a.facing=desired;}
 const action=a.action;if(action){action.warning=Math.max(0,action.warning-dt);e.windup=action.warning;
  if(action.warning<=0){if(action.kind==='lunge'){const from={x:e.x,y:e.y},step=Math.min(dt,action.remaining);const slow=((e.snaredUntil||0)>g.time?.18:1)*(g.fissures.length?fissureMotion(g,e):1);e.x+=Math.cos(action.angle)*GUARDIAN_TEAM.lungeSpeed*step*slow;e.y+=Math.sin(action.angle)*GUARDIAN_TEAM.lungeSpeed*step*slow;moveRealm(e,from,24,id);action.remaining-=step;
    if(!action.hit&&sweptHit(from,e,p,63)){const pushed=shove(g,action.angle);g.hurt(GUARDIAN_TEAM.lungeDamage,Infinity,'contact');action.hit=true;g.effect(p.x,p.y,'realm-breach',90,.3);if(pushed)g.sound('collision');}if(action.remaining>0&&Math.hypot(e.x-from.x,e.y-from.y)>.5)return;
   }else if(action.kind==='bash'){g.effect(e.x,e.y,'realm-slam',125,.5);if(d<145)g.hurt(GUARDIAN_TEAM.bashDamage);}
   else if(action.kind==='volley'){for(const offset of [-.13,0,.13])if(g.shots.length<64)g.shots.push({x:e.x,y:e.y,vx:Math.cos(action.angle+offset)*320,vy:Math.sin(action.angle+offset)*320,life:2.6,damage:GUARDIAN_TEAM.volleyDamage,guardianShrine:id});g.effect(e.x,e.y,'realm-mana-burst',85,.3,action.angle);}
   else {for(const q of action.targets){g.effect(q.x,q.y,'realm-mana-burst',q.radius,.6);if(Math.hypot(p.x-q.x,p.y-q.y)<q.radius+20)g.hurt(action.kind==='burst'?GUARDIAN_TEAM.burstDamage:GUARDIAN_TEAM.bombardDamage);}}
   a.action=null;e.windup=0;a.cooldown=u.variant===2?GUARDIAN_TEAM.lungeCycle:u.variant===0?2.8:1.8;g.sound(u.variant===1?'meteorImpact':'titanImpact');
  }else travel(g,e,{x:e.x,y:e.y},0,dt);return;
 }
 if(u.variant===2){if(a.cooldown<=0&&d<390){a.action={kind:'lunge',warning:GUARDIAN_TEAM.lungeWarning,total:GUARDIAN_TEAM.lungeWarning,angle:desired,remaining:GUARDIAN_TEAM.lungeDuration,hit:false,targets:[]};e.windup=GUARDIAN_TEAM.lungeWarning;g.sound('shield');return;}travel(g,e,p,GUARDIAN_TEAM.skirmisherSpeed,dt);if(d<65&&a.melee<=0){g.hurt(GUARDIAN_TEAM.meleeDamage,Infinity,'contact');a.melee=1.1;}return;}
 if(u.variant===0){const anchor=caster??p,dx=p.x-anchor.x,dy=p.y-anchor.y,len=Math.hypot(dx,dy)||1,target=caster?{x:caster.x+dx/len*105,y:caster.y+dy/len*105}:{x:p.x,y:p.y};slideRealmGrotto(target,id,26);travel(g,e,target,Math.min(GUARDIAN_TEAM.defenderSpeed,Math.hypot(target.x-e.x,target.y-e.y)*3),dt);a.guarding=readyGuard(g,e);if(d<155&&a.cooldown<=0){a.action={kind:'bash',warning:GUARDIAN_TEAM.bashWarning,total:GUARDIAN_TEAM.bashWarning,angle:desired,remaining:0,hit:false,targets:[]};e.windup=GUARDIAN_TEAM.bashWarning;}return;}
 // Back toward the sheltering defender; cast from medium range rather than rushing into melee.
 const away={x:e.x+(e.x-p.x)/(d||1)*100,y:e.y+(e.y-p.y)/(d||1)*100};slideRealmGrotto(away,id,26);const target=d<250?away:d>620?p:{x:e.x,y:e.y};travel(g,e,target,d<250?GUARDIAN_TEAM.casterSpeed:d>620?70:0,dt);
 if(a.cooldown<=0){startCaster(g,e,a);e.windup=a.action!.warning;}
}
