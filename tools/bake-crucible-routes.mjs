import {CrucibleTerrain} from '../src/crucible-terrain.ts';

// Static pools, fires and scenery are handled at import time, not by each marching minion.
export function bakeCrucibleRoutes(document){
 const terrain=new CrucibleTerrain(document),scale=terrain.scale,anchors=new Map();
 const safe=point=>{
  const key=point.join(',' );if(anchors.has(key))return anchors.get(key);
  let p={x:point[0]*scale,y:point[1]*scale,radius:32};
  if(terrain.hazardAt(p)>0||terrain.speedAt(p)<1){
   let found=false;for(let r=8;r<=400&&!found;r+=8)for(let i=0;i<32;i++){
    const a=i*Math.PI/16,candidate={x:p.x+Math.cos(a)*r,y:p.y+Math.sin(a)*r,radius:32};
    if(terrain.walkable(candidate.x,candidate.y,32)&&terrain.hazardAt(candidate)===0&&terrain.speedAt(candidate)===1){p=candidate;found=true;break;}
   }
   if(!found)throw Error('No safe static lane anchor near '+key);
  }
  const result=[p.x/scale,p.y/scale];anchors.set(key,result);return result;
 };
 const output=structuredClone(document);
 for(const room of output.rooms)room[3]=safe(room[3]);
 for(const deck of output.decks){
  const points=deck[2].map(safe),route=[points[0]];
  for(let i=1;i<points.length;i++){
   const a={x:points[i-1][0]*scale,y:points[i-1][1]*scale},b={x:points[i][0]*scale,y:points[i][1]*scale};
   for(const p of terrain.bakedRoute(a,b)){
    const next=[p.x/scale,p.y/scale];if(Math.hypot(next[0]-route.at(-1)[0],next[1]-route.at(-1)[1])>1)route.push(next);
   }
  }
  deck[2]=route;
 }
 return output;
}
