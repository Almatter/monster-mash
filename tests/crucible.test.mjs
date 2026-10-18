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
 const a=new Crucible(17),b=new Crucible(17);advance(a,10);advance(b,10);assert.deepEqual(a.units,b.units);const winners=[];for(const seed of [3,338053737]){const g=new Crucible(seed);advance(g,1500);assert.ok(g.winner>=0);winners.push(g.teams[g.winner].monster);}assert.notEqual(winners[0],winners[1]);
});
test('normalized keyboard and touch input moves the controlled champion while neutral input stops them',()=>{
 const g=new Crucible(23);g.controlled=0;const u=g.teams[0].champion,x=u.x;g.input={x:1,y:0};advance(g,.5);assert.ok(u.x>x+40);g.input={x:0,y:0};const stopped=u.x;advance(g,.2);assert.ok(Math.abs(u.x-stopped)<1);
});

test('crystal guardians withstand a four-hit champion burst and punish solo attackers more than duelists',()=>{
 const g=new Crucible(17),guard=g.teams[0].guards[0],u=g.teams[1].champion;
 for(const raw of [280,580,280,580])g.damage(guard,raw,1);
 assert.ok(guard.active);assert.ok(guard.hp>guard.maxHp*.5);
 const before=u.hp,duel=g.damage(u,190,0),defense=g.damage(u,190,0,false,true);
 assert.ok(defense>duel*3);assert.ok(before-u.hp<u.maxHp*.15);
});
test('guardian targeting lets a supporting front line absorb fire instead of always focusing its champion',()=>{
 const g=new Crucible(17),guard=g.teams[0].guards[1],hero=g.teams[1].champion,troop=g.units.find(u=>u.team===1&&u.kind==='infantry');
 for(const u of g.units)if(u!==guard&&u!==hero&&u!==troop)u.active=false;
 Object.assign(hero,{x:guard.x+110,y:guard.y});Object.assign(troop,{x:guard.x+75,y:guard.y});g.rebuild();assert.equal(g.target(guard),troop);
 troop.active=false;g.rebuild();assert.equal(g.target(guard),hero);
});

test('a solo Devourer raid is lethal while a supporting wave can clear the same crystal guardians',()=>{
 const raid=(support)=>{const g=new Crucible(17),u=g.teams[4].champion,t=g.teams[0];
  for(const v of g.units)v.active=v===u||t.guards.includes(v);for(const team of g.teams){team.wave=1e9;team.respawnAt=1e9;}
  Object.assign(u,{x:(t.guards[0].x+t.guards[1].x)/2,y:(t.guards[0].y+t.guards[1].y)/2,power:0,ultimate:0});g.controlled=4;
  g.units.filter(v=>v.team===4&&['infantry','ranged'].includes(v.kind)).slice(0,support).forEach((v,i)=>Object.assign(v,{active:true,x:t.guards[i%2].x+15,y:t.guards[i%2].y+15,invuln:0}));g.rebuild();
  for(let i=0;i<360&&u.active;i++){if(u.power<=0)g.power(4);if(u.ultimate<=0)g.power(4,true);g.step(1/30);}return {alive:u.active,health:u.hp/u.maxHp,guards:g.guards(0)};
 };
 assert.equal(raid(0).alive,false);const supported=raid(12);assert.equal(supported.alive,true);assert.equal(supported.guards,0);assert.ok(supported.health>.5);
});

test('the ranged guardian can retaliate against a champion attacking from normal ranged-basic distance',()=>{
 const g=new Crucible(17),guard=g.teams[0].guards[1],hero=g.teams[1].champion;
 for(const u of g.units)if(u!==guard&&u!==hero)u.active=false;
 Object.assign(hero,{x:guard.x+300,y:guard.y});g.rebuild();assert.equal(g.target(guard),hero);assert.ok(guard.range>=300);
});
