# Ashen Wilds Stage 2 playtest release — v21 baseline

The current v22 terrain, edge-movement and performance changes, with updated champion measurements, are documented in [STAGE2_TERRAIN_REPORT.md](STAGE2_TERRAIN_REPORT.md). This report preserves the preceding v21 baseline.

Tester entry: **https://almatter.github.io/monster-mash/stage2-test/**. Local preview: **http://127.0.0.1:4173/stage2-test/** (the previous localhost `?stage2-test=1` link also works).

The dedicated test entry bypasses Gatebreaker and the release date for all five champions. It visibly labels runs and codes as playtests. Test records, titles, palettes and personal bests use the separate `mm-stage2-test-mm-profile` storage key. It neither reads nor writes the official `mm-profile` progression; progress transfer is hidden there. Test titles can be earned and equipped for testing, but do not become official rewards. The normal landing page still requires Gatebreaker and October 8, 2026 at midnight Eastern; official earned access covers every champion. A test query on the normal public page provides no bypass.

## Hunt and exploration

Explore a fixed 19,200 × 14,400 desert basin. Eight elaborate crescent/forked basalt formations and six smaller broken clusters replace the straight rows. Transparent hollows and valleys remain walkable; collision follows the stone bands rather than an enclosing image rectangle. Four fixed named landmarks identify the outer routes: Swordfall, Rib Gate, Sun Spire and Broken Bell. Ten captains occupy ten separate regions, each with two seeded alternatives. Four early regions cover central approaches; six outer regions require exploration.

Camps activate within 1,000 units, beyond the bounded camera plus captain orbit/art extents. The former 600-unit activation could spawn a captain on visible ground. Captains and vanguards persist after leaving the view; rotating prop silhouettes and captain warning radii remain included in culling. Court art preloads when the stage is selected. Cached images are never unloaded at the screen edge. Each camp retains one captain, four vanguards and sixteen lesser escorts.

All landscape displays show the same 1,200 × 760 world rectangle, including ultrawide monitors and phones. Portrait rotates it to 760 × 1,200; its area is identical. Extra display space is masked rather than exposing more terrain. World/screen targeting transforms retain their center and scale. This camera correction applies to both stages; Stage 1 combat and progression remain unchanged.

No captain minimap or early trail is shown. At 12:00 game time an eight-second ember bearing appears every thirty seconds toward the closest surviving captain, steering around obstacles. At 15:00 it becomes a continuous five-mark trail, refreshed every quarter second. Slain targets are removed and guidance retargets. Boon choices pause this clock. The existing speed reward still peaks before 10:00, decays afterward and reaches zero at 15:00; clues cannot recover that maximum bonus.

Navigation retains the 713-node shared grid and adds at most 24 local connections through sculpted hollows, with at most twelve cached flow fields. Route entry selects a visible node, preventing a nearby node across a wall from trapping movement. Broad collision checks reject distant rock bands before detailed work. New crescent/fork images each pack to 1,024 × 960 (7.50 MiB combined decoded RGBA); the 256 × 144 ember trace adds 0.14 MiB. Pools and cached audio remain bounded.

The built-in imagegen tool produced [rock-crescent.png](art-source/stage2/rock-crescent.png), [rock-fork.png](art-source/stage2/rock-fork.png) and [ash-trace.png](art-source/stage2/ash-trace.png). Exact prompts and mode are in [STRUCTURE_PROMPTS.json](art-source/stage2/STRUCTURE_PROMPTS.json). Runtime outputs are [court-crescent.webp](public/assets/arena/court-crescent.webp), [court-fork.webp](public/assets/arena/court-fork.webp) and [court-ash-trace.webp](public/assets/vfx/court-ash-trace.webp); reproduce with `node tools/pack-stage2-terrain.mjs`. Existing ridge/landmark masters and prompts remain in `art-source/stage2/`.

The blind-opening sample covers 720 simulated routes: all five kits × three seeds × sixteen headings × straight/curved/wandering movement. Routes know no captain positions, use no abilities or immunity, and count discovery only when a spawned captain fits the bounded landscape camera. Every opening found a fully visible captain within 4.10 seconds (mean 1.71 seconds, 95th percentile 2.70 seconds). This tests opening reliability, not arbitrary later searches. Raw records: `test-results/stage2-v21-discovery.json`; runner: `tests/stage-two-discovery.mjs`.

Slay all ten captains to win. Each of the first nine kills pauses combat, cooldowns and the run clock until a boon is chosen. Every champion starts at Final Release, including three charged Devourer Lunges before the first frame. Boons improve the fully released kit further; neither choices nor elapsed time unlock its starting abilities. The final captain ends the mission. Clear time is the primary Stage 2 personal best; Dominance remains a secondary result.

## Captain danger and recovery

Captains begin with 32,000 HP and gain 40% of base HP per captain slain. Living captains preserve their remaining health fraction when they scale. Contact damage starts at 24 rather than the v18 prototype's 37.5, and gains 7% per tier, before the existing hunt/champion modifiers. A captain slam warns for 1.4 seconds, covers a 170-unit radius and deals 115 damage, gaining 7% per tier before champion protection. Its attack cycle is 4.6 seconds. Movement and stepping outside the warning matter; no stationary fully released champion survived the isolated idle-attack captain test for a minute.

Generic captain-damage leech remains absent. Kit healing retains 40% of its Stage 1 amount, or 75% for Devourer; shield generation retains 40%, with 55% of normal capacity. Stage 2 Maw of Ruin drains a captain it actually damages: 10% of health damage, with an 18%-maximum-health raw minimum while its cast budget remains. This retains at least 13.5% maximum-health recovery on an otherwise isolated captain hit, up to 26.25% across captain drain and kill recovery combined. The shared raw cast limit remains 35%; empty casts cannot heal. Feast keeps its existing 65% raw healing limit at Final Release, yielding up to 48.75% maximum health with the hunt modifier. Basic attacks and Execute do not gain captain leech. Stage 2 Feast now emits its normal claw attacks and movement-directed ranged waves continuously while active, even without a melee target. Cadence, nearby circular damage, bounded wave count and the shared healing limit stay intact. Nonlethal ranged hits grant no extra healing. Stage 1 Feast is unchanged. Existing defensive mechanics still have a purpose. Five healing oases automatically restore 45% maximum HP when approached below 80% health, then each goes on a separate 90-second cooldown. Captain boon selection restores 15% HP, or 30% for Second Heart, and gives 1.5 seconds of return protection. Seals award score only; they do not heal.

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

Stage 2 now has an original procedural desert pursuit theme: D Phrygian dominant, plucked strings, flute phrasing and frame-drum percussion. It uses the existing seven-source adaptive mixer and distinct intensity states. Browser checks found finite PCM, seven stable voices and 21.2 MB of retained sample buffers. Boon selection has its own slower, suspended-minor sanctuary score with soft bells and pads. It loops in one cached mono buffer (12.63 seconds, 1.06 MiB) while combat, health and cooldowns remain frozen. The desert pursuit resumes after selection using the existing seven buffers. A pending battle render cannot restart over the choice score. Manual pause and background suspension still stop audio.

Surviving enemy hits now show a generated anime slash-impact asset rather than the yellow filled circle, in both stages. Generated desert healing shrine art identifies recovery points. The built-in imagegen tool produced the new masters [enemy-hit.png](art-source/stage2/enemy-hit.png) and [healing-shrine.png](art-source/stage2/healing-shrine.png), packed into [enemy-hit.webp](public/assets/vfx/enemy-hit.webp) and [court-shrine.webp](public/assets/arena/court-shrine.webp). Exact prompts and mode are recorded in [EFFECT_PROMPTS.json](art-source/stage2/EFFECT_PROMPTS.json); existing captain/vanguard/terrain prompts are in [PROMPTS.md](art-source/stage2/PROMPTS.md) and [TERRAIN_PROMPTS.md](art-source/stage2/TERRAIN_PROMPTS.md). All final assets live inside this project and preserve alpha transparency.

Five Stage 2 records recognize first captain, 20 guards, 10 impact breaks, a complete hunt, and a ≤12-minute hunt. Ten cosmetic titles recognize clear counts, captain totals, 40 guards in one hunt, eight close kills in a clear, ≤12/≤10-minute clears, and completed hunts with maximum Wayfarer/Rending Rhythm/Enduring Power. They appear in the title registry and can be equipped and shared. Failed or retired hunts do not earn clear/build/speed rewards. Test achievements stay in the isolated test profile.

## Reproducible automated sample

Three seeds per champion (77, 123, 444). Real incoming damage, no immortality, injected healing, teleporting, or forced kills. A controller explores a fixed route through possible camp sites without reading undiscovered captain coordinates, follows actual encountered enemies/seals, circles captains, leaves slam zones, and travels to available healing shrines when wounded. It chooses vitality when low, otherwise damage/recharge/travel. Human route knowledge and boon choices can change the results; this is a small diagnostic sample, not a promise of completion time or a human win rate.

All **15/15 final samples cleared**. These average times therefore measure survival **through victory**, rather than time until death. Choice deliberation pauses the combat clock and adds real session time.

| Champion | Average time to clear | Average body count | Average Dominance | Time range | Clears |
|---|---:|---:|---:|---:|---:|
| Devourer | 4:37 | 2,303 | 1,435,799 | 4:32–4:41 | 3/3 |
| Titan | 5:08 | 2,990 | 1,512,485 | 5:00–5:17 | 3/3 |
| Sovereign | 5:42 | 4,006 | 1,583,732 | 5:36–5:50 | 3/3 |
| Calamity | 7:07 | 5,442 | 1,680,758 | 7:03–7:11 | 3/3 |
| Overlord | 7:25 | 5,395 | 1,665,539 | 7:16–7:42 | 3/3 |

The experienced-route controller averages 4:37–7:25 across kits. These are survival-through-victory times with practiced route knowledge, not average human survival or blind search times. Direct paths through open ground and reliable navigation removed detours; Stage 2 Feast also attacks continuously. The 10–12-minute human target is still unverified and is not claimed as achieved. Captain HP, damage, sustain caps, boons and scoring have not changed in this update. All fifteen full runs cleared; none needed an oasis.

A separate late-search fixture starts at 13:00 with seven camps marked slain, a fixed seven-boon build, normal full starting health, and the three farthest surviving camps from a basin position. It follows only visible captain encounters and actual ember clues, never hidden camp coordinates, and takes real incoming damage. All fifteen samples defeated the last three captains by 14:53–16:24 total match time. This is a diagnostic initialized scenario, not a naturally played full run or a guarantee from every position/build. Raw records: `test-results/stage2-v21-guided-final-three.json`; runner: `tests/stage-two-guided-search.mjs`.

A synthetic Overlord performance fixture compares deployed v20 against this build with fourfold CPU throttling and a 1,280 × 720 canvas. Both start from the same RNG, serials, one camp and sixty additional enemies. After conversion/settling, both retained 57 enemies; v20 had eight servants and v21 seven. v20 measured 64.8 FPS / 2.87 ms mean drawing; v21 measured 66.0 FPS / 2.94 ms drawing. No frame-rate regression was observed in this scene near a landmark, but it does not establish costs beside every large formation or native phone/old-laptop performance. New images and the one-buffer choice score remain bounded. Runner: `tests/stage-two-performance-browser.mjs`; raw data: `test-results/stage2-v21-performance.json`.

## Validation and compatibility

- **149 unit tests passed**: bounded camera area, captain preactivation/persistence, continuous movement-directed Feast and healing limits, late clues/retargeting/paused clocks, walkable rotated basins, bounded choice score, compact terrain collision, walkable arch openings, region coverage, rotated edge culling, blind opening discovery, full-release starts, meaningful bounded Maw/Feast recovery, walk-only slam escapes, real boon effects, dangerous stationary captain pressure, healing cooldowns, every site/shrine's reachability, clear/build/speed rewards, profile transfers, legacy codes, combat-score clipping, farming bypasses, continued sustain, clear-time boundaries and signed score breakdowns.
- Ten fixed-seed Stage 1 simulations (all five champions × seeds 77/444) matched deployed commit `5aae6a7` exactly through ten minutes, including RNG, enemy/player state, score, sustain, servants, fields, projectiles and cooldowns. Stage 1 rules remain `2026.10-v15-autotarget-squad`.
- Actual browser camera/lifecycle tests passed at 1,440 × 900, 3,440 × 1,440, 842 × 390 and 390 × 842. Captains activated at distance 990 before any visible drawing (730 landscape/510 portrait), survived distant travel, and unused screen pixels remained masked. Pointer transforms roundtripped. Browser draw interception confirmed at least two real painted ember marks in every tested view, and the desktop trail screenshot was visually inspected. Two consecutive boon choices used the same buffer with no battle voices playing, frozen clock/health/cooldowns, seven-source pursuit resumption and normal manual-pause suspension.
- Desktop and touch landscape tests passed for exact-prop edge drawing on every edge (including rotation), partly visible captain warnings, four landmarks, all kits, art, seal contact, frozen choices, nine choices and automatic victory, signed results, test-title persistence and zero writes to the official profile.
- Public-origin/subdirectory tests passed for the explicit test entry and normal Gatebreaker/date locks. Phone → PC → phone transfer, personal bests, normal Stage 1, direct verifier and Pages subpaths passed.
- The update lifecycle test kept an active paused match/results intact and activated the new version on return to the menu, retaining identity and offline transfer controls.
- Production build, static Pages artifact validation and Git whitespace checks passed. Native low-end laptop or real phone performance has not been benchmarked in this change.

Stage 2 rules are `2026.10-v21-court-hunts`; playtests use `2026.10-v21-court-test`. Historical v16/v17/v18/v19/v20 Court codes, older MM4 codes and MM1–MM3 remain readable. Existing save version 3 is unchanged. Raw v21 measurements (`test-results/stage2-v21-final.json`) and screenshots are in ignored `test-results/`; reproduce with `node tests/stage-two-balance.mjs` and the tests listed above.
