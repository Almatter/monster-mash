import {BUILD_VERSION} from './config.ts';

// Decoded ground stays bounded; the small overview also covers loading/failure gaps.
export class CrucibleMapArt{
 readonly overview=new Image();firelightPixels=0;private flames:{image:HTMLCanvasElement;x:number;y:number;phase:number}[]=[];private glow=document.createElement('canvas');private tiles=new Map<string,HTMLImageElement>();private pending=new Set<string>();private failed=new Set<string>();private queue:{x:number;y:number;key:string}[]=[];private loading=0;
 readonly tileWorld=960;readonly count=5;readonly limit=matchMedia('(pointer:coarse)').matches?16:24;
 constructor(){this.overview.src='assets/crucible/overview.webp?v='+BUILD_VERSION;}
 async ready(fires:{points:number[][]}[]=[]){for(let attempt=0;;attempt++){try{await this.overview.decode();break;}catch(error){if(attempt>=2)throw error;this.overview.src='assets/crucible/overview.webp?v='+BUILD_VERSION+'&retry='+(attempt+1);}}const source=document.createElement('canvas');source.width=this.overview.naturalWidth;source.height=this.overview.naturalHeight;const ctx=source.getContext('2d')!;ctx.drawImage(this.overview,0,0);this.flames=[];this.firelightPixels=0;
  for(const [index,fire] of fires.entries()){const x=fire.points.reduce((n,p)=>n+p[0],0)/fire.points.length,y=fire.points.reduce((n,p)=>n+p[1],0)/fire.points.length,image=document.createElement('canvas');image.width=20;image.height=26;const f=image.getContext('2d')!;f.drawImage(source,x-10,y-17,20,26,0,0,20,26);const pixels=f.getImageData(0,0,20,26);for(let i=0;i<pixels.data.length;i+=4){const r=pixels.data[i],g=pixels.data[i+1],b=pixels.data[i+2];pixels.data[i+3]=r>200&&g>75&&b<230&&r>g*.98&&g>b*1.08?220:0;if(pixels.data[i+3])this.firelightPixels++;}f.putImageData(pixels,0,0);this.flames.push({image,x:x*4,y:y*4,phase:index*2.39996});}
  source.width=source.height=0;this.glow.width=this.glow.height=96;const g=this.glow.getContext('2d')!,gradient=g.createRadialGradient(48,48,2,48,48,48);gradient.addColorStop(0,'rgba(255,145,35,.9)');gradient.addColorStop(.4,'rgba(245,80,10,.35)');gradient.addColorStop(1,'rgba(240,60,0,0)');g.fillStyle=gradient;g.fillRect(0,0,96,96);
 }
 // Animate the native flame crop, anchored at its painted base, plus reflected light.
 drawFirelight(c:CanvasRenderingContext2D,time:number,bounds?:{left:number;top:number;right:number;bottom:number}){for(const f of this.flames){if(bounds&&(f.x<bounds.left-100||f.x>bounds.right+100||f.y<bounds.top-130||f.y>bounds.bottom+100))continue;const wave=Math.sin(time*9.7+f.phase),fast=Math.sin(time*17.3+f.phase*1.7);c.save();c.globalCompositeOperation='screen';c.globalAlpha=.22+.12*wave+.06*fast;c.drawImage(this.glow,f.x-70,f.y-70,140,140);c.globalCompositeOperation='source-over';c.globalAlpha=.62+.18*fast;c.translate(f.x,f.y+36);c.transform(1+.06*fast,0,.035*wave,1+.16*wave+.05*fast,0,0);c.drawImage(f.image,-40,-104,80,104);c.restore();}}

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
