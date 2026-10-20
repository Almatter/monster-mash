import {Game,type Enemy,type Input} from './simulation.ts';
import {MONSTERS} from './content-monsters.ts';
import {CrucibleAugmentRuntime} from './crucible-augments.ts';
import {CrucibleAttention} from './crucible-attention.ts';
import {damageKind,type DamageKind} from './combat-damage.ts';
import {hagState,hagHexCount,HAG} from './hag.ts';
import {harvestLife} from './reaper.ts';
import {fissureMotion} from './titan-fissure.ts';
import {CRUCIBLE,CRUCIBLE_SIEGE,type Crucible,type CrucibleUnit} from './crucible-sim.ts';

// Use the actual champion simulation, including its passives and persistent spells.
// Only terrain, army orders, economy and damage routing belong to the prototype.
export class CrucibleBrain extends Game{
 host:Crucible;team:number;mods:CrucibleAugmentRuntime;
 constructor(host:Crucible,team:number){super(host.seed^((team+1)*0x9e3779b9),{monsterId:host.teams[team].monster},3,'throw',true);this.host=host;this.team=team;this.titanKit='fissure';this.floorClearance=(x,y)=>this.host.terrain.clearance(x,y);this.release=4;this.lungeCharges=3;this.damageScale=.75;this.recoveryScale=1;this.cooldowns=[0,0,0,0];this.powers=this.powers.map((p,i)=>({...p,cooldown:p.cooldown*(i===3?CRUCIBLE_SIEGE.ultimateCooldown:CRUCIBLE_SIEGE.regularCooldown)}));this.mods=new CrucibleAugmentRuntime(this);this.mods.apply();}
 override heal(amount:number,recovery=false){super.heal(amount,recovery);const u=this.host?.teams[this.team]?.champion;if(u?.active)u.hp=this.player.hp;}
 override get arenaRadius(){return 100000;}
 override insideMap(x:number,y:number){return this.host.terrain.walkable(x,y);}
 override slideArena(body:{x:number;y:number},radius:number){this.host.terrain.slide(body,radius,body===this.player?this.host.teams[this.team].champion:undefined,hagState(this).flight>0||!!this.vault);}
 override hasTrait(nature:string){return this.identity.monsterId===nature||this.relicOwners.includes(nature);}
 override get releaseStats(){const base=super.releaseStats,t=this.host.teams[this.team],u=t.champion;return {...base,move:base.move*u.speed/this.monster.speed*this.host.terrain.speedAt(u,hagState(this).flight>0||!!this.vault),radius:base.radius*(1+.1*t.upgrades.reach),attack:base.attack*(1-.08*t.upgrades.tempo)*(1-.08*t.upgrades.haste)};}
 override damage(e:Enemy,amount:number,source:string,origin?:{x:number;y:number}){if(!['haghex','hagflight','hagfrenzy','hagpoison','controlled','summoned'].includes(source)&&(!this.host.intel.visible(this.team,e)||Math.hypot(e.x-this.player.x,e.y-this.player.y)>800))return false;const before=e.hp,died=super.damage(e,amount,source,origin);const actual=Math.max(0,before-e.hp);if(source==='direct'&&this.identity.monsterId==='reaper'&&this.mods.has('brawler'))harvestLife(this,actual);this.mods.hit(e,actual,source,died);return died;}
 override update(dt:number,input:Input){const before=this.mods.snapshot(),charges=this.lungeCharges;super.update(dt,input);if(this.lungeCharges>charges&&this.lungeRecharge>0)this.lungeRecharge*=1-.08*this.host.teams[this.team].upgrades.haste;this.mods.update(dt,before);}
 override targetAim(e:Enemy){return this.host.controlled===this.team?e:this.host.combat.attention.aim(this.team)||e;}
 override canTarget(e:Enemy,from:{x:number;y:number}=this.player){const controlled=this.host.teams[this.host.controlled]?.champion;if(controlled&&this.team!==this.host.controlled&&e.serial===controlled.id&&from===this.player&&(Math.abs(this.player.x-controlled.x)>this.host.viewport.x||Math.abs(this.player.y-controlled.y)>this.host.viewport.y))return false;if(!this.host.intel.visible(this.team,e)||!this.host.terrain.lineVisible(from,e))return false;if(!e.active||Math.abs(e.x-from.x)>this.targetView.x||Math.abs(e.y-from.y)>this.targetView.y)return false;return this.host.controlled===this.team||from!==this.player||this.host.combat.attention.targetable(this.team,e.serial);}
 override cast(slot:number,point?:{x:number;y:number}){const original=this.powers[slot];if(!original)return false;if(this.mods.canReactivate(slot))return this.mods.detonate(original);if(original.effect==='haghex'){
  if(point&&(Math.hypot(point.x-this.player.x,point.y-this.player.y)>this.hexCastRange||!this.insideMap(point.x,point.y))){this.notice='HEX TARGET OUT OF RANGE OR OUTSIDE WALKABLE FLOOR';this.noticeTime=3;return false;}
  const s=hagState(this);if(this.cooldowns[slot]<=0){let reclaim=Math.max(0,hagHexCount(this)-(HAG.maxTraps-s.traps.length));s.traps=s.traps.filter(trap=>{const offscreen=Math.abs(trap.x-this.player.x)>this.targetView.x+trap.trigger||Math.abs(trap.y-this.player.y)>this.targetView.y+trap.trigger;if(reclaim>0&&offscreen){reclaim--;return false;}return true;});}
  if(s.traps.length>=HAG.maxTraps){this.notice='HEX FIELD FULL · 48 / 48 MINES';this.noticeTime=3;return false;}}
 const t=this.host.teams[this.team],wasReady=this.cooldowns[slot]<=0,rechargeBefore=this.lungeRecharge;
  this.powers[slot]={...original,radius:original.radius*(1+.1*t.upgrades.reach),...(original.duration&&!['lunge','charge','meteor'].includes(original.effect)?{duration:original.duration*(1+.15*t.upgrades.duration)}:{})};
  const origin={x:this.player.x,y:this.player.y};let success=false;try{success=super.cast(slot,point);}finally{this.powers[slot]=original;}
  if(success&&wasReady){const factor=1-.08*t.upgrades.haste;this.cooldowns[slot]*=factor;if(original.effect==='lunge'&&rechargeBefore<=0)this.lungeRecharge*=factor;}if(success){this.beamPower={...this.beamPower,radius:Math.min(800,this.beamPower.radius)};this.mods.afterCast(original,origin);}return success;
 }
}

type Actor={brain:CrucibleBrain;proxies:Map<number,Enemy>;summons:Map<Game['servants'][number],CrucibleUnit>;summonPool:CrucibleUnit[];nextCast:number;slot:number;healAt:number};
export class CrucibleCombat{
 actors:Actor[]=[];attention:CrucibleAttention;private resisted=new WeakMap<Enemy,Record<string,{raw:number;until:number}>>();private venomTimers=new WeakMap<object,number>();
 private status(p:Enemy,key:'snaredUntil'|'staggerUntil'|'fearedUntil',team:number,time:number){const raw=p[key]||0;if(raw<=time)return 0;let timers=this.resisted.get(p);if(!timers){timers={};this.resisted.set(p,timers);}let entry=timers[key];if(!entry||raw>entry.raw+.001){entry={raw,until:time+(raw-time)*this.host.resistance(team,'resolve')};timers[key]=entry;}return Math.max(0,entry.until-time);}
 host:Crucible;
 airborne(team:number){const b=this.actors[team]?.brain;return !!b&&(hagState(b).flight>0||!!b.vault);}
 constructor(host:Crucible){this.host=host;this.attention=new CrucibleAttention(host);for(let team=0;team<8;team++)this.reset(team);}
 reset(team:number){const old=this.actors[team],brain=new CrucibleBrain(this.host,team);if(old){for(const u of old.summons.values())u.active=false;}
  this.actors[team]={brain,proxies:new Map(),summons:new Map(),summonPool:old?.summonPool||[],nextCast:this.host.time+.6,slot:0,healAt:0};this.attention.reset(team);if(!old)Object.assign(this.host.teams[team].champion,{power:0,ultimate:0,cooldowns:[0,0,0,0]});this.sync(team);
 }
 sync(team:number){const u=this.host.teams[team].champion,b=this.actors[team].brain;b.time=this.host.time;b.ended=false;b.recoveryScale=this.host.sustainScale(team);Object.assign(b.player,{x:u.x,y:u.y,hp:u.hp,maxHp:u.maxHp,invuln:u.invuln});b.cooldowns=[u.power,u.cooldowns[1],u.cooldowns[2],u.ultimate];b.attack=u.attack;if(u.slow>0)b.moveSlowUntil=Math.max(b.moveSlowUntil,this.host.time+u.slow);b.attacksBlockedUntil=u.stun>0||u.fear>0?this.host.time+Math.max(u.stun,u.fear):0;b.controlledUntil=u.stun>0?this.host.time+u.stun:0;b.facingX=u.facing;b.targetView={...this.host.viewport};b.hexCastRange=Math.max(650,Math.hypot(b.targetView.x,b.targetView.y))*(1+.1*this.host.teams[team].upgrades.reach);b.mods.apply();}
 prepare(team:number){this.sync(team);this.attention.update(team);const a=this.actors[team],b=a.brain,h=this.host,u=h.teams[team].champion,targets:Enemy[]=[],live=new Set<number>();
  for(const v of h.units){if(!v.active||v.team===team||Math.abs(v.x-u.x)>1250||Math.abs(v.y-u.y)>1250)continue;live.add(v.id);let proxy=a.proxies.get(v.id);
   if(!proxy){proxy={active:true,kind:v.siege||v.kind==='crystal'?'titan':v.kind==='champion'||v.kind==='captain'?'elite':v.kind==='ranged'?'spitter':'thrall',x:v.x,y:v.y,hp:v.hp,maxHp:v.maxHp,vx:0,vy:0,timer:0,windup:0,flash:0,serial:v.id};
    if(v.kind==='captain')proxy.realm={role:'guardian',shrine:v.team} as Enemy['realm'];
    proxy.receiveDamage=(amount,source)=>{if(!['haghex','hagflight','hagfrenzy','hagpoison','controlled','summoned'].includes(source)&&(!h.intel.visible(team,v)||Math.hypot(v.x-u.x,v.y-u.y)>800))return 0;if(source==='beam'&&v.team===h.controlled&&(Math.abs(v.x-u.x)>h.viewport.x||Math.abs(v.y-u.y)>h.viewport.y))return 0;const summoned=['controlled','summoned'].includes(source),member=summoned?[...a.summons.values()].filter(actor=>actor.active&&Math.hypot(actor.x-v.x,actor.y-v.y)<150).sort((left,right)=>Math.hypot(left.x-v.x,left.y-v.y)-Math.hypot(right.x-v.x,right.y-v.y))[0]:undefined,actual=h.damage(v,amount,team,false,false,summoned?member:u,damageKind(source,b.monster.basic.ranged),summoned?team:undefined,false,!summoned&&!['direct','hagvenom','scythe'].includes(source));return actual;};a.proxies.set(v.id,proxy);
   }
   Object.assign(proxy,{active:true,x:v.x,y:v.y,hp:v.hp,maxHp:v.maxHp,grabbed:v.grabbed||b.grip?.serial===v.id,servantTarget:v.servant});targets.push(proxy);
  }
  for(const [id,p] of a.proxies)if(!live.has(id)){p.active=false;a.proxies.delete(id);}b.enemies=targets;b.alive=targets.length;b.rebuildGrid();
 }
 finish(team:number){const u=this.host.teams[team].champion,b=this.actors[team].brain;if(!u.active)return;Object.assign(u,{x:b.player.x,y:b.player.y,hp:b.player.hp,invuln:b.player.invuln,facing:b.facingX,moving:b.moving,attack:b.attack,power:b.cooldowns[0],ultimate:b.cooldowns[3],cooldowns:b.cooldowns.slice()});b.slideArena(u,27);}
 cast(team:number,slot:number,point?:{x:number;y:number}){const t=this.host.teams[team];if(!t||!t.champion.active||t.champion.grabbed||t.champion.stun>0||t.champion.fear>0||t.eliminated||!Number.isInteger(slot)||slot<0||slot>3)return false;this.prepare(team);const a=this.actors[team],b=a.brain,target=b.nearestEnemy(1000);if(!point&&['meteor','vortex','reaperblink','reapervolley','wolfcyclone','haghex'].includes(b.powers[slot].effect)&&target)point={x:target.x,y:target.y};if(this.host.input.x||this.host.input.y){if(this.host.controlled===team)b.setMovementDirection(this.host.input.x,this.host.input.y);}else if(target)b.player.angle=Math.atan2(target.y-b.player.y,target.x-b.player.x);
  const cast=b.cast(slot,point);if(cast){b.player.invuln=0;this.finish(team);this.flush(team,0);this.summons(team);}return cast;
 }
 hurt(team:number,amount:number,kind:DamageKind){const u=this.host.teams[team].champion,b=this.actors[team].brain;Object.assign(b.player,{hp:u.hp,maxHp:u.maxHp,invuln:u.invuln});b.ended=false;const before=b.player.hp,shield=b.shield;b.hurt(amount,amount,kind);u.invuln=b.player.invuln;const lost=before-b.player.hp;if(lost>0||b.shield<shield)b.mods.retaliate();return lost;}
 step(team:number,dx:number,dy:number,dt:number){this.prepare(team);const a=this.actors[team],b=a.brain,u=this.host.teams[team].champion,controlled=this.host.controlled===team;const length=Math.max(1,Math.hypot(dx,dy));dx/=length;dy/=length;b.setMovementDirection(dx,dy);
  if(!controlled&&this.host.time>=a.nextCast){const rules=this.host.difficultyRules;if(this.host.random()<rules.missChance)a.nextCast=this.host.time+rules.castMin+this.host.random()*rules.castSpread;else{const target=b.nearestEnemy(Math.hypot(b.targetView.x,b.targetView.y));if(target){for(let i=0;i<4;i++){const slot=(a.slot+i)%4,p=b.powers[slot],range=p.radius*b.releaseStats.radius,d=Math.hypot(target.x-u.x,target.y-u.y);if(b.cooldowns[slot]>0&&!b.mods.canReactivate(slot)&&!(p.effect==='haggas'&&hagState(b).clouds.length)||d>Math.max(range,180)&&!['summon','dominion','frenzy','hagflight','hagfrenzy','reaperstorm','wolffury'].includes(p.effect))continue;
    const point=['meteor','vortex','reaperblink','reapervolley','wolfcyclone','haghex'].includes(p.effect)?this.attention.aim(team)||undefined:undefined;if(b.cast(slot,point)){a.slot=(slot+1)%4;a.nextCast=this.host.time+rules.castMin+this.host.random()*rules.castSpread;break;}}
   }else a.nextCast=this.host.time+.25;
  }}
  b.time=this.host.time-dt;const target=b.nearestEnemy(850),aim=this.attention.aim(team);b.update(dt,{x:dx,y:dy,aimX:(controlled?target?.x:aim?.x)??u.x+Math.cos(b.movementAngle)*200,aimY:(controlled?target?.y:aim?.y)??u.y+Math.sin(b.movementAngle)*200,aiming:!!target});this.finish(team);
  this.flush(team,dt);this.summons(team);
 }
 private flush(team:number,dt:number){const a=this.actors[team],b=a.brain;for(const venom of hagState(b).venom){const target=this.host.unit(venom.serial);if(target?.kind!=='champion')continue;const last=this.venomTimers.get(venom);if(last===undefined||venom.remaining>last+.001)venom.remaining*=this.host.resistance(target.team,'antivenom');this.venomTimers.set(venom,venom.remaining);}
  for(const [id,p] of a.proxies){const v=this.host.unit(id);if(!v?.active)continue;if(!p.active){v.active=false;if(v.servant)v.servant.active=false;continue;}if(b.fissures.length&&fissureMotion(b,p)<1)v.slow=Math.max(v.slow,.3);const snare=v.kind==='champion'?this.status(p,'snaredUntil',v.team,b.time):Math.max(0,(p.snaredUntil||0)-b.time),stun=v.kind==='champion'?this.status(p,'staggerUntil',v.team,b.time):Math.max(0,(p.staggerUntil||0)-b.time);if(snare>0)v.slow=Math.max(v.slow,Math.min(.5,snare));if(stun>0)v.stun=Math.max(v.stun,stun);if(v.siege){p.vx=0;p.vy=0;}const fear=v.kind==='champion'?this.status(p,'fearedUntil',v.team,b.time):Math.max(0,(p.fearedUntil||0)-b.time);if(fear>0&&!v.siege){v.fear=Math.max(v.fear,fear);v.fearX=b.player.x;v.fearY=b.player.y;}if(p.grabbed&&b.grip?.serial===v.id){v.grabbed=true;v.grabOwner=team;v.x=p.x;v.y=p.y;}else if(v.grabOwner===team){v.grabbed=false;v.grabOwner=-1;}if(v.kind!=='captain'&&v.kind!=='crystal'&&(p.vx||p.vy)){if(Math.hypot(p.vx,p.vy)>10)v.contributions[team]=this.host.time;const resistance=v.kind==='champion'?.2*this.host.resistance(v.team,'anchor'):1;v.x+=p.vx*dt*resistance;v.y+=p.vy*dt*resistance;b.slideArena(v,v.radius);p.vx*=Math.exp(-5*dt);p.vy*=Math.exp(-5*dt);}}
 }

 fallen(team:number){const a=this.actors[team];for(const u of this.host.units)if(u.grabOwner===team){u.grabbed=false;u.grabOwner=-1;}for(const s of a.brain.servants)s.active=false;for(const u of a.summonPool)u.active=false;}
 private summons(team:number){const a=this.actors[team];for(const servant of a.brain.servants){let u=a.summons.get(servant);if(!servant.active){if(u)u.active=false;continue;}if(!u){u=a.summonPool.find(v=>!v.active&&![...a.summons.values()].includes(v));if(!u){if(a.summonPool.length>=32)continue;u=this.host.summonActor(team,servant.x,servant.y);a.summonPool.push(u);}a.summons.set(servant,u);}if(!u.active)this.host.reviveSummon(u);a.brain.slideArena(servant,13);Object.assign(u,{active:true,x:servant.x,y:servant.y,hp:servant.hp,maxHp:220});u.servant=servant;}}
 focusTarget(team:number){return this.attention.target(team);}
 focusPoint(team:number){return this.attention.aim(team);}
}
