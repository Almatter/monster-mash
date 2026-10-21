import {CRUCIBLE_DIFFICULTIES,type CrucibleDifficulty} from './crucible-difficulty.ts';
export const CRUCIBLE_RULES=Object.fromEntries(Object.keys(CRUCIBLE_DIFFICULTIES).map(d=>[d,'2026.10-v50-crucible-'+d])) as Record<CrucibleDifficulty,string>;
export const CRUCIBLE_TEST_RULES=Object.fromEntries(Object.keys(CRUCIBLE_DIFFICULTIES).map(d=>[d,'2026.10-v50-crucible-test-'+d])) as Record<CrucibleDifficulty,string>;
export const CRUCIBLE_RULESETS=[...Object.values(CRUCIBLE_RULES),...Object.values(CRUCIBLE_TEST_RULES)].flatMap(rule=>[rule,rule.replace('-v50-','-v49-')]);
export const matchesCrucibleRules=(rule:string,difficulty:CrucibleDifficulty,testing:boolean)=>{const current=(testing?CRUCIBLE_TEST_RULES:CRUCIBLE_RULES)[difficulty];return rule===current||rule===current?.replace('-v50-','-v49-');};
export type CrucibleRunSummary={difficulty:CrucibleDifficulty;cleared:boolean;champions:number;troops:number;guardians:number;crystals:number;deaths:number;perks:number;combat:number;objectives:number;victory:number;seconds:number};
