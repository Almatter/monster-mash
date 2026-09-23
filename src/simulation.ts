import { ENEMIES, EVENT, PHASES, type EnemyKind } from './data.ts';
import { Score } from './scoring.ts';
import {ABILITIES,MONSTERS} from './content-monsters.ts';
import {createIdentity,type Identity} from './identity.ts';
import {POWER_HANDLERS} from './powers.ts';
import {MASSACRES,SCORING} from './content-records.ts';
import {createServants,updateServants} from './servants.ts';
import {threatAt,INTRODUCTIONS,OPENING,SUSTAIN} from './balance.ts';
export type Enemy={active:boolean;kind:EnemyKind;x:number;y:number;hp:number;maxHp:number;vx:number;vy:number;timer:number;windup:number;flash:number;serial:number;corruptUntil?:number;rushing?:boolean};
export type Effect={x:number;y:number;kind:string;life:number;max:number;radius:number;angle:number};
export type Shot={x:number;y:number;vx:number;vy:number;life:number;damage:number};
export type Input={x:number;y:number;aimX:number;aimY:number;aiming:boolean};
export class Game {
 seed:number; rng:number; time=0; wave=0; ended=false; score=new Score();
 player={x:0,y:0,hp:1000,maxHp:1000,angle:0,invuln:0,rage:0};
 enemies:Enemy[]=Array.from({length:EVENT.maxEnemies},()=>({active:false,kind:'thrall' as EnemyKind,x:0,y:0,hp:0,maxHp:0,vx:0,vy:0,timer:0,windup:0,flash:0,serial:0}));
 effects:Effect[]=[];shots:Shot[]=[]; cooldowns=[0,0,0,0];beam=0;beamTick=0;attack=0;spawnBank=0;alive=0;serial=0;
 grid=new Map<number,Enemy[]>(); freeBuckets:Enemy[][]=[];
 notice='THE HORDE IS YOURS.';noticeTime=4;shake=0;sound:(kind:string)=>void=()=>{};
 surrounded=0;passiveTimer=0;healBudget=250;beamKills=0;beamPower=ABILITIES.beam;ultimateTime=0;activationBest=0;
 frenzy=0;frenzyHealing=0;shield=0;shieldTime=0;sustainCooldown=0;siphonBudget=SUSTAIN.overlord.perSecond;siphonWindow=0;pressure=threatAt(0);pressureTime=0;sustainStats={healed:0,absorbed:0};
 moving=false;resonance=0;servants=createServants();corruptionTick=0;chains:{x:number;y:number}[]=[];
 fields:{kind:string;x:number;y:number;life:number;radius:number;damage:number;tick:number;kills:number}[]=[];
 bolts:{x:number;y:number;vx:number;vy:number;life:number;damage:number;source:string}[]=[];
 debris:{x:number;y:number;vx:number;vy:number;life:number;kills:number}[]=[];
 dash:{remaining:number;speed:number;damage:number;kills:number;angle:number;radius:number;source:string}|null=null;
 identity:Identity;monster=MONSTERS.sovereign;powers=MONSTERS.sovereign.abilities.map(id=>ABILITIES[id]);
 constructor(seed:number,identity:Partial<Identity>={}){this.seed=seed>>>0;this.rng=this.seed||1;this.identity=createIdentity(identity);this.monster=MONSTERS[this.identity.monsterId];this.powers=this.monster.abilities.map(id=>ABILITIES[id]);this.player.hp=this.player.maxHp=this.monster.hp;}
 random(){let x=this.rng;x^=x<<13;x^=x>>>17;x^=x<<5;this.rng=x>>>0;return this.rng/4294967296;}
 notifications:string[]=[];
 announce(text:string){if(this.noticeTime<=0){this.notice=text;this.noticeTime=2.8;}else if(this.notifications.length<10&&!this.notifications.includes(text))this.notifications.push(text);}
 effect(x:number,y:number,kind:string,radius:number,life=.5,angle=0){if(this.effects.length<180)this.effects.push({x,y,kind,radius,life,max:life,angle});}
 seedOpening(){for(let i=0;i<OPENING.count;i++)this.spawn('thrall',true);this.rebuildGrid();}
 heal(amount:number){if(this.ended||amount<=0)return;const gained=Math.min(amount,this.player.maxHp-this.player.hp);this.player.hp+=gained;this.sustainStats.healed+=gained;if(gained>0)this.sound('heal');}
 ward(amount:number,cap:number,seconds:number){this.shield=Math.min(cap,this.shield+amount);this.shieldTime=seconds;this.sound('shield');}
 spawn(kind:EnemyKind,opening=false){
  if(this.alive>=EVENT.maxEnemies-24&&kind!=='elite'&&kind!=='titan')return;
  const e=this.enemies.find(e=>!e.active);if(!e)return;
  const facing=this.time<60?0:this.time*.045;const a=facing+(this.random()-.5)*this.pressure.arc,r=opening?OPENING.distance+this.random()*OPENING.spread:this.pressure.distance+this.random()*160,def=ENEMIES[kind];
  const hpScale=1+Math.max(0,this.wave-4)*.045;
  Object.assign(e,{active:true,kind,x:this.player.x+Math.cos(a)*r,y:this.player.y+Math.sin(a)*r,hp:def.hp*hpScale,maxHp:def.hp*hpScale,vx:0,vy:0,timer:1+this.random()*2,windup:0,flash:0,serial:++this.serial,corruptUntil:0,rushing:true});this.alive++;
 }
 rebuildGrid(){
  for(const bucket of this.grid.values()){bucket.length=0;this.freeBuckets.push(bucket);}this.grid.clear();
  for(const e of this.enemies)if(e.active){const key=this.cell(e.x,e.y);let bucket=this.grid.get(key);if(!bucket){bucket=this.freeBuckets.pop()||[];this.grid.set(key,bucket);}bucket.push(e);}
 }
 cell(x:number,y:number){return (Math.floor(x/80)+4096)*8192+Math.floor(y/80)+4096;}
 nearby(x:number,y:number,r:number,visit:(e:Enemy)=>void){
  for(let ix=Math.floor((x-r)/80);ix<=Math.floor((x+r)/80);ix++)for(let iy=Math.floor((y-r)/80);iy<=Math.floor((y+r)/80);iy++){
   const bucket=this.grid.get((ix+4096)*8192+iy+4096);if(bucket)for(const e of bucket)if(e.active)visit(e);
  }
 }
 hurt(damage:number){if(this.player.invuln>0)return;const incoming=damage*this.monster.armor*(this.monster.passive.id==='surrounded'&&this.surrounded>=3?.75:1),blocked=Math.min(this.shield,incoming);this.shield-=blocked;this.sustainStats.absorbed+=blocked;this.player.hp=Math.max(0,this.player.hp-incoming+blocked);this.player.invuln=.32;this.score.noHitKills=0;this.shake=7;this.sound('hurt');if(this.player.hp<=0)this.ended=true;}
 damage(e:Enemy,amount:number,source:string){
  if(!e.active)return false;
  e.hp-=amount;e.flash=.1;
  if(e.hp>0)return false;
  e.active=false;this.alive--;this.score.kill(ENEMIES[e.kind].score,e.kind,this.time,source);
  if(this.monster.id==='overlord'&&(source==='controlled'||source==='summoned')){const amount=Math.min(SUSTAIN.overlord.perKill,this.siphonBudget);this.siphonBudget-=amount;this.heal(amount);}
  this.effect(e.x,e.y,'blood',ENEMIES[e.kind].radius*2,.5);
  if(this.frenzy>0){const heal=Math.min(8,this.frenzyHealing);this.frenzyHealing-=heal;this.heal(heal);}
  if((e.corruptUntil||0)>this.time&&this.chains.length<128)this.chains.push({x:e.x,y:e.y});
  if(Math.hypot(e.vx,e.vy)>100&&this.debris.length<80)this.debris.push({x:e.x,y:e.y,vx:e.vx,vy:e.vy,life:.6,kills:0});
  if(source==='devour'){const heal=Math.min(this.healBudget,e.kind==='elite'?120:18);this.healBudget-=heal;this.heal(heal);}
  return true;
 }
 resolveFeats(extra:Parameters<Score['evaluate']>[1]){const earned=this.score.evaluate(this.time,extra);if(earned.length)this.announce(earned.join(' · '));}
 completeAttack(kills:number,extra:Parameters<Score['evaluate']>[1]={}){if(this.sustainCooldown<=0){if(this.monster.id==='titan'&&kills>=SUSTAIN.titan.kills){const s=SUSTAIN.titan;this.heal(s.heal);this.ward(s.shield,s.cap,s.seconds);this.sustainCooldown=s.cooldown;}if(this.monster.id==='calamity'&&kills>=SUSTAIN.calamity.kills){const s=SUSTAIN.calamity;this.ward(s.shield,s.cap,s.seconds);this.sustainCooldown=s.cooldown;}}if(this.monster.passive.id==='massacre'&&kills>=20&&this.resonance<=0){this.resonance=1;this.score.carnage=Math.min(5,this.score.carnage+.15);this.score.peak=Math.max(this.score.peak,this.score.carnage);this.cooldowns=this.cooldowns.map(n=>Math.max(0,n-.75));}this.score.multikill(kills);this.activationBest=Math.max(this.activationBest,kills);this.resolveFeats({multi:kills,...extra});const tier=[...MASSACRES].reverse().find(t=>kills>=t.kills);if(tier)this.announce(tier.name+' · '+kills+' SLAIN · +'+(kills*5)+' MULTIKILL');}
 area(x:number,y:number,radius:number,damage:number,source:string,knockback=0,settle=true){let kills=0,overkill=0,apex=0;this.nearby(x,y,radius+65,e=>{const dx=e.x-x,dy=e.y-y,d=Math.hypot(dx,dy);if(d>radius+ENEMIES[e.kind].radius)return;if(damage*this.powerScale()>e.hp*4)overkill++;if(knockback){e.vx=dx/(d||1)*knockback;e.vy=dy/(d||1)*knockback;}if(this.damage(e,damage*this.powerScale(),source)){kills++;if(e.kind==='elite'&&source==='devour')apex++;}});if(settle)this.completeAttack(kills,{overkill,eliteDevoured:apex});return kills;}
 cast(index:number){if(this.ended||this.cooldowns[index]>0)return false;const power=this.powers[index],handler=power&&POWER_HANDLERS[power.effect];if(!handler)return false;this.cooldowns[index]=power.cooldown;this.sound(index===3?'catastrophe':power.effect==='beam'?'beam':power.effect==='devour'?'devour':'rupture');this.shake=index===3?18:8;this.effect(this.player.x,this.player.y,power.effect==='shockwave'?'rupture':power.effect,power.radius,index===3?1:.5);if(index===3)this.ultimateTime=.85;handler(this,power);return true;}
 powerScale(){return (1+(this.wave-1)*.075)*(this.player.rage>0?1.4:1)*(this.frenzy>0?1.5:1)*(this.monster.passive.id==='hunger'?1+Math.min(.25,this.score.recent.length*.005):1);}
 update(dt:number,input:Input){
  if(this.ended)return;
  this.time+=dt;this.sustainCooldown=Math.max(0,this.sustainCooldown-dt);this.shieldTime-=dt;if(this.shieldTime<=0)this.shield=0;this.siphonWindow+=dt;if(this.siphonWindow>=1){this.siphonWindow-=1;this.siphonBudget=SUSTAIN.overlord.perSecond;}this.pressureTime-=dt;if(this.pressureTime<=0){this.pressureTime=.5;this.pressure=threatAt(this.time);}this.score.update(dt,this.time);this.noticeTime-=dt;if(this.noticeTime<=0&&this.notifications.length)this.announce(this.notifications.shift()!);this.shake=Math.max(0,this.shake-dt*25);
  this.resonance=Math.max(0,this.resonance-dt);this.frenzy=Math.max(0,this.frenzy-dt);this.ultimateTime=Math.max(0,this.ultimateTime-dt);const p=this.player;p.invuln=Math.max(0,p.invuln-dt);p.rage=Math.max(0,p.rage-dt);
  for(let i=0;i<4;i++)this.cooldowns[i]=Math.max(0,this.cooldowns[i]-dt);
  this.moving=!!(input.x||input.y||this.dash);const length=Math.hypot(input.x,input.y)||1;p.x+=input.x/Math.max(1,length)*this.monster.speed*(this.monster.passive.id==='hunger'?1+Math.min(.15,this.score.recent.length*.003):1)*dt;p.y+=input.y/Math.max(1,length)*this.monster.speed*(this.monster.passive.id==='hunger'?1+Math.min(.15,this.score.recent.length*.003):1)*dt;
  if(this.dash){const d=this.dash;p.x+=Math.cos(d.angle)*d.speed*dt;p.y+=Math.sin(d.angle)*d.speed*dt;d.remaining-=dt;}
  const fromCenter=Math.hypot(p.x,p.y);if(fromCenter>EVENT.arenaRadius){p.x*=EVENT.arenaRadius/fromCenter;p.y*=EVENT.arenaRadius/fromCenter;}
  if(input.aiming)p.angle=Math.atan2(input.aimY-p.y,input.aimX-p.x);
  else if(length>.1&&(input.x||input.y))p.angle=Math.atan2(input.y,input.x);
  else {let nearest:Enemy|null=null,best=500;for(const e of this.enemies)if(e.active){const d=Math.hypot(e.x-p.x,e.y-p.y);if(d<best){nearest=e;best=d;}}if(nearest)p.angle=Math.atan2(nearest.y-p.y,nearest.x-p.x);}
  const nextWave=Math.floor(this.time/EVENT.waveSeconds)+1,phase=PHASES[EVENT.phase];
  if(nextWave!==this.wave){this.wave=nextWave;if(this.wave>1){this.score.dominance+=this.wave*SCORING.waveBonus;this.announce(`WAVE ${this.wave} · POWER RISES · +${this.wave*SCORING.waveBonus}`);this.sound('wave');}if(this.time>=INTRODUCTIONS.elite&&this.wave%phase.eliteEvery===0)this.spawn('elite');if(this.time>=INTRODUCTIONS.titan&&this.wave%phase.titanEvery===0)this.spawn('titan');}
  this.spawnBank+=dt*this.pressure.rate*phase.pressure;
  const kinds:EnemyKind[]=['thrall','hound','spitter','wing','brute'];
  while(this.spawnBank>=1){this.spawnBank--;let roll=this.random()*100,index=0;while(index<4&&roll>=phase.weights[index]){roll-=phase.weights[index];index++;}if(this.alive<this.pressure.cap)this.spawn(this.time>=INTRODUCTIONS[kinds[index]]?kinds[index]:'thrall');}
  const threat=1+Math.max(0,this.wave-12)*.10;
  for(const e of this.enemies){if(!e.active)continue;const def=ENEMIES[e.kind];let dx=p.x-e.x,dy=p.y-e.y,d=Math.hypot(dx,dy)||1;e.timer-=dt;e.flash=Math.max(0,e.flash-dt);
   // Recycle off-screen stragglers around the player without changing their health or identity.
   if(d>1150&&this.time<120){e.active=false;this.alive--;continue;}if(d>1150){e.x=p.x-dx/d*820;e.y=p.y-dy/d*820;dx=p.x-e.x;dy=p.y-e.y;d=820;}
   let speed=def.speed*(1+this.wave*.025+Math.max(0,this.wave-12)*.10);
   if(d>430)e.rushing=true;if(d<140)e.rushing=false;
   if(e.rushing)speed=Math.max(speed,this.monster.speed*this.pressure.pursuit,180*this.pressure.pursuit);
   if(def.behavior==='ranged'&&d<380){speed=d<250?-def.speed:0;if(e.timer<=0&&this.shots.length<180){this.shots.push({x:e.x,y:e.y,vx:dx/d*220,vy:dy/d*220,life:4,damage:def.damage*threat});e.timer=2.5;}}
   if(def.behavior==='slam'&&d<220&&e.timer<=0&&e.windup<=0){e.windup=1.2;e.timer=e.kind==='titan'?4:5;}
   if(e.windup>0){speed=0;e.windup-=dt;if(e.windup<=0){const r=e.kind==='titan'?240:140;this.effect(e.x,e.y,'slam',r,.45);if(d<r+20)this.hurt(def.damage*threat);}}
   const weave=def.behavior==='weave'?Math.sin(this.time*5+e.serial)*45:0;
   e.x+=(dx/d*speed-dy/d*weave+e.vx)*dt;e.y+=(dy/d*speed+dx/d*weave+e.vy)*dt;
   e.vx*=Math.exp(-dt*4);e.vy*=Math.exp(-dt*4);
   if(d<def.radius+23){this.hurt(def.damage*threat);e.x-=dx/d*12;e.y-=dy/d*12;}
  }
  this.rebuildGrid();
  updateServants(this,dt);
  this.passiveTimer-=dt;if(this.passiveTimer<=0){this.passiveTimer=.2;this.surrounded=0;this.nearby(p.x,p.y,130,e=>{if(Math.hypot(e.x-p.x,e.y-p.y)<130)this.surrounded++;});}
  if(this.dash){const d=this.dash;this.nearby(p.x,p.y,d.radius+60,e=>{if(Math.hypot(e.x-p.x,e.y-p.y)<d.radius+ENEMIES[e.kind].radius&&this.damage(e,d.damage*this.powerScale()*dt*12,d.source))d.kills++;});if(d.remaining<=0){this.completeAttack(d.kills);this.dash=null;}}
  for(let i=this.debris.length-1;i>=0;i--){const b=this.debris[i];b.life-=dt;b.x+=b.vx*dt;b.y+=b.vy*dt;this.nearby(b.x,b.y,35,e=>{if(Math.hypot(e.x-b.x,e.y-b.y)<ENEMIES[e.kind].radius+18&&this.damage(e,100*this.powerScale(),'collision'))b.kills++;});if(b.life<=0){this.resolveFeats({chain:b.kills});this.debris.splice(i,1);}}
  for(const e of this.enemies)if(e.active&&Math.hypot(e.vx,e.vy)>180){let chain=0;this.nearby(e.x,e.y,40,other=>{if(other!==e&&other.active&&Math.hypot(e.x-other.x,e.y-other.y)<ENEMIES[e.kind].radius+ENEMIES[other.kind].radius&&this.damage(other,80*this.powerScale(),'collision'))chain++;});if(chain){this.score.multikill(chain);this.resolveFeats({chain});}}
  for(let i=this.fields.length-1;i>=0;i--){const f=this.fields[i];f.life-=dt;f.tick-=dt;if(f.kind==='vortex'){this.nearby(f.x,f.y,f.radius+60,e=>{const dx=f.x-e.x,dy=f.y-e.y,d=Math.hypot(dx,dy);if(d<f.radius&&d>8){e.vx=dx/d*140;e.vy=dy/d*140;}});if(f.tick<=0){f.tick=.25;f.kills+=this.area(f.x,f.y,f.radius,f.damage,'vortex',0,false);}}if(f.life<=0){if(f.kind==='meteor'){f.kills+=this.area(f.x,f.y,f.radius,f.damage,'meteor',0,false);this.effect(f.x,f.y,'catastrophe',f.radius,.8);this.sound('catastrophe');}this.completeAttack(f.kills);this.fields.splice(i,1);}}
  for(let i=this.bolts.length-1;i>=0;i--){const b=this.bolts[i];b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;let hit=false;this.nearby(b.x,b.y,65,e=>{if(!hit&&Math.hypot(e.x-b.x,e.y-b.y)<ENEMIES[e.kind].radius+10){this.damage(e,b.damage,b.source);hit=true;}});if(hit||b.life<=0)this.bolts.splice(i,1);}
  this.attack-=dt;
  if(this.attack<=0){const basic=this.monster.basic;this.attack=basic.interval*(this.frenzy>0?.5:1);let kills=0;if(basic.ranged){if(this.bolts.length<80)this.bolts.push({x:p.x,y:p.y,vx:Math.cos(p.angle)*800,vy:Math.sin(p.angle)*800,life:basic.radius/800,damage:basic.damage*this.powerScale(),source:'direct'});}else this.nearby(p.x,p.y,basic.radius+65,e=>{if(Math.hypot(e.x-p.x,e.y-p.y)<basic.radius+ENEMIES[e.kind].radius&&this.damage(e,basic.damage*this.powerScale(),'direct'))kills++;});if(!basic.ranged)this.effect(p.x,p.y,'claw',basic.radius+15,.22,p.angle);if(kills){this.completeAttack(kills);this.sound('hit');}}
  if(this.beam>0){this.beam-=dt;this.beamTick-=dt;if(this.beamTick<=0){this.beamTick=.1;let kills=0;const ax=Math.cos(p.angle),ay=Math.sin(p.angle);this.nearby(p.x,p.y,720,e=>{const dx=e.x-p.x,dy=e.y-p.y,along=dx*ax+dy*ay,side=Math.abs(dx*ay-dy*ax);if(along>0&&along<this.beamPower.radius&&side<30+ENEMIES[e.kind].radius&&this.damage(e,this.beamPower.damage*this.powerScale(),'beam'))kills++;});this.beamKills+=kills;}if(this.beam<=0)this.completeAttack(this.beamKills);}
  for(let i=this.shots.length-1;i>=0;i--){const s=this.shots[i];s.x+=s.vx*dt;s.y+=s.vy*dt;s.life-=dt;if(Math.hypot(s.x-p.x,s.y-p.y)<28){this.hurt(s.damage);s.life=0;}if(s.life<=0)this.shots.splice(i,1);}
  for(let i=this.effects.length-1;i>=0;i--){this.effects[i].life-=dt;if(this.effects[i].life<=0)this.effects.splice(i,1);}
  this.resolveFeats({});
 }
}
