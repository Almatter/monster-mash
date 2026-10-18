import {MONSTERS,type AbilityDef} from './content-monsters.ts';
import {hagState,hagBlast,HAG} from './hag.ts';
import {scytheWave} from './reaper.ts';
import type {Enemy} from './simulation.ts';
import type {CrucibleBrain} from './crucible-combat.ts';

export const CRUCIBLE_AUGMENTS=[
 {id:'brawler',name:'Close Quarters',owner:'',cost:220,description:'Ranged basics become a melee cleave. Close basic hits build a short-lived ward, once per second.'},
 {id:'spellshot',name:'Spellforged Reach',owner:'',requiresMelee:true,cost:240,description:'Melee basics become mid-range magic bolts. Each bolt sacrifices 15% basic damage and a little attack speed for reach.'},
 {id:'bastion',name:'Retaliating Bastion',owner:'',cost:240,description:'Casting builds a ward. Taking damage releases a short-range retaliatory burst, at most once every three seconds.'},
 {id:'spellweave',name:'Arcane Cadence',owner:'',cost:240,description:'Every third basic attack that hits detonates a small arcane blast and removes one second from regular ability cooldowns.'},
 {id:'remoteFuse',name:'Witch’s Detonator',owner:'hag',cost:220,description:'While Hexes is cooling down, press it again to detonate your armed mines. The original cooldown continues.'},
 {id:'gaspockets',name:'Miasma Constellation',owner:'hag',cost:260,description:'Miasma divides into three smaller poison clouds. Ignition consumes all three together.'},
 {id:'returningGale',name:'Returning Gale',owner:'lycanthrope',cost:240,description:'Cyclone returns toward you after its outward journey, dealing half damage on the return.'},
 {id:'moonWake',name:'Bloodmoon Wake',owner:'lycanthrope',cost:240,description:'During Bloodmoon, repeated small howls damage and push nearby enemies away as you move.'},
 {id:'plagueGround',name:'Blighted Ground',owner:'overlord',cost:230,description:'Corrupted enemies leave a lingering damaging snare when they die.'},
 {id:'royalGuard',name:'Royal Bodyguard',owner:'overlord',cost:230,description:'Your summoned and converted servants form a moving defensive ring around you instead of pursuing distant prey.'},
 {id:'splitRay',name:'Prismatic Fork',owner:'calamity',cost:260,description:'Oblivion Ray gains two weaker angled side rays, covering a fan rather than a single line.'},
 {id:'starChain',name:'Starfall Aftershock',owner:'calamity',cost:250,description:'Each Starfall calls a second, smaller meteor onto the same location after a short warning.'},
 {id:'bloodRush',name:'Riftfang Wake',owner:'devourer',cost:220,description:'Every Lunge also releases a piercing claw wave from its starting position.'},
 {id:'feastPull',name:'Insatiable Maw',owner:'devourer',cost:240,description:'Devour draws surviving nearby prey inward, setting up close-range attacks. Heavy enemies resist the pull.'},
 {id:'quakeTrail',name:'Faultstep',owner:'titan',cost:240,description:'Stampede leaves short-lived fissures behind, damaging and slowing enemies who cross them.'},
 {id:'implosion',name:'World’s Grasp',owner:'titan',cost:220,description:'World Breaker draws surviving prey inward instead of throwing them away.'},
 {id:'burningRay',name:'Scorched Dominion',owner:'sovereign',cost:240,description:'Death Beam leaves lingering damaging seals around its target, creating a hazardous approach.'},
 {id:'crownflare',name:'Crownflare',owner:'sovereign',cost:220,description:'Rupture also fires three ranged magic bolts in a forward fan.'},
 {id:'returningArc',name:'Returning Harvest',owner:'reaper',cost:250,description:'Reaping crescents return toward you after their outward flight, striking again at reduced damage.'},
 {id:'graveWake',name:'Grave Echoes',owner:'reaper',cost:240,description:'Blink leaves damaging, life-siphoning soul circles at both departure and arrival.'}
] as const;
export type CrucibleAugment=typeof CRUCIBLE_AUGMENTS[number]['id'];
export const augmentsFor=(monster:string)=>CRUCIBLE_AUGMENTS.filter(a=>(!a.owner||a.owner===monster)&&(!('requiresMelee' in a)||!MONSTERS[monster].basic.ranged));
export const CRUCIBLE_BUILD_LIMITS={stats:16,augments:2};

export class CrucibleAugmentRuntime{
 brain:CrucibleBrain;basics=0;basicAt=-1;wardAt=0;counterAt=0;wakeAt=0;trail=0;trailPoint={x:0,y:0};rayAt=0;
 private pulses:{x:number;y:number;damage:number}[]=[];
 private returns=new WeakSet<object>();private echoes=new WeakSet<object>();
 constructor(brain:CrucibleBrain){this.brain=brain;}
 has(id:CrucibleAugment){return this.brain.host.teams[this.brain.team].augments.includes(id);}
 apply(){const g=this.brain,native=MONSTERS[g.identity.monsterId];g.monster=this.has('brawler')?{...native,basic:{...native.basic,name:'Close-quarters '+native.basic.name,ranged:false,radius:Math.max(140,native.basic.radius>200?140:native.basic.radius),damage:native.basic.damage*1.25}}:this.has('spellshot')?{...native,basic:{...native.basic,name:'Spellforged '+native.basic.name,ranged:true,radius:260,damage:native.basic.damage*.85,interval:native.basic.interval*1.1}}:native;g.host.teams[g.team].champion.range=this.has('brawler')?140:this.has('spellshot')?260:native.basic.ranged?(native.id==='reaper'?170:285):95;}
 detonate(power:AbilityDef){const g=this.brain,s=hagState(g);if(power.effect!=='haghex'||!this.has('remoteFuse')||!s.traps.some(t=>t.armed<=0))return false;const armed=s.traps.filter(t=>t.armed<=0);s.traps=s.traps.filter(t=>t.armed>0);for(const t of armed){hagBlast(g,t.x,t.y,t.radius,t.damage,'haghex',HAG.throwSpeed);g.effect(t.x,t.y,'hag-hit',t.radius*2,.5);}return true;}
 canReactivate(slot:number){const g=this.brain;return g.powers[slot]?.effect==='haghex'&&g.cooldowns[slot]>0&&this.has('remoteFuse')&&hagState(g).traps.some(t=>t.armed<=0);}
 afterCast(p:AbilityDef,origin:{x:number;y:number}){const g=this.brain;
  if(this.has('bastion'))g.ward(g.player.maxHp*.08,Math.max(g.shield,g.player.maxHp*.22),Math.max(g.shieldTime,4));
  if(p.effect==='haggas'&&this.has('gaspockets')&&hagState(g).clouds.length===1){const s=hagState(g),cloud=s.clouds[0],a=g.player.angle+Math.PI/2;cloud.radius*=.7;cloud.damage*=.65;cloud.igniteDamage*=.65;for(const side of [-1,1])s.clouds.push({...cloud,x:cloud.x+Math.cos(a)*cloud.radius*1.4*side,y:cloud.y+Math.sin(a)*cloud.radius*1.4*side});}
  if(p.effect==='lunge'&&this.has('bloodRush')&&g.clawWaves.length<12)g.clawWaves.push({x:origin.x,y:origin.y,angle:g.movementAngle,remaining:420,width:60,damage:70*g.powerScale(),kills:0,hit:new Set()});
  if((p.effect==='devour'&&this.has('feastPull'))||(p.effect==='shockwave'&&this.has('implosion'))){g.nearby(g.player.x,g.player.y,p.effect==='devour'?350:p.radius*g.releaseStats.radius,e=>{const dx=g.player.x-e.x,dy=g.player.y-e.y,d=Math.hypot(dx,dy)||1;if(d>350||e.kind==='titan'||e.realm?.role==='guardian')return;const force=e.kind==='elite'?200:700;e.vx=dx/d*force;e.vy=dy/d*force;});}
  if(p.effect==='charge'&&this.has('quakeTrail')){this.trail=p.duration||.7;this.trailPoint={...origin};}
  if(p.id==='rupture'&&this.has('crownflare'))for(const turn of [-.3,0,.3]){const a=g.player.angle+turn;if(g.bolts.length<80)g.bolts.push({x:g.player.x,y:g.player.y,vx:Math.cos(a)*650,vy:Math.sin(a)*650,life:.85,damage:100*g.powerScale(),source:'beam'});}
  if(p.effect==='reaperblink'&&this.has('graveWake'))for(const point of [origin,g.player])if(g.relicPulses.length<8)g.relicPulses.push({nature:'reaper',ability:'soulorbit',x:point.x,y:point.y,radius:110,damage:55,life:2.5,tick:0,delay:0,moving:false,healing:g.player.maxHp*.04});
 }
 hit(e:Enemy,actual:number,source:string,died:boolean){const g=this.brain;if(actual<=0)return;
  if(['direct','hagvenom','scythe'].includes(source)&&this.basicAt!==g.time){this.basicAt=g.time;if(this.has('brawler')&&Math.hypot(e.x-g.player.x,e.y-g.player.y)<210&&g.time>=this.wardAt){this.wardAt=g.time+1;g.ward(g.player.maxHp*.04,Math.max(g.shield,g.player.maxHp*.14),Math.max(g.shieldTime,2));}
   if(this.has('spellweave')&&++this.basics%3===0){if(this.pulses.length<16)this.pulses.push({x:e.x,y:e.y,damage:140});for(let i=0;i<3;i++)g.cooldowns[i]=Math.max(0,g.cooldowns[i]-1);}}
  if(died&&this.has('plagueGround')&&(e.corruptUntil||0)>g.time&&g.fields.length<8)g.fields.push({kind:'vortex',x:e.x,y:e.y,radius:100,life:2.5,damage:18,tick:0,kills:0});
 }
 retaliate(){const g=this.brain;if(this.has('bastion')&&g.time>=this.counterAt){this.counterAt=g.time+3;if(this.pulses.length<16)this.pulses.push({x:g.player.x,y:g.player.y,damage:120});}}
 guard(){if(!this.has('royalGuard'))return;const g=this.brain,active=g.servants.filter(s=>s.active);active.forEach((s,i)=>{const a=i/Math.max(1,active.length)*Math.PI*2+g.time*.15;s.x=g.player.x+Math.cos(a)*110;s.y=g.player.y+Math.sin(a)*110;g.slideArena(s,13);});}
 snapshot(){const g=this.brain;this.guard();return {cyclones:g.cyclones.slice(),waves:g.scytheWaves.slice(),meteors:g.fields.filter(f=>f.kind==='meteor'),beamTick:g.beamTick};}
 update(dt:number,before:ReturnType<CrucibleAugmentRuntime['snapshot']>){const g=this.brain;this.guard();
  for(const p of this.pulses.splice(0,8)){g.area(p.x,p.y,120,p.damage,'crucible-augment');g.effect(p.x,p.y,g.monster.id,180,.45);}
  if(this.has('returningGale'))for(const w of before.cyclones)if(!g.cyclones.includes(w)&&!this.returns.has(w)&&g.cyclones.length<3){const d=Math.hypot(g.player.x-w.x,g.player.y-w.y);const back={...w,angle:Math.atan2(g.player.y-w.y,g.player.x-w.x),damage:w.damage*.5,life:Math.max(.5,d/360+.2),total:Math.max(.5,d/360+.2),distance:0,range:d,scattered:new Set<number>()};this.returns.add(back);g.cyclones.push(back);}
  if(this.has('returningArc'))for(const w of before.waves)if(!g.scytheWaves.includes(w)&&!this.returns.has(w)&&g.scytheWaves.length<24){const end={x:g.player.x,y:g.player.y},old={x:g.player.x,y:g.player.y};g.player.x=w.x;g.player.y=w.y;const count=g.scytheWaves.length;scytheWave(g,Math.atan2(end.y-w.y,end.x-w.x),Math.hypot(end.x-w.x,end.y-w.y),w.width,w.damage/g.powerScale()*.4,w.source,end);Object.assign(g.player,old);if(g.scytheWaves.length>count)this.returns.add(g.scytheWaves[g.scytheWaves.length-1]);}
  if(this.has('starChain'))for(const f of before.meteors)if(!g.fields.includes(f)&&!this.echoes.has(f)&&g.fields.length<8){const echo={...f,radius:f.radius*.6,damage:f.damage*.4,life:.65,tick:0,kills:0};this.echoes.add(echo);g.fields.push(echo);}
  if(this.has('moonWake')&&g.moonFury>0&&g.time>=this.wakeAt){this.wakeAt=g.time+.8;g.area(g.player.x,g.player.y,145,55,'moonhowl',200);g.effect(g.player.x,g.player.y,'lycanthrope-howl',220,.45);}
  if(this.trail>0){this.trail-=dt;if(Math.hypot(g.player.x-this.trailPoint.x,g.player.y-this.trailPoint.y)>70){if(g.fissures.length>=3)g.fissures.shift();const a=g.movementAngle;g.fissures.push({x:this.trailPoint.x,y:this.trailPoint.y,endX:g.player.x,endY:g.player.y,angle:a,length:Math.hypot(g.player.x-this.trailPoint.x,g.player.y-this.trailPoint.y),width:50,life:3,bornAt:g.time,charge:.4,damage:45*g.powerScale(),tick:0,kills:0});this.trailPoint={x:g.player.x,y:g.player.y};}}
  if(g.beam>0&&before.beamTick<=dt){if(this.has('splitRay'))for(const turn of [-.22,.22]){const a=g.player.angle+turn,ax=Math.cos(a),ay=Math.sin(a);g.nearby(g.player.x,g.player.y,g.beamPower.radius,e=>{const dx=e.x-g.player.x,dy=e.y-g.player.y,along=dx*ax+dy*ay;if(along>0&&along<g.beamPower.radius&&Math.abs(dx*ay-dy*ax)<24)g.damage(e,g.beamPower.damage*g.powerScale()*.35,'beam');});}
   if(this.has('burningRay')&&g.time>=this.rayAt){const target=g.nearestEnemy(g.beamPower.radius);if(target&&g.fields.length<8){this.rayAt=g.time+.8;g.fields.push({kind:'vortex',x:target.x,y:target.y,radius:95,life:2,damage:25,tick:0,kills:0});}}}
 }
}
