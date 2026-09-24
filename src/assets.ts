import {MONSTERS,type Channel,type Palette} from './content-monsters.ts';
import type {Identity} from './identity.ts';
export type LayerSet={base:string;primary?:string;secondary?:string;accent?:string;power?:string};
export type ArtEntry={gameplay?:LayerSet;portrait?:LayerSet;selection?:LayerSet;cutin?:LayerSet};
type ArtPack=Partial<Record<keyof ArtEntry,HTMLCanvasElement>>;
function loadImage(url:string){return new Promise<HTMLImageElement>((resolve,reject)=>{if(!url.startsWith('assets/')||url.includes('..')){reject(Error('Asset paths must stay inside assets/'));return;}const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(Error('Unable to load '+url));image.src=url;});}
export function tintLayer(image:CanvasImageSource,width:number,height:number,color:string){const c=document.createElement('canvas');c.width=width;c.height=height;const ctx=c.getContext('2d')!;ctx.drawImage(image,0,0);const frame=ctx.getImageData(0,0,width,height),pixels=frame.data,r=parseInt(color.slice(1,3),16),g=parseInt(color.slice(3,5),16),b=parseInt(color.slice(5,7),16);for(let i=0;i<pixels.length;i+=4){if(!pixels[i+3])continue;const shade=pixels[i]/255;pixels[i]=Math.round(r*shade);pixels[i+1]=Math.round(g*shade);pixels[i+2]=Math.round(b*shade);}ctx.putImageData(frame,0,0);return c;}
export const ART_DIMENSIONS={gameplay:[1536,1280],portrait:[512,512],selection:[768,1024],cutin:[1024,512]} as const;
export async function compose(set:LayerSet,colors:Palette,type:keyof ArtEntry,loader=loadImage){const base=await loader(set.base);const dims=ART_DIMENSIONS[type];if(base.width!==dims[0]||base.height!==dims[1])throw Error(type+' must be '+dims.join(' × ')+' pixels');const canvas=document.createElement('canvas');canvas.width=base.width;canvas.height=base.height;const c=canvas.getContext('2d')!;c.drawImage(base,0,0);for(const key of ['primary','secondary','accent','power'] as Channel[]){if(!set[key])continue;const layer=await loader(set[key]!);if(layer.width!==base.width||layer.height!==base.height)throw Error('Tint layers must share identical dimensions');c.drawImage(tintLayer(layer,base.width,base.height,colors[key]),0,0);}return canvas;}
// Compose only the art needed by the current screen. A prior completed frame stays visible during recoloring.
export class AssetLibrary {
 catalog:Record<string,ArtEntry>={};ready=false;cache=new Map<string,ArtPack>();pending=new Set<string>();failed=new Set<string>();lastGood=new Map<string,HTMLCanvasElement>();desired=new Map<string,string>();sourceCache=new Map<string,Promise<HTMLImageElement>>();
 constructor(){fetch('assets/catalog.json').then(r=>r.ok?r.json():{}).then(v=>{this.catalog=v&&typeof v==='object'&&!Array.isArray(v)?v:{};}).catch(()=>{}).finally(()=>{this.ready=true;});}
 image(url:string){const hit=this.sourceCache.get(url);if(hit){this.sourceCache.delete(url);this.sourceCache.set(url,hit);return hit;}const pending=loadImage(url).catch(error=>{this.sourceCache.delete(url);throw error;});this.sourceCache.set(url,pending);while(this.sourceCache.size>6)this.sourceCache.delete(this.sourceCache.keys().next().value!);return pending;}
 remember(slot:string,image:HTMLCanvasElement){this.lastGood.delete(slot);this.lastGood.set(slot,image);while(this.lastGood.size>4)this.lastGood.delete(this.lastGood.keys().next().value!);}
 status(identity:Identity,type:keyof ArtEntry){const key=identity.monsterId+Object.values(identity.colors).join('')+':'+type;return this.failed.has(key)?'failed':this.pending.has(key)||!this.ready?'loading':'ready';}
 get(identity:Identity,type:keyof ArtEntry='selection'):ArtPack|null{
  const key=identity.monsterId+Object.values(identity.colors).join(''),entry=this.catalog[identity.monsterId];
  if(!this.ready||!entry||!entry[type])return null;
  let pack=this.cache.get(key);if(pack){this.cache.delete(key);this.cache.set(key,pack);}else{pack={};this.cache.set(key,pack);}
  while(this.cache.size>4)this.cache.delete(this.cache.keys().next().value!);
  const request=key+':'+type,slot=identity.monsterId+':'+type;this.desired.set(slot,key);if(pack[type])this.remember(slot,pack[type]!);
  if(!pack[type]&&!this.pending.has(request)&&!this.failed.has(request)&&this.pending.size<2){
   this.pending.add(request);const target=pack;
   void compose(entry[type]!,{...identity.colors},type,url=>this.image(url)).then(image=>{
    if(type==='gameplay'){const spec=MONSTERS[identity.monsterId].visual,columns=Math.max(...Object.values(spec.states).map(s=>s.frames)),rows=Math.max(...Object.values(spec.states).map(s=>s.row))+1;if(image.width!==spec.frameSize*columns||image.height!==spec.frameSize*rows)throw Error('Gameplay atlas dimensions do not match monster animation metadata');}
    target[type]=image;if(this.desired.get(slot)===key)this.remember(slot,image);
   }).catch(error=>{console.warn('Art fallback:',identity.monsterId,type,error);this.failed.add(request);}).finally(()=>this.pending.delete(request));
  }
  if(!pack[type]&&!this.failed.has(request)){const previous=this.lastGood.get(identity.monsterId+':'+type);if(previous)return {...pack,[type]:previous};}
  return pack;
 }
 drawGameplay(ctx:CanvasRenderingContext2D,identity:Identity,x:number,y:number,time:number,state:string,scale=1){const atlas=this.get(identity,'gameplay')?.gameplay;if(!atlas)return false;const v=MONSTERS[identity.monsterId].visual,animation=v.states[state]||v.states.idle,frame=Math.floor(time*animation.fps)%animation.frames;ctx.save();ctx.fillStyle='#0005';ctx.beginPath();ctx.ellipse(x,y+12*scale,38*scale,12*scale,0,0,Math.PI*2);ctx.fill();ctx.restore();ctx.drawImage(atlas,frame*v.frameSize,animation.row*v.frameSize,v.frameSize,v.frameSize,x-64*scale,y-80*scale,128*scale,128*scale);return true;}
}
