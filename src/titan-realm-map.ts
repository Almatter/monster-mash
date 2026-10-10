import {REALM_GROTTOS,REALM_PATHS,REALM_LOCAL_PATHS,REALM_START} from './realm-layout.ts';
export {REALM_GROTTOS,REALM_PATHS,REALM_START,REALM_CLUES,realmAltar,realmPortal} from './realm-layout.ts';
export type {RealmPoint} from './realm-layout.ts';
import type {RealmPoint} from './realm-layout.ts';
export const REALM_CHUNKS={size:512,cols:10,rows:10,left:-2560,top:-2560,cacheLimit:24};
export const REALM_RING=410,REALM_EDGE=2160,REALM_BRIDGE_RADIUS=76;
type Lane={a:RealmPoint;b:RealmPoint;radius:number;yScale?:number};
export const REALM_LANES:Lane[]=[{a:{x:0,y:-38},b:{x:0,y:-38},radius:460,yScale:.89},...[...REALM_PATHS,...REALM_LOCAL_PATHS].flatMap(p=>p.curve.slice(1).map((b,i)=>({a:p.curve[i],b,radius:p.radius})))];
const roomFloors=REALM_GROTTOS.map(s=>({...s,points:s.floor.map(([x,y])=>({x:x+s.x,y:y+s.y})),block:{x:s.x+s.altar.x,y:s.y+s.altar.y,rx:80,ry:50}}));
const CELL=200,lanes=new Map<string,Lane[]>(),rooms=new Map<string,typeof roomFloors>();
const key=(x:number,y:number)=>Math.floor(x/CELL)+':'+Math.floor(y/CELL);
function register<T>(map:Map<string,T[]>,item:T,x0:number,y0:number,x1:number,y1:number){for(let x=Math.floor(x0/CELL);x<=Math.floor(x1/CELL);x++)for(let y=Math.floor(y0/CELL);y<=Math.floor(y1/CELL);y++){const k=x+':'+y;if(!map.has(k))map.set(k,[]);map.get(k)!.push(item);}}
for(const l of REALM_LANES)register(lanes,l,Math.min(l.a.x,l.b.x)-l.radius,Math.min(l.a.y,l.b.y)-l.radius,Math.max(l.a.x,l.b.x)+l.radius,Math.max(l.a.y,l.b.y)+l.radius);
for(const r of roomFloors)register(rooms,r,Math.min(...r.points.map(p=>p.x)),Math.min(...r.points.map(p=>p.y)),Math.max(...r.points.map(p=>p.x)),Math.max(...r.points.map(p=>p.y)));
function segmentDistance(x:number,y:number,a:RealmPoint,b:RealmPoint){const dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((x-a.x)*dx+(y-a.y)*dy)/(dx*dx+dy*dy||1))),qx=x-a.x-dx*t,qy=y-a.y-dy*t;return qx*qx+qy*qy;}
function insideRoom(x:number,y:number,r:typeof roomFloors[number],radius:number){let inside=false;for(let i=0,j=r.points.length-1;i<r.points.length;j=i++){const a=r.points[i],b=r.points[j];if((a.y>y)!==(b.y>y)&&x<(b.x-a.x)*(y-a.y)/(b.y-a.y)+a.x)inside=!inside;if(radius>0&&segmentDistance(x,y,a,b)<radius*radius-.001)return false;}return inside;}
export function insideRealm(x:number,y:number,radius=0){if(!Number.isFinite(x)||!Number.isFinite(y)||Math.abs(x)>REALM_EDGE-radius||Math.abs(y)>REALM_EDGE-radius)return false;const k=key(x,y),local=rooms.get(k)||[];for(const r of local)if(((x-r.block.x)/(r.block.rx+radius))**2+((y-r.block.y)/(r.block.ry+radius))**2<1)return false;for(const r of local)if(insideRoom(x,y,r,radius))return true;for(const l of lanes.get(k)||[]){if(l.radius<radius)continue;if(l.yScale){if(((x-l.a.x)**2+((y-l.a.y)/l.yScale)**2)<=(l.radius-radius)**2+.001)return true;}else if(segmentDistance(x,y,l.a,l.b)<=(l.radius-radius)**2+.001)return true;}return false;}
export function slideRealm(body:RealmPoint,radius:number){if(insideRealm(body.x,body.y,radius))return;let cost=Infinity,chosen={...REALM_START};const consider=(q:RealmPoint)=>{const c=(q.x-body.x)**2+(q.y-body.y)**2;if(c<cost&&insideRealm(q.x,q.y,radius)){cost=c;chosen=q;}};
 for(const l of REALM_LANES){const ys=l.yScale||1,dx=l.b.x-l.a.x,dy=l.b.y-l.a.y,t=Math.max(0,Math.min(1,((body.x-l.a.x)*dx+(body.y-l.a.y)*dy)/(dx*dx+dy*dy||1))),px=l.a.x+dx*t,py=l.a.y+dy*t,x=body.x-px,y=(body.y-py)/ys,d=Math.sqrt(x*x+y*y)||1,k=Math.min(1,(l.radius-radius-.1)/d);consider({x:px+x*k,y:py+y*k*ys});}
 for(const r of roomFloors){consider({x:r.x,y:r.y});const dx=body.x-r.block.x,dy=body.y-r.block.y,d=Math.hypot(dx/(r.block.rx+radius+.2),dy/(r.block.ry+radius+.2));consider(d?{x:r.block.x+dx/d,y:r.block.y+dy/d}:{x:r.block.x,y:r.block.y+r.block.ry+radius+.2});for(let i=0;i<r.points.length;i++){const a=r.points[i],b=r.points[(i+1)%r.points.length],vx=b.x-a.x,vy=b.y-a.y,len=Math.hypot(vx,vy)||1,t=Math.max(0,Math.min(1,((body.x-a.x)*vx+(body.y-a.y)*vy)/(len*len)));consider({x:a.x+vx*t-vy/len*(radius+.2),y:a.y+vy*t+vx/len*(radius+.2)});}}
 body.x=chosen.x;body.y=chosen.y;
}
function clear(a:RealmPoint,b:RealmPoint){const steps=Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)/20);for(let i=0;i<=steps;i++){const t=i/(steps||1);if(!insideRealm(a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t,27))return false;}return true;}
const GRID=24,COLS=215,walkable=new Uint8Array(COLS*COLS),flows=new Map<string,Int16Array>();
const center=(id:number)=>({x:-2560+(id%COLS)*GRID,y:-2560+Math.floor(id/COLS)*GRID});
const neighbors:number[][]=Array.from({length:walkable.length},()=>[]);let navigationReady=false;
export function prepareRealmNavigation(){if(navigationReady)return;navigationReady=true;for(let id=0;id<walkable.length;id++){const p=center(id);walkable[id]=insideRealm(p.x,p.y,27)?1:0;}for(let id=0;id<walkable.length;id++)if(walkable[id]){const x=id%COLS;for(const next of [x>0?id-1:-1,x<COLS-1?id+1:-1,id-COLS,id+COLS])if(next>=0&&next<walkable.length&&walkable[next]&&clear(center(id),center(next)))neighbors[id].push(next);}}
function nearbyNodes(p:RealmPoint){const x=Math.round((p.x+2560)/GRID),y=Math.round((p.y+2560)/GRID),out:number[]=[];for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){const xx=x+dx,yy=y+dy,id=yy*COLS+xx;if(xx>=0&&xx<COLS&&yy>=0&&yy<COLS&&walkable[id])out.push(id);}return out;}
export function realmWaypoint(x:number,y:number,tx:number,ty:number,avoidArena=false){prepareRealmNavigation();const from={x,y},goal={x:tx,y:ty};if(!insideRealm(x,y,27)){slideRealm(from,29);return from;}slideRealm(goal,30);if(clear(from,goal)&&(!avoidArena||!crossesArena(from,goal)))return goal;const goals=nearbyNodes(goal).filter(id=>clear(goal,center(id))).sort((a,b)=>Math.hypot(center(a).x-goal.x,center(a).y-goal.y)-Math.hypot(center(b).x-goal.x,center(b).y-goal.y)),end=goals[0];if(end===undefined)return from;const flowKey=end+':'+avoidArena;let flow=flows.get(flowKey);if(!flow){flow=new Int16Array(walkable.length).fill(-1);flow[end]=0;const queue=[end];for(let i=0;i<queue.length;i++){const id=queue[i];for(const next of neighbors[id])if(flow[next]<0&&(!avoidArena||!inTitanArena(center(next).x,center(next).y))){flow[next]=flow[id]+1;queue.push(next);}}if(flows.size>=48)flows.delete(flows.keys().next().value!);flows.set(flowKey,flow);}let chosen=-1,best=Infinity;for(const id of nearbyNodes(from)){if(flow[id]<0)continue;const p=center(id),d=Math.hypot(p.x-x,p.y-y),cost=flow[id]*GRID+d;if((cost<best-.1||Math.abs(cost-best)<.1&&chosen>=0&&flow[id]<flow[chosen])&&clear(from,p)&&(!avoidArena||!crossesArena(from,p))){chosen=id;best=cost;}}return chosen<0?from:center(chosen);}
export function realmSteer(x:number,y:number,tx:number,ty:number){const p=realmWaypoint(x,y,tx,ty),dx=p.x-x,dy=p.y-y,d=Math.hypot(dx,dy)||1;return {x:dx/d,y:dy/d};}
export const inTitanArena=(x:number,y:number)=>Math.hypot(x,y+38)<REALM_RING-14;

// Swept movement prevents knockback and dashes from snapping onto a different floor.
// Vault deliberately bypasses this sweep and validates only its landing.
export function moveRealm(body:RealmPoint,from:RealmPoint,radius:number){
 if(!insideRealm(from.x,from.y,radius)){slideRealm(body,radius);return;}
 const dx=body.x-from.x,dy=body.y-from.y,steps=Math.max(1,Math.ceil(Math.hypot(dx,dy)/8));let x=from.x,y=from.y;
 for(let i=1;i<=steps;i++){const nx=from.x+dx*i/steps,ny=from.y+dy*i/steps;if(insideRealm(nx,ny,radius)){x=nx;y=ny;continue;}if(insideRealm(nx,y,radius))x=nx;if(insideRealm(x,ny,radius))y=ny;break;}body.x=x;body.y=y;
}


function crossesArena(a:RealmPoint,b:RealmPoint){const dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,(-a.x*dx+(-38-a.y)*dy)/(dx*dx+dy*dy||1)));return inTitanArena(a.x+dx*t,a.y+dy*t);}

const steeringCache=new WeakMap<RealmPoint,{x:number;y:number;until:number;tx:number;ty:number;fromX:number;fromY:number}>();
// Replan distant foot soldiers at about 6 Hz; movement and swept collision still run every step.
export function realmCachedSteer(body:RealmPoint,tx:number,ty:number,time:number){let route=steeringCache.get(body);if(!route||Math.hypot(body.x-route.fromX,body.y-route.fromY)>180||time>=route.until||Math.hypot(route.tx-tx,route.ty-ty)>120||Math.hypot(route.x-body.x,route.y-body.y)<8){const q=realmWaypoint(body.x,body.y,tx,ty);route={...q,until:time+.18,tx,ty,fromX:body.x,fromY:body.y};steeringCache.set(body,route);}const dx=route.x-body.x,dy=route.y-body.y,d=Math.hypot(dx,dy)||1;return {x:dx/d,y:dy/d};}
