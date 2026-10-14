# Lycanthrope guardian-fight performance

October 14, 2026. Optimizations preserve ability artwork, damage, cooldowns, warnings, hit detection and collision boundaries.

- Stage 3 preparation now recolors the champion's ability artwork before combat, yielding between images. Relic preparation prioritizes the body's artwork before borrowed packs. The existing sixteen-image tint cache remains bounded; explicit color arguments prevent menu/paused rendering from changing the preparation color.
- Bloodmoon uses a cached waypoint between fixed simulation steps. Target changes, reached waypoints, significant movement and a 0.18-second expiry trigger replanning. Movement and swept damage/collision still run every step.
- Stationary guardian windups skip unnecessary route lookup while retaining knockback movement and collision.
- Foreground clipping uses the actual actor category: small attendants no longer request the giant Titan-sized clipping bounds. Guardians retain room for their status labels, and the Titan keeps its existing bounds.

The repeatable browser profile uses an 844 by 390 touch viewport at device pixel ratio 3 (the renderer keeps its normal backing-resolution cap), 4x browser CPU throttling, Lycanthrope, a live guardian team and 24 durable attendants. It profiles 240 fixed-step frames each for ordinary combat, Cyclone and Bloodmoon, with the same real gameplay/rendering routines. CPU throttling and touch emulation are not a physical-phone benchmark; adaptive FX remains active and wall-clock timing varies.

| Phase | Longest draw call before | After | Mean draw before | After |
|---|---:|---:|---:|---:|
| Ordinary combat | 83.9 ms | 16.1 ms | 4.66 ms | 4.54 ms |
| Cyclone | 78.7 ms | 13.1 ms | 4.22 ms | 3.96 ms |
| Bloodmoon | 72.8 ms | 13.2 ms | 5.33 ms | 4.81 ms |

The profiler sampled about 179 ms in getImageData and 59 ms in colorPowerPixels during combat before; both were absent from the after combat profile. Recoloring still occurs, but during preparation. Typical update and draw costs improved modestly; the principal measured improvement was removal of long first-use recoloring stalls. Other spikes can still occur from browser scheduling, terrain loading or device/GPU limits.

Validation: all 401 unit tests passed, including new waypoint-cache invalidation tests. Desktop and touch guardian-team browser checks passed for containment, shield coverage, flanking, bombardment, knockback and Titan escalation. Production artifact checks passed.

Reproduce with node tests/lycan-guardian-perf-browser.mjs. Optional HUNT_ORIGIN selects the site; PERF_TAG names the JSON and CPU-profile output in test-results. Before and after artifacts are lycan-guardian-before/after.json and .cpuprofile.
