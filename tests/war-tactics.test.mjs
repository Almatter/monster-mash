import {test} from 'node:test';
import assert from 'node:assert/strict';
import {WarGame} from '../src/stage-four.ts';
import {WAR_DUEL,warChampionDamage} from '../src/war-combat.ts';
import {WarVision,WAR_SIGHT} from '../src/war-vision.ts';
import {warCoverAt,warBehindCover,insideWar,warWorld} from '../src/war-map.ts';
import {WAR_MAP_DATA} from '../src/war-map-data.ts';
import {WAR_BANNERS,warBanner,warRelation} from '../src/war-colors.ts';
import {MONSTERS} from '../src/content-monsters.ts';
import {reaperTarget} from '../src/reaper.ts';

const idle={x:0,y:0,aimX:0,aimY:0,aiming:false};
const fresh=id=>{const g=new WarGame(77,{monsterId:id});g.war.allies=[];return g;};
function clearDefenses(g){g.player.invuln=0;g.shield=0;g.moonFury=0;g.vault=null;g.frenzyGuard=0;}
function coverFixture(){
 const fronts=WAR_MAP_DATA.structures.filter(s=>s[2].length);
 for(let x=-4000;x<4000;x+=32)for(let y=-4000;y<4000;y+=32){
  const ids=warCoverAt(x,y);if(!ids.length||!insideWar(x,y))continue;
  const s=fronts[ids[0]],depth=warWorld([0,s[3]??s[1][1]+s[1][3]]).y;
  for(const dx of [0,-160,160,-240,240])for(const dy of [40,100,180]){
   const observer={x:x+dx,y:depth+dy};if(!insideWar(observer.x,observer.y)||warCoverAt(observer.x,observer.y).length)continue;
   for(const [ox,oy] of [[0,-32],[-32,0],[32,0],[0,32]]){
    const open={x:x+ox,y:y+oy};if(insideWar(open.x,open.y)&&!warCoverAt(open.x,open.y).length)return {hidden:{x,y},open,observer,ids};
   }
  }
 }
 throw Error('No playable hiding silhouette with accessible front and entrance');
}
const cover=coverFixture();

test('every champion matchup limits player and rival combo damage, including fights between NPCs',()=>{
 for(const id of Object.keys(MONSTERS)){
  const g=fresh(id),max=g.player.maxHp;
  for(let i=0;i<4;i++){g.time=i*.4;clearDefenses(g);const attacker=g.war.leaders[1+i%2].actor;g.hit(null,1e7,1+i%2,attacker.serial,'aoe');}
  assert.ok(Math.abs(g.player.hp-max*.7)<.001,id+' player burst');
  for(const leader of g.war.leaders.slice(1)){
   const e=leader.actor,b=g.war.actors.get(e.serial).brain,hp=e.hp;
   for(let i=0;i<4;i++){g.time=10+i*.4;clearDefenses(b);g.damage(e,1e7,i%2?'beam':'hagignite');}
   assert.ok(Math.abs(e.hp-hp*.7)<.001,id+' vs '+leader.monsterId);
  }
  const peer=fresh(id),victim=peer.war.leaders[2].actor,b=peer.war.actors.get(victim.serial).brain,hp=victim.hp,attacker=peer.war.leaders[1].actor;
  for(let i=0;i<4;i++){peer.time=i*.4;clearDefenses(b);peer.hit(victim,1e7,1,attacker.serial,'ranged');}
  assert.ok(Math.abs(victim.hp-hp*.7)<.001,id+' NPC peer burst');
 }
});

test('burst protection rolls continuously, survives HP upgrades, and eventually allows a sustained kill',()=>{
 const g=fresh('hag'),e=g.war.leaders[1].actor,max=g.player.maxHp;
 for(let i=0;i<4;i++){g.time=i*.4;clearDefenses(g);g.hit(null,1e7,1,e.serial);}
 const before=g.player.hp;g.time=2.99;clearDefenses(g);g.hit(null,1e7,1,e.serial);assert.equal(g.player.hp,before);
 g.time=3.01;clearDefenses(g);g.hit(null,1e7,1,e.serial);assert.ok(Math.abs(before-g.player.hp-max*.08)<.001);
 g.war.pending=1;g.choosePerk('vitality');const hp=g.player.hp;g.time=3.02;clearDefenses(g);g.hit(null,1e7,1,e.serial);assert.equal(g.player.hp,hp,'upgrade must not reset the fractional budget');
 for(let i=0;i<200&&!g.ended;i++){g.time=3.5+i*.35;clearDefenses(g);g.hit(null,1e7,1,e.serial);}
 assert.ok(g.ended);assert.ok(g.time>=9,'a fresh health pool must outlast the opening combo');
});

test('blocking and invulnerability do not spend burst protection; vitality still adds real durability',()=>{
 const g=fresh('hag');g.player.invuln=10;warChampionDamage(g,1e7,'aoe');clearDefenses(g);const hp=g.player.hp;warChampionDamage(g,1e7,'aoe');assert.ok(Math.abs(hp-g.player.hp-g.player.maxHp*.08)<.001);
 const a=fresh('hag'),b=fresh('hag');b.player.hp=b.player.maxHp*=1.5;const ah=a.player.hp,bh=b.player.hp;warChampionDamage(a,100,'aoe');warChampionDamage(b,100,'aoe');assert.equal(ah-a.player.hp,bh-b.player.hp);
});

test('champion dueling reduction does not weaken damage against ordinary troops',()=>{
 const g=fresh('hag'),e=g.actor(1,'infantry',0,g.player.x+100,g.player.y),hp=e.hp;g.damage(e,100,'hagignite');assert.equal(hp-e.hp,100);assert.equal(WAR_DUEL.window,3);
});

test('hiding geometry comes from editable foregrounds and can be seen from their far side',()=>{
 const v=new WarVision(),target={...cover.hidden,serial:1};assert.ok(cover.ids.length);assert.ok(cover.ids.every(id=>!warBehindCover(cover.observer,id)));
 assert.equal(v.visible(1,cover.observer,target,0,1000),false);
 assert.equal(v.visible(1,{...cover.hidden,y:cover.hidden.y-20},target,0,1000),true);
 assert.equal(v.sense(1,cover.observer,target,0,1000),null);
});

test('a witnessed entrance is pursued without tracking movement inside cover; unrelated observers remain unaware',()=>{
 const v=new WarVision(),observer={...cover.observer},other={...cover.observer},target={...cover.open,serial:2};
 assert.equal(v.sense(1,observer,target,0,1000).visible,true);Object.assign(target,cover.hidden);
 const lost=v.sense(1,observer,target,.1,1000);assert.equal(lost.visible,false);assert.deepEqual({x:lost.x,y:lost.y},cover.hidden);
 target.x+=12;const tracked=v.sense(1,observer,target,.2,1000);assert.deepEqual({x:tracked.x,y:tracked.y},cover.hidden);
 assert.equal(v.sense(1,other,target,.2,1000),null);
 assert.equal(v.sense(1,observer,target,WAR_SIGHT.memory+1,1000),null);
});

test('hidden players are ignored by all rival champion auto attacks, spells and basic targeting',()=>{
 for(const playerId of Object.keys(MONSTERS)){
  const g=fresh(playerId);Object.assign(g.player,cover.hidden);for(const e of g.enemies)e.active=false;
  for(const leader of g.war.leaders.slice(1)){
   const e=leader.actor,a=g.war.actors.get(e.serial),b=a.brain;e.active=true;Object.assign(e,cover.observer);a.bank=0;
   assert.equal(g.target(a.team,e,800).point,null);g.brain(e,a,.1);
   assert.ok(b.cooldowns.every(n=>n===0),leader.monsterId+' cast at hidden prey');assert.equal(b.nearestEnemy(1000),null);assert.equal(reaperTarget(b,1000,true),null);assert.equal(b.bolts.length,0);e.active=false;
  }
 }
});

test('ordinary minions cannot attack unseen prey, but attacking from hiding reveals the attacker briefly',()=>{
 const g=fresh('hag');for(const e of g.enemies)e.active=false;g.war.production.fill(Infinity);g.war.disabled.fill(Infinity);g.attack=999;Object.assign(g.player,cover.hidden);
 const troop=g.actor(1,'arbalist',0,cover.observer.x,cover.observer.y);troop.timer=0;const hp=g.player.hp;g.update(.05,idle);assert.equal(g.player.hp,hp);assert.equal(g.target(1,troop,1000).point,null);
 g.damage(troop,1,'hagvenom');assert.equal(g.target(1,troop,1000).visible,true);
 g.time+=WAR_SIGHT.reveal+.1;assert.equal(g.target(1,troop,1000).visible,false);
});

test('blind area hits can strike and reveal concealed enemies rather than giving cover damage immunity',()=>{
 const g=fresh('hag');Object.assign(g.player,cover.observer);const e=g.war.leaders[1].actor;Object.assign(e,cover.hidden);g.rebuildGrid();assert.equal(g.canTarget(e),false);const hp=e.hp;g.area(e.x,e.y,100,10,'haghex');assert.ok(e.hp<hp);assert.equal(g.canTarget(e),true);
});

test('rivals and troops also respect concealed mobs, then reacquire them after crossing behind the object',()=>{
 const g=fresh('hag');for(const e of g.enemies)e.active=false;Object.assign(g.player,{x:4000,y:4000});const observer=g.actor(1,'arbalist',0,cover.observer.x,cover.observer.y),prey=g.actor(2,'infantry',1,cover.hidden.x,cover.hidden.y);
 Object.assign(prey,cover.hidden);assert.equal(g.target(1,observer,1000).point,null);Object.assign(observer,cover.hidden);observer.y-=20;const seen=g.target(1,observer,1000);assert.equal(seen.enemy,prey);assert.equal(seen.visible,true);
});

test('a sentry bolt keeps its last aim when its target disappears into concealment',()=>{
 const g=fresh('hag');for(const e of g.enemies)e.active=false;g.war.production.fill(Infinity);g.war.disabled.fill(Infinity);g.attack=999;
 Object.assign(g.player,cover.hidden);const shooter=g.actor(1,'sentry',0,cover.observer.x,cover.observer.y);shooter.timer=999;const aim={...cover.open};g.war.projectiles.push({x:cover.observer.x,y:cover.observer.y,target:-1,team:1,damage:50,life:2,source:shooter.serial,aim});g.update(.01,idle);assert.deepEqual(g.war.projectiles[0].aim,aim);
});

test('colors identify the owning champion across seeds and conquests, separately from friendship',()=>{
 assert.deepEqual(Object.keys(WAR_BANNERS).sort(),Object.keys(MONSTERS).sort());assert.equal(new Set(Object.values(WAR_BANNERS).map(b=>b.color)).size,8);assert.equal(new Set(Object.values(WAR_BANNERS).map(b=>b.letter)).size,8);
 const g=fresh('hag');assert.equal(warRelation(g,0).name,'YOUR ARMY');assert.equal(warRelation(g,1).name,'ENEMY');g.war.allies=[[0,1]];assert.equal(warRelation(g,1).name,'ALLY');
 const troop=g.actor(1,'infantry',0,0,0),a=g.war.actors.get(troop.serial),before=warBanner(g,a.team);a.team=0;assert.notEqual(warBanner(g,a.team).color,before.color);assert.equal(warBanner(g,a.team),WAR_BANNERS.hag);
});
