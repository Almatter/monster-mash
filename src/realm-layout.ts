export type RealmPoint={x:number;y:number};
export const REALM_REGION_SIZE=1200;
export const REALM_GROTTOS=[
 {id:0,nature:'overlord',x:-1050,y:-1050,name:'Buried Court',altar:{x:-160,y:-170},relic:{x:-160,y:-220},portal:{x:180,y:160},floor:[[-360,-246],[-170,-336],[218,-294],[354,-96],[278,172],[-38,284],[-318,224]]},
 {id:1,nature:'calamity',x:220,y:-1430,name:'Starless Archive',altar:{x:120,y:-200},relic:{x:120,y:-260},portal:{x:-80,y:-10},floor:[[-404,-170],[-240,-312],[52,-360],[320,-180],[340,70],[6,180],[-254,56]]},
 {id:2,nature:'devourer',x:1290,y:-850,name:'Fang Den',altar:{x:-200,y:100},relic:{x:-200,y:40},portal:{x:230,y:-120},floor:[[-360,-180],[-260,-300],[-44,-276],[296,-340],[350,-66],[206,160],[-80,148],[-256,104]]},
 {id:3,nature:'titan',x:1440,y:520,name:'Shattered Foundry',altar:{x:200,y:80},relic:{x:200,y:20},portal:{x:-130,y:-230},floor:[[-300,-300],[100,-348],[360,-132],[332,122],[32,228],[-236,194],[-328,16]]},
 {id:4,nature:'sovereign',x:580,y:1400,name:'Fallen Throne',altar:{x:100,y:200},relic:{x:100,y:135},portal:{x:-210,y:-60},floor:[[-300,-292],[186,-258],[316,-120],[228,116],[216,264],[0,334],[-234,240],[-346,-20]]},
 {id:5,nature:'reaper',x:-800,y:1450,name:'Moon Crypt',altar:{x:-110,y:180},relic:{x:-110,y:120},portal:{x:220,y:-130},floor:[[-366,-94],[-236,-306],[54,-342],[276,-198],[350,44],[156,256],[-136,316],[-368,118]]},
 {id:6,nature:'lycanthrope',x:-1520,y:260,name:'Moonfang Ravine',altar:{x:170,y:-130},relic:{x:170,y:-190},portal:{x:-50,y:40},floor:[[-314,-136],[-98,-320],[114,-280],[294,-126],[290,28],[10,178],[-136,194],[-276,78]]}
];
export const REALM_ARENA_ART={left:-660,top:-750,width:1320,height:1680};
export const REALM_START={x:80,y:1050};
export const REALM_CLUES=[{x:80,y:1050},{x:775,y:-30},{x:20,y:-920},{x:-850,y:110}];
export const realmAltar=(id:number)=>{const s=REALM_GROTTOS[id];const side=id===2?115:id===3||id===4?-115:0;return {x:s.x+s.altar.x+side,y:s.y+s.altar.y+(side?0:80)};};
export const realmPortal=(id:number)=>{const s=REALM_GROTTOS[id];return {x:s.x+s.portal.x,y:s.y+s.portal.y};};
// External winding connectors join the actual painted entrances, not a square grid.
export const REALM_ROUTES=[
 {id:'barrow-archive',stairs:false,points:[[-450,-1540],[-495,-1620],[-420,-1710],[-380,-1650]]},
 {id:'archive-fangs',stairs:false,points:[[820,-1410],[840,-1470],[790,-1450]]},
 {id:'fangs-foundry',stairs:false,points:[[1538,-250],[1590,-245],[1675,-190],[1610,-145],[1640,-80]]},
 {id:'foundry-throne',stairs:false,points:[[1120,1120],[1230,1150],[1260,1050],[1180,1020]]},
 {id:'throne-crypt',stairs:false,points:[[-20,1680],[-30,1800],[-140,1840],[-200,1700]]},
 {id:'crypt-ravine',stairs:false,points:[[-1250,850],[-1280,950],[-1360,920],[-1310,860]]},
 {id:'ravine-barrow',stairs:false,points:[[-1660,-340],[-1820,-420],[-1780,-660],[-1630,-700],[-1650,-840]]},
 {id:'north-ascent',stairs:true,points:[[33,-750],[-30,-800],[20,-920],[125,-950],[140,-830]]},
 {id:'east-ascent',stairs:true,points:[[660,-106],[745,-125],[775,-30],[860,-20],[840,70]]},
 {id:'south-ascent',stairs:true,points:[[-121,930],[-60,1020],[80,1050],[185,935],[90,875],[120,800]]},
 {id:'west-ascent',stairs:true,points:[[-660,76],[-750,150],[-850,110],[-885,-10],[-920,-90]]}
];
// Catmull-Rom interpolation turns authored bends into smooth, reproducible floors.
export function realmCurve(points:number[][]){const out:RealmPoint[]=[];for(let i=0;i<points.length-1;i++){const a=points[Math.max(0,i-1)],b=points[i],c=points[i+1],d=points[Math.min(points.length-1,i+2)],steps=Math.ceil(Math.hypot(c[0]-b[0],c[1]-b[1])/28);for(let k=0;k<steps;k++){const t=k/steps,t2=t*t,t3=t2*t,outPoint={x:0,y:0};for(const [axis,index] of [['x',0],['y',1]] as const)outPoint[axis]=.5*(2*b[index]+(-a[index]+c[index])*t+(2*a[index]-5*b[index]+4*c[index]-d[index])*t2+(-a[index]+3*b[index]-3*c[index]+d[index])*t3);out.push(outPoint);}}out.push({x:points.at(-1)![0],y:points.at(-1)![1]});return out;}
export const REALM_PATHS=REALM_ROUTES.map(r=>({...r,radius:r.stairs?82:76,curve:realmCurve(r.points)}));

// Local centerlines follow each image's floor through its winding illustrated approaches.
const localPixels=[
 [[[300,300],[285,220],[335,160],[440,105],[600,55]],[[300,300],[140,345],[85,357],[0,405]]],
 [[[300,260],[185,240],[110,220],[55,190],[0,190]],[[300,260],[390,265],[480,250],[535,265],[600,310]],[[300,260],[250,345],[220,420],[230,510],[260,600]]],
 [[[300,265],[267,190],[246,138],[154,115],[88,50],[50,0]],[[300,265],[390,345],[442,389],[464,450],[452,520],[424,600]]],
 [[[300,270],[208,210],[152,155],[80,70],[0,75]],[[300,270],[366,187],[424,110],[414,60],[400,0]],[[300,270],[320,374],[268,438],[172,493],[139,550],[140,600]]],
 [[[300,270],[227,209],[146,145],[95,60],[70,0]],[[300,270],[410,270],[488,232],[540,177],[600,110]],[[300,270],[265,390],[180,466],[113,472],[0,440]]],
 [[[300,270],[180,272],[75,232],[32,140],[55,0]],[[300,270],[350,382],[422,449],[501,455],[600,425]]],
 [[[300,260],[249,210],[228,135],[211,60],[230,0]],[[300,260],[370,280],[410,280],[465,235],[506,184],[600,125]],[[300,260],[279,364],[274,430],[316,505],[405,600]]]
];
export const REALM_LOCAL_PATHS=localPixels.flatMap((paths,id)=>paths.map(points=>({radius:58,curve:realmCurve(points.map(([x,y])=>[REALM_GROTTOS[id].x+(x-300)*2,REALM_GROTTOS[id].y+(y-300)*2]))})));
for(const points of [[[300,250],[285,140],[278,80],[290,40],[315,0]],[[300,250],[190,260],[100,270],[0,295]],[[300,250],[440,240],[530,240],[600,230]],[[300,250],[290,370],[280,430],[270,520],[245,600]]])REALM_LOCAL_PATHS.push({radius:68,curve:realmCurve(points.map(([x,y])=>[REALM_ARENA_ART.left+x/600*REALM_ARENA_ART.width,REALM_ARENA_ART.top+y/600*REALM_ARENA_ART.height]))});
