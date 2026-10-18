# Horde’s Judgment: isolated arena prototype

Open `test/crucible.html?seed=17`. This standalone page does not import the live Stage 4 engine, read/write profiles, award scores, change release gates, or replace the published Stage 4 map. The build change only adds version stamping for its new page. No new art is required: the prototype reuses generated champion selection cutouts, infantry/arbalists, guardian art, crystal shrines and spell textures. Pose bobbing and signature powers are simplified; this is not a champion balance or full native-kit test.

## Battlefield and play

The nominal arena is 2400 × 1400 world units with eight seeded camp positions around an open center. The default camera follows the controlled champion, or the selected spectator subject, at a closer uniform scale. Full map (M) toggles a live overview of all camps; closing it returns to the followed champion. Overview ground projection adapts to the screen aspect ratio while upright models retain their proportions. The overview does not pause combat or grant safety. There are no timed pickups or racing objectives. The floor is an intentional layout blockout.

Eight AI champions begin with 16 followers each. Reinforcements replenish armies every 3.5 seconds to the selected equal cap (12, 20 or 28 per army). The renderer/simulation support up to 224 active ordinary troops, plus eight champions, sixteen guardians and eight crystals. Ranged and melee troops collide and fight; champions clear groups and duel one another. They can attack while advancing through weak troops, raid weakened crystal positions, retreat to recover, and return to fight. Retreat uses separate enter/exit health thresholds to avoid endless low-health indecision.

Each 6,500 HP life crystal has two anchored 2,000 HP guardians (one with ranged attacks) and three rearming mines. Guardians take half incoming damage. The ranged guardian covers 340 world units so normal ranged basics cannot freely outrange it. Their attacks use a separate defensive damage multiplier against champions (0.85 instead of the duel multiplier of 0.24), retaining the 7.5% maximum-health per-hit limit. They target the nearest enemy, allowing a supporting minion front line to absorb their fire. These rules apply equally to all camps. Living guardians reduce incoming crystal damage by 82%; defeating them exposes the crystal. Guardian deaths persist. Champions return at full health after ten seconds while their crystal remains, with three seconds of arrival protection. Crystal destruction stops reinforcements. A champion without a crystal is eliminated on death; destroying a crystal during its owner's recall also eliminates that owner. The last surviving claimant wins. There is no automatic crystal decay or forced scripted winner.

**Watch all eight** lets every champion act autonomously. Choose a champion to take control; WASD/arrows move, Q uses its prototype power, Space uses its prototype ultimate, and basics auto-target. Touch provides a joystick and power buttons. Inspect opens crystal health, guardian counts, champion status, events, troop caps, speed controls and seeds. New battle randomizes the seed. Replay / use seed restarts the entered seed; the URL retains it for comparison. Control mode returns speed to 1× when selected. Prototype choices are not saved to the game's profile.

## Performance and checks

Simulation uses a fixed 30 Hz step, pooled troop slots, a spatial grid, staggered perception, bounded projectiles (96) and effects (72). The static arena is rasterized into a 2400 × 1400 world cache once per resize/reset; camera movement transforms that cache without rebuilding it each frame. Character models and spell textures are downsampled once on load; unit recolors are cached. Device pixel ratio is capped at 1.5. Rendering uses the display's frame cadence independently of simulation speed, and background-tab time is discarded on return.

All 495 automated project tests passed, including twelve prototype tests for wards, respawn/permanent death, bounded pools, powers, deterministic outcomes, movement, isolation, guardian burst resistance and supported versus solo raids. Production build passed. Browser tests cover default close view, overview visibility, live simulation while viewing the map, return to close view, seed replay, pause, keyboard/touch movement, powers and responsive layout with no page errors. With 224 troops, desktop frame median / 95th percentile was 10 / 10.2 ms; the 844 × 390 touch viewport at DPR 2 (render cap 1.5), with fourfold CPU throttling, measured 10 / 20 ms. These are development-machine observations, not measured phone hardware performance.

In an isolated stationary Devourer raid using available powers, the solo attacker died after 9.4 seconds. With twelve supporting troops, the attacker cleared both guardians within twelve seconds and retained 92.5% health. This tests the value of support, not all champion matchups or human win rates.

Six unassisted seeded simulations averaged 903 seconds (15.0 minutes), compared with the prior five-seed average of 368 seconds (6.1 minutes):

| Seed | Winner | Seconds | Troops slain |
| --- | --- | ---: | ---: |
| 1 | Reaper | 1074 | 6590 |
| 2 | Devourer | 822 | 6026 |
| 3 | Reaper | 1076 | 6905 |
| 17 | Reaper | 1070 | 7480 |
| 23 | Reaper | 664 | 5359 |
| 338053737 | Lycanthrope | 709 | 5353 |

These demonstrate working resolution and varying outcomes; they are not win-rate estimates. Reproduce with `node --test tests/crucible.test.mjs` and `node tests/crucible-browser.mjs`. Screenshots under `test-results/crucible-*` show the initial layout, clash and manual controls on desktop/touch.
