import test from 'node:test';import assert from 'node:assert/strict';
import {REALM_INSCRIPTIONS,realmInscription} from '../src/realm-guidance.ts';
import {RELIC_POOLS} from '../src/stage-three.ts';
import {Game} from '../src/simulation.ts';
test('every randomly offered relic power has its own distinct inscription',()=>{
 const abilities=Object.values(RELIC_POOLS).flat();assert.deepEqual(Object.keys(REALM_INSCRIPTIONS).sort(),abilities.sort());assert.equal(new Set(Object.values(REALM_INSCRIPTIONS)).size,abilities.length);
 for(const [nature,pool] of Object.entries(RELIC_POOLS)){const texts=pool.map(ability=>realmInscription([{nature,ability}],nature));assert.equal(new Set(texts).size,5);for(const text of texts){assert.ok(text.length>30);assert.doesNotMatch(text,/grotto|shrine|altar/i);}}
});
test('all four post clues follow the offered ability across seeds and relic relocations',()=>{
 const seen=new Set();for(let seed=1;seed<=400;seed++){const g=new Game(Math.imul(seed,2654435761)>>>0,{monsterId:'devourer'},2);for(const nature of g.realm.pattern){const relic=g.realm.relics.find(r=>r.nature===nature),expected=REALM_INSCRIPTIONS[relic.ability];assert.equal(realmInscription(g.realm.relics,nature),expected);seen.add(relic.ability);relic.shrine=null;assert.equal(realmInscription(g.realm.relics,nature),expected);relic.shrine=(seed+2)%7;assert.equal(realmInscription(g.realm.relics,nature),expected);}}
 assert.equal(seen.size,35);
});
