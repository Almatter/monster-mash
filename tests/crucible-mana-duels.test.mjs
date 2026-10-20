import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Crucible,CRUCIBLE_MANA,CRUCIBLE_DUEL} from '../src/crucible-sim.ts';
import {CRUCIBLE_MAP} from '../src/crucible-layout.ts';
import {hagState} from '../src/hag.ts';
const OPEN={...CRUCIBLE_MAP,structures:[],zones:[],terrain:{sight:[],slows:[],hazards:[]}};
function setup(team=0,mode='normal'){const g=new Crucible(17,mode,OPEN);for(const u of g.units)u.active=false;for(const t of g.teams){t.wave=t.plan=t.respawnAt=1e9;t.trapReady=[1e9,1e9,1e9];}g.controlled=team;Object.assign(g.teams[team].champion,{active:true,x:2400,y:2400,invuln:0,power:0,ultimate:0,cooldowns:[0,0,0,0]});g.rebuild();return g;}

test('all champions receive a one-time opening wallet, enough for their full kit, without false earned mana',()=>{
 const g=setup();for(let i=0;i<8;i++){assert.equal(g.teams[i].mana,180);assert.equal(g.teams[i].earnedMana,0);assert.ok([0,1,2,3].reduce((n,slot)=>n+g.abilityCost(i,slot),0)<=CRUCIBLE_MANA.starting);}
});
test('player and direct NPC cast paths pay once for successful casts and nothing for failed or unaffordable casts',()=>{
 for(const controlled of [0,-1]){const g=setup();g.controlled=controlled;const t=g.teams[0],b=g.combat.actors[0].brain,cost=g.abilityCost(0,0),before=t.mana;assert.ok(g.cast(0,0));assert.equal(t.mana,before-cost);assert.equal(g.cast(0,0),false);assert.equal(t.mana,before-cost);
  t.champion.power=0;t.champion.cooldowns[0]=0;assert.equal(g.cast(0,0,{x:NaN,y:0}),false);assert.equal(t.mana,before-cost);t.mana=cost-1;const traps=hagState(b).traps.length;assert.equal(g.cast(0,0),false);assert.equal(hagState(b).traps.length,traps);assert.equal(t.champion.power,0);assert.equal(t.mana,cost-1);assert.match(b.notice,/MANA LOW/);assert.equal(t.earnedMana,0);
 }
});
test('Miasma ignition has its own discounted cost, cannot fire while broke, and preserves its original cooldown',()=>{
 const g=setup(),t=g.teams[0],b=g.combat.actors[0].brain,cost=g.abilityCost(0,1);assert.ok(g.cast(0,1));const cooldown=t.champion.cooldowns[1],ignite=g.abilityCost(0,1);assert.equal(ignite,Math.ceil(cost*.3));t.mana=ignite-1;assert.equal(g.cast(0,1),false);assert.equal(hagState(b).clouds.length,1);t.mana=ignite;assert.ok(g.cast(0,1));assert.equal(t.mana,0);assert.equal(hagState(b).clouds.length,0);assert.equal(t.champion.cooldowns[1],cooldown);
});
test('remote mine detonation charges a discounted follow-up without restarting the cooldown',()=>{
 const g=setup(),t=g.teams[0],b=g.combat.actors[0].brain;t.augments=['remoteFuse'];t.mana=1000;assert.ok(g.cast(0,0));for(const trap of hagState(b).traps)trap.armed=0;const cost=g.abilityCost(0,0),before=t.mana,cool=t.champion.power;assert.ok(g.cast(0,0));assert.equal(t.mana,before-cost);assert.equal(t.champion.power,cool);assert.equal(hagState(b).traps.length,0);
});
test('late-game spell costs exceed a normal six-minion wave reward and compete with purchases',()=>{
 const g=setup(4),t=g.teams[4];Object.assign(t.upgrades,{might:5,haste:5,vitality:5,armor:1});t.augments=['bastion','bloodRush'];assert.equal(g.abilityCost(4,1),96);assert.ok(g.abilityCost(4,1)>6*8);assert.ok(g.abilityCost(4,0)<g.abilityCost(4,1));assert.ok(g.abilityCost(4,3)>g.abilityCost(4,1));
 const early=setup(),e=early.teams[0];e.mana=100;e.crystal.active=true;Object.assign(e.champion,{x:e.crystal.x,y:e.crystal.y});assert.equal(early.shopReason(0,'might'),'');assert.ok(early.cast(0,0));assert.equal(early.shopReason(0,'might'),'Not enough mana');assert.equal(e.earnedMana,0);
});
test('each available Lunge charge costs mana; a failed fourth dash is free',()=>{
 const g=setup(4),t=g.teams[4],cost=g.abilityCost(4,0);for(let i=0;i<3;i++)assert.ok(g.cast(4,0));assert.equal(t.mana,180-cost*3);const before=t.mana;assert.equal(g.cast(4,0),false);assert.equal(t.mana,before);
});
test('basic attacks still work with an empty wallet, and passive mana is not an ability subsidy',()=>{
 const g=setup(3),t=g.teams[3],u=t.champion,v=g.teams[1].champion;t.mana=0;Object.assign(v,{active:true,x:2500,y:2400,invuln:0});g.rebuild();const hp=v.hp;for(let i=0;i<30;i++)g.step(1/30);assert.ok(v.hp<hp);assert.ok(t.mana<2);assert.equal(u.power,0);assert.equal(u.ultimate,0);
});
test('opening burst protection stays at half health on every champion and difficulty, including focused attacks by several rivals',()=>{
 for(const mode of ['easy','normal','hard','hell'])for(let team=0;team<8;team++){const g=setup(team,mode),t=g.teams[team],u=t.champion;for(const other of g.teams)if(other!==t)Object.assign(other.champion,{active:true,x:u.x+80,y:u.y});g.rebuild();
  for(let n=0;n<24;n++){u.invuln=0;const source=g.teams[(team+1+n%7)%8].champion;g.damage(u,1e6,source.team,false,false,source);}
  assert.ok(u.hp>=u.maxHp*.5-.001,mode+' '+t.monster);assert.ok(u.active);assert.ok(t.duel.reduce((sum,hit)=>sum+hit.fraction,0)<=CRUCIBLE_DUEL.burstCap+1e-8);
 }
});
test('an exposed champion can die to a sustained focused attack after its opening reaction window',()=>{
 const g=setup(1),u=g.teams[1].champion,source=g.teams[3].champion;Object.assign(source,{active:true,x:u.x+100,y:u.y});g.rebuild();for(let n=0;n<20&&u.active;n++){g.time=n*.4;u.invuln=0;g.damage(u,1000,3,false,false,source);if(g.time<3)assert.ok(u.hp>=u.maxHp*.5-.001);}assert.equal(u.active,false);assert.ok(g.time>=3&&g.time<8);
});

test('NPC direct casts cannot ignite or detonate through control locks and pay nothing while blocked',()=>{
 const g=setup(),t=g.teams[0],b=g.combat.actors[0].brain;g.controlled=-1;assert.ok(g.cast(0,1));const before=t.mana;for(const key of ['stun','fear','grabbed']){t.champion[key]=key==='grabbed'?true:2;assert.equal(b.cast(1),false);assert.equal(t.mana,before);assert.equal(hagState(b).clouds.length,1);t.champion[key]=key==='grabbed'?false:0;}
});
