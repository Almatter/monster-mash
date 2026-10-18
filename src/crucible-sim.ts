import {MONSTERS} from './content-monsters.ts';
export const CRUCIBLE={width:3600,height:3200,cx:1800,cy:1600,campRadius:1140,ringRadius:350,arenaRadius:460,laneWidth:120,baseRadius:190,troopCap:28,respawn:10,crystalHp:6500,captainHp:2600,defenseRadius:360};
export type CrucibleKind='champion'|'infantry'|'ranged'|'captain'|'crystal';
export type CrucibleUnit={id:number;active:boolean;team:number;kind:CrucibleKind;x:number;y:number;hx:number;hy:number;hp:number;maxHp:number;speed:number;radius:number;range:number;damage:number;interval:number;attack:number;power:number;ultimate:number;think:number;target:number;facing:number;moving:boolean;flash:number;invuln:number;slow:number;poison:number;poisonTeam:number;poisonTick:number;buff:number;pulse:number;marched:boolean;retreat:boolean;objective:number;chase:number;chaseX:number;chaseY:number;recover:number;avoid:number;navTeam:number;navIndex:number;nav:{x:number;y:number;node:number}[]};
export type CrucibleTeam={monster:string;champion:CrucibleUnit;crystal:CrucibleUnit;guards:CrucibleUnit[];respawnAt:number;eliminated:boolean;deaths:number;kills:number;wave:number;goal:number;armyGoal:number;armyTarget:number;armyFirst:number;plan:number;aggression:number;trapReady:number[];breaches:number[];defendTarget:number;defendUntil:number;escort:{x:number;y:number;until:number;team:number}};
export type CrucibleEffect={x:number;y:number;radius:number;life:number;total:number;art:string;team:number;warning?:boolean;damage?:number;slow?:number};
export type CrucibleShot={x:number;y:number;tx:number;ty:number;team:number;target:number;damage:number;life:number;art:string;defense?:boolean;source:number};
export class Crucible{
 seed=17;time=0;serial=0;state:number;units:CrucibleUnit[]=[];teams:CrucibleTeam[]=[];effects:CrucibleEffect[]=[];shots:CrucibleShot[]=[];events:{time:number;text:string}[]=[];kills=0;winner=-1;controlled=-1;density=20;input={x:0,y:0};
 private lanes:{nodes:{x:number;y:number}[];edges:[number,number][]}|null=null;private gridCols=Math.ceil(CRUCIBLE.width/160)+1;private grid=new Map<number,CrucibleUnit[]>();private byId=new Map<number,CrucibleUnit>();private free:CrucibleUnit[][]=[];
 constructor(seed=17){this.seed=seed;this.state=seed||1;const ids=Object.keys(MONSTERS),positions=ids.map((_,i)=>i);for(let i=positions.length-1;i>0;i--){const j=Math.floor(this.random()*(i+1));[positions[i],positions[j]]=[positions[j],positions[i]];}
  for(let team=0;team<8;team++){const a=-Math.PI/2+positions[team]*Math.PI/4,x=CRUCIBLE.cx+Math.cos(a)*CRUCIBLE.campRadius,y=CRUCIBLE.cy+Math.sin(a)*CRUCIBLE.campRadius,m=MONSTERS[ids[team]],crystal=this.make(team,'crystal',x,y),champion=this.make(team,'champion',x-Math.cos(a)*115,y-Math.sin(a)*100),guards=[-1,1].map(side=>this.make(team,'captain',x-Math.cos(a)*70+Math.sin(a)*side*90,y-Math.sin(a)*60-Math.cos(a)*side*70));guards[1].range=620;guards[1].damage=360;champion.maxHp=champion.hp=Math.max(2100,Math.min(3100,m.hp*1.35+1000));champion.speed=m.speed*.9;champion.damage=Math.max(44,m.basic.damage*1.5);champion.interval=m.basic.interval;champion.range=m.basic.ranged?285:ids[team]==='reaper'?170:95;
   this.teams.push({monster:ids[team],champion,crystal,guards,respawnAt:0,eliminated:false,deaths:0,kills:0,wave:1+this.random(),goal:(team+1)%8,armyGoal:-1,armyTarget:0,armyFirst:-1,plan:0,aggression:.6+this.random()*.8,trapReady:[0,0,0],breaches:Array(8).fill(0),defendTarget:0,defendUntil:0,escort:{x:0,y:0,until:0,team:-1}});this.free.push([]);for(let i=0;i<CRUCIBLE.troopCap;i++){const u=this.make(team,i%4===0?'ranged':'infantry',x,y);u.active=false;this.free[team].push(u);}for(let i=0;i<16;i++)this.spawn(team);}
  this.event('The eight claimants enter. Their ritual crystals anchor their lives.');this.rebuild();
 }
 random(){let x=this.state;x^=x<<13;x^=x>>>17;x^=x<<5;this.state=x>>>0;return this.state/4294967296;}
 private make(team:number,kind:CrucibleKind,x:number,y:number){const crystal=kind==='crystal',captain=kind==='captain',u:CrucibleUnit={id:++this.serial,active:true,team,kind,x,y,hx:x,hy:y,hp:crystal?CRUCIBLE.crystalHp:captain?CRUCIBLE.captainHp:110,maxHp:crystal?CRUCIBLE.crystalHp:captain?CRUCIBLE.captainHp:110,speed:crystal?0:captain?95:125+this.random()*18,radius:crystal?48:captain?25:13,range:crystal?400:captain?620:kind==='ranged'?205:36,damage:crystal?380:captain?400:kind==='ranged'?15:20,interval:captain?1.1:kind==='ranged'?1.3:1,attack:this.random(),power:3+this.random()*5,ultimate:12+this.random()*10,think:this.random()*.3,target:0,facing:1,moving:false,flash:0,invuln:0,slow:0,poison:0,poisonTeam:team,poisonTick:0,buff:0,pulse:0,marched:false,retreat:false,objective:-1,chase:0,chaseX:x,chaseY:y,recover:0,avoid:0,navTeam:-1,navIndex:0,nav:[]};if(kind==='champion')u.radius=27;this.units.push(u);this.byId.set(u.id,u);return u;}
 private event(text:string){this.events.push({time:this.time,text});if(this.events.length>100)this.events.shift();}
 private rebuild(){this.lanes=null;for(const bucket of this.grid.values())bucket.length=0;for(const u of this.units)if(u.active){const key=Math.floor(u.x/160)+Math.floor(u.y/160)*this.gridCols;let b=this.grid.get(key);if(!b){b=[];this.grid.set(key,b);}b.push(u);}}
 private near(x:number,y:number,r:number,visit:(u:CrucibleUnit)=>void){const x0=Math.max(0,Math.floor((x-r)/160)),x1=Math.min(Math.floor(CRUCIBLE.width/160),Math.floor((x+r)/160)),y0=Math.max(0,Math.floor((y-r)/160)),y1=Math.min(Math.floor(CRUCIBLE.height/160),Math.floor((y+r)/160));for(let iy=y0;iy<=y1;iy++)for(let ix=x0;ix<=x1;ix++)for(const u of this.grid.get(ix+iy*this.gridCols)||[])if(u.active&&Math.hypot(u.x-x,u.y-y)<=r)visit(u);}
 private spawn(team:number){const t=this.teams[team];if(!t||!t.crystal.active||t.eliminated||this.free[team].filter(u=>u.active).length>=this.density)return;const u=this.free[team].find(u=>!u.active);if(!u)return;this.byId.delete(u.id);u.id=++this.serial;this.byId.set(u.id,u);const index=this.free[team].indexOf(u),angle=Math.atan2(CRUCIBLE.cy-t.crystal.y,CRUCIBLE.cx-t.crystal.x),forward=80+Math.floor(index/4)*22,side=(index%4-1.5)*30;u.x=t.crystal.x+Math.cos(angle)*forward-Math.sin(angle)*side+(this.random()-.5)*8;u.y=t.crystal.y+Math.sin(angle)*forward+Math.cos(angle)*side+(this.random()-.5)*8;Object.assign(u,{active:true,hp:u.maxHp,attack:this.random(),target:0,think:0,poison:0,slow:0,buff:0,invuln:1,marched:false,objective:-1,chase:0,chaseX:u.x,chaseY:u.y,recover:0,avoid:0,navTeam:-1,navIndex:0,nav:[]});}
 guards(team:number){return this.teams[team].guards.filter(g=>g.active).length;}
 trapPoints(team:number){const c=this.teams[team].crystal,a=Math.atan2(CRUCIBLE.cy-c.y,CRUCIBLE.cx-c.x);return [-.7,0,.7].map(d=>({x:c.x+Math.cos(a+d)*145,y:c.y+Math.sin(a+d)*115}));}
 effect(x:number,y:number,radius:number,art:string,team:number,life=.45){if(this.effects.length<72)this.effects.push({x,y,radius,art,team,life,total:life});}
 private eliminate(team:number){const t=this.teams[team];if(t.eliminated)return;t.eliminated=true;t.respawnAt=0;for(const u of this.units)if(u.team===team&&u.kind!=='champion')u.active=false;this.event(MONSTERS[t.monster].archetype+' is eliminated. No crystal remains to call them back.');}
 damage(u:CrucibleUnit,raw:number,team:number,poison=false,defense=false,source?:CrucibleUnit){if(!u.active||u.team===team||u.invuln>0||raw<=0)return 0;if(source?.kind==='champion'&&((u.kind==='captain'&&!this.inDefense(u.team,source))||(u.kind==='crystal'&&!this.inBase(u.team,source)))){if(u.flash<=0){this.effect(u.x,u.y,85,'arcane-dissolve',u.team,.25);u.flash=.2;}return 0;}let damage=raw;if(defense&&(u.kind==='infantry'||u.kind==='ranged'))damage*=.2;if(u.kind==='champion')damage=Math.min(u.maxHp*(defense ? .20 : .075),raw*(defense ? 1.8 : .24));if(u.kind==='captain'){const camp=this.teams[u.team],support=this.siegeSupport(team,u.team);if(support>=3)camp.breaches[team]=this.time+6;damage*=source?.kind==='champion'&&support<3&&camp.breaches[team]<=this.time?.10:source?.kind==='champion'?.75:.5;}if(u.kind==='crystal')damage*=.45*(this.guards(u.team)>.0?.18:1);const actual=Math.min(u.hp,damage);u.hp-=actual;u.flash=.13;if(u.kind==='infantry'||u.kind==='ranged'){const attacker=source;if(attacker?.kind==='champion'&&attacker.active&&this.adjacent(u,attacker)){u.target=attacker.id;u.think=.4;u.recover=0;u.avoid=0;u.chase=0;u.chaseX=u.x;u.chaseY=u.y;}}if(u.kind==='champion'&&source?.active&&source.team!==u.team&&this.guardianCanTarget(u.team,source)){const camp=this.teams[u.team];camp.defendTarget=source.id;camp.defendUntil=this.time+4;for(const guard of [...camp.guards,camp.crystal])if(guard.active&&this.defenseCanTarget(guard,source)){guard.target=source.id;guard.think=0;}}if(poison&&u.kind!=='crystal'){u.poison=4;u.poisonTeam=team;u.slow=Math.max(u.slow,.7);}if(u.hp>0)return actual;
  u.active=false;const t=this.teams[u.team],killer=MONSTERS[this.teams[team].monster].archetype;this.effect(u.x,u.y,u.kind==='champion'?100:45,'enemy-hit',team,.3);
  if(u.kind==='champion'){t.deaths++;this.teams[team].kills++;if(t.crystal.active){t.respawnAt=this.time+CRUCIBLE.respawn;this.event(killer+' felled '+MONSTERS[t.monster].archetype+' · crystal recalls them in 10s.');}else this.eliminate(u.team);}
  else if(u.kind==='crystal'){this.event(killer+' shattered '+MONSTERS[t.monster].archetype+'’s life crystal. Their next death is final.');if(!t.champion.active)this.eliminate(u.team);}
  else if(u.kind==='captain')this.event(killer+' defeated a '+MONSTERS[t.monster].archetype+' crystal guardian · '+this.guards(u.team)+' remain.');
  else{this.kills++;if(this.teams[team].monster==='devourer'||this.teams[team].monster==='reaper'){const h=this.teams[team].champion;if(h.active)h.hp=Math.min(h.maxHp,h.hp+12);}}
  return actual;
 }
 private blast(team:number,x:number,y:number,radius:number,raw:number,art:string,poison=false,push=0,provokes=true){this.effect(x,y,radius*1.25,art,team,.5);let damage=0;this.near(x,y,radius,u=>{if(u.team===team)return;damage+=this.damage(u,raw,team,poison,false,provokes?this.teams[team].champion:undefined);if(push&&u.active&&u.kind!=='crystal'&&u.kind!=='captain'){const d=Math.hypot(u.x-x,u.y-y)||1,force=u.kind==='champion'?push*.15:push;u.x+=(u.x-x)/d*force;u.y+=(u.y-y)/d*force;this.confine(u);}});return damage;}
 // One stable siege order per army: clear one guardian at a time, then its crystal.
 rally(team:number){const c=this.teams[team].crystal;const a=Math.atan2(c.y-CRUCIBLE.cy,c.x-CRUCIBLE.cx);return {x:CRUCIBLE.cx+Math.cos(a)*CRUCIBLE.ringRadius,y:CRUCIBLE.cy+Math.sin(a)*CRUCIBLE.ringRadius};}
 private baseAlive(team:number){const t=this.teams[team];return !!t&&!t.eliminated&&(t.crystal.active||t.guards.some(g=>g.active));}
 private otherNeighbor(team:number){
  const t=this.teams[team];if(t.armyFirst<0||this.baseAlive(t.armyFirst))return -1;
  const ring=this.teams.map((v,i)=>({i,angle:Math.atan2(v.crystal.y-CRUCIBLE.cy,v.crystal.x-CRUCIBLE.cx)})).sort((a,b)=>a.angle-b.angle).map(v=>v.i),index=ring.indexOf(team),left=ring[(index+7)%8],right=ring[(index+1)%8];
  const other=t.armyFirst===left?right:t.armyFirst===right?left:-1;return other>=0&&this.baseAlive(other)?other:-1;
 }
 private assignArmies(){
  const rows=this.teams.map((t,i)=>({t,i})).filter(({t})=>!t.eliminated&&t.crystal.active),used=new Set<number>();
  let best=Infinity,orders:number[]=[],choice:number[]=[];
  // Match camps uniquely. Preserve existing orders unless freeing a destroyed camp forces a reassignment.
  const search=(index:number,cost:number)=>{
   if(cost>=best)return;
   if(index===rows.length){best=cost;orders=[...choice];return;}
   const {t,i}=rows[index],own=t.crystal,retain=this.baseAlive(t.armyGoal)&&t.armyGoal!==i,opposite=!retain?this.otherNeighbor(i):-1;
   const options=this.teams.map((enemy,j)=>({j,cost:Math.hypot(enemy.crystal.x-own.x,enemy.crystal.y-own.y)+(retain&&t.armyGoal!==j?100000:0)+(opposite>=0&&opposite!==j?10000000:0)})).filter(v=>v.j!==i&&this.baseAlive(v.j)&&!used.has(v.j)).sort((a,b)=>a.cost-b.cost);
   for(const option of options){used.add(option.j);choice.push(option.j);search(index+1,cost+option.cost);choice.pop();used.delete(option.j);}
   choice.push(-1);search(index+1,cost+1e9);choice.pop();
  };
  search(0,0);for(const t of this.teams)if(t.eliminated||!t.crystal.active){t.armyGoal=-1;t.armyTarget=0;}
  for(const [index,{t}] of rows.entries()){const goal=orders[index]??-1;if(t.armyGoal!==goal)t.armyTarget=0;t.armyGoal=goal;if(t.armyFirst<0&&goal>=0)t.armyFirst=goal;}
 }
 private armyObjective(team:number){
  const army=this.teams[team];if(!army.crystal.active||army.eliminated){army.armyGoal=-1;army.armyTarget=0;return undefined;}
  if(army.armyGoal===team||!this.baseAlive(army.armyGoal))this.assignArmies();
  const enemy=this.teams[army.armyGoal];if(!enemy)return undefined;
  const current=this.byId.get(army.armyTarget);if(current?.active&&current.team===army.armyGoal)return current;
  const own=army.crystal,next=enemy.guards.filter(g=>g.active).sort((a,b)=>Math.hypot(a.x-own.x,a.y-own.y)-Math.hypot(b.x-own.x,b.y-own.y))[0]||enemy.crystal;
  army.armyTarget=next.id;return next;
 }
 private inDefense(team:number,u:{x:number;y:number}){const c=this.teams[team].crystal;return Math.hypot(u.x-c.x,u.y-c.y)<=CRUCIBLE.defenseRadius;}
 private siegeSupport(team:number,defender:number){let count=0;const base=this.teams[defender].crystal;this.near(base.x,base.y,CRUCIBLE.defenseRadius,u=>{if(u.team===team&&(u.kind==='infantry'||u.kind==='ranged'))count++;});return count;}
 private guardianCanTarget(team:number,u:CrucibleUnit){const home=this.teams[u.team].crystal;return u.active&&u.team!==team&&u.kind!=='captain'&&u.kind!=='crystal'&&this.inDefense(team,u)&&Math.hypot(u.x-home.x,u.y-home.y)>CRUCIBLE.baseRadius;}
 private adjacent(u:CrucibleUnit,v:CrucibleUnit){return Math.hypot(v.x-u.x,v.y-u.y)<=u.radius+v.radius+16;}
 laneSegments(){
  if(this.lanes)return this.lanes;const points=this.teams.map((_,i)=>this.rally(i)),ring=points.map((p,i)=>({i,a:Math.atan2(p.y-CRUCIBLE.cy,p.x-CRUCIBLE.cx)})).sort((a,b)=>a.a-b.a).map(v=>v.i);
  const nodes=[...points,...this.teams.map(t=>({x:t.crystal.x,y:t.crystal.y}))],edges:[number,number][]=[];
  for(let i=0;i<8;i++){edges.push([i,i+8]);edges.push([ring[i],ring[(i+1)%8]]);}
  return this.lanes={nodes,edges};
 }
 private project(x:number,y:number,a:{x:number;y:number},b:{x:number;y:number}){const dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((x-a.x)*dx+(y-a.y)*dy)/(dx*dx+dy*dy||1)));return {x:a.x+dx*t,y:a.y+dy*t};}
 private buildRoute(u:CrucibleUnit,team:number,rallyOnly=false){
  const {nodes,edges}=this.laneSegments(),destination=rallyOnly?team:team+8;let best=Infinity,edge=edges[0],join=nodes[edge[0]];
  for(const e of edges){const p=this.project(u.x,u.y,nodes[e[0]],nodes[e[1]]),d=Math.hypot(u.x-p.x,u.y-p.y);if(d<best){best=d;edge=e;join=p;}}
  const distances=nodes.map(()=>Infinity),next=nodes.map(()=>-1),done=new Set<number>();distances[destination]=0;
  for(let i=0;i<nodes.length;i++){let at=-1;for(let j=0;j<nodes.length;j++)if(!done.has(j)&&(at<0||distances[j]<distances[at]))at=j;if(at<0||!Number.isFinite(distances[at]))break;done.add(at);
   for(const [a,b] of edges){const to=a===at?b:b===at?a:-1;if(to<0)continue;const d=distances[at]+Math.hypot(nodes[to].x-nodes[at].x,nodes[to].y-nodes[at].y);if(d<distances[to]){distances[to]=d;next[to]=at;}}
  }
  const start=[...edge].sort((a,b)=>Math.hypot(nodes[a].x-join.x,nodes[a].y-join.y)+distances[a]-Math.hypot(nodes[b].x-join.x,nodes[b].y-join.y)-distances[b])[0];
  u.nav=[{...join,node:-1}];for(let at=start,limit=0;at>=0&&limit<17;at=next[at],limit++){u.nav.push({...nodes[at],node:at});if(at===destination)break;}u.navIndex=0;u.navTeam=rallyOnly?-team-2:team;
 }
 private escort(team:number,enemy:number){
  const memo=this.teams[team].escort;if(memo.team===enemy&&memo.until>this.time)return memo;const remember=(point:{x:number;y:number})=>Object.assign(memo,point,{until:this.time+.35,team:enemy});
  const base=this.teams[enemy].crystal;let front:CrucibleUnit|undefined,rank=Infinity;
  for(const v of this.free[team])if(v.active){this.route(v);if(!v.nav.length)continue;let d=Math.hypot(v.x-v.nav[v.navIndex].x,v.y-v.nav[v.navIndex].y);for(let i=v.navIndex+1;i<v.nav.length;i++)d+=Math.hypot(v.nav[i].x-v.nav[i-1].x,v.nav[i].y-v.nav[i-1].y);if(d<rank){rank=d;front=v;}}
  if(!front)return remember(this.rally(team));
  const next=this.route(front),dx=next.x-front.x,dy=next.y-front.y,d=Math.hypot(dx,dy)||1,point={x:front.x+dx/d*45,y:front.y+dy/d*45},bx=point.x-base.x,by=point.y-base.y,bd=Math.hypot(bx,by)||1;
  return remember(bd<CRUCIBLE.defenseRadius+35?{x:base.x+bx/bd*(CRUCIBLE.defenseRadius+35),y:base.y+by/bd*(CRUCIBLE.defenseRadius+35)}:point);
 }
 private inBase(team:number,u:{x:number;y:number}){const c=this.teams[team].crystal;return Math.hypot(u.x-c.x,u.y-c.y)<=CRUCIBLE.baseRadius;}
 private route(u:CrucibleUnit):{x:number;y:number}{
  const target=this.armyObjective(u.team);u.objective=this.teams[u.team].armyGoal;
  const destination=target?.team??u.team,key=target?destination:-destination-2;
  if(u.navTeam!==key||!u.nav.length)this.buildRoute(u,destination,!target);
  while(u.navIndex<u.nav.length-1&&Math.hypot(u.x-u.nav[u.navIndex].x,u.y-u.nav[u.navIndex].y)<24){if(u.nav[u.navIndex].node>=0&&u.nav[u.navIndex].node<8)u.marched=true;u.navIndex++;}
  if(target&&this.inBase(target.team,u))return target;
  return u.nav[u.navIndex];
 }
 private crystalCanTarget(team:number,u:CrucibleUnit){return u.active&&u.team!==team&&u.kind!=='captain'&&u.kind!=='crystal'&&this.inBase(team,u);}
 private defenseCanTarget(source:CrucibleUnit,u:CrucibleUnit){return source.kind==='crystal'?this.crystalCanTarget(source.team,u):this.guardianCanTarget(source.team,u);}
 private troopTarget(u:CrucibleUnit){
  const route=this.route(u),previous=this.byId.get(u.target);
  if(previous?.active&&previous.team!==u.team&&previous.kind!=='captain'&&previous.kind!=='crystal'&&this.adjacent(u,previous))return previous;
  let best:CrucibleUnit|undefined,distance=Infinity;
  // Only touching-distance enemies interrupt the siege order, even for ranged troops.
  this.near(u.x,u.y,60,v=>{if(v.team===u.team||v.kind==='captain'||v.kind==='crystal'||!this.adjacent(u,v))return;const d=Math.hypot(v.x-u.x,v.y-u.y);if(d<distance){distance=d;best=v;}});
  if(best){u.chaseX=u.x;u.chaseY=u.y;u.chase=0;u.target=best.id;return best;}
  u.target='id' in route?(route as CrucibleUnit).id:0;return this.byId.get(u.target);
 }
 private target(u:CrucibleUnit){if(u.kind==='infantry'||u.kind==='ranged')return this.troopTarget(u);if(u.kind==='captain'||u.kind==='crystal'){const camp=this.teams[u.team],aggressor=this.byId.get(camp.defendTarget);if(camp.defendUntil>this.time&&aggressor?.active&&aggressor.team!==u.team&&this.defenseCanTarget(u,aggressor)){u.target=aggressor.id;return aggressor;}let best:CrucibleUnit|undefined,distance=Infinity;const c=this.teams[u.team].crystal;this.near(c.x,c.y,u.kind==='crystal'?CRUCIBLE.baseRadius:CRUCIBLE.defenseRadius,v=>{if(!this.defenseCanTarget(u,v))return;const d=Math.hypot(v.x-u.x,v.y-u.y);if(d<distance){distance=d;best=v;}});u.target=best?.id||0;return best;}let best:CrucibleUnit|undefined,rank=Infinity;this.near(u.x,u.y,u.kind==='champion'?480:u.kind==='captain'?380:220,v=>{if(v.team===u.team)return;if(u.kind==='captain'&&Math.hypot(v.x-u.hx,v.y-u.hy)>370)return;const d=Math.hypot(v.x-u.x,v.y-u.y),score=d+(v.kind==='champion'&&u.kind!=='captain'?-65:v.kind==='crystal'&&this.guards(v.team)?1000:0);if(score<rank){rank=score;best=v;}});u.target=best?.id||0;return best;}
 private fire(u:CrucibleUnit,v:CrucibleUnit){const defense=u.kind==='captain'||u.kind==='crystal';if(defense&&!this.defenseCanTarget(u,v))return;if(!defense&&this.shots.length>=80)return;if(this.shots.length>=96){const disposable=this.shots.findIndex(s=>!s.defense);if(disposable<0)return;this.shots.splice(disposable,1);}this.shots.push({x:u.x,y:u.y-20,tx:v.x,ty:v.y,team:u.team,target:v.id,source:u.id,damage:u.damage,life:1.2,defense,art:u.kind==='champion'&&this.teams[u.team].monster==='hag'?'hag-bolt':'hostile-bolt'});}
 power(team:number,ultimate=false){const t=this.teams[team],u=t.champion;if(!u.active||t.eliminated||(ultimate?u.ultimate:u.power)>0)return false;const v=this.byId.get(u.target)||this.target(u);if(!v?.active||Math.hypot(v.x-u.x,v.y-u.y)>500)return false;u.invuln=0;const id=t.monster;if(ultimate)u.ultimate=25+this.random()*5;else u.power=7+this.random()*3;const r=ultimate?235:150,raw=ultimate?580:280;
  if(id==='calamity'){if(this.effects.length<72)this.effects.push({x:v.x,y:v.y,radius:r,art:ultimate?'calamity':'calamity-starfall-preview',team,life:.85,total:.85,warning:true,damage:raw});}
  else if(id==='hag')this.blast(team,v.x,v.y,r,raw,ultimate?'hag-ignite':'hag-mine',true,60);
  else if(id==='lycanthrope'){this.blast(team,v.x,v.y,r,raw,ultimate?'lycanthrope-fury':'lycanthrope-cyclone',false,120);if(ultimate)u.buff=6;}
  else if(id==='titan')this.blast(team,u.x,u.y,r+45,raw*1.2,'titan-cleave',false,100);
  else if(id==='reaper'){const dealt=this.blast(team,u.x,u.y,r+25,raw,'reaper-sweep');u.hp=Math.min(u.maxHp,u.hp+Math.min(100,dealt*.1));if(ultimate)u.buff=6;}
  else if(id==='devourer'){const dealt=this.blast(team,u.x,u.y,r,raw,'devourer-claw-wave');u.hp=Math.min(u.maxHp,u.hp+Math.min(160,dealt*.15));if(ultimate)u.buff=7;}
  else if(id==='overlord'){this.blast(team,v.x,v.y,r,raw,'overlord-soul-brand',true);if(ultimate)for(let i=0;i<8;i++)this.spawn(team);}
  else this.blast(team,v.x,v.y,r,raw,ultimate?'sovereign':'sovereign-rage');
  u.flash=.2;return true;
 }
 private confine(u:CrucibleUnit){u.x=Math.max(95,Math.min(CRUCIBLE.width-95,u.x));u.y=Math.max(95,Math.min(CRUCIBLE.height-95,u.y));}
 private move(u:CrucibleUnit,dx:number,dy:number,dt:number){const d=Math.hypot(dx,dy);if(d<2){u.moving=false;return;}const speed=u.speed*(u.slow>0?.65:1)*(u.buff>0&&this.teams[u.team].monster==='lycanthrope'?1.15:1);u.x+=dx/d*speed*dt;u.y+=dy/d*speed*dt;u.facing=dx<0?-1:dx>0?1:u.facing;u.moving=true;
  this.near(u.x,u.y,55,v=>{if(v===u||v.kind==='crystal')return;const vx=u.x-v.x,vy=u.y-v.y,dist=Math.hypot(vx,vy)||1,min=(u.radius+v.radius)*.85;if(dist<min){const push=Math.min(7,(min-dist)*dt*6);u.x+=vx/dist*push;u.y+=vy/dist*push;}});this.confine(u);if((u.kind==='infantry'||u.kind==='ranged')&&Math.hypot(u.x-CRUCIBLE.cx,u.y-CRUCIBLE.cy)>CRUCIBLE.arenaRadius&&!this.teams.some((_,i)=>this.inBase(i,u))){const {nodes,edges}=this.laneSegments();let distance=Infinity,closest={x:u.x,y:u.y};for(const [a,b] of edges){const p=this.project(u.x,u.y,nodes[a],nodes[b]),d=Math.hypot(u.x-p.x,u.y-p.y);if(d<distance){distance=d;closest=p;}}const width=CRUCIBLE.laneWidth/2-u.radius;if(distance>width){u.x=closest.x+(u.x-closest.x)/distance*width;u.y=closest.y+(u.y-closest.y)/distance*width;}}
 }
 step(dt:number){if(this.winner>=0)return;dt=Math.min(.05,Math.max(0,dt));this.time+=dt;this.rebuild();
  for(const [team,t] of this.teams.entries()){if(t.eliminated)continue;const u=t.champion;if(!u.active&&t.crystal.active&&this.time>=t.respawnAt){Object.assign(u,{active:true,hp:u.maxHp,x:t.crystal.x,y:t.crystal.y,invuln:3,poison:0,target:0,think:0});t.respawnAt=0;this.event(MONSTERS[t.monster].archetype+' returns from their ritual crystal.');this.effect(u.x,u.y,140,'arcane-dissolve',team,.7);}t.wave-=dt;if(t.wave<=0){t.wave=3.5;for(let i=0;i<6;i++)this.spawn(team);}t.plan-=dt;if(t.plan<=0){t.plan=5+this.random()*4;const enemies=this.teams.map((v,i)=>({v,i,score:Math.hypot(v.crystal.x-u.x,v.crystal.y-u.y)*(1+this.random()*.5)+v.crystal.hp*.08})).filter(v=>v.i!==team&&!v.v.eliminated);enemies.sort((a,b)=>a.score-b.score);t.goal=this.armyObjective(team)?.team??enemies[0]?.i??team;}
   const traps=this.trapPoints(team);if(t.crystal.active)for(let i=0;i<3;i++){t.trapReady[i]=Math.max(0,t.trapReady[i]-dt);if(t.trapReady[i]>0)continue;let trigger=false;this.near(traps[i].x,traps[i].y,40,v=>{if(v.team!==team)trigger=true;});if(trigger){t.trapReady[i]=18;this.blast(team,traps[i].x,traps[i].y,95,160,'hag-mine',false,50,false);}}
   if(u.active&&Math.hypot(u.x-t.crystal.x,u.y-t.crystal.y)<135&&t.crystal.active)u.hp=Math.min(u.maxHp,u.hp+u.maxHp*.018*dt);
  }
  for(const u of this.units){if(!u.active)continue;u.flash=Math.max(0,u.flash-dt);u.invuln=Math.max(0,u.invuln-dt);u.slow=Math.max(0,u.slow-dt);u.attack-=dt;u.power-=dt;u.ultimate-=dt;u.buff=Math.max(0,u.buff-dt);u.poisonTick-=dt;if(u.poison>0){u.poison-=dt;if(u.poisonTick<=0){u.poisonTick=.5;this.damage(u,16,u.poisonTeam,false,false,this.teams[u.poisonTeam].champion);if(!u.active)continue;}}
   const troop=u.kind==='infantry'||u.kind==='ranged';
   if(troop){
    // Cross a shared rally on the home side of the circle, then leave together toward the siege target.
    const rally=this.rally(u.team);if(!u.marched&&Math.hypot(u.x-rally.x,u.y-rally.y)<75)u.marched=true;
    u.recover=Math.max(0,u.recover-dt);
    const previous=this.byId.get(u.target);
    if(previous&&previous.kind!=='captain'&&previous.kind!=='crystal'){
     const d=Math.hypot(previous.x-u.x,previous.y-u.y);
     if(d>u.range+previous.radius)u.chase+=dt;else u.chase=0;
     if(!this.adjacent(u,previous)){u.avoid=previous.id;u.target=0;u.think=0;u.recover=2;u.chase=0;u.chaseX=u.x;u.chaseY=u.y;}
    }
   }
   u.think-=dt;let target=this.byId.get(u.target);if(!target?.active||target.team===u.team||u.think<=0||((u.kind==='captain'||u.kind==='crystal')&&!this.defenseCanTarget(u,target))){u.think=u.kind==='champion'?.25:.4;target=this.target(u);}const distance=target?Math.hypot(target.x-u.x,target.y-u.y):Infinity,champ=u.kind==='champion',t=this.teams[u.team];
   if(champ&&this.controlled!==u.team&&target&&distance<440){if(u.ultimate<=0&&this.time>12)this.power(u.team,true);else if(u.power<=0)this.power(u.team);}
   if(target&&distance<u.range+target.radius&&u.attack<=0){if(champ)u.invuln=0;u.attack=u.interval*(u.buff>0?.65:1);u.facing=target.x<u.x?-1:1;const ranged=u.kind==='ranged'||(u.kind==='captain'||u.kind==='crystal')||champ&&MONSTERS[t.monster].basic.ranged;if(ranged)this.fire(u,target);else if(champ)this.blast(u.team,target.x,target.y,60,u.damage,t.monster==='titan'?'titan-cleave':t.monster==='reaper'?'reaper-sweep':'devourer-claw',t.monster==='hag');else this.damage(target,u.damage,u.team,false,u.kind==='captain',u);}
   if(champ&&u.buff>0&&(t.monster==='devourer'||t.monster==='reaper')){u.pulse-=dt;if(u.pulse<=0){u.pulse=.65;this.blast(u.team,u.x,u.y,170,110,t.monster==='devourer'?'devourer-claw-wave':'reaper-sweep');}}
   if(champ&&this.controlled!==u.team){if(u.hp<u.maxHp*.25)u.retreat=true;if(u.hp>u.maxHp*.75||!t.crystal.active)u.retreat=false;}
   if(champ&&this.controlled===u.team){this.move(u,this.input.x*100,this.input.y*100,dt);continue;}
   let goal:{x:number;y:number};if(troop){const mobile=target&&target.kind!=='captain'&&target.kind!=='crystal';if(mobile)goal=u;else{const route=this.route(u);goal=target&&!mobile&&distance<=u.range*.8?u:route;}}else if(u.kind==='crystal')goal=u;else if(u.kind==='captain')goal=target&&distance<=u.range?u:{x:u.hx,y:u.hy};else if(champ&&u.retreat&&t.crystal.active)goal=t.crystal;else if(champ&&target?.kind==='crystal'&&!this.guards(target.team)&&!this.inBase(target.team,u))goal=target;else if(champ&&this.baseAlive(t.goal)&&this.guards(t.goal)>0&&this.siegeSupport(u.team,t.goal)<3)goal=this.escort(u.team,t.goal);else if(champ&&this.time>=24&&target&&['infantry','ranged'].includes(target.kind)&&distance<=u.range&&u.hp>u.maxHp*.4)goal=this.teams[t.goal].crystal;else if(target&&distance<=(champ?480:240)){goal=distance>u.range*.8?target:u;}else if(this.time<24)goal={...this.rally(u.team)};else{const enemy=this.teams[t.goal];goal=enemy.champion.active&&!enemy.crystal.active?enemy.champion:enemy.crystal;}
   this.move(u,goal.x-u.x,goal.y-u.y,dt);
  }
  for(let i=this.shots.length-1;i>=0;i--){const s=this.shots[i],target=this.byId.get(s.target);s.life-=dt;if(!target?.active||(s.defense&&(!this.byId.get(s.source)?.active||!this.defenseCanTarget(this.byId.get(s.source)!,target)))){this.shots.splice(i,1);continue;}const dx=target.x-s.x,dy=target.y-s.y,d=Math.hypot(dx,dy),step=700*dt;if(d<=step+12){this.damage(target,s.damage,s.team,this.teams[s.team].monster==='hag'&&s.art==='hag-bolt',s.defense,this.byId.get(s.source));this.shots.splice(i,1);}else if(s.life<=0)this.shots.splice(i,1);else{s.x+=dx/d*step;s.y+=dy/d*step;}}
  for(let i=this.effects.length-1;i>=0;i--){const e=this.effects[i];e.life-=dt;if(e.life<=0){this.effects.splice(i,1);if(e.warning&&e.damage)this.blast(e.team,e.x,e.y,e.radius,e.damage,e.art==='calamity'?'calamity':'calamity-starfall-preview');}}
  const remaining=this.teams.map((t,i)=>t.eliminated?-1:i).filter(i=>i>=0);if(remaining.length===1){this.winner=remaining[0];this.event(MONSTERS[this.teams[this.winner].monster].archetype+' commands the horde.');}
 }
}
