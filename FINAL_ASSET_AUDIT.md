# Monster Mash final-asset audit

## Attack checklist

| Source | Abilities / attack path | Production visual | Status |
|---|---|---|---|
| Sovereign | Basic cleave; Rupture, Devour, Death Beam, Catastrophe | Generated cursed crown / spectral chains texture, expanding impact, inward devour, repeated beam stamps | Replaced |
| Titan | Basic impact; World Breaker, Iron Stampede, Kingfall Throw, Heavenfall Cataclysm; thrown debris | Original shattered-basalt / amber fissure texture, weighted radial scale, small rotating fragments | Replaced |
| Devourer | Basic claw; Riftfang Lunge, Maw of Ruin, Royal Execution, Feast of the Unbound | Original fanged flesh-rend texture, fast angled lunge and inward maw motion | Replaced |
| Calamity | Ranged basic; Oblivion Ray, Starfall Verdict, Event Horizon, Crimson Catastrophe | Original unstable arcane rupture texture, spinning bolt, beam stamps, field texture and detonation | Replaced |
| Overlord | Ranged basic; Tyrant's Command, Plague of Crowns, Graveborn Legion, Absolute Dominion | Original skeletal crown / green spectral command texture, ritual scaling and field motion | Replaced |
| Hex Spitter | Basic hostile ranged attack | Small original violet bone-hex thorn, rotated to velocity; fixed hostile hue and silhouette | Replaced |
| Blood Herald | Elite windup and area slam | Original blood-seal strike texture plus unchanged red warning radius | Replaced |
| Hollow King | Titan windup and area slam | Original red fault / bone-crown cataclysm texture plus unchanged red warning radius | Replaced |
| Thrall, Hound, Wing, Brute | Contact attacks | Original enemy sprite bodies and proximity hit presentation; no separate projectile in the simulation | Audited |
| Arena torches | Eight fixtures around ritual floor | Original illustrated stone-and-iron brazier with small animated flame glow | Replaced |

All 20 ability buttons use unique project-authored SVG paths in `src/ability-icons.ts`. They contain no stock raster or sample images; their compact shapes remain legible at button size, so no icon replacement was needed. Enemy telegraph rings and health bars remain simple geometric UI overlays for clear timing and threat readability. Procedural art paths remain available only if a real texture load fails.

All five lead effects, both hostile slam effects, and the arena brazier were generated as original transparent illustrations with OpenAI image generation; the small, high-frequency hostile bolt is original project-authored vector art. Source masters are retained under `art-source/vfx/` and `art-source/arena/`. Run `tools/pack-vfx.ps1` to rebuild the nine compressed WebP assets. All eight effect files total about 550 KiB; the brazier is about 24 KiB.

The character mask defect came from hard `x/y` face-exclusion rectangles in every `tools/process-*-art.mjs` generator and Titan's secondary classifier. Those produced a sharp mask boundary across organic anatomy. The revised generators use a soft elliptical neutral-face preserve and keep complete original art in the base layer. The compositor draws base first, then shaded alpha tint channels. A clipping pass bounds mask alpha by base alpha. `tools/validate-masks.mjs` validates every emitted channel; `art-lab.html` can display isolated mask channels over the base.

No physical phone, headphone, or speaker was available through this environment. Desktop/mobile viewport browser tests, 12-minute simulated game soak, cache-offline/update tests, and crowded-scene rendering profiles are software checks rather than physical-device thermal or listening results. Finished music files remain the launch asset dependency; exact original-generation prompts and integration instructions are in `AUDIO_ASSET_SPEC.md`.
