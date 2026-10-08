export const REALM_FEATS={
 prepared:{name:'Prepared Mind',bonus:180000,max:1,condition:'Enter your first titan challenge with four relics discovered.'},
 insight:{name:'First Insight',bonus:150000,max:4,condition:'Open a defense without testing the wrong altar power against that layer.'},
 adaptation:{name:'Adaptation',bonus:100000,max:4,condition:'Open a defense with a different altar power.'},
 resolve:{name:'Unbroken Resolve',bonus:400000,max:1,condition:'Defeat the titan without resetting the fight.'}
};
export const realmFeatScore=(counts:Record<string,number>)=>Object.entries(REALM_FEATS).reduce((sum,[id,f])=>sum+f.bonus*(counts[id]||0),0);
