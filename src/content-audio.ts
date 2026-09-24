import {ABILITIES,MONSTERS} from './content-monsters.ts';
export type Cue={bus:'sfx'|'ui';priority:number;gap:number;frequency?:number;duration?:number};
export const CUES:Record<string,Cue>={
 menu:{bus:'ui',priority:3,gap:.08,frequency:520,duration:.08},confirm:{bus:'ui',priority:4,gap:.1,frequency:680,duration:.13},
 heal:{bus:'sfx',priority:3,gap:.4,frequency:460,duration:.16},shield:{bus:'sfx',priority:3,gap:.5,frequency:760,duration:.2},
 hurt:{bus:'sfx',priority:4,gap:.25},lowHealth:{bus:'sfx',priority:6,gap:6},
 enemyDeath:{bus:'sfx',priority:0,gap:.18},heavyDeath:{bus:'sfx',priority:2,gap:.3},eliteDeath:{bus:'sfx',priority:4,gap:.4},titanArrival:{bus:'sfx',priority:7,gap:2},titanDeath:{bus:'sfx',priority:7,gap:1},
 collision:{bus:'sfx',priority:1,gap:.2},devour:{bus:'sfx',priority:3,gap:.25},corruption:{bus:'sfx',priority:2,gap:.3,frequency:160,duration:.18},
 multikill:{bus:'sfx',priority:4,gap:1.5},carnage:{bus:'sfx',priority:4,gap:1,frequency:620,duration:.25},
 feat:{bus:'sfx',priority:5,gap:1.5,frequency:740,duration:.3},achievement:{bus:'ui',priority:6,gap:1,frequency:880,duration:.35},title:{bus:'ui',priority:8,gap:1,frequency:1040,duration:.5},
 defeat:{bus:'sfx',priority:8,gap:1},wave:{bus:'sfx',priority:3,gap:2,frequency:330,duration:.25},
 ultimateStart:{bus:'sfx',priority:6,gap:.5,frequency:110,duration:.45},ultimateImpact:{bus:'sfx',priority:7,gap:.4},meteorImpact:{bus:'sfx',priority:5,gap:.3}
};
for(const [i,a] of Object.values(ABILITIES).entries())CUES['ability.'+a.id]={bus:'sfx',priority:4,gap:.15,...(['beam','curse','vortex','dominion'].includes(a.effect)?{frequency:180+i*17,duration:.3}:{})};
for(const m of Object.values(MONSTERS))CUES['basic.'+m.id]={bus:'sfx',priority:1,gap:.15,...(m.basic.ranged?{frequency:m.id==='calamity'?290:220,duration:.07}:{})};
export type MusicState='menu'|'combat'|'escalation'|'titan';
export type AudioCatalog={sfx?:Record<string,string[]>;music?:Partial<Record<MusicState,{file:string;loopStart?:number;loopEnd?:number}>>};
