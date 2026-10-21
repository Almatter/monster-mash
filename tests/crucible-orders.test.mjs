import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Crucible,CRUCIBLE} from '../src/crucible-sim.ts';
import {CRUCIBLE_MAP} from '../src/crucible-layout.ts';
const open={...CRUCIBLE_MAP,structures:[],zones:[],terrain:{sight:[],slows:[],hazards:[]}};
function fixture(map=open){const g=new Crucible(17,'hell',map);g.controlled=0;
 for(const t of g.teams){t.wave=t.shopAt=t.respawnAt=1e9;t.trapReady=[1e9,1e9,1e9];t.champion.active=false;for(const u of t.guards)u.active=false;}
 for(const u of g.units)if(['infantry','ranged'].includes(u.kind))u.active=false;
 const t=g.teams[0],c=t.crystal;Object.assign(t.champion,{active:true,x:c.x,y:c.y,attack:1e9,power:1e9,ultimate:1e9,cooldowns:[1e9,1e9,1e9,1e9]});
 g.rebuild();g.intel.update(true);return {g,t,c};}
const advance=(g,s)=>{for(let i=0;i<s*30;i++)g.step(1/30);};
function troop(g,team=0){g.spawn(team);g.spawn(team);return g.units.find(u=>u.active&&u.team===team&&u.kind==='infantry');}

test('orders require a living crystal and home access, but remain available throughout recall',()=>{
 const {g,t,c}=fixture();assert.equal(g.orders.set(0,'defend'),true);
 t.champion.x=c.x+500;assert.equal(g.orders.set(0,'automatic'),false);
 t.champion.active=false;t.respawnAt=20;assert.equal(g.orders.set(0,'automatic'),true);
 c.active=false;assert.equal(g.orders.set(0,'defend'),false);
 c.active=true;t.eliminated=true;assert.equal(g.orders.set(0,'defend'),false);
});
test('siege orders name one enemy base, focus guardians first, and clear intervening camps',()=>{
 const {g}=fixture(),enemy=g.teams[1];enemy.guards.forEach(u=>u.active=true);
 assert.equal(g.orders.set(0,'siege',1),true);const expected=g.interveningBase(0,1),objective=g.armyObjective(0);
 assert.equal(objective.team,expected);assert.equal(g.teams[0].armyGoal,expected);
 if(expected===1){assert.equal(objective.kind,'captain');enemy.guards.forEach(u=>u.active=false);assert.equal(g.armyObjective(0),enemy.crystal);}
 assert.equal(g.orders.set(0,'siege',0),false);assert.equal(g.orders.set(0,'siege',999),false);
 enemy.crystal.active=false;g.orders.update(0);assert.equal(g.orders.states[0].mode,'automatic');
});
test('rally orders bring marching troops home on the road graph, then release them',()=>{
 const {g,c}=fixture(),u=troop(g);Object.assign(u,g.rally(0));u.invuln=0;
 assert.equal(g.orders.set(0,'defend'),true);const before=Math.hypot(u.x-c.x,u.y-c.y);g.route(u);
 assert.equal(u.navTeam,-400);assert.ok(u.nav.length>1);assert.equal(u.nav.at(-1).node,8);
 advance(g,20);assert.ok(Math.hypot(u.x-c.x,u.y-c.y)<before*.3);
 assert.equal(g.orders.release(0,1),true);assert.equal(g.orders.states[0].mode,'siege');assert.equal(u.nav.length,0);
 g.route(u);assert.notEqual(u.navTeam,-400);
});
test('rally cannot produce extra troops or suppress another army reinforcement pool',()=>{
 const {g,t}=fixture();g.orders.set(0,'defend');for(let i=0;i<100;i++)g.spawn(0);
 const count=team=>g.units.filter(u=>u.active&&u.team===team&&['infantry','ranged'].includes(u.kind)&&!u.servant).length;
 assert.equal(count(0),g.density);for(let i=0;i<30;i++)g.spawn(1);assert.equal(count(1),g.density);
 t.wave=0;g.step(.01);assert.equal(count(0),g.density);
});
test('defenders protect a living champion and stop prioritizing the attacker after its death',()=>{
 const {g,t,c}=fixture(),u=troop(g),enemy=troop(g,1),closer=troop(g,2);
 Object.assign(u,{x:c.x,y:c.y,range:205});Object.assign(enemy,{x:c.x+100,y:c.y});Object.assign(closer,{x:c.x+30,y:c.y});
 g.orders.set(0,'defend');t.defendTarget=enemy.id;t.defendUntil=4;g.rebuild();
 assert.equal(g.troopTarget(u),enemy);t.champion.active=false;assert.equal(g.troopTarget(u),closer);
 enemy.x=c.x+1000;closer.active=false;assert.equal(g.orders.combatTarget(u),undefined);
});
test('hunt uses shared sightings, follows the road, and never updates to hidden live positions',()=>{
 const {g,c}=fixture(),target=g.teams[1].champion;Object.assign(target,{active:true,x:c.x+100,y:c.y});g.rebuild();g.intel.update(true);
 assert.equal(g.orders.set(0,'hunt',1),true);const known={...g.orders.states[0].point};
 Object.assign(target,{x:CRUCIBLE.cx,y:CRUCIBLE.cy});g.time=1;g.orders.update(0);
 assert.deepEqual(g.orders.states[0].point,known);
 const u=troop(g);Object.assign(u,g.rally(0));g.route(u);assert.equal(u.navTeam,-500);
 g.time=13;g.orders.update(0);assert.equal(g.orders.states[0].mode,'automatic');
});
test('unscouted and dead champions cannot be hunted, and elimination cancels a hunt',()=>{
 const {g,c}=fixture(),target=g.teams[1].champion;
 assert.equal(g.orders.set(0,'hunt',1),false);
 Object.assign(target,{active:true,x:CRUCIBLE.cx,y:CRUCIBLE.cy});g.rebuild();assert.equal(g.orders.set(0,'hunt',1),false);
 Object.assign(target,{x:c.x+80,y:c.y});g.rebuild();assert.equal(g.orders.set(0,'hunt',1),true);
 g.teams[1].eliminated=true;g.orders.update(0);assert.equal(g.orders.states[0].mode,'automatic');
});
test('hunt engages its designated visible champion at troop range without selecting distant fodder',()=>{
 const {g,c}=fixture(),u=troop(g),target=g.teams[1].champion;
 Object.assign(u,{x:c.x,y:c.y,range:205});Object.assign(target,{active:true,x:c.x+150,y:c.y});g.rebuild();g.orders.set(0,'hunt',1);
 assert.equal(g.troopTarget(u),target);target.x=c.x+1000;g.rebuild();assert.notEqual(g.troopTarget(u),target);
});
test('crystal loss ends orders and returns remaining troops to their champion escort behavior',()=>{
 const {g,t,c}=fixture(),u=troop(g);g.orders.set(0,'defend');c.active=false;g.orders.update(0);
 assert.equal(g.orders.states[0].mode,'automatic');g.route(u);assert.equal(u.objective,-1);assert.equal(g.orders.set(0,'hunt',1),false);
});
test('recalling NPCs can issue defense orders using their own sight and the same home restriction',()=>{
 const {g,t,c}=fixture();g.controlled=1;g.time=30;t.champion.active=false;t.respawnAt=50;
 const enemy=troop(g,1);Object.assign(enemy,{x:c.x+100,y:c.y});g.rebuild();g.orders.update(0);
 assert.equal(g.orders.states[0].mode,'defend');
 const other=g.teams[2];Object.assign(other.champion,{active:true,x:c.x,y:c.y});assert.equal(g.orders.set(2,'defend'),false);
});
test('defending and hunting troops do not get unrelated recalling-base siege bonuses',()=>{
 const {g}=fixture(),u=troop(g);g.teams[0].armyGoal=1;g.teams[1].respawnAt=20;
 assert.equal(g.recallPush(u),true);g.orders.set(0,'defend');assert.equal(g.recallPush(u),false);
});


test('ordered defenders and hunters do not stop to fire through blocked sight lines',()=>{
 for(const mode of ['defend','hunt']){const {g,c}=fixture(),u=troop(g),enemy=g.teams[1].champion;
  Object.assign(u,{x:c.x,y:c.y,range:205});Object.assign(enemy,{active:true,x:c.x+150,y:c.y});g.rebuild();g.orders.set(0,mode,mode==='hunt'?1:-1);
  const visible=g.terrain.lineVisible.bind(g.terrain);g.terrain.lineVisible=(a,b)=>a===u&&b===enemy?false:visible(a,b);
  assert.notEqual(g.troopTarget(u),enemy);
 }
});

test('rally routes reuse authored roads around the fixed acid pools',()=>{
 const {g}=fixture(CRUCIBLE_MAP),u=troop(g);Object.assign(u,g.rally(1));g.orders.set(0,'defend');g.route(u);
 assert.ok(u.nav.length>2);for(const p of u.nav)assert.equal(g.terrain.hazardAt(p),0,JSON.stringify(p));
});
