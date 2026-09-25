# Monster Mash balance report

## Devourer Feast sustain pass (rules `2026.10-v5-feast`)

Feast of the Unbound now heals 8–14 health per kill as Release advances, with a 25–65% maximum-health budget per activation. Every 20 kills during the eight-second Feast refresh a 1.5–2.5-second guard that reduces incoming damage by 40–60%. Only actual healing spends the budget. Guard requires kills and is brief; an empty cast grants no protection. Maw of Ruin, Lunge and Execution are unchanged.

Matched 60 Hz scripted runs, seeds 77, 123 and 444, compare the previous rules with the Feast pass. Devourer survived 552 → 617 seconds on average (9:12 → 10:17), with 24,201 → 29,162 average kills and 2,164,978 → 2,684,553 average Dominance. The three new runs ended naturally at 608, 637 and 606 seconds; the run that previously ended at 457 seconds now reaches Final Release. Devourer's guard absorbed 1,731–2,451 damage per run. All four other kits produced identical results before and after this pass. This scripted policy supports the sustain change, but human late-swarm play remains the important feel check.

## Earlier v3 balance pass

Measured with tests/balance.mjs, seeds 77, 123, 444, fixed 60Hz simulation and actual damage/death. No immortality or healing injection. The policy aims at nearby prey, pursues with melee, circles with ranged kits, uses ready abilities and saves Devour until below 80% health. This is repeatable active scripted play, not a human skill study. All fifteen final runs ended naturally before the 15-minute test cap.

## Before / after

| Kit | Before average survival | Final average | Final range | Average Body Count | Average Dominance |
|---|---:|---:|---:|---:|---:|
| Overlord | 1:29 | 9:09 | 8:50-9:31 | 23,296 | 1,982,437 |
| Calamity | 1:24 | 9:39 | 8:56-10:13 | 26,082 | 2,239,987 |
| Devourer | 7:00 | 9:31 | 8:06-10:59 | 21,084 | 1,746,330 |
| Titan | 3:24 | 11:15 | 10:55-11:45 | 34,636 | 2,936,595 |
| Sovereign | 6:06 | 9:08 | 8:40-9:29 | 23,729 | 2,004,406 |

Titan remains strongest for score in this policy, but every kit now has a renewable combat-earned survival loop. This is not competitive score parity. Separate kit leaderboards or further human tuning should precede a cross-kit competition.

## Sustain and failure modes

- Titan: ten kills in one attack/activation heal 30 and add 80 barrier, capped at 260, expiring after 8 seconds, once per 4 seconds. Shockwave, launch collisions and charge reward clearing a route. Existing armor and surrounded mitigation remain. Final runs healed 1,003-1,578 and absorbed 7,384-8,259. Late sustained contact exceeds the barrier refill rate. Empty casts cannot refresh it; cooldown and barrier caps prevent stockpiling.
- Devourer at this earlier pass: Devour feeds for up to 35% max HP per cast; Frenzy kills healed up to 25% max HP total per activation. Lunge handles escape/re-entry, execution prioritizes wounded elites. The Feast sustain pass above supersedes this Frenzy behavior.
- Calamity: 20 kills in one settled activation grant 320 ward, cap 480, 12-second expiry, at most once per 2.5 seconds. Beam sweeps, vortex grouping and meteor placement are the main replenishment tools. Final runs absorbed 12,089-16,264; there is no passive health recovery. Missed or poorly timed spells expose the small health pool; dense contact eventually overwhelms the ward budget.
- Overlord: controlled/summoned kills siphon 8 HP, with a 42 HP budget per one-second simulation window. Commands and summons must keep an army active; corruption itself grants no healing. Final runs healed 11,440-12,974. Late damage outpaces the capped servant economy; conversion gives no free kill, healing or score.
- Sovereign: Devour restores up to 40% max HP per cast, 9s cooldown, radius 155, plus the existing Feeding Rage. Rupture opens space, beam thins approaches and catastrophe creates an escape window. Final runs healed 8,184-9,721. Poor feeding timing or spacing and damage between casts end the run.

Known exploit pressure: indefinite kiting and optimal cooldown play need human testing; defensive gains are bounded and nobody is passively immortal. Body-count farms remain local prestige, not server-verified records. Forced retirement counts as a completed incarnation only after 60 seconds, and strong mastery titles also require large cumulative source-specific totals.

## Threat curve and sampled pressure

The opening changed from 65 enemies surrounding the player to 28 thralls 320-420 units away in a frontal arc. Normal spawns start 560+ units away. Spawn rates interpolate through 8/s, 12/s at 30s, 18/s at 60s, 28/s at 120s, 46/s at 300s, 68/s at 480s and 100/s at 720s, scaled by event phase. Ordinary density caps grow from 95 to 1,076; elite/Titan pool reserve remains 24.

Directions open from 1.5 radians to full encirclement at 300s. Hounds unlock at 45s, wings 60s, ranged spitters 90s, brutes 120s. Elite eligibility begins at 180s; Titan eligibility at 300s, with actual appearance on event-phase wave cadence (phase 1 first Titan at 450s). Far pursuit increases gradually; early offscreen stragglers retire without score rather than teleporting into an early surround. Damage escalation begins after wave 12.

Representative seed 77, ranges across the five kits:

| Time | Active enemies | Body Count | Health observation |
|---|---:|---:|---|
| 30s | 26-85 | 242-301 | All full or nearly full |
| 60s | 51-86 | 655-725 | All full or nearly full |
| 120s | 59-83 | 1,870-2,095 | Sustain actively offsets damage; Sovereign 835/1,000 |
| 300s | 104-396 | 7,122-8,707 | Devourer 725/850; other kits nearly full, defenses repeatedly used |
| 600s | Titan 205, Devourer 1,076 | 27,982 / 21,316 | Those two seed-77 runs remain alive; other three have ended |

The first five minutes now strongly favor the monster. The final escalation is intentionally steep; human testing should judge whether its transition feels fair rather than abrupt. Reproduce with node tests/balance.mjs final. Raw ignored JSON files are under test-results/balance-*.json.
