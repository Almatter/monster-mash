# Ashen Wilds terrain assets

Generated using the built-in imagegen tool, two separate calls; no API/CLI fallback. Both masters were inspected before packing. Runtime assets are lazy-loaded only in Stage 2. Existing Stage 1 artwork remains in place.

| Master saved in this project | Runtime asset |
|---|---|
| `art-source/stage2/ash-terrain.png` | `public/assets/arena/floor-court.webp` (512 × 512) |
| `art-source/stage2/rock-ridge.png` | `public/assets/arena/court-ridge.webp` (600 × 320, alpha preserved) |

Rebuild: `node tools/pack-stage2-terrain.mjs`. The map renders ridges at their physical obstacle locations; open routes between them form a light maze. No ritual rings or braziers are rendered on this map.

## Terrain prompt

Use case: stylized-concept. Asset type: seamless repeating terrain tile for top-down anime isekai arena game Monster Mash. A large square view straight down of a bleak ash desert: muted dusty warm ochre and brown-grey earth, wind-scoured sandy ripples, irregular cracked dry patches, sparse tiny charcoal stones and faint old wagon trails. Hand-painted anime RPG environment texture with clean illustrative detail and restrained contrast so small monsters remain readable. Fully covers canvas edge to edge, edges designed to repeat seamlessly horizontally and vertically. No stone paving, no bricks, no architectural floor, no grass, no large rocks, no plants, no buildings, no characters, no text, no border, no glow, no horizon. Flat even light, no perspective. Produce a single square terrain texture.

## Ridge prompt

Use case: stylized-concept. Asset type: transparent environment sprite for top-down anime isekai action game Monster Mash. One low crescent-shaped rocky outcrop of dark jagged basalt, eroded grey brown stone with pale dusty ochre tops, sparse dry roots in fissures. Broad irregular natural rock ridge designed as a physical obstacle in an ash desert. Overhead view, slightly angled top-down 75 degrees, modest depth visible on lower face, crisp hand-painted anime RPG environment art. Exactly one compact cluster centered, full silhouette completely inside canvas, transparent background. No glow, no circle, no ground plane, no paving, no building, no creatures, no text, no border. Strong silhouette readable at 300 pixels. Rock cluster should be wider than tall, softly jagged, about 2 to 1 silhouette.

## Current v20 terrain and landmark sources

The original crescent ridge prompt above is historical. Its master was replaced with a compact straight basalt outcrop with no ground plane or sandy plateau. The current exact prompts and built-in generation mode are in [NAVIGATION_PROMPTS.json](NAVIGATION_PROMPTS.json).

Final masters: [rock-ridge.png](rock-ridge.png) and [landmarks.png](landmarks.png). The square atlas contains Swordfall, Rib Gate, Sun Spire and Broken Bell in that order, reading left to right, top to bottom. `node tools/pack-stage2-terrain.mjs` extracts each cell and preserves alpha. Ridge output is 1024 × 342; each landmark is 384 × 432. World spacing no longer changes either prop resolution or physical collision size.
