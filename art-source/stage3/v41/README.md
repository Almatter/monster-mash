# Stage 3 visible path correction

Reuses the seven production shrine illustrations and arena in `../v39/`, plus their generated bridge/stair artwork. No placeholder artwork was added. `overview.png` shows the complete revised assembly.

The previous collision union treated winding connector portions under painted cliffs as walkable. Collision packing now applies the same image order and edge feathering as terrain packing: opaque non-floor scenery erases hidden connectors. It then computes the single 4-unit clearance field offline, retaining constant-time runtime collision and the existing bounded tile cache.

Devourer, Sovereign and Reaper regions are separated from neighboring images; their six external joins and the north/east/south Titan approaches are rerouted to meet the actual painted entrances. Titan's lower approach and Sovereign's eastern approach include previously excluded stone deck width. Navigation checks full 25-unit clearance through each link and nudges bodies at narrow edges back into the route, preventing corner oscillation.

Regenerate after changes with `node tools/pack-realm-collision.mjs`, then `node tools/pack-realm-v39.mjs`. The latter now emits `public/assets/stage3/map-v41/` and this overview.

The pause objective is “Overcome the Titan. The bridges hold clues.” The controls and written creature riddles remain concise and contain no solution symbols. A build-specific import map covers both initial and deferred modules, preventing an older cached worker from pinning outdated guidance during a new page load. Offline reload still works; matches retain the existing safe update deferral.

Validation: 306 unit tests. New regressions require all eleven connector centerlines to have 30-unit clearance, all 22 internal shrine/arena branches to connect within their own illustration for a 54-unit body, and the pictured cliff to reject walking. PC/touch browser checks cover pause wording, keyboard inspection, relic swaps, portals and authenticated Grade S results. Rendering checks cover all seven grottos and eleven connectors in desktop, mobile landscape and portrait viewports. An intentionally obsolete worker cannot override current pause guidance; offline reload and safe worker replacement pass.
