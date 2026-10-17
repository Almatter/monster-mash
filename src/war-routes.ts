import type {MapDocument} from './realm-map-document.ts';
import {WAR_MAP_DATA} from './war-map-data.ts';
import {warWorld} from './war-map.ts';
type Point={x:number;y:number};
// A shared, immutable waypoint graph. Centerlines guide travel; compiled floor
// clearance remains authoritative for movement around obstacles and during combat.
export function createArmyRoutes(lines:number[][][],convert:(p:number[])=>Point){
 const nodes:Point[]=[],edges:Map<number,number>[]=[],cache=new Map<number,{distance:number[];next:number[]}>();
 const node=(p:Point)=>{let i=nodes.findIndex(q=>Math.hypot(p.x-q.x,p.y-q.y)<8);if(i<0){i=nodes.length;nodes.push(p);edges.push(new Map());}return i;};
 for(const line of lines){let previous=-1;for(const p of line){const i=node(convert(p));if(previous>=0&&previous!==i){const d=Math.hypot(nodes[i].x-nodes[previous].x,nodes[i].y-nodes[previous].y);edges[i].set(previous,d);edges[previous].set(i,d);}previous=i;}}
 const closest=(p:Point)=>{let best=-1,d=Infinity;for(let i=0;i<nodes.length;i++){const n=Math.hypot(p.x-nodes[i].x,p.y-nodes[i].y);if(n<d){best=i;d=n;}}return best;};
 return (from:Point,goal:Point):Point[]=>{
  const start=closest(from),end=closest(goal);if(start<0||end<0)return [goal];let field=cache.get(end);
  if(!field){const distance=nodes.map(()=>Infinity),next=nodes.map(()=>-1),visited=new Set<number>();distance[end]=0;
   for(let count=0;count<nodes.length;count++){let i=-1;for(let j=0;j<nodes.length;j++)if(!visited.has(j)&&(i<0||distance[j]<distance[i]))i=j;if(i<0||!Number.isFinite(distance[i]))break;visited.add(i);for(const [j,cost] of edges[i])if(distance[i]+cost<distance[j]){distance[j]=distance[i]+cost;next[j]=i;}}
   field={distance,next};cache.set(end,field);
  }
  if(!Number.isFinite(field.distance[start]))return [goal];
  const route:Point[]=[];for(let i=start;i>=0;i=field.next[i]){route.push(nodes[i]);if(i===end)break;}route.push(goal);return route;
 };
}
export const armyRoute=createArmyRoutes(WAR_MAP_DATA.decks.filter(r=>!(WAR_MAP_DATA as MapDocument).disabledRoutes?.includes(r[0] as string)).map(r=>r[2] as number[][]),warWorld);
