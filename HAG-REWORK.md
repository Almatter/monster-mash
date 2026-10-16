# Hag rework — October 16, 2026

Baseline: `7813e3d`. Hag mechanics source SHA-256: `e93161be37d56f8545d96f5df70af30f992f2b44ff1ba0c9c0cf2ee08c779052`.

## Implemented behavior

1. Normalize all Hag gameplay poses to face right before runtime mirroring; walking, glamour flight and true flight now share the same facing rule.
2. Briarflight leaves hex bombs every 100 world units over valid floor. Contact damage and skirmisher contact shoves miss; ranged attacks and area spells still hit. This dispatch covers ordinary mobs, guardians, War troops/champions and mimics. Flight ends at the last valid floor.
3. A bomb arms after 0.35 seconds. Creature contact or intercepted hostile projectiles detonate it. Its blast extends beyond the trigger footprint and surviving targets are thrown back with existing heavy-enemy resistance. War sentry bolts can also trigger hostile bombs.
4. Hag basic attacks and ability hits poison surviving enemies for four seconds, refreshing without stacking. Poison slows throughout its duration. Poison does not recursively renew itself. Every normal enemy slot can hold venom; lookup uses a WeakMap rather than repeatedly searching the whole poison list.
5. Hexes places two predictable rows of three. Desktop/touch placement previews use the actual bomb art and formation geometry; pressing the ability twice confirms the suggested placement.
6. Unmask emits expanding, evenly spaced rings up to 475 world units from Hag, replenishing detonated gaps. New traps keep at least 88 units between centers. The combined active field is capped at 48 bombs. A full field does not consume another Hexes cooldown.
7. Unmask consumes ward. For its active duration, the shared curse/explosion recovery budget heals health instead of ward (up to 6% maximum health per second before stage recovery modifiers). Afterward the true form persists until ward is rebuilt.
8. Ward grants are blocked while Unmask is active; its ward aura is suppressed.
9. Four genuinely generated true-form flight frames and matching material masks are packed into spare atlas cells; no larger atlas or extra runtime texture load is needed. See [art prompts](art-source/hag/unmasked-flight-generation.md).
10. Ignition damage is 125% of the full cloud-plus-venom damage allowance, including the poison tail. Gas ticks are bounded explicitly; late ignition combines the preceding damage with the full blast.
11. Untriggered bombs never expire while their footprint remains on screen. Their cleanup lifetime counts only offscreen time, allowing a prepared field to remain indefinitely.

## Validation

- All **430** automated tests passed, including 13 new focused Hag regression tests.
- Production build passed.
- Desktop and emulated touch browser checks passed: six-bomb placement preview and confirmation, generated flight animation, both facing directions, bomb trail, no page errors, and Hag remains absent from the public selection page before the gate.
- Visual inspection: `test-results/hag-facing-contact-sheet.png`, plus desktop/touch combat and formation screenshots.
- Actual phone hardware testing remains outstanding.

## Scenario reruns

Same five seeds (77,123,444,835,1217), normal health/cooldowns, 30 Hz, unchanged pilot policy. Stage 1 has a 900-second limit; other stages have a 1200-second limit. Hag was rerun in all four stages. All eight champions were rerun in Stage 4 because improved NPC Hag mechanics can change the whole war. There were 55 primary runs and 12 additional Hag runs at 60 Hz.

**These are automated pilot results, not human averages or population win rates.** Run length includes victories and time limits, so it is not necessarily time to death. The pilot still uses flight defensively and does not adopt a new field-preparation strategy or optimize captured War powers.

| Stage | Old mean run length | New mean run length | Old mean Dominance | New mean Dominance | Old clears | New clears | New deaths / timeouts |
|---|---:|---:|---:|---:|---:|---:|---:|
| 1 | 6:24 | 12:40 | 1,070,917 | 4,349,987 | — | — | 5 / 0 |
| 2 | 13:54 | 14:03 | 3,174,263 | 7,043,536 | 0/5 | 1/5 | 4 / 0 |
| 3 | 8:31 | 7:49 | 17,565,716 | 9,550,000 | 3/5 | 1/5 | 3 / 1 |
| 4 | 0:17 | 0:19 | 17 | 31 | 0/5 | 0/5 | 5 / 0 |

Stage 1 survival and score improve substantially. Stage 2 score more than doubles but completion remains below the former roster baseline of 35/35 clears and 11.23 million mean Dominance. **Stage 3 regresses in this sample**; a time-limited shrine run and the navigation sensitivity prevent calling it balanced. **Stage 4 remains seriously weak**: Hag still dies in every trial before establishing an effective field. Those remaining balance gaps are not fixed by successful mechanics tests.

## Higher-rate checks

Three seeds, 60 Hz, same policy.

| Stage | Mean run length | Mean Dominance | Clears | Deaths | Timeouts |
|---|---:|---:|---:|---:|---:|
| 1 | 13:28 | 4,953,427 | 0/3 | 3/3 | 0/3 |
| 2 | 15:16 | 7,764,233 | 2/3 | 1/3 | 0/3 |
| 3 | 11:09 | 13,083,333 | 1/3 | 1/3 | 1/3 |
| 4 | 0:20 | 53 | 0/3 | 3/3 | 0/3 |

These checks preserve the broad improvement in Stages 1–2 and the unresolved problems in Stages 3–4. Exact scores and paths are sensitive to timestep and small gameplay changes. A repeat of the final Stage 3 seed 77 reproduced its timeout and score.

## Current War roster screening

Native player kits, legal perk choices, normal NPC inheritance. Means can be strongly skewed by a single successful conquest; they are not PvP tier rankings.

| Champion | Mean run length | Mean Dominance | Clears | Deaths | Timeouts |
|---|---:|---:|---:|---:|---:|
| hag | 0:19 | 31 | 0/5 | 5/5 | 0/5 |
| lycanthrope | 3:29 | 58,479,218 | 3/5 | 2/5 | 0/5 |
| overlord | 4:39 | 14,007,344 | 0/5 | 4/5 | 1/5 |
| calamity | 0:11 | 0 | 0/5 | 5/5 | 0/5 |
| devourer | 0:22 | 0 | 0/5 | 5/5 | 0/5 |
| titan | 4:26 | 5,003,492 | 0/5 | 4/5 | 1/5 |
| sovereign | 7:00 | 19,404,554 | 1/5 | 3/5 | 1/5 |
| reaper | 4:36 | 2,005,185 | 0/5 | 4/5 | 1/5 |

## Hag seed records

| Stage | Seed | Run length | Outcome | Dominance |
|---|---:|---:|---|---:|
| 1 | 77 | 12:52 | death | 4,490,530 |
| 1 | 123 | 13:23 | death | 4,862,555 |
| 1 | 444 | 11:36 | death | 3,569,050 |
| 1 | 835 | 13:29 | death | 4,972,295 |
| 1 | 1217 | 12:02 | death | 3,855,505 |
| 2 | 77 | 13:24 | death | 6,434,000 |
| 2 | 123 | 13:00 | death | 6,571,255 |
| 2 | 444 | 15:55 | clear | 8,005,000 |
| 2 | 835 | 14:21 | death | 7,388,425 |
| 2 | 1217 | 13:32 | death | 6,819,000 |
| 3 | 77 | 20:00 | timeout | 6,350,000 |
| 3 | 123 | 2:52 | death | 4,250,000 |
| 3 | 444 | 2:54 | death | 4,250,000 |
| 3 | 835 | 7:07 | clear | 24,450,000 |
| 3 | 1217 | 6:13 | death | 8,450,000 |
| 4 | 77 | 0:20 | death | 0 |
| 4 | 123 | 0:15 | death | 155 |
| 4 | 444 | 0:21 | death | 0 |
| 4 | 835 | 0:20 | death | 0 |
| 4 | 1217 | 0:20 | death | 0 |

Reproduce: set `SCENARIO_LABEL=hag-rework`, then run `node tools/champion-scenarios.mjs <stage> 77,123,444,835,1217 hag`. For the full War roster omit the final `hag`. Set `SCENARIO_HZ=60` and use seeds `77,123,444` for higher-rate checks. Detailed JSON is retained locally at `test-results/hag-rework-comparison.json`.


## Placement, timer, and heavy-target follow-up

Miasma's Ignite button now shows remaining cloud seconds and a lifetime bar. Hexes preview the actual resolved bomb positions; Hexes, flight bombs, and Unmask search deterministically within 240 world units for the nearest sampled legal floor, with 88-unit bomb spacing and actor-width clearance from floor edges/solid bases. Existing bombs are preserved. A completely invalid Hexes cast costs no cooldown; flight reports blocked placement.

Hag's hex and ignition blasts no longer launch giant targets (including Hollow Kings, Colossus, realm Titan, Titan mimics/champions, and fixed War sentries). They stagger for 0.35 seconds at most once every 3 seconds; poison/slow continue. Existing projectiles and ground hazards persist during the stagger. Medium targets (brutes, elites, captains, guardians) resist launch until Unbound III, then receive 20% force, increasing to 35% at Final Release. Small targets retain full force. The realm Titan now respects its poison movement slow between attack actions.

Damage tracing at Unbound III with no bonuses: ignition is 875 base x 2.125 = 1,859.375 direct damage, with continuing poison afterward. A Stage 1 Hollow King spawned at 7:00 has 28,405 HP (6.55% direct damage); the Ashen Colossus has 180,000 HP (1.03%). An exposed realm Titan takes the same direct damage, subject to its defense-layer floor and existing recovery bonus. No missing ignition multiplier was found; no damage buff was applied in this follow-up.

Validation: full simulation suite plus targeted placement/heavy-target/damage regression checks; local desktop and touch browser tests passed, including previews, timer expiry/ignition, flight, and public Hag gating.
