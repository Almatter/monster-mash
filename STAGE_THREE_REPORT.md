# Stage 3: TITAN — tester build

Built October 8, 2026. The Mana Abyss is a relic and defense puzzle with a central titan encounter.

## Play

- Shared tester page: https://almatter.github.io/monster-mash/test/
- Local: http://127.0.0.1:4173/test/
- `/stage2-test/` and `/stage3-test/` remain aliases of the shared page.
- Stages 1, 2, and 3 are selectable; Stage 4 stays unavailable. Add `?stage=1` or `?stage=2` to select an older stage initially.
- PC: WASD/arrows; Q/E/R/Space or 1–4. A placement power suggests a target; press it again to confirm or click to choose another.
- Mobile: thumb stick and power buttons; tap the power again or tap a visible target to confirm. Relic selection pauses play and uses large, scrolling touch controls.

Official Stage 1/2 saves and rules remain intact. Tester runs keep the existing separate `mm-stage2-test-*` progress namespace and carry exhibition rules in their run codes. Official Stage 3 stays unavailable until its readiness flag is enabled; its October 15 opening and Ashen Gatebreaker requirement remain unchanged.

## Expedition

Seven connected grottos surround an enclosed central arena. Six have three generated titan servants guarding an unknown relic. A cleared grotto grants recovery and provides a place to rest and rearrange powers. The seventh is dormant, reserved for the forthcoming champion.

Each nature contributes one randomly chosen existing power. Claim a relic to discover its power, then replace any of four slots. Restore native powers at a cleared grotto. Duplicate copies cannot be equipped. The selected champion retains its body, basic attack, health, armor, and movement; traits follow the equipped natures and share their existing recovery limits. Lunge keeps three rapid charges in any slot. Borrowed Eclipse works in any slot, and powers retain keyboard/touch targeting and the player's energy color.

The titan has four randomly ordered defenses, each requiring a different nature's power. Damage from the wrong nature cannot open a defense. After the correct power breaks it, ordinary damage can reduce that quarter of health. Overkill cannot skip the next defense. Current visual clues are shown beside the titan above combat effects; weak-point sequences are not saved as an answer sheet in results or codes. Lesser servants carry matching visual motifs and react to the relevant power.

The titan attacks with warned, overlapping mana eruptions and punishing melee strikes. Crossing out of its arena prevents attacks in either direction. Three seconds of disengagement restores all titan health and defenses; claimed relics remain. Defense rewards are paid once per run, so resetting cannot farm them.

Relic generation checks that the four-nature solution includes hit-based recovery, a burst power, and sufficient damage powers. Guardians resist conversion to avoid bypassing or stranding the relic objective. All 24 possible relic abilities have been tested to open their associated defense on another champion.

Scoring emphasizes objectives: 700,000 per cleared grotto, 600,000 per defeated health section, 3,200,000 for the titan victory, and at most 200,000 ordinary combat Dominance. There is no clear-speed reward or Stage 1 feat farming. Results, saved cards, copied summaries and authenticated codes include expedition statistics and the final loadout.

## Artwork and performance

Production artwork is generated for the arena, grotto, floors, titan parts, relics, servants and attacks. The titan combines three interchangeable heads, two mantles and independent body/power colors. Existing generated champion power art is reused for borrowed abilities.

The 5,120-square map is composed offline and exported as 100 WebP sections of 512 pixels. Mobile keeps at most 24 decoded terrain sections (about 24 MiB of uncompressed pixel data), desktop 32. Only Stage 3 prepares its scene artwork/navigation. Section loading is bounded to four concurrent decodes, with prefetch beyond the viewport and a safe loading pause instead of exposing unloaded terrain. The map and titan are never rebuilt as one enormous canvas during play. The existing camera gives equal visible battlefield area across screen shapes.

Low-effects stress checks used 49 enemies, 28 allied servants and ten warning zones with fourfold CPU throttling. Both desktop and touch viewport checks stayed within their image/cache bounds without script failures. These are browser emulations, not measurements of an actual low-end phone's GPU, temperature or memory pressure.

## Verification and pacing

- 256 regression tests passed; the final Stage 3-specific suite also passed after UI polish.
- 2,000 seeded puzzles checked for obtainable recovery/burst solutions.
- All 49 grotto-to-grotto routes checked for traps at different movement strides.
- All six champions started and restarted on desktop and mobile viewports.
- Relic swapping, off-slot ultimate behavior, complete four-defense results and restart passed in both viewports.
- Failed borrowed-power artwork remains paused and can be retried; a blocked download was tested through the real UI.
- Production artifact routes and PWA scope verified; old result formats remain supported.

The automated pilots already know all four weaknesses, visit every active grotto, choose a correct loadout and evade warnings. These are successful-clear averages for that informed pilot, **not human survival averages or proof of 10–12-minute pacing**.

| Nature | Clears | Mean successful clear |
|---|---:|---:|
| Overlord | 3 / 3 | 4:17 |
| Calamity | 2 / 3 | 3:32 |
| Devourer | 3 / 3 | 4:31 |
| Titan | 3 / 3 | 4:58 |
| Sovereign | 2 / 3 | 4:38 |
| Reaper | 3 / 3 | 3:41 |

The two unsuccessful pilots show that choosing a valid kit alone does not guarantee victory. Human discovery, mistaken powers and resets still need tester feedback. The intended 10–12-minute window remains a tuning target; informed clears are shorter. Guardian health and travel have not been padded solely to make the automated clock reach ten minutes.

Reproduce: `node tools/build.mjs`, `node tools/check-pages-build.mjs`, `node --test tests/*.test.mjs`, `node tests/titan-realm-browser.mjs` (with Playwright/Edge paths configured), and `node tools/measure-titan-realm.mjs`. Browser screenshots and measurement JSON are written under ignored `test-results/`.
