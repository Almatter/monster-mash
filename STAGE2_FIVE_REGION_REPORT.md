# Stage 2: five-region local build

Built locally on October 3, 2026, on branch `codex/five-region-layout`. **Nothing has been pushed or deployed.** The public Stage 2 test site remains on v22. Local Stage 2 uses `2026.10-v23-court-test`; Stage 1 retains its shipped v15 rules.

## Play locally

Open **http://127.0.0.1:4173/stage2-test/**. The existing local server is running and serves the rebuilt `dist/` directory.

This entry bypasses Gatebreaker and the release date for testing. It keeps test progress in the existing separate storage namespace. Normal entry still enforces the title and October 8 opening. No save or progress schema changed. Historical run-code rules are retained, including v22. New v23 codes can be verified locally; the unchanged public verifier does not yet know v23.

## Authored geography and finished artwork

- **Crownfall Keep**, north: ruined fortress, heraldic standards and stores.
- **Emberforge**, east: furnaces, weapon racks and a ruined smithy.
- **Sunken Chapel**, southeast: blue banners, sanctuary ruins and a sacred basin.
- **Bonebarrow**, southwest: skeletal remains, burial crypts and an obelisk.
- **Wayfarer’s Rest**, west: caravan remains, green awnings and supplies.

Each district has a central structure, a surrounding loop, four courtyard branches and entrances connecting it to the hub and outer circuit. Two of its four possible captain pockets are occupied each run. Geography remains fixed, so players can learn the roads; occupancy varies by seed. Ten captains are distributed across all five districts. Fallen standards identify cleared camps.

Production artwork was generated using the **built-in image_gen tool**. Five district paintings, twenty finished detail sections, basalt scenery and a fallen-standard asset were created specifically for the medieval fantasy isekai anime theme. Rendering detail was repainted rather than merely enlarging the first low-resolution masters. Original outputs and exact prompts are preserved under `art-source/stage2/regions/`; base prompts are in `PROMPTS.json`, and detail prompts/provenance are in `details/PROMPTS.json`.

Layout guides and derived crop references are internal artist instructions. They are excluded from the game build. No guide diagrams, test shapes or placeholder scenery are loaded as new map assets.

Artwork is baked into small sections with shared edge pixels. Its original lighting remains fixed; districts are never arbitrarily rotated. Ground and rocky boundaries use finished textures, with irregular road edges. Collision uses separately authored connected ground, not image rectangles. It never tests artwork pixels during play.

## Loading, collision and navigation

The full compressed scenery is **48.40 MiB**, split into 462 WebP sections. It is fetched on demand, not downloaded in full before a match. Initial hub preparation/prefetch requests 30 sections totaling **3.39 MiB**. The decoded terrain cache holds at most 36 images of 516 × 516 pixels: **36.56 MiB of RGBA pixel storage**, plus at most four concurrent decodes and browser overhead. Eviction explicitly closes ImageBitmaps. This is a terrain budget, not a measurement of total browser memory.

The renderer preloads beyond every camera edge. If a slow connection leaves the next stretch unavailable, simulation waits before entering it: match time, enemies and damage stop together, and resume when the scenery is ready.

Collision uses local spatial buckets. Navigation has 897 walkable nodes and at most twelve cached route fields. Exact capsule interval coverage rejects false connections through narrow corners. Late ash traces stop at actual route points rather than overshooting a turn. Twelve-minute pulses and the continuous trail after fifteen minutes retain their previous timing; the speed bonus is already zero when continuous guidance begins.

## Measured runs

Three fixed seeds per champion, real damage and normal abilities/healing, no invulnerability or enemy stat overrides. The controller explores the twenty known possible pockets without reading which ones are occupied, fights captains and chooses boons. These are **learned-route automated clears**, not first-time human averages or death-survival estimates.

| Champion | Average clear | Average body count | Average dominance | Clears |
|---|---:|---:|---:|---:|
| Devourer | 5:06 | 2,706 | 1,481,110 | 3/3 |
| Titan | 6:17 | 3,842 | 1,619,851 | 3/3 |
| Sovereign | 6:12 | 4,087 | 1,616,381 | 3/3 |
| Calamity | 7:45 | 5,200 | 1,688,878 | 3/3 |
| Overlord | 8:02 | 5,303 | 1,674,589 | 3/3 |

All 15 full hunts cleared. Normal hunts peaked at substantially fewer enemies than the 200-enemy stress fixture. Combat kits, captain toughness, sustain, boons and score caps were not retuned for this map.

Following any of the five authored roads without knowing occupied sites revealed a captain in all **75 opening scenarios**: mean 27.8 seconds, 95th percentile 43.8 seconds, maximum 50.3 seconds. This assumes the player follows roads; holding a direction into a wall is not a search strategy.

All **15 late-search scenarios** also cleared. Starting at 13:00 with seven captains already slain, and following visible enemies/ember markers, final clear times ranged from **14:49 to 16:11**.

The intended **10–12-minute human first-play experience still needs local playtesting**. Perfect route following clears faster, especially with the melee movement abilities. The map is not artificially padded with longer captain health bars or a waiting timer.

## Validation

- **154 unit/regression tests passed**, including deterministic two-per-region occupancy, all twenty courtyard routes, real wall contact, melee dash retreat and forty raw-movement clue routes.
- **10 Stage 1 parity comparisons** matched the deployed v15 simulation through 600 seconds: all champions, two seeds each.
- Desktop/phone scenery inspection and cache checks passed with zero load failures and a peak of 36 decoded sections.
- Desktop, ultrawide, landscape-phone and portrait-phone camera/captain lifecycle checks passed. Visible battlefield area remains fixed; large monitors gain no extra view.
- All champion menus, abilities, pause/results, local codes, official locks and isolated test progression passed.
- Withholding a requested map column held simulation without any blank scenery frames.
- Northern-edge Devourer and Titan dashes ended on collision and allowed immediate retreat.
- Boon music uses its own reusable looping mono buffer; battle music pauses during selection.
- Final crowded-wall browser stress test: 200 enemies, 4× CPU throttle, Devourer 26.6 FPS and Overlord 22.7 FPS; mean terrain-inclusive drawing cost 1.08/1.14 ms. This is an artificial stress test on this computer, not a guarantee for a ten-year-old laptop.
- Static build validation passed; source art and test tooling are absent from `dist/`.

Raw measurements and screenshots are under `test-results/stage2-v23-*`. Rebuild with `node tools/build.mjs`. Artwork packing is `node tools/pack-five-regions.mjs`, using the bundled Sharp runtime; it is an offline tool, not a game dependency. The overview tool writes an inspection image and does not add a player minimap.

For local review, check how clearly road junctions read, whether each courtyard feels spacious enough to dodge, and whether learning the five districts gives a satisfying search rhythm.
