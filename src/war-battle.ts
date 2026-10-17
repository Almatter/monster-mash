export type WarCredit={owner:string;role:'champion'|'sentry'|'infantry'|'arbalist'|'siege'|'summon'|'unknown';unit:string;attack:string};
export type WarBattleEvent={at:number;victim:WarCredit;killer:WarCredit;location:string;level:number;finishingDamage:number;maxHp:number;recent:{credit:WarCredit;damage:number}[]};
export type WarBattleReport={events:WarBattleEvent[];omitted:number};
type Sample={at:number;credit:WarCredit;damage:number};
export const WAR_BATTLE_WINDOW=8;
// Only champion and turret health loss is sampled. Buckets and history are bounded;
// these diagnostics never participate in combat, scoring, targeting or random rolls.
export class WarBattleLog{
 events:WarBattleEvent[]=[];omitted=0;revision=0;
 private damage=new Map<number,Sample[]>();private defeated=new Set<number>();
 hit(key:number,victim:WarCredit,credit:WarCredit,before:number,after:number,maxHp:number,at:number,location:string,level:number){
  if(before<=0||after>=before||this.defeated.has(key))return;
  const amount=Math.min(before,before-Math.max(0,after));if(amount<=0)return;
  let samples=this.damage.get(key)||[];samples=samples.filter(s=>s.at>at-WAR_BATTLE_WINDOW);
  const same=samples.find(s=>Math.floor(s.at*2)===Math.floor(at*2)&&s.credit.owner===credit.owner&&s.credit.role===credit.role&&s.credit.unit===credit.unit&&s.credit.attack===credit.attack);
  if(same){same.at=at;same.damage+=amount;}else samples.push({at,credit:{...credit},damage:amount});
  if(samples.length>128)samples.splice(0,samples.length-128);this.damage.set(key,samples);
  if(after>0)return;
  this.defeated.add(key);this.damage.delete(key);
  const recent:WarBattleEvent['recent']=[];for(const s of samples){const match=recent.find(r=>r.credit.owner===s.credit.owner&&r.credit.role===s.credit.role&&r.credit.unit===s.credit.unit&&r.credit.attack===s.credit.attack);if(match)match.damage+=s.damage;else recent.push({credit:{...s.credit},damage:s.damage});}
  recent.sort((a,b)=>b.damage-a.damage);
  this.events.push({at:Math.round(at*10)/10,victim:{...victim},killer:{...credit},location,level,finishingDamage:amount,maxHp,recent:recent.slice(0,6)});
  if(this.events.length>96){const i=this.events.findIndex(e=>e.victim.role==='sentry');this.events.splice(i<0?0:i,1);this.omitted++;}this.revision++;
 }
 snapshot():WarBattleReport{return {events:this.events.map(e=>({...e,victim:{...e.victim},killer:{...e.killer},recent:e.recent.map(r=>({...r,credit:{...r.credit}}))})),omitted:this.omitted};}
}
