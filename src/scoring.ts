import { FEATS, type FeatContext } from './data.ts';
import {SCORING,type Metrics} from './content-records.ts';
export class Score {
 dominance=0; kills=0; carnage=1; peak=1; elites=0; titans=0; largestMulti=0;
 feats:Record<string,number>={}; timers:Record<string,number>={};
 quiet=0; noHitKills=0; recent:number[]=[];
 sources:Record<string,number>={};featBest:Record<string,number>={};bestRecent=0;bestNoHit=0;maxStreak=0;currentMaxStreak=0;
 metrics():Metrics{return {kills:this.kills,recent:this.bestRecent,titans:this.titans,noHit:this.bestNoHit,collisions:this.sources.collision||0,devoured:this.sources.devour||0,multi:this.largestMulti,controlled:this.sources.controlled||0,summoned:this.sources.summoned||0,chain:this.sources.chain||0,maxCarnageSeconds:this.maxStreak};}
 update(dt:number,time:number) {
  this.quiet+=dt;
  if(this.quiet>SCORING.decayDelay)this.carnage=Math.max(1,this.carnage-dt*SCORING.decayRate);
  this.currentMaxStreak=this.carnage>=5?this.currentMaxStreak+dt:0;this.maxStreak=Math.max(this.maxStreak,this.currentMaxStreak);
  while(this.recent.length && this.recent[0]<time-5) this.recent.shift();
 }
 kill(base:number,kind:string,time:number,source='direct') {
  this.kills++; this.noHitKills++; this.quiet=0; this.recent.push(time);
  this.carnage=Math.min(SCORING.maxCarnage,this.carnage+SCORING.killCarnage);this.peak=Math.max(this.peak,this.carnage);this.sources[source]=(this.sources[source]||0)+1;this.bestRecent=Math.max(this.bestRecent,this.recent.length);this.bestNoHit=Math.max(this.bestNoHit,this.noHitKills);
  this.dominance+=Math.round(base*this.carnage);
  if(kind==='elite') this.elites++;
  if(kind==='titan') this.titans++;
 }
 multikill(count:number) {
  this.largestMulti=Math.max(this.largestMulti,count);
  if(count>=SCORING.multiMinimum)this.dominance+=count*SCORING.multiBonus;
 }
 evaluate(time:number,extra:Partial<FeatContext>) {
  const context:FeatContext={recentKills:this.recent.length,noHitKills:this.noHitKills,overkill:0,chain:0,eliteDevoured:0,multi:0,...extra};
  const earned:string[]=[];
  for(const feat of FEATS) if(context[feat.metric]>=feat.threshold && time>=(this.timers[feat.id]??-1)) {
   this.timers[feat.id]=time+feat.cooldown; this.feats[feat.id]=(this.feats[feat.id]??0)+1;
   this.dominance+=feat.bonus;this.featBest[feat.id]=Math.max(this.featBest[feat.id]||0,context[feat.metric]);earned.push(`RUN FEAT · ${feat.name} · ${context[feat.metric]} / ${feat.threshold} · +${feat.bonus.toLocaleString()}`);
  }
  return earned;
 }
}
