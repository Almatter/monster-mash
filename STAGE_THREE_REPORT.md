# Stage 3: TITAN — v36 tester build

Updated October 8, 2026. This iteration addresses movement, shrine travel, readable puzzle clues, collision, warnings, pacing and grading.

## Play and access

- Shared tester: https://almatter.github.io/monster-mash/test/
- Local: http://127.0.0.1:4173/test/
- `/stage2-test/` and `/stage3-test/` remain aliases; all three implemented stages and seven champions are unlocked for testers. Stage 4 remains unavailable.
- PC: WASD/arrows; Q/E/R/1–4 for powers. Space inspects a nearby inscription or altar; otherwise it activates the ultimate. Targeted powers accept a second button/key press or a battlefield click. Arrow keys navigate relic and portal choices; Enter/Space selects; Escape returns.
- Mobile: thumb stick, powers and the contextual relic/inscription button. Suggested targeting accepts a repeated tap or a battlefield tap.

Official Stage 1/2 saves, title IDs, progression and personal bests are retained. Tester progress remains in its separate `mm-stage2-test-*` namespace. Official Stage 3 remains unavailable until its readiness flag is enabled, its October 15 opening arrives and Ashen Gatebreaker is earned. Lycanthrope remains concealed until Stage 3 access, then usable in all three stages. Official Stage 4 remains unavailable until its own map/readiness, October 22 opening and Deep Gatebreaker requirements are met.

## Movement and scenery

Floor collision now follows elliptical platform footprints and narrower illustrated bridges. Swept collision prevents ordinary movement, dashes, knockback, enemies and servants from snapping across chasms. Actor feet are aligned to these footprints. Vault intentionally crosses nonwalkable gaps but still requires a safe landing inside the map.

Original generated gates visibly seal outgoing exterior bridges. Generated mana mist veils sector joins and shrouds the exterior. Joins are softened, not a claim that nine independent paintings have become a perfectly continuous painting. Generated titan warning glyphs replace placeholder circle outlines. Terrain is still packed offline into 100 streamed 512-pixel WebP tiles; desktop holds at most 32, touch 24. Old map versions remain available to existing cached builds. Moving actors replan navigation at eight Hz while collision still runs each frame.

## Lycanthrope

Moonstrider Vault now travels for 0.64 seconds with an airborne arc and forward flip. Its heroic landing deals area damage and stronger knockback with new lunar impact art and sound. Bloodmoon Reign runs through visible targets using her run animation, damages enemies crossed along its route, remains immune to damage throughout its duration and provides recovery. It prioritizes major threats between passes. It no longer teleports between victims.

Howl and innate regeneration still create recovery opportunities; native guardians, captains and titans resist fear. Stage 2 captain/Colossus tuning compensates for Bloodmoon's travel time. The nature button now fits Lycanthrope's full name.

## Relics, clues and occupation

Seven grottos surround the central titan. Three distinct guardians protect each; native core abilities expose their wards. All seven natures contribute a fifth altar power. The four required natures and relic locations shuffle each run; only fifth powers open titan defenses. Each has bounded recovery or protection to support mixed kits.

The relic screen shows only the relic physically at the current altar. An equipped relic leaves that altar; swapping it for another deposits the outgoing relic at the current shrine. Decoration follows the current occupant. Restoring a native power requires an empty cleared altar, so two relics cannot silently occupy one place.

Activating a relic awakens its generated portal. Activated, unoccupied portals connect cleared grottos. An activated shrine left unvisited for 150 seconds can be occupied once per run by three ordinary raiders. They block its portal and relic interaction until dispersed, without erasing discoveries or rerunning the guardian encounter. This makes returning consequential while limiting repeated chores.

Four numbered bridge inscriptions reveal the defense emblems in order before battle. Grotto emblems hint which relic nature is inside. The player still remembers the order; results and run codes do not include the solution. Intro, pause and altar counsel explain this relationship and the titan's reset boundary. Three seconds outside the seal restores all health and defenses.

Unbroken Resolve and First Insight can now be planned from clues. Lingering attacks from a prior layer do not count as a fresh wrong guess; deliberate incorrect fifth-power trials do. Resetting cannot farm layer or insight rewards. Discerning Collector rewards discovering only the four required relics, while Read the Depths rewards inspecting inscriptions.

Stage 3 spawns varied lesser enemies immediately, including thralls, hounds, spitters, wings and brutes. Ordinary enemies gradually reach a cap of 48, the total crowd stays at 64, and titan warning zones stay at 12. Guardian arrivals reserve their places. Overlord has more varied targets throughout travel.

## Dominance and grades

Stage 3 has no speed bonus. Its finite maximum is **26,050,000**:

| Source | Maximum |
|---|---:|
| Seven grotto clears | 8,400,000 |
| Four defense quarters | 6,000,000 |
| Titan victory | 6,000,000 |
| Intelligence feats | 5,600,000 |
| Ordinary combat | 50,000 |

Grade S requires 100%; A 90%, B 80%, C 70%, D 60%, E 50%, F below 50%. Grade, percentage and maximum appear prominently on the result, saved image and copied summary. Each score source shows earned/maximum amounts. Farming ordinary mobs beyond the pool adds no Dominance; resetting cannot duplicate objectives. Issued v34/v35 codes keep their historical budgets and values.

Existing Stage 3 titles, persistent records, champion-specific titles and Deep Gatebreaker remain. Deep Gatebreaker requires eight completed challenges, three victories without resetting, and all seven altar powers used to breach defenses across completed challenges, with one champion and no daily quota. Native Stage 1 feats remain unchanged.

## Existing-stage fixes

Stage 2 result duration now uses the same ceiling as its clear-speed calculation. This fixes secure run-code rejection for fractional finishes after ten minutes. Error messages distinguish unavailable browser cryptography from an actual validation problem; result progress remains saved.

Vortex no longer drags or consumes higher-tier units. Its damage against titans, elites, captains and guardians is capped per tick rather than instantly deleting them; ordinary mob behavior is retained. Calamity's three-seed Stage 1 survival pilot still averages **11:38** after this fix.

The Stage 2 Colossus has a prominent six-second arrival alert with district and encounter window, plus a distinct audible arrival cue. Existing sound/mute preferences are respected.

## Verification and measured pacing

- 281 unit/regression tests pass: local relic custody, one-time occupation, swept floor movement, Vault landing, full-duration Bloodmoon protection, prebattle clues, finite grades, historical code compatibility and higher-tier Vortex damage.
- Desktop and touch browser checks pass for all seven starts/restarts, loading retries, shrine/portal controls, Space/arrow navigation, ability confirmation, results, saved cards and real run-code generation. Official future-stage access remains hidden/locked.
- All 21 informed Stage 3 pilots clear and earn S with real cooldowns, movement and damage; every measured result validates and survives authenticated run-code encode/decode.
- A low-effects, fourfold CPU-throttled stress scene with 49 enemies, 28 allies and ten warning zones has desktop median 7.5 ms / p95 17.1 ms and touch median 5.7 ms / p95 22.6 ms for simulation plus drawing. Caches stay within their bounds. This is browser emulation, not a low-end phone hardware or thermal guarantee.
- Untouched Overlord, Devourer, Titan, Sovereign and Reaper simulations match the deployed baseline exactly in both existing stages under identical seeded inputs. Calamity and Lycanthrope have the explicitly requested changes.
- Result portraits are requested for the exact finished palette and shown only when recoloring is complete.
- Production build, all 60 emitted JavaScript modules, relative routes, cache versioning and Pages artifact checks pass.

Lycanthrope's three-seed averages:

| Stage | Measurement | Average | Kills | Dominance |
|---|---|---:|---:|---:|
| 1 | Survival | 10:11 | 28,359 | 2,567,342 |
| 2 | Full hunt, including Colossus | 12:16 | 7,541 | 11,646,742 |
| 3 | Informed perfect clear | 11:38 | Not a scoring goal | 26,050,000 |

Stage 2 clears and Colossus victories are both 3/3; clear range 10:33–13:23. Stage 1 survival range is 9:50–10:52. These are seeded simulation policies, not observed human averages.

Stage 3 pilots inspect all four clues, clear all seven grottos, discover only required relics, reclaim occupied shrines, assemble the kit locally and dodge warnings. They know the solution in advance, so these are lower bounds on human puzzle solving. Across all natures the average is about 10:07; fast casters can finish earlier. Discovery, memory errors and backtracking still need tester feedback for the desired 10–12-minute human window.

| Nature | Clears | Mean informed clear | Grades |
|---|---:|---:|---|
| Lycanthrope | 3 / 3 | 11:38 | S / S / S |
| Overlord | 3 / 3 | 10:00 | S / S / S |
| Calamity | 3 / 3 | 8:32 | S / S / S |
| Devourer | 3 / 3 | 9:34 | S / S / S |
| Titan | 3 / 3 | 10:58 | S / S / S |
| Sovereign | 3 / 3 | 9:45 | S / S / S |
| Reaper | 3 / 3 | 10:25 | S / S / S |

Her kit now has a distinct movement identity: safe-floor gap traversal with a landing impact, fear to create space, continuous regeneration, and an invulnerable running pursuit ultimate. It shares familiar combat vocabulary with Devourer and Reaper, but its continuous movement and terrain use differ substantially from their lunge and teleport.

## Art and reproducibility

New production source art, authoring briefs, packed paths and the packing command are in `art-source/stage3/PROMPTS-V36.md`. Existing character, guardian, titan-part, sector and material-guide sources remain. The original weird Stage 3 procedural score (inharmonic bells, suspended harmony, displaced pulses) remains.

Commands: `node tools/build.mjs`, `node tools/check-browser-modules.mjs`, `node tools/check-pages-build.mjs`, `node --test tests/*.test.mjs`, `node tests/titan-realm-browser.mjs`, `node tests/realm-v36-browser.mjs`, `node tests/lycan-controls-browser.mjs`, `node tests/hunt-result-code-browser.mjs`, `node tools/measure-titan-realm.mjs`, and `node tests/stage-two-balance.mjs`. Browser checks require the existing Playwright and Edge paths. Seeded measurements and screenshots are saved under ignored `test-results/`.
