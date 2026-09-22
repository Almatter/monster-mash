# Event-foundation audit

The vertical slice uses dependency-free TypeScript, native type stripping, Canvas 2D and Web Audio. Keep its fixed-step simulation, 1,100-enemy pool, 80-unit spatial buckets, 180-effect/projectile limits, seeded spawn tables, keyboard/pointer controls and static deployment.

Naming defect: index.html hardcodes the HUD and selection archetype heading; main.ts reads the editable name field again at finish. Capture a canonical, sanitized run identity at start and pass it to all presentation/serialization.

Cosmetics: player shapes and effects use literals in renderer.ts. Introduce four validated tint channels and cache supplied art at palette changes, never per frame.

Feats: six data-driven, repeatable score bonuses in scoring.ts, with cooldowns, stored only in the current Score object. They are not persistent achievements. Preserve their scoring and expose conditions/counts; add separate versioned local records with best-per-run progress and no stat rewards.

Combat: one hardcoded player and index-based powers in simulation.ts. First recreate that package as a legacy Sovereign definition; then introduce effect handlers and individually validate Titan, Devourer, Calamity and Overlord. Keep enemy behaviors and weekly tables intact.

Persistence currently stores only name, mute, shake and low FX. Migrate these preferences without requiring storage access. New profile data must validate field-by-field and tolerate corrupt/unknown schemas.

Risks: damage ownership across chains, healing caps, summon bounds, notification spam, persistent unlock duplication, real mobile layout, palette contrast, cache/version mismatches, and cross-archetype balance. Test mechanics separately before full-browser regression. No new illustration placeholders are needed; retain procedural fallback and specify a real layered-art contract.
