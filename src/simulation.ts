import { ENEMIES, EVENT, PHASES, POWERS, type EnemyKind } from './data.ts';
import { Score } from './scoring.ts';
export type Enemy={active:boolean;kind:EnemyKind;x:number;y:number;hp:number;maxHp:number;vx:number;vy:number;timer:number;windup:number;flash:number;serial:number};
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
 constructor(seed:number){this.seed=seed>>>0;this.rng=this.seed||1;}
 random(){let x=this.rng;x^=x<<13;x^=x>>>17;x^=x<<5;this.rng=x>>>0;return this.rng/4294967296;}
 announce(text:string){this.notice=text;this.noticeTime=3.2;}
 effect(x:number,y:number,kind:string,radius:number,life=.5,angle=0){if(this.effects.length<180)this.effects.push({x,y,kind,radius,life,max:life,angle});}
 spawn(kind:EnemyKind){
  if(this.alive>=EVENT.maxEnemies-24&&kind!=='elite'&&kind!=='titan')return;
  const e=this.enemies.find(e=>!e.active);if(!e)return;
  const a=this.random()*Math.PI*2,r=540+this.random()*160,def=ENEMIES[kind];
  const hpScale=1+Math.max(0,this.wave-4)*.045;
  Object.assign(e,{active:true,kind,x:this.player.x+Math.cos(a)*r,y:this.player.y+Math.sin(a)*r,hp:def.hp*hpScale,maxHp:def.hp*hpScale,vx:0,vy:0,timer:1+this.random()*2,windup:0,flash:0,serial:++this.serial});this.alive++;
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
 hurt(damage:number){if(this.player.invuln>0)return;this.player.hp=Math.max(0,this.player.hp-damage);this.player.invuln=.32;this.score.noHitKills=0;this.shake=7;this.sound('hurt');if(this.player.hp<=0)this.ended=true;}
 damage(e:Enemy,amount:number,source:string){
  if(!e.active)return false;
  e.hp-=amount;e.flash=.1;
  if(e.hp>0)return false;
  e.active=false;this.alive--;this.score.kill(ENEMIES[e.kind].score,e.kind,this.time);
  this.effect(e.x,e.y,'blood',ENEMIES[e.kind].radius*2,.5);
  if(source==='devour'){this.player.hp=Math.min(this.player.maxHp,this.player.hp+(e.kind==='elite'?120:18));}
  return true;
 }
 resolveFeats(extra:Parameters<Score['evaluate']>[1]){const earned=this.score.evaluate(this.time,extra);if(earned.length)this.announce(earned.join(' · '));}
 cast(index:number){
  if(this.ended||this.cooldowns[index]>0)return false;
  const power=POWERS[index];if(!power)return false;
  this.cooldowns[index]=power.cooldown;this.sound(power.id);
  if(index===2){this.beam=2.5;this.beamTick=0;return true;}
  const p=this.player,boost=this.powerScale();let kills=0,overkill=0,apex=0;
  this.shake=index===3?18:8;this.effect(p.x,p.y,power.id,power.radius,index===3?1.2:.55);
  this.nearby(p.x,p.y,power.radius+65,e=>{
   const dx=e.x-p.x,dy=e.y-p.y,d=Math.hypot(dx,dy);
   if(d>power.radius+ENEMIES[e.kind].radius)return;
   if(power.damage*boost>e.hp*4)overkill++;
   if(index===0){e.vx=dx/(d||1)*750;e.vy=dy/(d||1)*750;}
   if(this.damage(e,power.damage*boost,power.id)){kills++;if(e.kind==='elite'&&index===1)apex++;}
  });
  // Rupture sends surviving heavies flying, while its outward blast scatters weak prey
  // into a second annulus for the same collision-kill scoring treatment.
  if(index===0){let chain=0;this.nearby(p.x,p.y,300,e=>{const d=Math.hypot(e.x-p.x,e.y-p.y);if(d>190&&d<300&&this.damage(e,55*boost,'collision')){kills++;chain++;}});this.resolveFeats({chain});}
  if(index===1)p.rage=6;
  this.score.multikill(kills);this.resolveFeats({multi:kills,overkill,eliteDevoured:apex});return true;
 }
 powerScale(){return (1+(this.wave-1)*.075)*(this.player.rage>0?1.4:1);}
 update(dt:number,input:Input){
  if(this.ended)return;
  this.time+=dt;this.score.update(dt,this.time);this.noticeTime-=dt;this.shake=Math.max(0,this.shake-dt*25);
  const p=this.player;p.invuln=Math.max(0,p.invuln-dt);p.rage=Math.max(0,p.rage-dt);
  for(let i=0;i<4;i++)this.cooldowns[i]=Math.max(0,this.cooldowns[i]-dt);
  const length=Math.hypot(input.x,input.y)||1;p.x+=input.x/Math.max(1,length)*205*dt;p.y+=input.y/Math.max(1,length)*205*dt;
  const fromCenter=Math.hypot(p.x,p.y);if(fromCenter>EVENT.arenaRadius){p.x*=EVENT.arenaRadius/fromCenter;p.y*=EVENT.arenaRadius/fromCenter;}
  if(input.aiming)p.angle=Math.atan2(input.aimY-p.y,input.aimX-p.x);
  else if(length>.1&&(input.x||input.y))p.angle=Math.atan2(input.y,input.x);
  else {let nearest:Enemy|null=null,best=500;for(const e of this.enemies)if(e.active){const d=Math.hypot(e.x-p.x,e.y-p.y);if(d<best){nearest=e;best=d;}}if(nearest)p.angle=Math.atan2(nearest.y-p.y,nearest.x-p.x);}
  const nextWave=Math.floor(this.time/EVENT.waveSeconds)+1,phase=PHASES[EVENT.phase];
  if(nextWave!==this.wave){this.wave=nextWave;if(this.wave>1){this.score.dominance+=this.wave*100;this.announce(`WAVE ${this.wave} · POWER RISES · +${this.wave*100}`);this.sound('wave');}if(this.wave%phase.eliteEvery===0)this.spawn('elite');if(this.wave%phase.titanEvery===0)this.spawn('titan');}
  this.spawnBank+=dt*(13+this.wave*2.5+Math.max(0,this.wave-14)*3)*phase.pressure;
  const kinds:EnemyKind[]=['thrall','hound','spitter','wing','brute'];
  while(this.spawnBank>=1){this.spawnBank--;let roll=this.random()*100,index=0;while(index<4&&roll>=phase.weights[index]){roll-=phase.weights[index];index++;}this.spawn(kinds[index]);}
  const threat=1+Math.max(0,this.wave-8)*.12;
  for(const e of this.enemies){if(!e.active)continue;const def=ENEMIES[e.kind];let dx=p.x-e.x,dy=p.y-e.y,d=Math.hypot(dx,dy)||1;e.timer-=dt;e.flash=Math.max(0,e.flash-dt);
   // Recycle off-screen stragglers around the player without changing their health or identity.
   if(d>1150){e.x=p.x-dx/d*820;e.y=p.y-dy/d*820;dx=p.x-e.x;dy=p.y-e.y;d=820;}
   let speed=def.speed*(1+this.wave*.025+Math.max(0,this.wave-12)*.10);
   if(d>430)speed=Math.max(speed,235);
   if(def.behavior==='ranged'&&d<380){speed=d<250?-def.speed:0;if(e.timer<=0&&this.shots.length<180){this.shots.push({x:e.x,y:e.y,vx:dx/d*220,vy:dy/d*220,life:4,damage:def.damage*threat});e.timer=2.5;}}
   if(def.behavior==='slam'&&d<220&&e.timer<=0&&e.windup<=0){e.windup=1.2;e.timer=e.kind==='titan'?4:5;}
   if(e.windup>0){speed=0;e.windup-=dt;if(e.windup<=0){const r=e.kind==='titan'?240:140;this.effect(e.x,e.y,'slam',r,.45);if(d<r+20)this.hurt(def.damage*threat);}}
   const weave=def.behavior==='weave'?Math.sin(this.time*5+e.serial)*45:0;
   e.x+=(dx/d*speed-dy/d*weave+e.vx)*dt;e.y+=(dy/d*speed+dx/d*weave+e.vy)*dt;
   e.vx*=Math.exp(-dt*4);e.vy*=Math.exp(-dt*4);
   if(d<def.radius+23){this.hurt(def.damage*threat);e.x-=dx/d*12;e.y-=dy/d*12;}
  }
  this.rebuildGrid();
  for(const e of this.enemies)if(e.active&&Math.hypot(e.vx,e.vy)>180){let chain=0;this.nearby(e.x,e.y,40,other=>{if(other!==e&&other.active&&Math.hypot(e.x-other.x,e.y-other.y)<ENEMIES[e.kind].radius+ENEMIES[other.kind].radius&&this.damage(other,80*this.powerScale(),'collision'))chain++;});if(chain){this.score.multikill(chain);this.resolveFeats({chain});}}
  this.attack-=dt;
  if(this.attack<=0){this.attack=.45;let kills=0;this.nearby(p.x,p.y,130,e=>{if(Math.hypot(e.x-p.x,e.y-p.y)<95+ENEMIES[e.kind].radius&&this.damage(e,42*this.powerScale(),'claw'))kills++;});this.effect(p.x,p.y,'claw',110,.22,p.angle);if(kills){this.score.multikill(kills);this.sound('hit');}}
  if(this.beam>0){this.beam-=dt;this.beamTick-=dt;if(this.beamTick<=0){this.beamTick=.1;let kills=0;const ax=Math.cos(p.angle),ay=Math.sin(p.angle);this.nearby(p.x,p.y,720,e=>{const dx=e.x-p.x,dy=e.y-p.y,along=dx*ax+dy*ay,side=Math.abs(dx*ay-dy*ax);if(along>0&&along<680&&side<30+ENEMIES[e.kind].radius&&this.damage(e,110*this.powerScale(),'beam'))kills++;});this.score.multikill(kills);this.resolveFeats({multi:kills});}}
  for(let i=this.shots.length-1;i>=0;i--){const s=this.shots[i];s.x+=s.vx*dt;s.y+=s.vy*dt;s.life-=dt;if(Math.hypot(s.x-p.x,s.y-p.y)<28){this.hurt(s.damage);s.life=0;}if(s.life<=0)this.shots.splice(i,1);}
  for(let i=this.effects.length-1;i>=0;i--){this.effects[i].life-=dt;if(this.effects[i].life<=0)this.effects.splice(i,1);}
  this.resolveFeats({});
 }
}
