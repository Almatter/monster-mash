# Ashen Wilds Stage 2 playtest release

Tester entry: **https://almatter.github.io/monster-mash/stage2-test/**. Local preview: **http://127.0.0.1:4173/stage2-test/** (the previous localhost `?stage2-test=1` link also works).

The dedicated test entry bypasses Gatebreaker and the release date for all five champions. It visibly labels runs and codes as playtests. Test records, titles, palettes and personal bests use the separate `mm-stage2-test-mm-profile` storage key. It neither reads nor writes the official `mm-profile` progression; progress transfer is hidden there. Test titles can be earned and equipped for testing, but do not become official rewards. The normal landing page still requires Gatebreaker and October 8, 2026 at midnight Eastern; official earned access covers every champion. A test query on the normal public page provides no bypass.

## Hunt and exploration

Explore a fixed 6,400 × 4,800 desert canyon basin, with twenty-four overlapping ridge props forming staggered walls and connected routes. The map is rectangular, not the Stage 1 circular arena. Ten captain camps occupy a seeded selection of sixteen sites. Camps activate within 600 units and persist after discovery. Each has a captain, four guarded vanguards and sixteen lesser escorts. There is no minimap, captain pointer, trail marker or discovery announcement. Players find captains by exploring and learn the fixed pathways across runs. Navigation uses shared cached flow fields so enemies and servants can go around ridges without independent per-frame path searches.

Slay all ten captains to win. Each of the first nine kills pauses combat, cooldowns and the run clock until a boon is chosen. Every two choices evolve the kit; elapsed time does not grant Stage 2 unbindings. The final captain ends the mission. Clear time is the primary Stage 2 personal best; Dominance remains a secondary result.

## Captain danger and recovery

Captains begin with 48,000 HP and gain 22% of base HP per captain slain. Living captains preserve their remaining health fraction when they scale. Contact damage starts at 37.5 rather than 8, and gains 10% per tier, before the existing hunt/champion modifiers. A captain slam warns for 1.05 seconds, covers a 210-unit radius and deals 160 damage, gaining 9% per tier before champion protection. Its attack cycle is 3.8 seconds. Movement and stepping outside the warning matter; no stationary base champion survived the isolated idle-attack captain test for a minute.

The former captain-damage leech is removed. Normal kit healing provides 18% of its Stage 1 amount; shield generation provides 25%, with 35% of normal capacity. Existing defensive mechanics still have a purpose. Five healing oases automatically restore 45% maximum HP when approached below 80% health, then each goes on a separate 90-second cooldown. Captain boon selection restores 15% HP, or 30% for Second Heart, and gives 1.5 seconds of return protection. Seals award score only; they do not heal.

Finite guards absorb 60% frontal damage until broken; flanking bypasses absorption while wearing down guard. Impact and Lunge break guards immediately. Close captain attacks gain 25%. Titan launch/shockwave/trample damage against captains is multiplied by 18; Sovereign shockwave by 15. Flying-body collision damage has a ×4.5 captain multiplier with a 0.12-second repeat interval. Execute has a ×3.5 captain multiplier and a 5.5%-maximum-HP damage floor before positional/guard effects. Its ordinary below-half-health doubling still applies to the damage branch. Servant damage has a ×1.1 multiplier; Calamity's continuous ray deals 60% against captain armor and Sovereign's beam retains full damage. All kits can defeat all guards/captains; there is no immunity by damage type.

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

## Music, hit art and rewards

Stage 2 now has an original procedural desert pursuit theme: D Phrygian dominant, plucked strings, flute phrasing and frame-drum percussion. It uses the existing seven-source adaptive mixer and distinct intensity states. Browser checks found finite PCM, seven stable voices and 21.2 MB of retained sample buffers. Previously it reused the selected champion's music.

Surviving enemy hits now show a generated anime slash-impact asset rather than the yellow filled circle, in both stages. Generated desert healing shrine art identifies recovery points. The built-in imagegen tool produced the new masters [enemy-hit.png](art-source/stage2/enemy-hit.png) and [healing-shrine.png](art-source/stage2/healing-shrine.png), packed into [enemy-hit.webp](public/assets/vfx/enemy-hit.webp) and [court-shrine.webp](public/assets/arena/court-shrine.webp). Exact prompts and mode are recorded in [EFFECT_PROMPTS.json](art-source/stage2/EFFECT_PROMPTS.json); existing captain/vanguard/terrain prompts are in [PROMPTS.md](art-source/stage2/PROMPTS.md) and [TERRAIN_PROMPTS.md](art-source/stage2/TERRAIN_PROMPTS.md). All final assets live inside this project and preserve alpha transparency.

Five Stage 2 records recognize first captain, 20 guards, 10 impact breaks, a complete hunt, and a ≤12-minute hunt. Ten cosmetic titles recognize clear counts, captain totals, 40 guards in one hunt, eight close kills in a clear, ≤12/≤10-minute clears, and completed hunts with maximum Wayfarer/Rending Rhythm/Enduring Power. They appear in the title registry and can be equipped and shared. Failed or retired hunts do not earn clear/build/speed rewards. Test achievements stay in the isolated test profile.

## Reproducible automated sample

Three seeds per champion (77, 123, 444). Real incoming damage, no immortality, injected healing, teleporting, or forced kills. A controller explores a fixed route through possible camp sites without reading undiscovered captain coordinates, follows actual encountered enemies/seals, circles captains, leaves slam zones, and travels to available healing shrines when wounded. It chooses vitality when low, otherwise damage/recharge/travel. Human route knowledge and boon choices can change the results; this is a small diagnostic sample, not a promise of completion time or a human win rate.

All **15/15 final samples cleared**. These average times therefore measure survival **through victory**, rather than time until death. Choice deliberation pauses the combat clock and adds real session time.

| Champion | Average time to clear | Average body count | Average Dominance | Time range | Clears |
|---|---:|---:|---:|---:|---:|
| Devourer | 10:01 | 4,346 | 1,591,304 | 9:54–10:07 | 3/3 |
| Titan | 11:16 | 6,467 | 1,551,457 | 10:34–11:43 | 3/3 |
| Sovereign | 10:16 | 6,017 | 1,681,172 | 9:36–11:16 | 3/3 |
| Calamity | 10:57 | 6,750 | 1,544,500 | 10:21–11:30 | 3/3 |
| Overlord | 11:04 | 6,853 | 1,538,667 | 10:37–11:21 | 3/3 |

Paired with the v17 controller sample, all fifteen hunts retained the exact same body counts, remaining HP, travel distances, healing visits, chosen boons and hunt objective statistics. Displayed duration differs by at most one second because Stage 2 now rounds up. Combat and sustain are unchanged; only scoring and its presentation changed.

Maximum observed active enemies: 128. Roaming hordes and score totals are lower than in the earlier leech-based prototype. The hunt rewards reaching objectives and clear speed; Devourer's smaller body count does not make its fastest clear obsolete. Titan retains strong impact bonuses. Overlord can rely on its army; Devourer/Titan/Sovereign use shrines more often. Different builds and human strategies still need tester feedback.

## Validation and compatibility

- **130 unit tests passed**: real boon effects, dangerous stationary captain pressure, healing cooldowns, every site/shrine's reachability, clear/build/speed rewards, profile transfers, legacy codes, combat-score clipping, farming bypasses, continued sustain, clear-time boundaries and signed score breakdowns.
- Ten fixed-seed Stage 1 simulations (all five champions × seeds 77/444) matched deployed commit `5aae6a7` exactly through ten minutes, including RNG, enemy/player state, score, sustain, servants, fields, projectiles and cooldowns. Stage 1 rules remain `2026.10-v15-autotarget-squad`.
- Desktop and touch landscape tests passed for all kits, art, seal contact, frozen choices, nine choices and automatic victory, signed results, test-title persistence and zero writes to the official profile.
- Public-origin/subdirectory tests passed for the explicit test entry and normal Gatebreaker/date locks. Phone → PC → phone transfer, personal bests, normal Stage 1, direct verifier and Pages subpaths passed.
- The update lifecycle test kept an active paused match/results intact and activated the new version on return to the menu, retaining identity and offline transfer controls.
- Production build, static Pages artifact validation and Git whitespace checks passed. Native low-end laptop or real phone performance has not been benchmarked in this change.

Stage 2 rules are `2026.10-v18-court-hunts`; playtests use `2026.10-v18-court-test`. Historical v16/v17 Court codes, older MM4 codes and MM1–MM3 remain readable. Existing save version 3 is unchanged. Raw v18 measurements (`test-results/stage2-balance-v18.json`) and screenshots are in ignored `test-results/`; reproduce with `node tests/stage-two-balance.mjs` and the tests listed above.
