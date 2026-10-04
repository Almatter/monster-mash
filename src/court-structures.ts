import {COURT_REGIONS,REGION_SIZE,type Point} from './court-layout.ts';
export type Structure={id:string;points:Point[];foreground:Point[];holes:Point[][];depthY:number;left:number;right:number;top:number;bottom:number};
// Traced in the finished 3000px paintings. Ground footprints and raised silhouettes are separate.
const centers:Record<string,{ground:number[][];front:number[][];holes?:number[][][]}>={
 crownfall:{ground:[[1290,1250],[1660,1230],[1770,1500],[1750,1670],[1490,1770],[1240,1720],[1170,1570]],front:[[1340,1030],[1450,1080],[1680,1070],[1790,1500],[1740,1660],[1490,1720],[1210,1660],[1190,1390],[1260,1190]]},
 emberforge:{ground:[[1230,1270],[1730,1220],[1910,1450],[1990,1640],[1860,1780],[1610,1870],[1240,1790],[1050,1640],[1060,1480]],front:[[1470,975],[1560,1010],[1640,975],[1840,1130],[1840,1360],[1940,1470],[1930,1690],[1770,1780],[1430,1800],[1210,1700],[1110,1510],[1150,1290],[1300,1170]],holes:[[[1630,1100],[1655,1075],[1685,1088],[1695,1100],[1690,1185],[1660,1178],[1630,1153]]]},
 chapel:{ground:[[1270,1330],[1690,1320],[1800,1550],[1700,1730],[1440,1800],[1180,1660],[1150,1500]],front:[[1400,900],[1460,985],[1530,1000],[1700,1040],[1740,1250],[1810,1380],[1760,1650],[1510,1770],[1270,1680],[1190,1430],[1290,1280],[1310,1010]]},
 bonebarrow:{ground:[[1190,1260],[1740,1240],[1890,1500],[1790,1700],[1540,1810],[1210,1720],[1080,1500]],front:[[1510,990],[1570,1050],[1740,1170],[1820,1360],[1880,1530],[1750,1710],[1510,1780],[1230,1720],[1120,1480],[1200,1300],[1200,1080],[1300,1160]]},
 wayfarer:{ground:[[1230,1300],[1650,1280],[1790,1500],[1770,1690],[1490,1770],[1180,1690],[1100,1530]],front:[[1360,1010],[1510,1110],[1660,1070],[1760,1300],[1850,1260],[1800,1590],[1700,1700],[1470,1750],[1200,1700],[1130,1510],[1220,1280],[1280,1120]]}
};
const bays=[
 [[730,0],[1220,0],[1160,260],[1200,600],[1050,725],[800,680],[770,500],[660,360]],
 [[1790,0],[2250,0],[2280,450],[2150,670],[1900,720],[1800,570],[1840,250]],
 [[0,875],[360,850],[650,950],[730,1150],[680,1300],[0,1340]],
 [[2380,850],[2720,830],[3000,880],[3000,1330],[2300,1310],[2260,1130]],
 [[0,1630],[510,1640],[690,1800],[715,1950],[590,2030],[0,2040]],
 [[2350,1640],[3000,1620],[3000,2030],[2480,2050],[2300,1890],[2260,1730]],
 [[1010,2260],[1190,2310],[1240,2610],[1190,3000],[720,3000],[790,2650],[850,2440]],
 [[1870,2290],[2060,2360],[2150,2600],[2280,3000],[1750,3000],[1790,2600]]
];
const props:Record<string,number[][]>={
 crownfall:[[250,390,105],[2740,430,100],[2610,2560,90],[270,2510,90]],
 emberforge:[[205,545,105],[725,400,165],[2690,740,100],[2630,2330,110],[310,2270,125]],
 chapel:[[725,470,110],[2640,400,130],[2610,2340,100],[325,2550,95]],
 bonebarrow:[[215,630,65],[2680,430,90],[2670,2350,120],[280,2410,85]],
 wayfarer:[[265,375,120],[2640,365,155],[2540,2190,140],[430,2360,110]]
};
export const COURT_STRUCTURES:Structure[]=[];
for(const region of COURT_REGIONS){
 const point=([x,y]:number[])=>({x:region.x+x-REGION_SIZE/2,y:region.y+y-REGION_SIZE/2});
 const add=(id:string,ground:number[][],foreground=ground,holes:number[][][]=[])=>{const points=ground.map(point),front=foreground.map(point);COURT_STRUCTURES.push({id:region.id+'-'+id,points,foreground:front,holes:holes.map(h=>h.map(point)),depthY:Math.max(...points.map(p=>p.y)),left:Math.min(...points.map(p=>p.x)),right:Math.max(...points.map(p=>p.x)),top:Math.min(...points.map(p=>p.y)),bottom:Math.max(...points.map(p=>p.y))});};
 add('landmark',centers[region.id].ground,centers[region.id].front,centers[region.id].holes);bays.forEach((p,i)=>add('ridge-'+i,p));
 props[region.id].forEach(([x,y,r],i)=>{const ground=Array.from({length:8},(_,n)=>[x+Math.cos(n*Math.PI/4)*r,y+Math.sin(n*Math.PI/4)*r*.7]);const front=ground.map(([px,py])=>[px,py<y?py-r*.5:py]);add('furnishing-'+i,ground,front);});
}
