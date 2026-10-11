import {REALM_MAP_DATA} from './realm-map-data.ts';
import {realmMasterPoint,REALM_SCALE} from './realm-layout.ts';
import type {RealmPoint} from './realm-layout.ts';
// A raised silhouette is scenery; only its feet occupy the ground. Coordinates
// are traced on the assembled master so rendering and collision stay registered.
type Definition=[string,number[],number[][],number?];
const definitions:Definition[]=REALM_MAP_DATA.structures as Definition[];

export const REALM_STRUCTURES=definitions.map(([id,base,outline,depth])=>{const p=realmMasterPoint(base[0],base[1]),foreground=outline.map(([x,y])=>realmMasterPoint(x,y));return {id,base:{...p,rx:base[2]*REALM_SCALE,ry:base[3]*REALM_SCALE},depthY:depth===undefined?p.y+base[3]*REALM_SCALE:realmMasterPoint(0,depth).y,foreground,left:Math.min(...foreground.map(p=>p.x)),right:Math.max(...foreground.map(p=>p.x)),top:Math.min(...foreground.map(p=>p.y)),bottom:Math.max(...foreground.map(p=>p.y))};});
const cell=300,key=(x:number,y:number)=>Math.floor(x/cell)+':'+Math.floor(y/cell),bases=new Map<string,typeof REALM_STRUCTURES>(),fronts=new Map<string,typeof REALM_STRUCTURES>();
for(const s of REALM_STRUCTURES){for(const [map,x0,y0,x1,y1] of [[bases,s.base.x-s.base.rx,s.base.y-s.base.ry,s.base.x+s.base.rx,s.base.y+s.base.ry],[fronts,s.left-240,s.top-100,s.right+240,s.bottom+400]] as const)for(let x=Math.floor(x0/cell);x<=Math.floor(x1/cell);x++)for(let y=Math.floor(y0/cell);y<=Math.floor(y1/cell);y++){const k=x+':'+y;if(!map.has(k))map.set(k,[]);map.get(k)!.push(s);}}
export function realmStructureBlocks(x:number,y:number){return (bases.get(key(x,y))||[]).some(s=>s.base.rx>0&&((x-s.base.x)/s.base.rx)**2+((y-s.base.y)/s.base.ry)**2<1);}
export function realmOccluders(x:number,y:number,halfWidth=90,height=160){return (fronts.get(key(x,y))||[]).filter(s=>y<s.depthY-3&&s.right>x-halfWidth&&s.left<x+halfWidth&&s.bottom>y-height&&s.top<y+70);}
const masks=new Map<string,Path2D>();
function mask(s:typeof REALM_STRUCTURES[number],inverse:boolean){const key=s.id+inverse;let p=masks.get(key);if(p)return p;p=new Path2D();if(inverse)p.rect(-20000,-20000,40000,40000);s.foreground.forEach((v,i)=>i?p!.lineTo(v.x,v.y):p!.moveTo(v.x,v.y));p.closePath();masks.set(key,p);return p;}
export function clipRealmActor(c:CanvasRenderingContext2D,x:number,y:number,halfWidth=90,height=160){for(const s of realmOccluders(x,y,halfWidth,height))c.clip(mask(s,true),'evenodd');}
// The baked painting stays registered and opaque. A faint second sprite pass
// only inside its overlapping silhouette makes the prop translucent over the
// player without a second terrain atlas, downloads, or pixel work during play.
export function clipRealmPlayerVisibility(c:CanvasRenderingContext2D,x:number,y:number,halfWidth=90,height=160){const props=realmOccluders(x,y,halfWidth,height);if(!props.length)return false;const p=new Path2D();for(const s of props)p.addPath(mask(s,false));c.clip(p);c.globalAlpha*=.65;return true;}
