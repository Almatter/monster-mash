import {MAP_CHUNKS} from './court-layout.ts';
import {BUILD_VERSION} from './config.ts';
const {size,cols,rows,left,top,cacheLimit}=MAP_CHUNKS;
type TerrainImage=ImageBitmap|HTMLImageElement;
type Tile={image:TerrainImage;used:number};
function release(image:TerrainImage){if('close' in image)image.close();else image.src='';}
// Fixed-capacity decoded image cache. Prefetch includes an entire tile beyond every view edge.
export class CourtTerrain {
 tiles=new Map<string,Tile>();pending=new Map<string,Promise<void>>();wanted=new Set<string>();queue:{x:number;y:number;priority:number}[]=[];clock=0;failures=0;peak=0;generation=0;
 readonly capacity=typeof matchMedia==='function'&&matchMedia('(pointer:coarse)').matches?24:cacheLimit;
 private retryAfter=new Map<string,number>();private bitmapSupported=typeof createImageBitmap==='function';
 private key(x:number,y:number){return x+'-'+y;}
 requestView(cx:number,cy:number,halfW:number,halfH:number){
  const x0=Math.max(0,Math.floor((cx-halfW-left)/size)-1),x1=Math.min(cols-1,Math.floor((cx+halfW-left)/size)+1),y0=Math.max(0,Math.floor((cy-halfH-top)/size)-1),y1=Math.min(rows-1,Math.floor((cy+halfH-top)/size)+1),wanted=new Set<string>(),candidates=[];
  const vx0=Math.floor((cx-halfW-80-left)/size),vx1=Math.floor((cx+halfW+80-left)/size),vy0=Math.floor((cy-halfH-80-top)/size),vy1=Math.floor((cy+halfH+80-top)/size);
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)candidates.push({x,y,priority:Math.hypot(left+(x+.5)*size-cx,top+(y+.5)*size-cy)-(x>=vx0&&x<=vx1&&y>=vy0&&y<=vy1?1000000:0)});
  const queue=[];for(const item of candidates.sort((a,b)=>a.priority-b.priority).slice(0,this.capacity)){const key=this.key(item.x,item.y);wanted.add(key);const tile=this.tiles.get(key);if(tile)tile.used=++this.clock;else if(!this.pending.has(key)&&performance.now()>=(this.retryAfter.get(key)??0))queue.push(item);}
  this.wanted=wanted;this.queue=queue;this.pump();
 }
 private pump(){while(this.pending.size<4&&this.queue.length){const {x,y}=this.queue.shift()!,key=this.key(x,y);if(this.tiles.has(key)||this.pending.has(key))continue;const task=this.load(x,y).finally(()=>{this.pending.delete(key);this.pump();});this.pending.set(key,task);}}
 private async load(x:number,y:number){const key=this.key(x,y),controller=new AbortController(),timer=setTimeout(()=>controller.abort(),12000);try{const response=await fetch('assets/arena/five-regions/'+key+'.webp?v='+BUILD_VERSION,{signal:controller.signal});if(!response.ok)throw Error('Map section '+response.status);const blob=await response.blob();let image:TerrainImage;try{if(!this.bitmapSupported)throw Error('Use normal image decoding');let abandoned=false;const decoding=createImageBitmap(blob).then(image=>{if(abandoned)image.close();return image;});let decodeTimer:ReturnType<typeof setTimeout>|undefined;try{image=await Promise.race([decoding,new Promise<never>((_,reject)=>{decodeTimer=setTimeout(()=>{abandoned=true;reject(Error('Bitmap decode timed out'));},8000);})]);}finally{clearTimeout(decodeTimer);}}catch{this.bitmapSupported=false;const url=URL.createObjectURL(blob);try{image=await new Promise<HTMLImageElement>((resolve,reject)=>{const img=new Image(),timeout=setTimeout(()=>reject(Error('Map decode timed out')),8000);img.onload=()=>{clearTimeout(timeout);resolve(img);};img.onerror=()=>{clearTimeout(timeout);reject(Error('Map decode failed'));};img.src=url;});}finally{URL.revokeObjectURL(url);}}while(this.tiles.size>=this.capacity){let oldest='',time=Infinity;for(const [id,tile] of this.tiles)if(!this.wanted.has(id)&&tile.used<time){oldest=id;time=tile.used;}if(!oldest){release(image);return;}release(this.tiles.get(oldest)!.image);this.tiles.delete(oldest);}if(!this.wanted.has(key)){release(image);return;}this.retryAfter.delete(key);this.tiles.set(key,{image,used:++this.clock});this.peak=Math.max(this.peak,this.tiles.size);}catch(error){this.retryAfter.set(key,performance.now()+2000);this.failures++;console.warn('Map section unavailable',key,error);}finally{clearTimeout(timer);}}
 ready(cx:number,cy:number,halfW:number,halfH:number){
  for(let y=Math.max(0,Math.floor((cy-halfH-top)/size));y<=Math.min(rows-1,Math.floor((cy+halfH-top)/size));y++)for(let x=Math.max(0,Math.floor((cx-halfW-left)/size));x<=Math.min(cols-1,Math.floor((cx+halfW-left)/size));x++)if(!this.tiles.has(this.key(x,y)))return false;
  return true;
 }
 async prepare(cx=0,cy=0,halfW=600,halfH=380){this.requestView(cx,cy,halfW,halfH);const visible=[];for(let y=Math.max(0,Math.floor((cy-halfH-top)/size));y<=Math.min(rows-1,Math.floor((cy+halfH-top)/size));y++)for(let x=Math.max(0,Math.floor((cx-halfW-left)/size));x<=Math.min(cols-1,Math.floor((cx+halfW-left)/size));x++)visible.push(this.key(x,y));let rounds=0;while(visible.some(k=>!this.tiles.has(k))&&rounds++<30){const tasks=[...this.pending.values()];if(!tasks.length)break;await Promise.all(tasks);}if(visible.some(k=>!this.tiles.has(k)))throw Error('The map could not load. Please try again.');}
 draw(c:CanvasRenderingContext2D,cx:number,cy:number,halfW:number,halfH:number){this.requestView(cx,cy,halfW,halfH);for(const [key,tile] of this.tiles){const [x,y]=key.split('-').map(Number),px=left+x*size,py=top+y*size;if(px>cx+halfW+2||px+size<cx-halfW-2||py>cy+halfH+2||py+size<cy-halfH-2)continue;c.drawImage(tile.image,px-2,py-2,size+4,size+4);tile.used=++this.clock;}}
}
