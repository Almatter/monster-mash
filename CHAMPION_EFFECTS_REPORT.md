# Champion aura and death audio update

Ten new original anime isekai sprites were generated with the built-in imagegen tool. PNG masters: `art-source/vfx/`; optimized runtime WebP: `public/assets/vfx/`; exact prompts: `art-source/vfx/CHAMPION_AURA_PROMPTS.md`. Devourer's previously generated Unbound/claw art is retained.

| Champion | Outer Unbound | Active inner effect |
|---|---|---|
| Sovereign | Crown fragments and royal banners | Crimson Feeding Rage feathers/fangs |
| Titan | Red basalt and molten faults | Separate armored stone plates |
| Calamity | Violet void ribbons and astrolabe fragments | Cyan/amethyst crystal ward |
| Overlord | Teal souls and funeral crown fragments | No player barrier mechanic |
| Devourer | Existing predatory Unbound | Frenzy jaws; Feast Guard carapace; Lunge phase slashes |

Guard art replaces the inner frenzy art while guard is active, with Unbound remaining behind it. The ultimate aura follows the full frenzy duration rather than the short cut-in. State art remains in Low FX and disappears when the corresponding state ends. No placeholder player state circles remain. Enemy telegraphs and ground placement markers remain functional geometric indicators.

Common death sounds now have four species identities and twelve variants each. Major deaths have eight variants. Organic cues avoid their last two textures and vary pitch/glide, gain, duration and transients. Heal/shield/devour/collision/corruption/ultimate-impact cues also vary because they recur throughout runs. The shared common-death throttle and ten-SFX/two-UI voice cap are preserved.

Validation: all 41 unit tests passed; all five layered champion states passed at 1440x900 and 844x390, including Low FX and expiry. Visual screenshot inspection confirmed transparent centers and visible champion bodies. With 696 static enemies and layered states, headless render p95 ranged 9.4-12.2 ms on this host; this is not physical mobile hardware performance. Audio browser checks passed distinct species signatures, 12/8/6 texture pools, recent-repeat exclusion, bounded pitch movement, finite nonclipping PCM, shared death throttle, voice caps and persistent audio controls. Existing Devourer visual/audio checks passed. Pages artifact passed with 167 production files.

This changes presentation and audio only; damage, cooldowns, sustain, survival rules and scoring are unchanged. Human listening remains useful because this environment has no listening-capable tool.
