import test from 'node:test';import assert from 'node:assert/strict';
import {TitanRealmArt} from '../src/titan-realm-art.ts';
import {Game} from '../src/simulation.ts';import {REALM_GROTTOS} from '../src/titan-realm-map.ts';
test('each shrine object stays visible at its own anchor and northward approach on desktop and touch',()=>{
 const g=new Game(31,{monsterId:'lycanthrope'},2),art=new TitanRealmArt();art.compose=()=>{};art.lightRelic=()=>{};const draws=[];art.image=(_c,id,x,y)=>draws.push({id,x,y});
 for(const shrine of g.realm.shrines){shrine.claimed=true;shrine.occupied=false;const p=REALM_GROTTOS[shrine.id];
  for(const [halfW,halfH] of [[640,400],[400,190]])for(const kind of ['relic','portal']){const anchor={x:p.x+p[kind].x,y:p.y+p[kind].y};for(const dy of [-halfH,-100,0,100,halfH]){Object.assign(g.player,{x:anchor.x,y:anchor.y+dy});draws.length=0;art.drawEnvironment({},g,0,halfW,halfH);assert.ok(draws.some(d=>d.id===(kind==='portal'?'portal':'relic-'+shrine.decor)&&d.x===anchor.x&&Math.abs(d.y-anchor.y)<=3),`${p.nature} ${kind} north ${dy}`);}}
 }
});
test('offscreen shrine sprites are culled independently',()=>{const g=new Game(2,{},2),art=new TitanRealmArt();art.compose=()=>{};art.lightRelic=()=>{};let draws=0;art.image=()=>draws++;Object.assign(g.player,{x:1e6,y:1e6});art.drawEnvironment({},g,0,400,190);assert.equal(draws,0);});

