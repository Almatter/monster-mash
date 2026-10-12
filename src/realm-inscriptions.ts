import {REALM_CLUES,REALM_PATHS} from './realm-layout.ts';
import {insideRealm,inTitanArena} from './titan-realm-map.ts';
import {TITAN_SEAL} from './realm-zones.ts';
export type RealmInscription={x:number;y:number;bridge:string;text?:string};
export const INSCRIPTION_BRIDGES=['north-ascent','east-ascent','buried-ascent','foundry-ascent','west-ascent'];
// The southern inscription stays by the opening approach. Other posts use clear
// walking floor beyond the engagement wall, never inside the Titan's arena.
export const INSCRIPTION_SITES=INSCRIPTION_BRIDGES.map(bridge=>{
 const path=REALM_PATHS.find(p=>p.id===bridge)!;
 const points=path.curve.filter(p=>insideRealm(p.x,p.y,35)&&!inTitanArena(p.x,p.y)&&((p.x-TITAN_SEAL.x)/(TITAN_SEAL.rx+170))**2+((p.y-TITAN_SEAL.y)/(TITAN_SEAL.ry+170))**2>1&&Math.hypot(p.x,p.y+38)>1300&&Math.hypot(p.x,p.y+38)<2300);
 if(!points.length)throw Error('No safe inscription sites on '+bridge);
 return {bridge,points};
});
export function createRealmInscriptions(random:()=>number):RealmInscription[]{
 const bridges=[...INSCRIPTION_SITES];for(let i=bridges.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[bridges[i],bridges[j]]=[bridges[j],bridges[i]];}
 const posts:RealmInscription[]=[{...REALM_CLUES[0],bridge:'south-ascent'}];
 for(const route of bridges.slice(0,3)){const available=route.points.filter(p=>posts.every(q=>Math.hypot(q.x-p.x,q.y-p.y)>280));if(!available.length)throw Error('Inscription sites overlap on '+route.bridge);const p=available[Math.floor(random()*available.length)];posts.push({...p,bridge:route.bridge});}
 return posts;
}

