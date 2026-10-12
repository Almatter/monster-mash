import type {Game,Enemy} from './simulation.ts';
import type {TitanAction} from './realm-encounter.ts';
import {inTitanArena} from './titan-realm-map.ts';
export const TITAN_MOVES=['rush','cleave','eruption','lance','rifts','blades','leap'] as const;
export type TitanMove=typeof TITAN_MOVES[number];
export const TITAN_MOVE_NAMES:Record<TitanMove,string>={rush:'Ruin Rush',cleave:'Continental Cleave',eruption:'Mana Eruption',lance:'Mana Lance',rifts:'Sundering Cross',blades:'Orbiting Blades',leap:'Heavenfall Leap'};
export const titanMovesAt=(tier:number)=>TITAN_MOVES.slice(0,3+Math.max(0,Math.min(4,tier)));
export type TitanHazard={kind:'lance'|'rift'|'blade';x:number;y:number;angle:number;length:number;radius:number;life:number;total:number;damage:number;tick:number;hit:boolean;centerX?:number;centerY?:number;orbit?:number};
export const TITAN_EXTRA={lanceWarning:1.15,riftWarning:1.3,bladeWarning:1.15,leapWarning:1.35,leapDuration:.6,maxHazards:12};
export function titanLineDistance(p:{x:number;y:number},h:Pick<TitanHazard,'x'|'y'|'angle'|'length'>){const dx=p.x-h.x,dy=p.y-h.y,along=Math.max(0,Math.min(h.length,dx*Math.cos(h.angle)+dy*Math.sin(h.angle)));return Math.hypot(dx-Math.cos(h.angle)*along,dy-Math.sin(h.angle)*along);}
export const titanExtra=(kind:TitanMove)=>['lance','rifts','blades','leap'].includes(kind);
export function prepareTitanExtra(g:Game,e:Enemy,action:TitanAction){const tier=action.tier||0,damage=Math.min(250,g.player.maxHp*.22),at=action.from;
 if(action.kind==='lance')action.hazards=[{kind:'lance',...at,angle:action.angle,length:1050,radius:50+3*tier,life:.35,total:.35,damage,tick:0,hit:false}];
 if(action.kind==='rifts')action.hazards=[-.7,0,.7].map(offset=>({kind:'rift',...at,angle:action.angle+offset,length:780,radius:34+3*tier,life:2,total:2,damage:Math.min(170,g.player.maxHp*.14),tick:0,hit:false}));
 if(action.kind==='blades'){const orbit=270+tier*18;action.hazards=[0,1,2,3].map(i=>{const angle=action.angle+i*Math.PI/2;return {kind:'blade',x:at.x+Math.cos(angle)*orbit,y:at.y+Math.sin(angle)*orbit,angle,length:0,radius:46,life:2.4,total:2.4,damage:Math.min(190,g.player.maxHp*.17),tick:0,hit:false,centerX:at.x,centerY:at.y,orbit};});}
 if(action.kind==='leap'){action.duration=TITAN_EXTRA.leapDuration;action.radius=170+6*tier;}
}
export function resolveTitanExtra(g:Game,e:Enemy,a:TitanAction,dt:number){if(a.kind==='leap'){a.elapsed=Math.min(a.duration,a.elapsed+dt);const t=a.elapsed/a.duration;e.x=a.from.x+(a.to.x-a.from.x)*t;e.y=a.from.y+(a.to.y-a.from.y)*t;if(t<1)return false;g.effect(e.x,e.y,'realm-titan-leap',a.radius||194,.75);if(Math.hypot(g.player.x-e.x,g.player.y-e.y)<(a.radius||194)+20){g.hurt(Math.min(300,g.player.maxHp*.25));a.hit=true;}g.shake=14;return true;}
 const s=g.realm!;for(const h of a.hazards||[])if(s.titanHazards.length<TITAN_EXTRA.maxHazards)s.titanHazards.push({...h});return true;}
function sweptDistance(p:{x:number;y:number},from:{x:number;y:number},to:{x:number;y:number}){const dx=to.x-from.x,dy=to.y-from.y,t=Math.max(0,Math.min(1,((p.x-from.x)*dx+(p.y-from.y)*dy)/(dx*dx+dy*dy||1)));return Math.hypot(p.x-from.x-dx*t,p.y-from.y-dy*t);}
export function updateTitanHazards(g:Game,dt:number){const s=g.realm!;if(!s.engaged||s.cleared){s.titanHazards.length=0;return;}for(let i=s.titanHazards.length-1;i>=0;i--){const h=s.titanHazards[i],from={x:h.x,y:h.y};h.life-=dt;if(h.life<=0){s.titanHazards.splice(i,1);continue;}h.tick=Math.max(0,h.tick-dt);if(h.kind==='blade'){h.angle+=dt*.95;h.x=h.centerX!+Math.cos(h.angle)*h.orbit!;h.y=h.centerY!+Math.sin(h.angle)*h.orbit!;}if(inTitanArena(g.player.x,g.player.y)&&h.tick===0&&!(h.kind==='lance'&&h.hit)){const distance=h.kind==='blade'?sweptDistance(g.player,from,h):titanLineDistance(g.player,h);if(distance<h.radius+20){g.hurt(h.damage);h.tick=.5;h.hit=true;}}if(h.life<=0)s.titanHazards.splice(i,1);}}
