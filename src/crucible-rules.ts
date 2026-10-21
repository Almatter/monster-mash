import {CRUCIBLE_DIFFICULTIES,type CrucibleDifficulty} from './crucible-difficulty.ts';
export const CRUCIBLE_RULES=Object.fromEntries(Object.keys(CRUCIBLE_DIFFICULTIES).map(d=>[d,'2026.10-v52-crucible-'+d])) as Record<CrucibleDifficulty,string>;
export const CRUCIBLE_TEST_RULES=Object.fromEntries(Object.keys(CRUCIBLE_DIFFICULTIES).map(d=>[d,'2026.10-v52-crucible-test-'+d])) as Record<CrucibleDifficulty,string>;
export const CRUCIBLE_RULESETS=[...Object.values(CRUCIBLE_RULES),...Object.values(CRUCIBLE_TEST_RULES)].flatMap(rule=>[rule,rule.replace('-v52-','-v51-'),rule.replace('-v52-','-v50-'),rule.replace('-v52-','-v49-')]);
export const matchesCrucibleRules=(rule:string,difficulty:CrucibleDifficulty,testing:boolean)=>{const current=(testing?CRUCIBLE_TEST_RULES:CRUCIBLE_RULES)[difficulty];return [current,current?.replace('-v52-','-v51-'),current?.replace('-v52-','-v50-'),current?.replace('-v52-','-v49-')].includes(rule);};
export type CrucibleRunSummary={difficulty:CrucibleDifficulty;cleared:boolean;champions:number;troops:number;guardians:number;crystals:number;deaths:number;perks:number;combat:number;objectives:number;victory:number;seconds:number};
