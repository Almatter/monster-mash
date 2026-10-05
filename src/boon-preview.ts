import type {CourtUpgrade} from './stage-two.ts';
const percent=(value:number)=>Number(value.toFixed(1))+'%';
export function boonPreview(id:CourtUpgrade,rank:number){
 const next=Math.min(3,rank+1),label=rank>=3?'MAX · ':'NEXT '+next+'/3 · ',change=(amount:number)=>rank>=3?'+'+percent(amount*rank):'+'+percent(amount*rank)+' → +'+percent(amount*next);
 const bonuses={haste:'Movement bonus '+change(12),power:'Damage bonus '+change(18),reach:'Attack / ability reach '+change(12),tempo:'Basic attack speed '+change(18),duration:'Spell / servant / ward duration '+change(20),vitality:'Maximum health '+change(15)+(rank>=3?'':'. Restore 30% health.')};
 if(id==='recharge'){const current=(1-Math.pow(.9,rank))*100,after=(1-Math.pow(.9,next))*100;return label+'Cooldown reduction '+percent(current)+(rank>=3?'':' → '+percent(after));}
 return label+bonuses[id];
}
