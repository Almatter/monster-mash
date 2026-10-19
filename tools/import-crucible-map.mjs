import {bakeCrucibleRoutes} from './bake-crucible-routes.mjs';
import fs from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {validateMapDocument,documentWalkable} from '../src/realm-map-document.ts';

export function validateCrucibleMap(value){const doc=validateMapDocument(value),scale=doc.unitsPerPixel||4;
 if(doc.map!=='crucible-v1'||doc.rooms.length!==8||doc.background.width*scale!==4800||doc.background.height*scale!==4800)throw Error('Crucible needs eight camps and a 4800 × 4800 world.');
 for(const room of doc.rooms){for(const index of [2,3,4,6])if(!documentWalkable(doc,...room[index],27/scale))throw Error(room[1]+' has a blocked crystal, rally or spawn point.');}
 for(const guard of doc.sentries||[])if(!documentWalkable(doc,...guard.point,25/scale))throw Error(guard.id+' has a blocked guardian position.');
 const nodes=[],edges=[];const node=point=>{let i=nodes.findIndex(p=>Math.hypot(p[0]-point[0],p[1]-point[1])<12/scale);if(i<0){i=nodes.length;nodes.push(point);}return i;};
 for(const line of doc.decks){if(doc.disabledRoutes?.includes(line[0]))continue;for(let i=1;i<line[2].length;i++){const a=line[2][i-1],b=line[2][i];edges.push([node(a),node(b)]);const count=Math.max(1,Math.ceil(Math.hypot(a[0]-b[0],a[1]-b[1])/8));for(let k=0;k<=count;k++)if(!documentWalkable(doc,a[0]+(b[0]-a[0])*k/count,a[1]+(b[1]-a[1])*k/count,30/scale))throw Error(line[0]+' crosses blocked ground.');}}
 const anchors=doc.rooms.flatMap(r=>[node(r[2]),node(r[3])]),seen=new Set([anchors[0]]);for(let changed=true;changed;){changed=false;for(const [a,b] of edges)if(seen.has(a)!==seen.has(b)){seen.add(a);seen.add(b);changed=true;}}if(anchors.some(i=>!seen.has(i)))throw Error('Every camp crystal and rally must connect to the army route network.');
 return doc;
}
export async function applyCrucibleMap(file){const doc=validateCrucibleMap(bakeCrucibleRoutes(validateCrucibleMap(JSON.parse(await fs.readFile(file,'utf8'))))),geometry=structuredClone(doc);geometry.background.dataUrl='';
 await fs.writeFile('art-source/crucible/layout.json',JSON.stringify(geometry,null,2)+'\n');
 await fs.writeFile('src/crucible-layout.ts',"// Generated from art-source/crucible/layout.json by tools/import-crucible-map.mjs.\nimport type {MapDocument} from './realm-map-document.ts';\nexport const CRUCIBLE_MAP="+JSON.stringify(geometry)+' as MapDocument;\n');
 await fs.writeFile('public/assets/crucible/map-document.json',JSON.stringify(doc));console.log('Applied Crucible terrain, camp anchors, guardians and routes.');
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href)await applyCrucibleMap(process.argv[2]||'public/assets/crucible/map-document.json');
