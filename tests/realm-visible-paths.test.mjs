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

// Source-floor anchors taken from the two reported screenshots, away from parapets.
// Check actual swept traversal, not just the existence of a nearby navigation lane.
test('both reported winding passages allow walking along the visible floor in either direction',()=>{
 const passages=[
  {id:0,pixels:[[300,170],[300,128],[320,103],[355,85],[390,71],[430,54],[470,40],[515,26],[560,18],[600,20]]},
  {id:3,pixels:[[370,390],[400,420],[398,450],[382,480],[350,507],[310,520],[270,527],[232,535],[200,551],[180,571],[160,588],[133,600]]}
 ];
 for(const {id,pixels} of passages){const s=REALM_GROTTOS[id],anchors=pixels.map(([x,y])=>({x:s.x+(x-300)*2,y:s.y+(y-300)*2}));for(const route of [anchors,[...anchors].reverse()]){let p={...route[0]};assert.ok(insideRealm(p.x,p.y,27),s.nature+' start');for(const target of route.slice(1)){const from={...p},n=Math.ceil(Math.hypot(target.x-p.x,target.y-p.y)/5);for(let k=1;k<=n;k++){const wanted={x:from.x+(target.x-from.x)*k/n,y:from.y+(target.y-from.y)*k/n},previous={...p};Object.assign(p,wanted);moveRealm(p,previous,27);assert.ok(Math.hypot(p.x-wanted.x,p.y-wanted.y)<.01,s.nature+' blocked floor '+JSON.stringify(wanted));}}}}
});
test('the winding decks retain solid parapets and do not permit walking down their cliff faces',()=>{
 for(const [id,x,y] of [[0,400,125],[0,450,108],[3,270,580],[3,320,570],[3,330,453]]){const s=REALM_GROTTOS[id];assert.equal(insideRealm(s.x+(x-300)*2,s.y+(y-300)*2),false,s.nature+' cliff '+x+','+y);}
});
