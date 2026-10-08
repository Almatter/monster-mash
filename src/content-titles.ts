import {STAGE_GATES,trialDays,masteryChampion,masteryProgress,gateChallengeComplete,type StageTrials} from './stage-access.ts';
export type Totals=Record<string,number>;
export type Progression={total:Totals;best:Totals;archetypes:Record<string,Totals>;titles:Record<string,string>;legacyTitles:string[];ledger:{id:string;values:Totals}|null;finished:string[];trials:StageTrials};
export type Requirement={scope:string;metric:string;target:number;label:string};
export type PrestigeTitle={id:string;name:string;family:string;requirements:Requirement[];stage?:number};
const req=(scope:string,metric:string,target:number,label:string):Requirement=>({scope,metric,target,label});
const title=(id:string,name:string,family:string,...requirements:Requirement[]):PrestigeTitle=>({id,name,family,requirements});
const runs=(n:number)=>req('total','runs',n,'incarnations lasting at least 60 seconds');
export const TITLES:PrestigeTitle[]=[
 ...[25000,100000,500000,2000000].map((n,i)=>title('slaughter'+i,['The Butcher','Army Breaker','The World Eater','October Eternal'][i],'Slaughter',req('total','kills',n,'lifetime slain'),runs([2,5,15,50][i]))),
 ...[2500000,25000000,150000000].map((n,i)=>title('dominance'+i,['Dread Ascendant','Sovereign of Ruin','Beyond All Kings'][i],'Dominance',req('total','dominance',n,'lifetime Dominance'),runs([3,15,50][i]))),
 ...[60,180,360].map((n,i)=>title('carnage'+i,['Crimson Reign','Endless Reign','Unbroken Apocalypse'][i],'Carnage',req('best','carnage',n,'best consecutive seconds at ×5 Carnage'),runs([3,8,20][i]))),
 ...[5,20,100].map((n,i)=>title('hunt'+i,['Kingsbane','Titan Bane','The Crown Collector'][i],'Titan hunting',req('total','titans',n,'Titans slain'),req('total','elites',n*5,'elites slain'))),
 ...[480,720,1200].map((n,i)=>title('survival'+i,['Death Defiant','The Last Catastrophe','Beyond the Final Hour'][i],'Survival',req('best','seconds',n,'best survival seconds'),runs([3,10,30][i]))),
 title('titan1','The Mountain Breaker','Titan mastery',req('titan','collision',5000,'Titan collision kills'),req('titan','runs',5,'Titan incarnations ≥60s')),
 title('titan2','Continental Ruin','Titan mastery',req('titan','collision',50000,'Titan collision kills'),req('titan','trample',10000,'Titan trample kills'),req('titan','runs',20,'Titan incarnations ≥60s')),
 title('devourer1','Insatiable','Devourer mastery',req('devourer','devour',5000,'Devourer consumed prey'),req('devourer','runs',5,'Devourer incarnations ≥60s')),
 title('devourer2','Hunger Without End','Devourer mastery',req('devourer','devour',50000,'Devourer consumed prey'),req('devourer','eliteDevoured',50,'elites devoured'),req('devourer','runs',20,'Devourer incarnations ≥60s')),
 title('calamity1','Living Cataclysm','Calamity mastery',req('calamity','magic',20000,'Calamity spell kills'),req('calamity','runs',5,'Calamity incarnations ≥60s')),
 title('calamity2','The Final Spell','Calamity mastery',req('calamity','magic',250000,'Calamity spell kills'),req('best','calamityMulti',300,'Calamity kills in one activation'),req('calamity','runs',20,'Calamity incarnations ≥60s')),
 title('overlord1','The Thousand Thrones','Overlord mastery',req('overlord','owned',10000,'servant kills'),req('overlord','runs',5,'Overlord incarnations ≥60s')),
 title('overlord2','Emperor of the Fallen','Overlord mastery',req('overlord','owned',100000,'servant kills'),req('overlord','chain',25000,'corruption explosion kills'),req('overlord','runs',20,'Overlord incarnations ≥60s')),
 title('sovereign1','The Ravenous Crown','Sovereign mastery',req('sovereign','devour',5000,'Sovereign consumed prey'),req('sovereign','beam',5000,'Sovereign beam kills'),req('sovereign','runs',5,'Sovereign incarnations ≥60s')),
 title('sovereign2','The First and Last','Sovereign mastery',req('sovereign','devour',50000,'Sovereign consumed prey'),req('sovereign','beam',50000,'Sovereign beam kills'),req('sovereign','runs',20,'Sovereign incarnations ≥60s')),
 title('reaper1','The Soul Collector','Reaper mastery',req('reaper','reaped',5000,'prey slain with scythe powers'),req('reaper','runs',5,'Reaper incarnations ≥60s')),
 title('reaper2','Eclipse Eternal','Reaper mastery',req('reaper','reaped',50000,'prey slain with scythe powers'),req('reaper','moonstorm',15000,'Eclipse kills'),req('reaper','runs',20,'Reaper incarnations ≥60s')),
 title('reaperBlink','Between Worlds','Reaper mastery',req('reaper','graveshift',2000,'Graveshift kills'),req('reaper','runs',5,'Reaper incarnations ≥60s')),
 title('lycanthropeHunt','The Moon Huntress','Lycanthrope mastery',req('lycanthrope','wolfKills',5000,'prey slain with wolf powers'),req('lycanthrope','runs',5,'incarnations ≥60s')),
 title('lycanthropeFury','Bloodmoon Sovereign','Lycanthrope mastery',req('lycanthrope','moonfury',15000,'Bloodmoon Reign kills'),req('lycanthrope','runs',20,'incarnations ≥60s')),
 title('lycanthropeVault','Beyond the Walls','Lycanthrope mastery',req('lycanthrope','wolfbound',2000,'Moonstrider Vault kills'),req('lycanthrope','runs',5,'incarnations ≥60s')),
 title('wildsHunter','Hunter of the Wilds','Ashen Wilds',req('total','courtClears',1,'completed Stage 2 hunts')),
 title('wildsColossus','Colossus Bane','Ashen Wilds',req('total','courtColossusClears',3,'completed Stage 2 hunts with the Ashen Colossus slain')),
 title('wildsVeteran','Ashen Warden','Ashen Wilds',req('total','courtClears',3,'completed Stage 2 hunts')),
 title('wildsCollector','Captain Reaper','Ashen Wilds',req('total','courtCaptains',50,'Stage 2 captains slain')),
 title('wildsGuards','The Shieldbreaker','Ashen Wilds',req('best','courtGuardRun',40,'guards broken in one Stage 2 hunt')),
 title('wildsClose','Into the Lion’s Teeth','Ashen Wilds',req('best','courtCloseClear',8,'close-range captain kills in a completed hunt')),
 title('wildsFast','Sandstorm Pursuer','Ashen Wilds',req('best','courtFastClear',1,'complete Stage 2 in 12 minutes or less')),
 title('wildsSwift','Before the Ash Settles','Ashen Wilds',req('best','courtSwiftClear',1,'complete Stage 2 in 10 minutes or less')),
 title('wildsHaste','Desert Wind','Ashen Wilds',req('best','courtHasteClear',1,'complete a hunt with Wayfarer at rank 3')),
 title('wildsTempo','A Thousand Cuts','Ashen Wilds',req('best','courtTempoClear',1,'complete a hunt with Rending Rhythm at rank 3')),
 title('wildsDuration','The Lingering Catastrophe','Ashen Wilds',req('best','courtDurationClear',1,'complete a hunt with Enduring Power at rank 3')),
 ...[
  ['titan','Titan','Dune Shatterer','Faultline Sovereign','Adamant Colossus Bane','courtFissure',500,'Fissure kills'],
  ['devourer','Devourer','Ashen Stalker','Feast of the Wilds','Colossus Eater','courtDevour',2000,'prey consumed'],
  ['calamity','Calamity','Scourge of the Sands','Desert Cataclysm','Colossus Unmade','courtMagic',10000,'spell kills'],
  ['overlord','Overlord','Warden of Fallen Courts','Legion of Ash','Colossus Usurper','courtOwned',5000,'servant kills'],
  ['sovereign','Sovereign','Crown of the Wilds','Ashen Spellblade','Colossus Kingslayer','courtBeam',3000,'Death Beam kills'],
  ['reaper','Reaper','Scythe of the Sands','Harvest Moon','Colossus Soulreaper','courtReaped',5000,'scythe-power kills'],
  ['lycanthrope','Lycanthrope','Moon over the Dunes','Pale Fang of Ash','Colossus Moonbane','courtWolfKills',5000,'wolf-power kills']
 ].flatMap(([id,champion,hunter,adept,bane,metric,target,label])=>[
  {...title(id+'WildsHunter',String(hunter),champion+' · Ashen Wilds',req(String(id),'courtClears',3,'completed hunts'),req(String(id),'courtGuards',120,'guards broken')),stage:1},
  {...title(id+'WildsArt',String(adept),champion+' · Ashen Wilds',req(String(id),String(metric),Number(target),String(label)+' in Stage 2'),req(String(id),'courtClears',5,'completed hunts')),stage:1},
  {...title(id+'WildsBane',String(bane),champion+' · Ashen Wilds',req(String(id),'courtColossusClears',5,'completed hunts with the Colossus slain'),req(String(id),'courtCaptains',100,'captains slain')),stage:1}
 ]),
 ...['overlord','calamity','devourer','titan','sovereign','reaper','lycanthrope'].flatMap((id,i)=>[
  {...title(id+'DeepSeeker',['Warden of Forgotten Thrones','The Hidden Equation','Hunger for Knowledge','The Patient Mountain','Crown of the Deep','Keeper of Lost Souls','Moon in the Abyss'][i],id[0].toUpperCase()+id.slice(1)+' · Titan depths',req(id,'realmClears',3,'completed Stage 3 challenges'),req(id,'realmShrines',21,'grottos cleared')),stage:2},
  {...title(id+'DeepResolve',['Unbroken Dominion','Flawless Cataclysm','The Unrelenting Answer','Adamant Resolve','The Unbroken Crown','Unbroken Eclipse','Steadfast Bloodmoon'][i],id[0].toUpperCase()+id.slice(1)+' · Titan depths',req(id,'realmCleanClears',3,'titan victories without resetting')),stage:2},
  {...title(id+'DeepInsight',['The Knowing Emperor','Mind beyond Magic','The Thinking Predator','Wisdom of Stone','The Sevenfold Sovereign','The Remembering Reaper','Sevenfold Moon Huntress'][i],id[0].toUpperCase()+id.slice(1)+' · Titan depths',req(id,'realmInsights',20,'defenses opened without a wrong altar-power trial'),req(id,'realmClears',7,'completed Stage 3 challenges')),stage:2}
 ]),
 ...STAGE_GATES.map(gate=>gate.kind==='daily'?title(gate.titleId,gate.title,'Stage passage',req('stage:'+gate.titleId,'days',gate.days,`different qualifying days with one champion (≥8:30 and ≥15,000 kills each), OR 100 passage points + 6 finished runs + one 8-minute run with one original champion`)):title(gate.titleId,gate.title,'Stage passage',...gate.goals.map(g=>req('stage:'+gate.titleId,g.metric,g.target,g.label+' with one champion'))))
];
export function progressValue(p:Progression,r:Requirement){if(r.scope.startsWith('stage:')){const gate=STAGE_GATES.find(g=>g.titleId===r.scope.slice(6));return !gate?0:gate.kind==='daily'?(r.metric==='days'?trialDays(p.trials,gate):0):masteryProgress(gate,p,masteryChampion(gate,p)).find(g=>g.metric===r.metric)?.value||0;}return (r.scope==='total'?p.total:r.scope==='best'?p.best:p.archetypes[r.scope])?.[r.metric]||0;}
export function titleProgress(p:Progression,t:PrestigeTitle){return t.requirements.map(r=>({...r,value:progressValue(p,r)}));}
export function awardTitles(p:Progression,now=new Date().toISOString()){const earned:string[]=[];for(const t of TITLES)if(!p.titles[t.id]&&(STAGE_GATES.some(g=>g.titleId===t.id)?gateChallengeComplete(STAGE_GATES.find(g=>g.titleId===t.id)!,p):t.requirements.every(r=>progressValue(p,r)>=r.target))){p.titles[t.id]=now;earned.push(t.id);}return earned;}
