import {realmMasterPoint,REALM_SCALE} from './realm-layout.ts';
import type {RealmPoint} from './realm-layout.ts';
// A raised silhouette is scenery; only its feet occupy the ground. Coordinates
// are traced on the assembled master so rendering and collision stay registered.
type Definition=[string,number[],number[][]];
const definitions:Definition[]=[
 ["barrow-altar",[222,256,30,7],[[191,237],[198,226],[209,222],[210,215],[225,214],[240,218],[243,228],[252,231],[256,245],[255,255],[242,263],[216,265],[193,257],[185,248]]],
 ["archive-altar",[697,153,19,7],[[681,108],[706,106],[714,121],[708,132],[720,146],[718,155],[699,163],[674,151],[670,139],[684,133]]],
 ["fang-altar",[1059,363,29,7],[[1037,326],[1040,336],[1050,329],[1052,313],[1061,316],[1070,332],[1078,320],[1086,315],[1090,334],[1084,347],[1089,360],[1073,369],[1053,370],[1034,362],[1029,349]]],
 ["foundry-altar",[1084,731,40,11],[[1039,684],[1046,680],[1054,685],[1059,668],[1070,666],[1087,672],[1097,669],[1107,684],[1105,695],[1116,698],[1127,709],[1131,724],[1115,738],[1084,744],[1062,739],[1045,731],[1033,718],[1034,706],[1044,698]]],
 ["throne-altar",[833,1072,31,8],[[816,1039],[820,1027],[828,1025],[833,1033],[841,1027],[849,1035],[851,1050],[861,1053],[864,1069],[853,1081],[828,1084],[810,1079],[799,1067],[803,1057],[816,1052]]],
 ["crypt-altar",[345,1063,30,8],[[314,1045],[318,1021],[325,1025],[330,1025],[342,1007],[348,1005],[352,1023],[363,1028],[370,1020],[376,1028],[374,1051],[384,1061],[369,1073],[343,1075],[321,1069],[312,1060]]],
 ["ravine-altar",[185,626,26,8],[[156,605],[164,585],[177,575],[173,586],[168,597],[176,598],[183,582],[190,584],[197,598],[204,592],[212,578],[212,595],[208,605],[215,618],[214,628],[199,635],[181,638],[162,631],[153,624]]],
 ["royal-stair-banner",[766,1007,0,0],[[745,898],[755,900],[780,911],[782,991],[775,1007],[765,996],[757,1001],[748,987]]],
 ["royal-west-banner",[747,1107,0,0],[[733,1037],[746,1037],[757,1043],[760,1098],[752,1107],[742,1100],[735,1091]]],
 ["royal-east-banner",[891,1034,0,0],[[879,949],[898,949],[902,1019],[892,1034],[881,1023]]],
 ["royal-west-statue",[813,972,17,7],[[793,872],[801,877],[816,855],[829,876],[840,881],[835,896],[826,903],[825,927],[830,939],[826,955],[833,965],[825,975],[807,980],[794,970],[800,957],[805,943],[805,921],[797,907]]],
 ["royal-east-statue",[855,993,16,8],[[843,868],[854,856],[868,869],[882,868],[882,881],[873,901],[873,937],[879,952],[875,971],[879,989],[863,1001],[845,997],[838,984],[850,960],[850,917],[844,895]]],
 ["buried-west-brazier",[389,419,7,3],[[382,400],[389,396],[398,401],[398,416],[390,421],[382,417]]],
 ["buried-east-brazier",[410,419,7,3],[[402,400],[410,396],[419,401],[418,416],[410,422],[402,417]]]
];

export const REALM_STRUCTURES=definitions.map(([id,base,outline])=>{const p=realmMasterPoint(base[0],base[1]),foreground=outline.map(([x,y])=>realmMasterPoint(x,y));return {id,base:{...p,rx:base[2]*REALM_SCALE,ry:base[3]*REALM_SCALE},depthY:p.y+base[3]*REALM_SCALE,foreground,left:Math.min(...foreground.map(p=>p.x)),right:Math.max(...foreground.map(p=>p.x)),top:Math.min(...foreground.map(p=>p.y)),bottom:Math.max(...foreground.map(p=>p.y))};});
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
