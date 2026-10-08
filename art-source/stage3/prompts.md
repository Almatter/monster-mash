# Stage 3 production-art provenance

Created with the built-in ImageGen tool during the October 8, 2026 Stage 3 implementation. These are original production scene/sprite sources, not layout placeholders. Briefs below describe the requested content and consistent art direction; they are editorial records rather than verbatim tool transcripts.

Shared direction: Monster Mash medieval fantasy isekai anime; deepest underground mana birthplace, blue-charcoal slate, turquoise/violet mana, ancient ruined stone, cohesive diffuse upper-left illumination. Floors and structures use a playable overhead view. Sprites use the game's readable illustrated character perspective. No text, labels, UI, grids or baked characters on terrain.

| Source | Requested content |
|---|---|
| `floor.png` | Seamless dark rough subterranean slate floor, restrained crystalline mana veins and weathered stone. Opaque, square. |
| `passage.png` | Seamless traversable blue-charcoal slate, faint turquoise veins, scattered purple glints and moss, brighter than surrounding rock. Opaque, square. |
| `arena.png` | Ancient circular mana titan court, four open cardinal entrances, a broad empty fight floor, ornate stone seal, ruined rocky boundary and mana crystals. True overhead square sector. |
| `grotto.png` | Ruined mana shrine with a bottom entrance, open walkable court, altar on the upper wall, irregular stone/crystal sides, lighting matching the arena. True overhead square sector. Relic ornaments remain separate. |
| `titan-parts.png` | Six compatible transparent cutouts in a two-column, three-row atlas: a monumental headless armored titan body, skull/helmet/crowned heads, and spike/crystal mantles. Shared proportions and light direction; restrained neutral shading suitable for runtime tinting. |
| `relics.png` | Eight transparent illustrated floating relic ornaments in a four-column, two-row atlas: mysterious, Overlord, Calamity, Devourer, Titan, Sovereign, Reaper, dormant. Distinct silhouettes reflecting each nature, detailed mana energy and no lettering. |
| `servants.png` | Three transparent titan-servant cutouts: armored guardian, mana acolyte and crystalline shardhound. A readable medieval fantasy anime enemy family rather than generic silhouettes. |
| `effects.png` | Four transparent illustrated mana effects in a two-column, two-row atlas: arena barrier seal, eruption impact, hostile bolt and defense-breaking burst. Crisp energy detail, true alpha, no ground rectangles or labels. |

Original generated files are preserved alongside this document. `tools/pack-stage3-art.mjs` extracts atlas cells, normalizes transparent relic/effect margins, scales and compresses WebP assets, then bakes the arena and seven grotto sectors over the authored lane layout. The passage mask only composites generated stone textures; it is not visible test geometry. Feathered sector edges prevent hard texture seams. The output is `public/assets/stage3/` with 100 streamed map sections and 21 sprite/effect assets, plus a small floor tile and manifest. `layout-overview.png` is a developer preview of the completed composition.

Titan parts keep their authored alignment margins for deterministic assembly. Appearance changes recompose the tinted parts once; clients do not process the entire terrain image at runtime. All source alpha was checked before packing.
