import {MONSTERS} from './content-monsters.ts';
import {stageAccess,type StageTrials} from './stage-access.ts';
export function championAvailable(id:string,progress:{titles:Record<string,string>;trials:StageTrials},serverTime:number|null,testing=false){const monster=MONSTERS[id];return !!monster&&(monster.unlockStage===undefined||testing||stageAccess(monster.unlockStage,progress,serverTime)==='open');}
