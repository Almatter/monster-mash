import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Crucible,CRUCIBLE as C} from '../src/crucible-sim.ts';
const advance=(g,seconds)=>{for(let i=0;i<seconds*30;i++)g.step(1/30);};
const kill=(g,u,team)=>{u.invuln=0;for(let i=0;i<30&&u.active;i++)g.damage(u,1e6,team);assert.equal(u.active,false);};
function quiet(){const g=new Crucible(17);for(const t of g.teams){t.wave=1e9;t.respawnAt=1e9;t.trapReady=[1e9,1e9,1e9];}return g;}
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
 const a=new Crucible(17),b=new Crucible(17),c=new Crucible(23);advance(a,20);advance(b,20);assert.deepEqual(a.units,b.units);assert.notDeepEqual(a.teams.map(t=>t.crystal.x),c.teams.map(t=>t.crystal.x));
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
 for(let i=0;i<120*30&&hero.active&&t.crystal.active;i++){if(hero.power<=0)g.power(team);if(hero.ultimate<=0)g.power(team,true);g.step(1/30);}
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
 const g=quiet(),t=g.teams[0],u=t.champion;place(u,t.crystal,0);u.hp=u.maxHp*.3;t.mana=140;g.autoShop(0);assert.equal(t.mana,100);assert.ok(Math.abs(u.hp/u.maxHp-.65)<1e-8);g.time=1;u.hp=u.maxHp;g.autoShop(0);assert.equal(t.mana,0);assert.equal(t.upgrades.might,1);assert.equal(t.earnedMana,0);
});

test('AI does not keep returning to shop after every augment is maxed out',()=>{
 const g=quiet(),t=g.teams[0];Object.assign(t.upgrades,{might:5,vitality:5,haste:5,swiftness:4});t.mana=10000;place(t.champion,t.crystal,C.baseRadius+20);g.autoShop(0);assert.equal(t.shopping,false);t.upgrades.might=4;g.autoShop(0);assert.equal(t.shopping,true);
});
