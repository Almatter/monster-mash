import {realmScorePolicy} from './stage-three.ts';
import {realmFeatsForRules} from './realm-feats.ts';
import {COURT,courtScorePolicy} from './stage-two.ts';
import {COLOSSUS} from './ashen-colossus.ts';
import {courtFeatMaximum} from './court-feats.ts';
import type {RunRecord} from './run-code.ts';

export const gradedHuntRules=(rules:string)=>/^2026\.10-v(32|33)-court-(hunts|test)$/.test(rules);
export function huntMaximum(rules:string){const p=courtScorePolicy(rules),total=COURT.total;return {combat:p.combatPerCaptain*total,captains:3000*total,objectives:total*(p.sealBonus+5*p.guardBonus+5*p.impactBonus+p.closeBonus),speed:p.speedMax,colossus:COLOSSUS.reward,feats:gradedHuntRules(rules)?courtFeatMaximum():0};}
export function huntGrade(run:Pick<RunRecord,'rules'|'score'|'mission'>){if(!run.mission||!gradedHuntRules(run.rules))return null;const limits=huntMaximum(run.rules),maximum=Object.values(limits).reduce((n,v)=>n+v,0),fraction=Math.min(1,Math.max(0,run.score/maximum));return {limits,maximum,percent:Math.floor(fraction*1000+1e-8)/10,letter:fraction>=1?'S':fraction>=.9?'A':fraction>=.8?'B':fraction>=.7?'C':fraction>=.6?'D':fraction>=.5?'E':'F'};}

export function realmMaximum(rules:string){const p=realmScorePolicy(rules);return {combat:p.combatPool,grottos:7*p.guardianReward,defenses:4*p.layerReward,victory:p.clearReward,feats:Object.values(realmFeatsForRules(rules)).reduce((n,f)=>n+f.bonus*f.max,0)};}
export function resultGrade(run:RunRecord){if(!run.realm||!run.rules.includes('-v36-titan-'))return huntGrade(run);const limits=realmMaximum(run.rules),maximum=Object.values(limits).reduce((n,v)=>n+v,0),fraction=Math.min(1,Math.max(0,run.score/maximum));return {limits,maximum,percent:Math.floor(fraction*1000+1e-8)/10,letter:fraction>=1?'S':fraction>=.9?'A':fraction>=.8?'B':fraction>=.7?'C':fraction>=.6?'D':fraction>=.5?'E':'F'};}
