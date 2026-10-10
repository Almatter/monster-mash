export const LEGACY_REALM_FEATS={
 prepared:{name:'Prepared Mind',bonus:180000,max:1,condition:'Enter your first titan challenge with four relics discovered.'},
 insight:{name:'First Insight',bonus:150000,max:4,condition:'Open a defense without testing the wrong altar power against that layer.'},
 adaptation:{name:'Adaptation',bonus:100000,max:4,condition:'Open a defense with a different altar power.'},
 resolve:{name:'Unbroken Resolve',bonus:400000,max:1,condition:'Defeat the titan without resetting the fight.'}
};
export const V37_REALM_FEATS={
 prepared:{name:'Prepared Mind',bonus:400000,max:1,condition:'Enter your first titan challenge with four relics discovered.'},
 insight:{name:'First Insight',bonus:300000,max:4,condition:'Breach a layer without trying the wrong altar power.'},
 adaptation:{name:'Adaptation',bonus:200000,max:4,condition:'Breach a defense with a different altar power.'},
 resolve:{name:'Unbroken Resolve',bonus:800000,max:1,condition:'Defeat the titan without leaving its seal.'},
 council:{name:'Read the Depths',bonus:400000,max:4,condition:'Inspect each of the four approach inscriptions.'},
 selective:{name:'Discerning Collector',bonus:800000,max:1,condition:'Defeat the titan after clearing only its four required grottos and discovering only their relics.'}
};
const {council,...current}=V37_REALM_FEATS;
export const REALM_FEATS={...current,resourceful:{name:'Resourceful Hand',bonus:500000,max:3,condition:'Clear a grotto after using a native power and a different borrowed power against its guardians.'}};
export const realmFeatsForRules=(rules:string)=>rules.includes('-v34-')?{}:rules.includes('-v35-')?LEGACY_REALM_FEATS:/-v(36|37)-/.test(rules)?V37_REALM_FEATS:REALM_FEATS;
export const realmFeatScore=(counts:Record<string,number>,rules='2026.10-v42-titan-realm')=>Object.entries(realmFeatsForRules(rules)).reduce((sum,[id,f])=>sum+f.bonus*(counts[id]||0),0);
