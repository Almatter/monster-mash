// Stage 2 geography only; sprite size and solid footprints never scale with the map.
export const HUNT_MAP_SCALE=3;
export const COURT_BOUNDS={left:-9600,right:9600,top:-7200,bottom:7200};
export const COURT_RADIUS=12000;
export const COURT_RIDGE_ART={width:560,height:180};
type RockKind='ridge'|'crescent'|'fork';
type Rock={x:number;y:number;angle:number;radius:number;kind:RockKind;width:number;height:number};
export const COURT_ROCKS:Rock[]=[
 {x:-5300,y:-4300,angle:.35,radius:50,kind:'fork',width:880,height:820},
 {x:5300,y:-4300,angle:-.65,radius:50,kind:'fork',width:880,height:820},
 {x:-5300,y:4300,angle:2.2,radius:50,kind:'fork',width:880,height:820},
 {x:5300,y:4300,angle:-2.65,radius:50,kind:'fork',width:880,height:820},
 {x:-4000,y:-2700,angle:.55,radius:50,kind:'crescent',width:900,height:840},
 {x:4000,y:-2700,angle:-.85,radius:50,kind:'crescent',width:900,height:840},
 {x:-4000,y:2700,angle:2.5,radius:50,kind:'crescent',width:900,height:840},
 {x:4000,y:2700,angle:-2.25,radius:50,kind:'crescent',width:900,height:840},
 ...[
  {x:-4420,y:-3160,angle:-.7},{x:4500,y:-3080,angle:.3},
  {x:-4450,y:3220,angle:1.1},{x:4470,y:3140,angle:-.25},
  {x:-6100,y:-5000,angle:.9},{x:6100,y:5000,angle:-.9}
 ].map(p=>({...p,radius:36,kind:'ridge' as RockKind,width:340,height:110}))
];
export const COURT_LANDMARKS=[
 {id:'swordfall',name:'SWORDFALL',x:-6500,y:-3700,feet:[{x:0,y:0,radius:85}]},
 {id:'rib-gate',name:'RIB GATE',x:6500,y:-3700,feet:[{x:-115,y:15,radius:45},{x:115,y:15,radius:45}]},
 {id:'sun-spire',name:'SUN SPIRE',x:-6500,y:3700,feet:[{x:0,y:0,radius:70}]},
 {id:'broken-bell',name:'BROKEN BELL',x:6500,y:3700,feet:[{x:-105,y:15,radius:45},{x:105,y:15,radius:45}]}
];
// Four near-start camps cover all travel directions. Each outer region gets one
// captain at one of two sites: seeds cannot leave a whole region empty.
export const COURT_SITE_GROUPS=[
 ...[{x:-780,y:0},{x:780,y:0},{x:0,y:-780},{x:0,y:780}].map(p=>[{x:p.x-30,y:p.y-30},{x:p.x+30,y:p.y+30}]),
 ...[-1,1].flatMap(side=>[-1,1].map(end=>[{x:side*7650,y:end*2550},{x:side*7650,y:end*4950}])),
 ...[-1,1].map(end=>[{x:-1950,y:end*5850},{x:1950,y:end*5850}])
];
export const COURT_SITES=COURT_SITE_GROUPS.flat();
export const COURT_SHRINES=[{x:0,y:0},{x:-7800,y:0},{x:7800,y:0},{x:0,y:-6000},{x:0,y:6000}];
// Staggered formations interrupt long empty traverses; keep every possible camp and oasis clear.
const anchors=[...COURT_SITES,...COURT_SHRINES,...COURT_LANDMARKS];
for(let row=0;row<7;row++)for(let col=0;col<9;col++){
 const x=-8200+col*2050+(row%2?370:-370)+Math.sin(col*2.3+row*1.7)*100;
 const y=-5900+row*1950+(col%2?360:-360)+Math.cos(row*2.1-col*.8)*110;
 if(Math.hypot(x,y)<1650||anchors.some(p=>Math.hypot(x-p.x,y-p.y)<780)||COURT_ROCKS.some(p=>Math.hypot(x-p.x,y-p.y)<1100))continue;
 COURT_ROCKS.push({x,y,angle:row*1.17-col*.79,radius:50,kind:(row+col)%3?'fork':'crescent',width:(row+col)%3?880:900,height:(row+col)%3?820:840});
}

type Point={x:number;y:number};
// The ridge center wanders inward; its inner face supplies the actual movement boundary.
type BorderEdge={axis:'x'|'y';start:number;step:number;points:Point[]};
const borderRadius=70;
function makeEdge(axis:'x'|'y',start:number,end:number,base:number,sign:number,phase:number):BorderEdge{
 const count=Math.ceil((end-start)/480),step=(end-start)/count,points=Array.from({length:count+1},(_,i)=>{
  const at=start+i*step,inset=150+Math.sin(i*.83+phase)*65+Math.sin(i*1.91+phase*.7)*35,value=base+sign*inset;
  return axis==='x'?{x:at,y:value}:{x:value,y:at};
 });return {axis,start,step,points};
}
export const COURT_BORDER_EDGES=[
 makeEdge('x',COURT_BOUNDS.left,COURT_BOUNDS.right,COURT_BOUNDS.top,1,.3),
 makeEdge('x',COURT_BOUNDS.left,COURT_BOUNDS.right,COURT_BOUNDS.bottom,-1,2.1),
 makeEdge('y',COURT_BOUNDS.top,COURT_BOUNDS.bottom,COURT_BOUNDS.left,1,1.4),
 makeEdge('y',COURT_BOUNDS.top,COURT_BOUNDS.bottom,COURT_BOUNDS.right,-1,3.7)
];
function edgeAt(edge:BorderEdge,at:number){const i=Math.max(0,Math.min(edge.points.length-2,Math.floor((at-edge.start)/edge.step))),a=edge.points[i],b=edge.points[i+1],t=Math.max(0,Math.min(1,(at-a[edge.axis])/edge.step)),other=edge.axis==='x'?'y':'x',slope=(b[other]-a[other])/edge.step;return {value:a[other]+t*(b[other]-a[other]),normal:Math.sqrt(1+slope*slope)};}
export function courtBoundaryAt(x:number,y:number,radius=0){const [top,bottom,left,right]=COURT_BORDER_EDGES,t=edgeAt(top,x),b=edgeAt(bottom,x),l=edgeAt(left,y),r=edgeAt(right,y);return {top:t.value+(borderRadius+radius)*t.normal,bottom:b.value-(borderRadius+radius)*b.normal,left:l.value+(borderRadius+radius)*l.normal,right:r.value-(borderRadius+radius)*r.normal};}
function safelyInterior(x:number,y:number,radius:number){const margin=400+radius*1.1,b=COURT_BOUNDS;return x>=b.left+margin&&x<=b.right-margin&&y>=b.top+margin&&y<=b.bottom-margin;}
function withinBoundary(x:number,y:number,radius=0){if(safelyInterior(x,y,radius))return true;const b=courtBoundaryAt(x,y,radius);return x>=b.left&&x<=b.right&&y>=b.top&&y<=b.bottom;}
function slideBoundary(body:Point,radius:number){if(safelyInterior(body.x,body.y,radius))return;for(let pass=0;pass<8;pass++){const oldX=body.x,oldY=body.y,b=courtBoundaryAt(body.x,body.y,radius);body.x=Math.max(b.left,Math.min(b.right,body.x));body.y=Math.max(b.top,Math.min(b.bottom,body.y));if(body.x===oldX&&body.y===oldY)break;}}
export const COURT_BORDER=COURT_BORDER_EDGES.flatMap(edge=>edge.points.slice(1).map((b,i)=>{const a=edge.points[i],width=Math.hypot(b.x-a.x,b.y-a.y)+130;return {x:(a.x+b.x)/2,y:(a.y+b.y)/2,angle:Math.atan2(b.y-a.y,b.x-a.x),width,height:width/3,flip:i%3===0};}));

// Footprint polylines follow only the rock bands; hollow basins stay walkable.
// Coordinates are authored for the fixed art dimensions, then rotated with it.
const footprints:Record<RockKind,number[][]>={
 ridge:[[-110,0,110,0,36]],
 crescent:[[-108,378,-283,307,43],[-283,307,-373,159,46],[-373,159,-317,10,50],[-317,10,-188,-123,50],[-188,-123,3,-155,55],[3,-155,164,-102,55],[164,-102,345,39,50],[345,39,394,187,48],[394,187,317,321,45],[317,321,192,399,40],[3,-155,3,-350,34]],
 fork:[[0,115,35,-340,48],[0,115,-201,245,45],[-201,245,-372,382,40],[0,115,190,175,50],[190,175,340,335,45]]
};
const rotate=(r:Rock,x:number,y:number)=>({x:r.x+Math.cos(r.angle)*x-Math.sin(r.angle)*y,y:r.y+Math.sin(r.angle)*x+Math.cos(r.angle)*y});
type Solid={a:Point;b:Point;radius:number;border:boolean;left:number;right:number;top:number;bottom:number};
const solids:Solid[]=[...COURT_ROCKS.flatMap(r=>footprints[r.kind].map(([ax,ay,bx,by,radius])=>({a:rotate(r,ax,ay),b:rotate(r,bx,by),radius,border:false}))),...COURT_LANDMARKS.flatMap(p=>p.feet.map(f=>({a:{x:p.x+f.x,y:p.y+f.y},b:{x:p.x+f.x,y:p.y+f.y},radius:f.radius,border:false}))),...COURT_BORDER_EDGES.flatMap(edge=>edge.points.slice(1).map((b,i)=>({a:edge.points[i],b,radius:borderRadius,border:true})))].map(s=>({...s,left:Math.min(s.a.x,s.b.x)-s.radius,right:Math.max(s.a.x,s.b.x)+s.radius,top:Math.min(s.a.y,s.b.y)-s.radius,bottom:Math.max(s.a.y,s.b.y)+s.radius}));
// Static spatial buckets bound collision/line-of-sight work to nearby stone bands.
const bucketSize=400,bucketKey=(x:number,y:number)=>x*65536+y,buckets=new Map<number,number[]>(),seen=new Uint32Array(solids.length);let visit=0;
solids.forEach((s,i)=>{for(let x=Math.floor(s.left/bucketSize);x<=Math.floor(s.right/bucketSize);x++)for(let y=Math.floor(s.top/bucketSize);y<=Math.floor(s.bottom/bucketSize);y++){const key=bucketKey(x,y),bucket=buckets.get(key);if(bucket)bucket.push(i);else buckets.set(key,[i]);}});
function nearbySolids(left:number,top:number,right:number,bottom:number,check:(s:Solid)=>boolean){if(++visit===4294967295){seen.fill(0);visit=1;}const mark=visit;for(let x=Math.floor(left/bucketSize);x<=Math.floor(right/bucketSize);x++)for(let y=Math.floor(top/bucketSize);y<=Math.floor(bottom/bucketSize);y++){const bucket=buckets.get(bucketKey(x,y));if(!bucket)continue;for(const i of bucket){if(seen[i]===mark)continue;seen[i]=mark;const s=solids[i];if(s.left>right||s.right<left||s.top>bottom||s.bottom<top)continue;if(check(s))return true;}}return false;}
function segmentDistanceSquared(p:Point,a:Point,b:Point){const dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1)));return (p.x-a.x-t*dx)**2+(p.y-a.y-t*dy)**2;}
export function insideCourt(x:number,y:number,radius=0){return withinBoundary(x,y,radius)&&!nearbySolids(x-radius,y-radius,x+radius,y+radius,s=>!s.border&&segmentDistanceSquared({x,y},s.a,s.b)<(s.radius+radius)**2);}
export function slideCourt(body:Point,radius:number){slideBoundary(body,radius);for(let pass=0;pass<3;pass++){let moved=false;nearbySolids(body.x-radius,body.y-radius,body.x+radius,body.y+radius,s=>{if(s.border)return false;const ux=s.b.x-s.a.x,uy=s.b.y-s.a.y,len=ux*ux+uy*uy,t=Math.max(0,Math.min(1,((body.x-s.a.x)*ux+(body.y-s.a.y)*uy)/(len||1))),x=s.a.x+ux*t,y=s.a.y+uy*t,dx=body.x-x,dy=body.y-y,r=radius+s.radius,d2=dx*dx+dy*dy;if(d2<r*r){const d=Math.sqrt(d2);body.x=x+(d>1e-6?dx/d:len?-uy/Math.sqrt(len):1)*r;body.y=y+(d>1e-6?dy/d:len?ux/Math.sqrt(len):0)*r;moved=true;}return false;});if(!moved)break;}slideBoundary(body,radius);}
// Bounds include rotated artwork and shake; cached images are never unloaded.
export function courtArtVisible(x:number,y:number,width:number,height:number,angle:number,cx:number,cy:number,halfW:number,halfH:number){const co=Math.abs(Math.cos(angle)),si=Math.abs(Math.sin(angle));return Math.abs(x-cx)<=halfW+(co*width+si*height)/2+32&&Math.abs(y-cy)<=halfH+(si*width+co*height)/2+32;}
// Cached shared flow fields avoid a path search per enemy per frame (713 grid nodes plus local portals).
const step=600,cols=31,rows=23;
const gridNodes=Array.from({length:cols*rows},(_,i)=>({x:-9000+(i%cols)*step,y:-6600+Math.floor(i/cols)*step}));
const portals=COURT_ROCKS.filter(r=>r.kind!=='ridge').flatMap(r=>(r.kind==='crescent'?[[0,130],[40,470],[80,800]]:[[0,300],[-230,-70],[260,-70]]).map(([x,y])=>rotate(r,x,y))).filter(p=>insideCourt(p.x,p.y,48));
const nodes=[...gridNodes,...portals];
export const COURT_NAV_NODE_COUNT=nodes.length;
const open=nodes.map(p=>insideCourt(p.x,p.y,48));
function clear(a:Point,b:Point){const cross=(p:Point,q:Point,r:Point)=>(q.x-p.x)*(r.y-p.y)-(q.y-p.y)*(r.x-p.x);return !nearbySolids(Math.min(a.x,b.x)-40,Math.min(a.y,b.y)-40,Math.max(a.x,b.x)+40,Math.max(a.y,b.y)+40,s=>{const intersects=cross(a,b,s.a)*cross(a,b,s.b)<0&&cross(s.a,s.b,a)*cross(s.a,s.b,b)<0;return intersects||Math.min(segmentDistanceSquared(a,s.a,s.b),segmentDistanceSquared(b,s.a,s.b),segmentDistanceSquared(s.a,a,b),segmentDistanceSquared(s.b,a,b))<(s.radius+40)**2;});}
const nodeBuckets=new Map<number,number[]>();nodes.forEach((p,i)=>{const key=bucketKey(Math.floor(p.x/step),Math.floor(p.y/step)),bucket=nodeBuckets.get(key);if(bucket)bucket.push(i);else nodeBuckets.set(key,[i]);});
function localNodes(x:number,y:number,range:number,consider:(j:number)=>void){const cx=Math.floor(x/step),cy=Math.floor(y/step);for(let dx=-range;dx<=range;dx++)for(let dy=-range;dy<=range;dy++){const bucket=nodeBuckets.get(bucketKey(cx+dx,cy+dy));if(bucket)for(const j of bucket)consider(j);}}
const links=gridNodes.map((p,i)=>open[i]?[-1,0,1].flatMap(dy=>[-1,0,1].flatMap(dx=>{const x=i%cols+dx,y=Math.floor(i/cols)+dy,j=y*cols+x;return (dx||dy)&&x>=0&&x<cols&&y>=0&&y<rows&&open[j]&&clear(p,nodes[j])?[j]:[];})):[]);
for(let i=gridNodes.length;i<nodes.length;i++){const adjacent:number[]=[];localNodes(nodes[i].x,nodes[i].y,2,j=>{const p=nodes[j];if(i!==j&&open[j]&&(p.x-nodes[i].x)**2+(p.y-nodes[i].y)**2<900**2&&clear(p,nodes[i]))adjacent.push(j);});links[i]=adjacent;for(const j of adjacent)if(j<gridNodes.length&&!links[j].includes(i))links[j].push(i);}
function cell(x:number,y:number){let i=-1,best=Infinity;const point={x,y},consider=(j:number)=>{const p=nodes[j],d=(p.x-x)**2+(p.y-y)**2;if(open[j]&&d<best&&clear(point,p)){best=d;i=j;}};localNodes(x,y,1,consider);if(i<0)localNodes(x,y,3,consider);return i;}
const flows=new Map<number,Int16Array>();
function flow(goal:number){let next=flows.get(goal);if(next)return next;next=new Int16Array(nodes.length).fill(-1);next[goal]=goal;const queue=[goal];for(let n=0;n<queue.length;n++)for(const j of links[queue[n]])if(next[j]<0){next[j]=queue[n];queue.push(j);}if(flows.size>=12)flows.delete(flows.keys().next().value!);flows.set(goal,next);return next;}
let lastGoalX=NaN,lastGoalY=NaN,lastGoalCell=-1;
export function courtSteer(x:number,y:number,tx:number,ty:number){
 if(!clear({x,y},{x:tx,y:ty})){
  const from={x,y},goal={x:tx,y:ty};
  // A body touching a wall is inside the navigation margin. Project locally,
  // rather than testing every graph node against that impossible starting point.
  if(!insideCourt(x,y,42)){slideCourt(from,42);if(Math.hypot(from.x-x,from.y-y)>2){const d=Math.hypot(from.x-x,from.y-y)||1;return {x:(from.x-x)/d,y:(from.y-y)/d};}}
  if(!insideCourt(tx,ty,42))slideCourt(goal,42);
  const i=cell(from.x,from.y);if(goal.x!==lastGoalX||goal.y!==lastGoalY){lastGoalX=goal.x;lastGoalY=goal.y;lastGoalCell=cell(goal.x,goal.y);}const j=lastGoalCell;
  if(i>=0&&j>=0){const k=flow(j)[i];if(k>=0){const waypoint=clear(from,nodes[k])?nodes[k]:nodes[i];tx=waypoint.x;ty=waypoint.y;}}
 }
 const dx=tx-x,dy=ty-y,d=Math.hypot(dx,dy)||1;return {x:dx/d,y:dy/d};
}
export const COURT_SEARCH_ROUTE=[
 {x:-780,y:0},{x:0,y:-780},{x:780,y:0},{x:0,y:780},
 {x:7650,y:2550},{x:7650,y:4950},{x:1950,y:5850},{x:-1950,y:5850},{x:-7650,y:4950},{x:-7650,y:2550},
 {x:-7650,y:-2550},{x:-7650,y:-4950},{x:-1950,y:-5850},{x:1950,y:-5850},{x:7650,y:-4950},{x:7650,y:-2550}
];
