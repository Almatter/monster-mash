import test from 'node:test';import assert from 'node:assert/strict';
import {REALM_GROTTOS,REALM_PATHS,REALM_LOCAL_PATHS,REALM_ARENA_ART} from '../src/realm-layout.ts';
import {insideRealm,moveRealm} from '../src/titan-realm-map.ts';
test('all eleven connector centerlines have at least 30 units of floor clearance, including their joins',()=>{for(const route of REALM_PATHS)for(const p of route.curve)assert.ok(insideRealm(p.x,p.y,30),route.id+' '+JSON.stringify(p));});
test('every painted shrine and arena branch admits a 54-unit body without leaving its own image',()=>{
 for(const s of [...REALM_GROTTOS,{nature:'arena',x:0,y:0}]){
  const arena=s.nature==='arena',left=arena?REALM_ARENA_ART.left:s.x-600,top=arena?REALM_ARENA_ART.top:s.y-600,w=arena?REALM_ARENA_ART.width:1200,h=arena?REALM_ARENA_ART.height:1200,n=Math.floor(w/8)+1,rows=Math.floor(h/8)+1,labels=new Int32Array(n*rows).fill(-1),pos=i=>({x:left+i%n*8,y:top+Math.floor(i/n)*8});let count=0;
  for(let i=0;i<labels.length;i++){const p=pos(i);if(labels[i]>=0||!insideRealm(p.x,p.y,27))continue;const queue=[i];labels[i]=++count;for(let k=0;k<queue.length;k++)for(const j of [queue[k]-1,queue[k]+1,queue[k]-n,queue[k]+n]){if(j<0||j>=labels.length||labels[j]>=0||Math.abs(j%n-queue[k]%n)>1)continue;const q=pos(j);const a=pos(queue[k]);if(insideRealm(q.x,q.y,27)&&insideRealm((q.x+a.x)/2,(q.y+a.y)/2,27)){labels[j]=count;queue.push(j);}}}
  const nearest=p=>{let best=Infinity,result=-1;for(let y=-5;y<=5;y++)for(let x=-5;x<=5;x++){const xx=Math.round((p.x-left)/8)+x,yy=Math.round((p.y-top)/8)+y,i=yy*n+xx;if(xx<0||xx>=n||yy<0||yy>=rows||labels[i]<0)continue;const q=pos(i),d=Math.hypot(q.x-p.x,q.y-p.y);if(d<best){best=d;result=labels[i];}}assert.ok(best<=12,s.nature+' entrance shifted from its floor');return result;};
  const room=nearest(s);for(const branch of REALM_LOCAL_PATHS.filter(p=>p.id.startsWith(s.nature+'-')))assert.equal(nearest(branch.curve.at(-1)),room,branch.id+' is too narrow or disconnected');
 }
});
test('walking cannot enter the opaque cliff beside the old south approach',()=>{
 for(const [x,y] of [[90,875],[120,800],[180,840],[200,900]])assert.equal(insideRealm(x,y),false,'cliff '+x+','+y);
 for(const route of REALM_PATHS){const from=route.curve[Math.floor(route.curve.length/2)],p={x:from.x+900,y:from.y-900};moveRealm(p,from,23);assert.ok(insideRealm(p.x,p.y,23));}
});
