# Stage 3 path and guardian correction

The original production illustrations remain in `../v39/`. `overview.png` shows the corrected assembly. No new placeholder artwork is used.

`tools/pack-realm-v39.mjs` now emits `public/assets/stage3/map-v40/`. Before bending the generated bridge/stair strips, it crops their transparent margins so the painted deck fills the actual collision width. External connectors meet the traced source entrances.

`src/realm-layout.ts` traces full stone floor polygons in each illustration, including the raised arena approaches. `node tools/pack-realm-collision.mjs` regenerates the 4-world-unit Euclidean clearance field after any geometry edit. The field evaluates the complete floor union; internal polygon seams are not walls. Runtime collision is a bounded lookup. Navigation uses compact adjacency and at most eight cached flow fields.

Guardians chase and charge only inside their own court, return home when the player leaves, and keep their current health. The approach inscriptions provide short thematic riddles without creature symbols; the pause screen offers only controls, the objective and a gentle pointer to the bridges.

Stage 3 allows movement while distant viewport tiles are loading, with a 112-unit loaded safety area around the player and the existing prefetched terrain/cache limits. Actual nearby missing terrain still safely pauses simulation. Canvas backing storage is rebuilt only when its size actually changes, so adaptive effects and repeated mobile resize events do not needlessly reset it. The FPS counter measures real display intervals, and Stage 3 catches up at most three simulation steps per displayed frame to avoid a post-stall workload surge. Versioned cached artwork is reused within its matching service-worker build, avoiding repeated network validation and disk writes when decoded map tiles are evicted. New build versions still fetch fresh artwork. Regular Stage 1/2 simulation catch-up limits, scores and save formats remain unchanged.

## Validation

302 unit tests passed. Browser checks covered PC and mobile relic inspection (text-only clues), keyboard controls, shrine swaps, portals, authenticated Grade S results, and terrain rendering across landscape/portrait views. The mobile game-loop test delayed a distant map tile for a second without stopping movement, crossed autosave intervals, and recovered from a forced 140ms stall with at most three simulation updates per frame. Repeated adaptive-quality changes caused zero canvas backing-store resets at unchanged mobile dimensions.

Serial 4x CPU-throttled crowded tests used 48 enemies and 28 Overlord servants. Mobile median update+draw work was 6.6ms on the approach and 6.8ms in the arena; 95th-percentile work was 16.4ms and 12.4ms respectively. These are emulated browser measurements, not measurements from the tester's physical phone. Offline reload and safe service-worker version replacement passed.
