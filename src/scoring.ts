import { FEATS, type FeatContext } from './data.ts';
export class Score {
 dominance=0; kills=0; carnage=1; peak=1; elites=0; titans=0; largestMulti=0;
 feats:Record<string,number>={}; timers:Record<string,number>={};
 quiet=0; noHitKills=0; recent:number[]=[];
 update(dt:number,time:number) {
  this.quiet+=dt;
  if(this.quiet>1.6) this.carnage=Math.max(1,this.carnage-dt*.24);
  while(this.recent.length && this.recent[0]<time-5) this.recent.shift();
 }
 kill(base:number,kind:string,time:number) {
  this.kills++; this.noHitKills++; this.quiet=0; this.recent.push(time);
  this.carnage=Math.min(5,this.carnage+.018); this.peak=Math.max(this.peak,this.carnage);
  this.dominance+=Math.round(base*this.carnage);
  if(kind==='elite') this.elites++;
  if(kind==='titan') this.titans++;
 }
 multikill(count:number) {
  this.largestMulti=Math.max(this.largestMulti,count);
  if(count>=5) this.dominance+=count*5;
 }
 evaluate(time:number,extra:Partial<FeatContext>) {
  const context:FeatContext={recentKills:this.recent.length,noHitKills:this.noHitKills,overkill:0,chain:0,eliteDevoured:0,multi:0,...extra};
  const earned:string[]=[];
  for(const feat of FEATS) if(context[feat.metric]>=feat.threshold && time>=(this.timers[feat.id]??-1)) {
   this.timers[feat.id]=time+feat.cooldown; this.feats[feat.id]=(this.feats[feat.id]??0)+1;
   this.dominance+=feat.bonus; earned.push(`${feat.name} +${feat.bonus.toLocaleString()}`);
  }
  return earned;
 }
}
