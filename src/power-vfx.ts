import {CHAMPION_VFX} from './content-vfx.ts';

// Only champion-owned magic changes color. Hostile warnings and map markers
// keep their danger/navigation colors, including during a player's ultimate.
export const PLAYER_VFX=new Set(Object.entries(CHAMPION_VFX).flatMap(([id,pack])=>[id,pack.unbound,...pack.perks]).concat('titan-fissure'));
export function colorPowerPixels(pixels:Uint8ClampedArray,color:string,stone=false){
 const rgb=[1,3,5].map(i=>parseInt(color.slice(i,i+2),16));
 for(let i=0;i<pixels.length;i+=4){
  if(!pixels[i+3])continue;
  const shade=Math.max(pixels[i],pixels[i+1],pixels[i+2])/255;
  const highlight=Math.max(0,shade-.92)*1600;
  const weight=stone?Math.max(0,Math.min(1,(shade-.48)/.3)):1;
  for(let j=0;j<3;j++)pixels[i+j]=pixels[i+j]*(1-weight)+Math.min(255,rgb[j]*shade+highlight)*weight;
 }
}
