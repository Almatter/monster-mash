export type EnemyKind = 'thrall' | 'hound' | 'spitter' | 'wing' | 'brute' | 'elite' | 'titan';
export type EnemyDef = { name: string; hp: number; speed: number; radius: number; damage: number; score: number; color: string; behavior: 'chase' | 'ranged' | 'weave' | 'slam' };
export const ENEMIES: Record<EnemyKind, EnemyDef> = {
 thrall: { name:'Ash goblin', hp:22, speed:56, radius:10, damage:11, score:10, color:'#9b9470', behavior:'chase' },
 hound: { name:'Grave hound', hp:15, speed:105, radius:9, damage:15, score:15, color:'#c28669', behavior:'chase' },
 spitter: { name:'Hex spitter', hp:40, speed:43, radius:12, damage:25, score:25, color:'#ac87c4', behavior:'ranged' },
 wing: { name:'Carrion wing', hp:25, speed:76, radius:11, damage:12, score:18, color:'#839fa7', behavior:'weave' },
 brute: { name:'Iron ogre', hp:210, speed:37, radius:21, damage:50, score:80, color:'#c2a26f', behavior:'chase' },
 elite: { name:'Blood herald', hp:620, speed:52, radius:26, damage:70, score:250, color:'#e36971', behavior:'slam' },
 titan: { name:'The Hollow King', hp:6500, speed:27, radius:62, damage:150, score:1500, color:'#c592a7', behavior:'slam' }
};
export const PHASES = [
 { name:'THE SWARM', pressure:1, weights:[72,13,4,5,6], eliteEvery:4, titanEvery:8 },
 { name:'ADAPTATION', pressure:1.08, weights:[40,20,16,14,10], eliteEvery:3, titanEvery:7 },
 { name:'TITANS', pressure:1.12, weights:[42,15,10,13,20], eliteEvery:2, titanEvery:4 },
 { name:'THRONE WAR', pressure:1.3, weights:[40,20,13,12,15], eliteEvery:2, titanEvery:3 }
];
// Change only this index to activate an event week. Included in every run code.
export const EVENT = { phase:0, rules:'2026.10-v3', waveSeconds:30, maxEnemies:1100, arenaRadius:1500 };
export type FeatContext = { recentKills:number; overkill:number; chain:number; eliteDevoured:number; noHitKills:number; multi:number; corruption:number };
export const FEATS: { id:string; name:string; metric:keyof FeatContext; threshold:number; bonus:number; cooldown:number }[] = [
 {id:'extinction',name:'EXTINCTION EVENT',metric:'recentKills',threshold:100,bonus:2000,cooldown:30},
 {id:'overkill',name:'OVERKILL',metric:'overkill',threshold:20,bonus:500,cooldown:20},
 {id:'chain',name:'BOWLING FOR GOBLINS',metric:'chain',threshold:8,bonus:800,cooldown:15},
 {id:'apex',name:'APEX PREDATOR',metric:'eliteDevoured',threshold:1,bonus:1500,cooldown:20},
 {id:'untouchable',name:'UNTOUCHABLE',metric:'noHitKills',threshold:150,bonus:1500,cooldown:40},
 {id:'chainreaction',name:'CHAIN REACTION',metric:'corruption',threshold:12,bonus:1000,cooldown:15},
 {id:'massacre',name:'MASSACRE',metric:'multi',threshold:40,bonus:1000,cooldown:20}
];
