export type TitanKit='throw'|'fissure';
export const TITAN_FISSURE_RULES='2026.10-v29-titan-fissure';
export const normalizeTitanKit=(value:unknown):TitanKit=>value==='fissure'?'fissure':'throw';
export const titanKitForStage=(phase:number,choice:unknown,unlocked:boolean):TitanKit=>phase===1||phase===0&&unlocked&&choice==='fissure'?'fissure':'throw';
export const titanKitLabel=(monsterId:string|undefined,phase:number,kit:unknown='throw')=>monsterId==='titan'?(phase===1||kit==='fissure'?'Fissure kit':'Throw kit'):'';
