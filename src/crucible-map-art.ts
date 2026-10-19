import {BUILD_VERSION} from './config.ts';

// Decoded ground stays bounded; the small overview also covers loading/failure gaps.
export class CrucibleMapArt{
 readonly overview=new Image();private tiles=new Map<string,HTMLImageElement>();private pending=new Set<string>();private failed=new Set<string>();private queue:{x:number;y:number;key:string}[]=[];private loading=0;
 readonly tileWorld=960;readonly count=5;readonly limit=matchMedia('(pointer:coarse)').matches?16:24;
 constructor(){this.overview.src='assets/crucible/overview.webp?v='+BUILD_VERSION;}
 async ready(){await this.overview.decode();}
 private pump(){while(this.loading<3&&this.queue.length){const {x,y,key}=this.queue.shift()!;if(this.tiles.has(key)||this.failed.has(key)){this.pending.delete(key);continue;}this.loading++;const img=new Image();img.onload=()=>{this.loading--;this.pending.delete(key);this.tiles.set(key,img);while(this.tiles.size>this.limit){const old=this.tiles.keys().next().value!;this.tiles.get(old)!.src='';this.tiles.delete(old);}this.pump();};img.onerror=()=>{this.loading--;this.pending.delete(key);this.failed.add(key);this.pump();};img.src=`assets/crucible/tiles/${x}-${y}.webp?v=${BUILD_VERSION}`;}}
 draw(c:CanvasRenderingContext2D,bounds:{left:number;top:number;right:number;bottom:number},overview=false){if(this.overview.complete&&this.overview.naturalWidth)c.drawImage(this.overview,0,0,4800,4800);if(overview)return;
  const x0=Math.max(0,Math.floor(bounds.left/this.tileWorld)),y0=Math.max(0,Math.floor(bounds.top/this.tileWorld)),x1=Math.min(4,Math.floor(bounds.right/this.tileWorld)),y1=Math.min(4,Math.floor(bounds.bottom/this.tileWorld));
  // Drop obsolete requests when the camera changes camp or opens the overview.
  this.queue=this.queue.filter(q=>{const keep=q.x>=x0-1&&q.x<=x1+1&&q.y>=y0-1&&q.y<=y1+1;if(!keep)this.pending.delete(q.key);return keep;});
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){const key=x+'-'+y,img=this.tiles.get(key);if(img){this.tiles.delete(key);this.tiles.set(key,img);c.drawImage(img,2,2,1024,1024,x*this.tileWorld-.25,y*this.tileWorld-.25,this.tileWorld+.5,this.tileWorld+.5);}else if(!this.pending.has(key)&&!this.failed.has(key)){this.pending.add(key);this.queue.push({x,y,key});}}
  this.pump();
 }
 get decodedTiles(){return this.tiles.size;}
}
