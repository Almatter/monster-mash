import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Crucible,CRUCIBLE_SHOP} from '../src/crucible-sim.ts';
import {CRUCIBLE_MAP} from '../src/crucible-layout.ts';
import {harvestLife} from '../src/reaper.ts';
const map={...CRUCIBLE_MAP,structures:[],zones:[],terrain:{sight:[],slows:[],hazards:[]}};
function fixture(monster='sovereign'){
 const g=new Crucible(17,'hell',map),a=g.teams.findIndex(t=>t.monster==='devourer'),d=g.teams.findIndex(t=>t.monster===monster),attacker=g.teams[a],defender=g.teams[d],u=attacker.champion,v=defender.champion;
 for(const unit of g.units)unit.active=false;
 for(const t of g.teams){t.wave=t.respawnAt=t.shopAt=1e9;t.trapReady=[1e9,1e9,1e9];}
 g.controlled=a;
 Object.assign(u,{active:true,x:2400,y:2400,invuln:0,attack:0,power:1e9,ultimate:1e9,cooldowns:[1e9,1e9,1e9,1e9]});
 Object.assign(v,{active:true,x:2460,y:2400,invuln:0,stun:1e9});
 g.rebuild();g.intel.update(true);g.combat.sync(a);g.combat.sync(d);
 return {g,a,d,attacker,defender,u,v,b:g.combat.actors[d].brain};
}
function nativeHit(f,raw=10,source='direct'){
 f.g.combat.prepare(f.a);const brain=f.g.combat.actors[f.a].brain;
 brain.damage(brain.enemies.find(e=>e.serial===f.v.id),raw,source);
}
function wound(f,rank=3){f.attacker.upgrades.blight=rank;nativeHit(f);}
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-6,`${a} != ${b}`);

test('Withering Strikes is a capped shop stat with normal purchase, sell and rank-budget rules',()=>{
 const f=fixture();f.attacker.crystal.active=true;Object.assign(f.u,{x:f.attacker.crystal.x,y:f.attacker.crystal.y});f.attacker.mana=10000;
 for(let n=0;n<3;n++)assert.equal(f.g.purchase(f.a,'blight'),true);
 assert.equal(f.g.purchase(f.a,'blight'),false);assert.equal(f.g.statRanks(f.a),3);
 const before=f.attacker.mana;assert.equal(f.g.sell(f.a,'blight'),true);
 assert.equal(f.attacker.mana-before,Math.floor((CRUCIBLE_SHOP.blight.cost+2*CRUCIBLE_SHOP.blight.step)*.8));
});
test('real basic hits apply wounds; native healing and Reaper life steal are reduced once',()=>{
 for(const monster of ['sovereign','reaper']){
  const f=fixture(monster);wound(f);f.v.hp=f.b.player.hp=f.v.maxHp*.5;
  const before=f.v.hp;
  if(monster==='reaper'){f.b.soulBudget=1000;f.b.soulWindow=100;harvestLife(f.b,200,.5);near(f.v.hp-before,55);}
  else{f.b.heal(200);near(f.v.hp-before,110);}
 }
});
test('ability hits and hits absorbed by shields also wound; dodged and respawn-protected hits do not',()=>{
 for(const source of ['direct','ultimate']){const f=fixture();f.b.shield=500;f.b.shieldTime=10;f.attacker.upgrades.blight=3;nativeHit(f,10,source);near(f.g.healingScale(f.d),.55);}
 for(const type of ['respawn','dodge']){const f=fixture();f.attacker.upgrades.blight=3;if(type==='respawn')f.v.invuln=3;else f.b.dodgeInvuln=1;nativeHit(f);near(f.g.healingScale(f.d),1);}
});
test('wounds reduce new wards without stripping the existing shield or its capacity',()=>{
 const f=fixture();wound(f);f.b.shield=200;f.b.shieldTime=8;
 f.b.ward(100,1000,8);near(f.b.shield,255);
});
test('Titan moving barrier recovery uses the same wound reduction',()=>{
 const f=fixture('titan');wound(f);near(f.b.wardRecoveryScale,.55);f.g.time=4.1;near(f.b.wardRecoveryScale,1);
});
test('strongest wound wins, weak attackers cannot extend it, and continued hits refresh their own wound',()=>{
 const f=fixture();wound(f,3);const other=f.g.teams.findIndex((_,i)=>i!==f.a&&i!==f.d);f.g.teams[other].upgrades.blight=1;
 f.g.time=3;f.g.wound(f.d,other);near(f.g.healingScale(f.d),.55);
 f.g.time=4.1;near(f.g.healingScale(f.d),.85);
 nativeHit(f);near(f.g.healingScale(f.d),.55);
 f.g.time=8.2;near(f.g.healingScale(f.d),1);
});
test('Spoils of War direct-kill recovery and purchased Mend obey wounds',()=>{
 for(const mechanism of ['spoils','mend']){const f=fixture();wound(f);f.v.hp=f.b.player.hp=f.v.maxHp*.2;const before=f.v.hp;
  if(mechanism==='spoils'){
   f.defender.upgrades.glamour=3;const mob=f.g.units.find(u=>u.team===f.a&&u.kind==='infantry');Object.assign(mob,{active:true,hp:1,invuln:0});
   f.g.damage(mob,10,f.d,false,false,f.v);near(f.v.hp-before,f.v.maxHp*.09*.55);
  }else{
   f.defender.crystal.active=true;Object.assign(f.v,{x:f.defender.crystal.x,y:f.defender.crystal.y});f.defender.mana=1000;
   assert.equal(f.g.purchase(f.d,'mend'),true);near(f.v.hp-before,f.v.maxHp*.35*.55);
  }
 }
});
test('wounds clear on recall without reducing full-health respawns or their protection',()=>{
 const f=fixture();wound(f);f.v.active=false;f.defender.crystal.active=true;f.defender.respawnAt=0;f.g.step(.01);
 near(f.g.healingScale(f.d),1);near(f.v.hp,f.v.maxHp);assert.ok(f.v.invuln>2.9);
});
test('native faster basics produce more sustained damage instead of falling into hit immunity',()=>{
 const damage=[];
 for(const tempo of [0,3]){const f=fixture();f.v.maxHp=f.v.hp=100000;f.attacker.upgrades.tempo=tempo;
  for(let n=0;n<600;n++)f.g.step(1/60);damage.push(100000-f.v.hp);
 }
 assert.ok(damage[1]>damage[0]*1.25,JSON.stringify(damage));
});
test('Might improves both uncapped and large capped hits while Vitality counters ordinary damage scaling',()=>{
 const hits=[];
 for(const might of [0,5]){const f=fixture();f.attacker.upgrades.might=might;hits.push(f.g.damage(f.v,1e6,f.a,false,false,f.u));}
 near(hits[1]/hits[0],1.6);
 const fractions=[];
 for(const rank of [0,5]){const f=fixture();f.attacker.upgrades.might=rank;f.v.maxHp=f.v.hp=f.v.maxHp*(1+rank*.12);const amount=f.g.damage(f.v,100,f.a,false,false,f.u);fractions.push(amount/f.v.maxHp);}
 near(fractions[0],fractions[1]);
});
test('four-ability bursts remain limited to half health; native basics keep working after the spell budget',()=>{
 const f=fixture();f.attacker.upgrades.might=5;
 for(let n=0;n<4;n++)f.g.damage(f.v,1e6,f.a,false,false,f.u);
 near(f.v.hp,f.v.maxHp*.5);const before=f.v.hp;
 nativeHit(f,100);assert.ok(f.v.hp<before);
 const after=f.v.hp;f.g.damage(f.v,1e6,f.a,false,false,f.u);near(f.v.hp,after);
});
test('ordinary hits create no free immunity, while deliberate invulnerability and native dodges remain',()=>{
 const f=fixture();f.g.damage(f.v,10,f.a,false,false,f.u);near(f.v.invuln,0);
 const before=f.v.hp;f.g.damage(f.v,10,f.a,false,false,f.u);assert.ok(f.v.hp<before);
 f.v.invuln=1;const protectedHp=f.v.hp;f.g.damage(f.v,10,f.a,false,false,f.u);near(f.v.hp,protectedHp);
 f.v.invuln=0;f.b.dodgeInvuln=1;f.g.damage(f.v,10,f.a,false,false,f.u);near(f.v.hp,protectedHp);
});
