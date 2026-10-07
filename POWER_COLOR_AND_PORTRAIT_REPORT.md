# Champion power colors, portraits and placement — October 7, 2026

## Changes

- Result and Monster Records portraits use only completed compositions. Previously, the display drew the progressive base canvas, which was later recolored in place; its unchanged object identity prevented a redraw. Result portraits and PNG exports now use the finished run's identity and colors. Run preparation also waits for the completed gameplay palette, avoiding a previous design briefly carrying into a new match.
- All 32 champion-owned VFX assets follow the chosen power color: basics, bolts, beams, ability effects, unbound auras, wards, Overlord control/corruption brands and Devourer claw waves. Shading, transparency, ink detail and bright highlights remain. Titan fissure retains dark stone beneath its colored energy.
- Tinting happens once per asset/color and uses a bounded 16-entry LRU cache. Enemy attacks, hit feedback, shrine/navigation art and captain/Colossus warnings are excluded. Generated champion art remains visible with reduced FX; beams use fewer illustrated segments in that setting.
- Calamity's Starfall and Vortex suggest legal visible positions, prioritizing major threats and then clusters. Repeating the ability button/key confirms. Pointer placement and cancel remain available. Suggestions never expose distant captain locations or spend cooldowns before confirmation.
- Stage 1 elites and Titans use generated transparent thorn-sigil/crown-fracture warning art instead of the filled placeholder circles. Existing generated impact sprites remain. The thin exact-radius outline is retained for honest hazard boundaries.

No damage, sustain, enemy timing, hitboxes, score rules, unlock conditions or profile schema changed. Existing rulesets and historical run codes remain intact.

## Validation

- 236 logic tests pass, including power ownership, shading/alpha preservation, legal smart placement, profile/transfer and historical run validation.
- Desktop Stage 1 and mobile Stage 2: repeated-key/tap confirmation, updated suggested target, manual placement and cancel pass. Delayed portrait-mask loading cannot expose an unfinished portrait. Both displayed portrait and exported PNG have zero differing pixels against the completed composition at their respective render sizes.
- All 32 champion assets change with two different power palettes; eight hostile/navigation assets remain unchanged. Both Stage 1 warning and impact sprites are actually drawn, including Low FX. Tint cache stays at 16 entries.
- Existing Reaper/Titan desktop and touch controls, unlock timing, kit persistence and restart pass. The older browser test was updated to expect retired runs to remain stored but hidden from Personal Bests, matching the preceding deployment.
- Heavy Stage 1 draw fixture (500 enemies, 100 projectiles, 80 effects): 95th-percentile draw work 4.3 ms desktop / 2.7 ms mobile viewport; character caches remain bounded at four compositions/six source images.
- Simulated mobile Stage 2 at 4× CPU throttling with 200 enemies: no page errors or terrain-load failures, 24-tile cache ceiling, consistent 912,000-unit view area. This checks the desktop browser's mobile simulation, not a guarantee for every physical phone.
- Production packaging validates both GitHub Pages endpoints and PWA scope (736 files).

Browser evidence is in ignored `test-results/power-effects.json`, `calamity-results.json`, their PNGs, and the mobile performance report. Generated sources/prompts and rebuilding instructions: [HOSTILE_WARNING_PROMPTS.md](art-source/vfx/HOSTILE_WARNING_PROMPTS.md), `node tools/pack-hostile-warnings.mjs`.
