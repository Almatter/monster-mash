import {warCoverAt,warBehindCover} from './war-map.ts';
type Point={x:number;y:number};
type Body=Point&{serial:number;coverStructure?:string};
type Sighting=Point&{at:number;visible:boolean};
export const WAR_SIGHT={memory:6,reveal:2,range:1100};
export class WarVision{
 private covers=new WeakMap<object,{x:number;y:number;ids:number[]}>();
 private memories=new WeakMap<object,Map<number,Sighting>>();
 private reveals=new Map<number,Map<number,number>>();
 private cover(p:Point&{coverStructure?:string}){let cached=this.covers.get(p);if(!cached||cached.x!==p.x||cached.y!==p.y){cached={x:p.x,y:p.y,ids:warCoverAt(p.x,p.y,p.coverStructure)};this.covers.set(p,cached);}return cached.ids;}
 reset(observer:Point){this.memories.delete(observer);this.covers.delete(observer);}
 reveal(body:Body,toTeam:number,time:number){let teams=this.reveals.get(body.serial);if(!teams){teams=new Map();this.reveals.set(body.serial,teams);}teams.set(toTeam,time+WAR_SIGHT.reveal);}
 update(time:number){for(const [serial,teams] of this.reveals){for(const [team,until] of teams)if(until<=time)teams.delete(team);if(!teams.size)this.reveals.delete(serial);}}
 visible(team:number,observer:Point,target:Body,time:number,range=WAR_SIGHT.range){
  if(Math.hypot(target.x-observer.x,target.y-observer.y)>range)return false;
  const hidden=this.cover(target);
  return !hidden.length||(this.reveals.get(target.serial)?.get(team)||0)>time||hidden.every(id=>warBehindCover(observer,id));
 }
 sense(team:number,observer:Point,target:Body,time:number,range:number){
  let memory=this.memories.get(observer);if(!memory){memory=new Map();this.memories.set(observer,memory);}
  if(this.visible(team,observer,target,time,range)){
   if(memory.size>=160&&!memory.has(target.serial))memory.delete(memory.keys().next().value!);
   let seen=memory.get(target.serial);if(!seen){seen={x:target.x,y:target.y,at:time,visible:true};memory.set(target.serial,seen);}else{seen.x=target.x;seen.y=target.y;seen.at=time;seen.visible=true;}return seen;
  }
  const last=memory.get(target.serial);if(!last)return null;
  if(time-last.at>WAR_SIGHT.memory){memory.delete(target.serial);return null;}
  // Witnessing the short step into cover identifies its entrance, not subsequent
  // movement within it. A distant teleport never updates the last known point.
  if(last.visible&&Math.hypot(last.x-target.x,last.y-target.y)<80){last.x=target.x;last.y=target.y;}
  last.visible=false;return last;
 }
}
