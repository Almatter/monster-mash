import {TitanRealmArt} from './titan-realm-art.ts';
import {REALM_CHUNKS} from './titan-realm-map.ts';
import {PLAYER_VFX,colorPowerPixels} from './power-vfx.ts';
import {reaperTargetName} from './reaper.ts';
import {courtHintPath,courtHintTarget,courtHintMarker} from './stage-two.ts';
import {cameraViewport} from './camera.ts';
import {CHAMPION_VFX} from './content-vfx.ts';
import {COURT} from './stage-two.ts';
import {SUSTAIN} from './balance.ts';
import {RELEASES} from './unbound.ts';
import {TORCHES} from './arena.ts';
import {COURT_REGIONS,courtArtVisible,clipCourtActor} from './court-map.ts';
import {CourtTerrain} from './court-terrain.ts';
import { ENEMIES, EVENT } from './data.ts';
import { Game,type Enemy } from './simulation.ts';
import {createIdentity,type Identity} from './identity.ts';
import {MONSTERS,type Palette} from './content-monsters.ts';
import {AssetLibrary} from './assets.ts';
export class Renderer {
 targeting:{x:number;y:number;radius:number;valid:boolean;kind?:'meteor'|'vortex'|'reaper-blink'|'reaper-volley'|'lycanthrope-parkour'}|null=null;canvas:HTMLCanvasElement;ctx:CanvasRenderingContext2D;width=0;height=0;viewWidth=0;viewHeight=0;scale=1;dpr=1;low=false;shake=true;autoLow=false;fxLevel=0;slowTime=0;fastTime=0;
 scene=0;setStage(phase:number){if(this.scene===phase)return;this.scene=phase;this.resize();}
 adapt(milliseconds:number,dt:number,load=0){const target=milliseconds>34?3:milliseconds>27?2:milliseconds>22||load>650?1:0;if(target>this.fxLevel){this.slowTime+=dt;this.fastTime=0;if(this.slowTime>1.5){this.fxLevel++;this.slowTime=0;if(this.scene===2)this.resize();}}else if(target<this.fxLevel){this.fastTime+=dt;this.slowTime=0;if(this.fastTime>5){this.fxLevel--;this.fastTime=0;if(this.scene===2)this.resize();}}else{this.slowTime=0;this.fastTime=0;}this.autoLow=this.fxLevel>0;}
 realmArt=new TitanRealmArt();realmTerrain=new CourtTerrain(REALM_CHUNKS,'assets/stage3/map-v39');
 assets=new AssetLibrary();previewIdentity:Identity=createIdentity();
 sprites=new Map<string,CanvasImageSource>();vfx=new Map<string,HTMLImageElement>();requestedVfx=new Set<string>(); background:HTMLCanvasElement;adaptationBackground:HTMLCanvasElement;groundPattern:CanvasPattern|null=null;adaptationPattern:CanvasPattern|null=null;brazier:HTMLImageElement|null=null;
 constructor(canvas:HTMLCanvasElement){this.canvas=canvas;this.ctx=canvas.getContext('2d',{alpha:false})!;this.background=this.makeGround();this.adaptationBackground=this.makeGround();this.loadFloor('assets/arena/floor.webp',this.background,0);const brazier=new Image();brazier.onload=()=>this.brazier=brazier;brazier.src='assets/arena/brazier.webp';this.loadVfx('hostile-bolt');this.loadVfx('hostile-elite');this.loadVfx('hostile-titan');this.loadVfx('hostile-elite-warning');this.loadVfx('hostile-titan-warning');this.loadVfx('enemy-hit');this.resize();for(const [kind,def] of Object.entries(ENEMIES)){this.sprites.set(kind,this.makeMonster(def.color,def.radius,kind));this.loadEnemy(kind);}}
 loadVfx(kind:string){if(this.requestedVfx.has(kind))return;this.requestedVfx.add(kind);const image=new Image();image.onload=()=>this.vfx.set(kind,image);image.onerror=()=>console.warn('VFX load failed:',kind);image.src='assets/vfx/'+kind+'.webp';}
 vfxColor='';tintedVfx=new Map<string,HTMLCanvasElement>();
 tintVfx(kind:string,image:HTMLImageElement){if(!PLAYER_VFX.has(kind)||!this.vfxColor)return image;const key=kind+this.vfxColor,hit=this.tintedVfx.get(key);if(hit){this.tintedVfx.delete(key);this.tintedVfx.set(key,hit);return hit;}const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;const ctx=canvas.getContext('2d')!;ctx.drawImage(image,0,0);const frame=ctx.getImageData(0,0,canvas.width,canvas.height);colorPowerPixels(frame.data,this.vfxColor,kind==='titan-fissure');ctx.putImageData(frame,0,0);if(this.tintedVfx.size>=16){const first=this.tintedVfx.keys().next().value!,old=this.tintedVfx.get(first)!;old.width=old.height=1;this.tintedVfx.delete(first);}this.tintedVfx.set(key,canvas);return canvas;}

 drawVfx(c:CanvasRenderingContext2D,kind:string,x:number,y:number,size:number,angle=0,alpha=1){const source=this.vfx.get(kind);if(!source)return false;const image=this.tintVfx(kind,source);if(!angle){const previous=c.globalAlpha;c.globalAlpha*=alpha;c.drawImage(image,x-size/2,y-size/2,size,size);c.globalAlpha=previous;return true;}c.save();c.translate(x,y);c.rotate(angle);c.globalAlpha*=alpha;c.drawImage(image,-size/2,-size/2,size,size);c.restore();return true;}
 drawTargetArea(c:CanvasRenderingContext2D,kind:string,x:number,y:number,radius:number,time:number,valid:boolean,placing:boolean){
  c.save();if(kind==='lycanthrope-parkour'){this.drawVfx(c,valid?kind:'lycanthrope-denied',x,y,radius*2.12,0,valid?.72:.9);c.restore();return;}if(kind.startsWith('reaper-')||kind.startsWith('lycanthrope-')){this.drawVfx(c,kind,x,y,radius*2.12,time*.3,valid?.65:.22);c.strokeStyle=valid?'#efdfc7':'#ff625d';c.lineWidth=2;c.beginPath();c.arc(x,y,radius,0,Math.PI*2);c.stroke();c.restore();return;}const vortex=kind==='vortex';
  this.drawVfx(c,vortex?'calamity-vortex-preview':'calamity-starfall-preview',x,y,radius*2.12,time*(vortex?-.12:.035),valid?(placing?.48:.32):.18);
  // Artwork supplies identity; this boundary supplies the precise gameplay radius.
  c.strokeStyle=valid?this.vfxColor||'#f0ce87':'#ff625d';c.lineWidth=placing?2.5:1.5;
  c.setLineDash(valid?[]:[8,6]);c.beginPath();c.arc(x,y,radius,0,Math.PI*2);c.stroke();c.setLineDash([]);
  if(placing){c.beginPath();if(valid){c.moveTo(x-9,y);c.lineTo(x+9,y);c.moveTo(x,y-9);c.lineTo(x,y+9);}else{c.moveTo(x-10,y-10);c.lineTo(x+10,y+10);c.moveTo(x+10,y-10);c.lineTo(x-10,y+10);}c.stroke();}c.restore();
 }
 loadChampionVfx(id:string){this.loadVfx(id);const pack=CHAMPION_VFX[id];if(pack)for(const name of [pack.unbound,...pack.perks])this.loadVfx(name);if(id==='sovereign')this.loadVfx('arcane-dissolve');}
 async prepareChampionVfx(ids:string[]){const required=new Set<string>();for(const id of new Set(ids)){required.add(id);const pack=CHAMPION_VFX[id];if(pack)for(const name of [pack.unbound,...pack.perks])required.add(name);if(id==='titan')required.add('titan-fissure');if(id==='sovereign')required.add('arcane-dissolve');}for(const id of required){if(!this.vfx.has(id)&&this.requestedVfx.has(id))this.requestedVfx.delete(id);this.loadVfx(id);}const deadline=performance.now()+15000;while([...required].some(id=>!this.vfx.has(id))){if(performance.now()>deadline)throw Error('Ability artwork could not load. Please try again.');await new Promise(resolve=>setTimeout(resolve,50));}}
 courtHitArt:HTMLCanvasElement|null=null;courtHits:Enemy[]=[];
 drawCourtHit(c:CanvasRenderingContext2D,e:Enemy){const image=this.vfx.get('enemy-hit');if(!image)return;if(!this.courtHitArt){const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;const ctx=canvas.getContext('2d')!;ctx.drawImage(image,0,0);const frame=ctx.getImageData(0,0,canvas.width,canvas.height);for(let i=0;i<frame.data.length;i+=4){const b=Math.max(frame.data[i],frame.data[i+1],frame.data[i+2])/255;frame.data[i]=55+b*190;frame.data[i+1]=24+b*205;frame.data[i+2]=90+b*165;}ctx.putImageData(frame,0,0);this.courtHitArt=canvas;}const size=e.court?.role==='captain'?148:104;c.save();c.translate(e.x,e.y-28);c.rotate(e.serial*2.399);c.globalAlpha=Math.max(.8,Math.min(1,e.flash/.1));c.shadowColor='#130d22';c.shadowBlur=8;c.drawImage(this.courtHitArt,-size/2,-size/2,size,size);c.restore();}
 drawChampionAuras(c:CanvasRenderingContext2D,g:Game,time:number){
  const id=g.monster.id,scale=g.monster.visual.scale,x=g.player.x,y=g.player.y;
  if(g.moonFury>0)this.drawVfx(c,'lycanthrope-fury',x,y,270*scale,time*.15,.20);
  const perk=g.shield>0||g.frenzy>0||g.frenzyGuard>0||id==='sovereign'&&g.player.rage>0;
  if(id==='reaper'||g.realm){if(g.reaperStorm>0)this.drawVfx(c,'reaper-eclipse',x,y,360*g.releaseStats.radius,time*.2,.40);if(g.soulGlow>0)this.drawVfx(c,'reaper-siphon',x,y,200*scale,-time*.2,g.soulGlow);}
  if(g.release>0){const size=(172+g.release*25)*scale*(1+Math.sin(time*2.1)*.02);this.drawVfx(c,CHAMPION_VFX[id].unbound,x,y,size,time*(id==='titan'?.035:.10),(.17+g.release*.05)*(perk?.75:1));}
  if(g.shield>0&&(id==='titan'||id==='calamity'||g.realm&&g.hasTrait('titan'))){const cap=id==='titan'?SUSTAIN.titan.cap:SUSTAIN.calamity.cap,ratio=Math.min(1,g.shield/cap);this.drawVfx(c,id==='titan'?'titan-barrier':'calamity-ward',x,y,(id==='titan'?194:184)*scale,time*.035,.35+.3*ratio);}
  if((id==='sovereign'||g.realm&&g.hasTrait('sovereign'))&&g.shield>0){const s=SUSTAIN.sovereign,ratio=Math.min(1,g.shield/(s.wardCap+s.wardCapPerRelease*g.release));this.drawVfx(c,'sovereign-aegis',x,y,196*scale,-time*.035,.38+.22*ratio);}
  if((id==='sovereign'||g.realm&&g.hasTrait('sovereign'))&&g.player.rage>0)this.drawVfx(c,'sovereign-rage',x,y,(g.shield>0?158:182)*scale,time*.09,(g.shield>0?.32:.46)+Math.sin(time*5)*.035);
  if(id==='devourer'||g.realm){
   if(g.frenzyGuard>0)this.drawVfx(c,'devourer-guard',x,y,196*scale,time*.045,.6);
   else if(g.frenzy>0)this.drawVfx(c,'devourer-frenzy',x,y,190*scale,-time*.3,.53+Math.sin(time*7)*.045);
   if(g.dodgeInvuln>0)this.drawVfx(c,id==='lycanthrope'?'lycanthrope-parkour':'devourer-dodge',x,y,180*scale,g.player.angle,.75);
  }
 }
 deathParticle(g:Game,source?:string){if(g.monster.id==='calamity'&&source==='vortex')return 'calamity-vortex-wisp';return ['calamity','sovereign'].includes(g.monster.id)&&(['ultimate','meteor','beam'].includes(source||'')||g.monster.id==='calamity'&&source==='direct')?'arcane-dissolve':null;}
 loadFloor(path:string,target:HTMLCanvasElement,phase:number){const image=new Image();image.onload=()=>{const c=target.getContext('2d')!;c.clearRect(0,0,512,512);c.drawImage(image,0,0,512,512);if(phase===1)this.adaptationPattern=null;else this.groundPattern=null;};image.src=path;}
 loadEnemy(kind:string){const image=new Image();image.onload=()=>this.sprites.set(kind,image);image.src='assets/enemies/'+kind+'.webp';}
 courtHintCache:{key:string;points:{x:number;y:number;angle:number}[]}={key:'',points:[]};courtTerrain=new CourtTerrain();courtArtRequested=false;courtShrine:HTMLImageElement|null=null;
 loadCourtArt(){if(this.courtArtRequested)return;this.courtArtRequested=true;this.courtTerrain.requestView(0,0,600,380);this.loadEnemy('ashen-colossus');this.loadEnemy('ashen-colossus-cast');this.loadVfx('colossus-warning');this.loadVfx('colossus-eruption');this.loadVfx('titan-fissure');this.loadVfx('court-slam');this.loadVfx('court-ash-trace');this.loadVfx('court-guard-front');this.loadVfx('court-spent-standard');this.loadEnemy('court-captain');this.loadEnemy('court-vanguard');this.loadFloor('assets/arena/floor-regions-cliff.webp',this.adaptationBackground,1);const shrine=new Image();shrine.onload=()=>this.courtShrine=shrine;shrine.src='assets/arena/court-shrine.webp';}
 resize(){this.width=innerWidth;this.height=innerHeight;this.dpr=Math.min(devicePixelRatio||1,this.low?1:matchMedia('(pointer:coarse)').matches?1.5:2,this.scene===2?Math.sqrt((this.low?1200000:this.fxLevel>=2?1200000:this.fxLevel?1600000:2100000)/(this.width*this.height)):Infinity);this.canvas.width=Math.round(this.width*this.dpr);this.canvas.height=Math.round(this.height*this.dpr);const view=cameraViewport(this.width,this.height);this.scale=view.scale;this.viewWidth=view.width;this.viewHeight=view.height;}
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
  this.setStage(g?.phase??0);this.courtHits.length=0;  if(g?.monster.id==='titan'&&g.titanKit==='fissure')this.loadVfx('titan-fissure');this.vfxColor=g?.identity.colors.power||'';const c=this.ctx,w=this.width,h=this.height;c.setTransform(this.dpr,0,0,this.dpr,0,0);c.fillStyle='#131217';c.fillRect(0,0,w,h);
  const cx=g?g.player.x:0,cy=g?g.player.y:0;
  c.save();if(g){c.beginPath();c.rect((w-this.viewWidth)/2,(h-this.viewHeight)/2,this.viewWidth,this.viewHeight);c.clip();}c.translate(g?w/2:w*.77,g?h/2:h*.45);c.scale(this.scale,this.scale);c.translate(-cx,-cy);
  if(g&&this.shake&&g.shake>0)c.translate(Math.sin(time*61)*g.shake,Math.cos(time*47)*g.shake*.6);
  const stageTwo=g?.phase===1,extent=Math.max(this.viewWidth,this.viewHeight)/this.scale;if(stageTwo)this.loadCourtArt();if(g?.realm){if(!this.realmTerrain.ready(cx,cy,this.viewWidth/this.scale/2,this.viewHeight/this.scale/2)||cx-this.viewWidth/this.scale/2<REALM_CHUNKS.left||cy-this.viewHeight/this.scale/2<REALM_CHUNKS.top||cx+this.viewWidth/this.scale/2>REALM_CHUNKS.left+REALM_CHUNKS.size*REALM_CHUNKS.cols||cy+this.viewHeight/this.scale/2>REALM_CHUNKS.top+REALM_CHUNKS.size*REALM_CHUNKS.rows)this.realmArt.drawBackdrop(c,cx,cy,extent);}else{c.fillStyle=stageTwo?(this.adaptationPattern??=c.createPattern(this.adaptationBackground,'repeat')!):(this.groundPattern??=c.createPattern(this.background,'repeat')!);c.fillRect(cx-extent,cy-extent,extent*2,extent*2);}
  if(g?.realm){this.realmTerrain.draw(c,cx,cy,this.viewWidth/this.scale/2,this.viewHeight/this.scale/2);this.realmArt.drawEnvironment(c,g,time,this.viewWidth/this.scale/2,this.viewHeight/this.scale/2);}else if(!stageTwo){
  // Permanent ritual masonry: concentric rings, cardinal gates, inscriptions and braziers.
  c.strokeStyle=stageTwo?'#68b6a05c':'#8060473d';c.lineWidth=3;
  for(const r of [260,280,480,496,EVENT.arenaRadius]){c.beginPath();c.arc(0,0,r,0,Math.PI*2);c.stroke();}
  for(let i=0;i<24;i++){const a=i*Math.PI/12;c.save();c.rotate(a);c.translate(0,475);c.fillStyle=stageTwo?'#89c4ad67':'#a77c4f50';c.font='20px Georgia';c.fillText(['ᛉ','ᚷ','ᛟ','ᚹ'][i%4],-6,0);c.restore();}
  for(let i=0;i<TORCHES.length;i++){const {x}=TORCHES[i],y=TORCHES[i].y-31;if(this.brazier){c.drawImage(this.brazier,x-42,y-80,84,126);c.fillStyle='#ff9d4e';c.globalAlpha=.12+Math.sin(time*7+i)*.035;c.beginPath();c.arc(x,y-43,35,0,7);c.fill();c.globalAlpha=1;}}
  }else{this.courtTerrain.draw(c,cx,cy,this.viewWidth/this.scale/2,this.viewHeight/this.scale/2);for(const region of COURT_REGIONS){if(!courtArtVisible(region.x,region.y+900,600,45,0,cx,cy,this.viewWidth/this.scale/2,this.viewHeight/this.scale/2))continue;c.save();c.font='bold 16px Georgia';c.textAlign='center';c.fillStyle='#f5dfad';c.strokeStyle='#30261e';c.lineWidth=3;c.strokeText(region.name,region.x,region.y+900);c.fillText(region.name,region.x,region.y+900);c.restore();}if(g?.court)for(const camp of g.court.camps)if(camp.slain&&courtArtVisible(camp.x,camp.y,95,120,0,cx,cy,this.viewWidth/this.scale/2,this.viewHeight/this.scale/2))this.drawVfx(c,'court-spent-standard',camp.x,camp.y,95,0,.85);}

  if(!g){this.drawSovereign(c,0,0,time,0,3.5);c.restore();return;}
  const detail=this.low?3:this.fxLevel;this.loadChampionVfx(g.monster.id);if(g.realm)for(const nature of new Set(g.relicOwners))this.loadChampionVfx(nature);
  const halfW=this.viewWidth/this.scale/2,halfH=this.viewHeight/this.scale/2;let vortexPrey=0,deathDraws=0;
  if(g.court)for(const shrine of g.court.shrines){if(Math.abs(shrine.x-cx)>extent||Math.abs(shrine.y-cy)>extent)continue;const ready=g.time>=shrine.readyAt;c.save();c.globalAlpha=ready?1:.5;if(this.courtShrine)c.drawImage(this.courtShrine,shrine.x-78,shrine.y-90,156,156);c.font='bold 12px Arial';c.textAlign='center';c.fillStyle=ready?'#b6f5e8':'#e1d3ba';c.fillText(ready?'HEALING OASIS':Math.ceil(shrine.readyAt-g.time)+'s',shrine.x,shrine.y+80);c.restore();}
  for(const e of g.enemies){const margin=e.realm?.role==='boss'?300:e.colossus?150:e.windup>0?(e.court?.role==='captain'?COURT.slamRadius:e.kind==='titan'?240:140):100;if(!e.active||e.grabbed||Math.abs(e.x-cx)>halfW+margin+32||Math.abs(e.y-cy)>halfH+margin+32)continue;if(e.realm){this.realmArt.drawEnemy(c,g,e,time);continue;}const def=ENEMIES[e.kind],size=def.radius*4;
   if(e.windup>0){if(e.court?.role==='captain'){const progress=1-e.windup/COURT.slamWarning;this.drawVfx(c,'court-slam',e.x,e.y,COURT.slamRadius*2,0,.38+progress*.45);c.strokeStyle='#ff7b66';c.lineWidth=1.5;c.beginPath();c.arc(e.x,e.y,COURT.slamRadius,0,Math.PI*2);c.stroke();}else{const r=e.kind==='titan'?240:140,progress=Math.max(0,Math.min(1,1-e.windup/1.2));this.drawVfx(c,e.kind==='titan'?'hostile-titan-warning':'hostile-elite-warning',e.x,e.y,r*2.22,0,.52+progress*.4);c.strokeStyle='#170b14';c.lineWidth=4;c.beginPath();c.arc(e.x,e.y,r,0,Math.PI*2);c.stroke();c.strokeStyle='#ff8d89';c.lineWidth=1.5;c.stroke();}}
   const sprite=e.colossus?this.sprites.get(g.time<g.court!.colossus.castUntil?'ashen-colossus-cast':'ashen-colossus'):e.court?this.sprites.get('court-'+e.court.role):null,drawSize=e.colossus?210:e.court?.role==='captain'?114:e.court?96:size;
   c.save();if(g.court)clipCourtActor(c,e.x,e.y,drawSize/2,drawSize);if(g.monster.id==='calamity'&&vortexPrey<(detail>=2?8:24)){const field=g.fields.find(f=>f.kind==='vortex'&&Math.hypot(e.x-f.x,e.y-f.y)<f.radius);if(field){this.drawVfx(c,'calamity-vortex-wisp',e.x,e.y,Math.max(52,drawSize*.85),Math.atan2(field.y-e.y,field.x-e.x),.72);vortexPrey++;}}c.drawImage(sprite??this.sprites.get(e.kind)!,e.x-drawSize/2,e.y-drawSize/2+(detail>=3?0:Math.sin(time*8+e.serial)*1.5),drawSize,drawSize);
   if(e.court){const unit=e.court;c.save();c.translate(e.x,e.y);if(unit.guard>0){this.drawVfx(c,'court-guard-front',0,0,84,unit.facing,.82);c.fillStyle='#715d32';c.fillRect(-25,-53,50,3);c.fillStyle='#e6c78b';c.fillRect(-25,-53,50*unit.guard/unit.maxGuard,3);}if(unit.role==='captain'){c.textAlign='center';c.font='bold 10px Arial';c.fillStyle='#171218dd';c.fillRect(-35,-70,70,15);c.fillStyle='#f2d99d';c.fillText('CAPTAIN',0,-59);}c.restore();}
   if((e.corruptUntil||0)>g.time)this.drawVfx(c,'overlord-soul-brand',e.x,e.y,Math.max(44,def.radius*3.1),0,.62);
   if(e.flash>0&&e.court)this.courtHits.push(e);
   if(e.flash>0&&!e.court)this.drawVfx(c,'enemy-hit',e.x,e.y,Math.max(44,def.radius*3),e.serial*2.399,e.flash/.1);
   if(e.kind==='elite'||e.kind==='titan'||e.hp<e.maxHp&&e.kind==='brute'){c.fillStyle='#21121c';c.fillRect(e.x-def.radius,e.y-def.radius*1.9,def.radius*2,4);c.fillStyle=def.color;c.fillRect(e.x-def.radius,e.y-def.radius*1.9,def.radius*2*Math.max(0,e.hp/e.maxHp),4);}
   c.restore();
  }
  if(g.court)for(const seal of g.court.seals){c.save();c.translate(seal.x,seal.y);c.globalAlpha=seal.life<10?.55+Math.sin(time*5)*.2:1;c.fillStyle='#284c42';c.strokeStyle='#b7ebd4';c.lineWidth=3;c.beginPath();c.moveTo(0,-27);c.lineTo(20,0);c.lineTo(0,27);c.lineTo(-20,0);c.closePath();c.fill();c.stroke();c.strokeStyle='#e5c47e';c.beginPath();c.moveTo(-8,-3);c.lineTo(-8,6);c.lineTo(8,6);c.lineTo(8,-3);c.moveTo(-8,6);c.lineTo(0,-9);c.lineTo(8,6);c.stroke();c.font='bold 11px Arial';c.textAlign='center';c.fillStyle='#b7ebd4';c.fillText('CLAIM SEAL',0,44);c.fillText(Math.ceil(seal.life)+'s',0,59);c.restore();}
  for(const f of g.fissures){const x=(f.x+f.endX)/2,y=(f.y+f.endY)/2;if(!courtArtVisible(x,y,f.length+f.width*2,f.width*3,f.angle,cx,cy,halfW,halfH))continue;const source=this.vfx.get('titan-fissure');if(!source)continue;c.save();c.globalAlpha=Math.min(1,f.life)*(.88+Math.sin(time*7)*.05);c.translate(x,y);c.rotate(f.angle);c.drawImage(this.tintVfx('titan-fissure',source),-f.length/2-f.width*.4,-f.width*1.15,f.length+f.width*.8,f.width*2.3);c.restore();}
  for(const f of g.fields)this.drawTargetArea(c,f.kind,f.x,f.y,f.radius,time,true,false);
  for(const s of g.servants){if(!s.active)continue;c.save();if(g.court)clipCourtActor(c,s.x,s.y,32,60);c.globalAlpha=Math.min(1,s.life);c.drawImage(this.sprites.get('thrall')!,s.x-20,s.y-20,40,40);this.drawVfx(c,'overlord-soul-brand',s.x,s.y,61,s.serial*.12+time*.04,.78);c.restore();}
  for(const b of g.bolts){if(!courtArtVisible(b.x,b.y,40,40,0,cx,cy,halfW,halfH))continue;if(this.drawVfx(c,g.monster.id,b.x,b.y,32,Math.atan2(b.vy,b.vx)+time*5))continue;c.strokeStyle=g.identity.colors.power;c.lineWidth=5;c.beginPath();c.moveTo(b.x,b.y);c.lineTo(b.x-b.vx*.03,b.y-b.vy*.03);c.stroke();}
  for(const w of g.scytheWaves)if(courtArtVisible(w.x,w.y,w.width*3,w.width*3,0,cx,cy,halfW,halfH))this.drawVfx(c,'reaper-wave',w.x-Math.cos(w.angle)*w.width*.35,w.y-Math.sin(w.angle)*w.width*.35,w.width*3.2,w.rotation,.9);
  for(const w of g.clawWaves)this.drawVfx(c,'devourer-claw-wave',w.x-Math.cos(w.angle)*w.width*.65,w.y-Math.sin(w.angle)*w.width*.65,w.width*3.15,w.angle,.72);
  for(const b of g.debris){if(!courtArtVisible(b.x,b.y,90,90,0,cx,cy,halfW,halfH))continue;c.save();c.globalAlpha=Math.min(1,b.life/.3);const particle=this.deathParticle(g,b.death?.source);if(particle)this.drawVfx(c,particle,b.x,b.y,50,Math.atan2(b.vy,b.vx),.85);const creature=b.death&&this.sprites.get(b.death.sprite);if(creature&&(!particle||b.life>.25)){const size=24+Math.max(0,b.life)*24;c.translate(b.x,b.y);c.rotate(time*8);c.drawImage(creature,-size/2,-size/2,size,size);}else if(!particle)this.drawVfx(c,g.monster.id,b.x,b.y,26,time*10);c.restore();}
  for(const s of g.shots){if(!courtArtVisible(s.x,s.y,32,32,0,cx,cy,halfW,halfH))continue;if(g.realm){this.realmArt.image(c,'bolt',s.x,s.y,36,Math.atan2(s.vy,s.vx));continue;}if(this.drawVfx(c,'hostile-bolt',s.x,s.y,28,Math.atan2(s.vy,s.vx)))continue;c.fillStyle='#ed9bea';c.beginPath();c.arc(s.x,s.y,6,0,7);c.fill();}
  c.save();if(g.court)clipCourtActor(c,cx,cy,150*g.monster.visual.scale,240*g.monster.visual.scale);this.drawChampionAuras(c,g,time);
  if(g.vault){c.fillStyle='#09081080';c.beginPath();c.ellipse(cx,cy+12,38*g.monster.visual.scale,12,0,0,Math.PI*2);c.fill();const t=g.vault.elapsed/g.vault.duration;c.translate(cx,cy);c.translate(0,-Math.sin(t*Math.PI)*95);c.rotate(t*Math.PI*2);c.translate(-cx,-cy);}const state=g.moonFury>0?'move':g.vault?'ultimate':g.ultimateTime>0?'ultimate':g.player.invuln>0?'hurt':g.attack>g.monster.basic.interval*.65||g.monster.id==='titan'&&g.fissures.some(f=>g.time-f.bornAt<.3)?'attack':g.moving?'move':'idle';if(!this.assets.drawGameplay(c,g.identity,cx,cy-(g.realm?24:0),detail>=3?Math.floor(time*5)/5:time,state,g.monster.visual.scale,g.facingX,!g.vault)){if(this.assets.status(g.identity,'gameplay')==='failed')this.drawSovereign(c,cx,cy,time,g.player.invuln,g.monster.visual.scale,g.player.rage,g.identity.colors);else this.drawLoading(c,cx,cy,time,70*g.monster.visual.scale);}
  c.restore();
  if(g.grip){const held=g.enemies.find(e=>e.active&&e.serial===g.grip!.serial);if(held){c.save();c.translate(held.x,held.y-(g.realm?24:0));c.rotate(g.movementAngle+Math.sin(time*7)*.7+Math.PI/2);const size=held.kind==='elite'?88:held.kind==='brute'?68:48;c.drawImage(this.sprites.get(held.kind)!,-size/2,-size/2,size,size);c.restore();this.drawVfx(c,'lycanthrope-grip',held.x,held.y,95,g.movementAngle,.55);}}
  if(g.beam>0){c.save();c.translate(cx,cy);c.rotate(g.player.angle);const beamArt=g.realm?.beamNature||g.monster.id;if(this.vfx.has(beamArt)){for(let x=45;x<g.beamPower.radius;x+=detail>=2?180:90)this.drawVfx(c,beamArt,x,0,(g.monster.id==='calamity'?42:48)*g.releaseStats.beam,time*2+x*.02,.68);}else{c.fillStyle=g.identity.colors.power+'80';c.fillRect(0,-(g.monster.id==='calamity'?11:13)*g.releaseStats.beam,g.beamPower.radius,(g.monster.id==='calamity'?22:26)*g.releaseStats.beam);c.fillStyle=g.identity.colors.power;c.fillRect(0,-7*g.releaseStats.beam,g.beamPower.radius,14*g.releaseStats.beam);c.fillStyle='#fff0d1';c.fillRect(0,-3,g.beamPower.radius,6);}c.restore();}
  if(g.monster.id==='reaper'){const focused=g.enemies.find(e=>e.active&&e.serial===g.reaperFocus);if(focused&&courtArtVisible(focused.x,focused.y,160,180,0,cx,cy,halfW,halfH)){c.save();c.font='bold 11px Arial';c.textAlign='center';c.lineWidth=4;c.strokeStyle='#120d19';c.fillStyle='#f6dfb4';c.strokeText('FOCUS · '+reaperTargetName(focused),focused.x,focused.y-100);c.fillText('FOCUS · '+reaperTargetName(focused),focused.x,focused.y-100);c.restore();}}
  if(this.targeting){const t=this.targeting;this.drawTargetArea(c,t.kind||'meteor',t.x,t.y,t.radius,time,t.valid,true);}
  const sparse=detail>=1;
  for(const e of g.effects){if(!courtArtVisible(e.x,e.y,e.radius*2.4,e.radius*2.4,0,cx,cy,halfW,halfH))continue;if(g.monster.id==='devourer'&&(e.kind==='frenzy'||e.kind==='feast'))continue;const t=1-e.life/e.max;c.globalAlpha=1-t;c.lineWidth=4;
   if(e.kind==='lycanthrope-landing'){this.drawVfx(c,'lycanthrope-landing',e.x,e.y,e.radius*2.2,0,.85);}else if(e.kind.startsWith('lycanthrope-')){this.drawVfx(c,e.kind,e.x,e.y,Math.min(e.radius*2.12,1000),e.angle,e.kind==='lycanthrope-howl'?.38:e.kind==='lycanthrope-parkour'?.28:.45);}else if(e.kind.startsWith('realm-')){this.realmArt.image(c,e.kind==='realm-cleave'?'cleave':e.kind==='realm-portal'?'portal':e.kind==='realm-slam'?'slam':e.kind==='realm-boundary'?'boundary':'breach',e.x,e.y,e.radius*2,e.kind==='realm-cleave'?e.angle+Math.PI/2:0,e.kind==='realm-block'?.5:.9);}
   else if(e.kind.startsWith('relic-power-')){this.drawVfx(c,e.kind,e.x,e.y,Math.min(e.radius*2,950),e.angle,.85);}
   else if(e.kind.startsWith('relic-cast-')){const nature=e.kind.slice(11);this.drawVfx(c,nature,e.x,e.y,Math.min(e.radius*2,950),e.angle,.85);}
   else if(e.kind==='colossus-eruption'){this.drawVfx(c,'colossus-eruption',e.x,e.y-e.radius*.22,e.radius*2.3,0,.9);}
   else if(e.kind.startsWith('reaper-')){this.drawVfx(c,e.kind,e.x,e.y,Math.min(e.radius*2.12,1100),e.angle+t*.2,.9);}
   else if(g.monster.id==='reaper'&&e.kind==='release'){this.drawVfx(c,'reaper-unbound',e.x,e.y,e.radius*2,t*.2,.7);}
   else if(e.kind==='court-break'){c.strokeStyle='#f1d39a';c.lineWidth=3;for(let i=0;i<5;i++){const a=i*Math.PI*2/5;c.beginPath();c.moveTo(e.x+Math.cos(a)*e.radius*t,e.y+Math.sin(a)*e.radius*t);c.lineTo(e.x+Math.cos(a)*e.radius*(t+.2),e.y+Math.sin(a)*e.radius*(t+.2));c.stroke();}}
   else if(e.kind==='court-slam'){this.drawVfx(c,'court-slam',e.x,e.y,e.radius*2*(.9+t*.1),0,.9);}
   else if(e.kind==='slam-titan'&&this.drawVfx(c,'hostile-titan',e.x,e.y,e.radius*2.1*(.7+t*.3),time*.08,1)){}
   else if(e.kind==='slam-elite'&&this.drawVfx(c,'hostile-elite',e.x,e.y,e.radius*2.1*(.72+t*.28),time*.13,1)){}
   else if(e.kind==='blood'){const particle=this.deathParticle(g,e.death?.source);if(particle){if(deathDraws++>=(detail>=2?12:64))continue;const count=detail>=2?1:3;for(let i=0;i<count;i++){const a=i*2.399+e.x;this.drawVfx(c,particle,e.x+Math.cos(a)*t*e.radius,e.y+Math.sin(a)*t*e.radius,Math.max(20,e.radius*(.8+t*.35)),a+t*2,.85);}}else{if(sparse)continue;c.fillStyle='#b74345';for(let i=0;i<5;i++){const a=i*2.4+e.x;c.beginPath();c.ellipse(e.x+Math.cos(a)*t*e.radius,e.y+Math.sin(a)*t*e.radius,4*(1-t)+1,2,a,0,7);c.fill();}}}
   else if(e.kind==='claw'&&g.monster.id==='devourer'){if(!this.drawVfx(c,'devourer-claw',e.x,e.y,e.radius*2.12*(.9+t*.15),e.angle+t*.65,.78)){c.strokeStyle=g.identity.colors.power;c.lineWidth=4;for(let i=0;i<3;i++){const a=e.angle+time*.5+i*2.1;c.beginPath();c.arc(e.x,e.y,e.radius-4-i*3,a,a+1.05);c.stroke();}}}
   else if(e.kind==='claw'&&g.monster.id==='titan'&&this.drawVfx(c,'titan-cleave',e.x,e.y,e.radius*2.4*(.88+t*.12),e.angle+t*.2,.85)){}
   else if(g.monster.id==='overlord'&&['dominate','summon','curse','ultimate','corruption','servant'].includes(e.kind)&&this.drawVfx(c,'overlord-soul-brand',e.x,e.y,Math.min(e.radius*2.12,950)*(.72+t*.28),time*.12,.7)){}
   else if(!e.kind.startsWith('slam')&&this.drawVfx(c,g.monster.id,e.x,e.y,Math.min(e.radius*2,900)*(e.kind==='devour'?1-t*.5:.65+t*.35),e.angle+time*.7,1)){}
   else if(e.kind==='claw'){c.strokeStyle=g.identity.colors.power;for(let i=0;i<3;i++){c.beginPath();c.arc(e.x,e.y,e.radius-i*12,e.angle-.9+t,e.angle+1.8+t);c.stroke();}}
   else {c.strokeStyle=e.kind.startsWith('slam')?'#ff6265':g.identity.colors.power;c.lineWidth=e.kind==='catastrophe'?14:5;c.beginPath();c.arc(e.x,e.y,e.radius*(e.kind==='devour'?1-t:t),0,7);c.stroke();if(!sparse){c.lineWidth=2;c.beginPath();c.arc(e.x,e.y,e.radius*t*.8,0,7);c.stroke();}}
  }c.globalAlpha=1;
  if(g.court)for(const z of g.court.colossus.zones){if(!courtArtVisible(z.x,z.y,z.radius*3,z.radius*3,0,cx,cy,halfW,halfH))continue;c.save();const warning=g.time<z.impactAt;this.drawVfx(c,warning?'colossus-warning':'colossus-eruption',z.x,z.y-(warning?0:18),z.radius*(warning?2.15:2.7),0,warning?.82:.65);c.strokeStyle='#1a1113';c.lineWidth=5;c.beginPath();c.arc(z.x,z.y,z.radius,0,Math.PI*2);c.stroke();c.strokeStyle=warning?'#ffbd7c':'#ff5c4c';c.lineWidth=2;c.stroke();if(warning){c.lineWidth=4;c.beginPath();c.arc(z.x,z.y,z.radius,-Math.PI/2,-Math.PI/2+Math.PI*2*Math.max(0,Math.min(1,(g.time-z.placedAt)/(z.impactAt-z.placedAt))));c.stroke();}c.restore();}
  if(g.realm)this.realmArt.drawDefense(c,g,halfW,halfH);
  for(const e of this.courtHits)this.drawCourtHit(c,e);
  if(g.court&&courtHintTarget(g)){
   const hint=g.court.hint!,key=g.seed+':'+hint.site+':'+Math.floor(g.time*10)+':'+hint.trail;
   if(this.courtHintCache.key!==key)this.courtHintCache={key,points:courtHintPath(g)};
   const image=this.vfx.get('court-ash-trace');
   if(image)for(const point of this.courtHintCache.points){c.save();c.translate(point.x,point.y);c.rotate(point.angle);c.globalAlpha=1;c.shadowColor='#171015';c.shadowBlur=5;c.drawImage(image,-60,-33.75,120,67.5);c.restore();}
  }
  c.restore();

  if(g.ultimateTime>0&&!this.low&&!this.autoLow){const cutin=this.assets.completed(g.identity,'cutin');if(cutin){c.globalAlpha=Math.min(1,g.ultimateTime*3);c.drawImage(cutin,w*.62,h*.3,w*.36,w*.18);c.globalAlpha=1;}}
  if(g.releaseTime>0){c.save();c.globalAlpha=Math.min(1,g.releaseTime*2);c.fillStyle='#100b18c9';c.fillRect(w*.12,h*.2,w*.76,64);c.textAlign='center';c.fillStyle=g.identity.colors.power;c.font='bold '+Math.min(30,w*.042)+'px Georgia';c.fillText(RELEASES[g.release].name,w/2,h*.2+28);c.fillStyle='#eee7d8';c.font='14px Georgia';c.fillText(g.identity.name,w/2,h*.2+51);c.restore();}
  const marker=courtHintMarker(g,w,h,this.viewWidth);if(marker){c.save();c.translate(marker.x,marker.y);c.fillStyle='#171019';c.strokeStyle='#f5d188';c.lineWidth=3;c.fillRect(-85,-43,170,86);c.strokeRect(-85,-43,170,86);c.textAlign='center';c.textBaseline='middle';c.fillStyle='#fff4d8';c.font='bold 12px Arial';c.fillText('ASH TRACE · '+marker.direction,0,-28);const trace=this.vfx.get('court-ash-trace');c.save();c.translate(0,1);c.rotate(marker.angle);if(trace){c.globalAlpha=.32;c.drawImage(trace,-45,-25.3,90,50.6);c.globalAlpha=1;}c.strokeStyle='#171019';c.fillStyle='#ffefac';c.lineWidth=5;c.beginPath();c.moveTo(26,0);c.lineTo(-10,-14);c.lineTo(-5,-5);c.lineTo(-28,-5);c.lineTo(-28,5);c.lineTo(-5,5);c.lineTo(-10,14);c.closePath();c.stroke();c.fill();c.restore();c.font='bold 11px Arial';c.fillStyle='#fff4d8';c.fillText('CAPTAIN BEARING',0,30);c.restore();}
  if(g.player.hp<g.player.maxHp*.25){c.strokeStyle='#dc494b88';c.lineWidth=12;c.strokeRect(0,0,w,h);}
 }
 drawPreview(canvas:HTMLCanvasElement,time:number){this.loadChampionVfx(this.previewIdentity.monsterId);const c=canvas.getContext('2d')!;c.clearRect(0,0,canvas.width,canvas.height);const portrait=this.assets.completed(this.previewIdentity,'selection');if(portrait){const scale=Math.min(canvas.width/portrait.width,canvas.height/portrait.height);c.drawImage(portrait,(canvas.width-portrait.width*scale)/2,0,portrait.width*scale,portrait.height*scale);}else if(this.assets.status(this.previewIdentity,'selection')==='failed')this.drawSovereign(c,canvas.width/2,canvas.height*.56,time,0,2.6*MONSTERS[this.previewIdentity.monsterId].visual.scale,0,this.previewIdentity.colors);else this.drawLoading(c,canvas.width/2,canvas.height*.48,time,Math.min(canvas.width,canvas.height)*.23);}
 drawLoading(c:CanvasRenderingContext2D,x:number,y:number,time:number,r:number){c.save();c.translate(x,y);c.fillStyle='#17141c';c.beginPath();c.ellipse(0,0,r*.62,r,0,0,7);c.fill();c.strokeStyle='#bd8b6b99';c.lineWidth=2;for(let i=0;i<3;i++){c.beginPath();c.arc(0,0,r*(.65+i*.13),time*(i%2?-.5:.6)+i*2,time*(i%2?-.5:.6)+i*2+1.5);c.stroke();}c.fillStyle='#d3aa84';c.font=Math.max(12,r*.13)+'px Georgia';c.textAlign='center';c.fillText('REFORMING…',0,r*1.3);c.restore();}
 drawSovereign(c:CanvasRenderingContext2D,x:number,y:number,time:number,hit:number,scale=1,rage=0,palette:Palette=MONSTERS.sovereign.palette){
  c.save();c.translate(x,y);c.scale(scale,scale);const breath=Math.sin(time*2)*1.2;c.translate(0,breath);
  c.fillStyle='#08080bd0';c.beginPath();c.ellipse(0,31,47,16,0,0,7);c.fill();
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
