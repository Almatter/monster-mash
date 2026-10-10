// Clues belong to the approaches, never to a global solution in the pause menu.
export const REALM_INTRO='Explore forgotten grottos, claim ancient powers and confront the Titan. Your choices shape your arsenal. Leaving the arena restores its defenses.';
export const REALM_PAUSE_GOAL='Overcome the Titan. The bridges hold clues.';
export const REALM_PAUSE_CONTROLS='Space: inspect or teleport. Arrows: navigate. Enter: select.';
// Each inscription describes the power offered this run, not its original shrine.
export const REALM_INSCRIPTIONS:Record<string,string>={
 command:'Living hearts bend to a whisper and turn upon their former kin.',
 curse:'A dying host scatters its blight; each fallen crown infects another.',
 legion:'The earth yields a company of buried soldiers, bound to a borrowed hour.',
 throne:'Within a stolen kingdom, the weak kneel before its ruin falls.',
 soulwrit:'A spectral court binds the accused; their stolen breath sustains its judge.',
 oblivion:'A narrow starless gaze sweeps across all who stand before it.',
 meteor:'A verdict is written on the earth before a fallen star answers.',
 vortex:'An unseen hunger draws its prisoners inward and wears them away.',
 crimson:'A crimson sun blooms once, leaving ruin in every direction.',
 prismcollapse:'A many-faceted light gathers upon the strongest foe, then folds inward.',
 rendlunge:'Fangs tear a passage through the prey; the hunter is gone before the wound closes.',
 maw:'The nearest prey vanishes into a hungry mouth, and the hunter rises renewed.',
 execution:'Royal jaws seek the mighty; a wounded giant receives their cruelest judgment.',
 frenzy:'For a fleeting feast, frantic claws cast cutting hunger beyond their reach.',
 bloodthread:'A distant fang holds the mighty by a scarlet thread and drinks across the tether.',
 worldbreaker:'The ground answers a heavy fist; scattered bodies become weapons against their kin.',
 stampede:'An iron charge leaves trampled ranks beneath its unstoppable weight.',
 faultline:'Gathered motion and broken shelter feed a lingering crack that holds the pursuers fast.',
 heavenfall:'The weight of the heavens falls in one blow and scatters the assembled host.',
 gravitonseal:'A crushing seal presses its captives into the earth while sheltering its bearer.',
 rupture:'An unbound pulse bursts outward, casting the surrounding ranks away.',
 devour:'A conquered morsel feeds a sovereign hunger; the feast lends fury and shelter.',
 beam:'A relentless royal gaze follows its prey; each fallen subject strengthens its shelter.',
 catastrophe:'A sovereign sentence ends a surrounding multitude and builds shelter from their fall.',
 spellsteel:'Behind a brief shelter, spell and blade answer the attacker together.',
 soulsweep:'A reaping circle drives the crowd away and draws their departing breath inward.',
 graveshift:'The grave grants one sudden step to a chosen victim, followed by a merciless cut.',
 reapingarc:'Three spinning crescents carve bending trails through the ranks.',
 moonstorm:'An eclipse circles its bearer while seeking crescents pursue the greatest threat.',
 soulorbit:'A wandering soul-blade circles its bearer, drinking from those crossed along the way.',
 wolfbound:'A moonlit leap clears the broken road; its landing sends the waiting pack reeling.',
 moonhowl:'A lunar cry turns the lesser hunters into fleeing prey.',
 ravage:'One captive becomes a living club; its struggling weight lends reach and shelter.',
 moonfury:'Beneath a blood moon, tireless feet race from victim to victim, beyond the reach of harm.',
 moonrend:'Distant lunar claws leave a lingering wound and return its warmth to the hunter.'
};
export function realmInscription(relics:ReadonlyArray<{nature:string;ability:string}>,nature:string){
 const relic=relics.find(r=>r.nature===nature);
 return relic?REALM_INSCRIPTIONS[relic.ability]??'Time has worn these words beyond recognition.':'Time has worn these words beyond recognition.';
}
