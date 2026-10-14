import type {Game,Enemy} from './simulation.ts';
// Never expose an unseen passage slime through automatic targeting.
export const visiblePriorityMimic=(g:Game,e:Enemy)=>e.active&&!!e.mimic&&Math.abs(e.x-g.player.x)<=g.targetView.x&&Math.abs(e.y-g.player.y)<=g.targetView.y;
