import {MONSTERS} from './content-monsters.ts';
import {TITLES,type PrestigeTitle} from './content-titles.ts';
import {STAGE_GATES} from './stage-access.ts';
import {createIdentity} from './identity.ts';
import type {Profile} from './profile.ts';
export type ContentAccess={champion:(id:string)=>boolean;stage:(phase:number)=>boolean};
export const defaultContentAccess=(testing=false):ContentAccess=>({champion:id=>!!MONSTERS[id]&&(MONSTERS[id].unlockStage===undefined||testing),stage:phase=>phase===0||testing&&phase<3});
export function titleVisible(title:PrestigeTitle,access:ContentAccess){if(title.stage!==undefined&&!access.stage(title.stage))return false;return title.requirements.every(r=>{
 if(MONSTERS[r.scope]&&!access.champion(r.scope))return false;
 if(r.metric.startsWith('court'))return access.stage(1);
 if(r.scope.startsWith('stage:')){const gate=STAGE_GATES.find(g=>g.titleId===r.scope.slice(6));return !!gate&&access.stage(gate.sourcePhase);}
 return true;
});}
export function titleLabelVisible(label:string,access:ContentAccess){const title=TITLES.find(t=>t.name===label);return !title||titleVisible(title,access);}
// Presentation only: a locked imported selection never destroys saved palettes or rewards.
export function visibleIdentity(profile:Profile,access:ContentAccess){const id=access.champion(profile.identity.monsterId)?profile.identity.monsterId:'sovereign';const title=titleLabelVisible(profile.identity.title,access)?profile.identity.title:'';if(id===profile.identity.monsterId&&title===profile.identity.title)return profile.identity;return createIdentity({...profile.identity,monsterId:id,title,colors:id===profile.identity.monsterId?profile.identity.colors:profile.palettes[id]});}
