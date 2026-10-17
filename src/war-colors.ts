import type {WarGame} from './stage-four.ts';
export const WAR_BANNERS:Record<string,{color:string;letter:string}>={
 hag:{color:'#f34cda',letter:'H'},lycanthrope:{color:'#32dcff',letter:'L'},
 overlord:{color:'#a378ff',letter:'O'},calamity:{color:'#ff942e',letter:'C'},
 devourer:{color:'#ff485d',letter:'D'},titan:{color:'#ffe03d',letter:'T'},
 sovereign:{color:'#428bff',letter:'S'},reaper:{color:'#f0f3ed',letter:'R'}
};
export function warBanner(g:WarGame,team:number){return WAR_BANNERS[g.war.leaders[team].monsterId];}
export function warRelation(g:WarGame,team:number){return team===0?{name:'YOUR ARMY',color:'#55ff88'}:g.allied(0,team)?{name:'ALLY',color:'#53e8ff'}:{name:'ENEMY',color:'#ff4545'};}
