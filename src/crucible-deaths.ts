export type DeathHit={at:number;source:string;kind:string;health:number;shield:number};
export type DeathReport={at:number;team:number;victim:string;finalBlow:string;seconds:number;health:number;shield:number;effects:string[];sources:DeathHit[]};
// Champion-only rolling histories. Quarter-second groups keep beams/poison cheap.
export class CrucibleDeaths{
 lastSources:string[]=Array(8).fill('');hits:DeathHit[][]=Array.from({length:8},()=>[]);reports:DeathReport[]=[];
 record(team:number,at:number,source:string,kind:string,health:number,shield:number){
  if(health+shield<=0)return;this.lastSources[team]=source;const rows=this.hits[team];while(rows.length&&rows[0].at<at-8)rows.shift();
  const last=rows.find(v=>Math.floor(v.at*4)===Math.floor(at*4)&&v.source===source&&v.kind===kind);
  if(last){last.health+=health;last.shield+=shield;}else rows.push({at,source,kind,health,shield});
  if(rows.length>160)rows.splice(0,rows.length-160);
 }
 clear(team:number){this.hits[team]=[];this.lastSources[team]='';}
 finish(team:number,at:number,victim:string,finalBlow:string,effects:string[]=[]){
  const rows=this.hits[team].filter(v=>v.at>=at-8),sources:DeathHit[]=[];
  for(const hit of rows){let row=sources.find(v=>v.source===hit.source&&v.kind===hit.kind);if(!row){row={...hit,health:0,shield:0};sources.push(row);}row.health+=hit.health;row.shield+=hit.shield;}
  sources.sort((a,b)=>b.health+b.shield-a.health-a.shield);
  const report={at,team,victim,finalBlow,seconds:Math.min(8,Math.max(0,at-(rows[0]?.at??at))),health:sources.reduce((n,v)=>n+v.health,0),shield:sources.reduce((n,v)=>n+v.shield,0),effects:[...effects],sources};
  this.reports.push(report);if(this.reports.length>64)this.reports.shift();this.clear(team);return report;
 }
}
export function damageDetail(source:string,basic:string,powers:{id:string;name:string;effect:string}[]){
 if(['direct','scythe','hagvenom','collision'].includes(source))return basic;
 const names:Record<string,string>={hagpoison:'Poison',haghex:'Hex explosion',hagfrenzy:'Unmasked hex',hagflight:'Briarflight bomb',hagignite:'Ignited Miasma',controlled:'Controlled minion',summoned:'Summoned minion'};
 return names[source]||powers.find(p=>p.id===source||p.effect===source)?.name||(source==='ultimate'?powers[3]?.name:undefined)||source.replace(/([a-z])([A-Z])/g,'$1 $2');
}
