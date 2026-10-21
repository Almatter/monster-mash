import {CRUCIBLE_SIEGE,type Crucible,type CrucibleUnit} from './crucible-sim.ts';

// A short, local finishing calculation, not permission to ignore siege defenses.
// Count basics, affordable direct impacts and a short, discounted beam window.
// Traps, summons, healing, damage-over-time and perfect multi-hit combos are not
// guaranteed against a structure, so they do not finance a suicide commitment.
export function crystalDive(h:Crucible,team:number){
 const t=h.teams[team],u=t.champion;
 if(h.difficulty!=='hell'||h.controlled===team||!u.active||!t.crystal.active||u.grabbed||u.stun>0||u.fear>0)return undefined;
 const b=h.combat.actors[team].brain,s=b.releaseStats,rules=h.difficultyRules;
 const speed=Math.max(1,b.monster.speed*s.move*(u.slow>0?.45:1));
 const focus=h.combat.attention.states[team];
 const notice=focus.visible&&focus.readyAt<=h.time&&focus.dive===focus.focus?0:rules.noticeMin+rules.noticeSpread,pace=rules.castMin+rules.castSpread;
 let best:{target:CrucibleUnit;finishIn:number;dieIn:number}|undefined;
 for(const enemy of h.teams){
  const c=enemy.crystal,d=Math.hypot(c.x-u.x,c.y-u.y);
  if(enemy===t||enemy.eliminated||enemy.champion.active||!c.active||enemy.respawnAt<=h.time||d>600||!h.combat.attention.inView(team,c)||!h.terrain.lineVisible(u,c))continue;
  // Standing close enough for the native basic also puts ranged champions inside
  // the crystal domain; targeting from outside that domain still does zero damage.
  const reach=Math.min(h.baseDomain(c.team)*.85,u.range*.8,b.monster.basic.radius*s.radius*.8),travel=Math.max(0,d-reach)/speed;
  const remaining=enemy.respawnAt-h.time-.5;
  const supported=h.siegeSupport(team,c.team)>=h.siegeRequired();
  const unsupported=!supported&&enemy.breaches[team]<=h.time+travel;
  const scale=.45*(h.guards(c.team)? .18:1)*(unsupported?CRUCIBLE_SIEGE.soloCrystalScale:1);
  const hit=(raw:number)=>Math.min(raw*b.powerScale()*b.damageScale*(1+t.upgrades.might*.12)*scale,unsupported?c.maxHp*CRUCIBLE_SIEGE.soloStructureCap:Infinity);
  // A breach must last through the predicted finish, otherwise price the attack
  // at unsupported strength on the next evaluation instead of extending it free.
  const interval=b.monster.basic.interval*s.attack*(b.frenzy>0?.5:1);
  const first=notice+travel+Math.max(0,u.attack)+(b.monster.basic.ranged?reach/800:0);
  const attacks:{at:number;damage:number}[]=[];
  for(let i=0;i<40;i++){const at=first+i*interval;if(at>Math.min(remaining,12))break;attacks.push({at,damage:hit(b.monster.basic.damage)});}
  let mana=t.mana,castAt=notice+travel+Math.max(0,h.combat.actors[team].nextCast-h.time);
  for(let i=0;i<4;i++){
   const slot=(h.combat.actors[team].slot+i)%4,p=b.powers[slot],cost=h.abilityCost(team,slot);
   if(u.cooldowns[slot]>0||!['blast','shockwave','devour','wolfhowl','reapersweep','beam'].includes(p.effect)||p.radius*s.radius<reach||mana<cost)continue;
   mana-=cost;
   if(p.effect==='beam'){for(let tick=0;tick<10;tick++)attacks.push({at:castAt+tick*.08,damage:hit(p.damage)*.6});}
   else attacks.push({at:castAt,damage:hit(p.damage)*.7});
   castAt+=pace;
  }
  attacks.sort((a,b)=>a.at-b.at);let damage=0,finishIn=Infinity;
  for(const attack of attacks){damage+=attack.damage;if(damage>=c.hp){finishIn=attack.at;break;}}
  if(finishIn>remaining||!supported&&!unsupported&&enemy.breaches[team]<h.time+finishIn)continue;
  // Budget real base shots, including guardians and current shot timers. Ignore
  // future healing/invulnerability: accepting death is fine, dying before the
  // crystal breaks is not. Extra nearby enemies make this a worse trade.
  const incoming:{at:number;damage:number}[]=[];
  for(const defense of [c,...enemy.guards])if(defense.active){
   const entry=Math.max(0,d-h.baseDomain(c.team))/speed;
   const raw=Math.max(defense.damage,t.baseHp*CRUCIBLE_SIEGE.defenseHit)*(1-.08*t.upgrades.armor)*b.monster.armor;
   for(let i=0;i<20;i++)incoming.push({at:Math.max(entry,Math.max(0,defense.attack))+i*defense.interval,damage:raw});
  }
  for(const v of h.units)if(v.active&&v.team!==team&&!['captain','crystal'].includes(v.kind)&&Math.hypot(v.x-c.x,v.y-c.y)<250&&h.intel.visible(team,v)){
   for(let i=0;i<12;i++)incoming.push({at:travel+Math.max(0,v.attack)+i*Math.max(.3,v.interval),damage:v.damage*(v.kind==='champion'?.42:1)*(1-.08*t.upgrades.armor)});
  }
  incoming.sort((a,b)=>a.at-b.at);let health=u.hp+Math.max(0,b.shield),dieIn=Infinity;
  for(const attack of incoming){health-=attack.damage;if(health<=0){dieIn=attack.at;break;}}
  if(finishIn+.15>=dieIn)continue;
  if(!best||finishIn<best.finishIn)best={target:c,finishIn,dieIn};
 }
 return best;
}
