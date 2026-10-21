import type {Crucible,CrucibleUnit} from './crucible-sim.ts';
import {MONSTERS} from './content-monsters.ts';

export type ArmyOrder='automatic'|'siege'|'hunt'|'defend';
type Point={x:number;y:number};
type Order={mode:ArmyOrder;target:number;revision:number;point:Point|null;seenAt:number;scanAt:number;npcAt:number};
export class CrucibleOrders{
 states:Order[]=Array.from({length:8},()=>({mode:'automatic',target:-1,revision:0,point:null,seenAt:0,scanAt:0,npcAt:0}));
 private paths=new WeakMap<CrucibleUnit,{revision:number;at:number;x:number;y:number}>();
 host:Crucible;
 constructor(host:Crucible){this.host=host;}
 baseAvailable(team:number,target:number){const t=this.host.teams[target];return target!==team&&!!t&&!t.eliminated&&t.crystal.active;}
 sighting(team:number,target:number){const h=this.host,t=h.teams[target];if(!t||team===target||t.eliminated||!t.champion.active)return null;
  if(h.intel.visible(team,t.champion))return {x:t.champion.x,y:t.champion.y,at:h.time};
  const r=h.intel.reports[team][target];return r&&Number.isFinite(r.x)&&Number.isFinite(r.y)&&h.time-r.at<12?{x:r.x,y:r.y,at:r.at}:null;
 }
 reason(team:number,mode:ArmyOrder,target=-1){const location=this.host.shopLocation(team);if(location)return location;
  if(!['automatic','siege','hunt','defend'].includes(mode))return 'Unknown army order';
  if(mode==='siege'&&!this.baseAvailable(team,target))return 'Choose a surviving enemy base';
  if(mode==='hunt'&&!this.sighting(team,target))return 'Choose a living champion seen recently by your army';
  return '';
 }
 set(team:number,mode:ArmyOrder,target=-1){if(this.reason(team,mode,target))return false;this.change(team,mode,target);return true;}
 release(team:number,target=-1){return this.set(team,this.baseAvailable(team,target)?'siege':'automatic',target);}
 private change(team:number,mode:ArmyOrder,target=-1){const s=this.states[team];s.mode=mode;s.target=mode==='siege'||mode==='hunt'?target:-1;s.revision++;s.scanAt=0;s.point=null;
  if(mode==='hunt'){const p=this.sighting(team,target)!;s.point={x:p.x,y:p.y};s.seenAt=p.at;}
  for(const u of this.host.units)if(u.team===team&&['infantry','ranged'].includes(u.kind)&&!u.servant){u.navTeam=-999;u.nav=[];u.target=0;u.think=0;u.recover=0;u.chase=0;u.avoid=0;this.paths.delete(u);}
 }
 update(team:number){const h=this.host,t=h.teams[team],s=this.states[team];if(!t.crystal.active||t.eliminated){if(s.mode!=='automatic')this.change(team,'automatic');return;}
  if(h.time<s.scanAt)return;s.scanAt=h.time+.25;
  if(s.mode==='siege'&&!this.baseAvailable(team,s.target))this.change(team,'automatic');
  if(s.mode==='hunt'){
   const p=this.sighting(team,s.target);if(p){s.point={x:p.x,y:p.y};s.seenAt=p.at;}
   const foe=h.teams[s.target];if(!foe?.champion.active||foe.eliminated||h.time-s.seenAt>=12)this.change(team,'automatic');
  }
  // Rivals issue orders only from home or recall, using their own shared sight.
  if(h.strategy?.managesOrders(team))return;
  if(team===h.controlled||h.time<24||h.time<s.npcAt||h.shopLocation(team))return;s.npcAt=h.time+4+h.random()*4;
  const threatened=h.units.some(v=>v.active&&v.team!==team&&!['captain','crystal'].includes(v.kind)&&Math.hypot(v.x-t.crystal.x,v.y-t.crystal.y)<h.baseDomain(team)&&h.intel.visible(team,v));
  if(threatened&&(!t.champion.active||t.crystal.hp<t.crystal.maxHp*.5)){if(s.mode!=='defend')this.set(team,'defend');return;}
  if(s.mode==='defend'&&t.champion.active&&!threatened){this.set(team,'automatic');return;}
  if(s.mode==='automatic'&&h.random()<.3){const target=h.teams.findIndex((v,i)=>i!==team&&!v.crystal.active&&!!this.sighting(team,i));if(target>=0)this.set(team,'hunt',target);}
 }
 siegeObjective(team:number){const h=this.host,s=this.states[team];if(s.mode!=='siege')return undefined;
  if(!this.baseAvailable(team,s.target)){this.change(team,'automatic');return undefined;}
  const destination=h.interveningBase(team,s.target),t=h.teams[destination>=0?destination:s.target],old=h.unit(h.teams[team].armyTarget);
  if(old?.active&&old.team===t.crystal.team)return old;
  const own=h.teams[team].crystal;return t.guards.filter(g=>g.active).sort((a,b)=>Math.hypot(a.x-own.x,a.y-own.y)-Math.hypot(b.x-own.x,b.y-own.y))[0]||t.crystal;
 }
 private road(u:CrucibleUnit,point:Point,revision:number,home=false){const h=this.host,memo=this.paths.get(u),key=home?-400-u.team:-500-u.team;
  if(!memo||memo.revision!==revision||u.navTeam!==key||!u.nav.length||!home&&h.time>=memo.at+.75&&Math.hypot(point.x-memo.x,point.y-memo.y)>60){h.buildRoute(u,u.team,false,home?undefined:point);u.navTeam=key;this.paths.set(u,{revision,at:h.time,...point});}
  while(u.navIndex<u.nav.length-1&&Math.hypot(u.x-u.nav[u.navIndex].x,u.y-u.nav[u.navIndex].y)<24)u.navIndex++;
  return u.nav[u.navIndex]||{x:u.x,y:u.y};
 }
 route(u:CrucibleUnit):Point|undefined{const h=this.host,t=h.teams[u.team],s=this.states[u.team];if(!t.crystal.active||u.servant)return undefined;
  if(s.mode==='defend'){
   u.objective=u.team;const c=t.crystal,angle=u.id*2.399963,spread=Math.min(120,h.baseDomain(u.team)*.45),p={x:c.x+Math.cos(angle)*spread,y:c.y+Math.sin(angle)*spread};
   const goal=h.terrain.walkable(p.x,p.y,u.radius)&&!h.terrain.hazardAt(p)?p:{x:c.x,y:c.y};
   if(Math.hypot(u.x-c.x,u.y-c.y)<h.baseDomain(u.team)*.8&&h.terrain.segmentFree(u,goal,u.radius))return Math.hypot(u.x-goal.x,u.y-goal.y)<20?{x:u.x,y:u.y}:goal;
   return this.road(u,c,s.revision,true);
  }
  if(s.mode==='hunt'&&s.point){u.objective=-1;const target=h.teams[s.target].champion,visible=target.active&&h.intel.visible(u.team,target),point=visible?{x:target.x,y:target.y}:s.point;
   if(visible&&Math.hypot(u.x-target.x,u.y-target.y)<=u.range+target.radius&&h.terrain.lineVisible(u,target))return target;
   if(Math.hypot(u.x-point.x,u.y-point.y)<160&&h.terrain.segmentFree(u,point,u.radius))return Math.hypot(u.x-point.x,u.y-point.y)<25?{x:u.x,y:u.y}:point;
   return this.road(u,point,s.revision);
  }
  return undefined;
 }
 combatTarget(u:CrucibleUnit){const h=this.host,t=h.teams[u.team],s=this.states[u.team];if(s.mode!=='defend'||!t.crystal.active)return undefined;
  const allowed=(v:CrucibleUnit)=>v.active&&v.team!==u.team&&!['captain','crystal'].includes(v.kind)&&Math.hypot(v.x-t.crystal.x,v.y-t.crystal.y)<=h.baseDomain(u.team)&&Math.hypot(v.x-u.x,v.y-u.y)<=u.range+v.radius&&h.intel.visible(u.team,v)&&h.terrain.lineVisible(u,v);
  const attacker=h.unit(t.defendTarget);if(t.champion.active&&t.defendUntil>h.time&&attacker&&allowed(attacker))return attacker;
  let best:CrucibleUnit|undefined,distance=Infinity;for(const v of h.units)if(allowed(v)){const d=Math.hypot(v.x-u.x,v.y-u.y);if(d<distance){distance=d;best=v;}}return best;
 }
 describe(team:number){const s=this.states[team],name=s.target>=0?MONSTERS[this.host.teams[s.target].monster].archetype:'';
  return s.mode==='defend'?'Rally and defend home':s.mode==='siege'?'Siege '+name+'’s base':s.mode==='hunt'?'Hunt '+name+(this.host.intel.visible(team,this.host.teams[s.target].champion)?'':' · search last sighting'):'Automatic siege';
 }
}
