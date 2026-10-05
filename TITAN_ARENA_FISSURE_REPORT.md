# Titan Fissure in Stage 1: test and recommendation

Tested October 4, 2026 against Monster Mash commit `4b6d77b6b980ba9905c55dc5bac8273849aa2bed`. The initial study used an isolated simulation experiment. After approval, the same 32 probes were rerun against the production implementation for v29, with identical outcomes. The earned Stage 1 kit is now implemented; classic Throw and all existing progress remain available.

## Conclusion

The Stage 2 Fissure kit is viable in the Ritual Arena without importing Stage 2’s Final Release start, boons, captain damage multipliers, Colossus weakness, or score budget. Its average survival remains inside the intended 10–12-minute range. It is a modest defensive tradeoff, rather than a stronger scoring kit: the field spends Momentum and 35% of current barrier, and replaces one source of immediate radial knockback.

Across both policies, Fissure averages **11:19** survival versus **11:35** for Throw. That is about **16 seconds shorter (2.3%)**, with **4.3% fewer final kills** and **5.0% less final Dominance**. At exactly ten minutes, kills differ by less than 0.1% and Fissure’s score is 0.3% higher. Most of the final score gap appears late, when Fissure’s smaller remaining health/barrier leads to earlier deaths.

## Paired tests

Eight seeds (77, 123, 444, 2026, 9001, 31415, 27182, 8675309), two casting policies and both kits: **32 completed runs, 16 per kit**. All runs ended naturally before the 20-minute test limit; none were censored or immortal. The same active movement policy pursues nearby enemies and uses Breaker, Stampede and Heavenfall whenever available. These deterministic bot results are balance probes, not predictions of human averages. The two policies share seeds, so they are not 16 independent random maps.

| Casting policy | Kit | Average survival | Average kills | Average Dominance | Survival range |
|---|---|---:|---:|---:|---:|
| Frequent | Throw | 11:35 | 36,279 | 3,492,084 | 11:13–11:49 |
| Frequent | Fissure | 11:17 | 34,628 | 3,300,514 | 11:01–11:35 |
| Deliberate | Throw | 11:36 | 36,409 | 3,504,299 | 11:22–11:55 |
| Deliberate | Fissure | 11:22 | 34,960 | 3,343,439 | 11:05–11:34 |

Frequent casting uses each ability as soon as ready, with Fissure following ordinary movement. Deliberate casting waits for a worthwhile group or heavy foe; Fissure also waits for half Momentum and aligns movement with a useful direction. Throw likewise waits for a useful group or nearby heavy foe. This compares a direct substitution with play that responds to each ability’s role. No game balance values were tuned between the policies.

| Combined averages | Throw | Fissure |
|---|---:|---:|
| Survival | 11:35 | 11:19 |
| Kills | 36,344 | 34,794 |
| Dominance | 3,498,192 | 3,321,977 |
| Actual healing | 1,000 | 1,141 |
| Damage absorbed/reduced | 8,128 | 7,542 |

Both kits averaged four elite kills and one enemy Titan kill. Every simulated run exceeded Gatebreaker’s per-run time/kill requirements; the experiment recorded no official progress. Fissure retains Breaker/Heavenfall knockback, and its collision-kill totals still comfortably support Titan’s existing collision achievements.

## Equal elapsed time

Every run reached 10:00, allowing comparison before death duration changes the totals. Stage 1 still releases at 2:30, 5:00, 7:00 and 8:30.

| At 10:00 | Throw | Fissure |
|---|---:|---:|
| Kills | 28,002 | 27,976 |
| Dominance | 2,534,451 | 2,541,564 |
| Health remaining | 1,451 | 1,331 |
| Barrier remaining | 69 | 44 |

The Fissure kit heals slightly more across a whole run but absorbs less damage. That fits its resource cost and the lost Throw knockback, rather than indicating its attack damage fails in Stage 1. The most unfavorable paired survival difference was 49 seconds; the most favorable was four seconds longer. No Stage 1 buff is justified by these results alone.

## Recommendation

Unlock Fissure as a selectable Titan kit when the existing Stage 2 access gate opens for the account. That gate should include both Gatebreaker and the Stage 2 release date, matching Reaper access. Any champion that earns the account’s access can unlock it for Titan. Stage 1 should keep its ordinary timed unbinding, enemy difficulty, sustain and scoring; only the third ability changes.

Keeping classic Throw available avoids abruptly changing a player’s familiar controls and resource spending during the live event. Label the new choice by its ability, not as a stronger upgrade. The v29 implementation records a distinct Stage 1 Fissure rules/kit identity in exported runs and personal bests, preserve all historical runs, and continue counting Titan’s existing achievements and champion-specific qualifying days. The option remains behind the real Stage 2 title and opening-date gate.

## Reproduce and validate

`node tests/titan-arena-experiment.mjs` runs all 32 probes. `--validate-only` checks the production kits without rerunning the balance study. Optional environment variables: `TITAN_ARENA_SEEDS`, `TITAN_ARENA_POLICIES=frequent` or `deliberate`, and `TITAN_ARENA_REPORT`.

The harness uses the production Game constructor with its explicit Fissure kit argument. It verifies base-form starting power, real persistent damage/snare, torch/boundary collision, and exact classic-kit parity when Throw is retained. It keeps normal Stage 1 unbinding, threat escalation, spawning, score/feat evaluation, Momentum regeneration and capped sustain.

Current raw per-run values and milestone snapshots are in ignored `test-results/titan-arena-production-v29.json`. The harness never writes profiles or official progress.
