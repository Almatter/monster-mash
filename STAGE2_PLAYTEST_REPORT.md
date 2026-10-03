# Ashen Wilds Stage 2 playtest release

Tester entry: **https://almatter.github.io/monster-mash/stage2-test/**. Local preview: **http://127.0.0.1:4173/stage2-test/** (the previous localhost `?stage2-test=1` link also works).

The dedicated test entry bypasses Gatebreaker and the release date for all five champions. It visibly labels runs and codes as playtests. Test records, titles, palettes and personal bests use the separate `mm-stage2-test-mm-profile` storage key. It neither reads nor writes the official `mm-profile` progression; progress transfer is hidden there. Test titles can be earned and equipped for testing, but do not become official rewards. The normal landing page still requires Gatebreaker and October 8, 2026 at midnight Eastern; official earned access covers every champion. A test query on the normal public page provides no bypass.

## Hunt and exploration

Explore a fixed 19,200 × 14,400 desert basin, about 31% less area than v19. Twenty-four compact basalt ridges form short walls with routes around them. Ten captains occupy ten separate regions, each with two seeded alternatives (twenty possible positions). Four early regions cover the central approaches; six outer regions require exploration. Every region has one captain, so a random subset cannot leave a whole outer region empty. Camps still activate within 600 units and persist after discovery. Each has a captain, four guarded vanguards and sixteen lesser escorts. There is no minimap, captain pointer, trail marker or discovery announcement.

Four fixed, named landmarks identify the outer routes: Swordfall, Rib Gate, Sun Spire and Broken Bell. They stay put across runs while captain positions rotate. New generated rock art excludes the old flat ground/plateau. Artwork and physical footprints are independent of world spacing: a ridge draws at 560 × 180 units, with a narrow capsule collider around its stone core. Landmark arches have separate colliders at their feet and a walkable opening. Nearby empty ground remains traversable. Props use rotated silhouette bounds plus a margin for culling; captain warning radii are also included when their centers leave the screen. Images load once and remain cached.

Navigation uses the same 713 shared nodes and at most twelve cached flow fields. The four landmark textures add 2.53 MiB of decoded RGBA; the sharper 1024 × 342 ridge texture adds 0.60 MiB compared with v19. Enemy pools, effects and audio buffers remain bounded. The built-in imagegen tool produced [rock-ridge.png](art-source/stage2/rock-ridge.png) and [landmarks.png](art-source/stage2/landmarks.png). Exact prompts and mode are in [NAVIGATION_PROMPTS.json](art-source/stage2/NAVIGATION_PROMPTS.json). Packed outputs are [court-ridge.webp](public/assets/arena/court-ridge.webp), [court-swordfall.webp](public/assets/arena/court-swordfall.webp), [court-rib-gate.webp](public/assets/arena/court-rib-gate.webp), [court-sun-spire.webp](public/assets/arena/court-sun-spire.webp) and [court-broken-bell.webp](public/assets/arena/court-broken-bell.webp); reproduce with `node tools/pack-stage2-terrain.mjs`.

The opening-discovery sample covers 720 actual simulated routes: all five kits × three seeds × sixteen headings × straight/curved/wandering movement. Routes know no captain positions, use no abilities or immunity, and count discovery only when a spawned captain fits the actual phone landscape camera. Every opening found a visible captain within 4.57 seconds (mean 1.68 seconds, 95th percentile 2.97 seconds). This deliberately makes the first encounter reliable; it does not promise a captain every two minutes from arbitrary later positions or when remaining stationary. Full-map search and memorization remain part of the outer hunt. Raw discovery records are `test-results/stage2-v20-discovery.json`; reproduce with `node tests/stage-two-discovery.mjs`.

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
| Devourer | 5:23 | 2,550 | 1,465,307 | 5:17–5:29 | 3/3 |
| Titan | 6:20 | 3,510 | 1,589,850 | 6:01–6:37 | 3/3 |
| Sovereign | 6:45 | 4,658 | 1,652,403 | 6:34–6:58 | 3/3 |
| Calamity | 8:36 | 6,465 | 1,726,883 | 8:30–8:42 | 3/3 |
| Overlord | 8:35 | 6,234 | 1,745,558 | 8:25–8:44 | 3/3 |

The experienced-route controller averages 5:23–8:36 across kits, faster than the intended 10–12-minute human hunt. These runs know a fixed route through possible sites; they are not blind full-map searches. The smaller, reliable opening and compact collision footprints removed substantial navigation delay. Outer routes were retained rather than keeping the shorter compact draft. Captain HP, sustain, boons and scoring have not been changed in this update. Human testing is still needed to establish normal clear time; the 10–12-minute target is not claimed as achieved by this sample.

A ten-second synthetic Overlord scene near terrain, with fourfold CPU throttling, compared the actual deployed v19 modules/ridge against this build. Both had 87 enemies, eight servants and a 1,280 × 720 canvas. v19 measured 12.1 FPS / 3.00 ms average drawing; current measured 55.5 FPS / 3.16 ms drawing. The new landmark/ridge textures did not increase observed draw cost materially. Compact collision footprints and avoiding square roots in navigation checks reduce simulation work. This is one repeatable artificial fixture, not a promised frame rate on an old laptop; actual device performance remains unmeasured. Raw data: `test-results/stage2-v20-performance.json`; runner: `tests/stage-two-performance-browser.mjs`.

The hunt continues to reward objectives and speed. All five kits cleared; Titan retains impact rewards, and smaller Devourer body counts still earn a strong completion bonus. Healing oases remain available, though none of these final controller samples needed a visit. Native device testing remains necessary for frame-rate and memory claims.

## Validation and compatibility

- **140 unit tests passed**: compact terrain collision, walkable arch openings, region coverage, rotated edge culling, blind opening discovery, full-release starts, meaningful bounded Maw/Feast recovery, walk-only slam escapes, real boon effects, dangerous stationary captain pressure, healing cooldowns, every site/shrine's reachability, clear/build/speed rewards, profile transfers, legacy codes, combat-score clipping, farming bypasses, continued sustain, clear-time boundaries and signed score breakdowns.
- Ten fixed-seed Stage 1 simulations (all five champions × seeds 77/444) matched deployed commit `5aae6a7` exactly through ten minutes, including RNG, enemy/player state, score, sustain, servants, fields, projectiles and cooldowns. Stage 1 rules remain `2026.10-v15-autotarget-squad`.
- Desktop and touch landscape tests passed for exact-prop edge drawing on every edge (including rotation), partly visible captain warnings, four landmarks, all kits, art, seal contact, frozen choices, nine choices and automatic victory, signed results, test-title persistence and zero writes to the official profile.
- Public-origin/subdirectory tests passed for the explicit test entry and normal Gatebreaker/date locks. Phone → PC → phone transfer, personal bests, normal Stage 1, direct verifier and Pages subpaths passed.
- The update lifecycle test kept an active paused match/results intact and activated the new version on return to the menu, retaining identity and offline transfer controls.
- Production build, static Pages artifact validation and Git whitespace checks passed. Native low-end laptop or real phone performance has not been benchmarked in this change.

Stage 2 rules are `2026.10-v20-court-hunts`; playtests use `2026.10-v20-court-test`. Historical v16/v17/v18/v19 Court codes, older MM4 codes and MM1–MM3 remain readable. Existing save version 3 is unchanged. Raw v20 measurements (`test-results/stage2-v20-final.json`) and screenshots are in ignored `test-results/`; reproduce with `node tests/stage-two-balance.mjs` and the tests listed above.
