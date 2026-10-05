# Monster Mash v30 — optional Colossus detour

October 4, 2026. Stage 2 changes to v30 hunt rules. All Stage 1 kits retain their existing rules. Profile version 3, Gatebreaker days, titles, imports and historical v29 hunt codes remain compatible. Existing personal bests remain stored under their original competition rules.

## Encounter placement and territory

The former spawn searched open ground 180–350 units from the player. The Colossus now chooses the nearest eligible authored captain pocket in a fully cleared district, excluding the player's current district and districts containing surviving captain sites. It must be at least 1,500 units from the player and 1,600 units from surviving captain sites and active captain positions, with 65 units of walkable clearance. No eligible spawn or enemy slot means a bounded retry, never a fallback beside the player.

Its arrival sound, region announcement and persistent boss HUD identify the district. The location remains tied to its home. It waits until approached, moves within a small home territory and returns home when the player leaves. It cannot pursue the player across the map into the remaining captain fights. Approaching it still triggers the existing ranged eruption patterns; leaving does not heal it or reset its timer.

The optional encounter still requires eight captain kills before 9:00, lasts two minutes from arrival and pays +1.2M only for a timely kill. Travel consumes that window. Clearing all ten captains still ends the hunt immediately, whether the Colossus is ignored, defeated or expired. No changes to health, damage, Titan vulnerability, combat farming caps or clear-time scoring.

## Measured hunts

Real-damage deterministic bots using seeds 77, 123 and 444, following the authored search route and choosing the optional encounter. These are repeatable balance checks, not human survival or clear-time predictions. All 18 hunts cleared; 17 Colossi were defeated. Reaper seed 123 let the optional encounter expire while recovering at shrines, then completed the captain hunt normally. No forced encounter or timer extension was added.

| Champion | Average clear | Body count | Dominance | Colossus kills |
|---|---:|---:|---:|---:|
| Overlord | 11:10 | 7,705 | 9,777,999 | 3/3 |
| Calamity | 8:35 | 5,896 | 10,976,753 | 3/3 |
| Devourer | 5:50 | 2,887 | 10,958,712 | 3/3 |
| Titan | 8:05 | 4,911 | 11,561,859 | 3/3 |
| Sovereign | 7:27 | 4,933 | 11,225,765 | 3/3 |
| Reaper | 10:15 | 6,845 | 10,764,997 | 2/3 |

A second, captain-only probe used seed 77 for every champion: **6/6 cleared, 0/6 Colossi killed**. Compared with the same-seed detour runs, seeking the Colossus added 27–102 seconds to the completed hunt. Both choices remain viable.

## Validation

- 214 regression tests passed, including saved access/progress and old authenticated results.
- Spawn safety checked for all 3,990 combinations of two surviving authored captain sites and player pocket/hub positions; selected districts are separate and all tested routes reach their spawn.
- Territory tests cover waiting, approach/attack, returning home, fixed region labels and declining the encounter without new volleys.
- Desktop 1440×900 and touch 844×390 browser checks: eighth kill triggers remote arrival before the boon dialog, with its region on the HUD and the game clock paused.
- Generated boss and hazard art, layer order, score-card bonus, run-code decode and Rise Again checked on both browser layouts.
- 4× CPU-throttled desktop with 236 enemies, three Fissures and sixteen eruption zones: 34.4 FPS, update p95 17.60 ms, draw p95 14.60 ms; 30 cached map chunks and no terrain failures. Other balance simulations were running concurrently, so this is not a controlled comparison with v29 or a physical phone benchmark. Spawn selection runs only on arrival; remote waiting skips route steering.
- Production Pages build passed relative route, asset and PWA checks. The build hash automatically updates the service worker; active runs defer reload until results.

Reproduce with `node --test tests/*.test.mjs`, `node tools/build.mjs`, `node tools/check-pages-build.mjs`, `BALANCE_COLOSSUS=engage node tests/stage-two-balance.mjs`, `node tests/hunt-feedback-browser.mjs`, and `node tests/colossus-browser.mjs` (browser scripts need the documented Playwright/Edge environment variables).
