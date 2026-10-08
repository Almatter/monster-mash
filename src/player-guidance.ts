import {EVENT,PHASES} from './data.ts';
import {RELEASES} from './unbound.ts';
export const CHAMPION_TIPS:Record<string,string>={
 reaper:'Cut through prey at range. Harvest pushes crowds away; Blink crosses danger and Eclipse keeps scythe waves flowing. Press Blink or Arc twice to use the suggested target, or click/tap to choose.',
 sovereign:'Keep prey in claw range. Use your large powers to clear space and recover, then keep the killing chain alive.',
 titan:'Keep moving to build Momentum. Spend it on crushing attacks and use your barrier to regroup.',
 calamity:'Fight at range. Press Starfall or Vortex twice to use a suggested target, or click/tap to place it. Large multikills rebuild your ward.',
 overlord:'Build an army and fight behind it. Controlled and summoned prey help sustain your reign.',
 devourer:'Keep hunting. Lunge in your movement direction through gaps, use Devour to recover, Execute heavy prey, and trigger Feast for a burst of killing and protection.'
};
export const scenarioText=(phase=EVENT.phase)=>`STAGE ${phase+1} · ${PHASES[phase].name} · ${phase===2?'MANA ABYSS':phase===1?'ASHEN WILDS':'RITUAL ARENA'}`;
export const COURT_GOAL='Find and defeat all 10 captains. Claim their seals for large Dominance rewards and choose a boon after each victory. Healing oases help you recover. Flank guards or break their protection, and move out of captain slam zones. Faster clears earn a larger bonus.';
export const COURT_TIPS:Record<string,string>={reaper:'Use Harvest or Blink to break protection, then cut through the formation with your waves.',devourer:'Court hunt: Lunge around the guard, focus the captain with Execute, then claim its seal.',titan:'Build Momentum while moving, then aim Fissure with your movement direction to slow a guarded path. Breaker clears immediate pressure.',calamity:'Court hunt: place spells behind a formation, use escorts to rebuild ward, and advance to collect the seal.',overlord:'Court hunt: convert lesser escorts and let the army chip guards from several sides; move up to claim the seal.',sovereign:'Court hunt: Rupture can break guards; alternate claws, feeding and Death Beam while closing on the captain.'};
export function releaseGuidance(seconds:number,stage:number){const next=RELEASES[stage+1];if(!next)return 'FINAL RELEASE · YOUR FULL POWER IS UNBOUND';const remaining=Math.max(0,Math.ceil(next.at-seconds));return `${next.name} IN ${Math.floor(remaining/60)}:${String(remaining%60).padStart(2,'0')}`;}
