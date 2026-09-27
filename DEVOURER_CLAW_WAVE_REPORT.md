# Devourer's Unbound Feast claw waves — 2026-09-26

Devourer now gains piercing ranged slashing shockwaves during Feast of the Unbound starting at Unbound II (five minutes). A wave launches alongside each actual claw attack against prey in normal claw reach. This extends a melee engagement through more ranks; it does not turn empty-space attacks into unlimited ranged fire or change normal target acquisition.

## Behavior

- Before Unbound II, or outside Feast, claws behave as before.
- Waves travel in the champion's facing direction at 720 units/sec. They pierce enemies, damaging each enemy serial at most once per wave. Swept collision checks the entire travelled segment to avoid skipping targets between frames.
- Unbound II / III / Final Release wave travel is 560 / 620 / 680 units; half-width is 115 / 135 / 155. Each wave deals the current claw damage with the existing Release, Rage, Momentum and Feast multipliers, frozen at launch. No additional damage multiplier or knockback is added.
- Wave kills earn ordinary Body Count, Carnage, Dominance, kill streaks and multikill/feat credit. Multikills settle once as the wave expires. The source is recorded separately as `clawwave`.
- Distant wave kills do not heal or spend the Feast healing budget. Wave kills within ordinary claw reach retain feeding recovery. All Feast kills still advance the existing twenty-kill guard counter; guard strength, duration and healing caps are unchanged. This preserves the original defensive rhythm while adding reach.
- Already launched waves can finish after Feast ends, but no new ones launch. Each lives less than one second; at most twelve are active. Their hit-serial sets expire with the wave. A new run starts with no waves.

The kit and Feast descriptions explain the unlock and healing distinction. The health readout shows `CLAW WAVES` during the active unlocked state. Existing varied claw/death audio is retained without adding another repeated sound layer.

Rules advance to `2026.10-v11-claw-waves`. Earlier v6–v10 MM4 codes and cosmetics remain supported, while personal bests compare within the new ruleset.

## Generated attack artwork

Built-in imagegen produced three bone-white spectral cutting fronts with crimson-black inked speed trails, matching Devourer's anime isekai artwork. Source: [devourer-claw-wave.png](art-source/vfx/devourer-claw-wave.png). Runtime: [devourer-claw-wave.webp](public/assets/vfx/devourer-claw-wave.webp), 512 square with alpha. Repack with `node tools/pack-devourer-claw-wave.mjs`. The exact final prompt is the `devourer-claw-wave` section of [CHAMPION_AURA_PROMPTS.md](art-source/vfx/CHAMPION_AURA_PROMPTS.md).

The leading edges rotate with travel, with trails behind them. Projectile art remains visible in Low FX because it represents damage; it layers with the generated claw, Feast/guard and Unbound assets.

## Body Count, Dominance and survival

Same unchanged active-play policy and seeds 77/123/444. Before: v10 / `balance-sovereign-aegis-after.json`. After: `balance-claw-wave-after.json`. The benchmark now also records kill sources and peak active wave count; those fields do not change inputs or combat. All fifteen runs ended naturally before the fifteen-minute cutoff. No invulnerability or health resets are used in the survival benchmark.

| Devourer metric | Before | After | Change |
| --- | ---: | ---: | ---: |
| Average Body Count | 31,737 | 32,851 | +3.5% |
| Average Dominance | 3,028,765 | 3,161,505 | +4.4% |
| Average survival | 11:42 | 11:34 | -8 seconds |
| Kills per minute, pooled runs | 2,713 | 2,839 | +4.7% |
| Average kills at ten minutes | 24,159 | 25,210 | +4.4% |
| Average Dominance at ten minutes | 2,155,117 | 2,284,712 | +6.0% |

The ten-minute comparison confirms improved clearing at equal elapsed time. Average survival has not increased. These are three-seed automated comparisons, not human performance predictions.

| Seed | Survival | Body Count | Dominance | Wave kills | Peak active waves |
| --- | --- | ---: | ---: | ---: | ---: |
| 77 | 11:49 | 34,384 | 3,286,955 | 9,351 | 10 |
| 123 | 11:42 | 33,666 | 3,291,940 | 9,732 | 9 |
| 444 | 11:12 | 30,503 | 2,905,620 | 8,996 | 7 |

Wave kills include enemies that would previously have died to other attacks; their roughly 9,360 average is not an additional 9,360 kills. The net gain is about 1,114 per run.

Other champions reproduce their previous seeded results exactly:

| Champion | Average survival | Average Body Count | Average Dominance |
| --- | --- | ---: | ---: |
| Sovereign | 11:32 | 36,282 | 3,506,623 |
| Titan | 11:23 | 35,298 | 3,376,947 |
| Overlord | 11:25 | 34,283 | 3,324,587 |
| Calamity | 11:13 | 33,697 | 3,172,725 |

Devourer remains lower in Body Count than the other kits, but his average Dominance is now within about 0.4% of Calamity. This is a measured clearing improvement rather than a claim of complete scoring parity.

## Validation

68 unit tests pass. Added checks cover stage/state/character gates, actual distant kill credit, remote healing exclusion, close feeding, existing guard credit, per-serial piercing, one-time settlement, swept collision, facing direction, corridor boundaries, expiry, active-wave limits and new-run isolation. Historical v11 codes remain readable after a future rules change.

Desktop and landscape touch checks activate the real Feast button, verify the Unbound II gate and thirty ranged kills without healing, inspect generated wave art and the HUD, and confirm Low FX and expiry. Five-champion Pages gameplay/result/verifier, movement/outcome and existing Feast Guard browser checks pass. The production package contains 173 files.

A separate performance-only fixture uses 714 high-health enemies and real Feast simulation/rendering, with ten simultaneous waves. On this host, p95 simulation plus drawing measured 6.4ms desktop and 3.8ms landscape, within the existing 16.7ms budget. Its invulnerability and high enemy health isolate workload; it is not a survival measurement.
