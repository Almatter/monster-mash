# Stage 3 v36 generated art

Generated with the built-in ImageGen tool. These are original production illustrations, not prototype shapes. All five assets use transparent backgrounds. Preserve their painted detail and irregular edges when packing.

## Portal

An isolated magical teleport for an underground medieval fantasy isekai anime ruin. Overhead three-quarter game perspective; dark obsidian and antique gold dais, seven violet gemstones, a vertical cyan-violet swirling mana aperture. Sharp hand-painted ink and textured stone, readable at gameplay size, no text or interface, transparent background.

Source: `portal-v36.png`. Runtime: `public/assets/stage3/portal.webp`.

## Sealed gate

A wide magical gate sealing a ruined stone bridge in a deepest underground mana realm. Gothic obsidian pillars and antique gold lintel with a luminous violet-cyan magical curtain between them. Medieval fantasy isekai anime game illustration, strong architectural silhouette, detailed painted stone and runes, isolated on transparent background, no text.

Source: `sealed-gate-v36.png`. Runtime: `public/assets/stage3/sealed-gate.webp`.

## Titan warning

An overhead titan attack telegraph made of jagged obsidian runes, a coral-white luminous seal and antique gold radial marks. A clear transparent center and irregular painted outer edge. The shape must be readable against blue stone and violet mana; actual anime fantasy spell artwork rather than a plain geometric outline. Isolated on transparent background, no text.

Source: `warning-v36.png`. Runtime: `public/assets/stage3/warning.webp`.

## Lunar landing

An overhead heroic werewolf landing impact: a lunar shockwave, broken crater chips and spectral claw streaks, white-violet energy, detailed hand-painted anime isekai effects. Irregular readable silhouette, transparent center and background, no character, no text.

Source: `landing-v36.png`. Runtime: `public/assets/stage3/landing.webp` and `public/assets/vfx/lycanthrope-landing.webp`.

## Mana mist

A wide roughly six-to-one ribbon of irregular cyan-violet magical mist, obsidian shards, motes and faint runes for an underground anime fantasy mana ruin. Delicate transparent edges and open spaces, no rectangular opaque backdrop, no text. Suitable for veiling scene joins and shrouding the exterior of a map.

Source: `mist-v36.png`. Runtime: `public/assets/stage3/mist.webp`, baked into `public/assets/stage3/map-v36/`.

## Packing

`node tools/pack-realm-v36.mjs` trims and scales these assets, composes the nine original sectors, bakes the mist, and exports 100 streamed WebP tiles. It uses the existing bundled Sharp runtime. The full-resolution illustration is never decoded into one giant gameplay canvas. `layout-v36-overview.png` is an authoring overview.
