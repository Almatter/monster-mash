import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../src/simulation.ts';
import {dominate,servantCap,updateServants} from '../src/servants.ts';
import {ENEMIES,EVENT} from '../src/data.ts';
import {encodeRun,decodeRun} from '../src/run-code.ts';
const idle={x:0,y:0,aimX:500,aimY:0,aiming:false};
const move={...idle,x:1};
function enemy(g,kind,x,y){g.spawn(kind);const e=g.enemies.find(e=>e.active&&e.serial===g.serial);assert.ok(e);e.x=x;e.y=y;g.rebuildGrid();return e;}

test('auto attacks wait for a target and ranged mobile aim retains a nearby threat',()=>{
 const d=new Game(1,{monsterId:'devourer'}),sounds=[];d.sound=k=>sounds.push(k);for(let i=0;i<30;i++)d.update(1/60,idle);assert.equal(d.attack,0);assert.equal(sounds.filter(x=>x==='basic.devourer').length,0);const prey=enemy(d,'thrall',45,0);d.update(1/60,idle);assert.equal(prey.active,false);assert.ok(d.attack>0);
 const c=new Game(1,{monsterId:'calamity'});const far=enemy(c,'thrall',480,0),near=enemy(c,'thrall',90,0);assert.equal(c.findBasicTarget(650,true),near);assert.equal(c.findBasicTarget(650,true),near);const urgent=enemy(c,'hound',30,0);assert.equal(c.findBasicTarget(650,true),urgent);c.update(1/60,idle);assert.ok(c.bolts.length>0);assert.ok(Math.abs(c.player.angle)<.01);assert.equal(far.active,true);
});

test('Devourer gains chained Lunge charges through Release and brief dodge frames on each cast',()=>{
 const g=new Game(9,{monsterId:'devourer'});assert.equal(g.maxLungeCharges(),1);assert.equal(g.cast(0),true);assert.equal(g.lungeCharges,0);const start=g.player.hp;g.hurt(100);assert.equal(g.player.hp,start,'opening dodge frames avoid a hit');for(let i=0;i<24;i++)g.update(1/60,idle);g.player.invuln=0;g.hurt(100);assert.equal(g.player.hp,start-100,'the full dash is not invulnerable');g.time=300;g.update(1/60,idle);assert.equal(g.maxLungeCharges(),2);assert.ok(g.lungeCharges>=1);const before=g.dash?.remaining||0;assert.equal(g.cast(0),true);assert.ok(g.dash.remaining>before,'rapid recast extends the active dash');g.time=510;g.update(1/60,idle);assert.equal(g.maxLungeCharges(),3);assert.ok(g.lungeCharges>=1);
});

test('only Calamity places Nuke and Vortex at a valid chosen ground point',()=>{
 const c=new Game(2,{monsterId:'calamity'});assert.equal(c.cast(1,{x:800,y:0}),false);assert.equal(c.cooldowns[1],0);assert.equal(c.cast(1,{x:260,y:110}),true);assert.deepEqual({x:c.fields[0].x,y:c.fields[0].y},{x:260,y:110});assert.equal(c.cast(2,{x:-120,y:180}),true);assert.deepEqual({x:c.fields[1].x,y:c.fields[1].y},{x:-120,y:180});const d=new Game(2,{monsterId:'devourer'});assert.equal(d.cast(1,{x:30,y:40}),false);assert.equal(d.cooldowns[1],0);
});

test('Titan builds barrier from real travel, keeps a brief grace, then loses idle protection',()=>{
 const t=new Game(3,{monsterId:'titan'});t.spawnBank=-1000;for(let i=0;i<60;i++)t.update(1/60,{...idle,x:.01});assert.equal(t.momentum,0);assert.equal(t.shield,0);for(let i=0;i<180;i++)t.update(1/60,move);assert.ok(t.momentum>.9,t.momentum);assert.ok(t.shield>10,t.shield);const peak=t.momentum,barrier=t.shield;for(let i=0;i<60;i++)t.update(1/60,idle);assert.equal(t.momentum,peak);for(let i=0;i<240;i++)t.update(1/60,idle);assert.ok(t.momentum<.05,t.momentum);assert.ok(t.shield<barrier,t.shield);t.sustainCooldown=0;t.completeAttack(10);assert.ok(t.shield<=80,'stationary kill barrier is weaker than moving barrier');
});

test('Overlord can hold a capped controlled army; at cap conversions replace weakened allies; enemies can kill allies',()=>{
 const g=new Game(4,{monsterId:'overlord'});for(let i=0;i<32;i++)enemy(g,'thrall',100+i,0);g.rebuildGrid();const converted=dominate(g,500,32);assert.equal(converted,32);assert.equal(g.servants.filter(s=>s.active).length,servantCap(0));assert.equal(g.score.kills,0,'conversion does not credit kills');assert.ok(g.servants.filter(s=>s.active).every(s=>s.life===28));const victim=g.servants.find(s=>s.active);victim.hp=1;enemy(g,'elite',victim.x,victim.y);updateServants(g,1/60);assert.equal(victim.active,false);assert.ok(g.servants.filter(s=>s.active).length<servantCap(0));
});

test('elite and Titan scale above fodder through Final Release and resist launch',()=>{
 const g=new Game(5,{monsterId:'sovereign'});g.time=520;g.release=4;g.wave=18;const fodder=enemy(g,'thrall',100,0),elite=enemy(g,'elite',130,0),titan=enemy(g,'titan',180,0);assert.ok(elite.maxHp>fodder.maxHp*40);assert.ok(titan.maxHp>elite.maxHp*6);g.area(0,0,240,500,'shockwave',900);assert.ok(Math.hypot(elite.vx,elite.vy)<900*g.releaseStats.knockback*.5);assert.ok(Math.hypot(titan.vx,titan.vy)<900*g.releaseStats.knockback*.2);assert.equal(titan.active,true);assert.equal(ENEMIES.titan.hp,10000);
});

const current={version:4,rules:EVENT.rules,phase:0,name:'Opaque \u2726 Monster',title:'',monsterId:'devourer',colors:{primary:'#ffffff',secondary:'#aaaaaa',accent:'#bbbbbb',power:'#cccccc'},seed:77,duration:555,score:2123456,kills:22000,wave:19,elites:48,titans:2,multi:100,peak:5,feats:{massacre:3},ended:'2026-10-01T00:00:00.000Z',reason:'overwhelmed',release:4,build:'0123456789abcdef'};
test('MM4 is nonce-randomized opaque AES-GCM, tamper resistant, and keeps MM3 readable',async()=>{
 const one=await encodeRun(current),two=await encodeRun(current);assert.ok(one.startsWith('MM4.'));assert.notEqual(one,two);assert.deepEqual(await decodeRun(one),current);const decoded=Buffer.from(one.slice(4).replaceAll('-','+').replaceAll('_','/'),'base64').toString('utf8');for(const text of ['Opaque','2123456','devourer',EVENT.rules])assert.equal(decoded.includes(text),false);await assert.rejects(()=>decodeRun(one.slice(0,-3)));await assert.rejects(()=>decodeRun(one.slice(0,-5)+'aaaaa'));await assert.rejects(()=>decodeRun('MM4.'+'a'.repeat(80)));const old={...current,version:3,rules:'2026.10-v5-feast'};assert.deepEqual(await decodeRun(await encodeRun(old)),old);
});

test('Sovereign Feeding Rage reduces incoming damage for its six-second window',()=>{
 const g=new Game(11,{monsterId:'sovereign'}),start=g.player.hp;g.player.rage=6;g.hurt(100);assert.equal(g.player.hp,start-75);g.player.invuln=0;g.player.rage=0;g.hurt(100);assert.equal(g.player.hp,start-175);
});

test('Devourer Execution prioritizes a nearby Titan over lesser prey',()=>{
 const g=new Game(12,{monsterId:'devourer'});const prey=enemy(g,'thrall',30,0),boss=enemy(g,'titan',90,0);const before=boss.hp;assert.equal(g.cast(2),true);assert.ok(boss.hp<before);assert.equal(prey.active,true);
});
