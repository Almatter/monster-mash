import {MONSTERS} from './content-monsters.ts';
import type {Identity} from './identity.ts';
export class CrucibleCelebration{
 started=performance.now();settled=false;canvas:HTMLCanvasElement;identity:Identity;portrait:CanvasImageSource;atlas:CanvasImageSource|undefined;aura:CanvasImageSource|undefined;hell:boolean;motion:boolean;
 constructor(canvas:HTMLCanvasElement,identity:Identity,portrait:CanvasImageSource,atlas:CanvasImageSource|undefined,aura:CanvasImageSource|undefined,hell:boolean,motion=!matchMedia('(prefers-reduced-motion: reduce)').matches){this.canvas=canvas;this.identity=identity;this.portrait=portrait;this.atlas=atlas;this.aura=aura;this.hell=hell;this.motion=motion;canvas.width=512;canvas.height=576;}
 get animated(){return this.hell&&this.motion&&!!this.atlas;}
 replay(){this.started=performance.now();this.settled=false;}
 draw(now:number){
  if(this.settled)return;const c=this.canvas.getContext('2d')!,t=(now-this.started)/1000,animated=this.animated&&t<3.2,blend=animated?Math.max(0,Math.min(1,(t-2.1)/1.1)):1;
  c.clearRect(0,0,512,576);c.imageSmoothingEnabled=true;c.imageSmoothingQuality='high';
  if(animated){
   if(this.aura){c.save();c.globalAlpha=(1-blend)*Math.min(.6,t*.7);c.translate(256,310);c.rotate(t*.18);c.drawImage(this.aura,-245,-245,490,490);c.restore();}
   const v=MONSTERS[this.identity.monsterId].visual,state=t<.35?'idle':t<.8?'attack':'ultimate',a=v.states[state],elapsed=t<.35?t:t<.8?t-.35:t-.8,frame=(a.startFrame||0)+Math.min(a.frames-1,Math.floor(elapsed*a.fps));
   c.save();c.globalAlpha=1-blend;c.translate(256,300);c.scale(v.facesLeft?-1:1,1);c.drawImage(this.atlas!,frame*v.frameSize,a.row*v.frameSize,v.frameSize,v.frameSize,-192,-192,384,384);c.restore();
  }
  if(blend>0){const source=this.portrait as HTMLCanvasElement,ratio=Math.min(512/source.width,560/source.height);c.save();c.globalAlpha=blend;c.drawImage(source,(512-source.width*ratio)/2,(576-source.height*ratio)/2,source.width*ratio,source.height*ratio);c.restore();}
  if(!animated)this.settled=true;
 }
}
