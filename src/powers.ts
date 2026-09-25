import {SUSTAIN} from './balance.ts';
import type {Game} from './simulation.ts';
import type {AbilityDef} from './content-monsters.ts';
import {addServant,dominate,corrupt} from './servants.ts';
export const POWER_HANDLERS:Record<string,(game:Game,power:AbilityDef)=>void>={
 dominate(g,p){dominate(g,p.radius,12+g.release*3);},
 curse(g,p){corrupt(g,p.radius,p.duration);g.area(g.player.x,g.player.y,p.radius,p.damage,'curse');},
 summon(g,p){for(let i=0;i<8+g.release*2;i++){const a=i/(8+g.release*2)*Math.PI*2;addServant(g,g.player.x+Math.cos(a)*70,g.player.y+Math.sin(a)*70,'summoned',p.duration);}},
 dominion(g,p){corrupt(g,p.radius);dominate(g,400*g.releaseStats.radius,16+g.release*4);g.area(g.player.x,g.player.y,p.radius,p.damage,'ultimate');},
 meteor(g,p){if(g.fields.length<8)g.fields.push({kind:'meteor',x:g.player.x+Math.cos(g.player.angle)*360,y:g.player.y+Math.sin(g.player.angle)*360,life:p.duration||1.2,radius:p.radius,damage:p.damage,tick:0,kills:0});},
 vortex(g,p){if(g.fields.length<8)g.fields.push({kind:'vortex',x:g.player.x+Math.cos(g.player.angle)*250,y:g.player.y+Math.sin(g.player.angle)*250,life:p.duration||4,radius:p.radius,damage:p.damage,tick:0,kills:0});},
 lunge(g,p){g.dash={remaining:p.duration||.3,speed:950*g.releaseStats.dash,damage:p.damage,kills:0,angle:g.player.angle,radius:p.radius,source:'lunge'};},
 execute(g,p){let target:import('./simulation.ts').Enemy|null=null,best=Infinity;g.nearby(g.player.x,g.player.y,p.radius,e=>{const distance=Math.hypot(e.x-g.player.x,e.y-g.player.y);if(distance>p.radius)return;const rank=(e.kind==='elite'&&e.hp<e.maxHp?0:1000)+distance;if(rank<best){best=rank;target=e;}});if(target){const e=target as import('./simulation.ts').Enemy;g.effect(e.x,e.y,'execute',70,.5);const kills=g.damage(e,p.damage*g.powerScale()*(e.hp<e.maxHp*.5?2:1),'execute')?1:0;g.completeAttack(kills);}},
 frenzy(g,p){const s=SUSTAIN.devourer;g.frenzy=p.duration||8;g.frenzyKills=0;g.frenzyGuard=0;g.frenzyHealing=g.player.maxHp*(s.frenzyBaseCap+s.frenzyCapPerRelease*g.release);},
 shockwave(g,p){g.area(g.player.x,g.player.y,p.radius,p.damage,'shockwave',900);},
 devour(g,p){g.healBudget=g.player.maxHp*(g.monster.id==='sovereign'?SUSTAIN.sovereign.devourCap:SUSTAIN.devourer.devourCap);g.area(g.player.x,g.player.y,p.radius,p.damage,'devour');g.player.rage=6;},
 beam(g,p){g.beam=p.duration||2.5;g.beamTick=0;g.beamKills=0;g.beamPower=p;},
 blast(g,p){g.area(g.player.x,g.player.y,p.radius,p.damage,'ultimate',450);},
 charge(g,p){g.dash={remaining:p.duration||.65,speed:650*g.releaseStats.dash,damage:p.damage,kills:0,angle:g.player.angle,radius:p.radius,source:'trample'};},
 launch(g,p){g.area(g.player.x,g.player.y,p.radius,p.damage,'launch',1300);}
};
