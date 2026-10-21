import {CRUCIBLE_WAR,type Crucible,type CruciblePurchase,type CrucibleUnit} from './crucible-sim.ts';
import {CRUCIBLE_BUILD_LIMITS} from './crucible-augments.ts';

type Stat=Exclude<CruciblePurchase,'mend'>;
type Counter={stat:Stat;rank:number;score:number};
type State={scanAt:number;adaptAt:number;swapAt:number;counters:Counter[];pushTeam:number;pushUntil:number;withdrawUntil:number;stage:'none'|'gather'|'escort';siegeTeam:number;stageUntil:number;structure:number;lastHp:number;progressAt:number;wantSiege:boolean};
export class CrucibleStrategy{
 host:Crucible;
 states:State[]=Array.from({length:8},()=>({scanAt:0,adaptAt:0,swapAt:0,counters:[],pushTeam:-1,pushUntil:0,withdrawUntil:0,stage:'none',siegeTeam:-1,stageUntil:0,structure:0,lastHp:0,progressAt:0,wantSiege:false}));
 constructor(host:Crucible){this.host=host;}
 enabled(team:number){return team!==this.host.controlled&&['hard','hell'].includes(this.host.difficulty);}
 private army(team:number,enemy:number){const c=this.host.teams[enemy].crystal;return this.host.units.filter(u=>u.active&&u.team===team&&['infantry','ranged'].includes(u.kind)&&!u.servant&&Math.hypot(u.x-c.x,u.y-c.y)<900);}
 private objective(team:number,enemy:number){const h=this.host,t=h.teams[enemy],u=h.teams[team].champion;
  return t.guards.filter(g=>g.active&&h.intel.visible(team,g)).sort((a,b)=>Math.hypot(a.x-u.x,a.y-u.y)-Math.hypot(b.x-u.x,b.y-u.y))[0]||(t.crystal.active&&h.intel.visible(team,t.crystal)?t.crystal:undefined);
 }
 private abandon(team:number){const s=this.states[team];if(s.pushTeam>=0)s.withdrawUntil=this.host.time+4;s.pushTeam=-1;s.pushUntil=0;}
 update(team:number){const h=this.host,t=h.teams[team],u=t.champion,s=this.states[team];if(!this.enabled(team)||t.eliminated||!t.crystal.active){s.pushTeam=-1;s.withdrawUntil=0;s.stage='none';s.wantSiege=false;return;}
  if(h.time<s.scanAt)return;s.scanAt=h.time+.4;
  const danger=!!h.siegeThreat(team)||h.units.some(v=>v.active&&v.team!==team&&v.kind==='champion'&&Math.hypot(v.x-t.crystal.x,v.y-t.crystal.y)<h.baseDomain(team)&&h.intel.visible(team,v));
  if(s.pushTeam>=0){const enemy=h.teams[s.pushTeam],thirdParty=h.units.some(v=>v.active&&v.kind==='champion'&&v.team!==team&&v.team!==s.pushTeam&&Math.hypot(v.x-u.x,v.y-u.y)<300&&h.intel.visible(team,v));
   if(!u.active||!enemy.crystal.active||enemy.champion.active||h.time>=s.pushUntil||u.hp<u.maxHp*.3||danger||thirdParty||this.army(team,s.pushTeam).length<h.siegeRequired())this.abandon(team);
  }
  if(s.pushTeam<0&&s.withdrawUntil<=h.time&&u.active&&u.hp>=u.maxHp*(h.difficulty==='hell'?.4:.5)&&!danger&&h.time>=24){
   // A lane champion can exploit its existing wave, but cannot issue a remote
   // army order. Death timers are public; hidden opponent builds/HP are not read.
   const enemy=t.armyGoal,foe=h.teams[enemy];
   if(foe&&enemy!==team&&!foe.eliminated&&foe.crystal.active&&!foe.champion.active&&foe.respawnAt>h.time){
    const d=Math.hypot(u.x-foe.crystal.x,u.y-foe.crystal.y),wave=this.army(team,enemy).sort((a,b)=>Math.hypot(a.x-foe.crystal.x,a.y-foe.crystal.y)-Math.hypot(b.x-foe.crystal.x,b.y-foe.crystal.y));
    const required=h.siegeRequired(),margin=h.difficulty==='hell'?1.5:3,speed=Math.max(1,u.speed*h.combat.actors[team].brain.releaseStats.move),walk=Math.max(0,d-h.baseDomain(enemy)*.8)/speed;
    const front=wave[required-1],arrival=front?Math.max(0,Math.hypot(front.x-foe.crystal.x,front.y-foe.crystal.y)-h.baseDomain(enemy))/Math.max(1,front.speed*1.35):Infinity;
    if(d<(h.difficulty==='hell'?1200:850)&&wave.length>=required&&foe.respawnAt-h.time>Math.max(walk,arrival)+margin+3){s.pushTeam=enemy;s.pushUntil=foe.respawnAt-margin;t.shopping=false;t.goal=enemy;}
   }
  }
  if(h.difficulty!=='hell')return;
  if(h.time>=s.adaptAt){s.adaptAt=h.time+8;s.counters=this.counterPlan(team);}
  const enemy=t.armyGoal,foe=h.teams[enemy];if(foe&&!foe.eliminated&&foe.crystal.active&&enemy!==team){
   const visible=this.objective(team,enemy);
   if(visible&&(s.structure!==visible.id||visible.hp<s.lastHp-visible.maxHp*.08)){s.progressAt=h.time;s.structure=visible.id;s.lastHp=visible.hp;}
   if(s.siegeTeam!==enemy){s.siegeTeam=enemy;s.progressAt=h.time;s.structure=visible?.id||0;s.lastHp=visible?.hp||0;}
   // A stalled observed push or repeated losses in our own army can justify a
   // siege investment. No unseen structure health is used to detect progress.
   const stalled=!!visible&&h.time-s.progressAt>=20,thin=h.time>180&&h.units.filter(v=>v.active&&v.team===team&&['infantry','ranged'].includes(v.kind)&&!v.servant).length<4;
   s.wantSiege=h.time>=90&&(stalled||thin||s.stage==='gather')&&h.statRanks(team)>=4&&t.augments.length>=1&&!t.siege?.active&&h.time>=t.siegeReadyAt;
  }else{s.wantSiege=false;s.stage='none';}
  if(danger){if(s.stage!=='none')s.stage='none';return;}
  if(foe?.crystal.active&&!foe.eliminated&&enemy!==team&&!h.shopLocation(team)&&s.stage==='none'&&t.siege?.active){const home=Math.hypot(t.siege.x-t.crystal.x,t.siege.y-t.crystal.y)<h.baseDomain(team)+150;s.stage=home?'gather':'escort';s.stageUntil=h.time+(home?8:45);if(home&&h.orders.states[team].mode!=='defend')h.orders.set(team,'defend');}
  if(s.stage==='gather'){
   if(!t.siege?.active){s.stage='none';if(!h.shopLocation(team)&&h.orders.states[team].mode==='defend')h.orders.set(team,'automatic');return;}
   if(!t.crystal.active||!foe?.crystal.active){s.stage='none';return;}
   const gathered=h.units.filter(v=>v.active&&v.team===team&&['infantry','ranged'].includes(v.kind)&&!v.servant&&Math.hypot(v.x-t.crystal.x,v.y-t.crystal.y)<h.baseDomain(team)).length;
   if(t.siege?.active&&(gathered>=Math.min(6,h.density)||h.time>=s.stageUntil)&&!h.shopLocation(team)){h.orders.release(team,s.siegeTeam);s.stage='escort';s.stageUntil=h.time+45;t.shopping=false;}
  }else if(s.stage==='escort'&&(!t.siege?.active||!foe?.crystal.active||h.time>=s.stageUntil||u.hp<u.maxHp*.35)){s.stage='none';if(u.active&&u.hp<u.maxHp*.35)u.retreat=true;}
 }
 reserve(team:number){return Math.min(120,Math.min(...[0,1,2].map(slot=>this.host.abilityCost(team,slot)))*2);}
 saving(team:number,reserve=this.reserve(team)){const h=this.host,t=h.teams[team],s=this.states[team];if(!this.enabled(team)||h.difficulty!=='hell')return false;
  if(s.wantSiege&&t.mana>=CRUCIBLE_WAR.siegeCost*.65&&t.mana<CRUCIBLE_WAR.siegeCost+reserve)return true;
  const desired=s.counters.find(c=>(t.upgrades[c.stat]||0)<c.rank);if(!desired||h.statRanks(team)>=CRUCIBLE_BUILD_LIMITS.stats)return false;
  const cost=h.shopCost(team,desired.stat)+reserve;return t.mana>=cost*.65&&t.mana<cost;
 }
 buySiege(team:number,reserve:number){const h=this.host,t=h.teams[team];return h.difficulty==='hell'&&this.states[team].wantSiege&&t.mana>=CRUCIBLE_WAR.siegeCost+reserve&&h.purchaseSiege(team);}
 managesOrders(team:number){return this.enabled(team)&&this.states[team].stage==='gather';}
 committed(team:number){const s=this.states[team];return this.enabled(team)&&(s.pushTeam>=0||s.stage==='escort'||s.withdrawUntil>this.host.time);}
 goal(team:number):{x:number;y:number}|undefined{if(!this.enabled(team))return undefined;const h=this.host,t=h.teams[team],u=t.champion,s=this.states[team];
  if(s.pushTeam>=0&&h.time>=s.pushUntil)this.abandon(team);
  if(s.withdrawUntil>h.time)return h.rally(team);
  if(s.stage==='gather')return t.crystal;
  const enemy=s.pushTeam>=0?s.pushTeam:s.stage==='escort'?s.siegeTeam:-1;if(enemy<0)return undefined;
  const c=h.teams[enemy].crystal,target=this.objective(team,enemy),support=h.siegeSupport(team,enemy)>=h.siegeRequired()||h.teams[enemy].breaches[team]>h.time;
  if(support&&target){const inside=Math.hypot(u.x-c.x,u.y-c.y)<h.baseDomain(enemy)*.9;return inside&&Math.hypot(u.x-target.x,u.y-target.y)<=u.range*.8?u:target;}
  if(s.stage==='escort'&&t.siege?.active){const beast=t.siege,d=Math.hypot(c.x-beast.x,c.y-beast.y)||1;return this.outside(team,enemy,{x:beast.x+(c.x-beast.x)/d*45,y:beast.y+(c.y-beast.y)/d*45});}
  return this.outside(team,enemy,h.escort(team,enemy));
 }
 private outside(team:number,enemy:number,p:{x:number;y:number}){const c=this.host.teams[enemy].crystal,u=this.host.teams[team].champion,r=this.host.baseDomain(enemy)+35;let dx=p.x-c.x,dy=p.y-c.y,d=Math.hypot(dx,dy);if(d>=r)return p;if(d<1){dx=u.x-c.x||1;dy=u.y-c.y;d=Math.hypot(dx,dy);}return {x:c.x+dx/d*r,y:c.y+dy/d*r};}
 target(team:number):CrucibleUnit|null|undefined{if(!this.enabled(team))return undefined;const h=this.host,s=this.states[team],u=h.teams[team].champion,enemy=s.pushTeam>=0?s.pushTeam:s.stage==='escort'?s.siegeTeam:-1;
  if(enemy<0)return undefined;
  const c=h.teams[enemy].crystal,front=this.army(team,enemy),view=h.combat.attention;
  const threat=h.units.find(v=>v.active&&v.kind==='champion'&&v.team!==team&&v.invuln<=0&&view.inView(team,v)&&(Math.hypot(v.x-u.x,v.y-u.y)<260||!!h.teams[team].siege?.active&&Math.hypot(v.x-h.teams[team].siege!.x,v.y-h.teams[team].siege!.y)<300));if(threat)return threat;
  const blockers=h.units.filter(v=>v.active&&v.team!==team&&['infantry','ranged'].includes(v.kind)&&view.inView(team,v)&&Math.hypot(v.x-u.x,v.y-u.y)<450&&front.some(a=>Math.hypot(a.x-v.x,a.y-v.y)<220)).sort((a,b)=>Math.hypot(a.x-u.x,a.y-u.y)-Math.hypot(b.x-u.x,b.y-u.y));
  if(blockers[0])return blockers[0];
  if(h.siegeSupport(team,enemy)>=h.siegeRequired()||h.teams[enemy].breaches[team]>h.time){const objective=this.objective(team,enemy);if(objective&&view.inView(team,objective))return objective;}
  // Keep clearing/escorting the wave instead of randomly farming another lane.
  return null;
 }
 counterPlan(team:number):Counter[]{const h=this.host;if(h.difficulty!=='hell')return [];const own=h.teams[team];
  const reports=h.intel.reports[team].map((r,i)=>({r,i})).filter(v=>v.i!==team&&v.r&&h.time-v.r.at<=45&&!h.teams[v.i].eliminated).sort((a,b)=>Number(b.i===own.goal)-Number(a.i===own.goal)||b.r!.at-a.r!.at);
  const observed=reports[0];if(!observed?.r)return [];const r=observed.r,id=h.teams[observed.i].monster,up=r.upgrades,choices:Counter[]=[];
  const sustain=(up.glamour||0)*2+(r.augments.includes('bastion')?3:0)+(r.augments.includes('brawler')?2:0)+(['hag','reaper','lycanthrope'].includes(id)?2:0);
  if(sustain>=2)choices.push({stat:'blight',rank:3,score:sustain+2});
  const offense=(up.might||0)*1.5+(up.haste||0)+(up.tempo||0);if(offense>=3){choices.push({stat:'armor',rank:3,score:offense});choices.push({stat:'vitality',rank:3,score:offense-1});}
  if((up.vitality||0)>=3||(up.armor||0)>=2)choices.push({stat:'might',rank:3,score:4+(up.armor||0)});
  if(id==='hag')choices.push({stat:'antivenom',rank:2,score:5});
  if(['titan','lycanthrope'].includes(id)&&(up.duration||0)>0){choices.push({stat:'resolve',rank:2,score:5});choices.push({stat:'anchor',rank:2,score:4});}
  if((up.legion||0)>=2||r.brood>=2||r.veterans>=2)choices.push({stat:'haste',rank:3,score:5});
  return choices.sort((a,b)=>b.score-a.score).slice(0,2);
 }
 buyCounter(team:number,reserve:number){const h=this.host,t=h.teams[team],s=this.states[team];if(h.difficulty!=='hell'||!this.enabled(team)||h.shopLocation(team))return false;
  const desired=s.counters.find(c=>(t.upgrades[c.stat]||0)<c.rank);if(!desired)return false;
  if(h.statRanks(team)<CRUCIBLE_BUILD_LIMITS.stats)return t.mana>=h.shopCost(team,desired.stat)+reserve&&h.purchase(team,desired.stat);
  if(h.time<s.swapAt)return false;
  const protectedStats=new Set(s.counters.map(c=>c.stat)),sell=(['reach','duration','legion','swiftness','tempo','glamour','antivenom','anchor','resolve','blight','might','haste','armor','vitality'] as Stat[]).find(stat=>t.upgrades[stat]>0&&!protectedStats.has(stat)&&(stat!=='vitality'||t.champion.hp>=t.champion.maxHp*.8)&&t.mana+h.sellValue(team,stat)>=h.shopCost(team,desired.stat)+reserve);
  if(!sell)return false;
  if(!h.sell(team,sell))return false;s.swapAt=h.time+12;return h.purchase(team,desired.stat);
 }
}
