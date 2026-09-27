# Devourer wider waves and shared Feast recovery — 2026-09-26

Rules: `2026.10-v12-feast-waves`. This supersedes the gameplay values and remote-healing exclusion in the historical v11 `DEVOURER_CLAW_WAVE_REPORT.md`.

## Final change

Claw-wave full width increases by 50 units at each unlocked stage: Unbound II 230 → 280 (+21.7%), III 270 → 320 (+18.5%), Final Release 310 → 360 (+16.1%). Travel remains 560 / 620 / 680 units at 720 units/sec, with the existing damage, piercing and twelve-wave limit. The generated art scales with the damage corridor and remains visible in Low FX.

All kills during Feast, including distant wave kills, now contribute to the same existing healing pool. They heal 8–14 per kill, subject to missing health and the existing 25–65% maximum-health cap per cast. Wave kills cannot refill or create another pool. Kills at full health do not spend it. Feast Guard still requires twenty kills, with unchanged duration and reduction; Predatory Momentum retains its existing ceilings. Waves landing after Feast expires give no Feast recovery.

Normal circular claws still damage nearby enemies in every direction. Wave emissions still require a real melee engagement, Unbound II or later and active Feast; facing determines travel. The extended target-acquisition experiment was discarded. Ability and kit descriptions now explain the shared capped recovery.

## Matched balance comparison

Twelve predetermined seeds: 77, 123, 444, 17, 53, 101, 222, 555, 987, 2026, 314, 909. Same active-play policy, fixed 1/60-second updates and fifteen-minute cutoff. All 36 reported runs ended naturally; no health resets or invulnerability. Baseline is the shipped v11 geometry and remote-healing exclusion, rerun on the same seeds. Calamity's combat is unchanged.

The original three-seed sample gave unfavorable results for several width/range settings, including this final geometry. Repeating only that small sample was too sensitive to deterministic changes in target choice, movement and recovery timing. The expanded comparison supports a modest overall improvement, not a guarantee that every seed improves or a prediction of human scores.

| Champion/version | Average survival | Average Body Count | Average Dominance |
| --- | ---: | ---: | ---: |
| Devourer v11 | 11:09 | 30,708 | 2,893,719 |
| Devourer v12 | 11:12 | 31,036 | 2,930,316 |
| Calamity, unchanged | 10:46 | 31,361 | 2,889,713 |

Devourer gains about 327 kills (+1.1%) and 36,598 Dominance (+1.3%), with survival up 3.25 seconds. The Body Count gap to Calamity narrows from 2.1% to 1.0%; Devourer's Dominance is now 1.4% higher. This is near parity in final totals, not an established Body Count tie.

At an equal ten minutes, Devourer changes from 25,182 to 25,207 kills and from 2,274,557 to 2,278,541 Dominance. Pooled killing rate changes from 2,755 to 2,771 per minute. Calamity averages 27,450 kills at ten minutes and 2,912 per minute. Devourer's longer survival contributes to the close final totals; his clearing rate still trails Calamity. No other champion combat parameters change.

| Seed | Old survival | New survival | Old kills | New kills | New Dominance | Calamity kills |
| --- | --- | --- | ---: | ---: | ---: | ---: |
| 77 | 11:49 | 11:20 | 34,384 | 31,595 | 2,947,355 | 32,934 |
| 123 | 11:42 | 11:21 | 33,666 | 32,039 | 3,034,195 | 35,543 |
| 444 | 11:12 | 11:05 | 30,503 | 30,411 | 2,887,005 | 32,614 |
| 17 | 10:39 | 11:20 | 28,641 | 31,734 | 3,012,905 | 29,224 |
| 53 | 10:46 | 11:07 | 28,612 | 30,176 | 2,845,270 | 27,873 |
| 101 | 10:41 | 11:47 | 28,311 | 33,228 | 3,168,710 | 33,100 |
| 222 | 10:47 | 11:09 | 28,792 | 31,202 | 2,958,900 | 34,194 |
| 555 | 11:17 | 10:47 | 31,849 | 29,774 | 2,766,525 | 31,013 |
| 987 | 11:18 | 10:47 | 31,981 | 29,802 | 2,794,705 | 30,958 |
| 2026 | 11:07 | 11:21 | 30,255 | 31,650 | 3,040,020 | 27,557 |
| 314 | 11:18 | 11:04 | 31,024 | 29,955 | 2,838,540 | 30,786 |
| 909 | 11:09 | 11:16 | 30,483 | 30,862 | 2,869,665 | 30,536 |

Reproduce with `BALANCE_SEEDS=77,123,444,17,53,101,222,555,987,2026,314,909` and `node tests/balance.mjs wide-feast-expanded devourer calamity`. The optional environment variable changes only the seed list; default seeds and play policy remain unchanged, and averages divide by the actual number of runs.

## Validation

70 unit tests pass. New regressions verify full circular melee cleave alongside waves, shared recovery across melee/ranged/ability kills, exhaustion and reset of the existing pool, and no feeding after Feast expires. The existing piercing, once-per-enemy credit, guard, swept collision, facing, expiry and boundedness checks pass. v6–v12 MM4 codes remain readable after advancing the active ruleset; bests remain scoped by rules.

Desktop and touch checks activate the real Feast button and verify the stage gate, thirty ranged kills, shared healing, guard, generated art, Low FX and expiry. Five-champion Pages subpath gameplay/result/verifier checks pass. The production package contains 173 files. Visual inspection confirms the widened generated waves layer with the champion and aura.

A separate 714-enemy performance fixture reaches ten simultaneous waves. On this host, p95 simulation plus rendering is 4.7ms desktop and 4.1ms landscape, below 16.7ms. Protected health is used only in isolated mechanics/performance fixtures, never in the survival comparison.
