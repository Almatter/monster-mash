import {polygonContains,type MapDocument} from './realm-map-document.ts';

type Point={x:number;y:number};
type Shape={points:number[][];left:number;right:number;top:number;bottom:number};
const shape=(points:number[][]):Shape=>({points,left:Math.min(...points.map(p=>p[0])),right:Math.max(...points.map(p=>p[0])),top:Math.min(...points.map(p=>p[1])),bottom:Math.max(...points.map(p=>p[1]))});
const contains=(s:Shape,p:Point)=>p.x>=s.left&&p.x<=s.right&&p.y>=s.top&&p.y<=s.bottom&&polygonContains(s.points,p.x,p.y);
function projection(p:Point,a:number[],b:number[]){const dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((p.x-a[0])*dx+(p.y-a[1])*dy)/(dx*dx+dy*dy||1)));return {x:a[0]+dx*t,y:a[1]+dy*t};}
function crossing(a:Point,b:Point,c:number[],d:number[]){const dx=b.x-a.x,dy=b.y-a.y,ex=d[0]-c[0],ey=d[1]-c[1],den=dx*ey-dy*ex;if(Math.abs(den)<1e-9)return undefined;const t=((c[0]-a.x)*ey-(c[1]-a.y)*ex)/den,u=((c[0]-a.x)*dy-(c[1]-a.y)*dx)/den;return t>=0&&t<=1&&u>=0&&u<=1?t:undefined;}

// One compilation per map. Old paint strokes are never scanned in the frame loop.
export class CrucibleTerrain{
 private static compiled=new WeakMap<MapDocument,CrucibleTerrain>();
 readonly scale:number;readonly width:number;readonly height:number;readonly cell=8;readonly columns:number;readonly rows:number;readonly floor:Uint8Array;
 readonly zones:Map<string,Shape>;readonly solids:Shape[];readonly sight:Shape[];readonly slows:(Shape&{factor:number})[];readonly hazards:(Shape&{dps:number})[];readonly foreground:(Shape&{depth:number})[];
 private nodes:Point[]=[];private links:{to:number;cost:number}[][]=[];
 private paths=new Map<number,{until:number;goal:Point;points:Point[];grid?:boolean}>();
 readonly document:MapDocument;
 constructor(document:MapDocument){this.document=document;const cached=CrucibleTerrain.compiled.get(document);if(cached){Object.assign(this,cached);this.paths=new Map();return;}this.scale=document.unitsPerPixel||4;this.width=(document.background?.width||1200)*this.scale;this.height=(document.background?.height||1200)*this.scale;this.columns=Math.ceil(this.width/this.cell);this.rows=Math.ceil(this.height/this.cell);this.floor=new Uint8Array(this.columns*this.rows);
  const world=(ps:number[][])=>ps.map(p=>p.map(n=>n*this.scale));
  this.solids=document.structures.filter(s=>s[4]?.length||s[1][2]>0&&s[1][3]>0).map(s=>shape(world(s[4]||Array.from({length:48},(_,i)=>[s[1][0]+Math.cos(i*Math.PI/24)*s[1][2],s[1][1]+Math.sin(i*Math.PI/24)*s[1][3]]))));
  this.zones=new Map((document.zones||[]).map(z=>[z.id,shape(world(z.points))]));
  this.sight=(document.terrain?.sight||[]).map(s=>shape(world(s.points)));
  this.slows=(document.terrain?.slows||[]).map(s=>({...shape(world(s.points)),factor:s.factor}));
  this.hazards=(document.terrain?.hazards||[]).map(s=>({...shape(world(s.points)),dps:s.dps}));
  this.foreground=document.structures.filter(s=>s[2].length).map(s=>({...shape(world(s[2])),depth:(s[3]??s[1][1]+s[1][3])*this.scale}));
  const [cx,cy,rx,ry]=document.arena;if(rx&&ry)this.raster(world(Array.from({length:256},(_,i)=>[cx+Math.cos(i*Math.PI/128)*rx,cy+Math.sin(i*Math.PI/128)*ry])),1);
  for(const room of document.rooms)this.raster(world(room[7]),1);
  for(const deck of document.decks)this.raster(world(deck[3]),1);
  for(const patch of document.patches)this.raster(world(patch.points),Number(patch.add));
  for(const solid of this.solids)this.raster(solid.points,0);
  for(const s of this.solids){const cx=(s.left+s.right)/2,cy=(s.top+s.bottom)/2;for(const p of s.points){const d=Math.hypot(p[0]-cx,p[1]-cy)||1,point={x:p[0]+(p[0]-cx)/d*65,y:p[1]+(p[1]-cy)/d*65};if(this.walkable(point.x,point.y,30))this.nodes.push(point);}}
  // Complex future maps use bounded grid search rather than a quadratic mesh.
  if(this.nodes.length>160)this.nodes=[];
  this.links=this.nodes.map(()=>[]);for(let i=0;i<this.nodes.length;i++)for(let j=i+1;j<this.nodes.length;j++)if(this.segmentFree(this.nodes[i],this.nodes[j],32)){const cost=Math.hypot(this.nodes[i].x-this.nodes[j].x,this.nodes[i].y-this.nodes[j].y);this.links[i].push({to:j,cost});this.links[j].push({to:i,cost});}
  CrucibleTerrain.compiled.set(document,this);
 }
 private raster(points:number[][],value:number){if(!points.length)return;const first=Math.max(0,Math.ceil(Math.min(...points.map(p=>p[1]))/this.cell-.5)),last=Math.min(this.rows-1,Math.floor(Math.max(...points.map(p=>p[1]))/this.cell-.5));for(let row=first;row<=last;row++){const y=(row+.5)*this.cell,crossings:number[]=[];for(let i=0,j=points.length-1;i<points.length;j=i++){const a=points[i],b=points[j];if((a[1]>y)!==(b[1]>y))crossings.push(a[0]+(y-a[1])*(b[0]-a[0])/(b[1]-a[1]));}crossings.sort((a,b)=>a-b);for(let i=0;i+1<crossings.length;i+=2){const left=Math.max(0,Math.ceil(crossings[i]/this.cell-.5)),right=Math.min(this.columns,Math.ceil(crossings[i+1]/this.cell-.5));this.floor.fill(value,row*this.columns+left,row*this.columns+right);}}}
 private sample(x:number,y:number){const col=Math.floor(x/this.cell),row=Math.floor(y/this.cell);return col>=0&&row>=0&&col<this.columns&&row<this.rows&&this.floor[row*this.columns+col]===1;}
 walkable(x:number,y:number,radius=0){if(!Number.isFinite(x)||!Number.isFinite(y)||!this.sample(x,y))return false;for(let i=0;radius&&i<8;i++){const a=i*Math.PI/4;if(!this.sample(x+Math.cos(a)*radius,y+Math.sin(a)*radius))return false;}return true;}
 clearance(x:number,y:number){if(!this.walkable(x,y))return 0;let distance=Math.min(x,y,this.width-x,this.height-y);for(const s of this.solids)for(let i=0;i<s.points.length;i++){const p=projection({x,y},s.points[i],s.points[(i+1)%s.points.length]);distance=Math.min(distance,Math.hypot(x-p.x,y-p.y));}for(let i=0;i<8;i++){const a=i*Math.PI/4;for(let r=8;r<Math.min(128,distance);r+=8)if(!this.sample(x+Math.cos(a)*r,y+Math.sin(a)*r)){distance=r;break;}}return Math.max(0,distance-6);}
 zoneContains(id:string,p:Point){const s=this.zones.get(id);return s?contains(s,p):undefined;}
 zoneRadius(id:string,center:Point,fallback:number){const s=this.zones.get(id);return s?Math.max(...s.points.map(p=>Math.hypot(p[0]-center.x,p[1]-center.y))):fallback;}
 speedAt(p:Point,airborne=false){if(airborne)return 1;let speed=1;for(const s of this.slows)if(contains(s,p))speed=Math.min(speed,s.factor);return speed;}
 hazardAt(p:Point,airborne=false){return airborne?0:this.hazards.reduce((sum,s)=>sum+(contains(s,p)?s.dps:0),0);}
 slide(p:Point,radius:number,previous?:Point,airborne=false){p.x=Math.max(95,Math.min(this.width-95,p.x));p.y=Math.max(95,Math.min(this.height-95,p.y));if(airborne||this.walkable(p.x,p.y,radius))return;
  if(previous){const x={x:p.x,y:previous.y},y={x:previous.x,y:p.y};if(this.walkable(x.x,x.y,radius)){Object.assign(p,x);return;}if(this.walkable(y.x,y.y,radius)){Object.assign(p,y);return;}if(this.walkable(previous.x,previous.y,radius)){Object.assign(p,previous);return;}}
  // Landing, displacement or an imported edit may place a body inside a footprint.
  for(let r=8;r<=720;r+=8)for(let i=0;i<24;i++){const a=i*Math.PI/12,x=p.x+Math.cos(a)*r,y=p.y+Math.sin(a)*r;if(this.walkable(x,y,radius)){p.x=x;p.y=y;return;}}
 }
 lineVisible(a:Point,b:Point){for(const s of this.sight){if(Math.max(a.x,b.x)<s.left||Math.min(a.x,b.x)>s.right||Math.max(a.y,b.y)<s.top||Math.min(a.y,b.y)>s.bottom)continue;if(contains(s,a)||contains(s,b))return false;for(let i=0;i<s.points.length;i++)if(crossing(a,b,s.points[i],s.points[(i+1)%s.points.length])!==undefined)return false;}return true;}
 private segmentFree(a:Point,b:Point,radius:number){for(const s of this.solids){if(Math.max(a.x,b.x)<s.left-radius||Math.min(a.x,b.x)>s.right+radius||Math.max(a.y,b.y)<s.top-radius||Math.min(a.y,b.y)>s.bottom+radius)continue;if(contains(s,a)||contains(s,b))return false;for(let i=0;i<s.points.length;i++){const c=s.points[i],d=s.points[(i+1)%s.points.length];if(crossing(a,b,c,d)!==undefined)return false;for(const p of [a,b]){const q=projection(p,c,d);if(Math.hypot(p.x-q.x,p.y-q.y)<radius)return false;}for(const p of [c,d]){const q=projection({x:p[0],y:p[1]},[a.x,a.y],[b.x,b.y]);if(Math.hypot(p[0]-q.x,p[1]-q.y)<radius)return false;}}}const steps=Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)/40);for(let i=0;i<=steps;i++)if(!this.walkable(a.x+(b.x-a.x)*i/Math.max(1,steps),a.y+(b.y-a.y)*i/Math.max(1,steps),radius))return false;return true;}
 steer(id:number,from:Point,goal:Point,time:number){if(this.segmentFree(from,goal,32)){this.paths.delete(id);return goal;}let cache=this.paths.get(id);if(!cache||time>=cache.until||Math.hypot(cache.goal.x-goal.x,cache.goal.y-goal.y)>100){
   const n=this.nodes.length,dist=Array(n).fill(Infinity),prev=Array(n).fill(-1),used=new Set<number>();for(let i=0;i<n;i++)if(this.segmentFree(from,this.nodes[i],32))dist[i]=Math.hypot(from.x-this.nodes[i].x,from.y-this.nodes[i].y);
   let end=-1,best=Infinity;for(let count=0;count<n;count++){let at=-1;for(let i=0;i<n;i++)if(!used.has(i)&&(at<0||dist[i]<dist[at]))at=i;if(at<0||!Number.isFinite(dist[at])||dist[at]>=best)break;used.add(at);if(this.segmentFree(this.nodes[at],goal,32)){const cost=dist[at]+Math.hypot(goal.x-this.nodes[at].x,goal.y-this.nodes[at].y);if(cost<best){best=cost;end=at;}}for(const edge of this.links[at])if(dist[at]+edge.cost<dist[edge.to]){dist[edge.to]=dist[at]+edge.cost;prev[edge.to]=at;}}
   const points:Point[]=[];for(let at=end;at>=0;at=prev[at])points.unshift(this.nodes[at]);if(end<0)points.push(...this.gridPath(from,goal));cache={until:time+1,goal:{...goal},points,grid:end<0};this.paths.set(id,cache);
  }while(cache.points.length&&Math.hypot(cache.points[0].x-from.x,cache.points[0].y-from.y)<(cache.grid?14:45))cache.points.shift();return cache.points[0]||goal;
 }
 private gridPath(from:Point,goal:Point){const cell=40,cols=Math.ceil(this.width/cell),rows=Math.ceil(this.height/cell),size=cols*rows,point=(id:number)=>({x:(id%cols+.5)*cell,y:(Math.floor(id/cols)+.5)*cell}),valid=new Int8Array(size).fill(-1);
  const open=(id:number)=>{if(id<0||id>=size)return false;if(valid[id]<0){const p=point(id);valid[id]=Number(this.walkable(p.x,p.y,32));}return valid[id]===1;};
  const nearest=(p:Point)=>{const x=Math.floor(p.x/cell),y=Math.floor(p.y/cell);let best=-1,distance=Infinity;for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){if(x+dx<0||y+dy<0||x+dx>=cols||y+dy>=rows)continue;const id=(y+dy)*cols+x+dx;if(!open(id))continue;const q=point(id),d=Math.hypot(p.x-q.x,p.y-q.y);if(d<distance){best=id;distance=d;}}return best;},start=nearest(from),end=nearest(goal);if(start<0||end<0)return [];
  const cost=new Float64Array(size).fill(Infinity),previous=new Int32Array(size).fill(-1),heap:{id:number;rank:number}[]=[],closed=new Uint8Array(size);
  const push=(entry:{id:number;rank:number})=>{heap.push(entry);let at=heap.length-1;while(at){const parent=(at-1)>>1;if(heap[parent].rank<=entry.rank)break;heap[at]=heap[parent];at=parent;}heap[at]=entry;};
  const pop=()=>{const first=heap[0],last=heap.pop()!;if(heap.length){let at=0;while(at*2+1<heap.length){let child=at*2+1;if(child+1<heap.length&&heap[child+1].rank<heap[child].rank)child++;if(heap[child].rank>=last.rank)break;heap[at]=heap[child];at=child;}heap[at]=last;}return first;};
  cost[start]=0;push({id:start,rank:0});while(heap.length){const {id}=pop();if(closed[id])continue;if(id===end){const path:Point[]=[];for(let at=end;at!==start&&at>=0;at=previous[at])path.unshift(point(at));return path;}closed[id]=1;const x=id%cols,y=Math.floor(id/cols);for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy||x+dx<0||y+dy<0||x+dx>=cols||y+dy>=rows)continue;const next=(y+dy)*cols+x+dx;if(closed[next]||!open(next)||dx&&dy&&(!open(y*cols+x+dx)||!open((y+dy)*cols+x)))continue;const distance=cost[id]+Math.hypot(dx,dy)*cell;if(distance>=cost[next])continue;cost[next]=distance;previous[next]=id;const p=point(next);push({id:next,rank:distance+Math.hypot(p.x-goal.x,p.y-goal.y)});}}
  return [];
 }
 vision(p:Point,radius:number){const near=this.sight.filter(s=>p.x+radius>=s.left&&p.x-radius<=s.right&&p.y+radius>=s.top&&p.y-radius<=s.bottom);if(!near.length)return null;const angles=Array.from({length:32},(_,i)=>i*Math.PI/16);for(const s of near)for(const q of s.points){const a=Math.atan2(q[1]-p.y,q[0]-p.x);angles.push(a-.0002,a+.0002);}angles.sort((a,b)=>a-b);return angles.map(a=>{const end={x:p.x+Math.cos(a)*radius,y:p.y+Math.sin(a)*radius};let t=1;for(const s of near)for(let i=0;i<s.points.length;i++){const hit=crossing(p,end,s.points[i],s.points[(i+1)%s.points.length]);if(hit!==undefined)t=Math.min(t,hit);}return [p.x+(end.x-p.x)*t,p.y+(end.y-p.y)*t];});}
}
