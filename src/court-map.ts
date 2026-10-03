// Stage 2 canyon basin; Stage 1 retains arena.ts unchanged.
export const HUNT_MAP_SCALE=3.6;
export const COURT_BOUNDS={left:-3200*HUNT_MAP_SCALE,right:3200*HUNT_MAP_SCALE,top:-2400*HUNT_MAP_SCALE,bottom:2400*HUNT_MAP_SCALE};
export const COURT_RADIUS=4000*HUNT_MAP_SCALE;
const ridgeHalf=95*HUNT_MAP_SCALE;
export const COURT_ROCKS=([...[-1600,1600].flatMap(x=>[-1300,1300].flatMap(y=>[-350,0,350].map(d=>({x,y:y+d,angle:Math.PI/2,radius:105})))),...[-650,650].flatMap(y=>[-2450,0,2450].flatMap(x=>[-175,175].map(d=>({x:x+d,y,angle:0,radius:105}))))]).map(r=>({...r,x:r.x*HUNT_MAP_SCALE,y:r.y*HUNT_MAP_SCALE,radius:r.radius*HUNT_MAP_SCALE}));
const circles=COURT_ROCKS.flatMap(r=>[-ridgeHalf,0,ridgeHalf].map(d=>({x:r.x+Math.cos(r.angle)*d,y:r.y+Math.sin(r.angle)*d,r:r.radius})));
export const COURT_SITES=[-1800,-1000,1000,1800].flatMap(y=>[-2600,-850,850,2600].map(x=>({x:x*HUNT_MAP_SCALE,y:y*HUNT_MAP_SCALE})));
export const COURT_SHRINES=[{x:0,y:0},{x:-2500,y:0},{x:2500,y:0},{x:0,y:-1900},{x:0,y:1900}].map(p=>({x:p.x*HUNT_MAP_SCALE,y:p.y*HUNT_MAP_SCALE}));
export function insideCourt(x:number,y:number,radius=0){const b=COURT_BOUNDS;return x>=b.left+radius&&x<=b.right-radius&&y>=b.top+radius&&y<=b.bottom-radius&&!circles.some(c=>Math.hypot(x-c.x,y-c.y)<c.r+radius);}
export function slideCourt(body:{x:number;y:number},radius:number){const b=COURT_BOUNDS;body.x=Math.max(b.left+radius,Math.min(b.right-radius,body.x));body.y=Math.max(b.top+radius,Math.min(b.bottom-radius,body.y));for(let pass=0;pass<3;pass++)for(const rock of COURT_ROCKS){const ux=Math.cos(rock.angle),uy=Math.sin(rock.angle),t=Math.max(-ridgeHalf,Math.min(ridgeHalf,(body.x-rock.x)*ux+(body.y-rock.y)*uy)),x=rock.x+ux*t,y=rock.y+uy*t,dx=body.x-x,dy=body.y-y,r=radius+rock.radius,d=Math.hypot(dx,dy);if(d<r){body.x=x+(d>1e-6?dx/d:-uy)*r;body.y=y+(d>1e-6?dy/d:ux)*r;}}}

// Cached shared flow fields avoid a path search per enemy per frame.
const step=200*HUNT_MAP_SCALE,cols=31,rows=23;
const nodes=Array.from({length:cols*rows},(_,i)=>({x:-3000*HUNT_MAP_SCALE+(i%cols)*step,y:-2200*HUNT_MAP_SCALE+Math.floor(i/cols)*step}));
const open=nodes.map(p=>insideCourt(p.x,p.y,48));
function clear(a:{x:number;y:number},b:{x:number;y:number}){const dx=b.x-a.x,dy=b.y-a.y,len=dx*dx+dy*dy;return !circles.some(c=>{const t=Math.max(0,Math.min(1,((c.x-a.x)*dx+(c.y-a.y)*dy)/(len||1)));return Math.hypot(a.x+t*dx-c.x,a.y+t*dy-c.y)<c.r+40;});}
const links=nodes.map((p,i)=>open[i]?[-1,0,1].flatMap(dy=>[-1,0,1].flatMap(dx=>{const x=i%cols+dx,y=Math.floor(i/cols)+dy,j=y*cols+x;return (dx||dy)&&x>=0&&x<cols&&y>=0&&y<rows&&open[j]&&clear(p,nodes[j])?[j]:[];})):[]);
function cell(x:number,y:number){let i=Math.max(0,Math.min(rows-1,Math.round((y+2200*HUNT_MAP_SCALE)/step)))*cols+Math.max(0,Math.min(cols-1,Math.round((x+3000*HUNT_MAP_SCALE)/step)));if(!open[i]){let best=Infinity;nodes.forEach((p,j)=>{const d=(p.x-x)**2+(p.y-y)**2;if(open[j]&&d<best){best=d;i=j;}});}return i;}
const flows=new Map<number,Int16Array>();
function flow(goal:number){let next=flows.get(goal);if(next)return next;next=new Int16Array(nodes.length).fill(-1);next[goal]=goal;const queue=[goal];for(let n=0;n<queue.length;n++)for(const j of links[queue[n]])if(next[j]<0){next[j]=queue[n];queue.push(j);}if(flows.size>=12)flows.delete(flows.keys().next().value!);flows.set(goal,next);return next;}
export function courtSteer(x:number,y:number,tx:number,ty:number){if(Math.hypot(tx-x,ty-y)>240||!clear({x,y},{x:tx,y:ty})){const i=cell(x,y),j=cell(tx,ty);if(i!==j){const k=flow(j)[i];if(k>=0){tx=nodes[k].x;ty=nodes[k].y;}}}const dx=tx-x,dy=ty-y,d=Math.hypot(dx,dy)||1;return {x:dx/d,y:dy/d};}
export const COURT_SEARCH_ROUTE=[{x:-850,y:-1800},{x:-2600,y:-1800},{x:-2600,y:-1000},{x:-850,y:-1000},{x:850,y:-1000},{x:2600,y:-1000},{x:2600,y:-1800},{x:850,y:-1800},{x:850,y:1000},{x:2600,y:1000},{x:2600,y:1800},{x:850,y:1800},{x:-850,y:1800},{x:-2600,y:1800},{x:-2600,y:1000},{x:-850,y:1000}].map(p=>({x:p.x*HUNT_MAP_SCALE,y:p.y*HUNT_MAP_SCALE}));
