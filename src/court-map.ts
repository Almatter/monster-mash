import {COURT_LANES,COURT_BOUNDS,COURT_RADIUS,MAP_CHUNKS,type Point} from './court-layout.ts';
import {COURT_STRUCTURES,type Structure} from './court-structures.ts';
export {COURT_STRUCTURES} from './court-structures.ts';
export {COURT_BOUNDS,COURT_RADIUS,COURT_REGIONS,COURT_SITE_GROUPS,COURT_SITES,COURT_SHRINES,COURT_SEARCH_ROUTE,COURT_LANES,MAP_CHUNKS,courtRegionAt} from './court-layout.ts';
// Walkable capsules define connected ground, not the bounds of the painted image.
const size=400,key=(x:number,y:number)=>x*65536+y,buckets=new Map<number,number[]>();
COURT_LANES.forEach((l,i)=>{for(let x=Math.floor((Math.min(l.a.x,l.b.x)-l.radius)/size);x<=Math.floor((Math.max(l.a.x,l.b.x)+l.radius)/size);x++)for(let y=Math.floor((Math.min(l.a.y,l.b.y)-l.radius)/size);y<=Math.floor((Math.max(l.a.y,l.b.y)+l.radius)/size);y++){const k=key(x,y),items=buckets.get(k);if(items)items.push(i);else buckets.set(k,[i]);}});
function closest(p:Point,a:Point,b:Point){const x=b.x-a.x,y=b.y-a.y,t=Math.max(0,Math.min(1,((p.x-a.x)*x+(p.y-a.y)*y)/(x*x+y*y||1)));return {x:a.x+x*t,y:a.y+y*t};}
const structureBuckets=new Map<number,Structure[]>();
for(const s of COURT_STRUCTURES)for(let x=Math.floor((s.left-80)/size);x<=Math.floor((s.right+80)/size);x++)for(let y=Math.floor((s.top-80)/size);y<=Math.floor((s.bottom+80)/size);y++){const k=key(x,y),items=structureBuckets.get(k);if(items)items.push(s);else structureBuckets.set(k,[s]);}
function structures(x:number,y:number){return structureBuckets.get(key(Math.floor(x/size),Math.floor(y/size)))??[];}
function distanceToStructure(x:number,y:number,s:Structure){let inside=false,d=Infinity;const p={x,y};for(let i=0,j=s.points.length-1;i<s.points.length;j=i++){const a=s.points[j],b=s.points[i],q=closest(p,a,b);d=Math.min(d,Math.hypot(x-q.x,y-q.y));if((a.y>y)!==(b.y>y)&&x<(b.x-a.x)*(y-a.y)/(b.y-a.y)+a.x)inside=!inside;}return inside?-d:d;}
function roadClearance(x:number,y:number){let best=-Infinity;for(const i of buckets.get(key(Math.floor(x/size),Math.floor(y/size)))??[]){const l=COURT_LANES[i],p=closest({x,y},l.a,l.b),d=l.radius-Math.hypot(x-p.x,y-p.y);if(d>best)best=d;}return best;}
export function courtClearance(x:number,y:number){let best=roadClearance(x,y);if(best<=0)return best;for(const s of structures(x,y))best=Math.min(best,distanceToStructure(x,y,s));return best;}
export function insideCourt(x:number,y:number,radius=0){if(x<COURT_BOUNDS.left+radius||x>COURT_BOUNDS.right-radius||y<COURT_BOUNDS.top+radius||y>COURT_BOUNDS.bottom-radius||roadClearance(x,y)<radius-.00001)return false;for(const s of structures(x,y)){if(x<s.left-radius||x>s.right+radius||y<s.top-radius||y>s.bottom+radius)continue;if(distanceToStructure(x,y,s)<radius-.00001)return false;}return true;}
export function slideCourt(body:Point,radius:number){
 if(insideCourt(body.x,body.y,radius))return;const nearby=new Set<number>();for(let x=-1;x<=1;x++)for(let y=-1;y<=1;y++)for(const i of buckets.get(key(Math.floor(body.x/size)+x,Math.floor(body.y/size)+y))??[])nearby.add(i);const candidates=nearby.size?[...nearby]:COURT_LANES.map((_,i)=>i);let best=Infinity,chosen:Point|null=null;
 const consider=(q:Point)=>{const cost=(q.x-body.x)**2+(q.y-body.y)**2;if(cost<best&&insideCourt(q.x,q.y,radius)){best=cost;chosen=q;}};
 for(const i of candidates){const l=COURT_LANES[i],p=closest(body,l.a,l.b),dx=body.x-p.x,dy=body.y-p.y,d=Math.hypot(dx,dy),allowed=l.radius-radius-.1;if(allowed<=0)continue;const scale=d>allowed?allowed/(d||1):1;consider({x:p.x+dx*scale,y:p.y+dy*scale});}
 for(const s of structures(body.x,body.y))for(let i=0;i<s.points.length;i++){const a=s.points[i],b=s.points[(i+1)%s.points.length],p=closest(body,a,b),n=Math.hypot(b.x-a.x,b.y-a.y)||1,dx=-(b.y-a.y)/n*(radius+.2),dy=(b.x-a.x)/n*(radius+.2);consider({x:p.x+dx,y:p.y+dy});consider({x:p.x-dx,y:p.y-dy});const angle=Math.atan2(body.y-a.y,body.x-a.x);for(const delta of [0,-Math.PI/4,Math.PI/4])consider({x:a.x+Math.cos(angle+delta)*(radius+.3),y:a.y+Math.sin(angle+delta)*(radius+.3)});}
 if(!chosen)for(const i of candidates){const l=COURT_LANES[i];for(const p of [l.a,l.b])for(const angle of [0,Math.PI/2,Math.PI,Math.PI*1.5])consider({x:p.x+Math.cos(angle)*(l.radius-radius-1),y:p.y+Math.sin(angle)*(l.radius-radius-1)});}
 if(chosen){body.x=chosen.x;body.y=chosen.y;}
}
// The painting is already behind actors. Excluding its raised pixels from an actor draw
// reveals that original foreground, without a second texture or per-frame pixel work.
const fronts=COURT_STRUCTURES.map(s=>({...s,fl:Math.min(...s.foreground.map(p=>p.x)),fr:Math.max(...s.foreground.map(p=>p.x)),ft:Math.min(...s.foreground.map(p=>p.y)),fb:Math.max(...s.foreground.map(p=>p.y)),path:null as Path2D|null}));
const frontBuckets=new Map<number,typeof fronts>();
for(const s of fronts){if(typeof Path2D!=='undefined'){const path=new Path2D();path.rect(s.fl-10000,s.ft-10000,20000+s.fr-s.fl,20000+s.fb-s.ft);for(const outline of [s.foreground,...s.holes]){outline.forEach((p,i)=>i?path.lineTo(p.x,p.y):path.moveTo(p.x,p.y));path.closePath();}s.path=path;}for(let x=Math.floor((s.fl-260)/size);x<=Math.floor((s.fr+260)/size);x++)for(let y=Math.floor((s.ft-100)/size);y<=Math.floor((s.fb+360)/size);y++){const k=key(x,y),items=frontBuckets.get(k);if(items)items.push(s);else frontBuckets.set(k,[s]);}}
export function clipCourtActor(c:CanvasRenderingContext2D,x:number,y:number,halfWidth=70,height=150){
 for(const s of frontBuckets.get(key(Math.floor(x/size),Math.floor(y/size)))??[]){if(y+20>=s.depthY||s.fr<x-halfWidth||s.fl>x+halfWidth||s.fb<y-height||s.ft>y+70)continue;if(s.path){c.clip(s.path,'evenodd');continue;}c.beginPath();c.rect(x-halfWidth-500,y-height-500,halfWidth*2+1000,height+1100);for(const outline of [s.foreground,...s.holes]){outline.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.closePath();}c.clip('evenodd');}
}

export function courtArtVisible(x:number,y:number,width:number,height:number,angle:number,cx:number,cy:number,halfW:number,halfH:number){const co=Math.abs(Math.cos(angle)),si=Math.abs(Math.sin(angle));return Math.abs(x-cx)<=halfW+(co*width+si*height)/2+32&&Math.abs(y-cy)<=halfH+(si*width+co*height)/2+32;}
function clearStructures(a:Point,b:Point){const dx=b.x-a.x,dy=b.y-a.y;
 const obstacles=new Set<Structure>();for(let x=Math.floor((Math.min(a.x,b.x)-40)/size);x<=Math.floor((Math.max(a.x,b.x)+40)/size);x++)for(let y=Math.floor((Math.min(a.y,b.y)-40)/size);y<=Math.floor((Math.max(a.y,b.y)+40)/size);y++)for(const s of structureBuckets.get(key(x,y))??[])obstacles.add(s);
 for(const s of obstacles){if(Math.max(a.x,b.x)<s.left-40||Math.min(a.x,b.x)>s.right+40||Math.max(a.y,b.y)<s.top-40||Math.min(a.y,b.y)>s.bottom+40)continue;for(let i=0;i<s.points.length;i++){const p=s.points[i],q=s.points[(i+1)%s.points.length],ex=q.x-p.x,ey=q.y-p.y,den=dx*ey-dy*ex;if(Math.abs(den)>1e-9){const t=((p.x-a.x)*ey-(p.y-a.y)*ex)/den,u=((p.x-a.x)*dy-(p.y-a.y)*dx)/den;if(t>=0&&t<=1&&u>=0&&u<=1)return false;}for(const [v,aa,bb] of [[a,p,q],[b,p,q],[p,a,b],[q,a,b]]){const near=closest(v,aa,bb);if(Math.hypot(v.x-near.x,v.y-near.y)<40)return false;}}}
 return true;
}
// Cover the full segment with exact capsule intervals. Sparse samples can miss a narrow corner.
function clear(a:Point,b:Point,checked=false){
 const dx=b.x-a.x,dy=b.y-a.y,length2=dx*dx+dy*dy;
 if(length2<.000001)return checked||insideCourt(a.x,a.y,40);
 if(!checked&&(!insideCourt(a.x,a.y,40)||!insideCourt(b.x,b.y,40)))return false;
 // Capsules are convex: two endpoints inside the same inset lane need no interval sweep.
 for(const i of buckets.get(key(Math.floor(a.x/size),Math.floor(a.y/size)))??[]){const l=COURT_LANES[i],r=l.radius-40;if(r<0)continue;const p=closest(a,l.a,l.b);if((a.x-p.x)**2+(a.y-p.y)**2>r*r)continue;const q=closest(b,l.a,l.b);if((b.x-q.x)**2+(b.y-q.y)**2<=r*r)return clearStructures(a,b);}
 const ids=new Set<number>(),intervals:number[][]=[];
 for(let x=Math.floor(Math.min(a.x,b.x)/size);x<=Math.floor(Math.max(a.x,b.x)/size);x++)for(let y=Math.floor(Math.min(a.y,b.y)/size);y<=Math.floor(Math.max(a.y,b.y)/size);y++)for(const i of buckets.get(key(x,y))??[])ids.add(i);
 const circle=(x:number,y:number,r:number)=>{const px=a.x-x,py=a.y-y,dot=px*dx+py*dy,disc=dot*dot-length2*(px*px+py*py-r*r);if(disc<0)return;const root=Math.sqrt(disc),lo=Math.max(0,(-dot-root)/length2),hi=Math.min(1,(-dot+root)/length2);if(lo<=hi)intervals.push([lo,hi]);};
 const range=(v:number,d:number,low:number,high:number)=>{if(Math.abs(d)<1e-10)return v>=low&&v<=high?[0,1]:null;const p=(low-v)/d,q=(high-v)/d;return [Math.max(0,Math.min(p,q)),Math.min(1,Math.max(p,q))];};
 for(const i of ids){const l=COURT_LANES[i],r=l.radius-40;if(r<=0)continue;circle(l.a.x,l.a.y,r);const ux=l.b.x-l.a.x,uy=l.b.y-l.a.y,n=Math.hypot(ux,uy);if(n<.01)continue;circle(l.b.x,l.b.y,r);const px=a.x-l.a.x,py=a.y-l.a.y,across=range((px*-uy+py*ux)/n,(dx*-uy+dy*ux)/n,-r,r),along=range((px*ux+py*uy)/n,(dx*ux+dy*uy)/n,0,n);if(across&&along){const lo=Math.max(across[0],along[0]),hi=Math.min(across[1],along[1]);if(lo<=hi)intervals.push([lo,hi]);}}
 intervals.sort((a,b)=>a[0]-b[0]);let covered=0;for(const [lo,hi] of intervals){if(lo>covered+1e-8)return false;covered=Math.max(covered,hi);}if(covered<1-1e-8)return false;
 return clearStructures(a,b);
}
const step=200,cols=Math.ceil((COURT_BOUNDS.right-COURT_BOUNDS.left)/step)+1,rows=Math.ceil((COURT_BOUNDS.bottom-COURT_BOUNDS.top)/step)+1;
const nodes:Point[]=[],indices=new Int16Array(cols*rows).fill(-1),nodeBuckets=new Map<number,number[]>();
for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){const p={x:COURT_BOUNDS.left+x*step,y:COURT_BOUNDS.top+y*step};if(!insideCourt(p.x,p.y,65))continue;indices[y*cols+x]=nodes.length;nodes.push(p);const k=key(x,y),items=nodeBuckets.get(k);if(items)items.push(nodes.length-1);else nodeBuckets.set(k,[nodes.length-1]);}
export const COURT_NAV_NODE_COUNT=nodes.length;
const links=nodes.map(p=>{const x=Math.round((p.x-COURT_BOUNDS.left)/step),y=Math.round((p.y-COURT_BOUNDS.top)/step),out:number[]=[];for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++){const xx=x+dx,yy=y+dy;if(!(dx||dy)||xx<0||yy<0||xx>=cols||yy>=rows)continue;const j=indices[yy*cols+xx];if(j>=0&&clear(p,nodes[j],true))out.push(j);}return out;});
function cell(p:Point){const x=Math.round((p.x-COURT_BOUNDS.left)/step),y=Math.round((p.y-COURT_BOUNDS.top)/step);for(const range of [1,3]){const candidates:{j:number;cost:number}[]=[];for(let dx=-range;dx<=range;dx++)for(let dy=-range;dy<=range;dy++){const xx=x+dx,yy=y+dy;if(xx<0||yy<0||xx>=cols||yy>=rows)continue;const j=indices[yy*cols+xx];if(j>=0)candidates.push({j,cost:(p.x-nodes[j].x)**2+(p.y-nodes[j].y)**2});}for(const {j} of candidates.sort((a,b)=>a.cost-b.cost))if(clear(p,nodes[j],true))return j;}return -1;}
const projectedGoals=new Map<string,Point>();
function projectedGoal(x:number,y:number){const k=x+':'+y,hit=projectedGoals.get(k);if(hit)return hit;const p={x,y};if(!insideCourt(x,y,42))slideCourt(p,42);if(projectedGoals.size>=32)projectedGoals.delete(projectedGoals.keys().next().value!);projectedGoals.set(k,p);return p;}

const flows=new Map<number,Int16Array>();let goalX=NaN,goalY=NaN,goalCell=-1;
function flow(goal:number){let f=flows.get(goal);if(f)return f;f=new Int16Array(nodes.length).fill(-1);f[goal]=goal;const queue=[goal];for(let n=0;n<queue.length;n++)for(const j of links[queue[n]])if(f[j]<0){f[j]=queue[n];queue.push(j);}if(flows.size>=12)flows.delete(flows.keys().next().value!);flows.set(goal,f);return f;}
export function courtWaypoint(x:number,y:number,tx:number,ty:number){const from={x,y},goal=projectedGoal(tx,ty);if(!insideCourt(x,y,42)){slideCourt(from,42);const d=Math.hypot(from.x-x,from.y-y);if(d>2)return from;}if(!clear(from,goal,true)){const i=cell(from);if(goal.x!==goalX||goal.y!==goalY){goalX=goal.x;goalY=goal.y;goalCell=cell(goal);}if(i>=0&&goalCell>=0){const k=flow(goalCell)[i];if(k>=0){const p=clear(from,nodes[k],true)?nodes[k]:nodes[i];tx=p.x;ty=p.y;}}}else{tx=goal.x;ty=goal.y;}return {x:tx,y:ty};}
export function courtSteer(x:number,y:number,tx:number,ty:number){const p=courtWaypoint(x,y,tx,ty),dx=p.x-x,dy=p.y-y,d=Math.hypot(dx,dy)||1;return {x:dx/d,y:dy/d};}
