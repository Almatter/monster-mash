# Horde’s Judgment: isolated arena prototype

Open `test/crucible.html?seed=17`. This standalone page does not import the live Stage 4 engine, read/write profiles, award scores, change release gates, or replace the published Stage 4 map. The build change only adds version stamping for its new page. No new art is required: the prototype reuses generated champion selection cutouts, infantry/arbalists, guardian art, crystal shrines and spell textures. Pose bobbing and signature powers are simplified; this is not a champion balance or full native-kit test.

## Battlefield and play

The nominal arena is 2400 × 1400 world units with eight seeded camp positions around an open center. The default camera follows the controlled champion, or the selected spectator subject, at a closer uniform scale. Full map (M) toggles a live overview of all camps; closing it returns to the followed champion. Overview ground projection adapts to the screen aspect ratio while upright models retain their proportions. The overview does not pause combat or grant safety. There are no timed pickups or racing objectives. The floor is an intentional layout blockout.

Eight AI champions begin with 16 followers each. Reinforcements replenish armies every 3.5 seconds to the selected equal cap (12, 20 or 28 per army). The renderer/simulation support up to 224 active ordinary troops, plus eight champions, sixteen guardians and eight crystals. Ranged and melee troops collide and fight; champions clear groups and duel one another. Champions can attack while advancing through weak troops, raid weakened crystal positions, retreat to recover, and return to fight. Every fresh minion must reach within 100 world units of the center before choosing the nearest surviving enemy base, attacking its guardians before its crystal. This army objective is independent of champion AI plans. Nearby enemies can interrupt the march (180 world units for infantry, 220 for ranged troops), without champion targeting bonuses. Pursuit is limited to 110 units of displacement or two seconds of chasing outside attack reach, followed by three seconds of resuming the march; targets outside local aggro are dropped immediately. If no enemy bases survive, troops return toward the center and fight local enemies rather than chasing a distant champion across the map. Retreat uses separate enter/exit health thresholds to avoid endless low-health indecision.

Each 6,500 HP life crystal has two anchored 2,000 HP guardians (one with ranged attacks) and three rearming mines. Guardians take half incoming damage. The ranged guardian covers 340 world units so normal ranged basics cannot freely outrange it. Their attacks use a separate defensive damage multiplier against champions (1.8 instead of the duel multiplier of 0.24), with a separate 16% maximum-health per-hit limit; champion duels retain the 7.5% limit. They target the nearest enemy, allowing a supporting minion front line to absorb their fire. These rules apply equally to all camps. Living guardians reduce incoming crystal damage by 82%; defeating them exposes the crystal. Guardian deaths persist. Champions return at full health after ten seconds while their crystal remains, with three seconds of arrival protection. Crystal destruction stops reinforcements. A champion without a crystal is eliminated on death; destroying a crystal during its owner's recall also eliminates that owner. The last surviving claimant wins. There is no automatic crystal decay or forced scripted winner.

**Watch all eight** lets every champion act autonomously. Choose a champion to take control; WASD/arrows move, Q uses its prototype power, Space uses its prototype ultimate, and basics auto-target. Touch provides a joystick and power buttons. Inspect opens crystal health, guardian counts, champion status, events, troop caps, speed controls and seeds. New battle randomizes the seed. Replay / use seed restarts the entered seed; the URL retains it for comparison. Control mode returns speed to 1× when selected. Prototype choices are not saved to the game's profile.

## Performance and checks

Simulation uses a fixed 30 Hz step, pooled troop slots, a spatial grid, staggered perception, bounded projectiles (96, with 16 slots reserved for guardian fire) and effects (72). The static arena is rasterized into a 2400 × 1400 world cache once per resize/reset; camera movement transforms that cache without rebuilding it each frame. Character models and spell textures are downsampled once on load; unit recolors are cached. Device pixel ratio is capped at 1.5. Rendering uses the display's frame cadence independently of simulation speed, and background-tab time is discarded on return.

All 501 automated project tests passed, including eighteen prototype tests for wards, respawn/permanent death, bounded pools, powers, deterministic outcomes, movement, isolation, guardian burst resistance and supported versus solo raids. Production build passed. Browser tests cover default close view, overview visibility, live simulation while viewing the map, return to close view, seed replay, pause, keyboard/touch movement, powers and responsive layout with no page errors. With 224 troops, desktop frame median / 95th percentile was 10 / 10.3 ms; the 844 × 390 touch viewport at DPR 2 (render cap 1.5), with fourfold CPU throttling, measured 10 / 20 ms. These are development-machine observations, not measured phone hardware performance.

In isolated stationary solo dives using available powers, all eight champions died in 3.5–5.5 seconds while both guardians survived. The supported Devourer raid regression still clears both guardians while surviving above half health. With champion AI removed for five minutes, 3,843 troops died, all eight crystals survived, and 66 troops were fighting within the central ellipse at the final sample. This demonstrates sustained army pressure that champions can break; it is not a guarantee of a permanent stalemate.

Six unassisted seeded simulations averaged 828 seconds (13.8 minutes):

| Seed | Winner | Seconds | Troops slain |
| --- | --- | ---: | ---: |
| 1 | Reaper | 1091 | 7783 |
| 2 | Devourer | 831 | 5437 |
| 3 | Reaper | 670 | 5567 |
| 17 | Devourer | 624 | 5151 |
| 23 | Lycanthrope | 1079 | 6823 |
| 338053737 | Devourer | 675 | 5459 |

These demonstrate working resolution and varying outcomes; they are not win-rate estimates. Reproduce with `node --test tests/crucible.test.mjs` and `node tests/crucible-browser.mjs`. Screenshots under `test-results/crucible-*` show the initial layout, clash and manual controls on desktop/touch.
