import {REALM_MAP_DATA} from './realm-map-data.ts';
export type RealmPoint={x:number;y:number};
// Geometry and art share one master. Floor polygons exclude cliff faces.
export const REALM_SCALE=7.4,REALM_REGION_SIZE=1800;
export const realmMasterPoint=(x:number,y:number)=>({x:(x-632)*REALM_SCALE,y:(y-524)*REALM_SCALE-38});
const world=(p:number[][])=>p.map(([x,y])=>realmMasterPoint(x,y));
const definitions:[string,string,number[],number[],number[],number[],number[],number[][]][]=REALM_MAP_DATA.rooms as [string,string,number[],number[],number[],number[],number[],number[][]][];
const altarSizes:Record<string,number[]>={overlord:[30,7],calamity:[19,7],devourer:[29,7],titan:[40,11],sovereign:[31,8],reaper:[30,8],lycanthrope:[26,8]};
export const REALM_GROTTOS=definitions.map(([nature,name,center,altar,interact,relic,portal,floor],id)=>{const p=realmMasterPoint(center[0],center[1]),relative=(v:number[])=>({x:(v[0]-center[0])*REALM_SCALE,y:(v[1]-center[1])*REALM_SCALE});return {id,nature:String(nature),name:String(name),...p,altar:relative(altar),altarRadius:{x:(altarSizes[nature]?.[0]||21)*REALM_SCALE,y:(altarSizes[nature]?.[1]||13)*REALM_SCALE},interact:relative(interact),relic:relative(relic),portal:relative(portal),floor:(floor as number[][]).map(v=>[(v[0]-center[0])*REALM_SCALE,(v[1]-center[1])*REALM_SCALE])};});
export const REALM_ARENA_ART={left:-1065,top:-785,width:2130,height:1494};
export const REALM_START=realmMasterPoint(644,744);
export const REALM_CLUES=[[644,710],[827,505],[635,357],[437,457]].map(([x,y])=>realmMasterPoint(x,y));
export const realmAltar=(id:number)=>{const s=REALM_GROTTOS[id];return {x:s.x+s.interact.x,y:s.y+s.interact.y};};
export const realmPortal=(id:number)=>{const s=REALM_GROTTOS[id];return {x:s.x+s.portal.x,y:s.y+s.portal.y};};
const decks:[string,boolean,number[][],number[][]][]=REALM_MAP_DATA.decks as [string,boolean,number[][],number[][]][];
export const REALM_ROUTES=decks.map(([id,stairs,path])=>({id,stairs,points:world(path).map(p=>[p.x,p.y])}));
export const REALM_DECKS=decks.map(([id,,,floor])=>({id,points:world(floor)}));
export function realmCurve(path:number[][]){const out:RealmPoint[]=[];for(let i=0;i<path.length-1;i++){const a=path[Math.max(0,i-1)],b=path[i],c=path[i+1],d=path[Math.min(path.length-1,i+2)],steps=Math.ceil(Math.hypot(c[0]-b[0],c[1]-b[1])/28);for(let k=0;k<steps;k++){const t=k/steps,t2=t*t,t3=t2*t,q={x:0,y:0};for(const [axis,index]of [['x',0],['y',1]]as const)q[axis]=.5*(2*b[index]+(-a[index]+c[index])*t+(2*a[index]-5*b[index]+4*c[index]-d[index])*t2+(-a[index]+3*b[index]-3*c[index]+d[index])*t3);out.push(q);}}out.push({x:path.at(-1)![0],y:path.at(-1)![1]});return out;}
export const REALM_PATHS=REALM_ROUTES.map(r=>({...r,radius:100,curve:realmCurve(r.points)}));
export const REALM_LOCAL_PATHS=REALM_PATHS;
