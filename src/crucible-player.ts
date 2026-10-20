import {authorizeCruciblePlayer} from './crucible-player-session.ts';
let storage:Storage|undefined;try{storage=localStorage;}catch{}
const {session,message}=await authorizeCruciblePlayer(location,storage);
if(session){await import('./crucible-prototype.ts');}else{const root=document.createElement('main');root.className='access-panel';const heading=document.createElement('h1');heading.textContent='Stage 4 · Horde’s Judgment';const text=document.createElement('p');text.textContent=message;const home=document.createElement('a');home.href=/\/test\//.test(location.pathname)?'test/index.html':'index.html';home.textContent='Return to Monster Mash';home.style.color='#f0cf8b';root.append(heading,text,home);document.body.replaceChildren(root);}
