import type {Game,Enemy} from './simulation.ts';
import {insideCourt,courtSteer} from './court-map.ts';
export const COLOSSUS={captains:8,lastArrival:540,window:120,reward:1200000,hp:180000,range:700,radius:65,warning:1.25,scorch:1.35,cycle:3.2,maxZones:18,impact:78,burn:22,titanImpact:4};
export type ColossusZone={x:number;y:number;radius:number;placedAt:number;impactAt:number;endsAt:number;tickAt:number;erupted:boolean};
export type ColossusEncounter={status:'unseen'|'active'|'defeated'|'expired'|'departed';serial:number;retryAt:number;spawnedAt:number;expiresAt:number;defeatedAt?:number;attackAt:number;castUntil:number;pattern:number;zones:ColossusZone[]};
export type ColossusResult={spawnedAt:number;defeatedAt?:number;reward:number};
export const createColossus=():ColossusEncounter=>({status:'unseen',serial:0,retryAt:0,spawnedAt:0,expiresAt:0,attackAt:0,castUntil:0,pattern:0,zones:[]});
export const colossusEnemy=(g:Game)=>g.enemies.find(e=>e.active&&e.colossus&&e.serial===g.court?.colossus.serial);
export function colossusResult(g:Game):ColossusResult|undefined{const s=g.court?.colossus;if(!s||s.status==='unseen')return;return {spawnedAt:Math.floor(s.spawnedAt),...(s.defeatedAt!==undefined?{defeatedAt:Math.floor(s.defeatedAt)}:{}),reward:s.status==='defeated'?COLOSSUS.reward:0};}
export function summonColossus(g:Game){const s=g.court?.colossus;if(!s||s.status!=='unseen'||g.court!.stats.captains<COLOSSUS.captains||g.court!.stats.captains>=10||g.time>=COLOSSUS.lastArrival||g.ended)return false;
 // Retry at most twice a second if a cramped passage has no safe nearby spawn.
 if(g.time<s.retryAt)return false;s.retryAt=g.time+.5;
 // Search nearby walkable positions; never place a large foe inside the scene's walls.
 const heading=g.movementAngle;let point:{x:number;y:number}|null=null;for(let n=0;n<48;n++){const ring=Math.floor(n/16),j=n%16,a=heading+(j%2?1:-1)*Math.ceil(j/2)*Math.PI/8,r=[260,180,350][ring],candidate={x:g.player.x+Math.cos(a)*r,y:g.player.y+Math.sin(a)*r};if(insideCourt(candidate.x,candidate.y,62)){point=candidate;break;}}if(!point)return false;
 const e=g.spawn('titan');if(!e)return false;Object.assign(e,{...point,hp:COLOSSUS.hp,maxHp:COLOSSUS.hp,colossus:{expiresAt:g.time+COLOSSUS.window},timer:99,windup:0,vx:0,vy:0});Object.assign(s,{status:'active',serial:e.serial,spawnedAt:g.time,expiresAt:g.time+COLOSSUS.window,attackAt:g.time+2.5});g.notice='OPTIONAL · ASHEN COLOSSUS · 2:00 · +1.2M';g.noticeTime=5;return true;
}
// Titan's heavy impacts fracture its basalt shell; this enemy-specific rule leaves both existing stages' foes unchanged.
export const colossusDamage=(g:Game,amount:number,source:string)=>g.monster.id==='titan'&&['launch','shockwave','trample','collision','fissure-impact','fissure'].includes(source)?amount*COLOSSUS.titanImpact:amount;
export function finishColossus(g:Game,e:Enemy){const s=g.court?.colossus;if(!s||!e.colossus||s.serial!==e.serial||s.status!=='active'||g.time>=s.expiresAt)return;s.status='defeated';s.defeatedAt=g.time;s.zones.length=0;g.score.dominance+=COLOSSUS.reward;g.effect(e.x,e.y,'colossus-eruption',140,.8);g.notice='ASHEN COLOSSUS SLAIN · +1.2M';g.noticeTime=4;g.sound('achievement');}
export function dismissColossus(g:Game,cleared=false){const s=g.court?.colossus;if(!s)return;s.zones.length=0;if(s.status!=='active')return;const e=colossusEnemy(g);if(e){e.active=false;g.alive--;g.effect(e.x,e.y,'colossus-eruption',110,.6);}s.status=cleared?'departed':'expired';if(!cleared){g.notice='THE COLOSSUS RETURNS TO ASH';g.noticeTime=3;}}
export function colossusMotion(g:Game,e:Enemy){const s=g.court!.colossus,d=Math.hypot(e.x-g.player.x,e.y-g.player.y),v=courtSteer(e.x,e.y,g.player.x,g.player.y);return {dx:v.x,dy:v.y,speed:g.time<s.castUntil||d<155?0:55};}
export function colossusVolley(g:Game,e:Enemy){const s=g.court!.colossus,p=g.player,pattern=s.pattern++%3,angle=g.movementAngle,points:{x:number;y:number}[]=[];
 if(pattern===0){points.push({x:p.x,y:p.y});for(let i=0;i<3;i++){const a=angle+i*Math.PI*2/3;points.push({x:p.x+Math.cos(a)*185,y:p.y+Math.sin(a)*185});}}
 else if(pattern===1){for(let i=0;i<4;i++){const a=angle+Math.PI/4+i*Math.PI/2;points.push({x:p.x+Math.cos(a)*205,y:p.y+Math.sin(a)*205});}}
 else {const ax=Math.cos(angle),ay=Math.sin(angle),speed=g.moving?g.monster.speed*g.releaseStats.move*(g.monster.passive.id==='hunger'?1+Math.min(.15,g.score.recent.length*.003):1):0;for(let i=0;i<4;i++){const forward=speed*(COLOSSUS.warning+i*.22),side=i%2?45:-45;points.push({x:p.x+ax*forward-ay*side,y:p.y+ay*forward+ax*side});}}
 for(const [i,point] of points.entries()){if(s.zones.length>=COLOSSUS.maxZones)break;if(!insideCourt(point.x,point.y,20))continue;const impactAt=g.time+COLOSSUS.warning+i*.22;s.zones.push({...point,radius:COLOSSUS.radius,placedAt:g.time,impactAt,endsAt:impactAt+COLOSSUS.scorch,tickAt:impactAt,erupted:false});}s.castUntil=g.time+COLOSSUS.warning;s.attackAt=g.time+COLOSSUS.cycle*(e.hp<e.maxHp*.4?.87:1);
}
function strike(g:Game,z:ColossusZone,damage:number){if(Math.hypot(g.player.x-z.x,g.player.y-z.y)<z.radius+23)g.hurt(damage);for(const ally of g.servants)if(ally.active&&Math.hypot(ally.x-z.x,ally.y-z.y)<z.radius+14){ally.hp-=damage;ally.hitTimer=.45;if(ally.hp<=0){ally.active=false;ally.target=null;}}}
export function updateColossus(g:Game){const s=g.court!.colossus;if(g.ended||g.court!.cleared){dismissColossus(g,true);return;}if(s.status==='unseen')summonColossus(g);if(s.status!=='active')return;if(g.time>=s.expiresAt){dismissColossus(g);return;}const e=colossusEnemy(g);if(!e){s.zones.length=0;return;}if(g.time>=s.attackAt&&Math.hypot(g.player.x-e.x,g.player.y-e.y)<=COLOSSUS.range)colossusVolley(g,e);
 for(let i=s.zones.length-1;i>=0;i--){const z=s.zones[i];if(g.time>=z.endsAt){s.zones.splice(i,1);continue;}if(!z.erupted&&g.time>=z.impactAt){z.erupted=true;z.tickAt=g.time+.45;strike(g,z,COLOSSUS.impact);g.sound('ultimateImpact');}else if(z.erupted&&g.time>=z.tickAt){z.tickAt=g.time+.45;strike(g,z,COLOSSUS.burn);}if(g.ended){dismissColossus(g,true);return;}}
}
