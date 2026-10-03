import {MAP_CHUNKS} from './court-layout.ts';
const {size,cols,rows,left,top,cacheLimit}=MAP_CHUNKS;
type Tile={image:ImageBitmap;used:number};
// Fixed-capacity decoded image cache. Prefetch includes an entire tile beyond every view edge.
export class CourtTerrain {
 tiles=new Map<string,Tile>();pending=new Map<string,Promise<void>>();wanted=new Set<string>();queue:{x:number;y:number;priority:number}[]=[];clock=0;failures=0;peak=0;generation=0;
 private key(x:number,y:number){return x+'-'+y;}
 requestView(cx:number,cy:number,halfW:number,halfH:number){
  const x0=Math.max(0,Math.floor((cx-halfW-left)/size)-1),x1=Math.min(cols-1,Math.floor((cx+halfW-left)/size)+1),y0=Math.max(0,Math.floor((cy-halfH-top)/size)-1),y1=Math.min(rows-1,Math.floor((cy+halfH-top)/size)+1),wanted=new Set<string>(),queue=[];
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const key=this.key(x,y);wanted.add(key);const tile=this.tiles.get(key);if(tile)tile.used=++this.clock;else if(!this.pending.has(key))queue.push({x,y,priority:Math.hypot(left+(x+.5)*size-cx,top+(y+.5)*size-cy)});}
  this.wanted=wanted;this.queue=queue.sort((a,b)=>a.priority-b.priority);this.pump();
 }
 private pump(){while(this.pending.size<4&&this.queue.length){const {x,y}=this.queue.shift()!,key=this.key(x,y);if(this.tiles.has(key)||this.pending.has(key))continue;const task=this.load(x,y).finally(()=>{this.pending.delete(key);this.pump();});this.pending.set(key,task);}}
 private async load(x:number,y:number){const key=this.key(x,y);try{const response=await fetch('assets/arena/five-regions/'+key+'.webp');if(!response.ok)throw Error('Map section '+response.status);const image=await createImageBitmap(await response.blob());while(this.tiles.size>=cacheLimit){let oldest='',time=Infinity;for(const [id,tile] of this.tiles)if(!this.wanted.has(id)&&tile.used<time){oldest=id;time=tile.used;}if(!oldest){image.close();return;}this.tiles.get(oldest)!.image.close();this.tiles.delete(oldest);}this.tiles.set(key,{image,used:++this.clock});this.peak=Math.max(this.peak,this.tiles.size);}catch(error){this.failures++;console.warn('Map section unavailable',key,error);}}
 ready(cx:number,cy:number,halfW:number,halfH:number){
  for(let y=Math.max(0,Math.floor((cy-halfH-top)/size));y<=Math.min(rows-1,Math.floor((cy+halfH-top)/size));y++)for(let x=Math.max(0,Math.floor((cx-halfW-left)/size));x<=Math.min(cols-1,Math.floor((cx+halfW-left)/size));x++)if(!this.tiles.has(this.key(x,y)))return false;
  return true;
 }
 async prepare(cx=0,cy=0,halfW=600,halfH=380){this.requestView(cx,cy,halfW,halfH);const visible=[];for(let y=Math.max(0,Math.floor((cy-halfH-top)/size));y<=Math.min(rows-1,Math.floor((cy+halfH-top)/size));y++)for(let x=Math.max(0,Math.floor((cx-halfW-left)/size));x<=Math.min(cols-1,Math.floor((cx+halfW-left)/size));x++)visible.push(this.key(x,y));let rounds=0;while(visible.some(k=>!this.tiles.has(k))&&rounds++<30){const tasks=[...this.pending.values()];if(!tasks.length)break;await Promise.all(tasks);}if(visible.some(k=>!this.tiles.has(k)))throw Error('The map could not load. Please try again.');}
 draw(c:CanvasRenderingContext2D,cx:number,cy:number,halfW:number,halfH:number){this.requestView(cx,cy,halfW,halfH);for(const [key,tile] of this.tiles){const [x,y]=key.split('-').map(Number),px=left+x*size,py=top+y*size;if(px>cx+halfW+2||px+size<cx-halfW-2||py>cy+halfH+2||py+size<cy-halfH-2)continue;c.drawImage(tile.image,px-2,py-2,size+4,size+4);tile.used=++this.clock;}}
}
