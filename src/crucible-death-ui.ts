import type {DeathReport} from './crucible-deaths.ts';
export function deathBreakdown(report:DeathReport){
 const box=document.createElement('div');box.className='death-breakdown';
 const summary=document.createElement('p');summary.textContent='Final blow: '+report.finalBlow+'. Last '+report.seconds.toFixed(1)+'s: '+Math.round(report.health).toLocaleString()+' health + '+Math.round(report.shield).toLocaleString()+' ward damage.';box.append(summary);
 const list=document.createElement('dl');for(const hit of report.sources){const row=document.createElement('div'),name=document.createElement('dt'),amount=document.createElement('dd');name.textContent=hit.source+' · '+hit.kind;amount.textContent=Math.round(hit.health).toLocaleString()+' HP'+(hit.shield>0?' + '+Math.round(hit.shield).toLocaleString()+' ward':'');row.append(name,amount);list.append(row);}box.append(list);
 if(report.effects.length){const effects=document.createElement('p');effects.textContent='At death: '+report.effects.join(' · ');box.append(effects);}
 const note=document.createElement('small');note.textContent='Actual damage after defenses. Healing during the window can make totals exceed maximum health. This is a damage report, not the rival’s current build.';box.append(note);return box;
}
export function deathHistory(reports:DeathReport[],host:HTMLElement){
 host.replaceChildren();if(!reports.length){const p=document.createElement('p');p.textContent='No champion deaths recorded.';host.append(p);return;}
 for(const r of [...reports].reverse()){const detail=document.createElement('details'),summary=document.createElement('summary');summary.textContent=Math.floor(r.at/60)+':'+String(Math.floor(r.at%60)).padStart(2,'0')+' · '+r.victim;detail.append(summary,deathBreakdown(r));host.append(detail);}
}
