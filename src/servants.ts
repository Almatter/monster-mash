import type {Game,Enemy} from './simulation.ts';
export type Servant={active:boolean;x:number;y:number;life:number;source:'controlled'|'summoned';timer:number;search:number;target:Enemy|null;serial:number};
export function createServants():Servant[]{return Array.from({length:32},()=>({active:false,x:0,y:0,life:0,source:'summoned',timer:0,search:0,target:null,serial:0}));}
export function addServant(g:Game,x:number,y:number,source:Servant['source'],life=12){const s=g.servants.find(s=>!s.active);if(!s)return false;Object.assign(s,{active:true,x,y,source,life,timer:0,search:0,target:null,serial:0});return true;}
export function dominate(g:Game,radius:number,count:number){let converted=0;g.nearby(g.player.x,g.player.y,radius,e=>{if(converted>=count||!['thrall','hound','wing'].includes(e.kind)||Math.hypot(e.x-g.player.x,e.y-g.player.y)>radius)return;if(addServant(g,e.x,e.y,'controlled')){e.active=false;g.alive--;converted++;}});return converted;}
export function corrupt(g:Game,radius:number,duration=8){g.nearby(g.player.x,g.player.y,radius+65,e=>{if(Math.hypot(e.x-g.player.x,e.y-g.player.y)<radius)e.corruptUntil=g.time+duration;});}
export function updateServants(g:Game,dt:number){
 for(const s of g.servants){if(!s.active)continue;s.life-=dt;if(s.life<=0){s.active=false;s.target=null;continue;}s.timer-=dt;s.search-=dt;
  if(s.search<=0){s.search=.25;s.target=null;let best=360;g.nearby(s.x,s.y,360,e=>{const d=Math.hypot(e.x-s.x,e.y-s.y);if(d<best){best=d;s.target=e;s.serial=e.serial;}});}
  const target=s.target?.active&&s.target.serial===s.serial?s.target:null,dx=(target?.x??g.player.x)-s.x,dy=(target?.y??g.player.y)-s.y,d=Math.hypot(dx,dy)||1;s.x+=dx/d*180*dt;s.y+=dy/d*180*dt;
  if(target&&d<75&&s.timer<=0){s.timer=.7;g.area(s.x,s.y,65,95,s.source);g.effect(s.x,s.y,'servant',65,.2);}
 }
 g.corruptionTick-=dt;if(g.corruptionTick<=0){g.corruptionTick=.5;for(const e of g.enemies)if(e.active&&(e.corruptUntil||0)>g.time)g.damage(e,18*g.powerScale(),'dot');}
 // An iterative capped queue prevents recursive chain overflows and frame spikes.
 let chainKills=0;for(let count=0;count<16&&g.chains.length;count++){const b=g.chains.shift()!;g.nearby(b.x,b.y,150,e=>{if(Math.hypot(e.x-b.x,e.y-b.y)<105){e.corruptUntil=g.time+5;if(g.damage(e,65*g.powerScale(),'chain'))chainKills++;}});g.effect(b.x,b.y,'corruption',105,.35);}if(chainKills)g.resolveFeats({corruption:chainKills});
}
