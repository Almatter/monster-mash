import type {Game,Enemy} from './simulation.ts';
import type {AbilityDef} from './content-monsters.ts';
import {ENEMIES} from './data.ts';

export const HAG={maxTraps:48,maxVenom:720,poisonSeconds:4,poisonTick:.5,poisonDamage:14,trapSpacing:88,triggerRadius:35,blastScale:1.65,throwSpeed:950,webPulse:.45,flightSpacing:100,igniteScale:5,giantStun:.35,giantStunCooldown:3,placementSearch:240,placementStep:12};
type Venom={enemy:Enemy;serial:number;remaining:number;tick:number;damage:number};
export type HexTrap={x:number;y:number;radius:number;remaining:number;armed:number;damage:number;trigger:number};
type Cloud={x:number;y:number;radius:number;remaining:number;total:number;tick:number;damage:number;ticksLeft:number;igniteDamage:number};
export type HagState={flight:number;frenzy:number;pulse:number;unmasked:boolean;webRing:number;placementNoticeAt:number;landing:{x:number;y:number};trail:{x:number;y:number};traps:HexTrap[];clouds:Cloud[];venom:Venom[];venomIndex:WeakMap<Enemy,Venom>;shieldBudget:number;shieldReset:number};
const states=new WeakMap<Game,HagState>();
export function hagState(g:Game){let s=states.get(g);if(!s){s={flight:0,frenzy:0,pulse:0,unmasked:false,webRing:0,placementNoticeAt:-10,landing:{x:g.player.x,y:g.player.y},trail:{x:g.player.x,y:g.player.y},traps:[],clouds:[],venom:[],venomIndex:new WeakMap(),shieldBudget:0,shieldReset:0};states.set(g,s);}return s;}
export function hagUnmasked(g:Game){const s=states.get(g);return !!s&&(s.frenzy>0||s.unmasked&&g.shield<=0);}
export function hagContactImmune(g:Game){return (states.get(g)?.flight||0)>0;}
export function hagFieldFull(g:Game){return (states.get(g)?.traps.length||0)>=HAG.maxTraps;}
// Glamour and true-form healing share a recovery budget, including overlapping spells.
export function hagGlamour(g:Game,amount:number){
 if(g.identity.monsterId!=='hag')return;const s=hagState(g);
 if(g.time>=s.shieldReset){s.shieldReset=g.time+1;s.shieldBudget=g.player.maxHp*.06;}
 const gain=Math.min(amount,s.shieldBudget);s.shieldBudget-=gain;
 if(gain>0){if(s.frenzy>0)g.heal(gain);else{g.ward(gain,g.player.maxHp*(.2+.025*g.release),8);if(g.shield>0)s.unmasked=false;}}
}
export function hagVenom(g:Game,e:Enemy){
 if(!e.active||e.hp<=0)return;const s=hagState(g),cached=s.venomIndex.get(e),existing=cached?.serial===e.serial?cached:undefined;
 e.snaredUntil=Math.max(e.snaredUntil||0,g.time+HAG.poisonSeconds);
 if(existing){existing.remaining=HAG.poisonSeconds;return;}
 if(s.venom.length<HAG.maxVenom){const venom={enemy:e,serial:e.serial,remaining:HAG.poisonSeconds,tick:0,damage:HAG.poisonDamage*g.powerScale()};s.venom.push(venom);s.venomIndex.set(e,venom);}
 hagGlamour(g,7);
}
export function hagHit(g:Game,e:Enemy,source:string){
 if(source==='hagpoison'||source.startsWith('army')||source==='collision')return;
 if(g.identity.monsterId==='hag'||source.startsWith('hag'))hagVenom(g,e);
}
export function hagKill(g:Game,source:string){if(g.identity.monsterId==='hag'&&!source.startsWith('army')&&source!=='collision')hagGlamour(g,8);}
export const hagHexCount=(g:Game)=>6+3*Math.max(0,Math.min(4,Math.floor(g.release)));
export function hagHexPoints(g:Game,p:AbilityDef,point?:{x:number;y:number}){
 const angle=point?Math.atan2(point.y-g.player.y,point.x-g.player.x):g.player.angle,forward={x:Math.cos(angle),y:Math.sin(angle)},origin=point||{x:g.player.x+forward.x*225,y:g.player.y+forward.y*225},spacing=Math.max(110,p.radius*.9),points:{x:number;y:number}[]=[];
 for(let i=0,rows=hagHexCount(g)/3;i<rows;i++)for(const column of [-1,0,1]){const row=i-(rows-1)/2;points.push({x:origin.x+forward.x*row*spacing-forward.y*column*spacing,y:origin.y+forward.y*row*spacing+forward.x*column*spacing});}
 return points;
}
type Point={x:number;y:number};
const placementOffsets:Point[]=[];
for(let x=-HAG.placementSearch;x<=HAG.placementSearch;x+=HAG.placementStep)for(let y=-HAG.placementSearch;y<=HAG.placementSearch;y+=HAG.placementStep)if(x*x+y*y<=HAG.placementSearch**2&&x*x+y*y>0)placementOffsets.push({x,y});
placementOffsets.sort((a,b)=>a.x*a.x+a.y*a.y-b.x*b.x-b.y*b.y||Math.atan2(a.y,a.x)-Math.atan2(b.y,b.x));
// Use the current simulation's floor and object collision, including editor overrides.
export function hagBombWalkable(g:Game,x:number,y:number){
 if(!Number.isFinite(x)||!Number.isFinite(y)||!g.insideMap(x,y))return false;
 for(let i=0;i<8;i++){const a=i*Math.PI/4;if(!g.insideMap(x+Math.cos(a)*24,y+Math.sin(a)*24))return false;}
 const probe={x,y};g.slideArena(probe,24);return Math.hypot(probe.x-x,probe.y-y)<.1;
}
export function hagResolveBomb(g:Game,x:number,y:number,occupied:Point[]=hagState(g).traps){
 if(occupied.length>=HAG.maxTraps)return null;
 const available=(x:number,y:number)=>!occupied.some(t=>Math.abs(t.x-x)<HAG.trapSpacing&&Math.abs(t.y-y)<HAG.trapSpacing&&(t.x-x)**2+(t.y-y)**2<HAG.trapSpacing**2)&&hagBombWalkable(g,x,y);
 if(available(x,y))return {x,y};
 for(const offset of placementOffsets){const p={x:x+offset.x,y:y+offset.y};if(available(p.x,p.y))return p;}
 return null;
}
export function hagHexPlacement(g:Game,p:AbilityDef,point?:Point){
 const desired=hagHexPoints(g,p,point),points:Point[]=[],occupied:Point[]=[...hagState(g).traps];
 for(const q of desired){const resolved=hagResolveBomb(g,q.x,q.y,occupied);if(resolved){points.push(resolved);occupied.push(resolved);}}
 return {desired,points};
}
function placeTrap(g:Game,x:number,y:number,radius:number,damage:number,seconds:number){
 const s=hagState(g),point=hagResolveBomb(g,x,y);if(!point)return false;
 s.traps.push({...point,radius,damage,remaining:seconds,armed:.35,trigger:HAG.triggerRadius});return true;
}
// Three predictable lanes gain one row per Unbinding; existing mines are preserved.
export function castHexes(g:Game,p:AbilityDef){
 const {points}=hagHexPlacement(g,p,g.targetPoint||undefined),origin=g.targetPoint||points[2]||g.player;
 for(const {x,y} of points)placeTrap(g,x,y,p.radius*HAG.blastScale,p.damage,p.duration||14);
 g.effect(origin.x,origin.y,'hag-frenzy',220,.6);
}
export function castMiasma(g:Game,p:AbilityDef){
 const s=hagState(g);
 if(s.clouds.length){let kills=0;for(const cloud of s.clouds){kills+=hagBlast(g,cloud.x,cloud.y,cloud.radius,cloud.igniteDamage,'hagignite',250,false);g.effect(cloud.x,cloud.y,'hag-ignite',cloud.radius*1.3,.75);}s.clouds=[];g.completeAttack(kills,{},'hagignite');hagGlamour(g,10+kills*8);return;}
 const target=g.nearestEnemy(450),origin=g.targetPoint||target||g.player,duration=p.duration||6,ticks=Math.ceil(duration/HAG.poisonTick);
 const fullDamage=p.damage*ticks+HAG.poisonDamage*(ticks+Math.ceil(HAG.poisonSeconds/HAG.poisonTick));
 s.clouds.push({x:origin.x,y:origin.y,radius:p.radius,remaining:duration,total:duration,tick:0,damage:p.damage,ticksLeft:ticks,igniteDamage:fullDamage*HAG.igniteScale});
}
export function castFlight(g:Game,p:AbilityDef){const s=hagState(g);s.flight=p.duration||5;s.landing={x:g.player.x,y:g.player.y};s.trail={x:g.player.x,y:g.player.y};g.hostilePush=null;g.effect(g.player.x,g.player.y,'hag-flight',180,.65);}
function web(g:Game){
 const s=hagState(g),rings=Math.min(4,++s.webRing);let placed=0;
 // Fill holes in inner rings, then extend outward. Replacements must arm again.
 for(let ring=0;ring<rings;ring++){const count=6+ring*4,radius=115+ring*120;
  for(let i=0;i<count&&placed<10;i++){const angle=i/count*Math.PI*2+(ring%2?Math.PI/count:0),x=g.player.x+Math.cos(angle)*radius,y=g.player.y+Math.sin(angle)*radius;if(s.traps.some(t=>Math.hypot(t.x-x,t.y-y)<HAG.trapSpacing*.75))continue;if(placeTrap(g,x,y,155*g.releaseStats.radius,ring===0?260:190,10))placed++;}
 }
}
export function castUnmasked(g:Game,p:AbilityDef){const s=hagState(g);s.frenzy=p.duration||9;s.unmasked=true;s.webRing=0;s.pulse=HAG.webPulse;g.shield=0;g.shieldTime=0;g.effect(g.player.x,g.player.y,'hag-frenzy',p.radius,.8);web(g);}
// Giants trade launch for a brief stagger. Immunity prevents minefields from stun-locking them.
export function hagBlast(g:Game,x:number,y:number,radius:number,damage:number,source:string,force:number,settle=true){
 const kills=g.area(x,y,radius,damage,source,0,settle);
 g.nearby(x,y,radius+65,e=>{
  const d=Math.hypot(e.x-x,e.y-y);if(!e.active||d>radius+ENEMIES[e.kind].radius)return;
  const actor=g.war?.actors.get(e.serial),giant=e.kind==='titan'||!!e.colossus||e.realm?.role==='boss'||e.mimic?.brain?.monster.id==='titan'||actor?.role==='sentry'||actor?.role==='champion'&&g.war?.leaders[actor.team].monsterId==='titan';
  if(giant){if(g.time>=(e.staggerReadyAt||0)){e.staggerUntil=g.time+HAG.giantStun;e.staggerReadyAt=g.time+HAG.giantStunCooldown;}return;}
  const medium=e.kind==='brute'||e.kind==='elite'||e.court?.role==='captain'||e.realm?.role==='guardian',weight=medium?(g.release>=4?.35:g.release>=3?.2:0):1;
  if(!weight)return;const angle=d<1?g.player.angle:Math.atan2(e.y-y,e.x-x);e.vx=Math.cos(angle)*force*g.releaseStats.knockback*weight;e.vy=Math.sin(angle)*force*g.releaseStats.knockback*weight;
 });return kills;
}
function explode(g:Game,t:HexTrap){
 const kills=hagBlast(g,t.x,t.y,t.radius,t.damage,'haghex',HAG.throwSpeed);
 hagGlamour(g,10+kills*8);g.effect(t.x,t.y,'hag-hit',t.radius*2,.6);
}
export function hagIntercept(g:Game,from:{x:number;y:number},to:{x:number;y:number}){
 const s=states.get(g);if(!s?.traps.length)return false;const dx=to.x-from.x,dy=to.y-from.y,length=dx*dx+dy*dy;
 for(let i=s.traps.length-1;i>=0;i--){const t=s.traps[i];if(t.armed>0)continue;const q=Math.max(0,Math.min(1,((t.x-from.x)*dx+(t.y-from.y)*dy)/(length||1)));if(Math.hypot(t.x-from.x-dx*q,t.y-from.y-dy*q)<t.trigger){s.traps.splice(i,1);explode(g,t);return true;}}
 return false;
}
export function updateHag(g:Game,dt:number){
 const s=states.get(g);if(!s)return;const wasFlying=s.flight>0;s.flight=Math.max(0,s.flight-dt);s.frenzy=Math.max(0,s.frenzy-dt);
 if(s.flight>0){
  if(hagBombWalkable(g,g.player.x,g.player.y))s.landing={x:g.player.x,y:g.player.y};
  const dx=g.player.x-s.trail.x,dy=g.player.y-s.trail.y,d=Math.hypot(dx,dy),steps=Math.min(8,Math.floor(d/HAG.flightSpacing));
  for(let i=1;i<=steps;i++)if(!placeTrap(g,s.trail.x+dx/d*i*HAG.flightSpacing,s.trail.y+dy/d*i*HAG.flightSpacing,130*g.releaseStats.radius,220,12)&&g.time-s.placementNoticeAt>=2){s.placementNoticeAt=g.time;g.notice=hagFieldFull(g)?'HEX FIELD FULL · TRIGGER BOMBS TO MAKE ROOM':'NO WALKABLE SPACE NEARBY FOR A BOMB';g.noticeTime=2;}
  if(steps)s.trail={x:g.player.x,y:g.player.y};
 }else if(wasFlying&&!hagBombWalkable(g,g.player.x,g.player.y)){g.player.x=s.landing.x;g.player.y=s.landing.y;}
 if(s.frenzy>0){g.shield=0;g.shieldTime=0;s.pulse-=dt;if(s.pulse<=0){s.pulse+=HAG.webPulse;web(g);}}else if(g.shield>0)s.unmasked=false;
 for(let i=s.traps.length-1;i>=0;i--){
  const t=s.traps[i],visible=Math.abs(t.x-g.player.x)<=g.targetView.x+t.trigger&&Math.abs(t.y-g.player.y)<=g.targetView.y+t.trigger;
  if(!visible)t.remaining-=dt;t.armed-=dt;let trigger=false;
  if(t.armed<=0){g.nearby(t.x,t.y,t.trigger+65,e=>{if(Math.hypot(e.x-t.x,e.y-t.y)<t.trigger+ENEMIES[e.kind].radius)trigger=true;});
   // Hostile projectiles hitting the bomb also detonate it.
   if(!trigger)for(const shot of g.shots){if(shot.life<=0)continue;const dx=shot.vx*dt,dy=shot.vy*dt,length=dx*dx+dy*dy,q=Math.max(0,Math.min(1,((t.x-shot.x)*dx+(t.y-shot.y)*dy)/(length||1)));if(Math.hypot(t.x-shot.x-dx*q,t.y-shot.y-dy*q)<t.trigger){trigger=true;shot.life=0;break;}}
  }
  if(trigger||t.remaining<=0){s.traps.splice(i,1);if(trigger)explode(g,t);}
 }
 for(let i=s.clouds.length-1;i>=0;i--){const t=s.clouds[i];t.remaining-=dt;t.tick-=dt;
  while(t.tick<=0&&t.ticksLeft>0){t.tick+=HAG.poisonTick;t.ticksLeft--;const kills=g.area(t.x,t.y,t.radius,t.damage,'haggas');hagGlamour(g,kills*8+3);}
  if(t.remaining<=0)s.clouds.splice(i,1);
 }
 for(let i=s.venom.length-1;i>=0;i--){const v=s.venom[i];v.remaining-=dt;v.tick-=dt;
  if(v.enemy.active&&v.enemy.serial===v.serial&&v.tick<=0){v.tick+=HAG.poisonTick;v.enemy.snaredUntil=Math.max(v.enemy.snaredUntil||0,g.time+Math.max(0,v.remaining));if(g.damage(v.enemy,v.damage,'hagpoison')){g.completeAttack(1,{},'hagpoison');hagGlamour(g,10);}}
  if(v.remaining<=0||!v.enemy.active||v.enemy.serial!==v.serial){s.venom.splice(i,1);if(s.venomIndex.get(v.enemy)===v)s.venomIndex.delete(v.enemy);}
 }
}
export function hagAnimation(g:Game,time:number,state:string){
 if(g.monster.id!=='hag')return {time,state};const s=hagState(g),unmasked=hagUnmasked(g);
 if(s.flight>0&&unmasked)return {state:'unmaskedFlight',time};
 if(s.flight>0||unmasked)return {state:'ultimate',time:((unmasked?0:3)+Math.floor(time*6)%3)/g.monster.visual.states.ultimate.fps};
 return {time,state:state==='ultimate'?'attack':state};
}
