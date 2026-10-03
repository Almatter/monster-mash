// Stage 2 geography only; sprite size and solid footprints never scale with the map.
export const HUNT_MAP_SCALE=3;
export const COURT_BOUNDS={left:-9600,right:9600,top:-7200,bottom:7200};
export const COURT_RADIUS=12000;
export const COURT_RIDGE_ART={width:560,height:180};
const ridgeHalf=180;
export const COURT_ROCKS=[
 ...[-4000,4000].flatMap(x=>[-2700,2700].flatMap(y=>[-430,0,430].map(d=>({x,y:y+d,angle:Math.PI/2,radius:60})))),
 ...[-4300,4300].flatMap(y=>[-5300,5300].flatMap(x=>[-430,0,430].map(d=>({x:x+d,y,angle:0,radius:60}))))
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
type Point={x:number;y:number};
const solids=[...COURT_ROCKS.map(r=>({a:{x:r.x-Math.cos(r.angle)*ridgeHalf,y:r.y-Math.sin(r.angle)*ridgeHalf},b:{x:r.x+Math.cos(r.angle)*ridgeHalf,y:r.y+Math.sin(r.angle)*ridgeHalf},radius:r.radius})),...COURT_LANDMARKS.flatMap(p=>p.feet.map(f=>({a:{x:p.x+f.x,y:p.y+f.y},b:{x:p.x+f.x,y:p.y+f.y},radius:f.radius})))];
function segmentDistanceSquared(p:Point,a:Point,b:Point){const dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1)));return (p.x-a.x-t*dx)**2+(p.y-a.y-t*dy)**2;}
export function insideCourt(x:number,y:number,radius=0){const b=COURT_BOUNDS,p={x,y};return x>=b.left+radius&&x<=b.right-radius&&y>=b.top+radius&&y<=b.bottom-radius&&!solids.some(s=>segmentDistanceSquared(p,s.a,s.b)<(s.radius+radius)**2);}
export function slideCourt(body:Point,radius:number){const b=COURT_BOUNDS;body.x=Math.max(b.left+radius,Math.min(b.right-radius,body.x));body.y=Math.max(b.top+radius,Math.min(b.bottom-radius,body.y));for(let pass=0;pass<3;pass++)for(const s of solids){const ux=s.b.x-s.a.x,uy=s.b.y-s.a.y,len=ux*ux+uy*uy,t=Math.max(0,Math.min(1,((body.x-s.a.x)*ux+(body.y-s.a.y)*uy)/(len||1))),x=s.a.x+ux*t,y=s.a.y+uy*t,dx=body.x-x,dy=body.y-y,r=radius+s.radius,d=Math.hypot(dx,dy);if(d<r){body.x=x+(d>1e-6?dx/d:len?-uy/Math.sqrt(len):1)*r;body.y=y+(d>1e-6?dy/d:len?ux/Math.sqrt(len):0)*r;}}}
// Bounds include rotated artwork and shake; cached images are never unloaded.
export function courtArtVisible(x:number,y:number,width:number,height:number,angle:number,cx:number,cy:number,halfW:number,halfH:number){const co=Math.abs(Math.cos(angle)),si=Math.abs(Math.sin(angle));return Math.abs(x-cx)<=halfW+(co*width+si*height)/2+32&&Math.abs(y-cy)<=halfH+(si*width+co*height)/2+32;}
// Cached shared flow fields avoid a path search per enemy per frame (713 nodes).
const step=600,cols=31,rows=23;
const nodes=Array.from({length:cols*rows},(_,i)=>({x:-9000+(i%cols)*step,y:-6600+Math.floor(i/cols)*step}));
const open=nodes.map(p=>insideCourt(p.x,p.y,48));
function clear(a:Point,b:Point){const cross=(p:Point,q:Point,r:Point)=>(q.x-p.x)*(r.y-p.y)-(q.y-p.y)*(r.x-p.x);return !solids.some(s=>{const intersects=cross(a,b,s.a)*cross(a,b,s.b)<0&&cross(s.a,s.b,a)*cross(s.a,s.b,b)<0;return intersects||Math.min(segmentDistanceSquared(a,s.a,s.b),segmentDistanceSquared(b,s.a,s.b),segmentDistanceSquared(s.a,a,b),segmentDistanceSquared(s.b,a,b))<(s.radius+40)**2;});}
const links=nodes.map((p,i)=>open[i]?[-1,0,1].flatMap(dy=>[-1,0,1].flatMap(dx=>{const x=i%cols+dx,y=Math.floor(i/cols)+dy,j=y*cols+x;return (dx||dy)&&x>=0&&x<cols&&y>=0&&y<rows&&open[j]&&clear(p,nodes[j])?[j]:[];})):[]);
function cell(x:number,y:number){let i=Math.max(0,Math.min(rows-1,Math.round((y+6600)/step)))*cols+Math.max(0,Math.min(cols-1,Math.round((x+9000)/step)));if(!open[i]){let best=Infinity;nodes.forEach((p,j)=>{const d=(p.x-x)**2+(p.y-y)**2;if(open[j]&&d<best){best=d;i=j;}});}return i;}
const flows=new Map<number,Int16Array>();
function flow(goal:number){let next=flows.get(goal);if(next)return next;next=new Int16Array(nodes.length).fill(-1);next[goal]=goal;const queue=[goal];for(let n=0;n<queue.length;n++)for(const j of links[queue[n]])if(next[j]<0){next[j]=queue[n];queue.push(j);}if(flows.size>=12)flows.delete(flows.keys().next().value!);flows.set(goal,next);return next;}
export function courtSteer(x:number,y:number,tx:number,ty:number){if(Math.hypot(tx-x,ty-y)>240||!clear({x,y},{x:tx,y:ty})){const i=cell(x,y),j=cell(tx,ty);if(i!==j){const k=flow(j)[i];if(k>=0){tx=nodes[k].x;ty=nodes[k].y;}}}const dx=tx-x,dy=ty-y,d=Math.hypot(dx,dy)||1;return {x:dx/d,y:dy/d};}
export const COURT_SEARCH_ROUTE=[
 {x:-780,y:0},{x:0,y:-780},{x:780,y:0},{x:0,y:780},
 {x:7650,y:2550},{x:7650,y:4950},{x:1950,y:5850},{x:-1950,y:5850},{x:-7650,y:4950},{x:-7650,y:2550},
 {x:-7650,y:-2550},{x:-7650,y:-4950},{x:-1950,y:-5850},{x:1950,y:-5850},{x:7650,y:-4950},{x:7650,y:-2550}
];
