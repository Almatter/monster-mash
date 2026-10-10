import type {Game,Enemy} from './simulation.ts';
import {inTitanArena,REALM_RING,REALM_ARENA_YSCALE} from './titan-realm-map.ts';
export type TitanAction={kind:'rush'|'cleave'|'eruption';angle:number;warning:number;duration:number;elapsed:number;from:{x:number;y:number};to:{x:number;y:number};hit:boolean};
const clamp=(x:number,y:number)=>{const d=Math.hypot(x,(y+38)/REALM_ARENA_YSCALE),r=REALM_RING-100,k=Math.min(1,r/(d||1));return {x:x*k,y:(y+38)*k-38};};
export function titanMotion(g:Game,e:Enemy,dt:number){const s=g.realm!,p=g.player;if(!s.engaged){const a=g.time*.12;e.x=Math.cos(a)*160;e.y=Math.sin(a)*115-38;return;}if(!inTitanArena(p.x,p.y))return;
 if(s.recovery>0){s.recovery=Math.max(0,s.recovery-dt);return;}
 const action=s.action;if(action){action.warning-=dt;if(action.warning>0)return;
  if(action.kind==='rush'){const before={x:e.x,y:e.y};action.elapsed=Math.min(action.duration,action.elapsed+dt);const t=action.elapsed/action.duration;e.x=action.from.x+(action.to.x-action.from.x)*t;e.y=action.from.y+(action.to.y-action.from.y)*t;const vx=e.x-before.x,vy=e.y-before.y,q=Math.max(0,Math.min(1,((p.x-before.x)*vx+(p.y-before.y)*vy)/(vx*vx+vy*vy||1)));if(!action.hit&&Math.hypot(p.x-before.x-vx*q,p.y-before.y-vy*q)<95){g.hurt(Math.min(245+s.layer*15,p.maxHp*.24*(1+.06*s.layer)));action.hit=true;}if(t<1)return;}
  else if(action.kind==='cleave'){const dx=p.x-e.x,dy=p.y-e.y,d=Math.hypot(dx,dy),a=Math.atan2(dy,dx),difference=Math.atan2(Math.sin(a-action.angle),Math.cos(a-action.angle));if(d<280&&Math.abs(difference)<Math.PI/3){g.hurt(Math.min(260+s.layer*18,p.maxHp*.26*(1+.06*s.layer)));action.hit=true;}g.effect(e.x+Math.cos(action.angle)*151,e.y+Math.sin(action.angle)*151,'realm-cleave',240,.55,action.angle);}
  else {for(let i=0;i<6&&s.zones.length<12;i++){const a=i*Math.PI/3+g.time*.35,offset=i?120:0,x=p.x+Math.cos(a)*offset,y=p.y+Math.sin(a)*offset;if(inTitanArena(x,y))s.zones.push({x,y,radius:i?82:112,warning:1.35,life:.55,damage:Math.min(175+s.layer*18,p.maxHp*.16*(1+.06*s.layer)),hit:false});}}
  if(action.kind!=='eruption'&&!action.hit){g.heal(p.maxHp*.035,true);g.ward(p.maxHp*.045,p.maxHp*.16,2);g.effect(p.x,p.y,'realm-breach',90,.35);}g.sound('titanImpact');s.action=null;s.recovery=1.1;e.timer=1.1;return;
 }
 const dx=p.x-e.x,dy=p.y-e.y,d=Math.hypot(dx,dy)||1;if(d>155){const step=Math.min(d-155,112*dt),next=clamp(e.x+dx/d*step,e.y+dy/d*step);e.x=next.x;e.y=next.y;}
 if(e.timer<=0){const kind=(['rush','cleave','eruption'] as const)[s.attackIndex++%3],angle=Math.atan2(p.y-e.y,p.x-e.x),to=clamp(p.x+Math.cos(angle)*60,p.y+Math.sin(angle)*60);s.action={kind,angle,warning:kind==='rush'?.85:kind==='cleave'?1.05:.65,duration:.42,elapsed:0,from:{x:e.x,y:e.y},to,hit:false};g.sound('shield');}
}
