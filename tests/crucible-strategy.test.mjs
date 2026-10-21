import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Crucible,CRUCIBLE_WAR} from '../src/crucible-sim.ts';
import {CRUCIBLE_MAP} from '../src/crucible-layout.ts';
const open={...CRUCIBLE_MAP,structures:[],zones:[],terrain:{sight:[],slows:[],hazards:[]}};
function lane(difficulty='hell'){
 const g=new Crucible(17,difficulty,open),team=3,enemy=1,t=g.teams[team],foe=g.teams[enemy],c=foe.crystal;
 g.controlled=enemy;g.time=100;
 for(const u of g.units)u.active=false;
 for(const v of g.teams){v.wave=v.shopAt=v.plan=v.respawnAt=1e9;v.trapReady=[1e9,1e9,1e9];}
 Object.assign(t.crystal,{active:true,attack:1e9});Object.assign(c,{active:true,attack:1e9});
 Object.assign(t.champion,{active:true,x:c.x-500,y:c.y,hp:t.champion.maxHp,invuln:0,attack:0,power:0,ultimate:0,cooldowns:[0,0,0,0]});
 Object.assign(foe.guards[0],{active:true,x:c.x-100,y:c.y,attack:1e9});foe.respawnAt=120;
 t.armyGoal=t.goal=enemy;t.mana=2000;
 for(let i=0;i<6;i++)g.spawn(team);
 const troops=g.units.filter(u=>u.active&&u.team===team&&['infantry','ranged'].includes(u.kind));
 troops.forEach((u,i)=>Object.assign(u,{x:c.x-385-i*5,y:c.y+(i-3)*12,hp:1000,maxHp:1000,invuln:0}));
 g.rebuild();g.intel.update(true);g.combat.sync(team);
 return {g,team,enemy,t,foe,c,troops,s:g.strategy.states[team]};
}
function home(f){Object.assign(f.t.champion,{x:f.t.crystal.x,y:f.t.crystal.y});f.t.shopAt=0;f.g.rebuild();}
const advance=(g,s)=>{for(let i=0;i<s*30;i++)g.step(1/30);};

test('Hard and Hell recognize a supported recall push without issuing remote army orders',()=>{
 for(const difficulty of ['hard','hell']){const f=lane(difficulty);f.g.strategy.update(f.team);
  assert.equal(f.s.pushTeam,f.enemy);assert.ok(f.s.pushUntil<f.foe.respawnAt);assert.equal(f.g.strategy.committed(f.team),true);
  assert.equal(f.g.orders.states[f.team].mode,'automatic');assert.ok(f.g.strategy.goal(f.team));
 }
 for(const difficulty of ['easy','normal']){const f=lane(difficulty);f.g.strategy.update(f.team);assert.equal(f.s.pushTeam,-1);}
});
test('death pushes refuse unsupported waves, short windows and low health',()=>{
 for(const change of [f=>f.troops.forEach(u=>u.active=false),f=>f.foe.respawnAt=f.g.time+2,f=>f.t.champion.hp=f.t.champion.maxHp*.2]){
  const f=lane();change(f);f.g.rebuild();f.g.strategy.update(f.team);assert.equal(f.s.pushTeam,-1);
 }
});
test('committed pushes suppress routine shopping and disengage when the defender returns',()=>{
 const f=lane('hard');f.t.build.stats=['might'];f.t.shopping=true;f.t.shopAt=0;
 f.g.strategy.update(f.team);f.g.autoShop(f.team);assert.equal(f.t.shopping,false);
 f.foe.champion.active=true;f.g.time+=.5;f.g.strategy.update(f.team);
 assert.equal(f.s.pushTeam,-1);assert.ok(f.s.withdrawUntil>f.g.time);assert.deepEqual(f.g.strategy.goal(f.team),f.g.rally(f.team));
});
test('local threats and lost wave support cancel a push instead of blindly diving',()=>{
 for(const kind of ['support','home']){const f=lane();f.g.strategy.update(f.team);
  if(kind==='support')f.troops.forEach(u=>u.active=false);
  else{const rival=f.g.teams[2].champion;Object.assign(rival,{active:true,x:f.t.crystal.x+50,y:f.t.crystal.y});}
  f.g.rebuild();f.g.time+=.5;f.g.strategy.update(f.team);assert.equal(f.s.pushTeam,-1);
 }
});
test('push attention clears blockers, then focuses a visible guardian as support arrives',()=>{
 const f=lane();f.g.strategy.update(f.team);assert.equal(f.g.strategy.target(f.team),null);
 f.troops.forEach(u=>u.x=f.c.x-200);f.g.rebuild();assert.equal(f.g.strategy.target(f.team),f.foe.guards[0]);
 const blocker=f.g.units.find(u=>u.team===f.enemy&&u.kind==='infantry');Object.assign(blocker,{active:true,x:f.c.x-230,y:f.c.y});f.g.rebuild();
 assert.equal(f.g.strategy.target(f.team),blocker);
 f.g.combat.attention.inView=()=>false;assert.equal(f.g.strategy.target(f.team),null);
});
test('a real native-kit push damages objectives instead of remaining distracted by farm',()=>{
 const outcomes=[];
 for(const enabled of [false,true]){const f=lane('hard');if(!enabled)f.g.strategy.enabled=()=>false;
  const bait=f.g.units.find(u=>u.team===2&&u.kind==='infantry');Object.assign(bait,{active:true,x:f.t.champion.x-100,y:f.t.champion.y+220,hp:100000,maxHp:100000,invuln:0,attack:1e9,speed:0});
  const a=f.g.combat.attention.states[f.team];Object.assign(a,{focus:bait.id,mode:'lane',intent:'lane',visible:true,readyAt:0,lastSeen:f.g.time,holdUntil:1e9,peripheralAt:1e9,point:{x:bait.x,y:bait.y}});
  f.g.rebuild();advance(f.g,6);outcomes.push(f.foe.guards[0].maxHp-f.foe.guards[0].hp);
 }
 assert.ok(outcomes[1]>outcomes[0]+500,JSON.stringify(outcomes));
});
function scout(f,stats,augments=[],monster='sovereign'){
 const target=f.g.teams[f.enemy];target.monster=monster;
 f.g.intel.reports[f.team][f.enemy]={x:f.c.x,y:f.c.y,at:f.g.time,hp:2000,maxHp:3000,mana:1000,earnedMana:1000,kills:2,deaths:1,upgrades:stats,augments,crystalHp:6500,guards:2,brood:0,veterans:0};
}
test('Hell counters observed sustain, offense and poison; Hard keeps randomized purchases',()=>{
 const f=lane();scout(f,{vitality:5,armor:3},['bastion','brawler'],'titan');
 assert.deepEqual(f.g.strategy.counterPlan(f.team).map(c=>c.stat),['blight','might']);
 scout(f,{might:5,tempo:3,haste:5},[],'devourer');assert.deepEqual(f.g.strategy.counterPlan(f.team).map(c=>c.stat),['armor','vitality']);
 scout(f,{},[],'hag');assert.ok(f.g.strategy.counterPlan(f.team).some(c=>c.stat==='antivenom'));
 f.g.difficulty='hard';assert.deepEqual(f.g.strategy.counterPlan(f.team),[]);
});
test('counterbuilding cannot inspect unseen purchases or use stale scouting reports',()=>{
 const f=lane();f.g.intel.reports[f.team][f.enemy]=undefined;
 Object.assign(f.foe.upgrades,{might:5,glamour:3});assert.deepEqual(f.g.strategy.counterPlan(f.team),[]);
 scout(f,{glamour:3});const before=f.g.strategy.counterPlan(f.team);Object.assign(f.foe.upgrades,{might:5,glamour:0,armor:3});
 assert.deepEqual(f.g.strategy.counterPlan(f.team),before);f.g.time+=46;assert.deepEqual(f.g.strategy.counterPlan(f.team),[]);
});
test('counter purchases and limited respeccing obey shop access, costs, refunds and build cap',()=>{
 const f=lane();home(f);f.t.mana=10000;f.s.counters=[{stat:'blight',rank:3,score:10}];
 const before=f.t.mana;assert.equal(f.g.strategy.buyCounter(f.team,0),true);assert.equal(before-f.t.mana,150);assert.equal(f.t.upgrades.blight,1);
 Object.assign(f.t.upgrades,{blight:0,might:5,vitality:5,haste:3,reach:3});assert.equal(f.g.statRanks(f.team),16);
 const bank=f.t.mana,refund=f.g.sellValue(f.team,'reach');assert.equal(f.g.strategy.buyCounter(f.team,0),true);
 assert.equal(f.g.statRanks(f.team),16);assert.equal(f.t.upgrades.reach,2);assert.equal(f.t.mana,bank+refund-150);
 assert.equal(f.g.strategy.buyCounter(f.team,0),false,'respect the respec interval');
 f.g.time+=13;f.t.champion.x+=500;assert.equal(f.g.strategy.buyCounter(f.team,0),false,'no field purchases');
});
test('a stalled observed siege saves mana, buys a real beast, gathers, and releases an escort',()=>{
 const f=lane();home(f);f.foe.champion.active=true;Object.assign(f.foe.champion,{x:f.c.x,y:f.c.y});
 Object.assign(f.t.upgrades,{might:4});f.t.augments=['spellweave'];f.g.intel.visible=()=>true;
 f.g.strategy.update(f.team);f.g.time+=21;f.g.strategy.update(f.team);assert.equal(f.s.wantSiege,true);
 f.t.mana=700;assert.equal(f.g.strategy.saving(f.team,64),true);assert.equal(f.g.strategy.buySiege(f.team,64),false);assert.equal(f.t.siege,undefined);
 f.t.mana=1200;const bank=f.t.mana;assert.equal(f.g.strategy.buySiege(f.team,64),true);assert.equal(bank-f.t.mana,CRUCIBLE_WAR.siegeCost);
 f.g.time+=.5;f.g.strategy.update(f.team);assert.equal(f.s.stage,'gather');assert.equal(f.g.orders.states[f.team].mode,'defend');
 for(const u of f.troops)Object.assign(u,{x:f.t.crystal.x+50,y:f.t.crystal.y});f.g.rebuild();f.g.time+=.5;f.g.strategy.update(f.team);
 assert.equal(f.s.stage,'escort');assert.equal(f.g.orders.states[f.team].mode,'siege');assert.equal(f.g.orders.states[f.team].target,f.enemy);
 assert.ok(f.g.strategy.goal(f.team));
});
test('saving for a siege does not make an unfunded NPC abandon farming or gather forever',()=>{
 const f=lane();f.s.wantSiege=true;f.t.mana=700;f.t.shopAt=0;f.t.build.stats=['might'];
 f.g.autoShop(f.team);assert.equal(f.t.shopping,false);assert.equal(f.s.stage,'none');assert.equal(f.t.mana,700);
});
test('losing the crystal cancels strategy so survivor behavior can take over',()=>{
 const f=lane();f.g.strategy.update(f.team);f.t.crystal.active=false;f.g.time+=.5;f.g.strategy.update(f.team);
 assert.equal(f.g.strategy.goal(f.team),undefined);assert.equal(f.s.pushTeam,-1);assert.equal(f.s.stage,'none');
});


test('autonomous shopping prioritizes the scouted counter over the original random build',()=>{
 const f=lane();home(f);scout(f,{glamour:3,vitality:5},['bastion']);f.t.build.stats=['reach'];
 f.g.strategy.update(f.team);const bank=f.t.mana;f.g.autoShop(f.team);
 assert.equal(f.t.upgrades.blight,1);assert.equal(f.t.upgrades.reach,0);assert.equal(bank-f.t.mana,150);
});
test('an escort stays outside retaliation range until enough troops open the siege',()=>{
 const f=lane();f.s.stage='escort';f.s.siegeTeam=f.enemy;f.s.stageUntil=f.g.time+30;f.s.pushTeam=-1;
 f.troops.forEach(u=>u.active=false);f.t.siege={active:true,x:f.c.x-100,y:f.c.y};f.g.rebuild();
 const goal=f.g.strategy.goal(f.team);assert.ok(Math.hypot(goal.x-f.c.x,goal.y-f.c.y)>=f.g.baseDomain(f.enemy)+34);
});
test('a failed gathering phase releases its hold; a badly hurt escort returns to recovery',()=>{
 const f=lane();home(f);f.s.stage='gather';f.s.siegeTeam=f.enemy;f.t.siege={active:false};f.g.orders.set(f.team,'defend');
 f.g.strategy.update(f.team);assert.equal(f.s.stage,'none');assert.equal(f.g.orders.states[f.team].mode,'automatic');
 f.s.stage='escort';f.s.stageUntil=f.g.time+30;f.t.siege={active:true,x:f.c.x-400,y:f.c.y};f.t.champion.hp=f.t.champion.maxHp*.3;f.g.time+=1;
 f.g.strategy.update(f.team);assert.equal(f.s.stage,'none');assert.equal(f.t.champion.retreat,true);
});


test('a near-funded counter purchase is saved for without returning home for a cheaper distraction',()=>{
 const f=lane();f.s.counters=[{stat:'blight',rank:3,score:10}];f.t.upgrades.blight=1;f.t.mana=250;f.t.shopAt=0;f.t.build.stats=['might'];
 assert.equal(f.g.strategy.saving(f.team,70),true);f.g.autoShop(f.team);assert.equal(f.t.shopping,false);assert.equal(f.t.mana,250);
});


test('a beast with no surviving enemy crystal never traps its army in gathering mode',()=>{
 const f=lane();home(f);f.foe.crystal.active=false;f.t.siege={active:true,x:f.t.crystal.x,y:f.t.crystal.y};
 f.g.strategy.update(f.team);assert.equal(f.s.stage,'none');assert.equal(f.g.orders.states[f.team].mode,'automatic');
});
