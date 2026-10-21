import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Crucible} from '../src/crucible-sim.ts';
import {CRUCIBLE_MAP} from '../src/crucible-layout.ts';
import {crystalDive} from '../src/crucible-dive.ts';

function opportunity(mode='hell',monster='devourer'){
 const g=new Crucible(17,mode,{...CRUCIBLE_MAP,structures:[],zones:[],terrain:{sight:[],slows:[],hazards:[]}});
 const team=g.teams.findIndex(t=>t.monster===monster),enemy=(team+1)%8,t=g.teams[team],e=g.teams[enemy];
 g.controlled=enemy;g.time=100;
 for(const u of g.units)u.active=false;
 for(const camp of g.teams){camp.wave=1e9;camp.trapReady=[1e9,1e9,1e9];camp.respawnAt=1e9;camp.plan=1e9;}
 Object.assign(t.crystal,{active:true,attack:1e9});
 Object.assign(e.crystal,{active:true,hp:5,attack:2.4});e.respawnAt=g.time+20;
 Object.assign(t.champion,{active:true,x:e.crystal.x-60,y:e.crystal.y,hp:t.champion.maxHp*.2,invuln:0,attack:0,power:1e9,ultimate:1e9,cooldowns:[1e9,1e9,1e9,1e9],retreat:true});
 t.goal=enemy;t.shopping=true;t.shopAt=1e9;
 g.rebuild();g.intel.update(true);g.combat.sync(team);
 return {g,team,enemy,t,e};
}

test('Hell recognizes a recoverable death as worth finishing a recalling enemy crystal',()=>{
 const {g,team}=opportunity(),plan=crystalDive(g,team);
 assert.ok(plan);assert.ok(plan.finishIn<plan.dieIn);assert.ok(plan.dieIn<4,'the crystal can kill the attacker shortly after its predicted finish');
});
test('actual Hell AI overrides retreat and shopping, notices, then finishes with native attacks',()=>{
 const {g,team,t,e}=opportunity();
 for(let i=0;i<60&&e.crystal.active;i++)g.step(1/30);
 assert.equal(e.crystal.active,false);assert.equal(e.eliminated,true);
 assert.equal(t.champion.active,true);assert.equal(t.champion.retreat,false);
 assert.equal(t.shopping,false);assert.equal(t.crystalKills,1);
});
test('dive calculation respects healthy crystals, wards, low survivability and recall deadline',()=>{
 for(const change of [
  ({e})=>{e.crystal.hp=e.crystal.maxHp;},
  ({e})=>{e.guards.forEach(u=>{u.active=true;u.attack=0;});},
  ({t,e})=>{t.champion.hp=1;e.crystal.attack=0;},
  ({g,e})=>{e.respawnAt=g.time+.2;},
  ({e})=>{e.champion.active=true;},
  ({t})=>{t.crystal.active=false;},
  ({t})=>{t.champion.stun=1;},
 ]){const f=opportunity();change(f);f.g.rebuild();f.g.intel.update(true);assert.equal(crystalDive(f.g,f.team),undefined);}
});
test('Easy, Normal and Hard retain their cautious decision policy',()=>{
 for(const mode of ['easy','normal','hard']){const {g,team}=opportunity(mode);assert.equal(crystalDive(g,team),undefined);}
});
test('a hidden crystal and an obstructed crystal cannot trigger a dive',()=>{
 for(const block of ['vision','line']){const {g,team}=opportunity();if(block==='vision')g.intel.visible=()=>false;else g.terrain.lineVisible=()=>false;assert.equal(crystalDive(g,team),undefined);}
});
test('commitment ends immediately when the defender returns or the attacker loses its own crystal',()=>{
 for(const change of [({e})=>{e.champion.active=true;},({t})=>{t.crystal.active=false;}]){
  const f=opportunity(),a=f.g.combat.attention;
  a.update(f.team);f.g.time+=1;a.update(f.team);assert.equal(a.diving(f.team),true);
  change(f);assert.equal(a.diving(f.team),false);
 }
});

test('a ready, affordable beam can finance a dive that basics alone cannot finish',()=>{
 const {g,team,t,e}=opportunity('hell','calamity');
 e.crystal.hp=80;t.champion.cooldowns[0]=0;t.champion.power=0;
 g.combat.sync(team);
 assert.ok(crystalDive(g,team),'available beam contributes a bounded damage window');
 t.mana=0;assert.equal(crystalDive(g,team),undefined,'cannot finance a beam without mana');
 t.mana=1000;t.champion.cooldowns[0]=100;
 assert.equal(crystalDive(g,team),undefined,'a cooling beam is not available damage');
});


test('a funded beam finishing decision succeeds through the actual native cast',()=>{
 const {g,t,e}=opportunity('hell','calamity');
 e.crystal.hp=80;t.champion.cooldowns[0]=0;t.champion.power=0;
 for(let i=0;i<60&&e.crystal.active;i++)g.step(1/30);
 assert.equal(e.crystal.active,false);assert.equal(e.eliminated,true);
 assert.ok(t.mana<180,'the finishing cast paid its normal mana cost');
});
