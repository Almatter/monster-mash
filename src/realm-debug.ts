import {REALM_GROTTOS,REALM_DECKS,REALM_SCALE} from './realm-layout.ts';
import {REALM_STRUCTURES,realmOccluders,realmStructureBlocks} from './realm-structures.ts';
import {insideRealm} from './titan-realm-map.ts';
import {REALM_TITAN_ZONE,REALM_GUARDIAN_ZONES} from './realm-zones.ts';
import type {Renderer} from './renderer.ts';
import type {Game} from './simulation.ts';
// Loaded only by the exhibition page with ?mapdebug=1. No gameplay mutations.
export function mountRealmDebug(renderer:Renderer,getGame:()=>Game|null){
 const panel=document.createElement('div');panel.id='realmGeometryDebug';panel.style.cssText='position:fixed;left:8px;top:70px;z-index:100;background:#111e;color:white;padding:10px;max-width:320px;font:12px monospace;pointer-events:auto';
 const title=document.createElement('b');title.textContent='MAP GEOMETRY · F8';panel.append(title);const enabled={floor:true,bases:true,foreground:true,zones:true,probe:false};
 for(const name of Object.keys(enabled) as (keyof typeof enabled)[]){const label=document.createElement('label'),input=document.createElement('input');input.type='checkbox';input.checked=enabled[name];input.onchange=()=>enabled[name]=input.checked;label.style.cssText='display:inline-block;margin:6px';label.append(input,name);panel.append(label);}const status=document.createElement('div');panel.append(status);document.body.append(panel);
 let visible=true,probe:{x:number;y:number}|null=null;
 addEventListener('keydown',e=>{if(e.code==='F8'){e.preventDefault();visible=!visible;panel.hidden=!visible;}});
 renderer.canvas.addEventListener('pointerdown',e=>{const g=getGame();if(!visible||!enabled.probe||!g?.realm)return;e.preventDefault();e.stopImmediatePropagation();const rect=renderer.canvas.getBoundingClientRect();probe={x:g.player.x+(e.clientX-rect.left-rect.width/2)/renderer.scale,y:g.player.y+(e.clientY-rect.top-rect.height/2)/renderer.scale};},true);
 let last=0;
 renderer.environmentDebug=(c,g)=>{if(!visible||!g.realm)return;const p=probe??g.player;c.save();c.lineWidth=2/renderer.scale;const polygon=(points:{x:number;y:number}[],color:string)=>{c.strokeStyle=color;c.beginPath();points.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.closePath();c.stroke();};
 if(enabled.floor){for(const q of REALM_DECKS)polygon(q.points,'#65ff9e');for(const s of REALM_GROTTOS)polygon(s.floor.map(([x,y])=>({x:s.x+x,y:s.y+y})),'#65ff9e');c.strokeStyle='#65ff9e';c.beginPath();c.ellipse(0,-38,1065,747,0,0,7);c.stroke();}
 for(const s of REALM_STRUCTURES){if(enabled.bases&&s.base.rx){c.strokeStyle='#ff5959';c.beginPath();c.ellipse(s.base.x,s.base.y,s.base.rx,s.base.ry,0,0,7);c.stroke();}if(enabled.foreground)polygon(s.foreground,'#ff78e9');}
 if(enabled.zones)for(const z of [REALM_TITAN_ZONE,...REALM_GUARDIAN_ZONES])polygon(z.points,'#6ceaff');c.strokeStyle=insideRealm(p.x,p.y,23)?'#fff':'#ff5555';c.beginPath();c.arc(p.x,p.y,23,0,7);c.stroke();c.restore();
 if(performance.now()-last>150){last=performance.now();const solid=REALM_STRUCTURES.filter(s=>s.base.rx&&((p.x-s.base.x)/s.base.rx)**2+((p.y-s.base.y)/s.base.ry)**2<1).map(s=>s.id);status.textContent=`Master ${(p.x/REALM_SCALE+632).toFixed(1)}, ${((p.y+38)/REALM_SCALE+524).toFixed(1)} · ${insideRealm(p.x,p.y,23)?'WALKABLE':realmStructureBlocks(p.x,p.y)?'SOLID BASE: '+solid.join(', '):insideRealm(p.x,p.y)?'TOO CLOSE TO FLOOR EDGE':'OUTSIDE FLOOR'} | Foreground candidates: ${realmOccluders(p.x,p.y).map(s=>s.id).join(', ')||'none'}. Green floor; red bases; pink foreground; cyan encounter. Probe checks a 23-unit foot radius.`;}
 };
}
