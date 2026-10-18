import {test} from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {Crucible,CRUCIBLE} from '../src/crucible-sim.ts';
const advance=(g,seconds)=>{for(let i=0;i<seconds*30;i++)g.step(1/30);};
const kill=(g,u,team)=>{u.invuln=0;for(let i=0;i<30&&u.active;i++)g.damage(u,100000,team);assert.equal(u.active,false);};
test('eight armies start with distinct crystals, two anchored guardians and bounded reinforcement pools',()=>{
 const g=new Crucible(17);assert.equal(g.teams.length,8);assert.equal(new Set(g.teams.map(t=>t.monster)).size,8);assert.equal(g.units.filter(u=>u.active&&['infantry','ranged'].includes(u.kind)).length,128);assert.equal(g.units.filter(u=>u.active&&u.kind==='captain').length,16);assert.equal(g.units.filter(u=>u.kind==='crystal').length,8);for(const t of g.teams)assert.equal(t.trapReady.length,3);assert.equal(g.units.length,8*(CRUCIBLE.troopCap+4));
});
test('guardians meaningfully ward their crystal until both are defeated',()=>{const g=new Crucible(17),t=g.teams[0],warded=g.damage(t.crystal,100,1);kill(g,t.guards[0],1);kill(g,t.guards[1],1);const exposed=g.damage(t.crystal,100,1);assert.ok(exposed>warded*5);assert.equal(g.guards(0),0);});
test('a champion respawns at their surviving crystal after ten seconds with arrival protection',()=>{
 const g=new Crucible(17),t=g.teams[0];kill(g,t.champion,1);assert.equal(t.eliminated,false);assert.equal(t.respawnAt,10);advance(g,9);assert.equal(t.champion.active,false);advance(g,1.1);assert.equal(t.champion.active,true);assert.ok(t.champion.invuln>2);assert.ok(Math.hypot(t.champion.x-t.crystal.x,t.champion.y-t.crystal.y)<30);
});
test('crystal destruction makes death permanent, including a champion already awaiting recall',()=>{
 for(const recalling of [true,false]){const g=new Crucible(17),t=g.teams[0];if(recalling)kill(g,t.champion,1);for(const guard of t.guards)kill(g,guard,1);kill(g,t.crystal,1);if(!recalling){assert.equal(t.eliminated,false);kill(g,t.champion,1);}assert.equal(t.eliminated,true);advance(g,12);assert.equal(t.champion.active,false);assert.equal(g.units.filter(u=>u.team===0&&u.active).length,0);}
});
test('the horde clash produces rapid troop casualties while champion hits remain bounded',()=>{
 const g=new Crucible(17);g.density=28;advance(g,120);assert.ok(g.kills>300);assert.ok(g.effects.length<=72);assert.ok(g.shots.length<=96);for(const u of g.units){assert.ok(Number.isFinite(u.x)&&Number.isFinite(u.y)&&Number.isFinite(u.hp));if(u.active)assert.ok(u.x>=95&&u.x<=2305&&u.y>=95&&u.y<=1305);}for(const t of g.teams)for(const guard of t.guards)assert.ok(Math.hypot(guard.x-guard.hx,guard.y-guard.hy)<1);const t=g.teams.find(t=>t.champion.active),u=t.champion,old=u.hp;u.invuln=0;g.damage(u,1e9,(u.team+1)%8);assert.ok(old-u.hp<=u.maxHp*.075+.001);
});
test('all eight signature powers work in this prototype without touching the live Stage 4 engine',()=>{
 for(let team=0;team<8;team++){const g=new Crucible(17),u=g.teams[team].champion,v=g.teams[(team+1)%8].champion;Object.assign(u,{x:1000,y:700,target:v.id,power:0,ultimate:0});Object.assign(v,{x:1100,y:700});g.rebuild();assert.equal(g.power(team),true);assert.ok(u.power>0);assert.equal(g.power(team,true),true);assert.ok(u.ultimate>0);}
 for(const file of ['src/crucible-sim.ts','src/crucible-prototype.ts'])assert.doesNotMatch(fs.readFileSync(file,'utf8'),/from ['"]\.\/(stage-four|profile|main)\./);
});
test('same seeds reproduce outcomes while different seeded encounters can produce different winners',()=>{
 const a=new Crucible(17),b=new Crucible(17);advance(a,10);advance(b,10);assert.deepEqual(a.units,b.units);const winners=[];for(const seed of [3,338053737]){const g=new Crucible(seed);advance(g,2400);assert.ok(g.winner>=0);winners.push(g.teams[g.winner].monster);}assert.notEqual(winners[0],winners[1]);
});
test('normalized keyboard and touch input moves the controlled champion while neutral input stops them',()=>{
 const g=new Crucible(23);g.controlled=0;const u=g.teams[0].champion,x=u.x;g.input={x:1,y:0};advance(g,.5);assert.ok(u.x>x+40);g.input={x:0,y:0};const stopped=u.x;advance(g,.2);assert.ok(Math.abs(u.x-stopped)<1);
});

test('crystal guardians withstand a four-hit champion burst and punish solo attackers more than duelists',()=>{
 const g=new Crucible(17),guard=g.teams[0].guards[0],u=g.teams[1].champion;
 for(const raw of [280,580,280,580])g.damage(guard,raw,1);
 assert.ok(guard.active);assert.ok(guard.hp>guard.maxHp*.5);
 const before=u.hp,duel=g.damage(u,190,0),defense=g.damage(u,190,0,false,true);
 assert.ok(defense>duel*3);assert.ok(before-u.hp<u.maxHp*.24);
});
test('guardian targeting lets a supporting front line absorb fire instead of always focusing its champion',()=>{
 const g=new Crucible(17),guard=g.teams[0].guards[1],hero=g.teams[1].champion,troop=g.units.find(u=>u.team===1&&u.kind==='infantry');
 for(const u of g.units)if(u!==guard&&u!==hero&&u!==troop)u.active=false;
 Object.assign(hero,{x:guard.x+110,y:guard.y});Object.assign(troop,{x:guard.x+75,y:guard.y});g.rebuild();assert.equal(g.target(guard),troop);
 troop.active=false;g.rebuild();assert.equal(g.target(guard),hero);
});

test('a solo Devourer raid is lethal while a supporting wave can clear the same crystal guardians',()=>{
 const raid=(support)=>{const g=new Crucible(17),u=g.teams[4].champion,t=g.teams[0];
  for(const v of g.units)v.active=v===u||v===t.crystal||v===g.teams[4].crystal||t.guards.includes(v);for(const team of g.teams){team.wave=1e9;team.respawnAt=1e9;team.trapReady=[1e9,1e9,1e9];}
  Object.assign(u,{x:(t.guards[0].x+t.guards[1].x)/2,y:(t.guards[0].y+t.guards[1].y)/2,power:0,ultimate:0});g.controlled=4;
  g.units.filter(v=>v.team===4&&['infantry','ranged'].includes(v.kind)).slice(0,support).forEach((v,i)=>Object.assign(v,{active:true,x:t.guards[i%2].x+15,y:t.guards[i%2].y+15,invuln:0,marched:true,objective:0}));g.rebuild();
  for(let i=0;i<900&&u.active;i++){if(u.power<=0)g.power(4);if(u.ultimate<=0)g.power(4,true);g.step(1/30);}return {alive:u.active,health:u.hp/u.maxHp,guards:g.guards(0)};
 };
 assert.equal(raid(0).alive,false);const supported=raid(12);assert.equal(supported.alive,true);assert.equal(supported.guards,0);assert.ok(supported.health>.5);
});

test('the ranged guardian can retaliate against a champion near the edge of its base',()=>{
 const g=new Crucible(17),guard=g.teams[0].guards[1],hero=g.teams[1].champion;
 for(const u of g.units)if(u!==guard&&u!==hero)u.active=false;
 Object.assign(hero,{x:g.teams[0].crystal.x-220,y:g.teams[0].crystal.y});g.rebuild();assert.equal(g.target(guard),hero);assert.ok(guard.range>=220);
});

function quietWave(kind='infantry'){
 const g=new Crucible(17),u=g.units.find(v=>v.team===0&&v.kind===kind),enemy=g.teams[1];
 for(const v of g.units)v.active=v===u||v===g.teams[0].crystal||v===enemy.crystal||v===enemy.guards[0];
 for(const t of g.teams){t.wave=1e9;t.respawnAt=1e9;t.trapReady=[1e9,1e9,1e9];}
 Object.assign(u,{x:700,y:700,marched:false,invuln:0,target:0});Object.assign(enemy.crystal,{x:1800,y:700});Object.assign(enemy.guards[0],{x:1700,y:700,hx:1700,hy:700,attack:1e9});g.rebuild();return {g,u,enemy};
}
test('both troop types must cross their central rally before approaching guardians, independently of champion goals',()=>{
 for(const kind of ['infantry','ranged']){const {g,u,enemy}=quietWave(kind);g.teams[0].goal=7;
  // An adjacent hostile base cannot divert a newly spawned wave before it crosses the center.
  Object.assign(enemy.crystal,{x:600,y:700});Object.assign(enemy.guards[0],{x:650,y:700,hx:650,hy:700});g.rebuild();advance(g,.5);assert.ok(u.x>730);assert.equal(u.marched,false);assert.equal(u.target,0);
  advance(g,5);assert.equal(u.marched,true);assert.equal(u.objective,1);assert.equal(u.target,enemy.guards[0].id);
 }
});
test('troops stop following a champion outside local aggro and resume their guardian objective',()=>{
 const {g,u,enemy}=quietWave();Object.assign(u,{x:1200,y:700,marched:true});const hero=g.teams[2].champion;Object.assign(hero,{active:true,x:1240,y:700,attack:1e9,power:1e9,ultimate:1e9});g.rebuild();assert.equal(g.target(u),hero);
 Object.assign(hero,{x:2200,y:100});g.step(1/30);assert.equal(u.target,enemy.guards[0].id);assert.ok(u.recover>0);
 // A destroyed base does not turn a surviving distant champion into a marching destination.
 enemy.guards[0].active=enemy.crystal.active=false;g.rebuild();assert.equal(g.target(u),undefined);assert.deepEqual(g.route(u),{x:1200,y:700});
});
test('a moving champion cannot keep troops chasing indefinitely while remaining within local aggro',()=>{
 const {g,u,enemy}=quietWave();Object.assign(u,{x:1200,y:700,marched:true});const hero=g.teams[2].champion;Object.assign(hero,{active:true,x:1240,y:700,attack:1e9,power:1e9,ultimate:1e9});g.rebuild();g.target(u);
 for(let i=0;i<90&&u.recover<=0;i++){hero.x=u.x+80;hero.y=u.y;g.step(1/30);}
 assert.ok(u.recover>0);assert.equal(u.target,enemy.guards[0].id);
});
test('guardian hits remove a substantial fraction of champion health while each remains survivable',()=>{
 const g=new Crucible(17),u=g.teams[1].champion,before=u.hp;
 const melee=g.damage(u,400,0,false,true),ranged=g.damage(u,360,0,false,true);
 assert.ok((melee+ranged)/u.maxHp>.25);assert.ok(melee<=u.maxHp*.20+.001);assert.ok(u.hp>0);assert.ok(u.hp<before*.75);
});
test('crowded ordinary projectile traffic cannot consume the guardian projectile reserve',()=>{
 const g=new Crucible(17),guard=g.teams[0].guards[1],u=g.teams[1].champion;
 Object.assign(u,{x:g.teams[0].crystal.x-180,y:g.teams[0].crystal.y});for(let i=0;i<80;i++)g.fire(g.teams[0].champion,u);assert.equal(g.shots.length,80);g.fire(g.teams[0].champion,u);assert.equal(g.shots.length,80);g.fire(guard,u);assert.equal(g.shots.length,81);assert.equal(g.shots.at(-1).defense,true);
});

test('without champion intervention, waves sustain a central brawl rather than quickly ending the war',()=>{
 const g=new Crucible(17);for(const t of g.teams){t.champion.active=false;t.respawnAt=1e9;}let central=0;
 for(let i=0;i<300*30;i++){g.step(1/30);if(i%30===0)central+=g.units.filter(u=>u.active&&['infantry','ranged'].includes(u.kind)&&Math.hypot((u.x-1200)/420,(u.y-700)/270)<1).length;}
 assert.ok(g.kills>2000);assert.equal(g.teams.filter(t=>t.crystal.active).length,8);assert.ok(central/300>30);
});
test('armies reserve distinct nearby bases and each army shares a locked guardian target',()=>{
 const g=new Crucible(17),rally=g.rally(0),target=g.armyObjective(0);
 assert.equal(new Set(g.teams.map(t=>t.armyGoal)).size,8);assert.ok(g.teams.every((t,i)=>t.armyGoal!==i));
 const army=g.units.filter(u=>u.team===0&&['infantry','ranged'].includes(u.kind));
 for(const [i,u] of army.entries()){Object.assign(u,{marched:true,x:i%2?2200:200,y:700});assert.equal(g.route(u),target);assert.equal(u.objective,target.team);}
 // Even a now-closer rival base cannot split the army while its current target is alive.
 const other=g.teams.find((t,i)=>i!==0&&i!==target.team);Object.assign(other.guards[0],rally);
 assert.equal(g.armyObjective(0),target);
 g.spawn(0);const reinforcement=g.units.filter(u=>u.team===0&&u.active&&['infantry','ranged'].includes(u.kind)).at(-1);g.route(reinforcement);assert.equal(reinforcement.objective,target.team);
});
test('a shared siege clears the other guardian then the crystal before choosing another base',()=>{
 const g=new Crucible(17),first=g.armyObjective(0),team=first.team;kill(g,first,0);const second=g.armyObjective(0);assert.equal(second.team,team);assert.equal(second.kind,'captain');kill(g,second,0);assert.equal(g.armyObjective(0),g.teams[team].crystal);kill(g,g.teams[team].crystal,0);const next=g.armyObjective(0);assert.ok(next);assert.notEqual(next.team,team);assert.notEqual(next.team,0);assert.equal(new Set(g.teams.filter(t=>t.crystal.active).map(t=>t.armyGoal)).size,7);
});
test('chase recovery does not make troops ignore another nearby champion',()=>{
 const {g,u}=quietWave();const escaped=g.teams[2].champion,nearby=g.teams[3].champion;
 Object.assign(u,{x:1200,y:700,marched:true,recover:3,avoid:escaped.id});Object.assign(escaped,{active:true,x:2200,y:100});Object.assign(nearby,{active:true,x:1240,y:700,attack:1e9,power:1e9,ultimate:1e9});g.rebuild();assert.equal(g.target(u),nearby);g.step(1/30);assert.equal(u.x,1200);assert.equal(u.target,nearby.id);
});
test('a nearby attacking champion provokes troops, but another minion cannot falsely attribute its hit to that champion',()=>{
 const {g,u}=quietWave(),hero=g.teams[2].champion,enemy=g.units.find(v=>v.team===2&&v.kind==='infantry');Object.assign(u,{x:1200,y:700,recover:3,avoid:hero.id,target:0});Object.assign(hero,{active:true,x:1240,y:700});g.damage(u,1,2,false,false,enemy);assert.equal(u.target,0);g.damage(u,1,2,false,false,hero);assert.equal(u.target,hero.id);assert.equal(u.recover,0);
});

test('clearing a blocking group lets the surviving wave advance together toward its shared siege target',()=>{
 const {g,u}=quietWave(),rally=g.rally(0),army=g.units.filter(v=>v.team===0&&v.kind==='infantry').slice(0,6),foes=g.units.filter(v=>v.team===2&&v.kind==='infantry').slice(0,3),hero=g.teams[0].champion;
 for(const [i,v] of army.entries())Object.assign(v,{active:true,x:rally.x,y:rally.y+(i-2)*10,marched:true,invuln:0,target:0});
 for(const [i,v] of foes.entries())Object.assign(v,{active:true,x:rally.x+20,y:rally.y+i*10,hp:100,attack:1e9,speed:0,invuln:0});
 Object.assign(hero,{active:true,x:rally.x,y:rally.y,target:foes[0].id,power:0});g.controlled=0;g.rebuild();assert.ok(army.every(v=>g.target(v)?.team===2));assert.equal(g.power(0),true);assert.ok(foes.every(v=>!v.active));
 const target=g.armyObjective(0),before=army.map(v=>Math.hypot(v.x-target.x,v.y-target.y));advance(g,2);
 for(const [i,v] of army.entries()){assert.equal(v.active,true);assert.equal(v.target,target.id);assert.ok(Math.hypot(v.x-target.x,v.y-target.y)<before[i]-180);}
});

test('the reported seed assigns eight distinct neighboring camps instead of routing Hag and Devourer across the circle',()=>{
 const g=new Crucible(338053737);for(let i=0;i<8;i++)g.armyObjective(i);
 const ring=g.teams.map((t,i)=>({i,a:Math.atan2((t.crystal.y-700)/480,(t.crystal.x-1200)/965)})).sort((a,b)=>a.a-b.a).map(v=>v.i);
 assert.equal(new Set(g.teams.map(t=>t.armyGoal)).size,8);
 for(const [index,team] of ring.entries())assert.ok([ring[(index+1)%8],ring[(index+7)%8]].includes(g.teams[team].armyGoal));
 assert.notEqual(g.teams[0].armyGoal,4);assert.notEqual(g.teams[4].armyGoal,0);
});
test('after its first neighboring crystal falls, an army prefers its other home neighbor without duplicate reservations',()=>{
 const g=new Crucible(338053737),first=g.armyObjective(0),fallen=first.team;for(const guard of g.teams[fallen].guards)kill(g,guard,0);kill(g,g.teams[fallen].crystal,0);
 const other=g.otherNeighbor(0);assert.ok(other>=0);assert.equal(g.armyObjective(0).team,other);
 const living=g.teams.filter(t=>t.crystal.active);assert.equal(new Set(living.map(t=>t.armyGoal)).size,living.length);assert.ok(living.every(t=>t.armyGoal>=0));
});
test('a clear route is not interrupted by a nearby side fight, but frontal and contact threats still engage',()=>{
 for(const kind of ['infantry','ranged']){const {g,u}=quietWave(kind),foe=g.teams[2].champion;Object.assign(u,{x:1200,y:700,marched:true});Object.assign(foe,{active:true,x:1200,y:800});g.rebuild();assert.equal(g.target(u).kind,'captain');
  Object.assign(foe,{x:1240,y:700});g.rebuild();assert.equal(g.target(u),foe);
  u.target=0;Object.assign(foe,{x:1160,y:700});g.rebuild();assert.equal(g.target(u),foe);
 }
});
test('both guardians shoot a rival beyond the decorative crystal circle and their shots meaningfully damage it',()=>{
 const g=new Crucible(17),base=g.teams[0],hero=g.teams[1].champion;for(const u of g.units)u.active=base.guards.includes(u)||u===base.crystal||u===hero;
 for(const t of g.teams){t.wave=1e9;t.respawnAt=1e9;t.trapReady=[1e9,1e9,1e9];}
 Object.assign(hero,{x:base.crystal.x-220,y:base.crystal.y,invuln:0,attack:1e9,power:1e9,ultimate:1e9});g.controlled=1;g.rebuild();for(const guard of base.guards)assert.equal(g.target(guard),hero);
 const hp=hero.hp;advance(g,2);assert.ok(hero.hp<hp-hero.maxHp*.3);
});
test('guardians resist unsupported champion combos while an actual supporting wave opens a siege window',()=>{
 const g=new Crucible(17),guard=g.teams[0].guards[0],hero=g.teams[1].champion;for(const u of g.units)if(u.team===1&&u.kind!=='champion')u.active=false;g.rebuild();
 const solo=g.damage(guard,1000,1,false,false,hero);assert.equal(solo,100);
 const helpers=g.units.filter(u=>u.team===1&&u.kind==='infantry').slice(0,3);for(const u of helpers)Object.assign(u,{active:true,x:guard.x+20,y:guard.y});g.rebuild();const supported=g.damage(guard,1000,1,false,false,hero);assert.ok(supported>solo*6);
 for(const u of helpers)u.active=false;g.rebuild();assert.equal(g.damage(guard,1000,1,false,false,hero),supported);g.time+=6.1;assert.equal(g.damage(guard,1000,1,false,false,hero),solo);
});
test('guardians defend their own champion against an aggressor even when another enemy is closer',()=>{
 const g=new Crucible(17),base=g.teams[0],hero=base.champion,attacker=g.teams[1].champion,decoy=g.units.find(u=>u.team===1&&u.kind==='infantry');
 for(const u of g.units)u.active=u===hero||u===attacker||u===decoy||u===base.crystal||base.guards.includes(u);
 Object.assign(hero,{x:base.crystal.x,y:base.crystal.y});Object.assign(attacker,{x:base.crystal.x-250,y:base.crystal.y});Object.assign(decoy,{x:base.guards[0].x+10,y:base.guards[0].y});g.rebuild();assert.equal(g.target(base.guards[0]),decoy);g.damage(hero,1,1,false,false,attacker);for(const guard of base.guards)assert.equal(guard.target,attacker.id);
});
test('casting an offensive power ends arrival invulnerability',()=>{
 const g=new Crucible(17),hero=g.teams[0].champion,enemy=g.teams[1].champion;Object.assign(hero,{x:1000,y:700,power:0,invuln:3,target:enemy.id});Object.assign(enemy,{x:1080,y:700});g.rebuild();assert.equal(g.power(0),true);assert.equal(hero.invuln,0);
});

test('guardians retain priority on any in-range attacker of their champion across perception updates',()=>{
 for(const kind of ['champion','infantry','ranged']){const g=new Crucible(17),base=g.teams[0],hero=base.champion,attacker=g.units.find(u=>u.team===1&&u.kind===kind),decoy=g.units.find(u=>u.team===2&&u.kind==='infantry');
  for(const u of g.units)u.active=u===hero||u===attacker||u===decoy||u===base.crystal||base.guards.includes(u);
  Object.assign(hero,{x:base.crystal.x,y:base.crystal.y});Object.assign(attacker,{x:base.crystal.x-220,y:base.crystal.y});Object.assign(decoy,{x:base.guards[0].x+5,y:base.guards[0].y});g.rebuild();assert.equal(g.target(base.guards[0]),decoy);
  g.damage(hero,1,1,false,false,attacker);for(const guard of base.guards){assert.equal(guard.target,attacker.id);assert.equal(g.target(guard),attacker);}g.time+=1;for(const guard of base.guards)assert.equal(g.target(guard),attacker);
  attacker.x=base.crystal.x-CRUCIBLE.defenseRadius-10;g.rebuild();assert.equal(g.target(base.guards[0]),decoy);
 }
});
test('a new in-range attacker immediately replaces the previous guardian retaliation target',()=>{
 const g=new Crucible(17),base=g.teams[0],hero=base.champion,a=g.teams[1].champion,b=g.units.find(u=>u.team===2&&u.kind==='infantry');Object.assign(hero,{x:base.crystal.x,y:base.crystal.y});Object.assign(a,{x:base.crystal.x-200,y:base.crystal.y});Object.assign(b,{x:base.crystal.x-250,y:base.crystal.y});g.rebuild();g.damage(hero,1,1,false,false,a);g.damage(hero,1,2,false,false,b);for(const guard of base.guards)assert.equal(g.target(guard),b);
});

test('turrets never acquire neighboring stationary defenses or a champion standing inside its own base',()=>{
 const g=new Crucible(338053737);for(const u of g.units)if(u.kind==='infantry'||u.kind==='ranged')u.active=false;
 for(const t of g.teams)Object.assign(t.champion,{x:t.crystal.x,y:t.crystal.y});g.rebuild();
 for(const t of g.teams)for(const guard of t.guards)assert.equal(g.target(guard),undefined);
 // Reject structures explicitly even if two camps are placed unusually close in a future layout.
 const guard=g.teams[0].guards[0],other=g.teams[1];Object.assign(other.guards[0],{x:guard.x+10,y:guard.y});Object.assign(other.crystal,{x:guard.x+20,y:guard.y});g.rebuild();assert.equal(g.target(guard),undefined);
});
test('turret projectiles disengage when their target leaves the local base perimeter',()=>{
 const g=new Crucible(17),base=g.teams[0],guard=base.guards[0],hero=g.teams[1].champion;
 Object.assign(hero,{x:base.crystal.x-220,y:base.crystal.y});g.fire(guard,hero);assert.equal(g.shots.length,1);
 hero.x=base.crystal.x-CRUCIBLE.defenseRadius-20;
 for(const t of g.teams){t.wave=1e9;t.respawnAt=1e9;t.trapReady=[1e9,1e9,1e9];}for(const u of g.units)if(u!==hero&&u!==guard&&u!==base.crystal)u.active=false;
 const hp=hero.hp;g.controlled=1;g.step(1/30);assert.equal(g.shots.length,0);assert.equal(hero.hp,hp);assert.equal(guard.target,0);
});
test('ranged and melee minions ignore all non-adjacent side and forward fights, then engage contact without chasing',()=>{
 for(const kind of ['infantry','ranged']){const {g,u}=quietWave(kind),foe=g.teams[2].champion;Object.assign(u,{x:1200,y:700,marched:true});Object.assign(foe,{active:true,x:1280,y:700,attack:1e9,power:1e9,ultimate:1e9});g.controlled=2;g.rebuild();assert.equal(g.target(u).kind,'captain');
  foe.x=1240;g.rebuild();assert.equal(g.target(u),foe);const x=u.x;g.step(1/30);assert.equal(u.x,x);
  foe.x=1280;g.step(1/30);assert.equal(u.target,g.teams[1].guards[0].id);assert.ok(u.x>x);
 }
});
