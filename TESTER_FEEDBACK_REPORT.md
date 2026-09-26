# Tester feedback pass — rules `2026.10-v6-tester`

This report describes the current balance and polish pass. The three-seed scripted runs below use a fixed 60 Hz simulation and actual damage and death. The script actively moves, seeks prey, aims at the nearest enemy, and uses ready powers; it is repeatable balance evidence, not a substitute for human play on a phone. Results are in `test-results/balance-tester-final-v6.json` (generated locally; ignored by Git). Run `node tests/balance.mjs tester-final-v6` to reproduce them.

## Survival after adjustments

| Champion | Previous v5 average | Current v6 average | Current three runs | Current average Body Count |
|---|---:|---:|---:|---:|
| Overlord | 9:06 | **9:59** | 9:49, 10:14, 9:53 | 26,801 |
| Calamity | 10:12 | **10:34** | 10:37, 10:32, 10:33 | 30,839 |
| Devourer | 10:17 | **10:23** | 10:41, 10:15, 10:14 | 29,444 |
| Titan | 10:58 | **10:43** | 10:33, 10:50, 10:47 | 31,780 |
| Sovereign | 9:50 | **10:27** | 10:37, 10:08, 10:36 | 30,295 |

All fifteen runs ended from damage before the 15-minute cap. These are averages for each modified player character, not promised human survival times. The slightly shorter Titan result is intentional: Momentum now rewards moving through the horde, while stationary barrier farming is weaker. Boss durability also changed for every kit, so all five were retested on identical seeds (77, 123, 444). Scores from v5 and v6 must remain separate.

Killed-boss lifetime medians across those same runs were: Overlord elite 4.7s/Titan 16.1s; Calamity 8.5s/11.0s; Devourer 8.0s/10.0s; Titan 5.1s/15.9s; Sovereign 4.5s/6.6s. Each champion killed three Titans in the sample. The earliest and latest encounters vary with Release and the encounter mix, so these are observations rather than fixed boss timers. Devourer's Execution now focuses Titans and does eightfold Titan damage, avoiding a nearly minute-long outlier from the initial durability pass.

## Gameplay and presentation

- Music uses a 2.4× baseline gain at the music bus while retaining the saved Master and Music sliders, the existing compressor, SFX headroom, and intentional ducking. Browser audio checks measured bus gains of 0.60, 1.20, 1.80, and 2.40 at Music 25%, 50%, 75%, and 100%; the typical SFX bus was 0.65. Human loudness and device speaker checks are still needed.
- `SHOW PERFORMANCE` defaults off and remembers its setting. A small overlay reports smoothed FPS plus active enemy, ally, projectile, and effect counts using counters already maintained by the game.
- Sovereign Death Beam starts at 180 damage per 0.08s tick, 13-unit half-width, and 2.2s duration (was 110, 30, and 2.5s). Calamity Oblivion Ray starts at 220 damage per 0.08s tick, 11-unit half-width, and 2.4s duration (was 125, 30, and 3s). Both widen and last longer through Release; they retain different damage and geometry. They pierce without adding a new per-target search.
- Calamity's Starfall and Vortex alone enter placement mode. The next battlefield click/tap selects a point within 750 units, with a visible radius and thematic reticle. Cancel, Escape, or a ten-second timeout exits mode; invalid points do not spend cooldown. Other champions' powers remain direct activations. The placement uses the renderer's battlefield transform for mobile-sized viewports.
- Basic attacks now wait until a valid enemy is in range. Devourer's generated, transparent claw sprite marks the outer attack zone rather than covering its body, and its Unbound aura uses a separate illustrated sprite behind the champion. Both preserve a clear center for hit reactions. Ranged touch auto-attacks select a close, meaningful threat from the spatial grid, retain a useful target, and switch for an urgent near threat. Explicit mouse aiming still works on desktop. There is no full-enemy sort each frame.
- Devourer Lunge has one charge initially, two at Unbound II, and three at Final Release. Charges refill individually; rapid recasts extend and redirect the dash. Each cast dodges damage for the first 0.16s. The first deflected hit extends that cast's protection to at least 0.32s; later hits do not extend it further. The whole dash is not invulnerable. This creates a brief recover-and-reposition window without removing the kit's relentless identity. Feast's late-game healing/guard loop from v5 remains.
- Titan Momentum grows from actual travel at 1 per 480 units, capped at 1. Movement under 0.7 units in a frame earns nothing. Momentum holds for 1.25s after stopping, then fades over 3s. While moving, barrier regenerates at up to 8/s and stays active. Idle barrier drains at up to 30/s as Momentum fades. The ten-kill proc still heals 30, but now grants 40–80 barrier by Momentum, capped at 150 instead of the prior 260. Base armor is 0.9 and surrounded mitigation 15% (previously 0.72 and 25%); movement speed remains 165. A HUD meter exposes Momentum.
- Sovereign Feeding Rage now also cuts incoming damage 25% for its existing six-second window. This offsets extended boss pressure without adding passive permanent protection.
- Elites rise from 620 to 1,800 base HP; Titans from 6,500 to 10,000. They also scale with wave/time and Release (extra 18% per Release stage for elites, 30% for Titans), resist knockback (40%/15%), and remain vulnerable to champion powers. To avoid longer boss occupancy becoming unavoidable contact attrition, elite/Titan contact damage is 60%/40% of prior values and telegraphed slams are 55/110 instead of 70/150.
- Procedural repeated attacks now rotate through related seeded waveform variations with subtle pitch/playback-rate drift. Devourer's basic has twelve variants with a two-strike repeat exclusion, bounded pitch glide and volume/envelope variation; other basics have four. Slow noise modulation adds organic texture without changing each monster's sound identity.

## Overlord army: exact rules before and after

| Rule | Before v6 | Current v6 |
|---|---|---|
| Active cap | 16 + 4 per Release, from 16 to 32 | 24 + 1 per Release, from 24 to 28 |
| Object pool | 32 fixed servants | 32 fixed servants |
| Conversion | Command converts up to 12 eligible thralls, hounds, or wings in radius; deterministic, no chance roll | Same eligible types and Command limit; elites/Titans remain immune |
| Controlled lifetime | 12 seconds | 28 seconds |
| Summoned lifetime | 12 seconds | 18 seconds |
| At cap | New conversions failed; no replacement | New controlled conversion replaces the ally with least remaining life plus HP/100; summons still respect cap |
| Ally durability | No HP or hostile damage; expired only | 220 HP; nearby hostile contact deals 55% of that enemy's damage no more than once per 0.65s; allies can die or expire |
| Ally offense | 95-damage area attack, radius 65, every 0.7s; speed 180; search every 0.25s | Same offense and speed; target search favors nearby Titans and elites |
| Safeguards | Fixed 32 pool and 16-per-update corruption chain cap; servant kills siphon 8 HP with a 42 HP/s budget | Same pool and chain cap; servant kills siphon 11 HP with a 52 HP/s budget; spatial queries and 0.25s search retained |

The old 12-second lifetime and early cap made an army hard to accumulate visibly despite frequent Commands; at cap, conversion simply failed. The new `CONTROLLED n · HORDE total / cap` HUD shows both converted allies and occupancy of the shared controlled/summoned cap. A 28-ally swarm was included in desktop and mobile-sized performance checks. Servant conversion still grants no kill, score, or healing by itself.

## Run code and competitive limits

New runs use `MM4.` plus URL-safe Base64 of a random 12-byte nonce and AES-GCM ciphertext of compact canonical run data. Web Crypto authenticates the payload and version; the verifier rejects tampering, truncation, and random codes, then applies existing shape and plausibility checks. Scores and names are no longer exposed by casual Base64 decoding. Supported MM1/MM2/MM3 codes remain readable as historical versions. **Client-side deterrence only. Not authoritative anti-cheat.** The key material and verifier ship with the static site; someone who studies or changes the client can still forge a run. The new ruleset `2026.10-v6-tester` distinguishes this gameplay balance from v5.

## Verification and remaining tester checks

Production build, Pages build check, unit regressions, all-five champion browser smoke, Calamity desktop/touch targeting, visual Devourer readability, run-code tamper checks, audio bus checks, and desktop/mobile-sized heavy-swarm performance were run for this pass. The heavy browser simulation/render check used 714 enemies, and Overlord added 28 allies. Desktop p95 frame work was 5.4ms (Sovereign) and 3.0ms (Overlord); mobile-sized emulation was 5.0ms and 2.8ms respectively, under a 16.7ms 60 FPS budget. These are headless desktop-browser measurements at phone dimensions, not physical phone GPU or thermal results. Players should use `SHOW PERFORMANCE` on their devices during late Sovereign swarms and Overlord armies. Testers should also judge 25–100% music loudness against combat SFX on actual speakers/headphones, Calamity placement under touch, beam feel, boss prominence, and whether chained Lunge's short dodge windows are readable and satisfying.
