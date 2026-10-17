import {test} from 'node:test';import assert from 'node:assert/strict';
import {WarGame,WAR_SENTRY} from '../src/stage-four.ts';
import {WAR_SENTRIES,WAR_CAMPS} from '../src/war-map.ts';
import {ENEMIES} from '../src/data.ts';
import {createArmyRoutes,armyRoute} from '../src/war-routes.ts';
import {mapSentries,ensureMapSentries,validateMapDocument} from '../src/realm-map-document.ts';
import fs from 'node:fs';
const idle={x:0,y:0,aimX:0,aimY:0,aiming:false};
function fresh(){const g=new WarGame(77,{monsterId:'hag'});g.time=1;g.war.allies=[];g.war.production.fill(Infinity);g.war.disabled.fill(Infinity);g.attack=999;return g;}
test('an offscreen continuing Calamity beam cannot damage the player, but still fights NPCs',()=>{
 const g=fresh();for(const e of g.enemies)e.active=false;Object.assign(g.player,{x:0,y:320});g.targetView={x:140,y:120};
 const e=g.war.leaders.find(l=>l.monsterId==='calamity').actor,a=g.war.actors.get(e.serial),b=a.brain;e.active=true;Object.assign(e,{x:350,y:320});const troop=g.actor(0,'infantry',0,100,320);Object.assign(troop,{x:100,y:320,hp:10000,maxHp:10000});
 g.brain(e,a,.15);g.time=a.reaction.readyAt+.01;const hp=g.player.hp;b.beamPower=b.powers.find(p=>p.effect==='beam');assert.ok(b.beamPower);b.beam=2;b.beamTick=0;b.player.angle=Math.PI;b.attack=999;
 g.brain(e,a,.15);assert.equal(g.player.hp,hp);assert.ok(troop.hp<10000,'offscreen NPC combat must continue');
 e.x=60;e.y=320;b.beam=2;b.beamTick=0;b.player.angle=Math.PI;b.player.invuln=0;g.time+=1;g.player.invuln=0;g.brain(e,a,.15);assert.ok(g.player.hp<hp,'beam works once the caster is visible');
});
test('sentries exceed titan mob health and fire doubled damage',()=>{const g=fresh(),e=g.enemies.find(e=>g.war.actors.get(e.serial)?.role==='sentry');assert.ok(e.maxHp>=ENEMIES.titan.hp);assert.equal(e.maxHp,WAR_SENTRY.hp);assert.equal(e.kind,'titan');assert.equal(WAR_SENTRY.damage,150);});
test('sentries choose nearest visible enemy and retarget a champion threatening a friendly champion',()=>{
 const g=fresh(),camp=g.war.owners.indexOf(0),tower=g.enemies.find(e=>g.war.actors.get(e.serial)?.role==='sentry'&&g.war.actors.get(e.serial)?.camp===camp),rival=g.war.leaders[1].actor;
 for(const e of g.enemies)if(e!==tower&&e!==rival)e.active=false;Object.assign(g.player,{x:tower.x+100,y:tower.y+120});Object.assign(rival,{x:tower.x+400,y:tower.y+120});const troop=g.actor(1,'infantry',camp,tower.x+150,tower.y+120);Object.assign(troop,{x:tower.x+150,y:tower.y+120});assert.equal(g.sentryTarget(0,tower).enemy,troop);
 const a=g.war.actors.get(rival.serial);a.brain.cast=()=>false;a.brain.attack=999;g.targetView={x:1000,y:1000};g.brain(rival,a,.1);g.time=a.reaction.readyAt+.01;g.brain(rival,a,.1);assert.equal(g.war.sentryThreat[camp].serial,rival.serial);tower.timer=0;g.update(.01,idle);assert.ok(g.war.projectiles.some(p=>p.source===tower.serial&&p.target===rival.serial));
});
test('extra sentries spawn, anchor, rebuild independently and inherit their assigned camp',()=>{
 const index=WAR_SENTRIES.length,config={id:'test-extra-sentry',camp:0,x:WAR_CAMPS[0].x+100,y:WAR_CAMPS[0].y};WAR_SENTRIES.push(config);
 try{const g=fresh(),tower=g.enemies.find(e=>g.war.actors.get(e.serial)?.sentry===index);assert.ok(tower);assert.equal(tower.coverStructure,config.id);const a=g.war.actors.get(tower.serial);tower.active=false;g.fallen(tower,a,1);assert.equal(g.war.disabled[index],g.time+25);assert.equal(g.war.disabled[0],Infinity);g.war.owners[0]=0;g.time+=26;g.update(.01,idle);const rebuilt=g.enemies.find(e=>e.active&&g.war.actors.get(e.serial)?.sentry===index);assert.ok(rebuilt);assert.equal(g.war.actors.get(rebuilt.serial).team,0);assert.equal(rebuilt.x,config.x);}finally{WAR_SENTRIES.pop();}
});
test('centerline bends determine army routes, shared endpoints connect, and disconnected routes fall back',()=>{
 const convert=p=>({x:p[0],y:p[1]}),goal={x:400,y:0},lines=[[[0,0],[100,150],[200,150]],[[200,150],[300,100],[400,0]]];const route=createArmyRoutes(lines,convert)({x:0,y:0},goal);assert.ok(route.some(p=>p.y===150));assert.ok(route.some(p=>p.y===100));assert.deepEqual(route.at(-1),goal);
 const fallback=createArmyRoutes([[[0,0],[100,0]],[[300,0],[400,0]]],convert)({x:0,y:0},goal);assert.deepEqual(fallback,[goal]);
 assert.ok(armyRoute(WAR_CAMPS[0],WAR_CAMPS[4]).length>3);
});
test('turret placements round-trip and validate owning camps, IDs and count',()=>{
 const d=JSON.parse(fs.readFileSync('public/assets/stage4/map-document.json','utf8'));assert.equal(mapSentries(d).length,8);ensureMapSentries(d);d.sentries.push({id:'extra-sentry',camp:'hag',point:[640,640]});assert.equal(validateMapDocument(d).sentries.length,9);d.sentries.at(-1).camp='missing';assert.throws(()=>validateMapDocument(d),/turret/);d.sentries.at(-1).camp='hag';d.sentries.at(-1).id=d.sentries[0].id;assert.throws(()=>validateMapDocument(d),/turret/);
});
test('traveling minions use shared centerline waypoints instead of steering straight to the destination camp',()=>{
 const g=fresh();for(const e of g.enemies)e.active=false;Object.assign(g.player,{x:4000,y:4000});g.war.armyGoal=4;const start=WAR_CAMPS[0].barracks,e=g.actor(0,'infantry',0,start.x,start.y),a=g.war.actors.get(e.serial);g.update(.05,idle);assert.equal(a.route.goal,4);assert.ok(a.route.points.length>3);assert.ok(Number.isFinite(e.x));g.war.armyGoal=2;g.update(.05,idle);assert.equal(a.route.goal,2);
});
test('a turret also switches to the actual minion attacking its champion without blaming the rival champion',()=>{
 const g=fresh(),camp=g.war.owners.indexOf(0),tower=g.enemies.find(e=>g.war.actors.get(e.serial)?.role==='sentry'&&g.war.actors.get(e.serial)?.camp===camp);for(const e of g.enemies)if(e!==tower)e.active=false;Object.assign(g.player,{x:tower.x,y:tower.y+150});const near=g.actor(1,'infantry',camp,tower.x+60,tower.y+150),attacker=g.actor(1,'arbalist',camp,tower.x+300,tower.y+150);Object.assign(near,{x:tower.x+60,y:tower.y+150});Object.assign(attacker,{x:tower.x+300,y:tower.y+150});assert.equal(g.sentryTarget(0,tower).enemy,near);g.hit(null,10,1,attacker.serial);assert.equal(g.war.sentryThreat[camp].serial,attacker.serial);tower.timer=0;g.update(.01,idle);assert.ok(g.war.projectiles.some(p=>p.source===tower.serial&&p.target===attacker.serial));
});
