# Stage 3 environment quality pass

The existing battlefield layout and scale are retained. Combat, progression, score rules, and public stage gates are unchanged.

## Diagnosis and corrections

- Room floor outlines excluded visible rear plazas, especially the Shattered Foundry, Moon Crypt, and Fallen Throne. All seven shrine outlines were retraced. Three approach outlines/centerlines also included painted parapets or cliff faces; these now follow the pavement. The floor union is compiled offline into the existing five-world-unit clearance field. Runtime collision remains a constant-time lookup, with swept movement and shared enemy navigation.
- Foreground polygons were not registered tightly to their objects. Several extended into empty floor; some represented scenery that was not actually there. Removed the phantom regions and retraced the actual altars, banners, and statues. Hanging cloth has no ground collision. Two interior approach braziers have small verified base footprints. Only the champion body participates in foreground clipping; the aura is no longer cut into hard wedges. The partially visible body behind a real prop remains a lightweight visibility cue over the baked painting.
- Altar interaction approaches now sit on adjacent usable floor. Relics are roughly twice their prior displayed size, anchored over the altar display surface, with restrained floating movement and a cached soft light beneath them. The Foundry relic is lifted above its tabletop. Portals and relic mechanics retain their existing behavior.
- Encounter borders use a single closed ribbon per zone instead of individually rotated rectangles. Guardian outlines have rounded corners and share their geometry with containment. The Titan ellipse remains at its existing engagement radius. A gentle pulse and traveling energy animate the presentation without moving the boundary. At most two small ribbon textures are cached.

## Artwork and streaming

The old 1,254-pixel sector sources covered about 3,330-3,567 world pixels each, so they were genuinely under-resolution. Simply requesting a larger generation still returned 1,254 pixels and was rejected as a solution.

The replacement preserves the composition through 57 registered detail crops, generated with the built-in image tool. Each covers approximately 1,236-1,310 world pixels and is generated at 1,254 pixels. The prompt, references, originals, provenance, and registration manifest are in `art-source/stage3/v43/`. Unoccupied distant background keeps the existing fog.

`tools/pack-realm-v43.mjs` blends overlapping crop gutters offline and writes 400 WebP tiles to `public/assets/stage3/map-v43/`. Each tile has a 512-pixel core and a one-pixel sampling gutter on every side. Rendering uses the correct dimensions, replacing the former per-tile stretch from 512 to 516 pixels. No full-resolution world atlas is decoded during play.

Terrain remains limited to 24 decoded tiles: approximately 24.2 MiB versus 24.0 MiB before. The complete streamed map is 16.3 MB versus 9.9 MB before; this is not an upfront whole-map download. The maximum additional border cache is below 4.5 MiB. Relic lighting uses one 128-pixel texture. These values exclude browser/GPU bookkeeping and existing champion assets.

## Developer view

Open the exhibition route with `?mapdebug=1`. F8 toggles its visibility. The controls show floor outlines (green), solid bases (red), foreground silhouettes (pink), and encounter boundaries (cyan). Enable Probe and click/tap the map to inspect a 23-unit foot radius; the panel reports master coordinates, floor clearance/base obstruction, and nearby foreground candidates. Otherwise it follows the player. Normal event pages never mount this UI, including when given the query parameter.

The overlay uses authored geometry and collision queries, not runtime image-pixel scanning. `tools/review-realm-geometry.mjs` and `tools/review-realm-paths.mjs` also produce offline registered inspection images.

## Validation

- Full unit regression suite: 317 passing tests.
- 76 actual-movement browser audits: all 12 complete connectors in both directions and all seven shrine perimeters, altar approaches, and portals, using Devourer and Titan on desktop and mobile layouts.
- Every champion compared across all nine map regions: 63 rendered scale checks.
- 24 desktop/mobile foreground scenes and explicit checks that previously phantom regions now render without a visibility fade.
- All seven shrines, 12 connectors, and outer fog checked at desktop, landscape-mobile, and portrait-mobile sizes: bounded texture cache and no failed assets or black-gap probes.
- Keyboard/touch relic inspection, swapping, portals, results, and run-code integration passed.
- Border animation changes pixels while leaving geometry fixed. Developer controls are absent on the normal event page.
- Four-times CPU-throttled browser baseline: desktop update/draw median 5.6 ms before, 5.4 ms after; mobile-size median 5.2 ms before, 5.0 ms after. The 95th percentiles were 10.3/10.1 ms and 9.9/9.3 ms respectively.
- Stress scene with 240 enemies: median 6.5 ms desktop, 5.9 ms mobile-size; 95th percentile 13.7/13.9 ms. These are host-browser emulation measurements, not physical-phone FPS guarantees.
- Mobile background-loading/stall regression passed: no movement pause for off-screen tiles, bounded catch-up, no repeated resize writes, no terrain failures.
- Production build and GitHub Pages relative routes/PWA scope validated. Deferred TypeScript imports now receive the same .js rewriting as static imports.

## Practical limits

No known blocking issue remains on the audited routes or shrine approaches. The environment is still a 2D painting with authored floor/base/foreground geometry, not a 3D mesh. Very close contact with decorative silhouettes can retain small perspective approximations. Mobile checks were browser emulation on the development machine; physical tester-device confirmation remains useful. Higher-resolution streamed art increases total map transfer size by about 6.4 MB while keeping resident terrain memory nearly unchanged.
