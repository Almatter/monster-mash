import {BUILD_VERSION} from './config.ts';
import {REALM_MAP_DATA} from './realm-map-data.ts';
import {validateMapDocument,type MapDocument} from './realm-map-document.ts';
export const EDITOR_PROJECTS=[
 {id:'mana-abyss-v43',query:'abyss',name:'Stage 3 · Mana Abyss',draft:'draft'},
 {id:'throne-war-v1',query:'war',name:'Stage 4 · Throne War',draft:'draft:throne-war-v1',url:'assets/stage4/map-document.json'}
];
export function editorDraftKey(map:string){return EDITOR_PROJECTS.find(p=>p.id===map)?.draft||'draft:custom';}
export function editorLocalKey(map:string){return map==='mana-abyss-v43'?'monster-mash-map-editor-v1':'monster-mash-map-editor-v1:'+map;}
export function editorProject(query:string|null){return EDITOR_PROJECTS.find(p=>p.query===query||p.id===query)||EDITOR_PROJECTS[0];}
export async function loadEditorProject(id:string):Promise<MapDocument>{
 const project=EDITOR_PROJECTS.find(p=>p.id===id);if(!project)throw Error('Unknown built-in map.');
 if(!project.url)return validateMapDocument(REALM_MAP_DATA);
 const response=await fetch(project.url+'?v='+BUILD_VERSION,{cache:'no-cache'});if(!response.ok)throw Error(project.name+' could not load ('+response.status+'). Your other map drafts are safe.');
 const doc=validateMapDocument(await response.json());if(doc.map!==project.id)throw Error('Map project does not match its catalog entry.');return doc;
}
