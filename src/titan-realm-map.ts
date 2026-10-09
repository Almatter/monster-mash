export type RealmPoint={x:number;y:number};
export const REALM_CHUNKS={size:512,cols:10,rows:10,left:-2560,top:-2560,cacheLimit:32};
export const REALM_RING=410;
export const REALM_START={x:0,y:1030};
export const REALM_GROTTOS=[{id:0,x:0,y:-1536,name:'Hollow'},{id:1,x:1536,y:-1536,name:'Veil'},{id:2,x:1536,y:0,name:'Root'},{id:3,x:1536,y:1536,name:'Cleft'},{id:4,x:-1536,y:1536,name:'Deep'},{id:5,x:-1536,y:0,name:'Spire'},{id:6,x:-1536,y:-1536,name:'Silence'}];
// Each generated sector shares this authored floor footprint. All visible bridge
// entrances are usable; chasms and ruin walls lie outside these connected floors.
export const REALM_LANES:{a:RealmPoint;b:RealmPoint;radius:number;yScale?:number}[]=[
 ...[-1536,0,1536].flatMap(y=>[-1536,0,1536].map(x=>({a:{x,y:y-38},b:{x,y:y-38},radius:460,yScale:.89}))),
 ...[-1536,0,1536].flatMap(v=>[{a:{x:-2200,y:v},b:{x:2200,y:v},radius:62},{a:{x:v,y:-2200},b:{x:v,y:2200},radius:62}])
];
const closest=(p:RealmPoint,a:RealmPoint,b:RealmPoint)=>{const dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1)));return {x:a.x+dx*t,y:a.y+dy*t};};
const buckets=new Map<string,typeof REALM_LANES>();
for(const lane of REALM_LANES)for(let x=Math.floor((Math.min(lane.a.x,lane.b.x)-lane.radius)/400);x<=Math.floor((Math.max(lane.a.x,lane.b.x)+lane.radius)/400);x++)for(let y=Math.floor((Math.min(lane.a.y,lane.b.y)-lane.radius)/400);y<=Math.floor((Math.max(lane.a.y,lane.b.y)+lane.radius)/400);y++){const key=x+':'+y;if(!buckets.has(key))buckets.set(key,[]);buckets.get(key)!.push(lane);}
export function insideRealm(x:number,y:number,radius=0){for(const lane of buckets.get(Math.floor(x/400)+':'+Math.floor(y/400))||[]){const p=closest({x,y},lane.a,lane.b);if(Math.hypot(x-p.x,(y-p.y)/(lane.yScale||1))<=lane.radius-radius+.001)return true;}return false;}
export function slideRealm(body:RealmPoint,radius:number){if(insideRealm(body.x,body.y,radius))return;let cost=Infinity,chosen={x:REALM_START.x,y:REALM_START.y};for(const l of REALM_LANES){const p=closest(body,l.a,l.b),dx=body.x-p.x,dy=(body.y-p.y)/(l.yScale||1),d=Math.hypot(dx,dy),r=Math.max(0,l.radius-radius-.1),scale=Math.min(1,r/(d||1)),q={x:p.x+dx*scale,y:p.y+dy*scale*(l.yScale||1)},c=(q.x-body.x)**2+(q.y-body.y)**2;if(c<cost){cost=c;chosen=q;}}body.x=chosen.x;body.y=chosen.y;}
function clear(a:RealmPoint,b:RealmPoint){const steps=Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)/6);for(let i=0;i<=steps;i++){const t=i/(steps||1);if(!insideRealm(a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t,27))return false;}return true;}
const GRID=60,COLS=86,walkable=new Uint8Array(COLS*COLS),flows=new Map<string,Int16Array>();
const center=(id:number)=>({x:-2560+(id%COLS)*GRID,y:-2560+Math.floor(id/COLS)*GRID});
const neighbors:number[][]=Array.from({length:walkable.length},()=>[]);let navigationReady=false;
export function prepareRealmNavigation(){if(navigationReady)return;navigationReady=true;for(let id=0;id<walkable.length;id++){const p=center(id);walkable[id]=insideRealm(p.x,p.y,27)?1:0;}for(let id=0;id<walkable.length;id++)if(walkable[id]){const x=id%COLS;for(const next of [x>0?id-1:-1,x<COLS-1?id+1:-1,id-COLS,id+COLS])if(next>=0&&next<walkable.length&&walkable[next]&&clear(center(id),center(next)))neighbors[id].push(next);}}
function nearbyNodes(p:RealmPoint){const x=Math.round((p.x+2560)/GRID),y=Math.round((p.y+2560)/GRID),out:number[]=[];for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){const xx=x+dx,yy=y+dy,id=yy*COLS+xx;if(xx>=0&&xx<COLS&&yy>=0&&yy<COLS&&walkable[id])out.push(id);}return out;}
export function realmWaypoint(x:number,y:number,tx:number,ty:number,avoidArena=false){prepareRealmNavigation();const from={x,y},goal={x:tx,y:ty};if(!insideRealm(x,y,27)){slideRealm(from,29);return from;}slideRealm(goal,30);if(clear(from,goal)&&(!avoidArena||!crossesArena(from,goal)))return goal;const goals=nearbyNodes(goal).filter(id=>clear(goal,center(id))).sort((a,b)=>Math.hypot(center(a).x-goal.x,center(a).y-goal.y)-Math.hypot(center(b).x-goal.x,center(b).y-goal.y)),end=goals[0];if(end===undefined)return from;const flowKey=end+':'+avoidArena;let flow=flows.get(flowKey);if(!flow){flow=new Int16Array(walkable.length).fill(-1);flow[end]=0;const queue=[end];for(let i=0;i<queue.length;i++){const id=queue[i];for(const next of neighbors[id])if(flow[next]<0&&(!avoidArena||!inTitanArena(center(next).x,center(next).y))){flow[next]=flow[id]+1;queue.push(next);}}if(flows.size>=12)flows.delete(flows.keys().next().value!);flows.set(flowKey,flow);}let chosen=-1,best=Infinity;for(const id of nearbyNodes(from)){if(flow[id]<0)continue;const p=center(id),d=Math.hypot(p.x-x,p.y-y),cost=flow[id]*GRID+d;if((cost<best-.1||Math.abs(cost-best)<.1&&chosen>=0&&flow[id]<flow[chosen])&&clear(from,p)&&(!avoidArena||!crossesArena(from,p))){chosen=id;best=cost;}}return chosen<0?from:center(chosen);}
export function realmSteer(x:number,y:number,tx:number,ty:number){const p=realmWaypoint(x,y,tx,ty),dx=p.x-x,dy=p.y-y,d=Math.hypot(dx,dy)||1;return {x:dx/d,y:dy/d};}
export const inTitanArena=(x:number,y:number)=>Math.hypot(x,y+38)<REALM_RING-14;

// Swept movement prevents knockback and dashes from snapping onto a different floor.
// Vault deliberately bypasses this sweep and validates only its landing.
export function moveRealm(body:RealmPoint,from:RealmPoint,radius:number){
 if(!insideRealm(from.x,from.y,radius)){slideRealm(body,radius);return;}
 const dx=body.x-from.x,dy=body.y-from.y,steps=Math.max(1,Math.ceil(Math.hypot(dx,dy)/8));let x=from.x,y=from.y;
 for(let i=1;i<=steps;i++){const nx=from.x+dx*i/steps,ny=from.y+dy*i/steps;if(insideRealm(nx,ny,radius)){x=nx;y=ny;continue;}if(insideRealm(nx,y,radius))x=nx;if(insideRealm(x,ny,radius))y=ny;break;}body.x=x;body.y=y;
}
export const REALM_CLUES=[{x:0,y:1030},{x:1030,y:0},{x:0,y:-1030},{x:-1030,y:0}];

function crossesArena(a:RealmPoint,b:RealmPoint){const dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,(-a.x*dx+(-38-a.y)*dy)/(dx*dx+dy*dy||1)));return inTitanArena(a.x+dx*t,a.y+dy*t);}

const steeringCache=new WeakMap<RealmPoint,{x:number;y:number;until:number;tx:number;ty:number;fromX:number;fromY:number}>();
// Replan foot soldiers at 8 Hz; movement and swept collision still run every step.
export function realmCachedSteer(body:RealmPoint,tx:number,ty:number,time:number){let route=steeringCache.get(body);if(!route||Math.hypot(body.x-route.fromX,body.y-route.fromY)>180||time>=route.until||Math.hypot(route.tx-tx,route.ty-ty)>120||Math.hypot(route.x-body.x,route.y-body.y)<8){const q=realmWaypoint(body.x,body.y,tx,ty);route={...q,until:time+.125,tx,ty,fromX:body.x,fromY:body.y};steeringCache.set(body,route);}const dx=route.x-body.x,dy=route.y-body.y,d=Math.hypot(dx,dy)||1;return {x:dx/d,y:dy/d};}
