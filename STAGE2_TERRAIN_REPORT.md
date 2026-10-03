# Ashen Wilds terrain and performance update — v22

Public tester entry: https://almatter.github.io/monster-mash/stage2-test/. Local entry: http://127.0.0.1:4173/stage2-test/.

## What changed

Crowds touching stone could trigger a full navigation-grid scan for each enemy on each frame. Their bodies were inside the pathfinding clearance margin, so no visible start node could be found. Collision and line-of-sight now use static 400-unit spatial buckets. Wall-contact enemies first move out of the local clearance margin; navigation entry searches nearby nodes, and enemies sharing a destination reuse its anchor and bounded flow-field cache. No enemy-count reduction or combat nerf was needed.

Forty staggered, rotated crescent/fork formations bring the interior total to 54. They reuse the existing two cached textures. The four named landmarks, every possible captain site, and all five healing points retain clear approaches. All 310 sampled horizontal/vertical traverses encounter visible interior formations within the normal camera. This checks those sampled travel directions; it is not a claim that every conceivable straight line collides with stone. Hollows and valleys remain walkable.

A generated jagged basalt sprite replaces the rectangular border stroke. Four uneven profiles define both the rocky perimeter and its inner movement boundary; 140 overlapping sprite placements reuse one 768 × 256 texture (0.75 MiB decoded RGBA). Rendering keeps only visible placements. Boundary resolution handles corners and body radius. Stage 2 Lunge and Stampede finish when blocked, preventing outward dash momentum from cancelling inward movement. Regression checks cover all four edges, chained Lunges and maximum movement boons.

The navigation graph has 857 nodes, including 144 local hollow connections, with at most twelve cached flow fields. Added scenery does not create another texture copy for each rock or border segment.

## Compatibility

Stage 1 kit balance, enemy behavior and scoring are unchanged. Ten comparisons (five champions × seeds 77/444) reproduce the deployed Stage 1 simulation state exactly through 600 seconds. Official and tester profiles remain separate; no save migration or reset was introduced. Normal Stage 2 access still requires Gatebreaker and October 8 at midnight Eastern. The dedicated tester entry retains its access bypass. Historical v16–v21 Stage 2 run codes remain accepted; new runs use `2026.10-v22-court-hunts` or `2026.10-v22-court-test`.

## Performance evidence

A controlled simulation fixture presses 200 live enemies against terrain after three game minutes. Both versions use the same setup: no additional spawns, disabled attacks and an invulnerable player, so this isolates movement/navigation cost rather than survival balance. Node 24 measurements on this development computer:

| Scene | v21 mean update | v22 mean update | v22 95th percentile |
|---|---:|---:|---:|
| Open ground | 0.653 ms | 0.515 ms | 1.240 ms |
| Crescent wall | 43.186 ms | 0.964 ms | 2.141 ms |
| Landmark foot | 173.615 ms | 0.575 ms | 1.061 ms |

A separate actual-browser reproduction at 4× CPU throttling used 120 enemies pressed against the same terrain. Mean update costs fell from 191.3 to 3.0 ms at the crescent and from 651.8 to 1.2 ms at the landmark. The deliberately pathological old fixture nearly stalled. These are controlled measurements, not a promise of identical frame rates on every device.

Runners: `tests/stage-two-collision-performance.mjs` and `tests/stage-two-terrain-performance-browser.mjs`. Raw results: `test-results/stage2-v22-collision-baseline.json`, `test-results/stage2-v22-collision-final.json`, and `test-results/stage2-v22-terrain-browser-performance.json` (ignored local evidence). Set `BENCH_VERSIONS=current` to measure only the current build; the default also reconstructs v21 from commit `9647e0649825e9ab33cc01225a6629709a08c849`.

## Hunt completion checks

All fifteen full hunts cleared: five champions × seeds 77/123/444, ordinary damage and healing, no immunity. The controller follows an experienced search route and chooses power, recharge and speed boons. These are completion times, not death/survival averages.

| Champion | Average clear time | Average body count | Average Dominance | Clears |
|---|---:|---:|---:|---:|
| Devourer | 4:49 | 2,349 | 1,439,989 | 3/3 |
| Titan | 5:39 | 3,283 | 1,547,566 | 3/3 |
| Sovereign | 5:55 | 4,099 | 1,598,392 | 3/3 |
| Calamity | 7:29 | 5,680 | 1,692,693 | 3/3 |
| Overlord | 7:45 | 5,603 | 1,689,584 | 3/3 |

These practiced routes are faster than the desired 10–12-minute human experience. This update does not artificially slow combat to reach that target; tester search and clear times still need observation. Relative to the v21 baseline, the extra formations add route variation without making any champion unable to finish.

A second fifteen-run fixture starts at 13:00 with seven captains already defeated, three outer captains remaining and a healthy champion with seven boons. It searches using visible enemies and the existing late-game clues; ordinary combat damage remains active. Every fixture finished, with final match clocks from 15:04 to 16:38. This is a targeted late-search test, not fifteen complete runs from the opening. Raw full hunts: `test-results/stage2-v22-final.json`; late-search checks: `test-results/stage2-v22-guided-final-three.json`.

## Verification and artwork

All 154 unit tests pass. Browser checks cover desktop and phone border escape, edge culling, transparent ground/hollows, all five playable kits, captain persistence, boon choices and music, protected official saves, bounded camera area, run verification and normal access locks. The ten Stage 1 parity comparisons pass. Screenshots were inspected at desktop and phone sizes; an overview was inspected to verify distribution and the complete ridge.

The built-in imagegen tool generated the transparent perimeter master [border-ridge.png](art-source/stage2/border-ridge.png). Its exact prompt, mode and output path are recorded in [BORDER_PROMPT.json](art-source/stage2/BORDER_PROMPT.json). The packed game asset is [court-border.webp](public/assets/arena/court-border.webp). Rebuild with `node tools/pack-stage2-terrain.mjs`.

Local visual evidence: `test-results/stage2-v22-border-1440.png`, `test-results/stage2-v22-border-842.png`, and `test-results/stage2-v22-map-overview.png`. The overview is a developer-only zoom; the player camera and lack of a minimap are unchanged.
