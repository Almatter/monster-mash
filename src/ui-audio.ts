import type {AudioEngine} from './audio.ts';

// Delegation includes controls created later in shops, records and dialogs.
export function bindUIAudio(audio:AudioEngine,root:Document=document,menuMusic=false){
 const selector='button,select,summary,a[href],[role="button"],[role="tab"],input[type="checkbox"],input[type="radio"],input[type="range"],input[type="color"]';
 const control=(target:EventTarget|null)=>{const el=target instanceof Element?target.closest<HTMLElement>(selector):null;return el&&!el.matches(':disabled,[aria-disabled="true"]')&&!el.closest('[hidden],[inert]')?el:null;};
 let pointer:HTMLElement|null=null;
 const preview=()=>{if(audio.context)void audio.unlockInterface().then(()=>audio.play('hover'));};
 const hover=(event:PointerEvent)=>{if(event.pointerType==='touch')return;const el=control(event.target);pointer=el;if(el&&!(event.relatedTarget instanceof Node&&el.contains(event.relatedTarget)))preview();};
 const focus=(event:FocusEvent)=>{const el=control(event.target);if(el&&el!==pointer)preview();};
 const click=(event:MouseEvent)=>{const el=control(event.target);if(!el)return;if(menuMusic)audio.unlock();void Promise.resolve().then(()=>audio.unlockInterface()).then(()=>audio.play(el.matches('.primary,[type="submit"]')?'confirm':'menu'));};
 const change=(event:Event)=>{if(control(event.target))void audio.unlockInterface().then(()=>audio.play('confirm'));};
 root.addEventListener('pointerover',hover,true);root.addEventListener('focusin',focus,true);root.addEventListener('click',click,true);root.addEventListener('change',change,true);
 return ()=>{root.removeEventListener('pointerover',hover,true);root.removeEventListener('focusin',focus,true);root.removeEventListener('click',click,true);root.removeEventListener('change',change,true);};
}
