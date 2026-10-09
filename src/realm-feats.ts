export const LEGACY_REALM_FEATS={
 prepared:{name:'Prepared Mind',bonus:180000,max:1,condition:'Enter your first titan challenge with four relics discovered.'},
 insight:{name:'First Insight',bonus:150000,max:4,condition:'Open a defense without testing the wrong altar power against that layer.'},
 adaptation:{name:'Adaptation',bonus:100000,max:4,condition:'Open a defense with a different altar power.'},
 resolve:{name:'Unbroken Resolve',bonus:400000,max:1,condition:'Defeat the titan without resetting the fight.'}
};
export const REALM_FEATS={
 prepared:{name:'Prepared Mind',bonus:400000,max:1,condition:'Enter your first titan challenge with four relics discovered.'},
 insight:{name:'First Insight',bonus:300000,max:4,condition:'Breach a layer without trying the wrong altar power.'},
 adaptation:{name:'Adaptation',bonus:200000,max:4,condition:'Breach a defense with a different altar power.'},
 resolve:{name:'Unbroken Resolve',bonus:800000,max:1,condition:'Defeat the titan without leaving the seal. The four bridge inscriptions reveal its defenses before battle.'},
 council:{name:'Read the Depths',bonus:400000,max:4,condition:'Inspect each of the four bridge inscriptions. Remember their order and match their emblems to the grottos.'},
 selective:{name:'Discerning Collector',bonus:800000,max:1,condition:'Defeat the titan after discovering only the four relics its defenses require. Grotto emblems help you choose.'}
};
export const realmFeatsForRules=(rules:string)=>rules.includes('-v34-')?{}:rules.includes('-v35-')?LEGACY_REALM_FEATS:REALM_FEATS;
export const realmFeatScore=(counts:Record<string,number>,rules='2026.10-v36-titan-realm')=>Object.entries(realmFeatsForRules(rules)).reduce((sum,[id,f])=>sum+f.bonus*(counts[id]||0),0);
