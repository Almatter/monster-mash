export const THREAT_CURVE=[
 {at:0,rate:8,cap:95,arc:1.5,distance:560,pursuit:.78},
 {at:30,rate:12,cap:150,arc:2.1,distance:560,pursuit:.85},
 {at:60,rate:18,cap:230,arc:3.1,distance:570,pursuit:.95},
 {at:120,rate:28,cap:400,arc:4.6,distance:580,pursuit:1.08},
 {at:300,rate:46,cap:560,arc:Math.PI*2,distance:580,pursuit:1.2},
 {at:480,rate:68,cap:696,arc:Math.PI*2,distance:560,pursuit:1.3},
 {at:720,rate:100,cap:696,arc:Math.PI*2,distance:540,pursuit:1.4}
];
export const INTRODUCTIONS:Record<string,number>={thrall:0,hound:45,wing:60,spitter:90,brute:120,elite:180,titan:300};
export const OPENING={count:28,distance:320,spread:100};
export function threatAt(time:number){const index=THREAT_CURVE.findIndex(p=>p.at>time),b=THREAT_CURVE[index<0?THREAT_CURVE.length-1:index],a=THREAT_CURVE[Math.max(0,(index<0?THREAT_CURVE.length:index)-1)],t=a===b?0:Math.max(0,Math.min(1,(time-a.at)/(b.at-a.at)));return {rate:a.rate+(b.rate-a.rate)*t,cap:Math.round(a.cap+(b.cap-a.cap)*t),arc:a.arc+(b.arc-a.arc)*t,distance:a.distance+(b.distance-a.distance)*t,pursuit:a.pursuit+(b.pursuit-a.pursuit)*t};}
export const SUSTAIN={
 titan:{kills:10,heal:30,shield:80,cap:150,cooldown:4,seconds:8,momentumDistance:480,momentumGrace:1.25,momentumDecay:3,movingRegen:8,idleDrain:30},
 calamity:{kills:20,shield:320,cap:480,cooldown:2.5,seconds:12},
 overlord:{perKill:11,perSecond:52},
 devourer:{devourCap:.35,frenzyBaseCap:.25,frenzyCapPerRelease:.1,frenzyHealBase:8,frenzyHealPerRelease:1.5,guardKills:20,guardBaseSeconds:1.5,guardSecondsPerRelease:.25,guardBaseReduction:.4,guardReductionPerRelease:.05},
 sovereign:{devourCap:.4}
};
export const SUSTAIN_TEXT:Record<string,string>={titan:'Shattering ten foes heals 30 and grants 40–80 barrier based on Momentum (max 150, 8s). Moving builds Momentum and reinforces barrier; standing still lets it fade.',calamity:'A 20+ multikill restores up to 320 ward (max 480, 12s). Once every 2.5s. Rebuild it with well-placed spells.',overlord:'Controlled and summoned kills siphon 11 health each, limited to 52 health per second. Keep servants fighting.',devourer:'Devour heals up to 35% maximum health per cast. Feast kills heal 8–14 each, capped at 25–65% maximum health per cast as Release rises. Every 20 Feast kills grants 1.5–2.5s of 40–60% damage reduction.',sovereign:'Successful Devour kills heal up to 40% maximum health per cast. Feeding Rage boosts damage and reduces incoming damage by 25% for six seconds.'};
