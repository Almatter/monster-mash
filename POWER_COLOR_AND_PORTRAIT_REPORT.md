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

## Follow-up: magical remains and cached Stage 2 clients

Vortex now trails generated gravity wisps behind recognizable creature sprites. Defeated prey retain their creature art while tumbling, instead of every champion reusing Titan's rocky effect. Calamity's Vortex deaths use gravity wisps; caster blast, meteor and beam deaths use generated arcane disintegration fragments. The new sprites follow the chosen power color with alpha and highlights retained. Death-art metadata does not change existing damage, velocities, collision projectiles, scoring or RNG. Particle art is 192px; visible pull wisps are capped at 24 (8 with reduced FX), drawn death bursts at 64 (12 with reduced FX), and existing debris/effect pool ceilings remain 80/180.

A fresh visit now loads a build-versioned `boot.js`, which checks and activates a waiting worker before loading the module graph. This closes a race in which an older worker supplied its cached renderer while a player started a match, causing safe update deferral to preserve old effect colors for that run. The check is bounded at 12 seconds and permits cached/offline startup when it cannot complete. Already-running matches still keep their normal safe update behavior. Saves are never cleared.

Validation: 237 logic tests pass. A deliberately installed legacy renderer reproduced the stale-color condition; opening Stage 2 replaced it before controls became usable, and real Titan selection/start showed the chosen pink aura. Cache cleanup and offline Stage 2 reload pass, as does the existing ordinary-worker update test. Forty-eight render cases cover all six champions, both stages, two colors and both FX settings; all auras and attacks follow power color. The 180-effect/80-debris particle stress fixture measured 4.2ms at the 95th percentile for draw work. The expanded asset check covers 34 champion VFX assets and keeps hostile/navigation art unchanged. Desktop/mobile Calamity controls and exact result/PNG portraits still pass. Production packaging validates 739 files.

Generated particle sources and built-in imagegen prompts: [MAGIC_PARTICLE_PROMPTS.md](art-source/vfx/MAGIC_PARTICLE_PROMPTS.md). Rebuild with `node tools/pack-magic-particles.mjs`. Browser evidence: `test-results/stage-two-power-art.json` and the existing color/control reports.
