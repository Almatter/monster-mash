// Normal-health, deterministic scenario screening. These are bot results, not player averages.
// node tools/champion-scenarios.mjs <stage 1..4> [comma-separated seeds] [comma-separated champions]
import {mkdir,writeFile,appendFile} from 'node:fs/promises';
import {Game} from '../src/simulation.ts';
import {MONSTERS} from '../src/content-monsters.ts';
import {WarGame} from '../src/stage-four.ts';
import {WAR_CAMPS,warSteer} from '../src/war-map.ts';
import {courtSteer,COURT_SEARCH_ROUTE} from '../src/court-map.ts';
import {chooseCourtUpgrade,upgradeRank} from '../src/stage-two.ts';
import {realmWaypoint,realmAltar,realmPortalInteraction,REALM_GROTTOS,inTitanArena} from '../src/titan-realm-map.ts';
import {claimRelic,equipRelic,readRealmClue,teleportRealm,realmSummary} from '../src/stage-three.ts';
import {hagState} from '../src/hag.ts';

const stage=Number(process.argv[2]),seeds=(process.argv[3]||'77,123,444,835,1217').split(',').map(Number);
const kits=(process.argv[4]||Object.keys(MONSTERS).join(',')).split(',');
const dt=1/Number(process.env.SCENARIO_HZ||30),limit=Number(process.env.SCENARIO_SECONDS||(stage===1?900:1200));
const label=process.env.SCENARIO_LABEL||'current';
if(![1,2,3,4].includes(stage)||seeds.some(s=>!Number.isSafeInteger(s))||kits.some(k=>!MONSTERS[k]))throw Error('Invalid scenario arguments');
const file=`test-results/scenarios-${label}-stage${stage}.jsonl`;
await mkdir('test-results',{recursive:true});await writeFile(file,'');
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const vector=(a,b)=>{const d=distance(a,b)||1;return {x:(b.x-a.x)/d,y:(b.y-a.y)/d};};
const closest=(p,items)=>items.reduce((best,e)=>!best||distance(p,e)<distance(p,best)?e:best,null);
function steer(g,goal,avoid=false){if(stage===2)return courtSteer(g.player.x,g.player.y,goal.x,goal.y);if(stage===3)return vector(g.player,realmWaypoint(g.player.x,g.player.y,goal.x,goal.y,avoid));if(stage===4)return warSteer(g.player,goal);return vector(g.player,goal);}
function orbit(g,target,desired){const d=distance(g.player,target)||1,a=Math.atan2(g.player.y-target.y,g.player.x-target.x)+.32;return {x:target.x+Math.cos(a)*desired,y:target.y+Math.sin(a)*desired};}
function dangerGoal(g,goal){
 const zones=stage===2?g.court.colossus.zones.filter(z=>g.time<z.endsAt):stage===3?g.realm.zones:[];
 const danger=zones.filter(z=>distance(g.player,z)<z.radius+65);
 if(danger.length){let best=-Infinity;for(let i=0;i<16;i++){const a=i*Math.PI/8,q={x:g.player.x+Math.cos(a)*220,y:g.player.y+Math.sin(a)*220};if(!g.insideMap(q.x,q.y,25)||stage===3&&g.realm.engaged&&!inTitanArena(q.x,q.y))continue;const value=Math.min(...zones.map(z=>distance(q,z)-z.radius));if(value>best){best=value;goal=q;}}}
 const action=g.realm?.action,boss=g.realm?.boss;
 if(action?.kind==='rush'){const v=vector(action.from,action.to);for(const side of [1,-1]){const q={x:g.player.x-v.y*260*side,y:g.player.y+v.x*260*side};if(g.insideMap(q.x,q.y,25)&&inTitanArena(q.x,q.y)){goal=q;break;}}}
 if(action?.kind==='cleave'&&boss&&distance(g.player,boss)<450){const choices=[-1,1].map(side=>({x:boss.x+Math.cos(action.angle+side*1.7)*300,y:boss.y+Math.sin(action.angle+side*1.7)*300})).filter(q=>g.insideMap(q.x,q.y,25)&&inTitanArena(q.x,q.y));goal=closest(g.player,choices)||goal;}
 return goal;
}
function cast(g,target,travel=false){
 if(!target)return;const d=distance(g.player,target);g.targetView={x:850,y:600};
 const angle=Math.atan2(target.y-g.player.y,target.x-g.player.x);g.player.angle=angle;
 for(let i=0;i<4&&!g.ended;i++){
  const p=g.powers[i],effect=p.effect,s=hagState(g);
  if(g.cooldowns[i]>0&&!(effect==='lunge'&&g.lungeCharges>0)&&!(effect==='haggas'&&s.clouds.length))continue;
  if(stage===3&&target.realm?.role==='boss'&&!g.realm.open&&g.relicOwners[i]!==g.realm.pattern[g.realm.layer])continue;
  if(effect==='haggas'&&s.clouds.length&&s.clouds[0].remaining>1)continue;
  if(effect==='hagflight'&&!(g.player.hp<g.player.maxHp*.55&&d<230))continue;
  if(effect==='hagfrenzy'&&d>550)continue;
  if(effect==='devour'&&g.monster.id==='devourer'&&g.player.hp>g.player.maxHp*.8&&d>150)continue;
  if(travel&&['lunge','charge','parkour','reaperblink'].includes(effect))continue;
  if(['lunge','charge','parkour'].includes(effect)&&d<100)continue;
  if(d>Math.max(p.radius*g.releaseStats.radius,stage===1?400:550)&&!['summon','frenzy','reaperstorm','wolffury'].includes(effect))continue;
  g.setMovementDirection(target.x-g.player.x,target.y-g.player.y);
  const point=['meteor','vortex','wolfcyclone','reaperblink','reapervolley'].includes(effect)?{x:target.x,y:target.y}:effect==='parkour'?{x:target.x+100,y:target.y}:undefined;
  g.cast(i,point);
 }
}
function choose(g){
 while(g.court?.pending){const order=g.player.hp<g.player.maxHp*.65?['vitality','power','recharge','haste','reach','duration']:['power','recharge','duration','vitality','haste','reach'];const id=order.find(k=>upgradeRank(g,k)<3);if(!id||!chooseCourtUpgrade(g,id))throw Error('Unresolved court choice');}
 while(g.war?.pending){const order=g.player.hp<g.player.maxHp*.6?['vitality','glamour','power','recharge','legion','haste']:['power','glamour','recharge','vitality','legion','haste'];const id=order.find(k=>(g.war.perks[k]||0)<3)||'recover';if(!g.choosePerk(id))throw Error('Unresolved war choice');}
}
function realmDecision(g,state){
 const s=g.realm,p=g.player;
 if(state.step==='clues'){
  const post=s.inscriptions[state.clue];if(distance(p,post)<120&&readRealmClue(g,state.clue)){state.clue++;if(state.clue===4)state.step='shrines';}
  return {goal:post,avoid:true};
 }
 if(state.step==='shrines'){
  const required=s.shrines.filter(q=>q.required&&!q.claimed);
  if(!required.length){state.step='equip';return realmDecision(g,state);}
  const shrine=closest(p,required.map(q=>REALM_GROTTOS[q.id])),status=s.shrines[shrine.id],altar=realmAltar(shrine.id);
  const guards=g.enemies.filter(e=>e.active&&e.realm?.role==='guardian'&&e.realm.shrine===shrine.id);
  const target=closest(p,guards.filter(e=>e.realm.variant===1))||closest(p,guards);
  if(status.cleared&&distance(p,altar)<220){claimRelic(g,shrine.id);state.step='heal';state.next='shrines';return {goal:altar,avoid:true};}
  return {goal:target?orbit(g,target,g.monster.basic.ranged?260:100):altar,target,avoid:true};
 }
 if(state.step==='equip'){
  const r=state.desired.find(r=>r.shrine!==null);
  if(!r){state.step='arena';return realmDecision(g,state);}
  const altar=realmAltar(r.shrine);
  const target=closest(p,g.enemies.filter(e=>e.active&&e.realm?.occupation===r.shrine));
  if(distance(p,altar)<220&&!target&&equipRelic(g,r.id,state.slots.get(r.id))){state.step='heal';state.next='equip';}
  // Use legitimate portals for long inter-shrine travel if both ends are free.
  const from=closest(p,s.shrines.filter(q=>q.claimed&&!q.occupied&&q.id!==r.shrine).map(q=>({...realmPortalInteraction(q.id),id:q.id})));
  if(!target&&distance(p,altar)>2000&&from&&distance(p,from)<140)teleportRealm(g,r.shrine);
  return {goal:target?orbit(g,target,g.monster.basic.ranged?260:100):altar,target,avoid:true};
 }
 if(state.step==='heal'){
  if(p.hp>=p.maxHp*.92){state.step=state.next;return realmDecision(g,state);}
  const altar=closest(p,s.shrines.filter(q=>q.claimed&&!q.occupied).map(q=>realmAltar(q.id)));
  return {goal:altar||p,avoid:true};
 }
 if(state.step==='arena'){
  if(inTitanArena(p.x,p.y)){state.step='boss';return realmDecision(g,state);}
  return {goal:{x:0,y:0}};
 }
 const target=s.boss,reach=g.monster.basic.ranged?280:140;
 let goal=orbit(g,target,reach);if(!inTitanArena(goal.x,goal.y))goal={x:0,y:-38};
 return {goal,target};
}
const rows=[];
for(const id of kits)for(const seed of seeds){
 const start=performance.now(),g=stage===4?new WarGame(seed,{monsterId:id}):new Game(seed,{monsterId:id},stage-1);g.seedOpening();
 const state={step:'clues',clue:0,route:0,next:'',desired:g.realm?.pattern.map(n=>g.realm.relics.find(r=>r.nature===n)),slots:new Map()};
 if(state.desired){const slots=[0,1,2,3];for(const r of state.desired){const own=g.powers.findIndex(p=>p.id===r.ability);if(own>=0){state.slots.set(r.id,own);slots.splice(slots.indexOf(own),1);}}for(const r of state.desired)if(!state.slots.has(r.id))state.slots.set(r.id,slots.shift());}
 let input={x:0,y:0,aimX:400,aimY:0,aiming:true},target=null,nextDecision=0,nextCast=0,goal={x:0,y:0},stalled=0,checkpoint={x:g.player.x,y:g.player.y,time:0};
 for(let f=0;f<Math.ceil(limit/dt)&&!g.ended;f++){
  choose(g);
  if(g.time>=nextDecision){
   nextDecision=g.time+.2;const p=g.player,active=g.enemies.filter(e=>e.active&&g.isHostile(e));target=closest(p,active);let avoid=false;
   if(stage===1){if(target){goal=orbit(g,target,g.monster.basic.ranged?Math.min(360,g.monster.basic.radius*.6):85);}else{const a=g.time*.17;goal={x:Math.cos(a)*400,y:Math.sin(a)*400};}}
   if(stage===2){const captain=closest(p,active.filter(e=>e.court?.role==='captain')),seal=closest(p,g.court.seals),shrine=p.hp<p.maxHp*.55?closest(p,g.court.shrines.filter(s=>g.time>=s.readyAt)):null;let camp=COURT_SEARCH_ROUTE[state.route%COURT_SEARCH_ROUTE.length];if(distance(p,camp)<140){state.route++;camp=COURT_SEARCH_ROUTE[state.route%COURT_SEARCH_ROUTE.length];}target=captain||target;goal=shrine||seal||(captain?orbit(g,captain,g.monster.basic.ranged?220:75):camp);if(captain?.windup>0&&distance(p,captain)<250)goal=orbit(g,captain,330);}
   if(stage===3){const plan=realmDecision(g,state);goal=plan.goal;target=plan.target||null;avoid=!!plan.avoid;const mimic=closest(p,active.filter(e=>e.mimic&&distance(p,e)<550));if(mimic){target=mimic;const q=orbit(g,mimic,g.monster.basic.ranged?300:100);if(state.step==='boss'||!inTitanArena(q.x,q.y))goal=q;}else if(!target)target=closest(p,active.filter(e=>!['boss','guardian'].includes(e.realm?.role)&&distance(p,e)<450));if(state.step!=='boss'&&state.step!=='arena'){if(!inTitanArena(p.x,p.y))state.safe={x:p.x,y:p.y};else if(state.safe){goal=state.safe;avoid=false;}}}
   if(stage===4){const champion=closest(p,active.filter(e=>g.war.actors.get(e.serial)?.role==='champion'&&distance(p,e)<850));target=champion||closest(p,active.filter(e=>distance(p,e)<650));const camp=closest(p,WAR_CAMPS.filter((c,i)=>g.war.owners[i]!==0)),home=closest(p,WAR_CAMPS.filter((c,i)=>g.war.owners[i]===0));goal=target?orbit(g,target,g.monster.basic.ranged?330:80):camp||p;if(home&&(g.time<60||p.hp<p.maxHp*.45||champion&&distance(p,home)<800))goal=home.sentry;if(target&&distance(p,goal)<140)goal=orbit(g,target,g.monster.basic.ranged?330:100);}
   goal=dangerGoal(g,goal);const v=distance(p,goal)<12?{x:0,y:0}:steer(g,goal,avoid);input={...v,aimX:target?.x??goal.x,aimY:target?.y??goal.y,aiming:true};
   if(g.time-checkpoint.time>=10){if(distance(p,checkpoint)<25&&distance(p,goal)>100&&!target)stalled+=10;checkpoint={x:p.x,y:p.y,time:g.time};}
  }
  if(g.time>=nextCast){nextCast=g.time+.2;cast(g,target,stage===3&&!['shrines','boss'].includes(state.step));}
  g.setMovementDirection(input.x,input.y);g.update(dt,input);
 }
 const clear=!!(g.court?.cleared||g.realm?.cleared||g.war?.cleared),death=g.player.hp<=0;
 const row={stage,id,seed,seconds:+g.time.toFixed(2),outcome:clear?'clear':death?'death':'timeout',dominance:Math.round(g.score.dominance),kills:g.score.kills,hp:Math.round(g.player.hp),shield:Math.round(g.shield),stalled,position:{x:Math.round(g.player.x),y:Math.round(g.player.y)},sources:g.score.sources,healed:Math.round(g.sustainStats.healed),absorbed:Math.round(g.sustainStats.absorbed),cpuMs:Math.round(performance.now()-start),...(g.court?{captains:g.court.stats.captains,boons:g.court.upgrades}:{}),...(g.realm?{pilot:state.step,realm:realmSummary(g)}:{}),...(g.war?{war:g.summary(),perks:g.war.perks}:{})};
 rows.push(row);await appendFile(file,JSON.stringify(row)+'\n');console.log(JSON.stringify(row));
}
const summary=kits.map(id=>{const r=rows.filter(r=>r.id===id),mean=k=>Math.round(r.reduce((sum,x)=>sum+x[k],0)/r.length);return {id,n:r.length,seconds:mean('seconds'),dominance:mean('dominance'),deaths:r.filter(r=>r.outcome==='death').length,clears:r.filter(r=>r.outcome==='clear').length,timeouts:r.filter(r=>r.outcome==='timeout').length,stalled:mean('stalled')};});
await writeFile(file.replace('.jsonl','.json'),JSON.stringify({method:'Normal health/cooldowns/scoring, fixed-seed active bots, native kits (Stage 3 must equip required relics), 0.2s decisions, stage-specific navigation and warning avoidance. No health overrides. Timeout/clear times are censored survival observations, not times to death.',stage,hz:1/dt,limit,seeds,summary,rows},null,2));console.log('SUMMARY '+JSON.stringify(summary));
