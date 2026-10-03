# Ashen Wilds Stage 2 playtest release

Tester entry: **https://almatter.github.io/monster-mash/stage2-test/**. Local preview: **http://127.0.0.1:4173/stage2-test/** (the previous localhost `?stage2-test=1` link also works).

The dedicated test entry bypasses Gatebreaker and the release date for all five champions. It visibly labels runs and codes as playtests. Test records, titles, palettes and personal bests use the separate `mm-stage2-test-mm-profile` storage key. It neither reads nor writes the official `mm-profile` progression; progress transfer is hidden there. Test titles can be earned and equipped for testing, but do not become official rewards. The normal landing page still requires Gatebreaker and October 8, 2026 at midnight Eastern; official earned access covers every champion. A test query on the normal public page provides no bypass.

## Hunt and exploration

Explore a fixed 23,040 × 17,280 desert canyon basin, with twenty-four overlapping ridge props forming staggered walls and connected routes. The map is rectangular, not the Stage 1 circular arena. Ten captain camps occupy a seeded selection of sixteen sites. Camps activate within 600 units and persist after discovery. Each has a captain, four guarded vanguards and sixteen lesser escorts. There is no minimap, captain pointer, trail marker or discovery announcement. Players find captains by exploring and learn the fixed pathways across runs. Navigation still uses 713 shared nodes and at most twelve cached flow fields. Spacing grows with the world, retaining the original node/prop/entity counts rather than multiplying them. Terrain uses the same repeating texture and nearby prop rendering. Routes were expanded to retain a longer search while full kits shorten captain combat.

Slay all ten captains to win. Each of the first nine kills pauses combat, cooldowns and the run clock until a boon is chosen. Every champion starts at Final Release, including three charged Devourer Lunges before the first frame. Boons improve the fully released kit further; neither choices nor elapsed time unlock its starting abilities. The final captain ends the mission. Clear time is the primary Stage 2 personal best; Dominance remains a secondary result.

## Captain danger and recovery

Captains begin with 32,000 HP and gain 40% of base HP per captain slain. Living captains preserve their remaining health fraction when they scale. Contact damage starts at 24 rather than the v18 prototype's 37.5, and gains 7% per tier, before the existing hunt/champion modifiers. A captain slam warns for 1.4 seconds, covers a 170-unit radius and deals 115 damage, gaining 7% per tier before champion protection. Its attack cycle is 4.6 seconds. Movement and stepping outside the warning matter; no stationary fully released champion survived the isolated idle-attack captain test for a minute.

Generic captain-damage leech remains absent. Kit healing retains 40% of its Stage 1 amount, or 75% for Devourer; shield generation retains 40%, with 55% of normal capacity. Stage 2 Maw of Ruin drains a captain it actually damages: 10% of health damage, with an 18%-maximum-health raw minimum while its cast budget remains. This retains at least 13.5% maximum-health recovery on an otherwise isolated captain hit, up to 26.25% across captain drain and kill recovery combined. The shared raw cast limit remains 35%; empty casts cannot heal. Feast keeps its existing 65% raw healing limit at Final Release, yielding up to 48.75% maximum health with the hunt modifier. Basic attacks and Execute do not gain captain leech. Existing defensive mechanics still have a purpose. Five healing oases automatically restore 45% maximum HP when approached below 80% health, then each goes on a separate 90-second cooldown. Captain boon selection restores 15% HP, or 30% for Second Heart, and gives 1.5 seconds of return protection. Seals award score only; they do not heal.

Finite guards absorb 60% frontal damage until broken; flanking bypasses absorption while wearing down guard. Impact and Lunge break guards immediately. Close captain attacks gain 25%. Titan launch/shockwave/trample damage against captains is multiplied by 18; Sovereign shockwave by 15. Flying-body collision damage has a ×4.5 captain multiplier with a 0.12-second repeat interval. Execute has a ×3.5 captain multiplier and a 5.5%-maximum-HP damage floor before positional/guard effects. Its ordinary below-half-health doubling still applies to the damage branch. Servant damage has a ×1.3 multiplier; Calamity's continuous ray deals 60% against captain armor and Sovereign's beam retains full damage. All kits can defeat all guards/captains; there is no immunity by damage type.

Ambient hunt pressure uses captain progress, not endless elapsed-time scaling. Its spawn/cap multipliers are 0.28/0.4, leaving room for exploration and recovery while captains remain dangerous. Guard breaks grant +400, impact breaks +1,500 extra, close captain finishes +6,000, and collected seals +15,000. The last seal is automatic at victory. Other seals expire after two minutes and require champion contact. Ordinary enemies grant 70% base kill score. Enemy and effect pools stay bounded.

## Bounded scoring and clear-speed reward

Stage 2 starts with a 50,000-Dominance combat allowance. Each captain defeated opens another 50,000, up to 500,000 for the whole hunt. Unused allowance carries forward. Ordinary enemy kills, multikills, run feats and wave points all draw from the same allowance, so repeatedly farming those bonuses cannot bypass the cutoff. The HUD shows earned combat score and the currently unlocked limit; reaching the limit prompts the next captain hunt. Kills still count toward body count, Carnage, achievements and kit sustain after their score stops. Captain kill points and finite guard/impact/close-hunt/seal rewards remain separate.

Completing all ten captains grants the same clear-speed reward to every champion: +1,000,000 Dominance at 10 minutes or less, decreasing linearly by 200,000 per minute to zero at 15 minutes. Partial, defeated and retired hunts receive none. The final captain ends the run and grants the reward once; the bonus is not multiplied by Carnage. Recorded Stage 2 duration rounds up to a whole second, with a small floating-point tolerance, so the bonus and signed duration agree. Boon selection still pauses the run clock.

Results, copied results, saved cards and the verifier expose the score breakdown. The current signed run code records combat, captain and speed contributions separately and validates their limits, completion status and sum with hunt objectives. Old results retain their original rules and scores. Stage 1 scoring remains uncapped and unchanged.

## Seven choices

Each boon has three ranks and lasts only for its current hunt.

| Boon | Effect per rank |
|---|---|
| Wayfarer | +12% movement speed |
| Kingslayer | +18% attack and ability damage |
| Far Reach | +12% attack and ability reach |
| Relentless | Ability cooldown multiplier ×0.9 |
| Rending Rhythm | +18% basic attack speed |
| Enduring Power | +20% sustained spell, servant and protective-state duration |
| Second Heart | +15% base maximum HP and 30% recovery on selection |

Duration extends actual beams, vortex, corruption, servants, Feast, Feeding Rage and earned barriers. Dash distance and meteor fuse remain precise. The phone landscape dialog fits its seven choices in two rows and supports scrolling on smaller displays.

## Generated guard and captain warnings

The guarded front now uses painted bronze shield-arc art, rotated around the unit's actual facing. Captain windups use a transparent ember/obsidian sigil over their exact 170-unit damage radius, with brightness increasing toward impact. The same artwork supplies the slam aftermath. Critical warning art remains visible at low FX settings. A thin boundary retains exact radius information; the old solid danger disk and plain guard arc are removed. Runtime warnings add 1.25 MiB of decoded RGBA: a 512-pixel slam and 256-pixel directional front. Canvas centers are preserved during packing, particularly for the asymmetric guard front.

The built-in imagegen tool produced [court-slam.png](art-source/stage2/court-slam.png) and [court-guard-front.png](art-source/stage2/court-guard-front.png). Final packed assets are [court-slam.webp](public/assets/vfx/court-slam.webp) and [court-guard-front.webp](public/assets/vfx/court-guard-front.webp). Exact prompts and mode are in [WARNING_PROMPTS.json](art-source/stage2/WARNING_PROMPTS.json); reproduce packing with `node tools/pack-court-warning-art.mjs`.

## Music, hit art and rewards

Stage 2 now has an original procedural desert pursuit theme: D Phrygian dominant, plucked strings, flute phrasing and frame-drum percussion. It uses the existing seven-source adaptive mixer and distinct intensity states. Browser checks found finite PCM, seven stable voices and 21.2 MB of retained sample buffers. Previously it reused the selected champion's music.

Surviving enemy hits now show a generated anime slash-impact asset rather than the yellow filled circle, in both stages. Generated desert healing shrine art identifies recovery points. The built-in imagegen tool produced the new masters [enemy-hit.png](art-source/stage2/enemy-hit.png) and [healing-shrine.png](art-source/stage2/healing-shrine.png), packed into [enemy-hit.webp](public/assets/vfx/enemy-hit.webp) and [court-shrine.webp](public/assets/arena/court-shrine.webp). Exact prompts and mode are recorded in [EFFECT_PROMPTS.json](art-source/stage2/EFFECT_PROMPTS.json); existing captain/vanguard/terrain prompts are in [PROMPTS.md](art-source/stage2/PROMPTS.md) and [TERRAIN_PROMPTS.md](art-source/stage2/TERRAIN_PROMPTS.md). All final assets live inside this project and preserve alpha transparency.

Five Stage 2 records recognize first captain, 20 guards, 10 impact breaks, a complete hunt, and a ≤12-minute hunt. Ten cosmetic titles recognize clear counts, captain totals, 40 guards in one hunt, eight close kills in a clear, ≤12/≤10-minute clears, and completed hunts with maximum Wayfarer/Rending Rhythm/Enduring Power. They appear in the title registry and can be equipped and shared. Failed or retired hunts do not earn clear/build/speed rewards. Test achievements stay in the isolated test profile.

## Reproducible automated sample

Three seeds per champion (77, 123, 444). Real incoming damage, no immortality, injected healing, teleporting, or forced kills. A controller explores a fixed route through possible camp sites without reading undiscovered captain coordinates, follows actual encountered enemies/seals, circles captains, leaves slam zones, and travels to available healing shrines when wounded. It chooses vitality when low, otherwise damage/recharge/travel. Human route knowledge and boon choices can change the results; this is a small diagnostic sample, not a promise of completion time or a human win rate.

All **15/15 final samples cleared**. These average times therefore measure survival **through victory**, rather than time until death. Choice deliberation pauses the combat clock and adds real session time.

| Champion | Average time to clear | Average body count | Average Dominance | Time range | Clears |
|---|---:|---:|---:|---:|---:|
| Devourer | 7:21 | 2,648 | 1,474,595 | 7:05–7:30 | 3/3 |
| Titan | 9:26 | 4,400 | 1,684,738 | 9:15–9:36 | 3/3 |
| Sovereign | 10:10 | 5,894 | 1,742,002 | 10:05–10:15 | 3/3 |
| Calamity | 12:19 | 8,062 | 1,271,167 | 12:12–12:33 | 3/3 |
| Overlord | 12:06 | 7,648 | 1,329,802 | 11:54–12:12 | 3/3 |

The overall automated average is about ten minutes. Devourer clears substantially faster (7:21 average) because the controller repeatedly uses its mobility and follows a learned route; the other kits average 9:26–12:19. The earlier 10–12-minute goal is not achieved for every kit in this sample. Human searching, route mistakes, recovery and boon choices can lengthen a hunt. No forced wait or added early captain HP is used to make a fast hunter spend longer in combat. More player feedback is needed before claiming a human duration target.

The fourfold CPU-throttle comparison uses a synthetic persistent-enemy Overlord scene against deployed v18: 87 enemies, eight/nine surviving servants, identical 1,280 × 720 canvas, no extra spawning during the sample. v18 measured 11.7 FPS and 3.62 ms average drawing; v19 measured 12.3 FPS and 3.11 ms drawing. This single ten-second sample shows no observed map-expansion penalty, not a promised speed improvement or a real low-end laptop benchmark. A separate roughly 240-enemy overload fixture ran about five FPS under fourfold throttling in both versions; oversized crowded scenes remain CPU limited. World expansion does not increase navigation nodes, cached fields, terrain texture dimensions, enemy pools or framebuffer size. New warnings add only their bounded texture allocation.

The hunt continues to reward objectives and speed. All five kits cleared; Titan retains impact rewards, and smaller Devourer body counts still earn a strong completion bonus. Healing oases remain available, though none of these final controller samples needed a visit. Native device testing remains necessary for frame-rate and memory claims.

## Validation and compatibility

- **136 unit tests passed**: full-release starts, meaningful bounded Maw/Feast recovery, walk-only slam escapes, real boon effects, dangerous stationary captain pressure, healing cooldowns, every site/shrine's reachability, clear/build/speed rewards, profile transfers, legacy codes, combat-score clipping, farming bypasses, continued sustain, clear-time boundaries and signed score breakdowns.
- Ten fixed-seed Stage 1 simulations (all five champions × seeds 77/444) matched deployed commit `5aae6a7` exactly through ten minutes, including RNG, enemy/player state, score, sustain, servants, fields, projectiles and cooldowns. Stage 1 rules remain `2026.10-v15-autotarget-squad`.
- Desktop and touch landscape tests passed for all kits, art, seal contact, frozen choices, nine choices and automatic victory, signed results, test-title persistence and zero writes to the official profile.
- Public-origin/subdirectory tests passed for the explicit test entry and normal Gatebreaker/date locks. Phone → PC → phone transfer, personal bests, normal Stage 1, direct verifier and Pages subpaths passed.
- The update lifecycle test kept an active paused match/results intact and activated the new version on return to the menu, retaining identity and offline transfer controls.
- Production build, static Pages artifact validation and Git whitespace checks passed. Native low-end laptop or real phone performance has not been benchmarked in this change.

Stage 2 rules are `2026.10-v19-court-hunts`; playtests use `2026.10-v19-court-test`. Historical v16/v17/v18 Court codes, older MM4 codes and MM1–MM3 remain readable. Existing save version 3 is unchanged. Raw v19 measurements (`test-results/stage2-v19-final.json`) and screenshots are in ignored `test-results/`; reproduce with `node tests/stage-two-balance.mjs` and the tests listed above.
