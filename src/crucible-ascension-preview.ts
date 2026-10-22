import {CrucibleCelebration} from './crucible-celebration.ts';
import type {AssetLibrary} from './assets.ts';
import type {Identity} from './identity.ts';
let dismiss:undefined|(()=>void);
// Saved Hell victories can be viewed without starting or awarding another run.
export function openHellAscension(identity:Identity,assets:AssetLibrary){
 dismiss?.();const dialog=document.createElement('dialog');dialog.id='hell-ascension-preview';dialog.setAttribute('aria-labelledby','ascension-preview-title');
 dialog.innerHTML='<span class="eyebrow">HELL VICTORY · UNLOCKED</span><h2 id="ascension-preview-title">Hell Ascension</h2><p class="ascension-identity"></p><canvas width="512" height="576" aria-label="Your champion’s Hell ascension"></canvas><p class="ascension-status" role="status"></p><div class="result-actions"><button class="ascension-play primary" type="button">Preparing ascension…</button><button class="ascension-close" type="button">Return to Records</button></div>';
 dialog.querySelector('.ascension-identity')!.textContent=[identity.name,identity.title].filter(Boolean).join(' · ');
 const canvas=dialog.querySelector('canvas')!,play=dialog.querySelector<HTMLButtonElement>('.ascension-play')!,status=dialog.querySelector<HTMLElement>('.ascension-status')!;
 let animation:CrucibleCelebration|undefined,frame=0,request=0;
 const draw=()=>{if(!dialog.open)return;animation?.draw(performance.now());if(animation&&!animation.settled)frame=requestAnimationFrame(draw);};
 const load=async(retry=false)=>{const generation=++request;play.disabled=true;status.textContent='Preparing your champion’s colors.';try{if(retry)assets.retry();await Promise.all(['portrait','gameplay'].map(type=>assets.prepare(identity,type as 'portrait'|'gameplay',true)));if(!dialog.open||generation!==request)return;
   animation=new CrucibleCelebration(canvas,identity,assets.completed(identity,'portrait')!,assets.completed(identity,'gameplay'),undefined,true);play.disabled=false;play.textContent=animation.animated?'Replay Hell ascension':'Play Hell ascension';status.textContent=animation.motion?'Your Hell victory animation is unlocked.':'Automatic animation is off because this device requests reduced motion. Choose Play to watch it once.';draw();
  }catch{if(!dialog.open||generation!==request)return;play.disabled=false;play.textContent='Retry Hell ascension';status.textContent='Could not load the animation. Your Hell victory remains unlocked. Choose Retry to try again.';}};
 play.onclick=()=>{if(!animation){void load(true);return;}cancelAnimationFrame(frame);animation.replay();play.textContent='Replay Hell ascension';status.textContent='Playing your Hell ascension.';draw();};
 const close=()=>dialog.close();dialog.querySelector<HTMLButtonElement>('.ascension-close')!.onclick=close;
 dialog.addEventListener('close',()=>{request++;cancelAnimationFrame(frame);dialog.remove();if(dismiss===close)dismiss=undefined;},{once:true});dismiss=close;
 document.body.append(dialog);dialog.showModal();void load();
}
