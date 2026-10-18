import type {Crucible,CrucibleUnit} from './crucible-sim.ts';
export const CRUCIBLE_SIGHT={champion:620,troop:235,base:300};
export type RivalReport={at:number;hp:number;maxHp:number;mana:number;earnedMana:number;kills:number;deaths:number;upgrades:Record<string,number>;augments:string[];crystalHp:number;guards:number};
// Share local sight, not the entire battlefield. Reports are snapshots, never live references.
export class CrucibleIntel{
 host:Crucible;reports:(RivalReport|undefined)[][]=Array.from({length:8},()=>Array(8));next=0;
 constructor(host:Crucible){this.host=host;}
 sources(team:number){return this.host.units.filter(u=>u.active&&u.team===team).map(u=>({unit:u,radius:u.kind==='champion'?CRUCIBLE_SIGHT.champion:u.kind==='captain'||u.kind==='crystal'?CRUCIBLE_SIGHT.base:CRUCIBLE_SIGHT.troop}));}
 visible(team:number,p:{x:number;y:number}){if(team<0)return true;for(const u of this.host.units){if(!u.active||u.team!==team)continue;const r=u.kind==='champion'?CRUCIBLE_SIGHT.champion:u.kind==='captain'||u.kind==='crystal'?CRUCIBLE_SIGHT.base:CRUCIBLE_SIGHT.troop;if(Math.abs(u.x-p.x)<=r&&Math.abs(u.y-p.y)<=r&&(u.x-p.x)**2+(u.y-p.y)**2<=r*r)return true;}return false;}
 sees(team:number,u:CrucibleUnit){return u.team===team||this.visible(team,u);}
 update(force=false){const h=this.host;if(!force&&h.time<this.next)return;this.next=h.time+.25;for(let team=0;team<8;team++)for(let rival=0;rival<8;rival++){const t=h.teams[rival],u=t.champion;if(team!==rival&&(!u.active||!this.visible(team,u)))continue;this.reports[team][rival]={at:h.time,hp:u.hp,maxHp:u.maxHp,mana:t.mana,earnedMana:t.earnedMana,kills:t.kills,deaths:t.deaths,upgrades:{...t.upgrades},augments:[...t.augments],crystalHp:t.crystal.hp,guards:h.guards(rival)};}}
}
