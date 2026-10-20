// Deterministic late-game behavioral smoke check, not a human win-rate or duration model.
// Max stat ranks, native augments, 1,000 banked mana each; purchases disabled to isolate combat.
import {Crucible} from '../src/crucible-sim.ts';
for(const seed of (process.argv.slice(2).length?process.argv.slice(2).map(Number):[17,23])){
const g=new Crucible(seed,'normal'),arrivals=new Set();let casts=0;
g.time=600;for(let team=0;team<8;team++){const t=g.teams[team];t.mana=1000;t.shopAt=1e9;Object.assign(t.upgrades,{might:5,haste:5,vitality:5,armor:1});t.augments=t.build.augments.slice();t.champion.maxHp=t.champion.hp=t.baseHp*1.6;const b=g.combat.actors[team].brain,cast=b.cast.bind(b);b.cast=(...args)=>{const done=cast(...args);if(done)casts++;return done;};}
for(let n=0;n<180*20&&g.winner<0;n++){g.step(1/20);if(n%20===0)for(const u of g.units)if(u.active&&['infantry','ranged'].includes(u.kind))for(let team=0;team<8;team++)if(team!==u.team&&g.teams[team].crystal.active&&g.inDefense(team,u))arrivals.add(u.id+':'+team);}
console.log(JSON.stringify({seed,mode:g.difficulty,simulatedSeconds:180,casts,abilityManaSpent:Math.round(g.teams.reduce((n,t)=>n+1000+t.earnedMana-t.mana,0)),rivalDeaths:g.teams.reduce((n,t)=>n+t.deaths,0),troopsKilled:g.teams.reduce((n,t)=>n+t.troopKills,0),baseArrivals:arrivals.size,crystals:g.teams.filter(t=>t.crystal.active).length,bank:Math.round(g.teams.reduce((n,t)=>n+t.mana,0))}));

}
