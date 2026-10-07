# Hunt v33: material colors, Records and varied Colossus arrivals

## Final behavior

- Colossus chooses a random eligible cleared district, then a random authored pocket within it. The player’s district and every remaining captain’s district are excluded, as are pockets within 1,500 units of the player or 1,600 units of a captain. No unsafe fallback is used. The run seed makes the random choice reproducible; an identical captain order can produce different locations in different runs. Arrival timing, three-minute window, damage, health and rewards remain unchanged.
- Records show all unlocked stages regardless of selected scenario. Personal bests and persistent records start collapsed, with smaller expandable stage/nature/record sections. Feats are grouped by unlocked stage. Stage 1-only users cannot see Stage 2 records, feats or Reaper content. Historical ruleset bests remain available; manual endings remain stored without “Practice” rows.
- Sovereign has six material controls: armor, cloak, horns/metal trim, energy, face/skin and hair. Calamity has five, with all exposed arms/hands sharing the mask color independently of robes. Overlord has a fifth bone/skull color separate from metal trim. Reaper keeps independent fabric, twin tails and skin. Titan retains four controls.
- Sovereign, Calamity, Overlord and Titan use generated continuous material guides in all four art formats. Reaper’s existing guides now fill thin ink gaps using neighboring source color. Original drawings, shading, silhouettes, dimensions and animation transforms remain registered. Devourer’s existing art is retained. The guides are authoring sources only, never runtime assets.

## Compatibility

Stage 2 advances to `2026.10-v33-court-hunts` / `2026.10-v33-court-test` for changed encounter placement. The same 13,195,000 maximum and grading formula apply to both v32 and v33; v32 authenticated codes remain readable. Optional fifth/sixth palette fields retain all historical four-color identities. Existing version 3 profiles, title progress, Gatebreaker days and transfer files migrate by supplying missing material defaults. No progression reset or Stage 1 combat/scoring change is introduced.

## Validation

- Full logic suite: 233 passing tests (including the final all-pocket travel regression).
- Safe spawn coverage: all 3,990 pairs of surviving sites and player-pocket combinations; identical-order randomized placement and same-seed reproducibility; reachable terrain and remote encounter behavior.
- Slowest champion: 420 unopposed route pairs at Final Release Titan speed, maximum walking travel **61.18 seconds**. This excludes enemy avoidance, detours chosen by humans and combat; the encounter window remains 180 seconds.
- Desktop and mobile browser Records checks: collapsed defaults, Stage 1-only filtering, both unlocked stages from either scenario selection, preserved legacy bests and hidden practice rows without deleting stored runs.
- Color isolation: 20 art sets across five champions; every editable channel changes substantial intended coverage and zero pixels outside its mask. Creator swatches work without errors; Sovereign’s sixth control and three new fifth controls are present. Saved-card portrait composition is checked too.
- Mask validation: 24 art sets / 116 grayscale tint layers; registered dimensions, clipped transparency, complete animated frames and safe crop margins. Original bases retained.
- Existing browser checks: title/Gatebreaker visibility, result Grade/copy/PNG, immediate saved Records and restart, mobile art recovery and map occlusion.
- Production artifact routes, PWA scope and bounded art/terrain caches verified.

Generated guide provenance and exact prompts: [art-source/MATERIAL_REFINEMENT.md](art-source/MATERIAL_REFINEMENT.md). Rebuild using [tools/rebuild-character-art.ps1](tools/rebuild-character-art.ps1), or the two material-refinement scripts described there. Visual proofs and browser reports are in ignored `test-results/`.
