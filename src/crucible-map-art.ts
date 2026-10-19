import {BUILD_VERSION} from './config.ts';

// Decoded ground stays bounded; the small overview also covers loading/failure gaps.
export class CrucibleMapArt{
 readonly overview=new Image();firelightPixels=0;private embers=document.createElement('canvas');private tiles=new Map<string,HTMLImageElement>();private pending=new Set<string>();private failed=new Set<string>();private queue:{x:number;y:number;key:string}[]=[];private loading=0;
 readonly tileWorld=960;readonly count=5;readonly limit=matchMedia('(pointer:coarse)').matches?16:24;
 constructor(){this.overview.src='assets/crucible/overview.webp?v='+BUILD_VERSION;}
 async ready(fires:{points:number[][]}[]=[]){await this.overview.decode();this.embers.width=this.overview.naturalWidth;this.embers.height=this.overview.naturalHeight;const context=this.embers.getContext('2d')!;context.drawImage(this.overview,0,0);const pixels=context.getImageData(0,0,this.embers.width,this.embers.height),regions=new Uint8Array(this.embers.width*this.embers.height);for(const fire of fires){const x=fire.points.reduce((n,p)=>n+p[0],0)/fire.points.length,y=fire.points.reduce((n,p)=>n+p[1],0)/fire.points.length;for(let row=Math.max(0,Math.floor(y-36));row<Math.min(this.embers.height,y+6);row++)regions.fill(1,row*this.embers.width+Math.max(0,Math.floor(x-26)),row*this.embers.width+Math.min(this.embers.width,Math.ceil(x+26)));}for(let i=0;i<pixels.data.length;i+=4){const r=pixels.data[i],g=pixels.data[i+1],b=pixels.data[i+2];pixels.data[i+3]=regions[i/4]&&r>245&&g>125&&b<185&&r>g*1.02&&g>b*1.4?Math.round(Math.min(1,(r-245)/10)*Math.min(1,(g-b)/90)*180):0;}this.firelightPixels=0;for(let i=3;i<pixels.data.length;i+=4)if(pixels.data[i])this.firelightPixels++;context.putImageData(pixels,0,0);}
 // Brighten the painted flame pixels themselves: no independent sprite anchors can drift.
 drawFirelight(c:CanvasRenderingContext2D,time:number){if(!this.embers.width)return;c.save();c.globalCompositeOperation='screen';c.globalAlpha=.26+.13*Math.sin(time*7.3)+.08*Math.sin(time*13.7);c.drawImage(this.embers,0,0,4800,4800);c.restore();}
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
