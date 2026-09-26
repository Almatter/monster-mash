import {RELEASES} from './unbound.ts';
import {TORCHES} from './arena.ts';
import { ENEMIES, EVENT } from './data.ts';
import { Game } from './simulation.ts';
import {createIdentity,type Identity} from './identity.ts';
import {MONSTERS,type Palette} from './content-monsters.ts';
import {AssetLibrary} from './assets.ts';
export class Renderer {
 targeting:{x:number;y:number;radius:number;valid:boolean}|null=null;canvas:HTMLCanvasElement;ctx:CanvasRenderingContext2D;width=0;height=0;scale=1;dpr=1;low=false;shake=true;autoLow=false;fxLevel=0;slowTime=0;fastTime=0;
 adapt(milliseconds:number,dt:number,load=0){const target=milliseconds>34?3:milliseconds>27?2:milliseconds>22||load>650?1:0;if(target>this.fxLevel){this.slowTime+=dt;this.fastTime=0;if(this.slowTime>1.5){this.fxLevel++;this.slowTime=0;}}else if(target<this.fxLevel){this.fastTime+=dt;this.slowTime=0;if(this.fastTime>5){this.fxLevel--;this.fastTime=0;}}else{this.slowTime=0;this.fastTime=0;}this.autoLow=this.fxLevel>0;}
 assets=new AssetLibrary();previewIdentity:Identity=createIdentity();
 sprites=new Map<string,CanvasImageSource>();vfx=new Map<string,HTMLImageElement>(); background:HTMLCanvasElement;brazier:HTMLImageElement|null=null;
 constructor(canvas:HTMLCanvasElement){this.canvas=canvas;this.ctx=canvas.getContext('2d',{alpha:false})!;this.background=this.makeGround();this.loadFloor();const brazier=new Image();brazier.onload=()=>this.brazier=brazier;brazier.src='assets/arena/brazier.webp';this.loadVfx('sovereign');this.loadVfx('titan');this.loadVfx('devourer');this.loadVfx('calamity');this.loadVfx('overlord');this.loadVfx('hostile-bolt');this.loadVfx('hostile-elite');this.loadVfx('hostile-titan');this.resize();for(const [kind,def] of Object.entries(ENEMIES)){this.sprites.set(kind,this.makeMonster(def.color,def.radius,kind));this.loadEnemy(kind);}}
 loadVfx(kind:string){const image=new Image();image.onload=()=>this.vfx.set(kind,image);image.onerror=()=>console.warn('VFX load failed:',kind);image.src='assets/vfx/'+kind+'.webp';}
 drawVfx(c:CanvasRenderingContext2D,kind:string,x:number,y:number,size:number,angle=0,alpha=1){const image=this.vfx.get(kind);if(!image)return false;c.save();c.translate(x,y);c.rotate(angle);c.globalAlpha*=alpha;c.drawImage(image,-size/2,-size/2,size,size);c.restore();return true;}
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
  for(let i=0;i<TORCHES.length;i++){const {x}=TORCHES[i],y=TORCHES[i].y-31;if(this.brazier){c.drawImage(this.brazier,x-42,y-80,84,126);c.fillStyle='#ff9d4e';c.globalAlpha=.12+Math.sin(time*7+i)*.035;c.beginPath();c.arc(x,y-43,35,0,7);c.fill();c.globalAlpha=1;}}
  if(!g){this.drawSovereign(c,0,0,time,0,3.5);c.restore();return;}
  const detail=this.low?3:this.fxLevel;
  const halfW=w/this.scale/2+100,halfH=h/this.scale/2+100;
  for(const e of g.enemies){if(!e.active||Math.abs(e.x-cx)>halfW||Math.abs(e.y-cy)>halfH)continue;const def=ENEMIES[e.kind],size=def.radius*4;
   if(e.windup>0){c.strokeStyle='#ff5a56';c.fillStyle='#e6404030';c.lineWidth=3;const r=e.kind==='titan'?240:140;c.beginPath();c.arc(e.x,e.y,r,0,Math.PI*2);c.fill();c.stroke();c.beginPath();c.arc(e.x,e.y,r*(1-e.windup/1.2),0,Math.PI*2);c.stroke();}
   c.drawImage(this.sprites.get(e.kind)!,e.x-size/2,e.y-size/2+(detail>=3?0:Math.sin(time*8+e.serial)*1.5),size,size);
   if((e.corruptUntil||0)>g.time){c.strokeStyle=g.identity.colors.power;c.lineWidth=2;c.beginPath();c.arc(e.x,e.y,def.radius+4,0,7);c.stroke();}
   if(e.flash>0){c.fillStyle='#ffe5b8aa';c.beginPath();c.arc(e.x,e.y,def.radius*.7,0,7);c.fill();}
   if(e.kind==='elite'||e.kind==='titan'||e.hp<e.maxHp&&e.kind==='brute'){c.fillStyle='#21121c';c.fillRect(e.x-def.radius,e.y-def.radius*1.9,def.radius*2,4);c.fillStyle=def.color;c.fillRect(e.x-def.radius,e.y-def.radius*1.9,def.radius*2*Math.max(0,e.hp/e.maxHp),4);}
  }
  for(const f of g.fields){if(detail<2)this.drawVfx(c,g.monster.id,f.x,f.y,Math.min(f.radius*1.45,480),f.kind==='vortex'?time*.55:0,f.kind==='vortex'?.32:.2);c.strokeStyle=g.identity.colors.power;c.lineWidth=3;c.setLineDash(f.kind==='meteor'?[10,8]:[]);c.beginPath();c.arc(f.x,f.y,f.radius,0,7);c.stroke();c.setLineDash([]);if(f.kind==='vortex'){c.beginPath();c.arc(f.x,f.y,f.radius*.6,time*3,time*3+5);c.stroke();}}
  for(const s of g.servants){if(!s.active)continue;c.globalAlpha=Math.min(1,s.life);c.drawImage(this.sprites.get('thrall')!,s.x-20,s.y-20,40,40);c.strokeStyle=g.identity.colors.power;c.lineWidth=2;c.beginPath();c.arc(s.x,s.y,23,0,7);c.stroke();c.fillStyle=g.identity.colors.power;c.fillRect(s.x-3,s.y-30,6,6);c.globalAlpha=1;}
  for(const b of g.bolts){if(this.drawVfx(c,g.monster.id,b.x,b.y,32,Math.atan2(b.vy,b.vx)+time*5))continue;c.strokeStyle=g.identity.colors.power;c.lineWidth=5;c.beginPath();c.moveTo(b.x,b.y);c.lineTo(b.x-b.vx*.03,b.y-b.vy*.03);c.stroke();}
  for(const b of g.debris){if(this.drawVfx(c,'titan',b.x,b.y,26,time*10))continue;c.fillStyle='#bc9a81';c.fillRect(b.x-7,b.y-7,14,14);}
  for(const s of g.shots){if(this.drawVfx(c,'hostile-bolt',s.x,s.y,28,Math.atan2(s.vy,s.vx)))continue;c.fillStyle='#ed9bea';c.beginPath();c.arc(s.x,s.y,6,0,7);c.fill();}
  if(g.release>0){c.strokeStyle=g.identity.colors.power;c.globalAlpha=.35+g.release*.1;c.lineWidth=1+g.release;c.beginPath();c.ellipse(cx,cy+20,45+g.release*7,16+g.release*3,0,0,7);c.stroke();if(detail<2){c.beginPath();c.arc(cx,cy,56+g.release*8,time*.4,time*.4+Math.PI*(1+g.release*.2));c.stroke();}c.globalAlpha=1;}
  if(g.shield>0){c.strokeStyle='#ade7f2';c.lineWidth=2;c.beginPath();c.arc(cx,cy,57*g.monster.visual.scale,0,Math.PI*2);c.stroke();}
  if(g.dodgeInvuln>0){c.strokeStyle='#fff2cf';c.lineWidth=3;c.beginPath();c.arc(cx,cy,54*g.monster.visual.scale,0,7);c.stroke();}if(g.frenzyGuard>0){c.strokeStyle=g.identity.colors.power;c.lineWidth=3;c.beginPath();c.arc(cx,cy,65*g.monster.visual.scale,time*2,time*2+Math.PI*1.7);c.stroke();}
  const state=g.ultimateTime>0?'ultimate':g.player.invuln>0?'hurt':g.attack>g.monster.basic.interval*.65?'attack':g.moving?'move':'idle';if(!this.assets.drawGameplay(c,g.identity,cx,cy,detail>=3?Math.floor(time*5)/5:time,state,g.monster.visual.scale)){if(this.assets.status(g.identity,'gameplay')==='failed')this.drawSovereign(c,cx,cy,time,g.player.invuln,g.monster.visual.scale,g.player.rage,g.identity.colors);else this.drawLoading(c,cx,cy,time,70*g.monster.visual.scale);}
  if(g.beam>0){c.save();c.translate(cx,cy);c.rotate(g.player.angle);if(detail<2&&this.vfx.has(g.monster.id)){for(let x=45;x<g.beamPower.radius;x+=90)this.drawVfx(c,g.monster.id,x,0,(g.monster.id==='calamity'?42:48)*g.releaseStats.beam,time*2+x*.02,.68);}else{c.fillStyle='#d6425380';c.fillRect(0,-(g.monster.id==='calamity'?11:13)*g.releaseStats.beam,g.beamPower.radius,(g.monster.id==='calamity'?22:26)*g.releaseStats.beam);c.fillStyle=g.identity.colors.power;c.fillRect(0,-7*g.releaseStats.beam,g.beamPower.radius,14*g.releaseStats.beam);c.fillStyle='#fff0d1';c.fillRect(0,-3,g.beamPower.radius,6);}c.restore();}
  if(this.targeting){const t=this.targeting;c.save();c.strokeStyle=t.valid?g.identity.colors.power:'#ff625d';c.fillStyle=t.valid?'#e0b67b24':'#ff444424';c.lineWidth=3;c.setLineDash([10,7]);c.beginPath();c.arc(t.x,t.y,t.radius,0,7);c.fill();c.stroke();c.setLineDash([]);c.beginPath();c.moveTo(t.x-16,t.y);c.lineTo(t.x+16,t.y);c.moveTo(t.x,t.y-16);c.lineTo(t.x,t.y+16);c.stroke();c.restore();}
  const sparse=detail>=1;
  for(const e of g.effects){const t=1-e.life/e.max;c.globalAlpha=1-t;c.lineWidth=4;
   if(e.kind==='slam-titan'&&this.drawVfx(c,'hostile-titan',e.x,e.y,e.radius*2.1*(.7+t*.3),time*.08,1)){}
   else if(e.kind==='slam-elite'&&this.drawVfx(c,'hostile-elite',e.x,e.y,e.radius*2.1*(.72+t*.28),time*.13,1)){}
   else if(e.kind==='blood'){if(sparse)continue;c.fillStyle='#b74345';for(let i=0;i<5;i++){const a=i*2.4+e.x;c.beginPath();c.ellipse(e.x+Math.cos(a)*t*e.radius,e.y+Math.sin(a)*t*e.radius,4*(1-t)+1,2,a,0,7);c.fill();}}
   else if(e.kind==='claw'&&g.monster.id==='devourer'){c.strokeStyle=g.identity.colors.power;c.lineWidth=4;for(let i=0;i<3;i++){const a=e.angle+time*.5+i*2.1;c.beginPath();c.arc(e.x,e.y,e.radius-4-i*3,a,a+1.05);c.stroke();}}
   else if(detail<2&&this.drawVfx(c,g.monster.id,e.x,e.y,Math.min(e.radius*2,900)*(e.kind==='devour'?1-t*.5:.65+t*.35),e.angle+time*.7,1)){}
   else if(e.kind==='claw'){c.strokeStyle='#f5d6a0';for(let i=0;i<3;i++){c.beginPath();c.arc(e.x,e.y,e.radius-i*12,e.angle-.9+t,e.angle+1.8+t);c.stroke();}}
   else {const colors:Record<string,string>={devour:'#bfe4a5',catastrophe:'#ffd39a',rupture:'#f1b169',slam:'#ff6265'};c.strokeStyle=e.kind==='slam'?colors.slam:g.identity.colors.power;c.lineWidth=e.kind==='catastrophe'?14:5;c.beginPath();c.arc(e.x,e.y,e.radius*(e.kind==='devour'?1-t:t),0,7);c.stroke();if(!sparse){c.lineWidth=2;c.beginPath();c.arc(e.x,e.y,e.radius*t*.8,0,7);c.stroke();}}
  }c.globalAlpha=1;c.restore();
  if(g.ultimateTime>0&&!this.low&&!this.autoLow){const cutin=this.assets.get(g.identity,'cutin')?.cutin;if(cutin){c.globalAlpha=Math.min(1,g.ultimateTime*3);c.drawImage(cutin,w*.62,h*.3,w*.36,w*.18);c.globalAlpha=1;}}
  if(g.releaseTime>0){c.save();c.globalAlpha=Math.min(1,g.releaseTime*2);c.fillStyle='#100b18c9';c.fillRect(w*.12,h*.2,w*.76,64);c.textAlign='center';c.fillStyle=g.identity.colors.power;c.font='bold '+Math.min(30,w*.042)+'px Georgia';c.fillText(RELEASES[g.release].name,w/2,h*.2+28);c.fillStyle='#eee7d8';c.font='14px Georgia';c.fillText(g.identity.name,w/2,h*.2+51);c.restore();}
  if(g.player.hp<g.player.maxHp*.25){c.strokeStyle='#dc494b88';c.lineWidth=12;c.strokeRect(0,0,w,h);}
 }
 drawPreview(canvas:HTMLCanvasElement,time:number){const c=canvas.getContext('2d')!;c.clearRect(0,0,canvas.width,canvas.height);const pack=this.assets.get(this.previewIdentity,'selection'),portrait=pack?.selection;if(portrait){const scale=Math.min(canvas.width/portrait.width,canvas.height/portrait.height);c.drawImage(portrait,(canvas.width-portrait.width*scale)/2,0,portrait.width*scale,portrait.height*scale);}else if(this.assets.status(this.previewIdentity,'selection')==='failed')this.drawSovereign(c,canvas.width/2,canvas.height*.56,time,0,2.6*MONSTERS[this.previewIdentity.monsterId].visual.scale,0,this.previewIdentity.colors);else this.drawLoading(c,canvas.width/2,canvas.height*.48,time,Math.min(canvas.width,canvas.height)*.23);}
 drawLoading(c:CanvasRenderingContext2D,x:number,y:number,time:number,r:number){c.save();c.translate(x,y);c.fillStyle='#17141c';c.beginPath();c.ellipse(0,0,r*.62,r,0,0,7);c.fill();c.strokeStyle='#bd8b6b99';c.lineWidth=2;for(let i=0;i<3;i++){c.beginPath();c.arc(0,0,r*(.65+i*.13),time*(i%2?-.5:.6)+i*2,time*(i%2?-.5:.6)+i*2+1.5);c.stroke();}c.fillStyle='#d3aa84';c.font=Math.max(12,r*.13)+'px Georgia';c.textAlign='center';c.fillText('REFORMING…',0,r*1.3);c.restore();}
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
