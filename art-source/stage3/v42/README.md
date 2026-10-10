# Titan realm v42

Generated with the built-in image generation tool. No API or CLI image generation was used.

The master establishes one high-angle perspective and an elevated central arena, with seven lower courts and twelve winding or stair routes. The full-resolution sector generations use the nine overlapping master slices as references. The 418-pixel cores overlap by 32 master pixels. Each output is registered back into that crop; feathering is restricted to overlap bands. See prompt.txt for the design brief.

Shrines: Buried Court (Overlord coffins and ivy), Starless Archive (Calamity astral instruments), Fang Den (Devourer teeth and claw cuts), Shattered Foundry (Titan anvils and molten stone), Fallen Throne (Sovereign banners and royal masonry), Moon Crypt (Reaper lunar architecture), Moonfang Ravine (Lycanthrope overgrowth and a moonlit den).

Run node tools/pack-realm-v42.mjs to rebuild the overview and 400 streamed WebP chunks. The assembled PNG is derived and ignored. The 7.4 world-units/master-pixel scale leaves room for the unchanged champion sprites and release auras.

Walkable floor contours, altar footprints, clue posts and interaction positions are registered in src/realm-layout.ts against the final assembled image, rather than approximate capsules or the original sector bounds. Run node tools/pack-realm-collision.mjs after changing these contours. The clearance field is computed offline; only nearby artwork is decoded, with a 24-tile cache.

The transparent generated encounter-wall ribbon is packed to public/assets/stage3/encounter-wall-v42.webp. Its runtime segments follow the exact Titan engagement ellipse and the guardian court contours; it replaces the old oversized planar door.

Visual QA: tests/realm-v42-scale-browser.mjs compares all seven champions with release auras on each of the nine generated pieces. tests/realm-edge-browser.mjs checks terrain coverage and bounded caches in desktop, mobile landscape and mobile portrait viewports.
