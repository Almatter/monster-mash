import {EVENT,PHASES} from './data.ts';
import {RELEASES} from './unbound.ts';
export const CHAMPION_TIPS:Record<string,string>={
 sovereign:'Keep prey in claw range. Use your large powers to clear space and recover, then keep the killing chain alive.',
 titan:'Keep moving to build Momentum. Spend it on crushing attacks and use your barrier to regroup.',
 calamity:'Fight at range. Place Starfall and Vortex ahead of the swarm; large multikills rebuild your ward.',
 overlord:'Build an army and fight behind it. Controlled and summoned prey help sustain your reign.',
 devourer:'Keep hunting. Lunge through gaps, devour prey to recover, and use your ultimate for a burst of killing and protection.'
};
export const scenarioText=()=>`WEEK ${EVENT.phase+1} · ${PHASES[EVENT.phase].name} · RITUAL ARENA`;
export function releaseGuidance(seconds:number,stage:number){const next=RELEASES[stage+1];if(!next)return 'FINAL RELEASE · YOUR FULL POWER IS UNBOUND';const remaining=Math.max(0,Math.ceil(next.at-seconds));return `${next.name} IN ${Math.floor(remaining/60)}:${String(remaining%60).padStart(2,'0')}`;}
