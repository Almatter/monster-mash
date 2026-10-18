import {WAR_REACTION} from './war-reaction.ts';
import type {Crucible,CrucibleUnit} from './crucible-sim.ts';

type Point={x:number;y:number};
export type Attention={focus:number;mode:'lane'|'rival'|'base';intent:'lane'|'rival'|'base';intentUntil:number;point:Point;readyAt:number;scanAt:number;aimAt:number;holdUntil:number;lastSeen:number;visible:boolean;peripheralAt:number;alarm:number;alarmAt:number};
export class CrucibleAttention{
 host:Crucible;states:Attention[]=[];
 constructor(host:Crucible){this.host=host;for(let i=0;i<8;i++)this.reset(i);}
 reset(team:number){const u=this.host.teams[team].champion;this.states[team]={focus:0,mode:'lane',intent:'lane',intentUntil:0,point:{x:u.x,y:u.y},readyAt:Infinity,scanAt:0,aimAt:0,holdUntil:0,lastSeen:0,visible:false,peripheralAt:this.host.time+.7+this.host.random(),alarm:0,alarmAt:Infinity};}
 view(team:number){const u=this.host.teams[team].champion,half=this.host.viewport;return {x:u.x,y:u.y-half.y*.14,halfX:half.x,halfY:half.y};}
 inView(team:number,point:Point){const v=this.view(team);return Math.abs(point.x-v.x)<=v.halfX&&Math.abs(point.y-v.y)<=v.halfY;}
 attacked(team:number,source:CrucibleUnit){if(this.host.controlled===team||!this.inView(team,source))return;const s=this.states[team];if(s.focus===source.id||s.alarm===source.id)return;s.alarm=source.id;s.alarmAt=this.host.time+WAR_REACTION.noticeMin+this.host.random()*WAR_REACTION.noticeSpread;}
 update(team:number){const h=this.host,s=this.states[team],u=h.teams[team].champion;if(h.controlled===team||!u.active)return;
  const current=h.unit(s.focus);s.visible=!!current?.active&&this.inView(team,current);
  if(s.visible&&current){s.lastSeen=h.time;if(h.time>=s.aimAt){s.point={x:current.x,y:current.y};s.aimAt=h.time+WAR_REACTION.aimMin+h.random()*WAR_REACTION.aimSpread;}}
  if(h.time<s.scanAt)return;s.scanAt=h.time+.18+h.random()*.14;
  const alarm=h.unit(s.alarm);if(alarm?.active&&h.time>=s.alarmAt&&this.inView(team,alarm)){this.focus(team,alarm,true);s.alarm=0;s.alarmAt=Infinity;return;}
  if(s.alarm&&(!alarm?.active||!this.inView(team,alarm))){s.alarm=0;s.alarmAt=Infinity;}
  if(current?.active&&(s.visible||h.time-s.lastSeen<1.25)&&h.time<s.holdUntil)return;
  const broad=h.time>=s.peripheralAt;if(broad)s.peripheralAt=h.time+1.25+h.random()*.75;
  const goal=h.teams[h.teams[team].goal]?.crystal||{x:1800,y:1600},dx=goal.x-u.x,dy=goal.y-u.y,d=Math.hypot(dx,dy)||1;
  const focusPoint=s.visible?s.point:{x:u.x+dx/d*220,y:u.y+dy/d*220};let next:CrucibleUnit|undefined,best=Infinity;const candidates:{unit:CrucibleUnit;rank:number;kind:Attention['mode']}[]=[];
  for(const v of h.units){if(!v.active||v.team===team||!this.inView(team,v))continue;const distance=Math.hypot(v.x-u.x,v.y-u.y),central=Math.hypot(v.x-focusPoint.x,v.y-focusPoint.y)<Math.max(125,Math.min(h.viewport.x,h.viewport.y)*.7);
   if(!broad&&!central)continue;
   // Attention stays on one fight, rather than evaluating every threat every frame.
   const rank=distance+(v.kind==='champion'?(broad?-50:20):v.kind==='captain'||v.kind==='crystal'?90:0);
   candidates.push({unit:v,rank,kind:v.kind==='champion'?'rival':v.kind==='captain'||v.kind==='crystal'?'base':'lane'});
  }
  if(broad&&h.time>=s.intentUntil&&candidates.length){const style=h.teams[team].build.style,weights={lane:style==='Arcanist'?4:2,rival:style==='Bruiser'||style==='Skirmisher'?5:3,base:2},available=Object.keys(weights).filter(kind=>candidates.some(c=>c.kind===kind)) as Attention['mode'][];let roll=h.random()*available.reduce((sum,kind)=>sum+weights[kind],0);for(const kind of available){roll-=weights[kind];if(roll<=0){s.intent=kind;break;}}s.intentUntil=h.time+4+h.random()*3;}
  for(const candidate of candidates){const rank=candidate.rank+(candidate.kind===s.intent?0:10000);if(rank<best){best=rank;next=candidate.unit;}}
  if(next){if(next.id!==s.focus)this.focus(team,next);return;}
  if(!s.visible&&h.time-s.lastSeen>1.25){s.focus=0;s.readyAt=Infinity;s.mode='lane';s.point={x:u.x+dx/d*220,y:u.y+dy/d*220};}
 }
 private focus(team:number,u:CrucibleUnit,alreadyNoticed=false){const s=this.states[team],h=this.host;s.focus=u.id;s.mode=u.kind==='champion'?'rival':u.kind==='captain'||u.kind==='crystal'?'base':'lane';if(alreadyNoticed){s.intent=s.mode;s.intentUntil=h.time+3;}s.point={x:u.x,y:u.y};s.visible=true;s.lastSeen=h.time;s.readyAt=h.time+(alreadyNoticed?0:WAR_REACTION.noticeMin+h.random()*WAR_REACTION.noticeSpread);s.holdUntil=h.time+2+h.random()*2;s.aimAt=h.time+WAR_REACTION.aimMin+h.random()*WAR_REACTION.aimSpread;}
 targetable(team:number,id:number){const s=this.states[team];return s.focus===id&&s.visible&&this.host.time>=s.readyAt;}
 target(team:number){this.update(team);const s=this.states[team];return this.targetable(team,s.focus)?this.host.unit(s.focus):undefined;}
 aim(team:number){const s=this.states[team];return s.focus&&s.visible&&this.host.time>=s.readyAt?{...s.point}:null;}
}
