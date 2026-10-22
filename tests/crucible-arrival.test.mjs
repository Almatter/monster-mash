import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Crucible} from '../src/crucible-sim.ts';
import {CRUCIBLE_MAP} from '../src/crucible-layout.ts';
const map={...CRUCIBLE_MAP,structures:[],zones:[],terrain:{sight:[],slows:[],hazards:[]}};
test('every rival settles at its crystal instead of overshooting and reversing every frame',()=>{
 for(let team=0;team<8;team++)for(const dt of [1/30,.05]){
  const g=new Crucible(17,'normal',map),t=g.teams[team],u=t.champion,c=t.crystal;
  for(const v of g.units)v.active=v.kind==='crystal'||v===u;
  for(const v of g.teams){v.wave=v.respawnAt=v.plan=1e9;v.trapReady=[1e9,1e9,1e9];v.mana=0;}
  Object.assign(u,{x:c.x+3,y:c.y,hp:u.maxHp*.5,retreat:true,invuln:1e9});g.rebuild();
  for(let n=0;n<30;n++){g.step(dt);assert.equal(u.moving,false,t.monster+' settles');assert.equal(u.x,c.x+3);}
  // A new destination outside the arrival band must still provoke movement.
  u.x=c.x+150;g.step(dt);assert.ok(u.x<c.x+150,t.monster+' can still retreat');
 }
});
