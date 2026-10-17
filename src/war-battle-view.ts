import type {WarBattleEvent,WarBattleReport,WarCredit} from './war-battle.ts';
import {MONSTERS} from './content-monsters.ts';
const time=(n:number)=>Math.floor(n/60).toString().padStart(2,'0')+':'+Math.floor(n%60).toString().padStart(2,'0');
export function battleActor(c:WarCredit){const owner=MONSTERS[c.owner]?.archetype;return c.role==='champion'?owner||'Champion':c.role==='sentry'?c.unit+(owner?' ('+owner+')':''):owner?owner+' · '+c.unit:c.unit;}
export function battleLine(e:WarBattleEvent){return time(e.at)+' · '+battleActor(e.killer)+' '+(e.victim.role==='sentry'?'destroyed ':'defeated ')+battleActor(e.victim)+' — '+e.killer.attack;}
const el=(tag:string,text='')=>{const e=document.createElement(tag);e.textContent=text;return e;};
export function battleReportView(report:WarBattleReport,id:string){
 const details=document.createElement('details');details.id=id;details.className='war-battle-report result-breakdown';details.append(el('summary','Battle report · '+report.events.filter(e=>e.victim.role==='champion').length+' champion defeats'));
 details.append(el('p','Finishing blows are listed separately from health lost in the preceding eight seconds. Recent damage can exceed a health bar when a champion heals.'));
 if(!report.events.length)details.append(el('p','No champion defeats or destroyed turrets recorded yet.'));
 if(report.omitted)details.append(el('p',report.omitted+' earlier turret losses omitted. Champion defeats are retained.'));
 for(const event of [...report.events].reverse()){
  const row=el('details');row.className='war-battle-entry';row.append(el('summary',battleLine(event)),el('p',event.location+' · War Level '+event.level+' · Finishing hit: '+Math.round(event.finishingDamage).toLocaleString()+' health'));
  row.append(el('p','Recent damage · last 8 seconds (largest sources):'));const list=el('ul');for(const r of event.recent)list.append(el('li',(r.damage/Math.max(1,event.maxHp)*100<.1?'<0.1':(r.damage/Math.max(1,event.maxHp)*100).toFixed(1))+'% max HP · '+battleActor(r.credit)+' — '+r.credit.attack));row.append(list);details.append(row);
 }
 const download=el('button','EXPORT BATTLE REPORT') as HTMLButtonElement;download.type='button';download.onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify({...report,readable:report.events.map(e=>battleLine(e)+' · '+e.location)},null,2)],{type:'application/json'})),link=document.createElement('a');link.href=url;link.download='monster-mash-battle-report.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};details.append(download);return details;
}
export function resultBattleReport(report?:WarBattleReport){document.getElementById('resultBattleReport')?.remove();if(report)document.getElementById('resultHighlight')?.after(battleReportView(report,'resultBattleReport'));}
