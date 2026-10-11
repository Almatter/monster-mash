export type MapDocument={version:number;map:string;rooms:any[];decks:any[];structures:any[];arena:number[];patches:{add:boolean;points:number[][]}[];unitsPerPixel?:number;background?:{dataUrl:string;width:number;height:number};markers?:{id:string;name:string;point:number[]}[]};
export function polygonContains(points:number[][],x:number,y:number){let hit=false;for(let i=0,j=points.length-1;i<points.length;j=i++){const a=points[i],b=points[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])hit=!hit;}return hit;}
export function ellipseContains(e:number[],x:number,y:number){return e[2]>0&&e[3]>0&&((x-e[0])/e[2])**2+((y-e[1])/e[3])**2<1;}
export function documentFloor(d:MapDocument,x:number,y:number){if(d.background?(x<0||y<0||x>d.background.width||y>d.background.height):(Math.abs((x-632)*7.4)>5000||Math.abs((y-524)*7.4-38)>5000))return false;if(d.structures.some(s=>ellipseContains(s[1],x,y)))return false;let floor=ellipseContains(d.arena,x,y)||d.rooms.some(r=>polygonContains(r[7],x,y))||d.decks.some(r=>polygonContains(r[3],x,y));for(const p of d.patches)if(polygonContains(p.points,x,y))floor=p.add;return floor;}
export function documentWalkable(d:MapDocument,x:number,y:number,radius=30/(d.unitsPerPixel||7.4)){if(!documentFloor(d,x,y))return false;for(let i=0;i<24;i++){const a=i*Math.PI/12;if(!documentFloor(d,x+Math.cos(a)*radius,y+Math.sin(a)*radius))return false;}return true;}
export function validateMapDocument(value:unknown):MapDocument{
 const d=value as MapDocument,fail=(message:string):never=>{throw Error('Invalid map: '+message);};
 if(!d||d.version!==1||typeof d.map!=='string'||!/^[a-z0-9-]{1,80}$/.test(d.map))fail('expected a version 1 map project.');
 const titan=d.map==='mana-abyss-v43';
 if(!titan&&(!d.background||!/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(d.background.dataUrl)||d.background.dataUrl.length>16000000||![d.background.width,d.background.height].every(n=>Number.isInteger(n)&&n>0&&n<=16384)))fail('background image.');
 if(d.unitsPerPixel!==undefined&&(!Number.isFinite(d.unitsPerPixel)||d.unitsPerPixel<.1||d.unitsPerPixel>100))fail('map scale.');
 if(titan&&(d.background||d.unitsPerPixel!==undefined&&d.unitsPerPixel!==7.4))fail('Titan uses its registered artwork and 7.4 scale.');
 const number=(n:unknown)=>typeof n==='number'&&Number.isFinite(n)&&Math.abs(n)<=(titan?2000:20000);
 const point=(p:any)=>Array.isArray(p)&&p.length===2&&p.every(number);
 const polygon=(p:any)=>Array.isArray(p)&&p.length>=3&&p.length<=1000&&p.every(point);
 const ellipse=(e:any)=>Array.isArray(e)&&e.length===4&&e.every(number)&&e[2]>=0&&e[3]>=0&&e[2]<=(titan?400:20000)&&e[3]<=(titan?400:20000);
 const roomIds=['overlord','calamity','devourer','titan','sovereign','reaper','lycanthrope'];
 if(!Array.isArray(d.rooms)||(titan?d.rooms.length!==7:d.rooms.length>100)||d.rooms.some((r,i)=>!Array.isArray(r)||r.length!==8||(titan?r[0]!==roomIds[i]:typeof r[0]!=='string')||typeof r[1]!=='string'||r[1].length>80||!r.slice(2,7).every(point)||!polygon(r[7])))fail('shrine data or shrine order.');
 const routes=['barrow-archive','archive-fangs','fangs-foundry','foundry-throne','throne-crypt','crypt-ravine','north-ascent','east-ascent','south-ascent','buried-ascent','foundry-ascent','west-ascent'];
 if(!Array.isArray(d.decks)||(titan?d.decks.length!==12:d.decks.length>100)||d.decks.some((r,i)=>!Array.isArray(r)||(titan?r[0]!==routes[i]:typeof r[0]!=='string')||typeof r[1]!=='boolean'||!Array.isArray(r[2])||r[2].length<2||r[2].length>1000||!r[2].every(point)||!polygon(r[3])))fail('path data.');
 const bases=['barrow-altar','archive-altar','fang-altar','foundry-altar','throne-altar','crypt-altar','ravine-altar'];
 if(!Array.isArray(d.structures)||(titan&&d.structures.length<7)||d.structures.length>100||new Set(d.structures.map(s=>s?.[0])).size!==d.structures.length||d.structures.some((s,i)=>!Array.isArray(s)||typeof s[0]!=='string'||!/^[a-z0-9-]{1,60}$/.test(s[0])||(titan&&i<7&&s[0]!==bases[i])||!ellipse(s[1])||!polygon(s[2])||(s[3]!==undefined&&!number(s[3]))))fail('solid bases or foreground shapes.');
 if(!ellipse(d.arena)||!Array.isArray(d.patches)||d.patches.length>2000||d.patches.some(p=>!p||typeof p.add!=='boolean'||!polygon(p.points)))fail('arena or painted floor.');
 if(d.markers!==undefined&&(!Array.isArray(d.markers)||d.markers.length>500||d.markers.some(m=>!m||typeof m.id!=='string'||typeof m.name!=='string'||m.name.length>100||!point(m.point))))fail('map markers.');
 return JSON.parse(JSON.stringify(d));
}
