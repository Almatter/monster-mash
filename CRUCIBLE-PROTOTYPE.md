# Horde’s Judgment: isolated arena prototype

Open `test/crucible.html?seed=17`. This standalone page does not import the live Stage 4 engine, read/write profiles, award scores, change release gates, or replace the published Stage 4 map. The build change only adds version stamping for its new page. No new art is required: the prototype reuses generated champion selection cutouts, infantry/arbalists, guardian art, crystal shrines and spell textures. Pose bobbing and signature powers are simplified; this is not a champion balance or full native-kit test.

## Battlefield and play

The nominal arena is 2400 × 1400 world units with eight seeded camp positions around an open center. Ground projection adapts to the screen aspect ratio, with upright/proportionate models and screen-sized labels, so all camps remain visible on desktop and phone landscape. There are no timed pickups, racing objectives or concealed offscreen fronts. The floor is an intentional layout blockout.

Eight AI champions begin with 16 followers each. Reinforcements replenish armies every 3.5 seconds to the selected equal cap (12, 20 or 28 per army). The renderer/simulation support up to 224 active ordinary troops, plus eight champions, sixteen guardians and eight crystals. Ranged and melee troops collide and fight; champions clear groups and duel one another. They can attack while advancing through weak troops, raid weakened crystal positions, retreat to recover, and return to fight. Retreat uses separate enter/exit health thresholds to avoid endless low-health indecision.

Each life crystal has two anchored guardians (one with ranged attacks) and three rearming mines. Living guardians reduce incoming crystal damage by 82%; defeating them exposes the crystal. Guardian deaths persist. Champions return at full health after ten seconds while their crystal remains, with three seconds of arrival protection. Crystal destruction stops reinforcements. A champion without a crystal is eliminated on death; destroying a crystal during its owner's recall also eliminates that owner. The last surviving claimant wins. There is no automatic crystal decay or forced scripted winner.

**Watch all eight** lets every champion act autonomously. Choose a champion to take control; WASD/arrows move, Q uses its prototype power, Space uses its prototype ultimate, and basics auto-target. Touch provides a joystick and power buttons. Inspect opens crystal health, guardian counts, champion status, events, troop caps, speed controls and seeds. New battle randomizes the seed. Replay / use seed restarts the entered seed; the URL retains it for comparison. Control mode returns speed to 1× when selected. Prototype choices are not saved to the game's profile.

## Performance and checks

Simulation uses a fixed 30 Hz step, pooled troop slots, a spatial grid, staggered perception, bounded projectiles (96) and effects (72). The static arena is rasterized once per resize/reset. Character models and spell textures are downsampled once on load; unit recolors are cached. Device pixel ratio is capped at 1.5. Rendering uses the display's frame cadence independently of simulation speed, and background-tab time is discarded on return.

All 491 automated project tests passed, including eight new prototype tests for crystal wards, respawn/permanent death, army limits, powers, deterministic outcomes, movement and isolated dependencies. Production build and 98 browser modules parsed successfully. Browser tests cover all-eight visibility, seed replay, pause, keyboard/touch movement, powers and responsive layout with no page errors. Stress checks populated 224 troops: local desktop frame median / 95th percentile was 10 / 10.2 ms; the 844 × 390 touch viewport at DPR 2 (render cap 1.5), with fourfold CPU throttling, measured 10.1 / 30 ms. These are development-machine browser observations, not measured phone hardware performance.

Five unassisted seeded simulation screens ended with:

| Seed | Winner | Seconds | Troops slain | Champion falls |
| --- | --- | ---: | ---: | ---: |
| 1 | Lycanthrope | 399 | 3421 | 10 |
| 2 | Devourer | 393 | 2779 | 9 |
| 3 | Reaper | 305 | 2639 | 12 |
| 17 | Titan | 454 | 3665 | 11 |
| 23 | Lycanthrope | 287 | 2710 | 9 |

These demonstrate working resolution and varying outcomes; they are not win-rate estimates. Reproduce with `node --test tests/crucible.test.mjs` and `node tests/crucible-browser.mjs`. Screenshots under `test-results/crucible-*` show the initial layout, clash and manual controls on desktop/touch.
