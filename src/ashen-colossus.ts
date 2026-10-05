import type {Game,Enemy} from './simulation.ts';
import {insideCourt,courtSteer,courtRegionAt,COURT_SITES} from './court-map.ts';
export const COLOSSUS={captains:8,lastArrival:540,window:180,reward:1200000,hp:180000,range:700,radius:65,warning:1.25,scorch:1.35,cycle:3.2,maxZones:18,impact:78,burn:22,titanImpact:4,playerSeparation:1500,captainSeparation:1600,territory:850,roam:240};
// Historical competition codes retain the two-minute encounter limit.
export const colossusWindowForRules=(rules:string)=>/-v(28|29|30)-court-/.test(rules)?120:COLOSSUS.window;
export type ColossusZone={x:number;y:number;radius:number;placedAt:number;impactAt:number;endsAt:number;tickAt:number;erupted:boolean};
export type ColossusEncounter={status:'unseen'|'active'|'defeated'|'expired'|'departed';serial:number;retryAt:number;missedWindowAnnounced:boolean;spawnedAt:number;expiresAt:number;defeatedAt?:number;home?:{x:number;y:number};attackAt:number;castUntil:number;pattern:number;zones:ColossusZone[]};
export type ColossusResult={spawnedAt:number;defeatedAt?:number;reward:number};
export const createColossus=():ColossusEncounter=>({status:'unseen',serial:0,retryAt:0,missedWindowAnnounced:false,spawnedAt:0,expiresAt:0,attackAt:0,castUntil:0,pattern:0,zones:[]});
export const colossusEnemy=(g:Game)=>g.enemies.find(e=>e.active&&e.colossus&&e.serial===g.court?.colossus.serial);
export const colossusLocation=(g:Game,e=colossusEnemy(g))=>{const home=g.court?.colossus.home??e;return e&&home?(courtRegionAt(home.x,home.y)?.name??'THE PILGRIM ROADS'):'';};
export function colossusSpawnPoint(g:Game){
 const remaining=g.court?.camps.filter(c=>!c.slain)??[],playerRegion=courtRegionAt(g.player.x,g.player.y)?.id;
 const threats=[...remaining,...g.enemies.filter(e=>e.active&&e.court?.role==='captain')];
 // Reuse authored, reachable encounter pockets in a fully cleared district. The
 // nearest eligible pocket limits travel without spawning beside either objective.
 return COURT_SITES.filter(p=>p.region!==playerRegion&&!remaining.some(c=>courtRegionAt(c.x,c.y)?.id===p.region)&&Math.hypot(p.x-g.player.x,p.y-g.player.y)>=COLOSSUS.playerSeparation&&threats.every(c=>Math.hypot(p.x-c.x,p.y-c.y)>=COLOSSUS.captainSeparation)&&insideCourt(p.x,p.y,65)).sort((a,b)=>Math.hypot(a.x-g.player.x,a.y-g.player.y)-Math.hypot(b.x-g.player.x,b.y-g.player.y))[0];
}
const inTerritory=(g:Game,e:Enemy)=>{const home=g.court!.colossus.home??e;return Math.hypot(g.player.x-home.x,g.player.y-home.y)<=COLOSSUS.territory;};
export function colossusResult(g:Game):ColossusResult|undefined{const s=g.court?.colossus;if(!s||s.status==='unseen')return;return {spawnedAt:Math.floor(s.spawnedAt),...(s.defeatedAt!==undefined?{defeatedAt:Math.floor(s.defeatedAt)}:{}),reward:s.status==='defeated'?COLOSSUS.reward:0};}
export function summonColossus(g:Game){const s=g.court?.colossus;if(!s||s.status!=='unseen'||g.court!.stats.captains<COLOSSUS.captains||g.court!.stats.captains>=10||g.time>=COLOSSUS.lastArrival||g.ended)return false;
 // Retry at most twice a second if allocation fails; never fall back to the player.
 if(g.time<s.retryAt)return false;s.retryAt=g.time+.5;
 const point=colossusSpawnPoint(g);if(!point)return false;
 const e=g.spawn('titan');if(!e)return false;Object.assign(e,{x:point.x,y:point.y,hp:COLOSSUS.hp,maxHp:COLOSSUS.hp,colossus:{expiresAt:g.time+COLOSSUS.window},timer:99,windup:0,vx:0,vy:0});Object.assign(s,{status:'active',serial:e.serial,home:{x:point.x,y:point.y},spawnedAt:g.time,expiresAt:g.time+COLOSSUS.window,attackAt:g.time+2.5});g.notice='ASHEN COLOSSUS · '+colossusLocation(g,e)+' · OPTIONAL +1.2M';g.noticeTime=7;return true;
}
// Titan's heavy impacts fracture its basalt shell; this enemy-specific rule leaves both existing stages' foes unchanged.
export const colossusDamage=(g:Game,amount:number,source:string)=>g.monster.id==='titan'&&['launch','shockwave','trample','collision','fissure-impact','fissure'].includes(source)?amount*COLOSSUS.titanImpact:amount;
export function finishColossus(g:Game,e:Enemy){const s=g.court?.colossus;if(!s||!e.colossus||s.serial!==e.serial||s.status!=='active'||g.time>=s.expiresAt)return;s.status='defeated';s.defeatedAt=g.time;s.zones.length=0;g.score.dominance+=COLOSSUS.reward;g.effect(e.x,e.y,'colossus-eruption',140,.8);g.notice='ASHEN COLOSSUS SLAIN · +1.2M';g.noticeTime=4;g.sound('achievement');}
export function dismissColossus(g:Game,cleared=false){const s=g.court?.colossus;if(!s)return;s.zones.length=0;if(s.status!=='active')return;const e=colossusEnemy(g);if(e){e.active=false;g.alive--;g.effect(e.x,e.y,'colossus-eruption',110,.6);}s.status=cleared?'departed':'expired';if(!cleared){g.notice='THE COLOSSUS RETURNS TO ASH';g.noticeTime=3;}}
export function colossusMotion(g:Game,e:Enemy){
 const s=g.court!.colossus,home=s.home??e,engaged=inTerritory(g,e),dx=g.player.x-home.x,dy=g.player.y-home.y,length=Math.hypot(dx,dy),scale=Math.min(1,COLOSSUS.roam/(length||1));
 const returning=!engaged||Math.hypot(e.x-home.x,e.y-home.y)>COLOSSUS.roam+60,goal=returning?home:{x:home.x+dx*scale,y:home.y+dy*scale};
 const stopped=Math.hypot(e.x-goal.x,e.y-goal.y)<12||engaged&&!returning&&Math.hypot(e.x-g.player.x,e.y-g.player.y)<155;
 if(stopped||g.time<s.castUntil)return {dx:0,dy:0,speed:0};
 const v=courtSteer(e.x,e.y,goal.x,goal.y);return {dx:v.x,dy:v.y,speed:55};
}
export function colossusVolley(g:Game,e:Enemy){const s=g.court!.colossus,p=g.player,pattern=s.pattern++%3,angle=g.movementAngle,points:{x:number;y:number}[]=[];
 if(pattern===0){points.push({x:p.x,y:p.y});for(let i=0;i<3;i++){const a=angle+i*Math.PI*2/3;points.push({x:p.x+Math.cos(a)*185,y:p.y+Math.sin(a)*185});}}
 else if(pattern===1){for(let i=0;i<4;i++){const a=angle+Math.PI/4+i*Math.PI/2;points.push({x:p.x+Math.cos(a)*205,y:p.y+Math.sin(a)*205});}}
 else {const ax=Math.cos(angle),ay=Math.sin(angle),speed=g.moving?g.monster.speed*g.releaseStats.move*(g.monster.passive.id==='hunger'?1+Math.min(.15,g.score.recent.length*.003):1):0;for(let i=0;i<4;i++){const forward=speed*(COLOSSUS.warning+i*.22),side=i%2?45:-45;points.push({x:p.x+ax*forward-ay*side,y:p.y+ay*forward+ax*side});}}
 for(const [i,point] of points.entries()){if(s.zones.length>=COLOSSUS.maxZones)break;if(!insideCourt(point.x,point.y,20))continue;const impactAt=g.time+COLOSSUS.warning+i*.22;s.zones.push({...point,radius:COLOSSUS.radius,placedAt:g.time,impactAt,endsAt:impactAt+COLOSSUS.scorch,tickAt:impactAt,erupted:false});}s.castUntil=g.time+COLOSSUS.warning;s.attackAt=g.time+COLOSSUS.cycle*(e.hp<e.maxHp*.4?.87:1);
}
function strike(g:Game,z:ColossusZone,damage:number){if(Math.hypot(g.player.x-z.x,g.player.y-z.y)<z.radius+23)g.hurt(damage);for(const ally of g.servants)if(ally.active&&Math.hypot(ally.x-z.x,ally.y-z.y)<z.radius+14){ally.hp-=damage;ally.hitTimer=.45;if(ally.hp<=0){ally.active=false;ally.target=null;}}}
export function checkColossusArrival(g:Game){const s=g.court?.colossus;if(!s)return;if(s.status==='unseen'){if(g.court!.stats.captains>=COLOSSUS.captains&&g.court!.stats.captains<10&&g.time>=COLOSSUS.lastArrival&&!s.missedWindowAnnounced){s.missedWindowAnnounced=true;g.notice='COLOSSUS WINDOW CLOSED · EIGHT CAPTAINS BEFORE 9:00';g.noticeTime=5;}summonColossus(g);}}
export function updateColossus(g:Game){const s=g.court!.colossus;if(g.ended||g.court!.cleared){dismissColossus(g,true);return;}checkColossusArrival(g);if(s.status!=='active')return;if(g.time>=s.expiresAt){dismissColossus(g);return;}const e=colossusEnemy(g);if(!e){s.zones.length=0;return;}if(inTerritory(g,e)&&g.time>=s.attackAt&&Math.hypot(g.player.x-e.x,g.player.y-e.y)<=COLOSSUS.range)colossusVolley(g,e);
 for(let i=s.zones.length-1;i>=0;i--){const z=s.zones[i];if(g.time>=z.endsAt){s.zones.splice(i,1);continue;}if(!z.erupted&&g.time>=z.impactAt){z.erupted=true;z.tickAt=g.time+.45;strike(g,z,COLOSSUS.impact);g.sound('ultimateImpact');}else if(z.erupted&&g.time>=z.tickAt){z.tickAt=g.time+.45;strike(g,z,COLOSSUS.burn);}if(g.ended){dismissColossus(g,true);return;}}
}
