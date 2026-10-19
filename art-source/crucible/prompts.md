# Generated artwork provenance

Tool: built-in image_gen. No fallback API or synthetic scenery was used.

## Master

Reference 1: the geometry guide drawn from the eight-camp layout. Reference 2: the existing Stage 4 overview, used only for its painting/material style.

Prompt: Finished overhead square gothic fantasy ritual battlefield. Preserve the exact guide composition: eight equal empty round camp platforms at compass and diagonal positions, broad straight roads to a large central circular plaza, eight low ruined stone ridges between roads, a small broken central dais, four flat caustic pools, and an outer low gothic rim. Strict orthographic ground with no perspective skew. Roads and camp interiors stay unobstructed. Inter-road areas are traversable worn ash earth with sparse short red foliage, not chasms. Sharp cracked slate paving, weathered bronze, restrained purple slate and antique gold, crimson thorn accents. No characters, crystals, labels, UI, or team colors.

The generated master is retained as master.webp. Its 16 exact crops were used as references for separate generation calls.

## Detailed regions (one call per cell, x=0..3, y=0..3)

Prompt template: Production game ground tile (x,y) of a 4 by 4 gothic battlefield. This input is the exact crop of an approved master. Regenerate at the highest available square resolution with crisp finely resolved stone and foliage detail suitable for close gameplay. Keep the input's exact overhead composition, silhouettes, boundaries, positions and scale: do not redesign or reframe, add buildings, add obstacles, or change openings. Every circle, road, camp platform, ridge, low wall and caustic pool must remain at its existing location. The outer 5% must match the reference in color and composition so adjacent tiles join. Elaborate surface texture with small cracked slate paving, weathered bronze, coarse rubble, sparse crimson thorn leaves, moss and muted torchlight. Keep empty camp platforms clear, roads wide, flat and open. No characters, crystals, text, labels, UI, blur or depth of field.

Lossless generated region sources are in sectors/x-y.webp. The packer feathers the shared master boundaries into the detailed sections, assembles a 5120-square image, and slices it into 25 1024-square tiles with two-pixel sampling gutters. This is a regenerated detail assembly, not a stretched master. The source density is approximately 1.07 pixels per world unit; the earlier 2-pixel target was provisional. A low-resolution overview is used only for full-map view and while detail tiles load.

## Hag monument

Reference: Hag selection artwork for its brass-circle and venom-glass design language.

Prompt: A compact low ornate bronze cauldron pedestal holding a round green-glass venom orb surrounded by concentric gold rings and short red-black thorn roots, very faint wisps above. Elevated three-quarter game camera, centered complete silhouette, restrained glow, sharp clean outlines matching hand-painted fantasy sprites. No woman, letters, labels, frame or square background. Genuine alpha transparency.

Final asset: public/assets/crucible/relic-hag.webp. Other camps reuse their existing Stage 3 relic sprites.

## Animated battlefield effects

Generated with the built-in imagegen tool, transparent backgrounds, 2026-10-18. Retained lossless sources: chaos.webp, aura.webp, fire.webp, beam.webp. Runtime variants are at most 512 pixels and share textures across the battlefield.

Chaos: overhead ethereal deep violet-black wisps around a luminous amethyst fractured energy heart, faint teal sparks, floating arcane fragments; no environment or text.
Aura: overhead silver-white and pale-cyan smoky circular ward filaments, transparent interior, wispy flames and rune fragments at the circumference, neutral pale colors for team tinting.
Fire: orange-gold magical flame plume with a compact ember heart, sparks and red wisps, slightly elevated isometric perspective, no brazier or environment.
Beam: horizontal white-core laser threaded with cyan and lavender energy, narrow wispy fringes and focal flares, transparent above and below for stretching from relic to target.
