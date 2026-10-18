import {CRUCIBLE_DIFFICULTIES} from '../src/crucible-difficulty.ts';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {MONSTERS} from '../src/content-monsters.ts';
import {hagState} from '../src/hag.ts';
import {CRUCIBLE_AUGMENTS,CRUCIBLE_BUILD_LIMITS} from '../src/crucible-augments.ts';
import {Crucible,CRUCIBLE as C,CRUCIBLE_WAR as WAR,CRUCIBLE_SHOP} from '../src/crucible-sim.ts';
const advance=(g,seconds)=>{for(let i=0;i<seconds*30;i++)g.step(1/30);};
const kill=(g,u,team)=>{u.invuln=0;for(let i=0;i<30&&u.active;i++){u.invuln=0;g.damage(u,1e6,team);}assert.equal(u.active,false);};
function quiet(){const g=new Crucible(17,'hell');for(const t of g.teams){t.wave=1e9;t.respawnAt=1e9;t.trapReady=[1e9,1e9,1e9];}return g;}
function place(u,base,dx,dy=0){Object.assign(u,{x:base.x+dx,y:base.y+dy,invuln:0,attack:1e9,power:1e9,ultimate:1e9});}
function only(g,units){for(const u of g.units)u.active=units.includes(u);g.rebuild();}
function ring(g){return g.teams.map((t,i)=>({i,a:Math.atan2(t.crystal.y-C.cy,t.crystal.x-C.cx)})).sort((a,b)=>a.a-b.a).map(v=>v.i);}

test('eight armies retain bounded pools, two guardians and a life crystal each',()=>{
 const g=new Crucible(17);assert.equal(g.teams.length,8);assert.equal(g.units.filter(u=>u.active&&['infantry','ranged'].includes(u.kind)).length,128);assert.equal(g.units.length,8*(C.troopCap+4));for(const t of g.teams){assert.equal(t.guards.length,2);assert.equal(t.trapReady.length,3);}
});
test('bases have separated defense areas and safe home circles at every starting position',()=>{
 const g=new Crucible(17);for(let i=0;i<8;i++)for(let j=i+1;j<8;j++){const a=g.teams[i].crystal,b=g.teams[j].crystal;assert.ok(Math.hypot(a.x-b.x,a.y-b.y)>C.defenseRadius*2+100);}
});
test('guardians ward their crystal until both are defeated',()=>{
 const g=new Crucible(17),t=g.teams[0],before=g.damage(t.crystal,100,1);for(const u of t.guards)kill(g,u,1);assert.ok(g.damage(t.crystal,100,1)>before*5);
});
test('a surviving crystal recalls its champion after ten seconds',()=>{
 const g=new Crucible(17),t=g.teams[0];kill(g,t.champion,1);advance(g,9);assert.equal(t.champion.active,false);advance(g,1.1);assert.equal(t.champion.active,true);assert.ok(t.champion.invuln>2);assert.ok(Math.hypot(t.champion.x-t.crystal.x,t.champion.y-t.crystal.y)<30);
});
test('crystal destruction makes the next death final, including a champion awaiting recall',()=>{
 for(const recalling of [true,false]){const g=new Crucible(17),t=g.teams[0];if(recalling)kill(g,t.champion,1);for(const guard of t.guards)kill(g,guard,1);kill(g,t.crystal,1);if(!recalling)kill(g,t.champion,1);assert.equal(t.eliminated,true);advance(g,12);assert.equal(t.champion.active,false);}
});
test('the larger battlefield still produces a bounded horde fight with finite positions',()=>{
 const g=new Crucible(17);g.density=28;advance(g,120);assert.ok(g.kills>300);assert.ok(g.effects.length<=72);assert.ok(g.shots.length<=96);for(const u of g.units){assert.ok(Number.isFinite(u.x)&&Number.isFinite(u.hp));if(u.active)assert.ok(u.x>=95&&u.x<=C.width-95&&u.y>=95&&u.y<=C.height-95);}
});
test('seeded battles reproduce and different seeds change camp positions',()=>{
 const a=new Crucible(17),b=new Crucible(17),c=new Crucible(23);advance(a,20);advance(b,20);const snapshot=g=>g.units.map(u=>({id:u.id,active:u.active,team:u.team,kind:u.kind,x:u.x,y:u.y,hp:u.hp}));assert.deepEqual(snapshot(a),snapshot(b));assert.notDeepEqual(a.teams.map(t=>t.crystal.x),c.teams.map(t=>t.crystal.x));
});
test('all eight prototype powers work without importing live Stage 4 or profiles',()=>{
 for(let team=0;team<8;team++){const g=new Crucible(17),u=g.teams[team].champion,v=g.teams[(team+1)%8].champion;Object.assign(u,{x:C.cx,y:C.cy,target:v.id,power:0,ultimate:0});Object.assign(v,{x:C.cx+80,y:C.cy});g.rebuild();assert.equal(g.power(team),true);assert.equal(g.power(team,true),true);}
 for(const f of ['src/crucible-sim.ts','src/crucible-prototype.ts'])assert.doesNotMatch(fs.readFileSync(f,'utf8'),/from ['"]\.\/(stage-four|profile|main)\./);
});
test('normalized input moves the controlled champion and neutral input stops movement',()=>{
 const g=quiet(),u=g.teams[0].champion;g.controlled=0;g.input={x:1,y:0};const x=u.x;advance(g,.5);assert.ok(u.x>x+40);g.input={x:0,y:0};const stopped=u.x;advance(g,.2);assert.equal(u.x,stopped);
});
test('offensive powers end arrival invulnerability',()=>{
 const g=quiet(),u=g.teams[0].champion,v=g.teams[1].champion;Object.assign(u,{x:C.cx,y:C.cy,target:v.id,power:0,invuln:3});Object.assign(v,{x:C.cx+80,y:C.cy});g.rebuild();assert.equal(g.power(0),true);assert.equal(u.invuln,0);
});
test('the reported seed reserves eight different adjacent camps without Hag/Devourer cross-map targets',()=>{
 const g=new Crucible(338053737);for(let i=0;i<8;i++)g.armyObjective(i);const order=ring(g);assert.equal(new Set(g.teams.map(t=>t.armyGoal)).size,8);for(const [i,team] of order.entries())assert.ok([order[(i+1)%8],order[(i+7)%8]].includes(g.teams[team].armyGoal));assert.notEqual(g.teams[0].armyGoal,4);
});
test('the opposite home neighbor is preferred after the first captured base',()=>{
 const g=new Crucible(338053737),first=g.armyObjective(0);for(const guard of g.teams[first.team].guards)kill(g,guard,0);kill(g,g.teams[first.team].crystal,0);assert.equal(g.armyObjective(0).team,g.otherNeighbor(0));const living=g.teams.filter(t=>t.crystal.active);assert.equal(new Set(living.map(t=>t.armyGoal)).size,living.length);
});
test('an army keeps its shared guardian until death, then targets the other guardian and crystal',()=>{
 const g=new Crucible(17),first=g.armyObjective(0),t=g.teams[first.team];assert.equal(g.armyObjective(0),first);kill(g,first,0);const second=g.armyObjective(0);assert.equal(second.team,t.crystal.team);assert.equal(second.kind,'captain');kill(g,second,0);assert.equal(g.armyObjective(0),t.crystal);
});
test('incoming routes use the defending army exit lane in reverse for every camp',()=>{
 const g=new Crucible(17),{nodes,edges}=g.laneSegments();for(let team=0;team<8;team++){const u=g.units.find(v=>v.team===team&&v.kind==='infantry'),target=(team+1)%8;g.buildRoute(u,target);const path=u.nav.filter(p=>p.node>=0).map(p=>p.node);assert.deepEqual(path.slice(-2),[target,target+8]);assert.ok(path.includes(team));for(let i=1;i<path.length;i++)assert.ok(edges.some(([a,b])=>a===path[i-1]&&b===path[i]||b===path[i-1]&&a===path[i]));assert.deepEqual(nodes[target],g.rally(target));}
});
test('retargeting from a captured camp returns down its lane before using the next entrance',()=>{
 const g=new Crucible(17),u=g.units.find(v=>v.team===0&&v.kind==='infantry'),old=2,next=4;place(u,g.teams[old].crystal,-50);g.buildRoute(u,next);const path=u.nav.filter(p=>p.node>=0).map(p=>p.node);assert.equal(path[0],old);assert.deepEqual(path.slice(-2),[next,next+8]);
});
test('minions do not acquire the siege structure until their route reaches its base entrance',()=>{
 const g=new Crucible(17),u=g.units.find(v=>v.team===0&&v.kind==='infantry'),target=g.armyObjective(0);only(g,[u,g.teams[0].crystal,g.teams[target.team].crystal,...g.teams[target.team].guards]);g.route(u);assert.equal(g.target(u),undefined);const p=g.rally(target.team);u.x=p.x;u.y=p.y;g.rebuild();assert.equal(g.target(u),undefined);place(u,g.teams[target.team].crystal,-80);g.rebuild();assert.equal(g.target(u).team,target.team);
});
test('moving minions remain within their visible lane outside the central arena and camps',()=>{
 const g=quiet(),u=g.units.find(v=>v.team===0&&v.kind==='infantry'),base=g.teams[0].crystal,r=g.rally(0);u.x=(base.x+r.x)/2+120;u.y=(base.y+r.y)/2+120;g.rebuild();g.move(u,r.x-u.x,r.y-u.y,1/30);const {nodes,edges}=g.laneSegments();let distance=Infinity;for(const [a,b] of edges){const p=g.project(u.x,u.y,nodes[a],nodes[b]);distance=Math.min(distance,Math.hypot(u.x-p.x,u.y-p.y));}assert.ok(distance<=C.laneWidth/2-u.radius+.01);
});
test('melee and ranged troops only engage adjacent enemies and never chase them away from the route',()=>{
 for(const kind of ['infantry','ranged']){const g=quiet(),u=g.units.find(v=>v.team===0&&v.kind===kind),foe=g.teams[1].champion;Object.assign(u,{x:C.cx,y:C.cy});Object.assign(foe,{x:C.cx+80,y:C.cy,attack:1e9,power:1e9,ultimate:1e9});only(g,[u,foe,...g.teams.map(t=>t.crystal)]);assert.notEqual(g.target(u),foe);foe.x=C.cx+40;g.rebuild();assert.equal(g.target(u),foe);g.controlled=1;g.step(1/30);assert.equal(u.x,C.cx);foe.x=C.cx+80;g.step(1/30);assert.notEqual(u.target,foe.id);}
});
test('distant damage cannot pull a minion away from its assigned lane',()=>{
 const g=quiet(),u=g.units.find(v=>v.team===0&&v.kind==='infantry'),foe=g.teams[1].champion;Object.assign(u,{x:C.cx,y:C.cy,target:0,invuln:0});Object.assign(foe,{x:C.cx+100,y:C.cy});g.damage(u,1,1,false,false,foe);assert.equal(u.target,0);foe.x=C.cx+40;g.damage(u,1,1,false,false,foe);assert.equal(u.target,foe.id);
});
test('guardians and crystal prioritize any in-range attacker of their champion across perception updates',()=>{
 for(const kind of ['champion','infantry','ranged']){const g=quiet(),t=g.teams[0],hero=t.champion,attacker=g.units.find(u=>u.team===1&&u.kind===kind),decoy=g.units.find(u=>u.team===2&&u.kind==='infantry');place(hero,t.crystal,0);place(attacker,t.crystal,-120);place(decoy,t.guards[0],5);only(g,[hero,attacker,decoy,t.crystal,...t.guards]);g.damage(hero,1,1,false,false,attacker);for(const guard of [...t.guards,t.crystal])assert.equal(g.target(guard),attacker);g.time+=1;for(const guard of t.guards)assert.equal(g.target(guard),attacker);attacker.x=t.crystal.x-C.defenseRadius-10;g.rebuild();assert.notEqual(g.target(t.guards[0]),attacker);}
});
test('new attackers replace earlier retaliation priorities immediately',()=>{
 const g=quiet(),t=g.teams[0],hero=t.champion,a=g.teams[1].champion,b=g.units.find(u=>u.team===2&&u.kind==='infantry');place(hero,t.crystal,0);place(a,t.crystal,-120);place(b,t.crystal,-130);g.rebuild();g.damage(hero,1,1,false,false,a);g.damage(hero,1,2,false,false,b);for(const guard of t.guards)assert.equal(g.target(guard),b);
});
test('turrets never target stationary defenses or a champion standing in another home base',()=>{
 const g=quiet();for(const u of g.units)if(u.kind==='infantry'||u.kind==='ranged')u.active=false;for(const t of g.teams)place(t.champion,t.crystal,0);g.rebuild();for(const t of g.teams)for(const guard of t.guards)assert.equal(g.target(guard),undefined);
});
test('defensive projectiles disengage when a target leaves their local perimeter',()=>{
 const g=quiet(),t=g.teams[0],u=g.teams[1].champion;place(u,t.crystal,-220);only(g,[u,t.crystal,...t.guards]);g.fire(t.guards[0],u);assert.equal(g.shots.length,1);u.x=t.crystal.x-C.defenseRadius-20;g.controlled=1;g.step(1/30);assert.equal(g.shots.length,0);
});
test('ordinary projectile traffic reserves capacity for base defenses',()=>{
 const g=quiet(),t=g.teams[0],u=g.teams[1].champion;place(u,t.crystal,-180);for(let i=0;i<81;i++)g.fire(t.champion,u);assert.equal(g.shots.length,80);g.fire(t.guards[0],u);assert.equal(g.shots.length,81);assert.equal(g.shots.at(-1).defense,true);
});
test('guardians cannot be sniped by a champion outside retaliation range, including area damage',()=>{
 const g=quiet(),t=g.teams[0],u=g.teams[1].champion;place(u,t.crystal,-C.defenseRadius-20);g.rebuild();const hp=t.guards[0].hp;assert.equal(g.damage(t.guards[0],1000,1,false,false,u),0);g.blast(1,t.guards[0].x,t.guards[0].y,150,1000,'hag-mine');assert.equal(t.guards[0].hp,hp);place(u,t.crystal,-220);g.rebuild();assert.ok(g.damage(t.guards[0],1000,1,false,false,u)>0);assert.equal(g.target(t.guards[0]),u);
});
test('guardian armor rewards actual minion support and preserves a short siege window',()=>{
 const g=quiet(),t=g.teams[0],hero=g.teams[1].champion;place(hero,t.crystal,-220);for(const u of g.units)if(u.team===1&&u.kind!=='champion')u.active=false;g.rebuild();const solo=g.damage(t.guards[0],1000,1,false,false,hero);assert.equal(solo,100);const helpers=g.units.filter(u=>u.team===1&&u.kind==='infantry').slice(0,3);for(const u of helpers)Object.assign(u,{active:true,x:t.crystal.x-150,y:t.crystal.y});g.rebuild();const aided=g.damage(t.guards[0],1000,1,false,false,hero);assert.ok(aided>solo*6);for(const u of helpers)u.active=false;g.rebuild();assert.equal(g.damage(t.guards[0],1000,1,false,false,hero),aided);g.time+=6.1;assert.equal(g.damage(t.guards[0],1000,1,false,false,hero),solo);
});
test('an exposed crystal fires hard-hitting attacks inside its circle without guardians',()=>{
 const g=quiet(),t=g.teams[0],u=g.teams[1].champion;place(u,t.crystal,-120);only(g,[t.crystal,u]);t.crystal.attack=0;g.controlled=1;const hp=u.hp;advance(g,2);assert.ok(u.hp<hp-u.maxHp*.3);assert.equal(t.crystal.active,true);
});
test('crystals do not acquire outside their inner base circle and cannot be safely sniped from there',()=>{
 const g=quiet(),t=g.teams[0],u=g.teams[1].champion;place(u,t.crystal,-C.baseRadius-10);only(g,[t.crystal,u]);assert.equal(g.target(t.crystal),undefined);assert.equal(g.damage(t.crystal,1000,1,false,false,u),0);place(u,t.crystal,-120);g.rebuild();assert.equal(g.target(t.crystal),u);assert.ok(g.damage(t.crystal,1000,1,false,false,u)>0);
});
test('crystal and guardian hits remain individually survivable, while champion duels retain their cap',()=>{
 const g=quiet(),u=g.teams[1].champion;u.invuln=0;const hit=g.damage(u,400,0,false,true);assert.ok(hit<=u.maxHp*.2+.001&&hit>=u.maxHp*.15);const duel=g.damage(u,1e6,0);assert.ok(duel<=u.maxHp*.075+.001);assert.ok(u.active);
});

test('a full supporting wave can defeat both guardians and the armed crystal in a committed siege',()=>{
 const g=quiet(),team=4,t=g.teams[0],hero=g.teams[team].champion,army=g.units.filter(v=>v.team===team&&['infantry','ranged'].includes(v.kind)).slice(0,20);
 only(g,[hero,t.crystal,g.teams[team].crystal,...t.guards,...army]);Object.assign(hero,{x:t.crystal.x-110,y:t.crystal.y,power:0,ultimate:0});g.controlled=team;
 army.forEach((v,i)=>Object.assign(v,{x:t.crystal.x-80+i%4*12,y:t.crystal.y+(Math.floor(i/4)-2)*18,invuln:0}));g.rebuild();
 for(let i=0;i<120*30&&hero.active&&t.crystal.active;i++){for(const slot of [1,2,3])if(hero.cooldowns[slot]<=0)g.cast(team,slot);g.step(1/30);}
 assert.equal(g.guards(0),0);assert.equal(t.crystal.active,false);assert.equal(hero.active,true);
});

test('surviving minions without a crystal return along the lane graph instead of cutting across fields',()=>{
 const g=quiet(),u=g.units.find(v=>v.team===0&&v.kind==='infantry');place(u,g.teams[3].crystal,-50);g.teams[0].crystal.active=false;g.rebuild();g.route(u);const path=u.nav.filter(p=>p.node>=0).map(p=>p.node),{edges}=g.laneSegments();assert.equal(path.at(-1),0);for(let i=1;i<path.length;i++)assert.ok(edges.some(([a,b])=>a===path[i-1]&&b===path[i]||b===path[i-1]&&a===path[i]));
});


test('recall delay increases with deaths and match age, caps at sixty, and freezes when death occurs',()=>{
 const g=quiet(),t=g.teams[0];t.deaths=1;assert.equal(g.respawnDelay(0),10);t.deaths=3;g.time=360;assert.equal(g.respawnDelay(0),24);t.deaths=50;assert.equal(g.respawnDelay(0),60);t.deaths=0;g.time=179;kill(g,t.champion,1);const due=t.respawnAt;advance(g,2);assert.equal(t.respawnAt,due);assert.equal(due,189);
});
test('respawn clears all ability cooldowns and combat debuffs while retaining earned upgrades and mana',()=>{
 const g=quiet(),t=g.teams[0],u=t.champion;g.controlled=0;t.mana=500;u.x=t.crystal.x;u.y=t.crystal.y;assert.equal(g.purchase(0,'vitality'),true);const max=u.maxHp;kill(g,u,1);Object.assign(u,{attack:99,power:99,ultimate:99,poison:9,slow:9,buff:9,pulse:9,retreat:true});advance(g,10.1);assert.equal(u.active,true);assert.equal(u.maxHp,max);assert.equal(u.hp,max);for(const key of ['attack','power','ultimate','poison','slow','buff'])assert.ok(u[key]<=0,key);assert.equal(u.retreat,false);assert.equal(t.upgrades.vitality,1);assert.ok(t.mana>400);
});
test('all contenders earn passive mana while alive or recalling, but eliminated teams do not',()=>{
 const g=quiet();g.controlled=0;kill(g,g.teams[0].champion,1);g.teams[2].eliminated=true;advance(g,1);assert.ok(Math.abs(g.teams[0].mana-1)<1e-6);assert.ok(Math.abs(g.teams[1].mana-1)<1e-6);assert.equal(g.teams[2].mana,0);
});
test('mana kill rewards require actual champion damage; recent participants receive assists',()=>{
 const g=quiet(),victim=g.units.find(u=>u.team===2&&u.kind==='infantry'),a=g.teams[0].champion,b=g.teams[1].champion;victim.invuln=0;g.damage(victim,20,0,false,false,a);g.damage(victim,1e6,1,false,false,b);assert.equal(g.teams[0].mana,4);assert.equal(g.teams[1].mana,8);assert.equal(g.teams[3].mana,0);
 const next=g.units.find(u=>u.team===3&&u.kind==='infantry');next.invuln=0;g.damage(next,1e6,0,false,false,g.teams[0].guards[0]);assert.equal(g.teams[0].mana,4);
 const hero=g.teams[4].champion;hero.invuln=0;hero.hp=10;g.damage(hero,1000,0,false,false,a);assert.equal(g.teams[0].mana,154);
});
test('stale, blocked and previous-life contributions cannot generate mana assists',()=>{
 const g=quiet(),u=g.units.find(u=>u.team===2&&u.kind==='infantry'),a=g.teams[0].champion;u.invuln=0;g.damage(u,1,0,false,false,a);g.time=11;g.damage(u,1e6,1,false,false,g.teams[1].guards[0]);assert.equal(g.teams[0].mana,0);g.spawn(2);assert.ok(u.contributions.every(v=>v===-Infinity));u.invuln=1;g.damage(u,100,0,false,false,a);assert.equal(u.contributions[0],-Infinity);
});
test('crystal purchases enforce location, funds, full health, destroyed crystal and rank limits',()=>{
 const g=quiet(),t=g.teams[0],u=t.champion;t.mana=10000;place(u,t.crystal,C.baseRadius+1);assert.equal(g.purchase(0,'might'),false);place(u,t.crystal,0);assert.equal(g.purchase(0,'mend'),false);u.hp=u.maxHp*.3;assert.equal(g.purchase(0,'mend'),true);assert.ok(Math.abs(u.hp/u.maxHp-.65)<1e-8);assert.equal(t.mana,9960);for(let i=0;i<5;i++)assert.equal(g.purchase(0,'might'),true);assert.equal(g.purchase(0,'might'),false);assert.equal(t.mana,8860);t.mana=0;assert.equal(g.purchase(0,'haste'),false);t.mana=1000;t.crystal.active=false;assert.equal(g.purchase(0,'haste'),false);assert.equal(g.purchase(0,'invalid-item'),false);
});
test('augments increase real damage, health, speed and cooldown rate without bypassing duel limits',()=>{
 const g=quiet(),t=g.teams[0],u=t.champion;t.mana=10000;place(u,t.crystal,0);const victim=g.units.find(v=>v.team===1&&v.kind==='infantry');victim.invuln=0;victim.hp=1000;const before=g.damage(victim,50,0,false,false,u);assert.equal(g.purchase(0,'might'),true);assert.ok(g.damage(victim,50,0,false,false,u)>before);const hp=u.maxHp,speed=u.speed;g.purchase(0,'vitality');g.purchase(0,'swiftness');assert.ok(Math.abs(u.maxHp-hp*1.12)<1e-7);assert.equal(u.speed,speed*1.05);u.power=10;g.purchase(0,'haste');assert.ok(Math.abs(u.power-9.2)<1e-7);const rival=g.teams[1].champion;rival.invuln=0;const hurt=g.damage(rival,1e6,0,false,false,u);assert.ok(hurt<=rival.maxHp*.075);
});
test('AI cashes in mana at its own crystal under the same prices and healing rules',()=>{
 const g=quiet(),t=g.teams[0],u=t.champion;place(u,t.crystal,0);u.hp=u.maxHp*.3;t.mana=140;g.autoShop(0);assert.equal(t.mana,100);assert.ok(Math.abs(u.hp/u.maxHp-.65)<1e-8);g.time=1;u.hp=u.maxHp;g.autoShop(0);const bought=Object.entries(t.upgrades).find(([key,rank])=>rank===1);assert.ok(bought);assert.equal(t.mana,100-CRUCIBLE_SHOP[bought[0]].cost);assert.equal(t.earnedMana,0);
});

test('AI stops returning when its chosen build is complete',()=>{
 const g=quiet(),t=g.teams[0];t.build.stats=['might'];t.upgrades.might=5;t.augments=t.build.augments.slice();t.mana=10000;place(t.champion,t.crystal,C.baseRadius+20);g.autoShop(0);assert.equal(t.shopping,false);t.upgrades.might=4;g.autoShop(0);assert.equal(t.shopping,true);
});

function duel(team=0){const g=quiet(),hero=g.teams[team].champion,enemy=g.teams[(team+1)%8].champion;g.controlled=team;only(g,[hero,enemy]);Object.assign(hero,{x:C.cx,y:C.cy,invuln:0,attack:1e9,power:0,ultimate:0,cooldowns:[0,0,0,0]});Object.assign(enemy,{x:C.cx+90,y:C.cy,invuln:0,hp:100000,maxHp:100000,attack:1e9,power:1e9,ultimate:1e9,cooldowns:[1e9,1e9,1e9,1e9]});g.rebuild();return {g,hero,enemy,b:g.combat.actors[team].brain};}
test('every champion receives all four real native abilities and all thirty-two cast',()=>{
 for(let team=0;team<8;team++)for(let slot=0;slot<4;slot++){const {g,hero,b}=duel(team);assert.deepEqual(b.powers.map(p=>p.id),MONSTERS[g.teams[team].monster].abilities.map(id=>id==='kingfall'?'faultline':id));assert.equal(g.cast(team,slot),true,b.powers[slot].id);assert.ok(hero.cooldowns[slot]>0||b.powers[slot].effect==='lunge');}
});
test('native Hag flight avoids contact, leaves bombs, and still takes area damage',()=>{
 const {g,hero,enemy,b}=duel(0);g.cast(0,2);hero.invuln=0;assert.equal(g.damage(hero,100,enemy.team,false,false,enemy,'contact'),0);assert.ok(g.damage(hero,100,enemy.team,false,false,enemy,'aoe')>0);g.input={x:1,y:0};advance(g,1);assert.ok(hagState(b).flight>0);assert.ok(hagState(b).traps.length>0);assert.ok(hero.x>C.cx+100);
});
test('native Hag damage applies poison and rebuilds glamour rather than substituting a generic blast',()=>{
 const {g,hero,b}=duel(0),victim=g.units.find(u=>u.team===1&&u.kind==='infantry');Object.assign(victim,{active:true,x:hero.x+100,y:hero.y,invuln:0});g.rebuild();g.combat.prepare(0);const proxy=b.enemies.find(e=>e.serial===victim.id);b.damage(proxy,1,'hagvenom');assert.equal(hagState(b).venom.length,1);assert.ok(b.shield>0);advance(g,.6);assert.ok(victim.hp<victim.maxHp-10);assert.ok(victim.slow>0);
});
test('native Reaper basic attacks create scythe projectiles and Lycanthrope regenerates',()=>{
 const reaper=duel(7);reaper.hero.attack=0;advance(reaper.g,.05);assert.ok(reaper.b.scytheWaves.length>0);const wolf=duel(1);wolf.hero.hp=wolf.hero.maxHp*.5;const before=wolf.hero.hp;advance(wolf.g,.2);assert.ok(wolf.hero.hp>before);
});
test('native Titan movement builds momentum and Devourer Feast emits waves without nearby prey',()=>{
 const titan=duel(5);titan.g.input={x:1,y:0};advance(titan.g,.6);assert.ok(titan.b.momentum>0);assert.ok(titan.b.shield>0);const devourer=duel(4);devourer.enemy.active=false;devourer.hero.attack=0;assert.equal(devourer.g.cast(4,3),true);advance(devourer.g,.05);assert.ok(devourer.b.clawWaves.length>0);
});
test('Calamity resonance and Sovereign feeding retain their native traits',()=>{
 const calamity=duel(3);calamity.b.cooldowns=[10,10,10,10];calamity.b.completeAttack(20);assert.equal(calamity.b.cooldowns[1],9.25);assert.ok(calamity.b.shield>0);const sovereign=duel(6),victim=sovereign.g.units.find(u=>u.team===7&&u.kind==='infantry');Object.assign(victim,{active:true,x:sovereign.hero.x+50,y:sovereign.hero.y,invuln:0});sovereign.g.rebuild();assert.equal(sovereign.g.cast(6,1),true);assert.ok(sovereign.b.player.rage>0);assert.ok(sovereign.b.shield>0);
});
test('Overlord summons use a bounded pool that is reused across respawns',()=>{
 const {g,hero,b}=duel(2);g.cast(2,2);advance(g,.05);const active=g.units.filter(u=>u.active&&u.servant);assert.ok(active.length>=8);const count=g.units.length;kill(g,hero,0);assert.equal(active.some(u=>u.active),false);g.combat.reset(2);g.teams[2].eliminated=false;hero.active=true;hero.hp=hero.maxHp;hero.power=hero.ultimate=0;hero.cooldowns=[0,0,0,0];g.cast(2,2);advance(g,.05);assert.equal(g.units.length,count);assert.ok(g.combat.actors[2].brain.servants.some(s=>s.active));
});


test('expanded shop augments strengthen armies and direct-kill sustain under capped ranks',()=>{
 const g=quiet(),t=g.teams[0],u=t.champion;g.controlled=0;t.mana=2000;place(u,t.crystal,0);const troop=g.units.find(v=>v.team===0&&v.kind==='infantry'),hp=troop.maxHp;assert.equal(g.purchase(0,'legion'),true);assert.ok(troop.maxHp>hp);assert.equal(g.purchase(0,'glamour'),true);u.hp=u.maxHp*.5;const victim=g.units.find(v=>v.team===1&&v.kind==='infantry');victim.invuln=0;g.damage(victim,1e6,0,false,false,u);assert.ok(u.hp>u.maxHp*.5);for(const item of ['reach','duration','tempo','armor'])assert.equal(g.purchase(0,item),true);
});
test('full ability chains share a rolling champion damage budget',()=>{
 const {g,hero,enemy}=duel(4);hero.maxHp=hero.hp=1000;for(let i=0;i<20;i++){hero.invuln=0;g.damage(hero,1e6,enemy.team,false,false,enemy);}assert.ok(hero.hp>=700);g.time=3.1;hero.invuln=0;assert.ok(g.damage(hero,1000,enemy.team,false,false,enemy)>0);
});

test('Titan Fissure produces a real field and uses the Crucible floor rather than the original arena props',()=>{
 const {g,b}=duel(5);assert.equal(g.cast(5,2),true);assert.equal(b.fissures.length,1);assert.ok(b.fissures[0].length>100);assert.equal(b.floorClearance(100,100),5);
});
test('native Howl fear moves enemies away and interrupts their attacks',()=>{
 const {g,hero,enemy}=duel(1);g.cast(1,1);advance(g,.15);assert.ok(enemy.fear>0);const distance=Math.hypot(enemy.x-hero.x,enemy.y-hero.y);advance(g,.2);assert.ok(Math.hypot(enemy.x-hero.x,enemy.y-hero.y)>distance);
});

test('native slows affect champion movement and control effects prevent manual casts',()=>{
 const free=duel(0),slowed=duel(0);free.g.input=slowed.g.input={x:1,y:0};slowed.hero.slow=1;advance(free.g,.2);advance(slowed.g,.2);assert.ok(slowed.hero.x-C.cx<(free.hero.x-C.cx)*.6);slowed.hero.stun=1;assert.equal(slowed.g.cast(0,2),false);
});

test('manual Dominate transfers actual enemy bodies immediately instead of duplicating them',()=>{
 const {g,hero,b}=duel(2),victim=g.units.find(u=>u.team===3&&u.kind==='infantry');Object.assign(victim,{active:true,x:hero.x+50,y:hero.y,invuln:0});g.rebuild();assert.equal(g.cast(2,0),true);assert.equal(victim.active,false);assert.ok(b.servants.some(s=>s.active&&s.source==='controlled'));advance(g,.1);assert.equal(victim.active,false);
});


test('reused summon bodies get new identities and cannot inherit poison or mana contributions',()=>{
 const {g,b}=duel(2);g.cast(2,2);const a=g.combat.actors[2],servant=b.servants.find(s=>s.active),unit=a.summons.get(servant),old=unit.id;unit.contributions[0]=g.time;unit.poison=4;unit.active=false;servant.active=false;g.teams[2].champion.cooldowns[2]=0;g.cast(2,2);assert.ok(servant.active);assert.notEqual(unit.id,old);assert.equal(unit.poison,0);assert.equal(unit.contributions[0],-Infinity);
});


function learn(ctx,id){const {g,hero}=ctx,t=g.teams[hero.team];t.crystal.active=true;t.crystal.x=hero.x;t.crystal.y=hero.y;t.mana=10000;assert.equal(g.purchaseAugment(hero.team,id),true,id);t.crystal.active=false;}
test('recall permits purchases and refunds but cannot heal or resurrect early',()=>{
 const g=quiet(),t=g.teams[0],u=t.champion;g.controlled=0;place(u,t.crystal,0);t.mana=10000;g.purchase(0,'might');g.purchaseAugment(0,'remoteFuse');g.purchaseTraining(0);g.purchaseBrood(0);kill(g,u,1);assert.equal(g.shopLocation(0),'');assert.equal(g.purchase(0,'mend'),false);for(const action of [()=>g.purchase(0,'vitality'),()=>g.purchaseAugment(0,'bastion'),()=>g.purchaseTraining(0),()=>g.purchaseBrood(0),()=>g.purchaseSiege(0),()=>g.sell(0,'might'),()=>g.sellAugment(0,'remoteFuse'),()=>g.sellTraining(0),()=>g.sellBrood(0)])assert.equal(action(),true);assert.equal(u.active,false);assert.equal(u.hp,0);advance(g,10.1);assert.equal(u.active,true);assert.equal(u.hp,u.maxHp);
});
test('destroyed crystals and final elimination prevent shopping even while a previous recall was pending',()=>{
 const g=quiet(),t=g.teams[0];t.mana=1000;kill(g,t.champion,1);t.crystal.active=false;assert.equal(g.purchase(0,'might'),false);assert.equal(g.purchaseAugment(0,'bastion'),false);
});
test('augments have native ownership, two limited choices and mutually exclusive basic forms',()=>{
 const ctx=duel(4);learn(ctx,'spellshot');assert.equal(ctx.g.purchaseAugment(4,'brawler'),false);assert.equal(ctx.g.purchaseAugment(4,'remoteFuse'),false);ctx.g.teams[4].crystal.active=true;assert.equal(ctx.g.purchaseAugment(4,'bloodRush'),true);assert.equal(ctx.g.purchaseAugment(4,'bastion'),false);assert.equal(ctx.g.teams[4].augments.length,2);assert.equal(ctx.g.purchaseAugment(4,'missing'),false);
});
test('stat budgets prevent stacking every perk while army upgrades remain independent',()=>{
 const g=quiet(),t=g.teams[0];g.controlled=0;t.mana=10000;place(t.champion,t.crystal,0);for(const [item,ranks] of [['might',5],['haste',5],['vitality',5],['armor',1]])for(let n=0;n<ranks;n++)assert.equal(g.purchase(0,item),true);assert.equal(g.statRanks(0),16);assert.equal(g.purchase(0,'reach'),false);assert.equal(g.purchaseAugment(0,'bastion'),true);t.champion.hp*=.5;assert.equal(g.purchase(0,'mend'),true);
});
test('NPC builds vary by seeded plan but can never change their four native powers',()=>{
 const a=quiet(),b=quiet(),other=new Crucible(23);assert.deepEqual(a.teams.map(t=>t.build),b.teams.map(t=>t.build));assert.notDeepEqual(a.teams.map(t=>t.build),other.teams.map(t=>t.build));assert.ok(new Set(a.teams.map(t=>t.build.style)).size>=3);const kits=a.combat.actors.map(actor=>actor.brain.powers.map(p=>p.id));
 for(let team=0;team<8;team++){const t=a.teams[team];place(t.champion,t.crystal,0);t.mana=100000;for(let n=0;n<50;n++){a.time+=1;a.autoShop(team);}assert.ok(a.statRanks(team)<=CRUCIBLE_BUILD_LIMITS.stats);assert.ok(t.augments.length<=2);assert.deepEqual(a.combat.actors[team].brain.powers.map(p=>p.id),kits[team]);}assert.equal(a.combat.equip,undefined);
});
test('weapon-form augments let casters brawl or melee champions cast bolts without changing their kit',()=>{
 const caster=duel(3);learn(caster,'brawler');assert.equal(caster.b.monster.basic.ranged,false);assert.equal(caster.hero.range,140);assert.equal(MONSTERS.calamity.basic.ranged,true);const melee=duel(5);learn(melee,'spellshot');assert.equal(melee.b.monster.basic.ranged,true);assert.equal(MONSTERS.titan.basic.ranged,false);assert.equal(melee.hero.range,260);assert.deepEqual(melee.b.powers.map(p=>p.id),['worldbreaker','stampede','faultline','heavenfall']);
});
test('Arcane Cadence triggers a blast and cooldown reward after three distinct basic hits',()=>{
 const ctx=duel(0);learn(ctx,'spellweave');ctx.g.combat.prepare(0);const e=ctx.b.enemies.find(e=>e.serial===ctx.enemy.id);ctx.b.cooldowns=[5,5,5,5];for(let n=0;n<3;n++){ctx.b.time+=.1;ctx.enemy.invuln=0;ctx.b.damage(e,100,'hagvenom');}assert.equal(ctx.b.cooldowns[1],4);const before=ctx.enemy.hp;ctx.enemy.invuln=0;ctx.b.mods.update(.01,ctx.b.mods.snapshot());assert.ok(ctx.enemy.hp<before);
});
test('Bastion wards ability casts and retaliates against damage to its shield',()=>{
 const ctx=duel(0);learn(ctx,'bastion');ctx.g.cast(0,0);assert.ok(ctx.b.shield>0);ctx.hero.invuln=0;ctx.g.damage(ctx.hero,100,ctx.enemy.team,false,false,ctx.enemy);ctx.enemy.invuln=0;const before=ctx.enemy.hp;ctx.b.mods.update(.01,ctx.b.mods.snapshot());assert.ok(ctx.enemy.hp<before);
});
test('Hag augments offer remote mine detonation and a three-cloud miasma without changing cooldowns',()=>{
 const ctx=duel(0);learn(ctx,'remoteFuse');ctx.enemy.x=C.cx+1200;ctx.g.cast(0,0,{x:C.cx+250,y:C.cy});advance(ctx.g,.4);const count=hagState(ctx.b).traps.length,cool=ctx.hero.power;assert.ok(count>0);assert.equal(ctx.g.cast(0,0),true);assert.equal(hagState(ctx.b).traps.length,0);assert.equal(ctx.hero.power,cool);
 const gas=duel(0);learn(gas,'gaspockets');assert.equal(gas.g.cast(0,1),true);assert.equal(hagState(gas.b).clouds.length,3);assert.equal(gas.g.cast(0,1),true);assert.equal(hagState(gas.b).clouds.length,0);
});
test('Lycanthrope can return her cyclone or emit howls during Bloodmoon',()=>{
 const ctx=duel(1);learn(ctx,'returningGale');ctx.g.cast(1,2);advance(ctx.g,.6);const outward=ctx.b.cyclones[0];assert.ok(outward);outward.life=.001;advance(ctx.g,.05);assert.ok(ctx.b.cyclones.some(w=>w!==outward&&w.damage===outward.damage*.5));const wake=duel(1);learn(wake,'moonWake');wake.g.cast(1,3);advance(wake.g,.05);assert.ok(wake.b.effects.some(e=>e.kind==='lycanthrope-howl'));
});
test('Overlord can turn corruption kills into hazards or keep his servants in a bodyguard ring',()=>{
 const ctx=duel(2);learn(ctx,'plagueGround');ctx.g.combat.prepare(2);const e=ctx.b.enemies.find(e=>e.serial===ctx.enemy.id);ctx.enemy.hp=e.hp=1;e.corruptUntil=10;ctx.b.damage(e,10000,'dot');assert.ok(ctx.b.fields.some(f=>f.kind==='vortex'));
 const guard=duel(2);learn(guard,'royalGuard');guard.g.cast(2,2);advance(guard.g,.4);assert.ok(guard.b.servants.some(s=>s.active));assert.ok(guard.b.servants.filter(s=>s.active).every(s=>Math.hypot(s.x-guard.hero.x,s.y-guard.hero.y)<112));
});
test('Calamity can fork her ray and add a single delayed Starfall aftershock',()=>{
 const ray=duel(3);learn(ray,'splitRay');const troops=ray.g.units.filter(u=>u.team===4&&u.kind==='infantry').slice(0,2);troops.forEach((u,i)=>Object.assign(u,{active:true,x:ray.hero.x+Math.cos((i?1:-1)*.22)*250,y:ray.hero.y+Math.sin((i?1:-1)*.22)*250,hp:10000,maxHp:10000,invuln:0}));ray.g.rebuild();ray.g.cast(3,0);advance(ray.g,.05);assert.ok(troops.every(u=>u.hp<10000));
 const star=duel(3);learn(star,'starChain');star.g.cast(3,1);const original=star.b.fields[0];original.life=.001;advance(star.g,.05);assert.ok(star.b.fields.some(f=>f!==original&&f.damage===original.damage*.4));
});
test('Devourer gains ranged Lunge wakes or an inward Maw pull',()=>{
 const dash=duel(4);learn(dash,'bloodRush');dash.g.cast(4,0);assert.ok(dash.b.clawWaves.length>0);const pull=duel(4);learn(pull,'feastPull');pull.g.cast(4,1);const e=pull.g.combat.actors[4].proxies.get(pull.enemy.id);assert.ok(e.vx<0);
});
test('Titan can leave Stampede fissures or reverse World Breaker into a pull',()=>{
 const trail=duel(5);learn(trail,'quakeTrail');trail.g.cast(5,1);advance(trail.g,.4);assert.ok(trail.b.fissures.length>0);const pull=duel(5);learn(pull,'implosion');pull.g.cast(5,0);assert.ok(pull.g.combat.actors[5].proxies.get(pull.enemy.id).vx<0);
});
test('Sovereign can create a ranged Rupture fan or lingering beam hazards',()=>{
 const fan=duel(6);learn(fan,'crownflare');fan.g.cast(6,0);assert.equal(fan.b.bolts.length,3);const seal=duel(6);learn(seal,'burningRay');seal.g.cast(6,2);advance(seal.g,.05);assert.ok(seal.b.fields.some(f=>f.kind==='vortex'));
});
test('Reaper can return crescents or leave soul circles at both ends of Blink',()=>{
 const arc=duel(7);learn(arc,'returningArc');arc.g.cast(7,2);const original=arc.b.scytheWaves[0];original.remaining=.001;advance(arc.g,.05);assert.ok(arc.b.scytheWaves.some(w=>w!==original&&Math.abs(w.damage-original.damage*.4)<1e-6));const blink=duel(7);learn(blink,'graveWake');blink.g.cast(7,1);assert.equal(blink.b.relicPulses.length,2);assert.notEqual(blink.b.relicPulses[0].x,blink.b.relicPulses[1].x);
});
test('Hag can place mines on neighboring walkable lanes within casting range, including beyond the old 650 limit',()=>{
 const ctx=duel(0);ctx.g.viewport={x:740,y:440};ctx.enemy.active=false;assert.equal(ctx.g.cast(0,0,{x:C.cx+690,y:C.cy}),true);assert.ok(hagState(ctx.b).traps.some(t=>t.x>C.cx+650));assert.ok(hagState(ctx.b).traps.every(t=>ctx.b.insideMap(t.x,t.y)));
});
test('offscreen mines can free space for a new lane while visible untripped mines are preserved',()=>{
 const ctx=duel(0);ctx.enemy.active=false;ctx.g.viewport={x:220,y:140};const visible={x:C.cx,y:C.cy+100,radius:120,remaining:14,armed:0,damage:1,trigger:35};hagState(ctx.b).traps=[visible,...Array.from({length:47},(_,i)=>({x:100+i*25,y:120,radius:120,remaining:14,armed:0,damage:1,trigger:35}))];assert.equal(ctx.g.cast(0,0,{x:C.cx+200,y:C.cy}),true);assert.ok(hagState(ctx.b).traps.includes(visible));assert.ok(hagState(ctx.b).traps.length<=48);assert.ok(hagState(ctx.b).traps.some(t=>t.x>C.cx));
});
test('a full visible minefield gives explicit feedback instead of silently rejecting walkable targets',()=>{
 const ctx=duel(0);hagState(ctx.b).traps=Array.from({length:48},(_,i)=>({x:ctx.hero.x+(i%8-4)*35,y:ctx.hero.y+(Math.floor(i/8)-3)*35,radius:120,remaining:14,armed:0,damage:1,trigger:35}));assert.equal(ctx.g.cast(0,0,{x:ctx.hero.x+200,y:ctx.hero.y}),false);assert.match(ctx.b.notice,/48 \/ 48/);assert.equal(ctx.hero.power,0);
});
function attentionFixture(){const ctx=duel(0);ctx.g.controlled=0;Object.assign(ctx.enemy,{x:C.cx,y:C.cy,attack:0,power:0,ultimate:0,cooldowns:[0,0,0,0]});Object.assign(ctx.hero,{x:C.cx+90,y:C.cy});const s=ctx.g.combat.attention.states[1];s.peripheralAt=0;return {...ctx,s,npc:ctx.g.combat.actors[1].brain};}
test('rival vision matches the close viewport and requires a human-scale notice delay',()=>{
 const {g,hero,s,npc}=attentionFixture();g.viewport={x:200,y:100};hero.x=C.cx+201;assert.equal(g.combat.focusTarget(1),undefined);hero.x=C.cx+150;s.scanAt=0;s.peripheralAt=0;assert.equal(g.combat.focusTarget(1),undefined);assert.ok(s.readyAt>=.45&&s.readyAt<=.75);g.time=.8;assert.equal(g.combat.focusTarget(1),hero);g.combat.prepare(1);assert.ok(npc.canTarget(npc.enemies.find(e=>e.serial===hero.id)));hero.y=C.cy+120;g.combat.attention.update(1);assert.equal(g.combat.focusTarget(1),undefined);
});
test('rivals hold one focus and cannot simultaneously auto-target every nearby lane threat',()=>{
 const {g,hero,s,npc}=attentionFixture();g.combat.focusTarget(1);g.time=.8;assert.equal(g.combat.focusTarget(1),hero);const mob=g.units.find(u=>u.team===0&&u.kind==='infantry');Object.assign(mob,{active:true,x:C.cx+10,y:C.cy});s.scanAt=0;s.peripheralAt=0;g.combat.prepare(1);assert.equal(s.focus,hero.id);assert.equal(npc.canTarget(npc.enemies.find(e=>e.serial===mob.id)),false);assert.equal(npc.canTarget(npc.enemies.find(e=>e.serial===hero.id)),true);
});
test('rival aim is sampled instead of tracking every movement frame perfectly',()=>{
 const {g,hero,s,npc}=attentionFixture();g.combat.focusTarget(1);g.time=.8;g.combat.prepare(1);const before={...s.point};hero.x+=40;g.time+=.01;g.combat.prepare(1);assert.deepEqual(npc.targetAim(npc.enemies.find(e=>e.serial===hero.id)),before);g.time+=.4;g.combat.prepare(1);assert.ok(Math.hypot(s.point.x-hero.x,s.point.y-hero.y)<=g.difficultyRules.aimError);assert.notDeepEqual(s.point,before);
});
test('being attacked can interrupt tunnel vision, but only after the rival notices the attacker',()=>{
 const {g,hero,enemy,s}=attentionFixture(),mob=g.units.find(u=>u.team===0&&u.kind==='infantry');Object.assign(mob,{active:true,x:C.cx+220,y:C.cy});hero.x=C.cx-200;g.teams[1].goal=2;g.teams[2].crystal.x=C.cx+900;g.teams[2].crystal.y=C.cy;s.peripheralAt=Infinity;s.scanAt=0;g.combat.focusTarget(1);assert.equal(s.focus,mob.id);g.time=.8;g.combat.attention.update(1);enemy.invuln=0;g.damage(enemy,100,0,false,false,hero);const notice=s.alarmAt;assert.ok(notice>g.time+.4);g.time+=.2;g.combat.attention.update(1);assert.equal(s.focus,mob.id);g.time=notice+.4;g.combat.attention.update(1);assert.equal(s.focus,hero.id);
});

test('Spellforged Devourer can sustain Feast waves without a target and without trying to aim a nonexistent bolt',()=>{
 const ctx=duel(4);learn(ctx,'spellshot');ctx.enemy.active=false;ctx.hero.attack=0;assert.equal(ctx.g.cast(4,3),true);assert.doesNotThrow(()=>advance(ctx.g,.1));assert.ok(ctx.b.clawWaves.length>0);assert.equal(ctx.b.bolts.length,0);
});
test('rival focus decisions can favor a visible rival over nearer farm, rather than always optimizing minion kills',()=>{
 const {g,hero,s}=attentionFixture(),mob=g.units.find(u=>u.team===0&&u.kind==='infantry');Object.assign(mob,{active:true,x:C.cx+10,y:C.cy});hero.x=C.cx+160;const modes=new Set();for(let n=0;n<20;n++){g.time=n*8;s.focus=0;s.scanAt=0;s.peripheralAt=0;s.intentUntil=0;g.combat.attention.update(1);modes.add(s.mode);}assert.ok(modes.has('rival'));assert.ok(modes.has('lane'));
});
test('defensive augments preserve a larger native ward and its remaining duration',()=>{
 const ctx=duel(0);learn(ctx,'brawler');ctx.b.shield=ctx.hero.maxHp*.3;ctx.b.shieldTime=8;ctx.g.combat.prepare(0);const e=ctx.b.enemies.find(e=>e.serial===ctx.enemy.id);ctx.b.damage(e,1,'hagvenom');assert.ok(ctx.b.shield>=ctx.hero.maxHp*.3);assert.ok(ctx.b.shieldTime>=8);
});


test('the expanded battlefield separates camps and outer lanes beyond ordinary spell reach',()=>{
 const g=quiet();assert.equal(C.width,4800);assert.equal(C.height,4800);assert.ok(C.ringRadius>=650);for(let i=0;i<8;i++)for(let j=i+1;j<8;j++)assert.ok(Math.hypot(g.teams[i].crystal.x-g.teams[j].crystal.x,g.teams[i].crystal.y-g.teams[j].crystal.y)>1300);
});
test('army vision reveals nearby rivals, follows friendly troops, and disappears when the scout dies',()=>{
 const g=quiet(),scout=g.units.find(u=>u.team===0&&u.kind==='infantry'),enemy=g.teams[1].champion;only(g,[scout,enemy]);Object.assign(scout,{x:2200,y:2200});Object.assign(enemy,{x:2400,y:2200});assert.equal(g.intel.visible(0,enemy),true);enemy.x=2500;assert.equal(g.intel.visible(0,enemy),false);scout.x=2400;assert.equal(g.intel.visible(0,enemy),true);scout.active=false;assert.equal(g.intel.visible(0,enemy),false);assert.equal(g.intel.visible(-1,enemy),true);
});
test('scouted reports freeze their mana and build until a surviving ally sees the rival again',()=>{
 const g=quiet(),u=g.teams[0].champion,v=g.teams[1].champion,t=g.teams[1];only(g,[u,v]);Object.assign(u,{x:2000,y:2000});Object.assign(v,{x:2100,y:2000});t.mana=100;t.upgrades.might=1;g.intel.update(true);const first=g.intel.reports[0][1];assert.equal(first.mana,100);v.x=4000;t.mana=800;t.upgrades.might=4;t.augments.push('brawler');g.time=20;g.intel.update(true);assert.equal(g.intel.reports[0][1],first);assert.equal(first.upgrades.might,1);assert.deepEqual(first.augments,[]);v.x=2200;g.intel.update(true);assert.equal(g.intel.reports[0][1].mana,800);assert.equal(g.intel.reports[0][1].at,20);
});
test('a bot cannot notice a target in its viewport beyond shared army sight',()=>{
 const g=quiet(),u=g.teams[1].champion,v=g.teams[0].champion;only(g,[u,v]);g.viewport={x:1100,y:900};Object.assign(u,{x:2000,y:2000});Object.assign(v,{x:2750,y:2000});assert.equal(g.combat.attention.inView(1,v),false);const scout=g.units.find(w=>w.team===1&&w.kind==='infantry');Object.assign(scout,{active:true,x:2700,y:2000});assert.equal(g.combat.attention.inView(1,v),true);
});
test('ordinary spells cannot harvest distant or unscouted troops while nearby combat still works',()=>{
 const g=quiet(),u=g.teams[3].champion,v=g.units.find(w=>w.team===1&&w.kind==='infantry');only(g,[u,v]);g.controlled=3;Object.assign(u,{x:2000,y:2000});Object.assign(v,{x:2900,y:2000,hp:10000,maxHp:10000,invuln:0});g.combat.prepare(3);let b=g.combat.actors[3].brain,p=b.enemies.find(e=>e.serial===v.id);const hp=v.hp;assert.equal(b.damage(p,100,'beam'),false);assert.equal(v.hp,hp);v.x=2700;g.combat.prepare(3);p=b.enemies.find(e=>e.serial===v.id);b.damage(p,100,'meteor');assert.equal(v.hp,hp);v.x=2500;g.combat.prepare(3);p=b.enemies.find(e=>e.serial===v.id);b.damage(p,100,'meteor');assert.ok(v.hp<hp);
});
test('recall siege speed and power apply only to ordinary troops assigned to that living crystal',()=>{
 const g=quiet(),army=g.teams[0],t=g.teams[1],troop=g.units.find(u=>u.team===0&&u.kind==='infantry'),other=g.units.find(u=>u.team===2&&u.kind==='infantry');army.armyGoal=1;g.teams[2].armyGoal=3;t.champion.active=false;t.respawnAt=30;assert.equal(g.recallPush(troop),true);assert.equal(g.recallPush(other),false);assert.equal(g.recallPush(army.champion),false);troop.servant={};assert.equal(g.recallPush(troop),false);delete troop.servant;const target=g.units.find(u=>u.team===1&&u.kind==='infantry');target.invuln=0;target.hp=1000;assert.equal(g.damage(target,10,0,false,false,troop),16);const before=troop.x;only(g,[troop,t.crystal]);troop.x=2000;troop.y=2000;g.rebuild();g.move(troop,100,0,.1);assert.ok(Math.abs(troop.x-2000-troop.speed*.135)<1e-6);t.champion.active=true;assert.equal(g.recallPush(troop),false);t.champion.active=false;t.crystal.active=false;assert.equal(g.recallPush(troop),false);
});
test('stat sellback refunds the last rank price, frees budget and enforces shop location',()=>{
 const g=quiet(),t=g.teams[0];g.controlled=0;place(t.champion,t.crystal,0);t.mana=1000;assert.equal(g.purchase(0,'might'),true);assert.equal(g.purchase(0,'might'),true);assert.equal(g.sellValue(0,'might'),128);assert.equal(g.sell(0,'might'),true);assert.equal(t.mana,868);assert.equal(t.upgrades.might,1);assert.equal(g.statRanks(0),1);t.champion.x+=400;assert.equal(g.sell(0,'might'),false);assert.equal(g.sell(0,'mend'),false);assert.equal(g.sell(0,'bogus'),false);
});
test('selling and rebuying health or haste cannot create free healing or cooldown reductions',()=>{
 const g=quiet(),t=g.teams[0],u=t.champion;g.controlled=0;place(u,t.crystal,0);t.mana=10000;u.hp=10;const health=u.hp;g.purchase(0,'vitality');g.sell(0,'vitality');assert.ok(Math.abs(u.hp-health)<1e-6);u.power=10;u.cooldowns=[10,10,10,10];g.combat.actors[0].brain.lungeRecharge=10;g.purchase(0,'haste');g.sell(0,'haste');assert.ok(Math.abs(u.power-10)<1e-6);assert.ok(Math.abs(g.combat.actors[0].brain.lungeRecharge-10)<1e-6);assert.ok(u.cooldowns.every(n=>Math.abs(n-10)<1e-6));const troop=g.units.find(v=>v.team===0&&v.kind==='infantry');troop.hp=10;g.purchase(0,'legion');g.sell(0,'legion');assert.ok(Math.abs(troop.hp-10)<1e-6);
});
test('augment sellback frees a slot, restores the native basic and permits a different choice only beside the living crystal',()=>{
 const g=quiet(),t=g.teams[0],u=t.champion;g.controlled=0;place(u,t.crystal,0);t.mana=1000;g.purchaseAugment(0,'brawler');assert.equal(g.combat.actors[0].brain.monster.basic.ranged,false);assert.equal(g.sellAugment(0,'brawler'),true);assert.equal(t.mana,956);assert.equal(g.combat.actors[0].brain.monster.basic.ranged,true);assert.deepEqual(t.augments,[]);assert.equal(g.sellAugment(0,'brawler'),false);assert.equal(g.purchaseAugment(0,'remoteFuse'),true);kill(g,u,1);assert.equal(g.sellAugment(0,'remoteFuse'),true);assert.equal(g.purchaseAugment(0,'gaspockets'),true);assert.equal(u.hp,0);assert.equal(u.active,false);
});


test('siege beasts only spawn on a paid purchase, outside the normal troop cap, with a cooldown and one active limit',()=>{
 const g=quiet(),t=g.teams[0],u=t.champion;g.controlled=0;place(u,t.crystal,0);t.mana=999;assert.equal(g.purchaseSiege(0),false);assert.equal(t.siege,undefined);t.mana=10000;const count=g.units.length;assert.equal(g.purchaseSiege(0),true);assert.equal(t.mana,9000);const beast=t.siege;assert.ok(beast.active&&beast.siege);assert.equal(g.units.length,count+1);assert.equal(beast.hp,WAR.siegeHp);assert.equal(g.purchaseSiege(0),false);kill(g,beast,1);assert.equal(g.purchaseSiege(0),false);g.time=91;assert.equal(g.purchaseSiege(0),true);assert.equal(t.siege,beast);assert.equal(g.units.length,count+1);assert.equal(beast.poison,0);
});
test('siege purchases enforce home location, recall, a live crystal, enemy bases and match state',()=>{
 const g=quiet(),t=g.teams[0],u=t.champion;g.controlled=0;t.mana=5000;place(u,t.crystal,400);assert.equal(g.purchaseSiege(0),false);kill(g,u,1);assert.equal(g.purchaseSiege(0),true);g.time=100;t.crystal.active=false;assert.equal(g.purchaseSiege(0),false);t.crystal.active=true;u.active=true;place(u,t.crystal,0);g.winner=0;assert.equal(g.purchaseSiege(0),false);g.winner=-1;for(const v of g.teams.slice(1)){v.crystal.active=false;for(const guard of v.guards)guard.active=false;}assert.equal(g.purchaseSiege(0),false);
});
test('a siege beast takes several champion attacks, resists displacement and rewards the defending champion',()=>{
 const g=quiet(),t=g.teams[0],r=g.teams[1];g.controlled=0;t.mana=2000;place(t.champion,t.crystal,0);g.purchaseSiege(0);const beast=t.siege;beast.invuln=0;r.mana=0;const damage=g.damage(beast,100000,1,false,false,r.champion);assert.equal(damage,beast.maxHp*.08);assert.ok(beast.hp>beast.maxHp*.9);place(r.champion,beast,100);g.combat.prepare(1);const proxy=g.combat.actors[1].brain.enemies.find(e=>e.serial===beast.id);assert.ok(proxy);assert.equal(proxy.kind,'titan');{proxy.vx=1000;proxy.vy=1000;const before={x:beast.x,y:beast.y};g.combat.flush(1,.1);assert.equal(beast.x,before.x);assert.equal(beast.y,before.y);}while(beast.active)g.damage(beast,100000,1,false,false,r.champion);assert.equal(r.mana,80);assert.ok(g.events.some(e=>e.text.includes('destroyed')&&e.text.includes('siege beast')));
});
test('siege beasts cleave blockers and hit guarded structures much harder than ordinary troops',()=>{
 const g=quiet(),t=g.teams[0];g.controlled=0;t.mana=2000;place(t.champion,t.crystal,0);g.purchaseSiege(0);const beast=t.siege,guard=g.teams[1].guards[0],troop=g.units.find(u=>u.team===0&&u.kind==='infantry'&&!u.siege);guard.invuln=0;const normal=g.damage(guard,troop.damage,0,false,false,troop),before=guard.hp;g.siegeStrike(beast,guard);assert.ok(before-guard.hp>=normal*10);const victims=g.units.filter(u=>u.team===1&&u.kind==='infantry').slice(0,2);for(const v of victims)Object.assign(v,{x:2200,y:2200,hp:1000,maxHp:1000,invuln:0});g.rebuild();g.siegeStrike(beast,victims[0]);assert.ok(victims.every(v=>v.hp<1000));
});
test('purchased siege beasts use the shared lane route and remain additional to normal waves',()=>{
 const g=quiet(),t=g.teams[0];g.controlled=0;t.mana=2000;place(t.champion,t.crystal,0);g.purchaseSiege(0);const beast=t.siege;g.route(beast);const base=g.teams[t.armyGoal].crystal;assert.deepEqual(beast.nav.at(-1).x,base.x);assert.deepEqual(beast.nav.at(-1).y,base.y);assert.ok(beast.nav.some(p=>p.node>=0&&p.node<8));const normal=g.units.filter(u=>u.team===0&&u.active&&!u.siege&&['infantry','ranged'].includes(u.kind)).length;assert.equal(normal,16);assert.equal(g.units.filter(u=>u.team===0&&u.active&&u.siege).length,1);
});
test('a visible siege threat draws a rival home and gains focus only after a notice delay',()=>{
 const g=quiet(),t=g.teams[0],r=g.teams[1];g.controlled=0;t.mana=2000;place(t.champion,t.crystal,0);g.purchaseSiege(0);const beast=t.siege;place(beast,r.crystal,-150);place(r.champion,r.crystal,0);g.rebuild();assert.equal(g.siegeThreat(1),beast);g.combat.attention.update(1);const state=g.combat.attention.states[1];assert.equal(state.focus,beast.id);assert.ok(state.readyAt>=g.time+.45);assert.equal(g.combat.attention.targetable(1,beast.id),false);g.time=1;g.combat.attention.update(1);assert.equal(g.combat.attention.targetable(1,beast.id),true);beast.x=4000;beast.y=4000;assert.equal(g.siegeThreat(1),undefined);
});
test('army training continues after champion slots are full, uses increasing prices, and strengthens current and future troops',()=>{
 const g=quiet(),t=g.teams[0],u=t.champion;g.controlled=0;place(u,t.crystal,0);t.mana=100000;for(const [id,count] of [['might',5],['haste',5],['vitality',5],['armor',1]])for(let n=0;n<count;n++)g.purchase(0,id);g.purchaseAugment(0,'bastion');g.purchaseAugment(0,'remoteFuse');const troop=g.units.find(v=>v.team===0&&v.kind==='infantry'),hp=troop.hp;assert.equal(g.trainingCost(0),600);assert.equal(g.purchaseTraining(0),true);assert.equal(g.trainingCost(0),900);assert.equal(troop.maxHp,110*1.08);assert.ok(troop.hp>hp);assert.equal(g.statRanks(0),16);assert.equal(t.augments.length,2);for(let n=0;n<10;n++)assert.equal(g.purchaseTraining(0),true);assert.equal(t.veterans,11);troop.active=false;g.spawn(0);assert.ok(Math.abs(troop.maxHp-110*(1+.08*11))<1e-6);const victim=g.units.find(v=>v.team===1&&v.kind==='infantry');victim.invuln=0;victim.hp=1000;assert.ok(g.damage(victim,10,0,false,false,troop)>18);
});
test('training sellbacks and Legion stacking preserve missing health and cannot heal by cycling purchases',()=>{
 const g=quiet(),t=g.teams[0];g.controlled=0;place(t.champion,t.crystal,0);t.mana=10000;const troop=g.units.find(v=>v.team===0&&v.kind==='infantry');troop.hp=10;g.purchaseTraining(0);g.purchase(0,'legion');g.sell(0,'legion');g.sellTraining(0);assert.equal(t.veterans,0);assert.ok(Math.abs(troop.hp-10)<1e-6);assert.equal(g.trainingSellValue(0),0);assert.equal(g.sellTraining(0),false);place(t.champion,t.crystal,400);assert.equal(g.purchaseTraining(0),false);
});
test('NPC champions spend surplus on paid siege and training while preserving native builds',()=>{
 const g=quiet(),t=g.teams[0];place(t.champion,t.crystal,0);t.mana=50000;t.upgrades={might:5,vitality:5,haste:5,armor:1,swiftness:0,reach:0,duration:0,tempo:0,legion:0,glamour:0};t.augments=['bastion','remoteFuse'];const kit=g.combat.actors[0].brain.powers.map(p=>p.id);g.autoShop(0);assert.ok(t.siege?.active);assert.equal(t.mana,49000);g.time=2;g.autoShop(0);assert.equal(t.brood,1);assert.equal(t.mana,48550);g.time=4;g.autoShop(0);assert.equal(t.veterans,1);assert.deepEqual(g.combat.actors[0].brain.powers.map(p=>p.id),kit);
});


test('battle difficulty defaults to Normal, validates its input and retains symmetric armies and prices',()=>{
 assert.equal(new Crucible(17).difficulty,'normal');assert.equal(new Crucible(17,'invalid').difficulty,'normal');for(const level of Object.keys(CRUCIBLE_DIFFICULTIES)){const g=new Crucible(17,level);assert.equal(g.difficulty,level);assert.equal(g.teams[0].champion.hp,new Crucible(17,'hell').teams[0].champion.hp);assert.equal(g.shopCost(0,'might'),100);assert.equal(g.trainingCost(0),600);assert.equal(WAR.siegeCost,1000);}
});
test('difficulty progressively relaxes delays, errors and hesitation but Hell retains human limits',()=>{
 const values=Object.values(CRUCIBLE_DIFFICULTIES);for(let i=1;i<values.length;i++){assert.ok(values[i].noticeMin<values[i-1].noticeMin);assert.ok(values[i].castMin<values[i-1].castMin);assert.ok(values[i].aimError<values[i-1].aimError);assert.ok(values[i].missChance<values[i-1].missChance);assert.ok(values[i].rivalDamage>values[i-1].rivalDamage);assert.ok(values[i].scoreMultiplier>values[i-1].scoreMultiplier);}const hell=values[3];assert.ok(hell.noticeMin>=.45);assert.ok(hell.aimMin>=.2);assert.ok(hell.castMin>=1);assert.ok(hell.missChance>0);assert.ok(hell.aimError>0);
});
test('easier modes reduce rival champion damage to the player while rivals become easier to damage and NPC duels share the durability changes',()=>{
 const damages=[],human=[],duels=[];for(const level of Object.keys(CRUCIBLE_DIFFICULTIES)){const g=new Crucible(17,level);g.controlled=0;const u=g.teams[0].champion,v=g.teams[1].champion,w=g.teams[2].champion;for(const actor of g.combat.actors){actor.brain.shield=0;actor.brain.shieldTime=0;}u.invuln=v.invuln=w.invuln=0;damages.push(g.damage(u,100,1,false,false,v));human.push(g.damage(v,100,0,false,false,u));duels.push(g.damage(w,100,1,false,false,v));}for(let i=1;i<4;i++){assert.ok(damages[i]>damages[i-1]);assert.ok(human[i]<human[i-1]);assert.ok(duels[i]<duels[i-1]);}assert.ok(Math.abs(damages[0]/damages[3]-.50)<1e-6);
});
test('each difficulty uses its own notice and sampled aim limits without allowing fog vision',()=>{
 for(const level of Object.keys(CRUCIBLE_DIFFICULTIES)){const g=new Crucible(17,level),u=g.teams[1].champion,v=g.teams[0].champion;only(g,[u,v]);Object.assign(u,{x:C.cx,y:C.cy});Object.assign(v,{x:C.cx+90,y:C.cy});g.combat.attention.update(1);const s=g.combat.attention.states[1],rules=g.difficultyRules;assert.ok(s.readyAt>=rules.noticeMin);assert.ok(s.readyAt<=rules.noticeMin+rules.noticeSpread);assert.ok(Math.hypot(s.point.x-v.x,s.point.y-v.y)<=rules.aimError);assert.equal(g.combat.attention.targetable(1,v.id),false);g.time=s.readyAt+.4;g.combat.attention.update(1);assert.equal(g.combat.attention.targetable(1,v.id),true);v.x=C.cx+1500;g.combat.attention.update(1);assert.equal(g.combat.attention.targetable(1,v.id),false);}
});


test('shop radius is local to the living crystal and closes before leaving the wider base circle',()=>{
 const g=quiet(),t=g.teams[0];g.controlled=0;t.mana=1000;place(t.champion,t.crystal,C.shopRadius);assert.equal(g.shopLocation(0),'');t.champion.x+=1;assert.notEqual(g.shopLocation(0),'');assert.equal(g.purchase(0,'might'),false);place(t.champion,t.crystal,0);t.crystal.active=false;assert.equal(g.purchase(0,'might'),false);
});
test('Easy Normal and Hard reduce rival healing and shielding further after crystal loss, while player and Hell retain full sustain',()=>{
 for(const level of ['easy','normal','hard','hell']){const g=new Crucible(17,level);g.controlled=0;for(const team of [0,1]){const t=g.teams[team],b=g.combat.actors[team].brain;t.champion.hp=t.champion.maxHp*.2;g.combat.sync(team);const before=b.player.hp;b.heal(100);assert.ok(Math.abs(b.player.hp-before-100*g.sustainScale(team))<1e-6);b.shield=0;b.ward(100,200,3);assert.ok(Math.abs(b.shield-100*g.sustainScale(team))<1e-6);}const before=g.sustainScale(1);g.teams[1].crystal.active=false;assert.equal(g.sustainScale(0),1);assert.ok(level==='hell'?g.sustainScale(1)===1:g.sustainScale(1)<before);}
});
test('Brood muster accelerates replacement waves without raising troop caps or resetting wave progress',()=>{
 const g=quiet(),t=g.teams[0];g.controlled=0;place(t.champion,t.crystal,0);t.mana=100000;t.wave=1.75;assert.equal(g.purchaseBrood(0),true);assert.equal(t.brood,1);assert.ok(Math.abs(g.waveInterval(0)-3.5/1.2)<1e-6);assert.ok(Math.abs(t.wave/g.waveInterval(0)-.5)<1e-6);assert.equal(g.broodCost(0),675);assert.equal(g.sellBrood(0),true);assert.ok(Math.abs(t.wave-1.75)<1e-6);for(let i=0;i<13;i++)assert.equal(g.purchaseBrood(0),true);assert.equal(g.waveInterval(0),1);assert.equal(g.purchaseBrood(0),false);for(const u of g.units)if(u.team===0&&['infantry','ranged'].includes(u.kind))u.active=false;t.wave=.01;advance(g,1.2);assert.equal(g.units.filter(u=>u.team===0&&u.active&&!u.servant&&!u.siege&&['infantry','ranged'].includes(u.kind)).length,12);advance(g,5);assert.equal(g.units.filter(u=>u.team===0&&u.active&&!u.servant&&!u.siege&&['infantry','ranged'].includes(u.kind)).length,g.density);
});

test('siege pressure escalates by difficulty without changing Hell or enabling unsupported dives',()=>{
 for(const level of ['easy','normal','hard','hell']){const g=new Crucible(17,level);assert.equal(g.siegePressure(),0);g.time=420;assert.equal(g.siegePressure(),level==='easy'?6:level==='normal'?120/55:0);g.time=2000;assert.equal(g.siegePressure(),level==='hell'?0:6);assert.equal(g.siegeRequired(),level==='hell'?3:1);const t=g.teams[0],source=g.teams[1].champion;place(source,t.crystal,200);only(g,[source,t.guards[0],t.crystal]);const before=t.guards[0].hp;g.damage(t.guards[0],100,1,false,false,source);assert.ok(before-t.guards[0].hp<=10.001);}
});
test('results count objective and army kills, apply difficulty and award victory only to the winner',()=>{
 const g=quiet(),t=g.teams[0];kill(g,g.teams[1].guards[0],0);kill(g,g.teams[1].guards[1],0);kill(g,g.teams[1].crystal,0);const troop=g.units.find(u=>u.team===2&&u.kind==='infantry');kill(g,troop,0);assert.equal(t.guardianKills,2);assert.equal(t.crystalKills,1);assert.equal(t.troopKills,1);g.winner=0;const r=g.result(0);assert.equal(r.dominance,Math.round((100+100000+150000+1000000)*1.6));assert.equal(g.result(1).bonus,0);
});

test('pacing lowers crystal health by difficulty without weakening guardians',()=>{
 for(const [mode,scale] of [['easy',.5],['normal',.7],['hard',.9],['hell',1]]){const g=new Crucible(17,mode);for(const t of g.teams){assert.equal(t.crystal.hp,C.crystalHp*scale);assert.equal(t.crystal.maxHp,t.crystal.hp);assert.ok(t.guards.every(u=>u.hp===C.captainHp&&u.damage>=360));}}
});
