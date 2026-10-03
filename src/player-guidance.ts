import {EVENT,PHASES} from './data.ts';
import {RELEASES} from './unbound.ts';
export const CHAMPION_TIPS:Record<string,string>={
 sovereign:'Keep prey in claw range. Use your large powers to clear space and recover, then keep the killing chain alive.',
 titan:'Keep moving to build Momentum. Spend it on crushing attacks and use your barrier to regroup.',
 calamity:'Fight at range. Place Starfall and Vortex ahead of the swarm; large multikills rebuild your ward.',
 overlord:'Build an army and fight behind it. Controlled and summoned prey help sustain your reign.',
 devourer:'Keep hunting. Lunge in your movement direction through gaps, use Devour to recover, Execute heavy prey, and trigger Feast for a burst of killing and protection.'
};
export const scenarioText=(phase=EVENT.phase)=>`STAGE ${phase+1} · ${PHASES[phase].name} · ${phase===1?'ASHEN WILDS':'RITUAL ARENA'}`;
export const COURT_GOAL='Explore the canyon paths and slay all 10 captains. Their locations change each run. Leave the red slam zone before it strikes. Each captain awards a chosen boon and recovery; collect its seal for 15,000 Dominance. Normal healing is reduced to 18% and shields to 25%; healing oases restore 45% health, then rest for 90 seconds. Minion/combat scoring is capped: 50,000 initially, then +50,000 per captain, up to 500,000. Clearing all ten within 10 minutes earns +1,000,000 Dominance; the speed bonus declines to zero at 15 minutes. Boon choices pause the clock.';
export const COURT_TIPS:Record<string,string>={devourer:'Court hunt: Lunge around the guard, focus the captain with Execute, then claim its seal.',titan:'Court hunt: launch vanguards into their allies or trample their front to break guards, then charge to the seal.',calamity:'Court hunt: place spells behind a formation, use escorts to rebuild ward, and advance to collect the seal.',overlord:'Court hunt: convert lesser escorts and let the army chip guards from several sides; move up to claim the seal.',sovereign:'Court hunt: Rupture can break guards; alternate claws, feeding and Death Beam while closing on the captain.'};
export function releaseGuidance(seconds:number,stage:number){const next=RELEASES[stage+1];if(!next)return 'FINAL RELEASE · YOUR FULL POWER IS UNBOUND';const remaining=Math.max(0,Math.ceil(next.at-seconds));return `${next.name} IN ${Math.floor(remaining/60)}:${String(remaining%60).padStart(2,'0')}`;}
