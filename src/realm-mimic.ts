import {Game,type Enemy} from './simulation.ts';
import {REALM_PATHS,REALM_GROTTOS,insideRealm,realmCachedSteer,moveRealm,inTitanArena,realmAltar} from './titan-realm-map.ts';
import type {Identity} from './identity.ts';
import {releasedPower} from './unbound.ts';

export const MIMIC_BALANCE={damage:.25,health:.75,recovery:.75,maxPlayerHit:.25,maxMimicHit:.25,transform:1.5};

type Point={x:number;y:number};
type Target={proxy:Enemy;body:Enemy|Game['player']|Game['servants'][number];serial:number;kind:'player'|'enemy'|'servant'};
export type RealmMimic={route:number;mode:'passage'|'chase'|'roam';goal:Point;brain:Game|null;identity:Identity|null;copiedAt:number;lost:number;decision:number;bank:number;targets:Target[];slot:number;wanderAt:number};
const peripheral=REALM_PATHS.slice(0,6);
const shrineBounds=REALM_GROTTOS.map(s=>({left:s.x+Math.min(...s.floor.map(p=>p[0])),right:s.x+Math.max(...s.floor.map(p=>p[0])),top:s.y+Math.min(...s.floor.map(p=>p[1])),bottom:s.y+Math.max(...s.floor.map(p=>p[1]))}));
const outside=(p:Point,q:Point,w:number,h:number)=>Math.abs(p.x-q.x)>w||Math.abs(p.y-q.y)>h;
const spawnCache=new Map<string,Point[][]>();
// Prepared once per viewport class, outside the per-frame movement loop.
export function mimicSpawnSites(halfW:number,halfH:number){
 const w=Math.ceil(Math.max(halfW,740)/80)*80,h=Math.ceil(Math.max(halfH,480)/80)*80,key=w+':'+h;
 const cached=spawnCache.get(key);if(cached)return cached;
 const sites=peripheral.map(path=>{const strict:Point[]=[],fallback:Point[]=[];for(const q of path.curve)for(const offset of [-45,0,45]){const p={x:q.x+offset,y:q.y};if(!insideRealm(p.x,p.y,30)||inTitanArena(p.x,p.y)||!outside(p,path.curve[0],w,h)||!outside(p,path.curve.at(-1)!,w,h))continue;
  if(shrineBounds.some(r=>p.x>=r.left&&p.x<=r.right&&p.y>=r.top&&p.y<=r.bottom))continue;
  fallback.push(p);if(shrineBounds.every(r=>p.x<r.left-w||p.x>r.right+w||p.y<r.top-h||p.y>r.bottom+h))strict.push(p);
 }return strict.length?strict:fallback;});
 if(spawnCache.size>=4)spawnCache.delete(spawnCache.keys().next().value!);spawnCache.set(key,sites);return sites;
}
export function queueRealmMimic(g:Game){const state=g.realm!.mimics;if(g.realm!.shrines.filter(s=>s.claimed).length<2||state.released>=6)return;state.released++;state.pending++;}
export function spawnRealmMimics(g:Game){const s=g.realm!.mimics;if(!s.pending)return;const sites=mimicSpawnSites(g.targetView.x,g.targetView.y),routes=sites.map((points,route)=>({route,points:points.filter(p=>outside(p,g.player,g.targetView.x+150,g.targetView.y+150))})).filter(r=>r.points.length&&!s.routes.includes(r.route));if(!routes.length)return;
 const choice=routes[Math.floor(g.random()*routes.length)],p=choice.points[Math.floor(g.random()*choice.points.length)],e=g.spawn('elite');if(!e)return;
 const mimic:RealmMimic={route:choice.route,mode:'passage',goal:{...p},brain:null,identity:null,copiedAt:-1,lost:0,decision:0,bank:0,targets:[],slot:0,wanderAt:0};
 Object.assign(e,{x:p.x,y:p.y,hp:g.player.maxHp*MIMIC_BALANCE.health,maxHp:g.player.maxHp*MIMIC_BALANCE.health,mimic,realm:{role:'mimic',homeX:p.x,homeY:p.y,variant:0},receiveDamage:(amount:number)=>{const b=awakenMimic(g,e);b.player.hp=e.hp;const hp=b.player.hp;b.hurt(amount,b.player.maxHp*MIMIC_BALANCE.maxMimicHit);return Math.max(0,hp-b.player.hp);}});
 s.pending--;s.routes.push(choice.route);
}
export function mimicInView(g:Game,e:Enemy){return !outside(e,g.player,g.targetView.x-35,g.targetView.y-35);}
export function awakenMimic(g:Game,e:Enemy){const m=e.mimic!;if(m.brain)return m.brain;
 // An independent combat instance has no enemy pool, world spawns, objectives or records.
 const b=new Game((g.seed^e.serial*2654435761)>>>0,{...g.identity,colors:{...g.identity.colors}},2,g.titanKit,true);
 b.powers=g.powers.map(p=>({...p}));b.relicOwners=[...g.relicOwners];b.player.maxHp=g.player.maxHp*MIMIC_BALANCE.health;b.damageScale=MIMIC_BALANCE.damage;b.recoveryScale=MIMIC_BALANCE.recovery;b.attacksBlockedUntil=g.time+MIMIC_BALANCE.transform;b.player.hp=b.player.maxHp;e.maxHp=e.hp=b.player.maxHp;b.player.x=e.x;b.player.y=e.y;b.targetView={...g.targetView};b.lungeCharges=b.maxLungeCharges();b.score.carnage=g.score.carnage;b.time=g.time;
 b.armyProvider=()=>g.armyMembers();
 b.sound=kind=>{if(e.active&&mimicInView(g,e)&&!['heal','shield','carnage','hurt','lowHealth','defeat'].includes(kind))g.sound(kind);};
 m.brain=b;m.identity=b.identity;m.mode='chase';m.copiedAt=g.time;m.lost=0;g.effect(e.x,e.y,'realm-breach',110,MIMIC_BALANCE.transform);g.sound('corruption');g.announce('MIMIC · YOUR REFLECTION HAS FOUND YOU');return b;
}
const roamingGoals=[...REALM_PATHS.flatMap(p=>[p.curve[0],p.curve.at(-1)!]),...REALM_GROTTOS.map(s=>realmAltar(s.id)),{x:0,y:0},{x:300,y:100},{x:-300,y:-100}].filter(p=>insideRealm(p.x,p.y,30));
function onPassage(p:Point,route:number){const curve=peripheral[route].curve;for(let i=1;i<curve.length;i++){const a=curve[i-1],b=curve[i],dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1)));if(Math.hypot(p.x-a.x-dx*t,p.y-a.y-dy*t)<145)return true;}return false;}
function chooseGoal(g:Game,e:Enemy){const m=e.mimic!,points=m.mode==='passage'?mimicSpawnSites(g.targetView.x,g.targetView.y)[m.route]:roamingGoals,far=points.filter(p=>Math.hypot(p.x-e.x,p.y-e.y)>120),pool=far.length?far:points;if(pool.length)m.goal={...pool[Math.floor(g.random()*pool.length)]};m.wanderAt=g.time+12+g.random()*12;}
function syncTargets(g:Game,e:Enemy){const m=e.mimic!,b=m.brain!;
 const bodies:{body:Target['body'];serial:number;kind:Target['kind']}[]=[];
 if(m.mode==='chase'&&!g.ended)bodies.push({body:g.player,serial:-1,kind:'player'});
 for(let i=0;i<g.servants.length;i++){const s=g.servants[i];if(s.active&&Math.hypot(s.x-e.x,s.y-e.y)<950)bodies.push({body:s,serial:-100-i,kind:'servant'});}
 for(const prey of g.enemies)if(prey.active&&!prey.mimic&&prey.realm?.role==='attendant'&&Math.hypot(prey.x-e.x,prey.y-e.y)<850&&bodies.length<40)bodies.push({body:prey,serial:prey.serial,kind:'enemy'});
 // Keep proxy identity stable for piercing hits, summons and held enemies.
 const next:Target[]=[];
 for(const held of m.targets)if(held.proxy.grabbed&&!bodies.some(t=>t.body===held.body))bodies.push({body:held.body,serial:held.serial,kind:held.kind});
 for(const item of bodies){let t=m.targets.find(t=>t.body===item.body&&t.serial===item.serial);if(!t){const p:Enemy={active:true,kind:item.kind==='enemy'?(item.body as Enemy).kind:item.kind==='servant'?'thrall':'elite',x:0,y:0,hp:0,maxHp:0,vx:0,vy:0,timer:0,windup:0,flash:0,serial:item.serial};t={...item,proxy:p};if(item.kind==='servant')p.servantTarget=item.body as Game['servants'][number];p.receiveDamage=amount=>{const body=t!.body,old=body.hp;if(t!.kind==='player')g.hurt(amount,g.player.maxHp*MIMIC_BALANCE.maxPlayerHit);else if(t!.kind==='enemy'){const prey=body as Enemy;if(!prey.active||prey.serial!==t!.serial)return 0;prey.hp=Math.max(0,prey.hp-amount);prey.flash=.1;if(prey.hp<=0){prey.active=false;g.alive--;}}else{const servant=body as Game['servants'][number];if(!servant.active)return 0;servant.hp=Math.max(0,servant.hp-amount);if(servant.hp<=0)servant.active=false;}return Math.max(0,old-body.hp);};}
 const p=t.proxy,body=t.body;p.active=t.kind==='player'?!g.ended:(body as Enemy).active;p.x=body.x;p.y=body.y;p.hp=body.hp;p.maxHp=t.kind==='player'?g.player.maxHp:t.kind==='enemy'?(body as Enemy).maxHp:220;
 if(t.kind==='enemy')p.corruptUntil=(body as Enemy).corruptUntil;next.push(t);
 }
 m.targets=next;b.enemies=next.map(t=>t.proxy);b.alive=b.enemies.filter(t=>t.active).length;b.rebuildGrid();
}
function commitControls(g:Game,e:Enemy,dt:number){const m=e.mimic!,b=m.brain!;
 for(const t of m.targets){const p=t.proxy,body=t.body;if(t.kind==='enemy'){const prey=body as Enemy;if(prey.serial!==t.serial)continue;if(!p.active&&prey.active){prey.active=false;g.alive--;}prey.grabbed=p.grabbed;prey.corruptUntil=p.corruptUntil;prey.fearedUntil=p.fearedUntil;prey.snaredUntil=p.snaredUntil;if(p.grabbed){prey.x=p.x;prey.y=p.y;}prey.vx+=p.vx;prey.vy+=p.vy;}
 else if(t.kind==='player'&&!g.ended){if(p.grabbed){const from={x:body.x,y:body.y};body.x=p.x;body.y=p.y;moveRealm(body,from,23);g.controlledUntil=g.time+.1;}else if(p.vx||p.vy){const from={x:body.x,y:body.y};body.x+=p.vx*dt;body.y+=p.vy*dt;moveRealm(body,from,23);}if((p.fearedUntil||0)>b.time){const from={x:body.x,y:body.y},d=Math.hypot(body.x-e.x,body.y-e.y)||1;body.x+=(body.x-e.x)/d*125*dt;body.y+=(body.y-e.y)/d*125*dt;moveRealm(body,from,23);g.controlledUntil=g.time+.1;}}
 p.vx=p.vy=0;
 }
}
function syncReflections(g:Game,e:Enemy){const b=e.mimic!.brain!;for(const servant of b.servants){let actor=g.enemies.find(a=>a.active&&a.reflection?.servant===servant);if(!servant.active)continue;if(!actor){actor=g.spawn('thrall');if(!actor)continue;Object.assign(actor,{x:servant.x,y:servant.y,hp:servant.hp,maxHp:220,reflection:{owner:e,servant},realm:{role:'reflection',homeX:servant.x,homeY:servant.y,variant:4},receiveDamage:(amount:number)=>{if(!servant.active)return 0;const old=servant.hp;servant.hp=Math.max(0,servant.hp-amount);if(servant.hp<=0)servant.active=false;return old-servant.hp;}});}actor.x=servant.x;actor.y=servant.y;actor.hp=servant.hp;}}
function decideCast(g:Game,e:Enemy,target:Point,d:number){const m=e.mimic!,b=m.brain!;if(m.decision>0||b.vault||b.moonFury>0||b.beam>0||b.cycloneSpin)return;m.decision=.35+g.random()*.15;
 b.setMovementDirection(target.x-e.x,target.y-e.y);b.player.angle=Math.atan2(target.y-e.y,target.x-e.x);
 for(let i=0;i<4;i++){const slot=(m.slot+i)%4,p=b.powers[slot],power=releasedPower(p,b.relicOwners[slot],4);if(b.cooldowns[slot]>0&&!(p.effect==='lunge'&&b.lungeCharges>0))continue;
 const ranged=['meteor','vortex','beam','reapervolley','reaperblink','parkour','charge','lunge','wolfcyclone'].includes(p.effect),buff=['summon','frenzy','reaperstorm','wolffury'].includes(p.effect);
 if(!buff&&d>Math.max(power.radius+45,ranged?650:0)||buff&&d>650)continue;
 if(p.effect==='summon'&&b.servants.filter(s=>s.active).length>12)continue;
 const point=['meteor','vortex','parkour','reapervolley','reaperblink','wolfcyclone'].includes(p.effect)&&b.insideMap(target.x,target.y)?{...target}:undefined;
 if(b.cast(slot,point)){commitControls(g,e,.05);m.slot=(slot+1)%4;return;}
 }
}
export function updateRealmMimic(g:Game,e:Enemy,dt:number){const m=e.mimic!,visible=mimicInView(g,e),distance=Math.hypot(e.x-g.player.x,e.y-g.player.y);
 if(!m.brain&&visible)awakenMimic(g,e);
 if(m.brain&&m.mode!=='chase'&&visible){m.mode='chase';m.lost=0;}
 if(m.mode==='chase'){m.lost=!visible&&distance>1250?m.lost+dt:0;if(m.lost>=2.5){m.mode='roam';m.lost=0;chooseGoal(g,e);}}
 if(m.mode!=='chase'&&(Math.hypot(e.x-m.goal.x,e.y-m.goal.y)<45||g.time>=m.wanderAt))chooseGoal(g,e);
 m.bank+=dt;const interval=visible||m.mode==='chase'?.05:.2;if(m.bank<interval)return;const elapsed=Math.min(m.bank,.25);m.bank=0;
 const from={x:e.x,y:e.y},goal=m.mode==='chase'?g.player:m.goal,v=realmCachedSteer(e,goal.x,goal.y,g.time);
 if(!m.brain){e.x+=v.x*65*elapsed;e.y+=v.y*65*elapsed;moveRealm(e,from,24);if(!onPassage(e,m.route)){e.x=from.x;e.y=from.y;m.wanderAt=0;}return;}
 const b=m.brain;b.time=g.time-elapsed;b.player.x=e.x;b.player.y=e.y;b.player.hp=e.hp;b.targetView={...g.targetView};m.decision-=elapsed;
 if(g.time-m.copiedAt<MIMIC_BALANCE.transform){b.time=g.time;b.player.invuln=Math.max(0,b.player.invuln-elapsed);e.x+=e.vx*elapsed;e.y+=e.vy*elapsed;moveRealm(e,from,23);e.vx*=Math.exp(-elapsed*4);e.vy*=Math.exp(-elapsed*4);return;}
 syncTargets(g,e);
 const afraid=(e.fearedUntil||0)>g.time;if(m.mode==='chase'&&!afraid)decideCast(g,e,g.player,distance);
 let x=v.x,y=v.y;const preferred=b.monster.basic.ranged?Math.min(340,b.monster.basic.radius*b.releaseStats.radius*.7):65;
 if(m.mode==='chase'&&distance<preferred){x=0;y=0;}if((e.snaredUntil||0)>g.time){x*=.18;y*=.18;}
 if(afraid){const d=distance||1;x=(e.x-g.player.x)/d;y=(e.y-g.player.y)/d;}
 // Real player update uses exact cooldowns, attack collision, passive recovery and power effects.
 let remaining=elapsed;while(remaining>0&&!b.ended){const step=Math.min(.05,remaining);b.update(step,{x,y,aimX:goal.x,aimY:goal.y,aiming:m.mode==='chase'});commitControls(g,e,step);remaining-=step;}
 e.x=b.player.x+e.vx*elapsed;e.y=b.player.y+e.vy*elapsed;if(!b.vault)moveRealm(e,from,23);e.vx*=Math.exp(-elapsed*4);e.vy*=Math.exp(-elapsed*4);e.hp=b.player.hp;syncReflections(g,e);
}
