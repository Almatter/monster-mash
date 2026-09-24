import { ENEMIES, EVENT } from './data.ts';
import { Game } from './simulation.ts';
import {createIdentity,type Identity} from './identity.ts';
import {MONSTERS,type Palette} from './content-monsters.ts';
import {AssetLibrary} from './assets.ts';
export class Renderer {
 canvas:HTMLCanvasElement;ctx:CanvasRenderingContext2D;width=0;height=0;scale=1;dpr=1;low=false;shake=true;autoLow=false;
 assets=new AssetLibrary();previewIdentity:Identity=createIdentity();
 sprites=new Map<string,CanvasImageSource>(); background:HTMLCanvasElement;
 constructor(canvas:HTMLCanvasElement){this.canvas=canvas;this.ctx=canvas.getContext('2d',{alpha:false})!;this.background=this.makeGround();this.loadFloor();this.resize();for(const [kind,def] of Object.entries(ENEMIES)){this.sprites.set(kind,this.makeMonster(def.color,def.radius,kind));this.loadEnemy(kind);}}
 loadFloor(){const image=new Image();image.onload=()=>{const c=this.background.getContext('2d')!;c.clearRect(0,0,512,512);c.drawImage(image,0,0,512,512);};image.src='assets/arena/floor.webp';}
 loadEnemy(kind:string){const image=new Image();image.onload=()=>this.sprites.set(kind,image);image.src='assets/enemies/'+kind+'.webp';}
 resize(){this.width=innerWidth;this.height=innerHeight;this.dpr=Math.min(devicePixelRatio||1,2);this.canvas.width=Math.round(this.width*this.dpr);this.canvas.height=Math.round(this.height*this.dpr);this.scale=Math.max(.45,Math.min(this.width/1200,this.height/760));}
 makeGround(){
  const tile=document.createElement('canvas');tile.width=512;tile.height=512;const c=tile.getContext('2d')!;
  c.fillStyle='#211e23';c.fillRect(0,0,512,512);let seed=123456;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  for(let y=0;y<8;y++)for(let x=0;x<6;x++){const xx=x*100-(y%2)*50,yy=y*67;c.fillStyle=['#242126','#272329','#211f24'][Math.floor(rand()*3)];c.fillRect(xx+2,yy+2,96,63);c.strokeStyle='#302b30';c.strokeRect(xx+3,yy+3,94,61);c.strokeStyle='#17161b';c.beginPath();c.moveTo(xx+rand()*80,yy+4);c.lineTo(xx+40,yy+25);c.lineTo(xx+65,yy+30);c.stroke();}
  for(let i=0;i<1000;i++){c.fillStyle=rand()>.5?'#a1896910':'#05050925';c.fillRect(rand()*512,rand()*512,rand()*3+1,rand()*2+1);}return tile;
 }
 makeMonster(color:string,r:number,kind:string){
  const canvas=document.createElement('canvas');canvas.width=160;canvas.height=160;const c=canvas.getContext('2d')!;c.translate(80,80);c.scale(2,2);
  c.fillStyle='#06060aaa';c.beginPath();c.ellipse(0,13,27,12,0,0,Math.PI*2);c.fill();
  c.lineJoin='round';c.strokeStyle='#171218';c.lineWidth=2;
  const poly=(points:number[],fill:string)=>{c.fillStyle=fill;c.beginPath();points.forEach((v,i)=>{if(i%2===0){if(i===0)c.moveTo(v,points[i+1]);else c.lineTo(v,points[i+1]);}});c.closePath();c.fill();c.stroke();};
  if(kind==='wing'){poly([-6,-9,-35,-27,-27,5,-13,12,0,4],color);poly([6,-9,35,-27,27,5,13,12,0,4],color);}
  poly([-12,6,-21,24,-11,22,-5,10], '#4f4448');poly([12,6,21,24,11,22,5,10],'#4f4448');
  poly([-12,-12,-28,-4,-25,13,-18,9,-15,0],color);poly([12,-12,28,-4,25,13,18,9,15,0],color);
  poly([-14,-14,0,-21,14,-14,17,5,0,21,-17,5],color);
  poly([-11,-12,0,-16,11,-12,9,2,0,10,-9,2], '#383038');
  poly([-10,-20,-22,-32,-17,-10,-8,-6], '#d0b78c');poly([10,-20,22,-32,17,-10,8,-6],'#d0b78c');
  poly([-10,-20,0,-24,10,-20,11,-7,0,1,-11,-7],color);
  c.fillStyle=kind==='spitter'?'#f3b8ff':'#ffe0a0';c.fillRect(-8,-15,6,3);c.fillRect(2,-15,6,3);
  if(kind==='brute'||kind==='titan'||kind==='elite'){poly([-16,-16,-31,-20,-25,-6,-13,-5],'#dcc5a0');poly([16,-16,31,-20,25,-6,13,-5],'#dcc5a0');c.strokeStyle='#f2c48c';c.beginPath();c.moveTo(0,2);c.lineTo(0,15);c.stroke();}
  if(kind==='titan'){poly([-13,-24,-16,-39,-5,-30,0,-40,5,-30,16,-39,13,-24],'#f3c589');}
  return canvas;
 }
 worldToScreen(x:number,y:number,g:Game){return {x:this.width/2+(x-g.player.x)*this.scale,y:this.height/2+(y-g.player.y)*this.scale};}
 screenToWorld(x:number,y:number,g:Game){return {x:(x-this.width/2)/this.scale+g.player.x,y:(y-this.height/2)/this.scale+g.player.y};}
 draw(g:Game|null,time:number){
  const c=this.ctx,w=this.width,h=this.height;c.setTransform(this.dpr,0,0,this.dpr,0,0);c.fillStyle='#131217';c.fillRect(0,0,w,h);
  const cx=g?g.player.x:0,cy=g?g.player.y:0;
  c.save();c.translate(g?w/2:w*.77,g?h/2:h*.45);c.scale(this.scale,this.scale);c.translate(-cx,-cy);
  if(g&&this.shake&&g.shake>0)c.translate(Math.sin(time*61)*g.shake,Math.cos(time*47)*g.shake*.6);
  const extent=Math.max(w,h)/this.scale;c.fillStyle=c.createPattern(this.background,'repeat')!;c.fillRect(cx-extent,cy-extent,extent*2,extent*2);
  // Permanent ritual masonry: concentric rings, cardinal gates, inscriptions and braziers.
  c.strokeStyle='#8060473d';c.lineWidth=3;
  for(const r of [260,280,480,496,EVENT.arenaRadius]){c.beginPath();c.arc(0,0,r,0,Math.PI*2);c.stroke();}
  for(let i=0;i<24;i++){const a=i*Math.PI/12;c.save();c.rotate(a);c.translate(0,475);c.fillStyle='#a77c4f50';c.font='20px Georgia';c.fillText(['ᛉ','ᚷ','ᛟ','ᚹ'][i%4],-6,0);c.restore();}
  for(let i=0;i<8;i++){const a=i*Math.PI/4,x=Math.cos(a)*580,y=Math.sin(a)*580;c.fillStyle='#111015';c.fillRect(x-26,y-25,52,62);c.strokeStyle='#5b4840';c.strokeRect(x-25,y-24,50,60);c.fillStyle='#98775a';c.fillRect(x-20,y-19,40,7);const flicker=Math.sin(time*8+i)*5;c.fillStyle='#d7492d';c.beginPath();c.moveTo(x-15,y-10);c.quadraticCurveTo(x-23,y-30,x+flicker,y-58);c.quadraticCurveTo(x+3,y-25,x+17,y-9);c.fill();c.fillStyle='#ffc27d';c.beginPath();c.ellipse(x,y-14,7,16,0,0,7);c.fill();}
  if(!g){this.drawSovereign(c,0,0,time,0,3.5);c.restore();return;}
  const halfW=w/this.scale/2+100,halfH=h/this.scale/2+100;
  for(const e of g.enemies){if(!e.active||Math.abs(e.x-cx)>halfW||Math.abs(e.y-cy)>halfH)continue;const def=ENEMIES[e.kind],size=def.radius*4;
   if(e.windup>0){c.strokeStyle='#ff5a56';c.fillStyle='#e6404030';c.lineWidth=3;const r=e.kind==='titan'?240:140;c.beginPath();c.arc(e.x,e.y,r,0,Math.PI*2);c.fill();c.stroke();c.beginPath();c.arc(e.x,e.y,r*(1-e.windup/1.2),0,Math.PI*2);c.stroke();}
   c.drawImage(this.sprites.get(e.kind)!,e.x-size/2,e.y-size/2+Math.sin(time*8+e.serial)*1.5,size,size);
   if((e.corruptUntil||0)>g.time){c.strokeStyle=g.identity.colors.power;c.lineWidth=2;c.beginPath();c.arc(e.x,e.y,def.radius+4,0,7);c.stroke();}
   if(e.flash>0){c.fillStyle='#ffe5b8aa';c.beginPath();c.arc(e.x,e.y,def.radius*.7,0,7);c.fill();}
   if(e.kind==='elite'||e.kind==='titan'||e.hp<e.maxHp&&e.kind==='brute'){c.fillStyle='#21121c';c.fillRect(e.x-def.radius,e.y-def.radius*1.9,def.radius*2,4);c.fillStyle=def.color;c.fillRect(e.x-def.radius,e.y-def.radius*1.9,def.radius*2*Math.max(0,e.hp/e.maxHp),4);}
  }
  for(const f of g.fields){c.strokeStyle=g.identity.colors.power;c.lineWidth=3;c.setLineDash(f.kind==='meteor'?[10,8]:[]);c.beginPath();c.arc(f.x,f.y,f.radius,0,7);c.stroke();c.setLineDash([]);if(f.kind==='vortex'){c.beginPath();c.arc(f.x,f.y,f.radius*.6,time*3,time*3+5);c.stroke();}}
  for(const s of g.servants){if(!s.active)continue;c.globalAlpha=Math.min(1,s.life);c.drawImage(this.sprites.get('thrall')!,s.x-20,s.y-20,40,40);c.strokeStyle=g.identity.colors.power;c.lineWidth=2;c.beginPath();c.arc(s.x,s.y,23,0,7);c.stroke();c.fillStyle=g.identity.colors.power;c.fillRect(s.x-3,s.y-30,6,6);c.globalAlpha=1;}
  for(const b of g.bolts){c.strokeStyle=g.identity.colors.power;c.lineWidth=5;c.beginPath();c.moveTo(b.x,b.y);c.lineTo(b.x-b.vx*.03,b.y-b.vy*.03);c.stroke();}
  for(const b of g.debris){c.fillStyle='#bc9a81';c.save();c.translate(b.x,b.y);c.rotate(time*10);c.fillRect(-8,-8,16,16);c.restore();}
  for(const s of g.shots){c.fillStyle='#ed9bea';c.beginPath();c.arc(s.x,s.y,6,0,7);c.fill();c.strokeStyle='#803f93';c.beginPath();c.moveTo(s.x,s.y);c.lineTo(s.x-s.vx*.06,s.y-s.vy*.06);c.stroke();}
  if(g.shield>0){c.strokeStyle='#ade7f2';c.lineWidth=2;c.beginPath();c.arc(cx,cy,57*g.monster.visual.scale,0,Math.PI*2);c.stroke();}
  const state=g.ultimateTime>0?'ultimate':g.player.invuln>0?'hurt':g.attack>g.monster.basic.interval*.65?'attack':g.moving?'move':'idle';if(!this.assets.drawGameplay(c,g.identity,cx,cy,time,state,g.monster.visual.scale))this.drawSovereign(c,cx,cy,time,g.player.invuln,g.monster.visual.scale,g.player.rage,g.identity.colors);
  if(g.beam>0){c.save();c.translate(cx,cy);c.rotate(g.player.angle);c.fillStyle='#d6425380';c.fillRect(0,-35,g.beamPower.radius,70);c.fillStyle=g.identity.colors.power;c.fillRect(0,-17,g.beamPower.radius,34);c.fillStyle='#fff0d1';c.fillRect(0,-6,g.beamPower.radius,12);c.restore();}
  const sparse=this.low||this.autoLow;
  for(const e of g.effects){const t=1-e.life/e.max;c.globalAlpha=1-t;c.lineWidth=4;
   if(e.kind==='blood'){if(sparse)continue;c.fillStyle='#b74345';for(let i=0;i<5;i++){const a=i*2.4+e.x;c.beginPath();c.ellipse(e.x+Math.cos(a)*t*e.radius,e.y+Math.sin(a)*t*e.radius,4*(1-t)+1,2,a,0,7);c.fill();}}
   else if(e.kind==='claw'){c.strokeStyle='#f5d6a0';for(let i=0;i<3;i++){c.beginPath();c.arc(e.x,e.y,e.radius-i*12,e.angle-.9+t,e.angle+1.8+t);c.stroke();}}
   else {const colors:Record<string,string>={devour:'#bfe4a5',catastrophe:'#ffd39a',rupture:'#f1b169',slam:'#ff6265'};c.strokeStyle=e.kind==='slam'?colors.slam:g.identity.colors.power;c.lineWidth=e.kind==='catastrophe'?14:5;c.beginPath();c.arc(e.x,e.y,e.radius*(e.kind==='devour'?1-t:t),0,7);c.stroke();if(!sparse){c.lineWidth=2;c.beginPath();c.arc(e.x,e.y,e.radius*t*.8,0,7);c.stroke();}}
  }c.globalAlpha=1;c.restore();
  if(g.ultimateTime>0&&!this.low&&!this.autoLow){const cutin=this.assets.get(g.identity,'cutin')?.cutin;if(cutin){c.globalAlpha=Math.min(1,g.ultimateTime*3);c.drawImage(cutin,w*.62,h*.3,w*.36,w*.18);c.globalAlpha=1;}}
  if(g.player.hp<g.player.maxHp*.25){c.strokeStyle='#dc494b88';c.lineWidth=12;c.strokeRect(0,0,w,h);}
 }
 drawPreview(canvas:HTMLCanvasElement,time:number){const c=canvas.getContext('2d')!;c.clearRect(0,0,canvas.width,canvas.height);const pack=this.assets.get(this.previewIdentity,'selection'),portrait=pack?.selection;if(portrait){const scale=Math.min(canvas.width/portrait.width,canvas.height/portrait.height);c.drawImage(portrait,(canvas.width-portrait.width*scale)/2,0,portrait.width*scale,portrait.height*scale);}else this.drawSovereign(c,canvas.width/2,canvas.height*.56,time,0,2.6*MONSTERS[this.previewIdentity.monsterId].visual.scale,0,this.previewIdentity.colors);}
 drawSovereign(c:CanvasRenderingContext2D,x:number,y:number,time:number,hit:number,scale=1,rage=0,palette:Palette=MONSTERS.sovereign.palette){
  c.save();c.translate(x,y);c.scale(scale,scale);const breath=Math.sin(time*2)*1.2;c.translate(0,breath);
  c.fillStyle='#08080bd0';c.beginPath();c.ellipse(0,31,47,16,0,0,7);c.fill();
  if(rage>0){c.strokeStyle='#e7bc75';c.lineWidth=2;c.beginPath();c.arc(0,0,58,0,7);c.stroke();}
  const poly=(p:number[],fill:string)=>{c.fillStyle=fill;c.strokeStyle='#100c13';c.lineWidth=2;c.beginPath();for(let i=0;i<p.length;i+=2){if(!i)c.moveTo(p[i],p[i+1]);else c.lineTo(p[i],p[i+1]);}c.closePath();c.fill();c.stroke();};
  poly([-25,4,-38,49,-10,38,0,48,10,38,38,49,25,4],palette.secondary);
  poly([-20,12,-24,38,-10,36,-5,14],palette.primary);poly([20,12,24,38,10,36,5,14],palette.primary);
  poly([-20,-22,-41,-13,-48,17,-34,28,-26,8,-18,1],hit>0?'#dfb89b':palette.primary);poly([20,-22,41,-13,48,17,34,28,26,8,18,1],hit>0?'#dfb89b':palette.primary);
  poly([-25,-24,0,-32,25,-24,28,4,0,29,-28,4],hit>0?'#e6b69a':palette.primary);
  poly([-20,-18,0,-24,20,-18,15,5,0,19,-15,5],'#352732');
  poly([-22,-24,-43,-34,-36,-6,-23,-8],palette.accent);poly([22,-24,43,-34,36,-6,23,-8],palette.accent);
  poly([-13,-27,-27,-44,-29,-66,-15,-44,-5,-36],palette.accent);poly([13,-27,27,-44,29,-66,15,-44,5,-36],palette.accent);
  poly([-15,-39,0,-45,15,-39,13,-20,0,-10,-13,-20],palette.primary);
  poly([-11,-32,-2,-29,-4,-24,-11,-26],palette.power);poly([11,-32,2,-29,4,-24,11,-26],palette.power);
  poly([-5,-1,0,-12,5,-1,0,11],palette.power);
  for(const side of [-1,1])for(let i=0;i<3;i++)poly([side*(35+i*4),15,side*(33+i*6),35,side*(40+i*3),21],palette.accent);
  c.restore();
 }
}
