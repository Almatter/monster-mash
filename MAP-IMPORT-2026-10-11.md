# User map import — 2026-10-11

Source: mana-abyss-v43.json
SHA-256: a6b33d4d70a2fee5a9cf2a863281c9b9088dca1f073d3d7655e6d2f4576a6f34

Applied all 3,357 painted sections and five additional foreground objects. Every painted section, shrine/connector floor boundary, object footprint and foreground outline is identical to the supplied export.

Supporting metadata alignment:
- Shrine altar metadata synchronized with the seven physical bases (three changed by the export).
- Archive interaction point moved from [692.5, 145.75] to [690.8108108108108, 148.4527027027027] master pixels to clear the edited altar footprint.
- Three guide points added at the narrow archive-fangs bend so the interpolated navigation guide stays on the authored floor. No floor was widened or erased.

Collision regenerated using tools/pack-realm-collision.mjs. Unit checks: 323 passed, including shrine connectivity, authored route sweeps, guardian confinement and foreground behavior. Historical foreground/gap test fixtures were updated for the user-authored geometry.

Browser validation: 76 audits passed. All 12 connectors traversed in both directions, plus seven shrine perimeter/altar approaches, using Devourer and Titan at desktop (1280×800) and mobile (844×390) sizes. Terrain cache remained within its 24-tile bound.
