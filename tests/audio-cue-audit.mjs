import {Game} from '../src/simulation.ts';
import {CUES} from '../src/content-audio.ts';
for(const id of ['sovereign','overlord','calamity','titan','devourer']){
 const g=new Game(77,{monsterId:id}),requested={},accepted={},last=new Map();
 g.sound=kind=>{requested[kind]=(requested[kind]||0)+1;const cue=CUES[kind],key=kind.startsWith('enemyDeath.')?'enemyDeath':kind;if(cue&&g.time-(last.get(key)??-Infinity)>=cue.gap){last.set(key,g.time);accepted[kind]=(accepted[kind]||0)+1;}};
 g.seedOpening();let target=null;
 for(let f=0;f<60*180&&!g.ended;f++){
  if(f%15===0){let d=Infinity;target=null;for(const e of g.enemies)if(e.active){const next=Math.hypot(e.x-g.player.x,e.y-g.player.y);if(next<d){d=next;target=e;}}}
  const angle=g.time*.17;let x=Math.cos(angle),y=Math.sin(angle);
  if(target&&!g.monster.basic.ranged){const dx=target.x-g.player.x,dy=target.y-g.player.y,d=Math.hypot(dx,dy)||1;if(d>100){x=dx/d;y=dy/d;}}
  g.update(1/60,{x,y,aimX:target?.x??g.player.x+400,aimY:target?.y??g.player.y,aiming:true});
  if(f%12===0)for(let i=0;i<4;i++){if(g.powers[i].effect==='devour'&&g.player.hp>g.player.maxHp*.8)continue;g.cast(i);}
 }
 console.log(JSON.stringify({id,seconds:Math.round(g.time),kills:g.score.kills,frequent:Object.entries(accepted).sort((a,b)=>b[1]-a[1]).slice(0,6),requestedDeaths:Object.entries(requested).filter(([k])=>k.includes('Death')).reduce((n,[,v])=>n+v,0)}));
}
