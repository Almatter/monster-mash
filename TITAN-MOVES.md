# Titan defense-break repertoire

Implemented October 12, 2026. Base: Ruin Rush, Continental Cleave and Mana Eruption. First breach adds Mana Lance; second adds Sundering Cross; third adds Orbiting Blades; fourth adds Heavenfall Leap. The newly learned move is demonstrated on the next attack, then joins the full rotation. Immediate repeats are skipped. Resetting the fight restores the original three-move pool and clears persistent hazards.

Mana Lance locks a narrow firing lane with 1.15 seconds of warning. Sundering Cross warns three diverging ground rifts for 1.3 seconds before they persist for two seconds. Orbiting Blades warns four blades for 1.15 seconds; they then orbit the Titan's original position for 2.4 seconds with swept collision. Heavenfall warns a locked landing area for 1.35 seconds and visibly travels through a 0.6-second leap before landing. Warnings snapshot their footprint. Existing health (190,000), speed escalation and score pools remain in place. At most twelve extra hazards can exist; their visuals are clipped to the Titan's authored arena.

Four original images generated using the built-in imagegen tool, not the CLI. Alpha preserved and packed to WebP using tools/pack-titan-moves.mjs. Original art-source/stage3/titan-moves/{lance,rift,blade,leap}.png. Runtime paths:

- public/assets/stage3/titan-lance.webp
- public/assets/stage3/titan-rift.webp
- public/assets/stage3/titan-blade.webp
- public/assets/stage3/titan-leap.webp

The move assets and existing generated warning artwork render above champion auras; no procedural placeholder attack shapes are used. The arena clipping path is cached, and required sprites decode before play.

Imported C:/Users/novam/Downloads/mana-abyss-v43 (1).json with tools/apply-realm-map.mjs. All validated exported geometry is retained verbatim in src/realm-map-data.ts, including rooms, decks, structures, painted areas, guardian/Titan zones and portal interaction points. Collision was compiled to the 5-pixel clearance field, keeping painted-layer evaluation out of gameplay. Local standing-position resolution now queries this compiled floor rather than approximating edited floor with old outlines; a bounded cache avoids repeated searches. Routing verifies walkable approaches within 80 units of every altar marker (the real interaction reach is 240), rather than requiring the champion to stand on a marker inside scenery.

Verification: tests/realm-titan-moves.test.mjs, tests/realm-titan-pressure.test.mjs, all shrine-pair swept movement, desktop/touch art and fight checks, portal recovery and inscription checks, full unit suite and production artifact checks.

## Original generation prompts

### lance

Use case: stylized-concept. Asset type: production transparent 2D fantasy action RPG combat VFX for a mana-born Titan in an underground ruin. Sharp detailed painterly art, readable at small game scale, luminous silver-violet mana with blue-white highlights and dark violet edge definition, translucent wisps, no environment, no character, no text, no lettering, no watermark, no flat geometric UI shapes. Fully contained effect with empty margin on a genuinely transparent background. ONE elongated HORIZONTAL magical energy lance firing from LEFT to RIGHT. Several braided streams of thick mana converge into a fierce pointed tip at the right, with branching fine lightning and a flowing wake to the left. Wide landscape composition. Avoid any impact bloom or circle. The whole continuous horizontal beam is visible.

### rift

Use case: stylized-concept. Asset type: production transparent 2D fantasy action RPG combat VFX for a mana-born Titan in an underground ruin. Sharp detailed painterly art, readable at small game scale, luminous silver-violet mana with blue-white highlights and dark violet edge definition, translucent wisps, no environment, no character, no text, no lettering, no watermark, no flat geometric UI shapes. Fully contained effect with empty margin on a genuinely transparent background. ONE elongated HORIZONTAL ground rupture of dark jagged stone teeth and broken pale slabs, with brilliant violet mana erupting along the crack and branching arcs rising a little above it. Elevated three-quarter view, entire crack visible from left to right, wide landscape composition. No floor beyond the isolated magical fault line. Its dangerous center reads as a sharply defined continuous strip.

### blade

Use case: stylized-concept. Asset type: production transparent 2D fantasy action RPG combat VFX for a mana-born Titan in an underground ruin. Sharp detailed painterly art, readable at small game scale, luminous silver-violet mana with blue-white highlights and dark violet edge definition, translucent wisps, no environment, no character, no text, no lettering, no watermark, no flat geometric UI shapes. Fully contained effect with empty margin on a genuinely transparent background. ONE large curved floating crescent blade made of luminous violet crystalline stone and pale sharpened mana, with dark sculpted facets and tiny fracture lines. A compact slash wake trails behind the crescent. Elevated three-quarter game view, centered square composition. No circular disc, no runes. It is an actual readable magical cutting blade.

### leap

Use case: stylized-concept. Asset type: production transparent 2D fantasy action RPG combat VFX for a mana-born Titan in an underground ruin. Sharp detailed painterly art, readable at small game scale, luminous silver-violet mana with blue-white highlights and dark violet edge definition, translucent wisps, no environment, no character, no text, no lettering, no watermark, no flat geometric UI shapes. Fully contained effect with empty margin on a genuinely transparent background. ONE massive magical landing impact from a Titan leaping down into a ruin: heavy shards of pale stone flying outward and a crown of jagged violet mana spikes erupting upward, short radiating curved shock ribbons and wisps. Elevated three-quarter game view, square composition, bright center and distinct dark shadowed stone shards. No flat disc, no solid floor, no rings.

