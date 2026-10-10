# Stage 3 environment and rendering revision (v39)

Generated with built-in ImageGen. The ten transparent terrain originals, their exact prompts, and eight original spatial reference images are in this directory; the opaque fog original is `../ether-fog-v39.png`. `overview.png` shows the assembled map. The reference images are production-art inputs and are never shipped as scenery.

The images were generated separately against crops of a shared coordinate layout. They were not cropped from a finished master illustration. The first gritty batch was replaced with clean cel-shaded artwork: broad smooth floor slabs, sparse intentional cracks, stronger separation between floor, cliffs and props. Collision was subsequently traced from the finished images; original reference outlines are not authoritative collision masks.

Seven fixed native grottos have separate architecture, palette and altar/portal positions: Overlord mausoleum, Calamity archive, Devourer fang den, Titan foundry, Sovereign throne, Reaper crypt and Lycanthrope rooted ravine. Relic abilities, defense order and Titan appearance still vary per run. Relic swaps continue to change the altar decoration. Eleven short curved external bridges/stairs connect the illustrated approaches around a raised central arena. Local approaches follow the floors already painted in each illustration.

`src/realm-layout.ts` stores traced floors, approach centerlines, artwork placement and interaction positions. `tools/pack-realm-v39.mjs` bends generated bridge/stair strips offline, composites the regions and fog, then exports 100 opaque 512px WebP chunks. Run it using Node 24 and Sharp (the script uses this workstation's bundled Sharp path). `tools/realm-v39-preview.mjs` generates ignored contact sheets and floor overlays for future collision inspection.

The runtime decodes at most 24 terrain chunks, approximately 24 MiB of RGBA tile pixels. It never decodes the assembled 5120px source. Geometry searches use spatial buckets; distant soldiers replan their route about six times per second. Swept collision prevents dash/knockback from crossing chasms; Vault still checks the landing. The west inscription's route passes below the physical Lycanthrope altar rather than through it.

The expensive defense-marker canvas shadow was removed, and offscreen defenses/altar decorations are culled. Titan composites are cached by appearance reference. Stage 3 caps backing-canvas pixels at 2.1 million, reducing this further under sustained load; camera world area does not change. Loaded opaque terrain avoids an unnecessary fog redraw. Stage 1/2 combat, scores, access requirements and persistent data formats remain unchanged.

## Verification

- 297 unit tests pass, including all shrine pairs and all inscription pairs outside the Titan seal, swept movement, relic solutions, authenticated result codes and prior-stage rules/progress.
- Real PC/touch interaction checks pass for inscriptions, keyboard navigation, shrine-local swaps, portal travel and grade/result export.
- All seven grottos and eleven external connectors render at desktop, phone landscape and phone portrait sizes; no failed assets, black corner probes or unbounded tile cache.
- Browser-module parse and GitHub Pages artifact checks pass.

A headless Edge stress scene uses Overlord, 48 enemies, 28 servants and 4x CPU throttling. Compare median update+draw work, not FPS:

| Viewport | Previous path scene | Updated path scene | Updated arena scene |
| --- | ---: | ---: | ---: |
| 1920 x 1080 | 442 ms | 8.6 ms | 5.9 ms |
| 844 x 390 | 51.4 ms | 8.4 ms | 6.3 ms |

Updated path 95th-percentile work was 18.4 ms desktop / 17.2 ms mobile-sized. These are workstation browser measurements, not proof of sustained FPS or thermal behavior on a physical phone. Testers should retry the same phones.

The solution-informed pilot found and read all four inscriptions after the western route correction. Its combat/loadout decisions are simplistic: it does not establish champion balance or normal human puzzle-solving duration. This revision changes scenery/navigation/rendering, not combat tuning.

Run `node tests/realm-frame-profile.mjs`, `node tests/realm-edge-browser.mjs` and `node tests/realm-v37-browser.mjs` with external `PLAYWRIGHT_PATH` and `BROWSER_PATH`. Reports/screenshots are written to ignored `test-results/`. Testers use `/test/` (older test aliases continue to work); regular Stage 3 remains unavailable until its release is explicitly enabled.
