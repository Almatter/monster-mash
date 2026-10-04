// Authored Stage 2 layout. Artwork and geometry share this single coordinate system.
export type Point={x:number;y:number};
export type Lane={a:Point;b:Point;radius:number;region?:string};
export const COURT_BOUNDS={left:-5600,right:5600,top:-5400,bottom:5000};
export const COURT_RADIUS=8000;
export const REGION_SIZE=3000;
export const POCKETS=[{x:-1040,y:-930},{x:1010,y:-950},{x:900,y:980},{x:-800,y:950}];
export const LOOP=[{x:-500,y:-520},{x:560,y:-480},{x:520,y:540},{x:-560,y:500}];
export const COURT_REGIONS=[
 {id:'crownfall',name:'CROWNFALL KEEP',x:0,y:-3400,accent:'#b35d49'},
 {id:'emberforge',name:'EMBERFORGE',x:3400,y:-850,accent:'#d99a52'},
 {id:'chapel',name:'SUNKEN CHAPEL',x:2200,y:2700,accent:'#8eb5c1'},
 {id:'bonebarrow',name:'BONEBARROW',x:-2200,y:2700,accent:'#d7cfab'},
 {id:'wayfarer',name:"WAYFARER’S REST",x:-3400,y:-850,accent:'#a3ad7a'}
];
export const COURT_SITE_GROUPS=COURT_REGIONS.map(r=>POCKETS.map(p=>({x:r.x+p.x,y:r.y+p.y,region:r.id})));
export const COURT_SITES=COURT_SITE_GROUPS.flat();
export const COURT_SHRINES=[{x:0,y:0},{x:0,y:-2050},{x:2050,y:-850},{x:2200,y:1350},{x:-2200,y:1350},{x:-2050,y:-850}];
export const COURT_LANES:Lane[]=[];
const path=(points:Point[],radius:number,region?:string)=>{for(let i=1;i<points.length;i++)COURT_LANES.push({a:points[i-1],b:points[i],radius,region});};
for(const r of COURT_REGIONS){
 const at=(p:Point)=>({x:r.x+p.x,y:r.y+p.y});
 path([...LOOP,LOOP[0]].map(at),290,r.id);
 for(let i=0;i<4;i++){path([LOOP[i],POCKETS[i]].map(at),250,r.id);COURT_LANES.push({a:at(POCKETS[i]),b:at(POCKETS[i]),radius:300,region:r.id});}
 for(const points of [[{x:0,y:-1500},{x:0,y:-500}],[{x:1500,y:0},{x:540,y:0}],[{x:0,y:1500},{x:0,y:520}],[{x:-1500,y:0},{x:-540,y:0}]])path(points.map(at),265,r.id);
}
// Hub spokes and the outer circuit make each district accessible by two routes.
COURT_LANES.push({a:{x:0,y:0},b:{x:0,y:0},radius:830});
const links=[
 [[0,0],[0,-1200],[0,-2050]],
 [[0,0],[1120,-470],[2050,-850]],
 [[0,0],[1020,970],[2200,1350]],
 [[0,0],[-1020,970],[-2200,1350]],
 [[0,0],[-1120,-470],[-2050,-850]],
 [[1450,-3400],[2300,-3270],[3200,-2700],[3400,-2300]],
 [[3400,600],[3590,1420],[3700,2700]],
 [[750,2700],[480,3300],[-450,3410],[-750,2700]],
 [[-3700,2700],[-3590,1470],[-3400,600]],
 [[-3400,-2300],[-3140,-2920],[-2330,-3450],[-1450,-3400]]
];
for(const points of links)path(points.map(([x,y])=>({x,y})),330);
// Ordered exploration of every possible pocket, not an oracle for the seeded occupied sites.
export const COURT_SEARCH_ROUTE=COURT_REGIONS.flatMap(r=>[...POCKETS.map(p=>({x:r.x+p.x,y:r.y+p.y})),{x:r.x,y:r.y+900}]);
export function courtRegionAt(x:number,y:number){return COURT_REGIONS.find(r=>Math.abs(x-r.x)<1500&&Math.abs(y-r.y)<1500)??null;}
export const MAP_CHUNKS={size:512,density:1,cols:22,rows:21,left:COURT_BOUNDS.left,top:COURT_BOUNDS.top,cacheLimit:36};
