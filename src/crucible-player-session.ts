import {loadProfile,type Profile,type StorageLike} from './profile.ts';
import {createIdentity,type Identity} from './identity.ts';
import {gateForStage,stageAccess,serverTime,openingText} from './stage-access.ts';
import {championAvailable} from './champion-access.ts';
import {MONSTERS} from './content-monsters.ts';
import {ACHIEVEMENTS} from './content-records.ts';
import {TITLES} from './content-titles.ts';
import type {Crucible} from './crucible-sim.ts';
import {saveCrucibleProgress} from './crucible-progress.ts';
import {encodeRun,type RunRecord} from './run-code.ts';
export class CruciblePlayerSession{
 identity:Identity;team:number;id='';game:Crucible|null=null;finished=false;savedAt=-Infinity;records=new Set<string>();titles=new Set<string>();run:RunRecord|null=null;
 profile:Profile;storage:StorageLike|undefined;testing:boolean;saved=true;
 constructor(profile:Profile,storage:StorageLike|undefined,testing=false){this.profile=profile;this.storage=storage;this.testing=testing;this.identity=createIdentity(profile.identity);this.team=Object.keys(MONSTERS).indexOf(this.identity.monsterId);}
 get home(){return this.testing?'test/index.html':'index.html';}
 start(g:Crucible){if(this.game&&!this.finished)this.update(this.game,true,'retired');this.game=g;g.controlled=this.team;this.id=crypto.randomUUID();this.finished=false;this.savedAt=-Infinity;this.records.clear();this.titles.clear();this.run=null;}
 update(g:Crucible,finished=false,reason:RunRecord['reason']='retired'){if(!this.id||g!==this.game||this.finished||!finished&&g.time-this.savedAt<5)return;const result=saveCrucibleProgress(this.profile,g,this.team,this.identity,this.id,finished,reason,this.storage,new Date(),this.testing);this.saved=result.saved;this.savedAt=g.time;for(const id of result.newRecords)this.records.add(id);for(const id of result.newTitles)this.titles.add(id);if(finished){this.finished=true;this.run={...result.run,newRecords:[...this.records],newTitles:[...this.titles]};}return result;}
 finish(g:Crucible){return this.update(g,true,g.winner===this.team?'cleared':'overwhelmed');}
 present(root:HTMLElement){root.querySelector('#player-rewards')?.remove();const box=document.createElement('div');box.id='player-rewards';const status=document.createElement('p');status.textContent=!this.saved?'Could not save to browser storage. Keep your run code to preserve this result.':this.testing?'Exhibition progress saved separately.':'Scores, achievements and mastery saved to your Monster Records.';box.append(status);for(const id of this.records){const a=ACHIEVEMENTS.find(a=>a.id===id);if(a){const p=document.createElement('p');p.textContent='Achievement: '+a.name;box.append(p);}}for(const id of this.titles){const t=TITLES.find(t=>t.id===id);if(t){const p=document.createElement('p');p.textContent='Title earned: '+t.name;box.append(p);}}
 const code=document.createElement('textarea');code.readOnly=true;code.setAttribute('aria-label','Stage 4 run code');code.rows=3;code.style.width='100%';const exportButton=document.createElement('button');exportButton.textContent='Show run code';exportButton.onclick=async()=>{if(!this.run)return;try{code.value=await encodeRun(this.run);code.hidden=false;code.focus();code.select();}catch(e){status.textContent='Run saved locally. Could not create run code: '+String(e);}};code.hidden=true;const home=document.createElement('a');home.href=this.home;home.textContent='Return to champion selection and Monster Records';home.style.cssText='display:block;margin:14px 0;color:#f0cf8b';box.append(exportButton,code,home);root.append(box);}
}
let current:CruciblePlayerSession|null=null;
export const playerSession=()=>current;
export async function authorizeCruciblePlayer(location:{pathname:string},storage:StorageLike|undefined,fetcher:typeof fetch=fetch){current=null;const testing=/\/test\/stage4\.html$/.test(location.pathname),backing=testing&&storage?{getItem:(key:string)=>storage.getItem('mm-stage2-test-'+key),setItem:(key:string,value:string)=>storage.setItem('mm-stage2-test-'+key,value)}:storage,profile=loadProfile(backing),stamp=testing?null:await serverTime(fetcher),state=testing?'open':stageAccess(3,profile.progress,stamp),gate=gateForStage(3)!;
 if(state!=='open')return {session:null,message:state==='title'?'Earn The Deep Gatebreaker in Stage 3 with one champion: 8 Titan clears, 3 without resetting, and 7 different altar powers used to break defenses in successful clears.':state==='date'?'Stage 4 opens '+openingText(gate)+'.':state==='clock'?'Connect to verify the Stage 4 opening time.':'Stage 4 is not available yet.'};
 if(!championAvailable(profile.identity.monsterId,profile.progress,stamp,testing))return {session:null,message:'Choose an unlocked champion on the event page.'};current=new CruciblePlayerSession(profile,backing,testing);return {session:current,message:''};
}
