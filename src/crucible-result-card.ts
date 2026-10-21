import {crucibleGrade} from './crucible-grade.ts';
import {MONSTERS} from './content-monsters.ts';
import {ACHIEVEMENTS} from './content-records.ts';
import {TITLES} from './content-titles.ts';
import type {RunRecord} from './run-code.ts';
// A static, shareable card: the same palette, serif headings and score hierarchy as the event.
export function crucibleResultCard(run:RunRecord,portrait?:HTMLCanvasElement,mastery?:{points:number;rank:string;gained:number}){
 const s=run.crucible!;const card=document.createElement('canvas');card.width=1200;card.height=1000;const c=card.getContext('2d')!,p=run.colors||MONSTERS[run.monsterId||'sovereign'].palette;
 c.fillStyle='#141116';c.fillRect(0,0,1200,1000);c.strokeStyle='#92734e';c.lineWidth=2;c.strokeRect(28,28,1144,944);c.fillStyle=p.secondary;c.fillRect(28,28,1144,10);
 const text=(value:string,x:number,y:number,font:string,color='#eee7d8',width=1060)=>{c.font=font;while(c.measureText(value).width>width&&parseInt(c.font.match(/\d+/)?.[0]||'12')>12){const size=parseInt(c.font.match(/\d+/)![0])-1;c.font=c.font.replace(/\d+px/,size+'px');}c.fillStyle=color;c.fillText(value,x,y);};
 const line=(y:number)=>{c.strokeStyle='#624837';c.beginPath();c.moveTo(64,y);c.lineTo(1136,y);c.stroke();};
 text('MONSTER MASH',64,100,'bold 44px Georgia', '#c9a56c');text((run.testing?'EXHIBITION · ':'')+'STAGE IV · HORDE’S JUDGMENT',64,132,'16px Arial','#b9aaa5');line(153);
 text(run.name,64,217,'bold 52px Georgia');text([run.title,MONSTERS[run.monsterId||'sovereign'].archetype].filter(Boolean).join(' · '),64,252,'21px Arial','#c9a56c');
 text(s.cleared?'THE HORDE HAS ITS LEADER':run.reason==='retired'?'A CLAIM UNFINISHED':'YOUR CLAIM HAS FALLEN',64,299,'bold 25px Georgia','#f3deab');
 text('TOTAL DOMINANCE',64,347,'16px Arial','#c9a56c');text(run.score.toLocaleString(),60,443,'bold 96px Arial',p.accent,780);
 const grade=crucibleGrade(s);text('GRADE '+grade.letter+' · '+grade.points.toFixed(1)+' / 100 PERFORMANCE',64,470,'bold 20px Georgia','#f3deab');
 if(portrait)c.drawImage(portrait,890,290,210,210);
 text(s.difficulty.toUpperCase()+' · '+Math.floor(run.duration/60)+':'+String(run.duration%60).padStart(2,'0'),64,497,'16px Arial','#b9aaa5');line(512);
 const stats=[['RIVAL KILLS',s.champions],['CRYSTALS DESTROYED',s.crystals],['GUARDIANS DEFEATED',s.guardians],['TROOPS SLAIN',s.troops],['CHAMPION FALLS',s.deaths],['BUILD RANKS',s.perks]];
 stats.forEach(([label,n],i)=>{const x=64+i%3*360,y=550+Math.floor(i/3)*90;text(String(label),x,y,'14px Arial','#b9aaa5',330);text(Number(n).toLocaleString(),x,y+42,'bold 32px Arial');});line(716);
 if(mastery){text('CHAMPION MASTERY',64,750,'14px Arial','#c9a56c');text('+'+mastery.gained.toLocaleString()+' POINTS · RANK '+mastery.rank,64,788,'bold 26px Arial','#f3deab');text(mastery.points.toLocaleString()+' total mastery points',64,815,'16px Arial','#b9aaa5');}
 const rewards=[...(run.newTitles||[]).map(id=>TITLES.find(t=>t.id===id)?.name),...(run.newRecords||[]).map(id=>ACHIEVEMENTS.find(a=>a.id===id)?.name)].filter(Boolean);
 text(rewards.length?'EARNED · '+rewards.slice(0,2).join(' · '):'Every battle strengthens your claim.',64,860,'16px Arial','#c9a56c');
 text('Combat '+s.combat.toLocaleString()+' + objectives '+s.objectives.toLocaleString()+' + victory '+s.victory.toLocaleString(),64,899,'16px Arial','#b9aaa5');
 text('RULESET '+run.rules+' · BUILD '+(run.build||'LEGACY'),64,940,'12px Arial','#a19a94');return card;
}
