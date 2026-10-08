# Stage 3: TITAN — v35 tester build

Built October 8, 2026. The Mana Abyss is a relic and defense puzzle with a central titan encounter.

## Play and access

- Shared tester: https://almatter.github.io/monster-mash/test/
- Local: http://127.0.0.1:4173/test/
- /stage2-test/ and /stage3-test/ remain aliases. Stages 1–3 and all seven champions are available to testers. Stage 4 remains unavailable.
- PC: WASD/arrows; Q/E/R/Space or 1–4. Placement powers suggest a target; press again to confirm or click a different placement.
- Mobile: thumb stick and power buttons; tap again to accept a suggested target or tap the battlefield. The targeting label allows battlefield taps through; Cancel remains interactive.

Official Stage 1/2 saves and rules remain intact. Tester runs retain the separate mm-stage2-test-* progress namespace. Official Stage 3 remains unavailable until its readiness flag is enabled; its October 15 opening and Ashen Gatebreaker requirement remain unchanged. Lycanthrope is concealed until Stage 3 access, then playable in all three stages.

## Expedition and powers

Seven distinct grottos surround the central arena: an ossuary, library, root chapel, forge, cistern, observatory and bell ruin. Visible connecting bridges and stairs lead onto playable floor; chasms and ruined structures define the boundaries. Navigation and collision share the floor footprint. Moonstrider Vault crosses gaps but must land on safe floor inside the map.

Each grotto has three guardians with original, distinct art: an obsidian sentinel, floating rune seer and crystalline fang beast. Their attacks include warned slams, lunges and projectile spreads. A native core ability exposes their ward for five seconds. Basic attacks and foreign powers cannot finish a warded guardian, making retained native powers useful while exploring. A cleared grotto grants recovery and a place to restore native powers.

Every nature contributes a new fifth power: Soul Writ, Prism Collapse, Blood Thread, Graviton Seal, Spellsteel Reversal, Soul Orbit and Moonrend. Seven relic locations and the titan's four required natures are shuffled each run. Native core abilities cannot open the titan's defenses. Altar powers can; after a defense opens, ordinary damage can finish that health quarter. Each fifth power offers bounded recovery, protection or both, so all four-power solutions have access to sustain.

Relics remain mysterious until claimed. Their power then decorates the shrine. Equip a discovered relic only at its home grotto; other discovered relics show where to return. Restore native powers at any cleared grotto. The champion retains its body, basic attack, health, armor and movement; traits follow equipped natures. Titan retains Fissure in Stage 3, including after restoring his native kit.

Visual clues indicate the current defense. No weakness sequence is stored as an answer sheet in results or run codes. The titan uses overlapping warned eruptions and punishing melee. Its arena boundary prevents attacks across it in either direction. Three seconds outside resets all titan health and defenses; relic discoveries remain. Defense rewards are paid once per run.

## Lycanthrope

The seventh champion has Moonstrider Vault, Howl of the Pale Moon, Fang and Fury, and Bloodmoon Reign. Her modest continuous Moonblood regeneration rewards mobility and fear for recovery time. Guardians, captains and titans resist fear. Bloodmoon Reign chains through different visible enemies, prioritizing major threats at the beginning of each pass; it cannot extend beyond its initial visible battlefield.

Original generated art includes selection, portrait, cut-in, five motion states and eight effects. Five independent material controls cover cloth, fur/hair, metal/claws, energy and skin. Continuous masks preserve ink, shadows and detail. Browser pixel checks confirmed that changing one material never changes unrelated pixels in all four asset formats. Combat effects fade and remain translucent enough to see the character.

Her Stage 2 vault and claw burst break guard protection. Stage 2 melee burst tuning compensates for attacks spent on travel and surrounding troops. These changes only affect the new champion's attack sources.

## Records, titles and passage

Stage 1 gains four explicit persistent milestones alongside its existing shared records. Stage 3 gains guardian, seven-grotto, seven-relic, defense, victory, clean-victory and insight records. Existing IDs and earned progress are retained. Each champion has three new Stage 3 titles; Lycanthrope also has native mastery and Stage 2 hunt titles. Later-stage content stays hidden until its stage is accessible.

Stage 3 feats reward preparation, first-trial insight, adapting to four different natures, and winning without a reset. All champions can earn them. Results, saved cards and copied summaries include them. Objective Dominance pays 700,000 per cleared grotto, 600,000 per defeated health quarter, and 3,200,000 for victory. Ordinary combat is capped at 200,000; brain feats add at most 1,580,000. There is no speed reward or Stage 1 feat farming.

The Deep Gatebreaker prepares Stage 4 access: eight completed Stage 3 challenges, three victories without resetting, and all seven different altar powers used to open defenses across completed challenges, with one champion. Unlimited qualifying runs per day. The seven powers accumulate across runs, not within one four-slot loadout. Stage 4 remains unavailable until its map is ready, its title is earned and its October 22 opening arrives.

## Art, music and performance

Nine fully generated adjoining ruin sectors replace painted connecting textures. They include stairs, raised ruins, bridges and chasms. The map is composed offline into 100 WebP sections of 512 pixels. Mobile retains at most 24 decoded terrain sections; desktop 32. Four concurrent decodes, prefetch and a loading pause prevent entering unloaded terrain. Clients never assemble a giant full-map canvas.

Five lesser servant types provide varied enemies for Overlord. Common enemies are capped at 48, the total crowd at 64, and warning zones at 12. Guardian arrivals retire distant common enemies if they need seats. Navigation uses cached flow fields. Scene art is only prepared for Stage 3.

TITAN has a new original procedural score: drifting suspended harmony, inharmonic bells and displaced 3+2+3 pulses, with sparse space for combat warnings. Its seven-stem loop is generated in the music worker with bounded buffers. Changing stages refreshes the theme even when both use the combat state. Lycanthrope has her own pursuit theme and howl/tear effects.

Built-in ImageGen produced original illustrations and material guides. Images and exact prompts are saved in art-source/lycanthrope/PROMPTS.md, art-source/stage3/sectors/PROMPTS.md, and art-source/stage3/v35-prompts.md. Deterministic packing crops sprites, resizes art and builds shaded masks. Authoring floor plans are never used as gameplay scenery. Devourer's result and record portrait canvases now use the full 512-pixel portrait resolution.

## Verification and pacing

- 271 regression tests pass, including historical codes, idempotent progress, hidden content, seven native/fifth-power loadouts, legal gap landings and strict crowd/warning bounds.
- 2,000 seeded puzzles have obtainable four-power solutions. Every grotto pair is reachable at multiple movement speeds.
- All seven champions start and restart in desktop and touch viewports. Relic swapping, failed-art retry, a complete four-defense result, saved card and restart pass through the real UI.
- Keyboard and touch vault confirmation, landing across a real gap, fear and the visible-target ultimate chain pass.
- The existing six champions retain exactly matching simulated combat state against the shipped v34 build in Stage 1 and Stage 2 over identical scripted inputs.
- Fourfold CPU-throttled low-effects checks use 49 enemies, 28 allies and ten warning zones. Terrain stays within its 32 desktop / 24 mobile image bounds. These are browser emulations, not actual low-end-phone GPU or thermal measurements.
- Production routes, relative asset paths and PWA scope pass the Pages artifact check. Recoloring completes before new character art appears.

Lycanthrope's three-seed Stage 1 survival pilot averages **9:37**, with 25,496 kills and 2,253,335 Dominance. Her Stage 2 pilot clears three of three hunts in an average **11:35**, with 6,856 kills and 11,650,516 Dominance; two of three defeat the optional Colossus. These are automated policies, not observed player averages.

The Stage 3 pilot already knows the solution, visits all seven grottos, equips powers at their home altars and avoids warnings. All seven champions clear all three seeded challenges. Its roughly 3–7-minute informed clears are a lower bound, **not proof of the intended 10–12-minute human puzzle-solving window**. Discovery, wrong trials and backtracking need tester feedback. Health and travel are not padded merely to make an informed pilot take ten minutes.

| Nature | Clears | Mean informed clear |
|---|---:|---:|
| Lycanthrope | 3 / 3 | 5:32 |
| Overlord | 3 / 3 | 3:58 |
| Calamity | 3 / 3 | 3:20 |
| Devourer | 3 / 3 | 3:53 |
| Titan | 3 / 3 | 6:37 |
| Sovereign | 3 / 3 | 3:39 |
| Reaper | 3 / 3 | 4:16 |


Reproduce: node tools/build.mjs; node tools/check-pages-build.mjs; node --test tests/*.test.mjs; node tests/titan-realm-browser.mjs; node tests/lycan-controls-browser.mjs; node tests/lycan-colors-browser.mjs; node tools/v35-parity.mjs; node tools/measure-titan-realm.mjs. Browser checks require Playwright/Edge paths. Screenshots, measured JSON and a Titan music preview are saved under ignored test-results/.
