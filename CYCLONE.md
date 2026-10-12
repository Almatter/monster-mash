# Moonstrider Cyclone and guardian spell artwork

Built-in imagegen generated all three assets on October 11, 2026. Original alpha is preserved; the packing tool only resizes and encodes WebP. No drawn geometry substitutes for these effects.

Sources: art-source/vfx/cyclone/lycanthrope-cyclone.png, art-source/vfx/cyclone/lycanthrope-spin.png, art-source/vfx/cyclone/guardian-mana-burst.png.
Runtime: public/assets/vfx/lycanthrope-cyclone.webp, public/assets/vfx/lycanthrope-spin.webp, public/assets/stage3/guardian-mana-burst.webp. Each is 512 by 512 with transparency.

The spin windup lasts 0.55 seconds and permits slower movement. The cyclone advances along a locked direction, scatters small enemies once, and slows around heavy enemies while applying damage every 0.2 seconds. Range and width grow with Release; active cyclones are capped at three. It replaces Clinch in current base kits and altar rolls, while earlier Clinch run codes remain readable. Stage 2 captain and Colossus damage retain targeted scaling. Native cyclone damage exposes Stage 3 guardians. Borrowed cyclone does not count as another body's native power.

First press suggests a direction using visible groups and significant targets. Second press confirms on keyboard or touch; clicking/tapping the battlefield overrides it. Candidate evaluation is bounded to eighty nearby visible bodies and a small ray set. All wind art honors the player's power color and uses cached recoloring. The body plays its attack frames with a spin turn during the windup. Audio adds windup and launch cues.

Guardian spell warnings, shield, bolts, lunges and bashes use existing generated artwork. Burst/bombardment impacts now use the new crystalline mana asset. Stage preparation waits for required art; these effects have no placeholder shape fallback.

Each inscription stores its ability clue at run creation. Rendering makes the clue visible and brings it into view; later relic relocation cannot remove that clue. Tests cover all 35 current relic powers and both desktop/touch inscription dialogs.

## Original generation prompts

### tornado

Use case: stylized-concept. Asset type: transparent 2D action RPG combat sprite. Primary request: a powerful directional tornado launched by a swift wolf huntress's spinning kick. Show ONE compact upright conical cyclone of pale silver wind with curled cutting ribbons, layered translucent gusts, distinct detailed spiraling strokes, a bright moonlit core, wisps trailing toward the left, viewed from an elevated three-quarter game camera. It must read clearly at 140 pixels high over a detailed dungeon floor. Clean sharp painterly fantasy game art, elegant flowing wind, solid defined shading with translucent outskirts. Pale silver/white monochrome for runtime recoloring. Centered full effect with 15 percent empty margin, all wisps contained. No character, no landscape, no base disc, no flat geometric circle, no symbols, no text, no watermark. Genuinely transparent background.

### spin

Use case: stylized-concept. Asset type: transparent 2D action RPG windup effect sprite. Primary request: ONE dynamic spiraling burst of wind around a wolf huntress performing a spinning kick; depict only the cutting gusts, not a character. Elevated three-quarter game camera, open transparent center where the champion can be drawn. Several thick curved brushlike wind ribbons whipping into a rising corkscrew, varying heights, sharp layered edges, detailed pale moonlit silver-white shading, fine translucent wisps. It must read clearly at 180 pixels across on a dungeon floor. Fantasy painted combat VFX, not a simple ring or UI marker. Centered fully contained effect with ample empty margin. Monochrome silver and white suitable for runtime recoloring. No flat circles, no runes, no symbols, no text, no watermark. Genuinely transparent background.

### burst

Use case: stylized-concept. Asset type: transparent 2D action RPG guardian spell impact sprite. Primary request: ONE explosive mana bombardment impact cast by a shrine guardian, viewed from an elevated three-quarter game camera. Jagged blue-violet crystalline energy shoots upward from a luminous ruptured point, branching arcs lash outward, glowing shards and sweeping shock ribbons arranged in an irregular radial blast. Strong sharp painterly detail, dense bright center with dark violet shadow definition and translucent blue outskirts, readable at 160 pixels on a dungeon floor. Fully contained effect with 15 percent empty margin. No characters, no floor or landscape, no geometric circle, no symbols, no text, no watermark. Genuinely transparent background.

