import {Game} from '../src/simulation.ts';
import {pathToFileURL} from 'node:url';
import {writeFile} from 'node:fs/promises';
export function blindDiscovery(id,seed,heading,style='straight'){
 const g=new Game(seed,{monsterId:id},1);g.seedOpening();
 const scale=Math.max(.45,Math.min(842/1200,390/760));
 let steeringSeed=(seed^0x51c3)>>>0,offset=0;
 for(let frame=0;frame<120*30&&!g.ended;frame++){
  if(style==='wandering'&&frame%60===0){steeringSeed=(Math.imul(1664525,steeringSeed)+1013904223)>>>0;offset+=(steeringSeed/4294967296-.5)*.65;offset=Math.max(-.7,Math.min(.7,offset));}
  const angle=heading+offset+(style==='curved'?Math.sin(frame/30*.6)*.3:0);
  g.update(1/30,{x:Math.cos(angle),y:Math.sin(angle),aimX:0,aimY:0,aiming:false});
  const visible=g.enemies.some(e=>e.active&&e.court?.role==='captain'&&Math.abs(e.x-g.player.x)<842/scale/2-57&&Math.abs(e.y-g.player.y)<390/scale/2-57);
  if(visible)return g.time;
 }
 return Infinity;
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const rows=[];
 for(const id of ['devourer','titan','sovereign','calamity','overlord'])for(const seed of [77,123,444])for(let h=0;h<16;h++)for(const style of ['straight','curved','wandering'])rows.push({id,seed,heading:h,style,seconds:blindDiscovery(id,seed,h*Math.PI/8,style)});
 if(rows.some(r=>!Number.isFinite(r.seconds)||r.seconds>120))throw Error('Blind opening exceeded two minutes');
 const sorted=rows.map(r=>r.seconds).sort((a,b)=>a-b),summary={runs:rows.length,mean:sorted.reduce((n,s)=>n+s,0)/rows.length,p95:sorted[Math.floor(sorted.length*.95)],max:sorted.at(-1),allWithinTwoMinutes:true};
 await writeFile('test-results/stage2-v20-discovery.json',JSON.stringify({summary,rows},null,2));console.log(summary);
}
