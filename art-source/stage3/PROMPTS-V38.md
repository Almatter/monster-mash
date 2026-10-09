# v38 continuous ether boundary

Generated with the built-in ImageGen tool, with an opaque background.

## Prompt

Use case: stylized-concept. Asset type: opaque seamless terrain background texture for Monster Mash Stage 3, a medieval fantasy isekai anime underground mana realm. Generate a square tileable field of endless magical ether fog, with soft dense swirling blue-violet and muted indigo cloud layers filling EVERY pixel edge to edge. It should suggest enormous occult depths obscured by mist, luminous wisps and subtle cyan-violet glow, hand-painted high-quality anime game background. Low-medium contrast, no obvious central subject, evenly distributed detail, seamless matching opposite edges, no horizon, no ground, no buildings, no rocks, no symbols, no circles, no characters, no lettering, no stars, no pure black or blank margins. OPAQUE background throughout; this image will tile infinitely beyond an existing map of dark ruins and cyan mana chasms. The fog must remain clearly visible even in the darkest regions, and not resemble empty black space.

## Saved assets

- Original: `art-source/stage3/ether-fog-v38.png`.
- Runtime texture: `public/assets/stage3/ether-fog.webp` (1024 × 1024, opaque).
- Updated map: `public/assets/stage3/map-v38/` (100 tiles, each 512 × 512).
- Overview: `art-source/stage3/layout-v38-overview.png`.

`tools/pack-realm-v38.mjs` packs the artwork, matches opposite repeat edges, moves the existing generated mana stream beyond the walkable ends, and feathers the finite terrain into the same aligned fog used by the renderer. Fog fills all distances beyond the map. The decoded terrain cache remains bounded at 24 tiles on touch devices and 32 otherwise; the fog adds one shared 1024-pixel texture.

## Verification

296 unit/regression tests pass. Boundary tests cover all twelve outer approaches, player and mob radii, swept movement, Vault landings, and connected routes to every shrine. Browser checks cover desktop, landscape touch, and tall-screen rendering, with 90 fog pixel probes across all twelve approaches. The portrait probe hides the existing rotate-to-landscape prompt only to inspect canvas coverage; it does not change the game's landscape-play requirement. Existing desktop and touch relic controls, swaps, portals, result exports, and Lycanthrope controls pass. Build, browser-module parsing and Pages artifact checks pass.

Champion powers, scoring, stage opening requirements, and stored progress are unchanged by this boundary fix.
