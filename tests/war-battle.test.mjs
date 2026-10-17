import {test} from 'node:test';import assert from 'node:assert/strict';
import {WarGame,WAR_SENTRY} from '../src/stage-four.ts';
import {WarBattleLog} from '../src/war-battle.ts';
import {battleLine} from '../src/war-battle-view.ts';
const fresh=()=>{const g=new WarGame(77,{monsterId:'calamity'});g.time=1;g.war.allies=[];return g;};
test('player champion kills preserve the finishing power before camp ownership changes',()=>{
 const g=fresh(),e=g.war.leaders[1].actor,victim=g.war.leaders[1].monsterId;e.hp=1;g.damage(e,10000,'beam');assert.equal(g.battle.events.length,1);const event=g.battle.events[0];assert.equal(event.victim.owner,victim);assert.equal(event.killer.owner,'calamity');assert.equal(event.killer.role,'champion');assert.equal(event.killer.attack,g.powers.find(p=>p.effect==='beam').name);assert.equal(event.finishingDamage,1);assert.equal(event.victim.role,'champion');assert.match(battleLine(event),/defeated/);g.damage(e,10000,'beam');assert.equal(g.battle.events.length,1);
});
test('turret and minion finishing blows are attributed to their unit, not the owning champion',()=>{
 for(const role of ['sentry','infantry','arbalist','siege']){const g=fresh(),e=g.war.leaders[1].actor,tower=g.enemies.find(e=>g.war.actors.get(e.serial)?.role==='sentry'&&g.war.actors.get(e.serial)?.team===0),source=role==='sentry'?tower:g.actor(0,role,0,e.x,e.y+100);e.hp=1;g.hit(e,10000,0,source.serial,role==='infantry'?'contact':'ranged');const event=g.battle.events.at(-1);assert.equal(event.killer.role,role);assert.equal(event.killer.owner,'calamity');if(role==='sentry')assert.equal(event.killer.attack,'Sentry bolt');}
});
test('NPC proxy hits preserve poison / power cause through champion combat and conquest',()=>{
 const g=fresh(),source=g.war.leaders[1].actor,a=g.war.actors.get(source.serial),victim=g.war.leaders[2].actor;Object.assign(source,{x:0,y:320});Object.assign(victim,{x:100,y:320});g.brain(source,a,.15);const proxy=a.proxies.get(victim.serial);assert.ok(proxy);const sourceOwner=g.war.leaders[1].monsterId;victim.hp=1;a.brain.damage(proxy,10000,'hagpoison');const event=g.battle.events.at(-1);assert.equal(event.killer.owner,sourceOwner);assert.equal(event.killer.attack,'Poison');assert.equal(event.killer.role,'champion');assert.equal(event.victim.owner,g.war.leaders[2].monsterId);
});
test('player death is recorded once with actual turret cause and blocked hits add no damage',()=>{
 const g=fresh(),tower=g.enemies.find(e=>g.war.actors.get(e.serial)?.role==='sentry'&&g.war.actors.get(e.serial)?.team===1);g.player.invuln=10;g.hit(null,WAR_SENTRY.damage,1,tower.serial,'ranged');assert.equal(g.battle.events.length,0);g.player.invuln=0;g.player.hp=1;g.hit(null,WAR_SENTRY.damage,1,tower.serial,'ranged');assert.equal(g.battle.events.length,1);const e=g.battle.events[0];assert.equal(e.victim.owner,'calamity');assert.equal(e.killer.role,'sentry');assert.equal(e.finishingDamage,1);g.hit(null,99999,1,tower.serial);assert.equal(g.battle.events.length,1);
});
test('finishing hit and recent contributors remain distinct and old damage expires',()=>{
 const log=new WarBattleLog(),victim={owner:'hag',role:'champion',unit:'Champion',attack:''},a={owner:'reaper',role:'champion',unit:'Champion',attack:'Scythe'},b={owner:'titan',role:'sentry',unit:'Iron Foundry sentry',attack:'Sentry bolt'};
 log.hit(1,victim,a,1000,700,1000,1,'Road',1);log.hit(1,victim,a,700,400,1000,10,'Road',1);log.hit(1,victim,b,400,0,1000,11,'Road',1);const e=log.events[0];assert.equal(e.killer.role,'sentry');assert.equal(e.recent.find(r=>r.credit.role==='champion').damage,300);assert.equal(e.recent.find(r=>r.credit.role==='sentry').damage,400);assert.equal(e.finishingDamage,400);const snapshot=log.snapshot();snapshot.events[0].killer.owner='changed';assert.equal(log.events[0].killer.owner,'titan');
});
test('launched turret bolts retain original attribution after their source is captured',()=>{
 const g=fresh(),source=g.enemies.find(e=>g.war.actors.get(e.serial)?.role==='sentry'&&g.war.actors.get(e.serial)?.team===0),victim=g.war.leaders[1].actor,credit=g.credit(0,source.serial,'sentry');g.war.actors.get(source.serial).team=2;victim.hp=1;g.hit(victim,10000,0,source.serial,'ranged','sentry',credit);assert.equal(g.battle.events[0].killer.owner,'calamity');assert.equal(g.battle.events[0].killer.role,'sentry');
});
test('ordinary minion deaths do not flood the report, and turret losses retain champion history',()=>{
 const g=fresh(),troop=g.actor(1,'infantry',0,0,320);g.damage(troop,99999,'direct');assert.equal(g.battle.events.length,0);const log=new WarBattleLog(),champion={owner:'hag',role:'champion',unit:'Champion',attack:'Hex'},tower={owner:'titan',role:'sentry',unit:'Sentry',attack:'Bolt'};log.hit(0,champion,tower,1,0,100,1,'Camp',1);for(let i=1;i<120;i++)log.hit(i,tower,champion,1,0,100,i,'Camp',1);assert.equal(log.events.length,96);assert.equal(log.events[0].victim.role,'champion');assert.equal(log.omitted,24);
});
test('battle diagnostics do not change conquest, score or seeded random choices',()=>{
 const a=fresh(),b=fresh();b.battle.hit=()=>{};for(const g of [a,b])for(let team=1;team<8;team++){const e=g.war.leaders[team].actor;e.hp=1;g.war.actors.get(e.serial).brain.player.invuln=0;g.damage(e,999999,'beam');}assert.deepEqual(a.war.owners,b.war.owners);assert.deepEqual(a.summary(),b.summary());assert.equal(a.score.dominance,b.score.dominance);assert.equal(a.random(),b.random());assert.equal(a.battle.events.length,7);assert.equal(b.battle.events.length,0);
});
