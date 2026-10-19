# Crucible final map proposal

Keep this work isolated from published Stage 4 until the prototype layout is approved.

## Geometry before illustration

Use the current 4,800 × 4,800 world-unit battlefield as the starting footprint, with the existing close camera. Lock base positions, lane widths and the central ring using editable terrain data. Overlay all eight champions, a full troop wave and the siege beast on every map section to validate clearance. Approve the blockout on PC and phone before commissioning finished art.

Author independent polygon layers for walkable ground, solid footprints, sight blockers, foreground occlusion, slowing terrain and hazards. Keep minion route nodes in the same document. The renderer, movement, targeting, fog and map editor must read this shared data; painted scenery must never silently determine collision.

## Suggested terrain

Place broken masonry, rock ridges and thorn walls between neighboring base spokes. Give each lane a broad, readable entrance rather than small collision choke points. These obstacles explain sight breaks and why armies use the road. Use low barriers that flight/leaps can cross only where there is a safe landing; tall walls still block vision.

Break the center into a wide circular road around a damaged ritual dais. Put slowing ash or caustic marsh in selected shortcuts, with visible safe gaps. Mobility gains alternate routes without making ordinary champions unable to reach any objective. Avoid constant damage hazards in mandatory lanes. Keep each base firing perimeter visibly distinct from its scenery.

The implemented terrain and subsequent tuning are described below.

## Art production

Generate one coherent master composition for perspective, palette and landmarks. Slice it into reference regions, then generate detailed tiles from those references and locked geometry guides. Do not simply upscale the master. Check each tile against the same champion overlays and align adjacent openings before accepting it.

Aim initially for two source pixels per world unit at the close camera. A 1,024-pixel tile then covers 512 world units. Use small overlapping gutters for edge sampling and inspect seams at game zoom. Adjust density after memory and phone tests rather than committing to a single enormous image.

Use opaque WebP ground tiles and transparent WebP props. Load only visible tiles plus a neighboring ring, evict distant decoded tiles within a bounded memory budget, and use a separate small overview image. A decoded 1,024-square RGBA tile is about 4 MiB, regardless of compressed download size. Target a modest visible/cache set and measure actual device memory. Cache static compositions; avoid repeated per-frame rescaling, masks and filters.

## Eight champion camps

Reuse assets/stage3/relic-<champion>.webp as each camp’s recognizable monument where available; create a matching Hag monument if absent. The champion relic itself represents the life crystal, centered on its platform. Surround it with modular champion-themed ground trim and props so randomized camp positions can reuse the same art. Keep guardian pads, shop access and the crystal attack perimeter clear. Decorative banners and tall props need separate foreground masks and sight footprints.

## Acceptance

Check world-space art alignment, seam continuity, safe landing points, minion routes, sight occlusion and projectile blocking. Test heavy combat on desktop and a real midrange phone. The map should increase atmosphere without adding per-frame terrain scans or raising the bounded unit counts.

Rendering reference: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas


## Implemented prototype

The Crucible prototype now uses 25 streamed 1024-pixel tiles (with sampling gutters), a 1200-square overview, and a 4800-square world. Sixteen independently generated detail sections build a 5120-square offline assembly. Actual source density is approximately 1.07 pixels/world unit, rather than the provisional 2-pixel target above. Only the nearby detail tiles decode during close play; the decoded cache is capped at 16 tiles on coarse-pointer devices and 24 on desktop. The huge assembly never loads in the browser.

The art includes eight camps, eight broad roads, the central plaza, nine stone footprints/sight blockers, and four slowing pools. Flight ignores low solids and slowing pools until landing. Map boundaries remain enforced. Native damage and skill limits are preserved.

Shared terrain compiles once into an 8-unit collision grid; old paint strokes do not run for every actor/frame. Independent sight polygons drive shared vision, fog shadows and ranged obstruction. Foreground silhouettes clip actors behind raised scenery and leave the controlled champion faintly visible. NPCs steer around footprints; minion centerlines retain their home/center/target routing. Base-loss rivals no longer wait for a replenishing escort.

Open test/map-editor.html?map=crucible to edit feet footprints, foreground, camp anchors, guardians, roads, slowing terrain, sight blockers and optional attrition terrain. Damage zones are lethal: the four caustic pools deal 180 HP/second and visible fires deal 220 HP/second to grounded mobile units. Flight avoids ground-contact hazards. Both damage and slowdown remain editable independently of walking. Map import bakes minion lane detours around static pools and fires once; champions retain cached terrain navigation. Marching minions perform no live hazard pathfinding, and displacement can still knock units into it. The camp defense outlines are independent of walkable ground. Moving a crystal marker moves its linked spawn points and guardians; moving an aligned rally updates route connections. Save/export remains explicit, so editing never changes the running match or the published Stage 4 scenario.

To apply an editor export:

    node tools/import-crucible-map.mjs path/to/export.json
    node tools/build.mjs

The import validates the eight camps, scale and usable spawn/guardian positions, then regenerates gameplay data and the editor document from the same export. To rebuild art from retained generated sources:

    python tools/pack-crucible-map.py

Use a Python environment with Pillow. The generation prompts and retained source-art locations are in art-source/crucible/prompts.md. Final assets are in public/assets/crucible/.

## Hazard and relic update

Camp anchors now align with the painted platform centers. The relic is the sole core sprite; its platform ward uses animated generated art. Guardians have animated foot auras, the center dais carries a slow chaos vortex above the fog overlay (a visible landmark that does not reveal hidden actors), and the painted braziers flicker through a cached emissive mask extracted from their existing map pixels. There are no independently positioned flame sprites. Ward, beam and chaos effects share small WebP textures; fire lighting uses a single cached overview-sized mask and opacity animation. The relic beam immediately hits the nearest intruder within the editable defense zone and prioritizes an attacker threatening its champion within that zone. It never targets neighboring stationary defenses.

Iron Will, Rooted Soul and Antivenom provide up to 60% reductions in control duration, displacement and poison duration respectively. They share the existing 16-rank budget and 80% resale rules. Timer resistance is applied once on application, not compounded every frame. Hazard kills use a recent five-second contribution window for attacker credit and otherwise award no self-kill.

Army orders check the actual road graph for an intervening living base approach, including routes leaving a captured camp. The correction is shared by the army. Mobile combat interruptions remain limited to adjacent enemies.

Scoring: troops 10,000; rival defeats 250,000; guardians 500,000; crystals 1,500,000; victory 30,000,000, multiplied by difficulty. A Normal victory therefore exceeds the current Stage 3 maximum of 25,950,000 even before combat and conquest rewards. Idle time grants no Dominance. This remains a prototype score preview, not a saved event score.

Minion navigation optimization: `tools/bake-crucible-routes.mjs` runs during map import. It moves unsafe lane anchors, adds safe detour waypoints with body clearance, and saves those centerlines to the editor and gameplay map. The lane graph is cached for the match. Minions follow it without scanning acid pools or recalculating hazard avoidance. Dynamic ability effects never alter these routes; knockback may still force troops into hazards. Damage/contact checks remain necessary while units stand in a hazard. Reimporting an unchanged map leaves its routes unchanged.

Scenery alignment correction: the four diagonal roads now use entrance waypoints along the painted paving. Fire contact footprints are 20-world-unit radius; their old larger footprints pushed the route baker unnecessarily toward neighboring scenery. Offline baking compares a smoothed local grid detour with the visibility-mesh detour, choosing the shorter valid route. Both approaches remain precomputed; minions still perform no live hazard navigation.
