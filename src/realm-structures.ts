import {realmMasterPoint,REALM_SCALE} from './realm-layout.ts';
import type {RealmPoint} from './realm-layout.ts';
// A raised silhouette is scenery; only its feet occupy the ground. Coordinates
// are traced on the assembled master so rendering and collision stay registered.
type Definition=[string,number[],number[][]];
const definitions:Definition[]=[
 ['barrow-altar',[222,263,27,8],[[193,224],[208,216],[239,214],[250,224],[253,239],[263,252],[250,265],[222,271],[193,263],[186,251],[197,239]]],
 ['archive-altar',[697,153,19,7],[[681,108],[706,106],[714,121],[708,132],[720,146],[718,155],[699,163],[674,151],[670,139],[684,133]]],
 ['fang-altar',[1058,374,28,8],[[1031,352],[1041,334],[1053,330],[1063,335],[1070,327],[1084,337],[1088,351],[1090,370],[1075,381],[1047,384],[1026,374],[1023,362]]],
 ['foundry-altar',[1081,745,34,9],[[1040,691],[1037,680],[1046,679],[1057,688],[1069,676],[1084,681],[1094,675],[1105,683],[1103,697],[1120,700],[1127,716],[1133,739],[1112,753],[1080,758],[1048,746],[1032,731],[1032,708]]],
 ['throne-altar',[833,1082,28,8],[[816,1027],[837,1026],[852,1040],[852,1051],[867,1061],[866,1082],[842,1092],[812,1088],[800,1075],[802,1058],[817,1050]]],
 ['crypt-altar',[345,1065,26,8],[[325,1017],[343,1008],[360,1018],[366,1032],[369,1044],[379,1057],[367,1072],[345,1079],[319,1071],[309,1059],[320,1045],[320,1030]]],
 ['ravine-altar',[185,635,24,8],[[160,608],[169,586],[183,578],[194,586],[207,606],[213,622],[210,635],[192,643],[165,638],[153,629],[157,618]]],
 // Hanging cloth has no collision body. The supporting posts have small feet;
 // the full hanging banner is still foreground when a creature passes behind it.
 ['royal-stair-banner',[766,1006,4,4],[[751,896],[766,896],[780,909],[783,978],[788,994],[798,1000],[774,1009],[750,986]]],
 ['royal-west-banner',[756,1073,4,4],[[746,1008],[759,1009],[764,1022],[762,1070],[770,1080],[751,1082],[744,1064]]],
 ['royal-east-banner',[891,1074,4,4],[[879,1009],[893,1008],[902,1018],[902,1065],[913,1078],[891,1083],[880,1068]]],
 ['royal-west-statue',[818,980,13,7],[[792,876],[802,879],[816,855],[831,878],[842,881],[839,894],[831,902],[830,927],[839,938],[838,954],[833,978],[815,989],[796,980],[797,962],[806,948],[807,921],[798,907]]],
 ['royal-east-statue',[859,1000,12,7],[[843,868],[854,856],[868,869],[882,868],[886,882],[876,901],[875,937],[884,958],[879,981],[875,997],[856,1008],[840,996],[842,977],[851,961],[851,917],[844,895]]],
 ['royal-stair-west-lamp',[699,981,10,5],[[685,918],[696,927],[702,918],[713,937],[713,962],[708,978],[699,987],[684,977],[684,951]]],
 ['foundry-west-lamp',[996,753,7,5],[[988,721],[992,710],[999,724],[1009,728],[1007,752],[996,760],[985,751],[983,735]]],
 ['foundry-east-lamp',[1164,751,7,5],[[1156,716],[1163,702],[1169,719],[1176,728],[1173,749],[1163,756],[1152,747],[1151,732]]],
 ['foundry-south-post',[1140,804,10,6],[[1123,753],[1141,744],[1152,756],[1153,794],[1141,811],[1126,802]]],
 ['foundry-south-lamp',[1100,819,7,5],[[1090,792],[1097,778],[1105,793],[1114,801],[1110,816],[1100,827],[1088,817]]],
 ['barrow-east-statue',[310,288,12,6],[[298,244],[312,236],[322,249],[324,273],[318,287],[308,294],[296,282],[290,268]]],
 ['barrow-south-crypt',[178,282,17,7],[[158,247],[172,239],[188,249],[188,263],[195,274],[185,287],[165,288],[152,275]]],
 ['archive-south-standard',[702,251,10,5],[[691,200],[703,201],[714,212],[714,240],[719,249],[705,257],[690,247]]],
 ['archive-east-armillary',[783,184,11,5],[[775,116],[790,116],[800,128],[803,150],[793,169],[802,181],[789,191],[776,186],[762,172],[766,153],[760,137]]],
 ['fang-west-tusk',[983,381,12,6],[[968,315],[979,322],[989,340],[995,365],[999,376],[984,389],[970,380],[959,359],[959,340]]],
 ['fang-south-tusk',[1069,416,14,6],[[1050,365],[1061,369],[1070,387],[1081,387],[1086,402],[1082,416],[1069,423],[1056,414],[1043,396]]],
 ['fang-east-tusk',[1183,390,10,5],[[1161,316],[1172,322],[1181,343],[1197,365],[1193,385],[1182,397],[1170,388],[1168,365]]],
 ['ravine-south-crescent',[173,681,12,6],[[148,643],[157,627],[167,649],[178,644],[188,630],[190,651],[185,673],[176,689],[161,687],[146,672]]],
 ['ravine-east-statue',[246,646,9,5],[[232,595],[242,590],[253,605],[257,626],[256,641],[246,653],[232,644],[224,626]]],
 ['crypt-west-crescent',[295,960,15,6],[[264,901],[275,888],[285,911],[301,911],[311,893],[320,906],[318,934],[307,956],[293,971],[275,960],[263,940]]],
 ['crypt-east-mausoleum',[417,988,13,6],[[397,913],[416,897],[434,918],[439,947],[437,970],[428,987],[412,997],[399,985],[394,962]]],
 ['crypt-south-mausoleum',[399,1063,14,7],[[380,992],[399,977],[417,996],[424,1032],[417,1059],[400,1073],[381,1057],[377,1025]]],
];
export const REALM_STRUCTURES=definitions.map(([id,base,outline])=>{const p=realmMasterPoint(base[0],base[1]),foreground=outline.map(([x,y])=>realmMasterPoint(x,y));return {id,base:{...p,rx:base[2]*REALM_SCALE,ry:base[3]*REALM_SCALE},depthY:p.y+base[3]*REALM_SCALE,foreground,left:Math.min(...foreground.map(p=>p.x)),right:Math.max(...foreground.map(p=>p.x)),top:Math.min(...foreground.map(p=>p.y)),bottom:Math.max(...foreground.map(p=>p.y))};});
const cell=300,key=(x:number,y:number)=>Math.floor(x/cell)+':'+Math.floor(y/cell),bases=new Map<string,typeof REALM_STRUCTURES>(),fronts=new Map<string,typeof REALM_STRUCTURES>();
for(const s of REALM_STRUCTURES){for(const [map,x0,y0,x1,y1] of [[bases,s.base.x-s.base.rx,s.base.y-s.base.ry,s.base.x+s.base.rx,s.base.y+s.base.ry],[fronts,s.left-240,s.top-100,s.right+240,s.bottom+400]] as const)for(let x=Math.floor(x0/cell);x<=Math.floor(x1/cell);x++)for(let y=Math.floor(y0/cell);y<=Math.floor(y1/cell);y++){const k=x+':'+y;if(!map.has(k))map.set(k,[]);map.get(k)!.push(s);}}
export function realmStructureBlocks(x:number,y:number){return (bases.get(key(x,y))||[]).some(s=>((x-s.base.x)/s.base.rx)**2+((y-s.base.y)/s.base.ry)**2<1);}
export function realmOccluders(x:number,y:number,halfWidth=90,height=160){return (fronts.get(key(x,y))||[]).filter(s=>y<s.depthY-3&&s.right>x-halfWidth&&s.left<x+halfWidth&&s.bottom>y-height&&s.top<y+70);}
const masks=new Map<string,Path2D>();
function mask(s:typeof REALM_STRUCTURES[number],inverse:boolean){const key=s.id+inverse;let p=masks.get(key);if(p)return p;p=new Path2D();if(inverse)p.rect(-20000,-20000,40000,40000);s.foreground.forEach((v,i)=>i?p!.lineTo(v.x,v.y):p!.moveTo(v.x,v.y));p.closePath();masks.set(key,p);return p;}
export function clipRealmActor(c:CanvasRenderingContext2D,x:number,y:number,halfWidth=90,height=160){for(const s of realmOccluders(x,y,halfWidth,height))c.clip(mask(s,true),'evenodd');}
// The baked painting stays registered and opaque. A faint second sprite pass
// only inside its overlapping silhouette makes the prop translucent over the
// player without a second terrain atlas, downloads, or pixel work during play.
export function clipRealmPlayerVisibility(c:CanvasRenderingContext2D,x:number,y:number,halfWidth=90,height=160){const props=realmOccluders(x,y,halfWidth,height);if(!props.length)return false;const p=new Path2D();for(const s of props)p.addPath(mask(s,false));c.clip(p);c.globalAlpha*=.65;return true;}
