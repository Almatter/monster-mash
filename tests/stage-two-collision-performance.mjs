import {execFileSync} from 'node:child_process';import {mkdir,writeFile} from 'node:fs/promises';import {resolve} from 'node:path';import {pathToFileURL} from 'node:url';import {performance} from 'node:perf_hooks';
const baseline='9647e0649825e9ab33cc01225a6629709a08c849',dir=resolve('test-results/v21-collision-baseline/src');await mkdir(dir,{recursive:true});
for(const f of execFileSync('git',['ls-tree','-r','--name-only',baseline,'src'],{encoding:'utf8'}).trim().split(/\r?\n/).filter(f=>f.endsWith('.ts')))await writeFile(resolve(dir,f.slice(4)),execFileSync('git',['show',baseline+':'+f]));
const versions=(process.env.BENCH_VERSIONS||'v21,current').split(','),results=[];
for(const version of versions){const prefix=version==='v21'?pathToFileURL(dir+'/').href:new URL('../src/',import.meta.url).href,{Game}=await import(prefix+'simulation.ts'),terrain=await import(prefix+'court-map.ts'),COURT_ROCKS=terrain.COURT_ROCKS;
 for(const scenario of ['open','crescent','landmark']){
  const g=new Game(77,{monsterId:'devourer'},1);g.court.initialized=true;g.player.invuln=1e6;g.attack=1e6;g.pressureTime=1e6;g.cooldowns.fill(1e6);g.time=180;g.wave=7;
  const rock=COURT_ROCKS?.find(r=>r.kind==='crescent')??{x:0,y:-3400,angle:0},local=(x,y)=>({x:rock.x+Math.cos(rock.angle)*x-Math.sin(rock.angle)*y,y:rock.y+Math.sin(rock.angle)*x+Math.cos(rock.angle)*y});
  Object.assign(g.player,version==='current'&&scenario!=='open'?{x:rock.x,y:rock.y-600}:scenario==='crescent'?local(0,130):scenario==='landmark'?{x:6615,y:-3940}:{x:200,y:300});
  for(let n=0;n<200;n++){const e=g.spawn('thrall'),t=.25+(n%40)/80,angle=n*2.399,point=version==='current'&&scenario!=='open'?{x:rock.x+(n%20-10)*3,y:rock.y+235}:scenario==='crescent'?local(-188+191*t-10,-123-32*t-63):scenario==='landmark'?{x:6615+(n%20-10)*.6,y:-3627}:{x:200+Math.cos(angle)*500,y:300+Math.sin(angle)*500};Object.assign(e,point,{hp:1e9,maxHp:1e9});}
  g.spawn=()=>undefined;g.rebuildGrid();const costs=[];for(let frame=0;frame<90;frame++){const at=performance.now();g.update(1/60,{x:0,y:0,aimX:g.player.x+400,aimY:g.player.y,aiming:true});costs.push(performance.now()-at);}
  costs.sort((a,b)=>a-b);const row={version,scenario,enemies:g.alive,meanMs:+(costs.reduce((a,b)=>a+b,0)/costs.length).toFixed(3),p95Ms:+costs[Math.floor(costs.length*.95)].toFixed(3),maxMs:+costs.at(-1).toFixed(3)};results.push(row);console.log(JSON.stringify(row));
 }
}
await writeFile(process.env.BENCH_REPORT||'test-results/stage2-v23-collision-performance.json',JSON.stringify(results,null,2));
