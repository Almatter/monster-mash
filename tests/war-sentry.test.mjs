import {test} from 'node:test';
import assert from 'node:assert/strict';
import {WarGame,WAR_SENTRY} from '../src/stage-four.ts';
import {WAR_CAMPS,warCoverAt} from '../src/war-map.ts';
import {WarVision} from '../src/war-vision.ts';
const idle={x:0,y:0,aimX:0,aimY:0,aiming:false};
function fixture(){const g=new WarGame(77,{monsterId:'hag'});g.time=1;g.war.allies=[];g.war.production.fill(Infinity);g.war.disabled.fill(Infinity);g.attack=999;const camp=g.war.owners.indexOf(0),sentry=g.enemies.find(e=>g.war.actors.get(e.serial)?.role==='sentry'&&g.war.actors.get(e.serial)?.camp===camp),rival=g.war.leaders[1].actor;for(const e of g.enemies)if(e!==sentry&&e!==rival)e.active=false;const b=g.war.actors.get(rival.serial).brain;b.cast=()=>false;b.attack=999;rival.x=sentry.x+700;rival.y=sentry.y;sentry.timer=0;return {g,camp,sentry,rival};}

test('all eight turrets spawn and ignore their own hiding mask, while ordinary actors still hide behind them',()=>{
 const g=new WarGame(77,{monsterId:'hag'}),vision=new WarVision();
 for(let camp=0;camp<8;camp++){
  const e=g.enemies.find(e=>g.war.actors.get(e.serial)?.role==='sentry'&&g.war.actors.get(e.serial)?.camp===camp),p=WAR_CAMPS[camp].sentry;
  assert.ok(e?.active);assert.equal(e.coverStructure,WAR_CAMPS[camp].id+'-sentry');assert.ok(warCoverAt(p.x,p.y).length);assert.equal(warCoverAt(p.x,p.y,e.coverStructure).length,0);
  assert.equal(vision.visible(99,{x:p.x,y:p.y+300},e,0,800),true);
  assert.equal(vision.visible(99,{x:p.x,y:p.y+300},{x:p.x,y:p.y,serial:-10-camp},0,800),false);
 }
});

test('shielded base occupants still provoke a turret, which reaches rivals beyond its former range',()=>{
 const {g,camp,sentry,rival}=fixture(),hp=g.player.hp;g.shield=10000;const closer=g.actor(1,'infantry',camp,sentry.x+40,sentry.y);g.hit(null,100,1,rival.serial);assert.equal(g.player.hp,hp);assert.equal(g.war.sentryThreat[camp].serial,rival.serial);g.update(.01,idle);
 assert.ok(closer.active);assert.ok(g.war.projectiles.some(p=>p.source===sentry.serial&&p.target===rival.serial));
});

test('turrets prioritize rival champions attacking friendly troops, and normal minion attacks do not blame their champion',()=>{
 const {g,camp,sentry,rival}=fixture(),troop=g.actor(0,'infantry',camp,sentry.x+80,sentry.y);g.hit(troop,10,1,rival.serial);assert.equal(g.war.sentryThreat[camp].serial,rival.serial);
 g.war.sentryThreat[camp]={serial:0,until:0};const enemy=g.actor(1,'infantry',camp,sentry.x+40,sentry.y);g.hit(troop,10,1,enemy.serial);assert.equal(g.war.sentryThreat[camp].until,0);
 const enemyCamp=g.war.owners.indexOf(1);g.hit(rival,10,0,troop.serial);assert.equal(g.war.sentryThreat[enemyCamp].until,0);
});

test('a real turret bolt reaches and damages its retaliatory target',()=>{
 const {g,camp,sentry,rival}=fixture(),b=g.war.actors.get(rival.serial).brain,hp=rival.hp;g.hit(null,1,1,rival.serial);sentry.timer=0;
 for(let i=0;i<35;i++){rival.x=sentry.x+700;rival.y=sentry.y;b.player.invuln=0;g.update(.05,idle);}
 assert.ok(rival.hp<hp,'turret projectiles must reduce rival health');assert.ok(g.war.sentryThreat[camp].until>g.time);
});

test('turret damage has comparable health impact on player and enlarged NPC champion bodies',()=>{
 const a=new WarGame(77,{monsterId:'hag'}),e=a.war.leaders.find(l=>l.monsterId==='sovereign').actor,sentry=a.enemies.find(e=>a.war.actors.get(e.serial)?.role==='sentry'&&a.war.actors.get(e.serial)?.team===0);a.war.allies=[];const hp=e.hp;a.hit(e,WAR_SENTRY.damage,0,sentry.serial,'ranged');const fraction=(hp-e.hp)/e.maxHp;
 const b=new WarGame(77,{monsterId:'sovereign'});b.war.allies=[];const enemy=b.enemies.find(e=>b.war.actors.get(e.serial)?.role==='sentry'&&b.war.actors.get(e.serial)?.team===1),health=b.player.hp;b.hit(null,WAR_SENTRY.damage,1,enemy.serial,'ranged');assert.ok(Math.abs(fraction-(health-b.player.hp)/b.player.maxHp)<1e-8);assert.ok(fraction>=.07);
});

test('destroyed turrets rebuild for the current owner after their downtime',()=>{
 const {g,sentry,rival}=fixture(),camp=g.war.actors.get(sentry.serial).camp,enemyCamp=g.war.owners.indexOf(1),p=WAR_CAMPS[enemyCamp].sentry,tower=g.actor(1,'sentry',enemyCamp,p.x,p.y);g.damage(tower,1e7,'ultimate');assert.equal(tower.active,false);assert.equal(g.war.disabled[enemyCamp],g.time+WAR_SENTRY.rebuild);g.war.owners[enemyCamp]=0;rival.active=false;
 g.time+=WAR_SENTRY.rebuild+.1;g.update(.01,idle);const rebuilt=g.enemies.filter(e=>e.active&&g.war.actors.get(e.serial)?.role==='sentry'&&g.war.actors.get(e.serial)?.camp===enemyCamp);assert.equal(rebuilt.length,1);assert.equal(g.war.actors.get(rebuilt[0].serial).team,0);assert.deepEqual({x:rebuilt[0].x,y:rebuilt[0].y},p);assert.ok(camp!==enemyCamp);
});

test('turrets remain anchored when rival ability proxies apply knockback',()=>{
 const {g,sentry,rival}=fixture(),a=g.war.actors.get(rival.serial),anchor={x:sentry.x,y:sentry.y};rival.x=sentry.x+150;g.brain(rival,a,.1);const proxy=a.proxies.get(sentry.serial);assert.ok(proxy);proxy.vx=2000;proxy.vy=1000;g.time+=.1;g.brain(rival,a,.1);assert.deepEqual({x:sentry.x,y:sentry.y},anchor);
 sentry.x+=100;sentry.vx=1000;g.update(.01,idle);assert.deepEqual({x:sentry.x,y:sentry.y},anchor);assert.equal(sentry.vx,0);
});
