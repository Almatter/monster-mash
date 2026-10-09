export const CHAMPION_VFX:Record<string,{unbound:string;perks:string[]}>={
 lycanthrope:{unbound:'lycanthrope-unbound',perks:['lycanthrope-claw','lycanthrope-landing','lycanthrope-parkour','lycanthrope-howl','lycanthrope-fury','lycanthrope-moonrend','lycanthrope-barrier','lycanthrope-hit']},
 reaper:{unbound:'reaper-unbound',perks:['reaper-wave','reaper-sweep','reaper-blink','reaper-volley','reaper-eclipse','reaper-siphon']},
 sovereign:{unbound:'sovereign-unbound-aura',perks:['sovereign-rage','sovereign-aegis']},
 titan:{unbound:'titan-unbound-aura',perks:['titan-barrier','titan-cleave']},
 calamity:{unbound:'calamity-unbound-aura',perks:['calamity-ward','calamity-starfall-preview','calamity-vortex-preview','calamity-vortex-wisp','arcane-dissolve']},
 overlord:{unbound:'overlord-unbound-aura',perks:['overlord-soul-brand']},
 devourer:{unbound:'devourer-unbound-aura',perks:['devourer-claw-wave','devourer-claw','devourer-frenzy','devourer-guard','devourer-dodge']}
};

for(const [id,pack] of Object.entries(CHAMPION_VFX))pack.perks.push('relic-power-'+id);
