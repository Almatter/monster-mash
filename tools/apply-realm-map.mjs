import fs from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {validateMapDocument} from '../src/realm-map-document.ts';
const path=process.argv[2];
if(!path)throw Error('Usage: node tools/apply-realm-map.mjs path/to/monster-mash-map.json [--check]');
const data=validateMapDocument(JSON.parse(await fs.readFile(path,'utf8')));
if(data.map!=='mana-abyss-v43')throw Error('This importer updates the Titan map only. Other map projects are portable design files for their future stage implementation.');
if(process.argv.includes('--check')){console.log('Valid map file. No project files changed.');process.exit(0);}
const files=['src/realm-map-data.ts','src/realm-floor-data.ts'],previous=await Promise.all(files.map(p=>fs.readFile(p)));
try{
 await fs.writeFile(files[0],'// Master-pixel geometry. Edited with map-editor.html.\nexport const REALM_MAP_DATA='+JSON.stringify(data,null,2)+';\n');
 const result=spawnSync(process.execPath,['tools/pack-realm-collision.mjs'],{stdio:'inherit'});if(result.status!==0)throw Error('Collision compilation failed.');
 console.log('Map and collision updated. Run node tools/build.mjs to preview the game.');
}catch(error){await Promise.all(files.map((p,i)=>fs.writeFile(p,previous[i])));throw error;}
