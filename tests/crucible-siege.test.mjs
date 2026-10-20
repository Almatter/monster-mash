import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Crucible,CRUCIBLE_SIEGE} from '../src/crucible-sim.ts';
import {CRUCIBLE_MAP} from '../src/crucible-layout.ts';
import {releasedPower,releaseStats} from '../src/unbound.ts';
import {Game} from '../src/simulation.ts';
const OPEN={...CRUCIBLE_MAP,structures:[],zones:[],terrain:{sight:[],slows:[],hazards:[]}};
function quiet(mode='normal'){const g=new Crucible(17,mode,OPEN);for(const u of g.units)u.active=false;for(const t of g.teams){t.wave=t.plan=t.respawnAt=1e9;t.trapReady=[1e9,1e9,1e9];}return g;}

test('base defenses defeat every unbuffed champion in three landed attacks on every difficulty',()=>{
 for(const mode of ['easy','normal','hard','hell'])for(let team=0;team<8;team++)for(const kind of ['captain','crystal']){
  const g=quiet(mode),t=g.teams[team],u=t.champion,enemy=g.teams[(team+1)%8],source=kind==='captain'?enemy.guards[0]:enemy.crystal;u.active=true;g.controlled=team;source.active=true;
  Object.assign(u,{x:source.x+100,y:source.y,invuln:0});g.rebuild();g.combat.actors[team].brain.shield=0;
  for(let n=0;n<3&&u.active;n++){u.invuln=0;g.damage(u,source.damage,source.team,false,true,source);if(n===0)assert.ok(u.active,'A base hit must leave time to react');}
  assert.equal(u.active,false,mode+' '+t.monster+' '+kind);
 }
});
test('health, armor and native wards extend survival against base defenses',()=>{
 const g=quiet(),t=g.teams[0],u=t.champion,source=g.teams[1].guards[0];g.controlled=0;u.active=source.active=true;Object.assign(u,{x:source.x+100,y:source.y,maxHp:t.baseHp*1.6,hp:t.baseHp*1.6});t.upgrades.vitality=5;t.upgrades.armor=3;g.rebuild();
 for(let n=0;n<3;n++){u.invuln=0;g.damage(u,source.damage,1,false,true,source);}assert.ok(u.active&&u.hp>0);
 const hp=u.hp;u.invuln=0;g.combat.actors[0].brain.shield=t.baseHp;g.damage(u,source.damage,1,false,true,source);assert.equal(u.hp,hp);assert.ok(g.combat.actors[0].brain.shield<t.baseHp);
});
test('unsupported champion burst cannot remove a meaningful share of a guardian or exposed crystal',()=>{
 for(const kind of ['captain','crystal']){const g=quiet(),base=g.teams[0],hero=g.teams[1].champion,v=kind==='captain'?base.guards[0]:base.crystal;hero.active=v.active=true;Object.assign(hero,{x:base.crystal.x-120,y:base.crystal.y,invuln:0});g.rebuild();
  const before=v.hp;for(let n=0;n<4;n++)g.damage(v,1e6,1,false,false,hero);assert.ok(v.hp>=before-v.maxHp*.061);assert.ok(v.active);
 }
});
test('spell resistance preserves a wave after one huge spell but allows committed follow-up clearing',()=>{
 const g=quiet(),hero=g.teams[3].champion;g.controlled=3;Object.assign(hero,{active:true,x:2400,y:2400});const troops=g.units.filter(u=>u.team===1&&['infantry','ranged'].includes(u.kind)).slice(0,12);troops.forEach((u,i)=>Object.assign(u,{active:true,x:2450+i*5,y:2400,invuln:0}));g.rebuild();g.combat.prepare(3);const b=g.combat.actors[3].brain;
 for(const u of troops){const e=g.combat.actors[3].proxies.get(u.id);b.damage(e,1e6,'meteor');assert.ok(u.active&&u.hp>=u.maxHp*.39);}
 assert.equal(troops.filter(u=>u.active).length,12);
 for(const u of troops)b.damage(g.combat.actors[3].proxies.get(u.id),1e6,'meteor');assert.equal(troops.some(u=>u.active),false);
});
test('ordinary troop spell resistance leaves basic attacks and siege beast resistance intact',()=>{
 const g=quiet(),hero=g.teams[3].champion;g.controlled=3;Object.assign(hero,{active:true,x:2400,y:2400});const troop=g.units.find(u=>u.team===1&&u.kind==='infantry');Object.assign(troop,{active:true,x:2450,y:2400,invuln:0,hp:1000,maxHp:1000});g.rebuild();g.combat.prepare(3);const b=g.combat.actors[3].brain,p=g.combat.actors[3].proxies.get(troop.id);
 b.damage(p,100,'direct');const basic=1000-troop.hp;troop.hp=p.hp=1000;b.damage(p,100,'meteor');assert.ok(Math.abs((1000-troop.hp)/basic-CRUCIBLE_SIEGE.troopSpellScale)<1e-8);
 troop.siege=true;troop.hp=p.hp=1000;b.damage(p,100,'meteor');const spell=1000-troop.hp;troop.hp=1000;const ordinary=g.damage(troop,75,3,false,false,hero);assert.equal(spell,ordinary);
});
test('Crucible abilities recover slower without charging mana or slowing basic attacks',()=>{
 for(let team=0;team<8;team++){const g=quiet(),t=g.teams[team],u=t.champion;g.controlled=team;Object.assign(u,{active:true,x:2400,y:2400,power:0,ultimate:0,cooldowns:[0,0,0,0]});g.rebuild();const b=g.combat.actors[team].brain,native=new Game(17,{monsterId:t.monster},3,'fissure',true);assert.equal(b.releaseStats.attack,releaseStats(t.monster,4).attack);
  for(let slot=0;slot<4;slot++){const p=b.powers[slot],factor=slot===3?1.5:2;assert.equal(factor,slot===3?CRUCIBLE_SIEGE.ultimateCooldown:CRUCIBLE_SIEGE.regularCooldown);const expected=releasedPower(native.powers[slot],t.monster,4).cooldown*factor;if(p.effect!=='wolfravage'&&p.effect!=='parkour'){u.power=u.ultimate=0;u.cooldowns=[0,0,0,0];const before=t.mana;if(g.cast(team,slot)&&p.effect!=='lunge')assert.ok(Math.abs(u.cooldowns[slot]-expected)<1e-8,p.id);assert.equal(t.mana,before);}}
 }
});

test('casting another ability cannot repeatedly accelerate an ongoing Lunge recharge',()=>{
 const g=quiet(),team=4,t=g.teams[team],u=t.champion;g.controlled=team;t.upgrades.haste=3;Object.assign(u,{active:true,x:2400,y:2400,power:0,ultimate:0,cooldowns:[0,0,0,0]});g.rebuild();assert.equal(t.monster,'devourer');assert.ok(g.cast(team,0));const b=g.combat.actors[team].brain,recharge=b.lungeRecharge;assert.ok(recharge>0);assert.ok(g.cast(team,1));assert.equal(b.lungeRecharge,recharge);assert.ok(g.cast(team,3));assert.equal(b.lungeRecharge,recharge);
});
