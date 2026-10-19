# Crucible final map proposal

Keep this work isolated from published Stage 4 until the prototype layout is approved.

## Geometry before illustration

Use the current 4,800 × 4,800 world-unit battlefield as the starting footprint, with the existing close camera. Lock base positions, lane widths and the central ring using editable terrain data. Overlay all eight champions, a full troop wave and the siege beast on every map section to validate clearance. Approve the blockout on PC and phone before commissioning finished art.

Author independent polygon layers for walkable ground, solid footprints, sight blockers, foreground occlusion, slowing terrain and hazards. Keep minion route nodes in the same document. The renderer, movement, targeting, fog and map editor must read this shared data; painted scenery must never silently determine collision.

## Suggested terrain

Place broken masonry, rock ridges and thorn walls between neighboring base spokes. Give each lane a broad, readable entrance rather than small collision choke points. These obstacles explain sight breaks and why armies use the road. Use low barriers that flight/leaps can cross only where there is a safe landing; tall walls still block vision.

Break the center into a wide circular road around a damaged ritual dais. Put slowing ash or caustic marsh in selected shortcuts, with visible safe gaps. Mobility gains alternate routes without making ordinary champions unable to reach any objective. Avoid constant damage hazards in mandatory lanes. Keep each base firing perimeter visibly distinct from its scenery.

The prototype currently has no such final terrain; these are proposed geometry changes, not decorative-only additions.

## Art production

Generate one coherent master composition for perspective, palette and landmarks. Slice it into reference regions, then generate detailed tiles from those references and locked geometry guides. Do not simply upscale the master. Check each tile against the same champion overlays and align adjacent openings before accepting it.

Aim initially for two source pixels per world unit at the close camera. A 1,024-pixel tile then covers 512 world units. Use small overlapping gutters for edge sampling and inspect seams at game zoom. Adjust density after memory and phone tests rather than committing to a single enormous image.

Use opaque WebP ground tiles and transparent WebP props. Load only visible tiles plus a neighboring ring, evict distant decoded tiles within a bounded memory budget, and use a separate small overview image. A decoded 1,024-square RGBA tile is about 4 MiB, regardless of compressed download size. Target a modest visible/cache set and measure actual device memory. Cache static compositions; avoid repeated per-frame rescaling, masks and filters.

## Eight champion camps

Reuse assets/stage3/relic-<champion>.webp as each camp’s recognizable monument where available; create a matching Hag monument if absent. Put the life crystal on a separate readable socket. Surround it with modular champion-themed ground trim and props so randomized camp positions can reuse the same art. Keep guardian pads, shop access and the crystal attack perimeter clear. Decorative banners and tall props need separate foreground masks and sight footprints.

## Acceptance

Check world-space art alignment, seam continuity, safe landing points, minion routes, sight occlusion and projectile blocking. Test heavy combat on desktop and a real midrange phone. The map should increase atmosphere without adding per-frame terrain scans or raising the bounded unit counts.

Rendering reference: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas


## Implemented prototype

The Crucible prototype now uses 25 streamed 1024-pixel tiles (with sampling gutters), a 1200-square overview, and a 4800-square world. Sixteen independently generated detail sections build a 5120-square offline assembly. Actual source density is approximately 1.07 pixels/world unit, rather than the provisional 2-pixel target above. Only the nearby detail tiles decode during close play; the decoded cache is capped at 16 tiles on coarse-pointer devices and 24 on desktop. The huge assembly never loads in the browser.

The art includes eight camps, eight broad roads, the central plaza, nine stone footprints/sight blockers, and four slowing pools. Flight ignores low solids and slowing pools until landing. Map boundaries remain enforced. Native damage and skill limits are preserved.

Shared terrain compiles once into an 8-unit collision grid; old paint strokes do not run for every actor/frame. Independent sight polygons drive shared vision, fog shadows and ranged obstruction. Foreground silhouettes clip actors behind raised scenery and leave the controlled champion faintly visible. NPCs steer around footprints; minion centerlines retain their home/center/target routing. Base-loss rivals no longer wait for a replenishing escort.

Open test/map-editor.html?map=crucible to edit feet footprints, foreground, camp anchors, guardians, roads, slowing terrain, sight blockers and optional attrition terrain. Attrition zones are deliberately nonlethal (minimum 1 HP); no damage zones are placed by default. The camp defense outlines are independent of walkable ground. Moving a crystal marker moves its linked spawn points and guardians; moving an aligned rally updates route connections. Save/export remains explicit, so editing never changes the running match or the published Stage 4 scenario.

To apply an editor export:

    node tools/import-crucible-map.mjs path/to/export.json
    node tools/build.mjs

The import validates the eight camps, scale and usable spawn/guardian positions, then regenerates gameplay data and the editor document from the same export. To rebuild art from retained generated sources:

    python tools/pack-crucible-map.py

Use a Python environment with Pillow. The generation prompts and retained source-art locations are in art-source/crucible/prompts.md. Final assets are in public/assets/crucible/.
