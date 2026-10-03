export const SCORING={killCarnage:.018,maxCarnage:5,decayDelay:1.6,decayRate:.24,multiMinimum:5,multiBonus:5,waveBonus:100};
export const MASSACRES=[{kills:10,name:'MASSACRE'},{kills:30,name:'BLOODBATH'},{kills:60,name:'ANNIHILATION'},{kills:100,name:'EXTINCTION EVENT'}];
export const FEAT_CONDITIONS:Record<string,string>={chainreaction:'Slay 12 enemies through a corruption cascade in one simulation step.',extinction:'Slay 100 enemies within 5 seconds.',overkill:'Hit 20 enemies for at least four times their remaining health in one activation.',chain:'Slay 8 enemies through knockback collisions in one chain.',apex:'Devour an elite in one activation.',untouchable:'Slay 150 enemies without taking damage.',massacre:'Slay 40 enemies in one attack or activation.'};
export type Metrics={kills:number;recent:number;titans:number;noHit:number;collisions:number;devoured:number;multi:number;controlled:number;summoned:number;chain:number;maxCarnageSeconds:number;courtCaptains?:number;courtGuards?:number;courtClear?:number;courtFast?:number;courtImpact?:number};
export type Achievement={id:string;name:string;description:string;condition:string;metric:keyof Metrics;target:number;archetype?:string;title?:string;icon:string;hidden:boolean};
export const ACHIEVEMENTS:Achievement[]=[
 {id:'wildsFirst',name:'CAPTAIN DOWN',description:'The hunt begins.',condition:'Slay a captain in Stage 2.',metric:'courtCaptains',target:1,icon:'◆',hidden:false},
 {id:'wildsGuard',name:'SHATTERED VANGUARD',description:'No shield lasts forever.',condition:'Break 20 guards in one Stage 2 hunt.',metric:'courtGuards',target:20,icon:'◇',hidden:false},
 {id:'wildsImpact',name:'BREACH THE LINE',description:'Turn force into opportunity.',condition:'Break 10 Stage 2 guards with impact attacks in one hunt.',metric:'courtImpact',target:10,icon:'◉',hidden:false},
 {id:'wildsClear',name:'WILDS CONQUERED',description:'Ten captains, one hunter.',condition:'Complete a Stage 2 hunt.',metric:'courtClear',target:1,icon:'♛',hidden:false},
 {id:'wildsFast',name:'ASHEN PURSUIT',description:'Search swiftly. Strike decisively.',condition:'Complete Stage 2 in 12 minutes or less.',metric:'courtFast',target:1,icon:'✦',hidden:false},
 {id:'bloodbath',name:'FIRST BLOODBATH',description:'Your legend begins in the horde.',condition:'Slay 500 enemies in one run.',metric:'kills',target:500,title:'The Blooded',icon:'◆',hidden:false},
 {id:'extinction',name:'EXTINCTION EVENT',description:'An army disappears in a heartbeat.',condition:'Slay 100 enemies within 5 seconds.',metric:'recent',target:100,title:'The World Eater',icon:'✦',hidden:false},
 {id:'apex',name:'APEX PREDATOR',description:'Even a king becomes prey.',condition:'Slay a Titan in one run.',metric:'titans',target:1,title:'Kingsbane',icon:'♛',hidden:false},
 {id:'untouchable',name:'UNTOUCHABLE',description:'Destruction cannot touch you.',condition:'Slay 150 enemies without taking damage.',metric:'noHit',target:150,title:'The Bloodless King',icon:'◇',hidden:false},
 {id:'collateral',name:'COLLATERAL MONSTER',description:'Their bodies break their own ranks.',condition:'Slay 50 enemies through actual knockback collisions in one run.',metric:'collisions',target:50,archetype:'titan',icon:'◉',hidden:false},
 {id:'feast',name:'FEAST WITHOUT END',description:'Hunger becomes a crown.',condition:'Devour 50 enemies in one run.',metric:'devoured',target:50,archetype:'devourer',icon:'♜',hidden:false},
 {id:'calamity',name:'ABSOLUTE CALAMITY',description:'A single spell becomes a disaster.',condition:'Slay 100 enemies with one ability activation.',metric:'multi',target:100,archetype:'calamity',icon:'ϟ',hidden:false},
 {id:'puppet',name:'PUPPET TYRANT',description:'The horde destroys itself for you.',condition:'Controlled enemies slay 50 former allies in one run.',metric:'controlled',target:50,archetype:'overlord',icon:'♟',hidden:false},
 {id:'cascade',name:'CHAIN REACTION',description:'Corruption consumes its hosts.',condition:'Slay 80 enemies through corruption explosions in one run.',metric:'chain',target:80,archetype:'overlord',icon:'✧',hidden:false},
 {id:'reign',name:'ENDLESS REIGN',description:'The massacre does not relent.',condition:'Maintain ×5 Carnage for 30 consecutive seconds.',metric:'maxCarnageSeconds',target:30,icon:'♔',hidden:false}
];
