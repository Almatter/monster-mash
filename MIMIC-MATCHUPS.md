# Mimic matchup measurements

October 13, 2026. Measured ruleset v46, before the visible-mimic targeting change in v47. **These are automated combat-policy results, not human player win rates.** No balance changes were made.

4,480 seeded duels: seven champion bodies, five scenarios, two player policies, 64 runs per combination. Seeds vary starting angle/distance, casting order, mimic decision phase, and mixed loadouts. A win means the mimic died before the player; any duel unresolved at 60 seconds is counted separately and remains in the win-rate denominator. Each starts with full health, zero shields, initial Carnage, final-release Stage 3 stats, one mimic and the normal shared army cap. The transformation has completed. Titan/guardian combat and respawns are excluded; map collision, player powers, recovery, hit protection and mimic AI use the real game routines.

Scenarios: native powers with everything ready; native powers with the player’s fourth slot on cooldown for 20 seconds while the mimic starts fresh; two random borrowed powers; four random borrowed powers from four distinct other champions; native powers with eight nearby lesser mobs. Mixed scenarios retain the body/basic attack, derive traits from equipped powers, and give the mimic the identical kit. Each shrine offers one of its five valid powers; donor selection uses a seeded Fisher–Yates shuffle.

The pressure policy closes to basic-attack range and rotates available powers. The spacing policy also strafes, avoids visible spell fields/beam lanes and charging or Bloodmoon opponents, prioritizes Frenzy/servants/soul storm, and uses feeding defensively. Both make decisions approximately every 0.3–0.45 seconds and aim at the current target. Neither is an expert controller; human timing, fleeing, returning with cooldowns, ambient waves, low starting health, kit selection and device input can materially change outcomes. Random seeds alone do not make this a representative population sample.

## Spacing and defensive-power policy

| Champion | Native, ready | Ultimate delayed 20s | Two powers swapped | Four powers swapped | Native + lesser mobs |
|---|---:|---:|---:|---:|---:|
| Lycanthrope | 80% (51/64) | 50% (32/64) | 69% (44/64) | 41% (26/64) | 80% (51/64) |
| Overlord | 58% (37/64) | 9% (6/64) | 77% (49/64) | 69% (44/64) | 80% (51/64) |
| Calamity | 53% (34/64) | 53% (34/64) | 61% (39/64) | 66% (42/64) | 70% (45/64) |
| Devourer | 2% (1/64) | 0% (0/64) | 28% (18/64) | 50% (32/64) | 3% (2/64) |
| Titan | 97% (62/64) | 91% (58/64) | 59% (38/64) | 56% (36/64) | 91% (58/64) |
| Sovereign | 17% (11/64) | 17% (11/64) | 47% (30/64) | 67% (43/64) | 19% (12/64) |
| Reaper | 0% (0/64) | 0% (0/64) | 6% (4/64) | 38% (24/64) | 0% (0/64) |

## Direct pressure policy

| Champion | Native, ready | Ultimate delayed 20s | Two powers swapped | Four powers swapped | Native + lesser mobs |
|---|---:|---:|---:|---:|---:|
| Lycanthrope | 58% (37/64) | 2% (1/64) | 56% (36/64) | 31% (20/64) | 55% (35/64) |
| Overlord | 17% (11/64) | 11% (7/64) | 36% (23/64) | 31% (20/64) | 13% (8/64) |
| Calamity | 0% (0/64) | 0% (0/64) | 0% (0/64) | 2% (1/64) | 0% (0/64) |
| Devourer | 2% (1/64) | 0% (0/64) | 30% (19/64) | 47% (30/64) | 5% (3/64) |
| Titan | 88% (56/64) | 75% (48/64) | 61% (39/64) | 59% (38/64) | 86% (55/64) |
| Sovereign | 14% (9/64) | 14% (9/64) | 42% (27/64) | 58% (37/64) | 14% (9/64) |
| Reaper | 9% (6/64) | 31% (20/64) | 13% (8/64) | 23% (15/64) | 13% (8/64) |

## Interpretation

Across the spacing policy’s equally weighted champion groups, native-ready wins were 196/448 (43.8%), ultimate-delayed wins 141/448 (31.5%), two-swapped wins 222/448 (49.6%), and four-swapped wins 247/448 (55.1%). These aggregate rates conceal very large champion differences.

The current implementation does not deliver a uniform 45–50% simulated chance. Native Titan and Lycanthrope are much stronger under the spacing policy than native Devourer and Reaper. Calamity particularly benefits from moving out of fields; Overlord benefits from raising servants early and nearby targets to control. Borrowing powers usually improves the weaker native bodies but can weaken the strongest. These are scenario results, not proof that a champion has these win rates in players’ hands.

The mimic copies the kit and maximum health but not current cooldowns, so an unavailable player ultimate does not remove the mimic’s ultimate. Player hits are capped at 8% of mimic maximum health and 24% per two-second window; mimic hits can remove 25% of player maximum health and 40% per two-second window. Large-damage kits consequently have an advantage on the mimic side despite matching ordinary damage multipliers. Shared immunity windows and different healing/control mechanics make attack timing important. Full random relic kits can replace ultimates and sustain entirely; copying the same powers does not guarantee a symmetric duel.

A 45–50% human target needs encounter data that distinguishes death, victory and escape, records both starting health/cooldowns, equipped abilities, and whether other enemies or the Titan participated. The useful balancing target would be a reasonably prepared player with a viable kit; encounters with exhausted recovery and no ultimate should carry greater risk. Blanket resistance changes alone are unlikely to equalize all bodies and kits.

Run again with `node tools/mimic-matchups.mjs`. Optional environment variables: DUEL_SAMPLES, DUEL_KITS (comma separated), DUEL_OUTPUT. Raw seeded results are in test-results/mimic-matchups.json and test-results/mimic-matchups-prey.json.
