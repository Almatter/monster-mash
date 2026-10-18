import {Game,type Enemy,type Input} from './simulation.ts';
import {MONSTERS,ABILITIES} from './content-monsters.ts';
import {damageKind,type DamageKind} from './combat-damage.ts';
import {hagState} from './hag.ts';
import {updateReaper} from './reaper.ts';
import {fissureMotion} from './titan-fissure.ts';
import {CRUCIBLE,type Crucible,type CrucibleUnit} from './crucible-sim.ts';

export const abilityOwner=(id:string)=>Object.keys(MONSTERS).find(n=>MONSTERS[n].abilities.includes(id))||({faultline:'titan',ravage:'lycanthrope',soulwrit:'overlord',prismcollapse:'calamity',bloodthread:'devourer',gravitonseal:'titan',spellsteel:'sovereign',soulorbit:'reaper',moonrend:'lycanthrope'}[id])||'sovereign';
export const CRUCIBLE_ABILITIES=Object.values(ABILITIES);

// Use the actual champion simulation, including its passives and persistent spells.
// Only terrain, army orders, economy and damage routing belong to the prototype.
export class CrucibleBrain extends Game{
 host:Crucible;team:number;
 constructor(host:Crucible,team:number){super(host.seed^((team+1)*0x9e3779b9),{monsterId:host.teams[team].monster},3,'throw',true);this.host=host;this.team=team;this.titanKit='fissure';this.floorClearance=(x,y)=>Math.min(x-95,CRUCIBLE.width-95-x,y-95,CRUCIBLE.height-95-y);this.release=4;this.lungeCharges=3;this.damageScale=.75;this.recoveryScale=1;this.cooldowns=[0,0,0,0];}
 override heal(amount:number,recovery=false){super.heal(amount,recovery);const u=this.host?.teams[this.team]?.champion;if(u?.active)u.hp=this.player.hp;}
 override get arenaRadius(){return 100000;}
 override insideMap(x:number,y:number){return x>=95&&x<=CRUCIBLE.width-95&&y>=95&&y<=CRUCIBLE.height-95;}
 override slideArena(body:{x:number;y:number},radius:number){body.x=Math.max(95,Math.min(CRUCIBLE.width-95,body.x));body.y=Math.max(95,Math.min(CRUCIBLE.height-95,body.y));}
 override hasTrait(nature:string){return this.identity.monsterId===nature||this.relicOwners.includes(nature);}
 override get releaseStats(){const base=super.releaseStats,t=this.host.teams[this.team],u=t.champion;return {...base,move:base.move*u.speed/this.monster.speed,radius:base.radius*(1+.1*t.upgrades.reach),attack:base.attack*(1-.08*t.upgrades.tempo)*(1-.08*t.upgrades.haste)};}
 override update(dt:number,input:Input){const charges=this.lungeCharges;super.update(dt,input);if(this.lungeCharges>charges&&this.lungeRecharge>0)this.lungeRecharge*=1-.08*this.host.teams[this.team].upgrades.haste;if(this.monster.id!=='reaper'&&(this.scytheWaves.length||this.reaperStorm>0))updateReaper(this,dt);}
 override canTarget(e:Enemy,from:{x:number;y:number}=this.player){const controlled=this.host.teams[this.host.controlled]?.champion;if(controlled&&this.team!==this.host.controlled&&e.serial===controlled.id&&from===this.player&&(Math.abs(this.player.x-controlled.x)>this.host.viewport.x||Math.abs(this.player.y-controlled.y)>this.host.viewport.y))return false;return e.active&&Math.abs(e.x-from.x)<=this.targetView.x&&Math.abs(e.y-from.y)<=this.targetView.y;}
 override cast(slot:number,point?:{x:number;y:number}){const original=this.powers[slot];if(!original)return false;const t=this.host.teams[this.team],wasReady=this.cooldowns[slot]<=0;
  this.powers[slot]={...original,radius:original.radius*(1+.1*t.upgrades.reach),...(original.duration&&!['lunge','charge','meteor'].includes(original.effect)?{duration:original.duration*(1+.15*t.upgrades.duration)}:{})};
  let success=false;try{success=super.cast(slot,point);}finally{this.powers[slot]=original;}
  if(success&&wasReady){const factor=1-.08*t.upgrades.haste;this.cooldowns[slot]*=factor;this.lungeRecharge*=factor;}return success;
 }
}

type Actor={brain:CrucibleBrain;proxies:Map<number,Enemy>;summons:Map<Game['servants'][number],CrucibleUnit>;summonPool:CrucibleUnit[];nextCast:number;slot:number;ready:Map<string,number>;owned:Set<string>;healAt:number};
export class CrucibleCombat{
 actors:Actor[]=[];
 host:Crucible;
 constructor(host:Crucible){this.host=host;for(let team=0;team<8;team++)this.reset(team);}
 reset(team:number){const old=this.actors[team],brain=new CrucibleBrain(this.host,team);if(old){brain.powers=old.brain.powers.slice();brain.relicOwners=old.brain.relicOwners.slice();for(const u of old.summons.values())u.active=false;}
  this.actors[team]={brain,proxies:new Map(),summons:new Map(),summonPool:old?.summonPool||[],nextCast:this.host.time+.6,slot:0,ready:new Map(),owned:old?.owned||new Set(brain.powers.map(p=>p.id)),healAt:0};if(!old)Object.assign(this.host.teams[team].champion,{power:0,ultimate:0,cooldowns:[0,0,0,0]});this.sync(team);
 }
 sync(team:number){const u=this.host.teams[team].champion,b=this.actors[team].brain;b.time=this.host.time;b.ended=false;Object.assign(b.player,{x:u.x,y:u.y,hp:u.hp,maxHp:u.maxHp,invuln:u.invuln});b.cooldowns=[u.power,u.cooldowns[1],u.cooldowns[2],u.ultimate];b.attack=u.attack;if(u.slow>0)b.moveSlowUntil=Math.max(b.moveSlowUntil,this.host.time+u.slow);b.attacksBlockedUntil=u.stun>0||u.fear>0?this.host.time+Math.max(u.stun,u.fear):0;b.controlledUntil=u.stun>0?this.host.time+u.stun:0;b.facingX=u.facing;b.targetView=this.host.controlled===team?{...this.host.viewport}:{x:850,y:600};}
 prepare(team:number){this.sync(team);const a=this.actors[team],b=a.brain,h=this.host,u=h.teams[team].champion,targets:Enemy[]=[],live=new Set<number>();
  for(const v of h.units){if(!v.active||v.team===team||Math.abs(v.x-u.x)>1250||Math.abs(v.y-u.y)>1250)continue;live.add(v.id);let proxy=a.proxies.get(v.id);
   if(!proxy){proxy={active:true,kind:v.kind==='crystal'?'titan':v.kind==='champion'||v.kind==='captain'?'elite':v.kind==='ranged'?'spitter':'thrall',x:v.x,y:v.y,hp:v.hp,maxHp:v.maxHp,vx:0,vy:0,timer:0,windup:0,flash:0,serial:v.id};
    if(v.kind==='captain')proxy.realm={role:'guardian',shrine:v.team} as Enemy['realm'];
    proxy.receiveDamage=(amount,source)=>{if(source==='beam'&&v.team===h.controlled&&(Math.abs(v.x-u.x)>h.viewport.x||Math.abs(v.y-u.y)>h.viewport.y))return 0;const summoned=['controlled','summoned'].includes(source),member=summoned?[...a.summons.values()].filter(actor=>actor.active&&Math.hypot(actor.x-v.x,actor.y-v.y)<150).sort((left,right)=>Math.hypot(left.x-v.x,left.y-v.y)-Math.hypot(right.x-v.x,right.y-v.y))[0]:undefined,actual=h.damage(v,amount,team,false,false,summoned?member:u,damageKind(source,b.monster.basic.ranged),summoned?team:undefined);return actual;};a.proxies.set(v.id,proxy);
   }
   Object.assign(proxy,{active:true,x:v.x,y:v.y,hp:v.hp,maxHp:v.maxHp,grabbed:v.grabbed||b.grip?.serial===v.id,servantTarget:v.servant});targets.push(proxy);
  }
  for(const [id,p] of a.proxies)if(!live.has(id)){p.active=false;a.proxies.delete(id);}b.enemies=targets;b.alive=targets.length;b.rebuildGrid();
 }
 finish(team:number){const u=this.host.teams[team].champion,b=this.actors[team].brain;if(!u.active)return;Object.assign(u,{x:b.player.x,y:b.player.y,hp:b.player.hp,invuln:b.player.invuln,facing:b.facingX,moving:b.moving,attack:b.attack,power:b.cooldowns[0],ultimate:b.cooldowns[3],cooldowns:b.cooldowns.slice()});b.slideArena(u,27);}
 cast(team:number,slot:number,point?:{x:number;y:number}){const t=this.host.teams[team];if(!t||!t.champion.active||t.champion.grabbed||t.champion.stun>0||t.champion.fear>0||t.eliminated||!Number.isInteger(slot)||slot<0||slot>3)return false;this.prepare(team);const a=this.actors[team],b=a.brain,target=b.nearestEnemy(1000);if(!point&&['meteor','vortex','reaperblink','reapervolley','wolfcyclone','haghex'].includes(b.powers[slot].effect)&&target)point={x:target.x,y:target.y};if(this.host.input.x||this.host.input.y){if(this.host.controlled===team)b.setMovementDirection(this.host.input.x,this.host.input.y);}else if(target)b.player.angle=Math.atan2(target.y-b.player.y,target.x-b.player.x);
  const cast=b.cast(slot,point);if(cast){b.player.invuln=0;this.finish(team);this.flush(team,0);this.summons(team);}return cast;
 }
 hurt(team:number,amount:number,kind:DamageKind){const u=this.host.teams[team].champion,b=this.actors[team].brain;Object.assign(b.player,{hp:u.hp,maxHp:u.maxHp,invuln:u.invuln});b.ended=false;const before=b.player.hp;b.hurt(amount,amount,kind);u.invuln=b.player.invuln;return before-b.player.hp;}
 step(team:number,dx:number,dy:number,dt:number){this.prepare(team);const a=this.actors[team],b=a.brain,u=this.host.teams[team].champion,controlled=this.host.controlled===team;const length=Math.max(1,Math.hypot(dx,dy));dx/=length;dy/=length;b.setMovementDirection(dx,dy);
  if(!controlled&&this.host.time>=a.nextCast){const target=b.nearestEnemy(850);if(target){for(let i=0;i<4;i++){const slot=(a.slot+i)%4,p=b.powers[slot],range=p.radius*b.releaseStats.radius,d=Math.hypot(target.x-u.x,target.y-u.y);if(b.cooldowns[slot]>0&&!(p.effect==='haggas'&&hagState(b).clouds.length)||d>Math.max(range,180)&&!['summon','dominion','frenzy','hagflight','hagfrenzy','reaperstorm','wolffury'].includes(p.effect))continue;
    const point=['meteor','vortex','reaperblink','reapervolley','wolfcyclone','haghex'].includes(p.effect)?{x:target.x,y:target.y}:undefined;if(b.cast(slot,point)){a.slot=(slot+1)%4;a.nextCast=this.host.time+.65+b.random()*.45;break;}}
   }else a.nextCast=this.host.time+.25;
  }
  b.time=this.host.time-dt;const target=b.nearestEnemy(850);b.update(dt,{x:dx,y:dy,aimX:target?.x??u.x+Math.cos(b.movementAngle)*200,aimY:target?.y??u.y+Math.sin(b.movementAngle)*200,aiming:!!target});this.finish(team);
  this.flush(team,dt);this.summons(team);
 }
 private flush(team:number,dt:number){const a=this.actors[team],b=a.brain;
  for(const [id,p] of a.proxies){const v=this.host.unit(id);if(!v?.active)continue;if(!p.active){v.active=false;if(v.servant)v.servant.active=false;continue;}if(b.fissures.length&&fissureMotion(b,p)<1)v.slow=Math.max(v.slow,.3);if((p.snaredUntil||0)>b.time)v.slow=Math.max(v.slow,.5);if((p.staggerUntil||0)>b.time)v.stun=Math.max(v.stun,p.staggerUntil!-b.time);if((p.fearedUntil||0)>b.time){v.fear=Math.max(v.fear,p.fearedUntil!-b.time);v.fearX=b.player.x;v.fearY=b.player.y;}if(p.grabbed&&b.grip?.serial===v.id){v.grabbed=true;v.grabOwner=team;v.x=p.x;v.y=p.y;}else if(v.grabOwner===team){v.grabbed=false;v.grabOwner=-1;}if(v.kind!=='captain'&&v.kind!=='crystal'&&(p.vx||p.vy)){const resistance=v.kind==='champion'?.2:1;v.x+=p.vx*dt*resistance;v.y+=p.vy*dt*resistance;b.slideArena(v,v.radius);p.vx*=Math.exp(-5*dt);p.vy*=Math.exp(-5*dt);}}
 }

 fallen(team:number){const a=this.actors[team];for(const u of this.host.units)if(u.grabOwner===team){u.grabbed=false;u.grabOwner=-1;}for(const s of a.brain.servants)s.active=false;for(const u of a.summonPool)u.active=false;}
 private summons(team:number){const a=this.actors[team];for(const servant of a.brain.servants){let u=a.summons.get(servant);if(!servant.active){if(u)u.active=false;continue;}if(!u){u=a.summonPool.find(v=>!v.active&&![...a.summons.values()].includes(v));if(!u){if(a.summonPool.length>=32)continue;u=this.host.summonActor(team,servant.x,servant.y);a.summonPool.push(u);}a.summons.set(servant,u);}if(!u.active)this.host.reviveSummon(u);a.brain.slideArena(servant,13);Object.assign(u,{active:true,x:servant.x,y:servant.y,hp:servant.hp,maxHp:220});u.servant=servant;}}
 abilityReason(team:number,id:string,slot:number){const t=this.host.teams[team],a=this.actors[team];if(!t||!a||!ABILITIES[id]||!Number.isInteger(slot)||slot<0||slot>3)return 'Invalid ability or slot';const location=this.host.shopLocation(team);if(location)return location;const ultimate=MONSTERS[abilityOwner(id)].abilities[3]===id;if((slot===3)!==ultimate)return ultimate?'Choose the ultimate slot':'Choose a regular ability slot';if(a.brain.powers.some(p=>p.id===id))return 'Already equipped';if(t.mana+1e-7<this.abilityCost(team,id))return 'Not enough mana';return '';}
 abilityCost(team:number,id:string){return this.actors[team].owned.has(id)?0:MONSTERS[abilityOwner(id)].abilities[3]===id?250:160;}
 equip(team:number,id:string,slot:number){if(this.abilityReason(team,id,slot))return false;const a=this.actors[team],b=a.brain,t=this.host.teams[team];this.sync(team);a.ready.set(b.powers[slot].id,this.host.time+b.cooldowns[slot]);t.mana=Math.max(0,t.mana-this.abilityCost(team,id));a.owned.add(id);b.powers[slot]=ABILITIES[id];b.relicOwners[slot]=abilityOwner(id);b.cooldowns[slot]=Math.max(2,(a.ready.get(id)||0)-this.host.time);if(ABILITIES[id].effect==='lunge'&&!a.ready.has(id))b.lungeCharges=3;this.finish(team);return true;}
}
