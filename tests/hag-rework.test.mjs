import {test} from 'node:test';import assert from 'node:assert/strict';
import {Game} from '../src/simulation.ts';import {WarGame} from '../src/stage-four.ts';
import {MONSTERS,ABILITIES} from '../src/content-monsters.ts';import {releasedPower} from '../src/unbound.ts';
import {HAG,hagState,hagAnimation,hagUnmasked,hagGlamour,updateHag,castHexes,castMiasma,castUnmasked} from '../src/hag.ts';
import {damageKind} from '../src/combat-damage.ts';
const make=()=>new Game(77,{monsterId:'hag'},0);
function prey(g,x,y,hp=10000){const e=g.spawn('brute');Object.assign(e,{x,y,hp,maxHp:hp});g.rebuildGrid();return e;}
function tick(g,seconds,dt=.05){for(let t=0;t<seconds-1e-7;t+=dt){g.time+=dt;updateHag(g,dt);}}
test('Hag has a separate four-frame true-form flight loop with normalized right-facing metadata',()=>{
 const g=make();assert.equal(MONSTERS.hag.visual.facesLeft,false);g.cast(2);assert.equal(hagAnimation(g,0,'move').state,'ultimate');g.cast(3);assert.equal(hagAnimation(g,0,'move').state,'unmaskedFlight');
 const anim=MONSTERS.hag.visual.states.unmaskedFlight;assert.equal(anim.row,3);assert.equal(anim.startFrame,2);assert.equal(anim.frames,4);assert.ok(anim.startFrame+anim.frames<=6);
});
test('Briarflight blocks only contact, including War damage dispatch; projectiles and blasts still hurt',()=>{
 const g=make();g.cast(2);const hp=g.player.hp;g.hurt(100,Infinity,'contact');assert.equal(g.player.hp,hp);g.hurt(100,Infinity,'ranged');assert.equal(g.player.hp,hp-100);g.player.invuln=0;g.hurt(100,Infinity,'aoe');assert.equal(g.player.hp,hp-200);
 const war=new WarGame(77,{monsterId:'hag'});war.cast(2);const before=war.player.hp;war.hit(null,100,1,0,'contact');assert.equal(war.player.hp,before);war.hit(null,100,1,0,'ranged');assert.equal(war.player.hp,before-100);
 const rival=new WarGame(77,{monsterId:'titan'}),hag=rival.war.leaders.find(l=>l.monsterId==='hag'),brain=rival.war.actors.get(hag.actor.serial).brain;brain.cast(2);const health=hag.actor.hp;rival.damage(hag.actor,100,'direct');assert.equal(hag.actor.hp,health);rival.damage(hag.actor,100,'ultimate');assert.ok(hag.actor.hp<health);
 assert.equal(damageKind('direct',false),'contact');assert.equal(damageKind('direct',true),'ranged');assert.equal(damageKind('haghex'),'aoe');
});
test('flying leaves armed caustic bombs on valid ground',()=>{
 const g=make();g.cast(2);for(let i=0;i<6;i++){g.player.x+=110;tick(g,.1);}const s=hagState(g);assert.ok(s.traps.length>=5);assert.ok(s.traps.every(t=>g.insideMap(t.x,t.y)));assert.ok(s.traps.every(t=>t.damage>0));
});
test('Hexes use the same evenly spaced six positions across seeds and do not stack on previous mines',()=>{
 const a=make(),b=new Game(123,{monsterId:'hag'},0);a.player.angle=b.player.angle=0;castHexes(a,ABILITIES.thornhex);castHexes(b,ABILITIES.thornhex);
 const points=g=>hagState(g).traps.map(t=>[t.x,t.y]);assert.deepEqual(points(a),points(b));assert.equal(points(a).length,6);assert.deepEqual([...new Set(points(a).map(p=>p[0]))],[170,280]);assert.deepEqual([...new Set(points(a).map(p=>p[1]))],[-110,0,110]);castHexes(a,ABILITIES.thornhex);assert.equal(points(a).length,6);
});
test('one mine hits prey beyond its trigger footprint and throws and poisons survivors',()=>{
 const g=make();castHexes(g,ABILITIES.thornhex);const s=hagState(g),mine=s.traps[0];s.traps=[mine];const trigger=prey(g,mine.x,mine.y,22),survivor=prey(g,mine.x+110,mine.y);tick(g,.4);
 assert.equal(trigger.active,false);assert.ok(survivor.hp<10000);assert.ok(Math.hypot(survivor.vx,survivor.vy)>500);assert.ok(survivor.snaredUntil>g.time);assert.ok(s.venom.some(v=>v.enemy===survivor));assert.equal(s.traps.length,0);
});
test('a hostile projectile crossing an armed mine detonates it',()=>{
 const g=make();castHexes(g,ABILITIES.thornhex);const s=hagState(g),mine=s.traps[0];s.traps=[mine];mine.armed=0;g.shots.push({x:mine.x-100,y:mine.y,vx:1500,vy:0,damage:30,life:1});tick(g,.1,.1);assert.equal(s.traps.length,0);assert.equal(g.shots[0].life,0);
});
test('War sentry bolts also detonate hostile bombs before reaching the champion',()=>{
 const g=new WarGame(77,{monsterId:'hag'}),p=g.player;hagState(g).traps=[{x:p.x+100,y:p.y,radius:150,trigger:35,damage:220,remaining:12,armed:0}];g.war.projectiles.push({x:p.x+200,y:p.y,target:-1,team:1,damage:100,life:1});const hp=p.hp;g.update(.2,{x:0,y:0,aimX:0,aimY:0,aiming:false});assert.equal(g.war.projectiles.length,0);assert.equal(hagState(g).traps.length,0);assert.equal(p.hp,hp);
});
test('a full visible field cannot consume another Hexes cooldown',()=>{
 const g=make(),s=hagState(g);s.traps=Array.from({length:HAG.maxTraps},()=>({x:0,y:0,radius:150,trigger:35,damage:220,remaining:12,armed:0}));assert.equal(g.cast(0),false);assert.equal(g.cooldowns[0],0);
});
test('all Hag hits poison and slow survivors, refresh rather than stack, and poison expires without recursion',()=>{
 for(const source of ['hagvenom','haghex','haggas','hagignite','ultimate','relic:calamity:meteor']){
  const g=make(),e=prey(g,200,0);g.damage(e,1,source);const s=hagState(g);assert.equal(s.venom.length,1,source);assert.ok(e.snaredUntil>=g.time+4);g.damage(e,1,source);assert.equal(s.venom.length,1);const hp=e.hp;tick(g,.6);assert.ok(e.hp<hp);assert.ok(s.venom[0].remaining<4);tick(g,4);assert.equal(s.venom.length,0);
 }
 const g=make();g.player.hp=500;castUnmasked(g,ABILITIES.witchrevel);prey(g,100,100,1);const e=g.enemies.find(e=>e.active);g.damage(e,10,'hagvenom');assert.ok(g.player.hp>500);assert.equal(g.shield,0);
});
test('Unmask expands a nonoverlapping web and replaces detonated holes',()=>{
 const g=make();castUnmasked(g,ABILITIES.witchrevel);const s=hagState(g);assert.equal(s.traps.length,6);tick(g,3);assert.ok(s.traps.length>24);assert.ok(s.traps.some(t=>Math.hypot(t.x,t.y)>450));assert.ok(s.traps.length<=HAG.maxTraps);
 for(let i=0;i<s.traps.length;i++)for(let j=0;j<i;j++)assert.ok(Math.hypot(s.traps[i].x-s.traps[j].x,s.traps[i].y-s.traps[j].y)>=HAG.trapSpacing-.01);
 const mine={...s.traps[0]},e=prey(g,mine.x,mine.y,1);tick(g,.05);assert.equal(e.active,false);tick(g,.5);assert.ok(s.traps.some(t=>Math.hypot(t.x-mine.x,t.y-mine.y)<1));
});
test('Unmask heals without any ward, then retains true form until glamour is rebuilt',()=>{
 const g=make();g.player.hp=200;g.ward(100,300,8);castUnmasked(g,ABILITIES.witchrevel);g.ward(999,999,99);assert.equal(g.shield,0);hagGlamour(g,100);assert.ok(g.player.hp>200);assert.ok(g.player.hp<=200+g.player.maxHp*.06);assert.equal(g.shield,0);tick(g,9.1);assert.ok(hagUnmasked(g));assert.equal(hagAnimation(g,0,'move').state,'ultimate');g.time+=1;hagGlamour(g,10);assert.ok(g.shield>0);assert.equal(hagUnmasked(g),false);
});
test('ignition beats the complete gas and poison total, and late ignition combines both',()=>{
 for(const release of [0,4])for(const duration of [6,9.6]){
  const p={...releasedPower(ABILITIES.witchgas,'hag',release),duration};
  function trial(when){const g=make();g.release=release;const e=prey(g,150,0,100000);castMiasma(g,p);if(when!==null){tick(g,when);castMiasma(g,p);if(when===0)return 100000-e.hp;}tick(g,duration+5);return 100000-e.hp;}
  const gas=trial(null),blast=trial(0),late=trial(duration-.1);assert.ok(blast>gas,JSON.stringify({release,duration,gas,blast}));assert.ok(late>blast);
 }
});
test('visible bombs persist indefinitely; only offscreen time consumes their cleanup lifetime',()=>{
 const g=make();castHexes(g,ABILITIES.thornhex);const s=hagState(g);tick(g,90);assert.equal(s.traps.length,6);g.player.x=-1200;tick(g,7);assert.equal(s.traps.length,6);g.player.x=0;tick(g,90);assert.equal(s.traps.length,6);g.player.x=-1200;tick(g,8);assert.equal(s.traps.length,0);
});
