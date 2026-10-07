import type {Game} from './simulation.ts';
import {reaperThreat} from './reaper.ts';

// Suggest visible, legal spell centers. Prefer major threats, then a dense
// cluster of prey of the same threat tier. This never reveals distant camps.
export function calamitySuggestedPoint(g:Game,index:number){
 const p=g.player,radius=g.powers[index].radius*g.releaseStats.radius;
 const visible=g.enemies.filter(e=>e.active&&Math.abs(e.x-p.x)<=g.targetView.x&&Math.abs(e.y-p.y)<=g.targetView.y&&Math.hypot(e.x-p.x,e.y-p.y)<=750&&g.insideMap(e.x,e.y));
 visible.sort((a,b)=>reaperThreat(a)-reaperThreat(b)||Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y));
 let best=visible[0],rank=-Infinity;
 for(const e of visible.slice(0,48)){
  if(reaperThreat(e)!==reaperThreat(visible[0]))break;
  let score=-Math.hypot(e.x-p.x,e.y-p.y)*.001;
  for(const other of visible)if(Math.hypot(e.x-other.x,e.y-other.y)<=radius)score+=Math.max(1,8-reaperThreat(other));
  if(score>rank){rank=score;best=e;}
 }
 if(best)return {x:best.x,y:best.y};
 const reach=Math.min(220,g.targetView.x*.8,g.targetView.y*.8),point={x:p.x+Math.cos(g.movementAngle)*reach,y:p.y+Math.sin(g.movementAngle)*reach};
 return g.insideMap(point.x,point.y)?point:{x:p.x,y:p.y};
}
