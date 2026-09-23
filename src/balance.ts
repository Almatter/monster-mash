export const THREAT_CURVE=[
 {at:0,rate:8,cap:95,arc:1.5,distance:560,pursuit:.78},
 {at:30,rate:12,cap:150,arc:2.1,distance:560,pursuit:.85},
 {at:60,rate:18,cap:230,arc:3.1,distance:570,pursuit:.95},
 {at:120,rate:28,cap:400,arc:4.6,distance:580,pursuit:1.08},
 {at:300,rate:46,cap:780,arc:Math.PI*2,distance:580,pursuit:1.2},
 {at:480,rate:68,cap:1076,arc:Math.PI*2,distance:560,pursuit:1.3},
 {at:720,rate:100,cap:1076,arc:Math.PI*2,distance:540,pursuit:1.4}
];
export const INTRODUCTIONS:Record<string,number>={thrall:0,hound:45,wing:60,spitter:90,brute:120,elite:180,titan:300};
export const OPENING={count:28,distance:320,spread:100};
export function threatAt(time:number){const index=THREAT_CURVE.findIndex(p=>p.at>time),b=THREAT_CURVE[index<0?THREAT_CURVE.length-1:index],a=THREAT_CURVE[Math.max(0,(index<0?THREAT_CURVE.length:index)-1)],t=a===b?0:Math.max(0,Math.min(1,(time-a.at)/(b.at-a.at)));return {rate:a.rate+(b.rate-a.rate)*t,cap:Math.round(a.cap+(b.cap-a.cap)*t),arc:a.arc+(b.arc-a.arc)*t,distance:a.distance+(b.distance-a.distance)*t,pursuit:a.pursuit+(b.pursuit-a.pursuit)*t};}
export const SUSTAIN={
 titan:{kills:10,heal:30,shield:80,cap:260,cooldown:4,seconds:8},
 calamity:{kills:20,shield:320,cap:480,cooldown:2.5,seconds:12},
 overlord:{perKill:8,perSecond:42},
 devourer:{devourCap:.35,frenzyCap:.25},
 sovereign:{devourCap:.4}
};
export const SUSTAIN_TEXT:Record<string,string>={titan:'Shattering ten foes with one attack restores 30 health and grants 80 armor barrier (max 260, 8s). Once every 4s.',calamity:'A 20+ multikill restores up to 320 ward (max 480, 12s). Once every 2.5s. Rebuild it with well-placed spells.',overlord:'Controlled and summoned kills siphon 8 health each, limited to 42 health per second. Keep servants fighting.',devourer:'Devour heals up to 35% maximum health per cast. Frenzy feeding heals up to 25% maximum health in total.',sovereign:'Successful Devour kills heal up to 40% maximum health per cast and grant Feeding Rage.'};
