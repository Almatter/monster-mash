import {writeFile,mkdir} from 'node:fs/promises';
import {Game} from '../src/simulation.ts';
import {releasedPower} from '../src/unbound.ts';
import {MONSTERS} from '../src/content-monsters.ts';
import {REALM_GROTTOS,realmWaypoint,inTitanArena} from '../src/titan-realm-map.ts';
import {claimRelic,equipRelic,realmSummary} from '../src/stage-three.ts';
const report=[];
function direction(g,goal){const p=realmWaypoint(g.player.x,g.player.y,goal.x,goal.y),dx=p.x-g.player.x,dy=p.y-g.player.y,d=Math.hypot(dx,dy)||1;return {x:dx/d,y:dy/d,aimX:goal.x,aimY:goal.y,aiming:false};}
function fightInput(g,target,boss=false){let goal={x:target.x,y:target.y};const required=boss&&!g.realm.open?g.powers.find((p,i)=>g.relicOwners[i]===g.realm.pattern[g.realm.layer]&&g.cooldowns[i]<.05):null,reach=boss?(required?(['lunge','charge'].includes(required.effect)?300:Math.min(300,Math.max(110,releasedPower(required,g.realm.pattern[g.realm.layer],4).radius-35))):300):g.monster.basic.ranged?300:130,d=Math.hypot(g.player.x-target.x,g.player.y-target.y)||1;if(d<reach+30){goal={x:target.x+(g.player.x-target.x)/d*reach,y:target.y+(g.player.y-target.y)/d*reach};}if(boss&&g.realm.zones.some(z=>z.warning<1.55&&Math.hypot(z.x-g.player.x,z.y-g.player.y)<z.radius+65)){let best=-Infinity;for(let i=0;i<24;i++){const a=i*Math.PI/12,q={x:g.player.x+Math.cos(a)*230,y:g.player.y+Math.sin(a)*230};if(Math.hypot(q.x,q.y)>440)continue;const safety=Math.min(...g.realm.zones.map(z=>Math.hypot(q.x-z.x,q.y-z.y)-z.radius));if(safety>best){best=safety;goal=q;}}}if(boss&&Math.hypot(goal.x,goal.y)>440){const r=Math.hypot(goal.x,goal.y);goal={x:goal.x/r*440,y:goal.y/r*440};}const move=direction(g,goal);if(Math.hypot(goal.x-g.player.x,goal.y-g.player.y)<12){move.x=move.y=0;}if(!boss&&Math.hypot(goal.x-g.player.x,goal.y-g.player.y)<25){const a=Math.atan2(g.player.y-target.y,g.player.x-target.x)+.25;return direction(g,{x:target.x+Math.cos(a)*reach,y:target.y+Math.sin(a)*reach});}return move;}
function cast(g,target){g.targetView={x:800,y:600};for(let i=0;i<4;i++){const p=g.powers[i],d=Math.hypot(g.player.x-target.x,g.player.y-target.y);if(p.effect==='charge')continue;if(p.effect==='lunge'&&(g.realm.open||g.relicOwners[i]!==g.realm.pattern[g.realm.layer]))continue;if(p.effect==='lunge'){g.setMovementDirection(target.x-g.player.x,target.y-g.player.y);}if(d>p.radius*g.releaseStats.radius&& !['lunge','summon','beam','frenzy','reapervolley','reaperstorm'].includes(p.effect))continue;g.cast(i,['meteor','vortex','reaperblink','reapervolley'].includes(p.effect)?{x:target.x,y:target.y}:undefined);}}
for(const nature of (process.env.REALM_NATURE?[process.env.REALM_NATURE]:Object.keys(MONSTERS)))for(const seed of (process.env.REALM_SEEDS||'17,83,127').split(',').map(Number)){
 const g=new Game(seed,{monsterId:nature},2);g.seedOpening();const route=[3,2,1,0,6,5,4];let index=0,stage='entry',combatAt=null,peak=0,equipIndex=0,travel=0;
 const desired=g.realm.pattern.map(n=>g.realm.relics.find(r=>r.nature===n));const start=performance.now();
 for(let frame=0;frame<36000&&!g.ended;frame++){
  let input;const before={x:g.player.x,y:g.player.y};
  if(stage==='entry'){input=direction(g,{x:0,y:1536});if(Math.abs(g.player.y-1536)<30)stage='explore';}
  else if(stage==='explore'){
   const shrine=route[index],spot=REALM_GROTTOS[shrine],goal={x:spot.x,y:spot.y-120},guard=g.enemies.filter(e=>e.active&&e.realm?.role==='guardian'&&e.realm.shrine===shrine).sort((a,b)=>Math.hypot(a.x-g.player.x,a.y-g.player.y)-Math.hypot(b.x-g.player.x,b.y-g.player.y))[0];
   if(guard){input=fightInput(g,guard);if(guard.windup>0){const d=Math.hypot(g.player.x-guard.x,g.player.y-guard.y)||1;input=direction(g,{x:guard.x+(g.player.x-guard.x)/d*280,y:guard.y+(g.player.y-guard.y)/d*280});}cast(g,guard);}else input=direction(g,goal);
   if(g.realm.shrines[shrine].cleared&&Math.hypot(g.player.x-goal.x,g.player.y-goal.y)<100){claimRelic(g,shrine);if(g.player.hp>=g.player.maxHp*.92){if(++index>=7)stage='assemble';}else input={x:0,y:0,aimX:0,aimY:0,aiming:false};}
  }else if(stage==='assemble'){
   const relic=desired[equipIndex],spot=REALM_GROTTOS[relic.shrine],goal={x:spot.x,y:spot.y-120};input=direction(g,goal);
   if(Math.hypot(g.player.x-goal.x,g.player.y-goal.y)<100&&equipRelic(g,relic.id,equipIndex)){if(++equipIndex===4)stage='approach';}
  }else if(stage==='approach'){input=direction(g,{x:0,y:250});if(inTitanArena(g.player.x,g.player.y)){stage='fight';combatAt=g.time;}}
  else {input=fightInput(g,g.realm.boss,true);cast(g,g.realm.boss);}
  g.update(1/30,input);travel+=Math.hypot(g.player.x-before.x,g.player.y-before.y);peak=Math.max(peak,g.alive);if(g.time>1199)break;
 }
 const result={nature,seed,stage,visited:index,position:{x:Math.round(g.player.x),y:Math.round(g.player.y)},cleared:g.realm.cleared,seconds:Math.round(g.time),exploration:Math.round(combatAt||g.time),fight:combatAt?Math.round(g.time-combatAt):0,hp:Math.round(g.player.hp),layer:g.realm.layer,guardians:g.realm.guardians,peak,loadout:g.powers.map(p=>p.id),owners:g.relicOwners,pattern:g.realm.pattern,bossHp:g.realm.boss.hp,distance:Math.round(Math.hypot(g.player.x-g.realm.boss.x,g.player.y-g.realm.boss.y)),engaged:g.realm.engaged,resets:g.realm.resets,travel:Math.round(travel),cpuMs:Math.round(performance.now()-start)};report.push(result);console.log(JSON.stringify(result));
}
await mkdir('test-results',{recursive:true});await writeFile(process.env.REALM_REPORT||'test-results/titan-realm-pacing.json',JSON.stringify({method:'Solution-informed pilot, all seven grottos visited and relics equipped at their home altar; real movement/cooldowns/damage with warning avoidance. Lower bound, not human puzzle-solving duration.',runs:report},null,2));
