# Monster Mash v29 — earned kits, Reaper controls and hunt feedback

October 4, 2026. This release keeps profile version 3 and all existing progress, Gatebreaker days, imported rewards and historical run codes. The original five Stage 1 kits retain their v15 competition rules. Reaper Stage 1, earned Titan Fissure Stage 1, and Stage 2 have separate v29 rules and personal bests.

## Titan’s earned Stage 1 kit

Stage 2 always lists and uses Fissure. In Stage 1, the Throw/Fissure selector is hidden until the account has both Gatebreaker and the real October 8 opening time (midnight Eastern). Any native champion can earn that account-wide access. Throw remains the default and selectable afterward. The preference transfers with progress backups. Stage 1 still starts in base form with its ordinary timed unbindings; Stage 2 starting power, boons and enemy multipliers do not transfer.

Fissure consumes Momentum and 35% of the current barrier to produce the existing generated basalt field, persistent damage and charged snare. It respects arena edges and brazier bases. The result screen, PNG card, copied text, verifier and authenticated MM4 code identify the Fissure kit; classic personal bests remain separate.

## Reaper controls and priority

First press of Blink or Arc suggests the strongest visible enemy. A second press of the same power confirms, including E/E and R/R on desktop or repeated ability taps on touch. Mouse/tap placement still overrides, Escape/Cancel still cancels, and an empty Blink spends no cooldown. Suggestions follow moving targets and replace dead targets before confirmation. Empty Arc follows movement.

Automatic attacks retain captain focus across different ability ranges: hitting fodder with a shorter-range attack no longer changes the longer-range captain focus. A Colossus remains the strongest priority. Equal-priority focus stays stable while the target remains in the kit’s engagement range. An outlined focus label identifies the current threat.

## Hunt readability and guards

Ash Trace stays present from 12:00 onward. Its dark edge panel, large outlined arrow and compass label show the selected surviving captain’s actual bearing, using its live position when spawned. They do not use the next navigation turn. The generated ground embers show the navigable route after 15:00, when the speed bonus is already zero. The edge compass persists up close, without trail points and even while its decorative art is unavailable. It retargets on captain death.

Protected guards occupy four distinct screening positions between their captain and the player and reposition after a flank; distant retinues retain their homes. Formation goals refresh at 4 Hz with direct leader references, avoiding repeated enemy searches. Broken guards can pursue normally. Existing ranged cover remains a 35% damage reduction when an intact guard is in the firing corridor, not universal full projectile interception. Piercing/area attacks retain their intended effects.

Guard and captain impacts reuse the generated hit artwork with a cached white/violet treatment, darker edges and larger size. Their impacts draw above champion auras and combat effects. Ordinary Stage 1 hit art remains unchanged.

## Colossus arrival and mastery

Defeating captain eight before 9:00 triggers a safe arrival before the boon dialog. The enemy cannot reuse the captain’s slot until its death has finished. The Titan arrival sound, immediate region announcement and persistent boss HUD identify it. If captain eight falls after the window, a brief notice explains why no optional encounter appears. It retains a two-minute lifetime, +1.2M reward, optional status and existing Titan-specific vulnerability; no difficulty values changed.

**Colossus Bane** requires three completed Stage 2 hunts in which the Colossus is defeated. Every champion can earn it. Failed/abandoned hunts, expired encounters and duplicate finished-result processing do not count. Its progress survives export/import and it remains hidden until Stage 2 access. Older stored aggregate Titan kills cannot distinguish Stage 1 from Stage 2, so they are not retroactively converted into this new objective.

Stage 2 lists only Quick Claim, Breakthrough, Relentless Hunt, Read the Threat and Decisive Strike. Shared objective-event tests demonstrate all five for every champion. Current hunt codes reject arena-only feats; historical codes remain readable. Stage 1 feats remain unchanged.

## Measured balance

Deterministic bots, real damage, no immortality. These are repeatable balance probes, not human-average predictions. Stage 1 Titan uses eight paired seeds and two casting policies (16 runs per kit). Reaper Stage 1 uses three seeds. Every Stage 1 run ended naturally.

| Stage 1 kit | Average survival | Body count | Dominance |
|---|---:|---:|---:|
| Titan Throw | 11:35 | 36,344 | 3,498,192 |
| Titan Fissure | 11:19 | 34,794 | 3,321,977 |
| Reaper | 11:01 | 28,447 | 2,582,293 |

Fissure is 16 seconds shorter on average and about 5% lower in final Dominance; at equal 10:00 elapsed time its score is 0.3% higher. See [the paired study](TITAN_ARENA_FISSURE_REPORT.md).

Stage 2 uses seeds 77, 123 and 444 for every champion, following an authored search route and engaging the Colossus. All **18/18 hunts cleared and 18/18 Colossi were defeated**. Each result passed the current score-budget/run-code validator.

| Champion | Average clear | Body count | Dominance |
|---|---:|---:|---:|
| Overlord | 10:27 | 7,143 | 10,237,887 |
| Calamity | 8:21 | 5,788 | 10,696,394 |
| Devourer | 5:26 | 2,746 | 11,029,106 |
| Titan | 7:30 | 4,590 | 11,538,787 |
| Sovereign | 6:47 | 4,441 | 11,147,981 |
| Reaper | 9:14 | 6,056 | 11,473,997 |

The shortest bot clears remain below the desired 10–12-minute experience; known-route bots do not model first-time human searching. No captain-health or map-length increase was applied to compensate, given reports of human hunts exceeding twelve minutes. Human testing should determine whether fast routes need another optional challenge or the search/hint schedule needs adjustment.

## Validation and reproduction

- 207 logic tests, including saved progress, kit/date gating, historical codes, guard repositioning, persistent SW bearings, all-champion hunt feats and Colossus mastery.
- Desktop 1440×900 and touch 844×390: real kit selection, smart confirmation, manual overrides, priority, empty/dead targets, restart, generated artwork, stronger hits, compass persistence, eighth-kill arrival before boon and boss location.
- Ten seeded original Stage 1 champion/seed pairs match the prior implementation through ten minutes.
- Pages relative-route/PWA artifact validation; offline reload and replacement of obsolete service-worker caches.
- 4× CPU-throttled desktop with 236 enemies, three Fissures and up to sixteen eruption zones: 39.3 FPS, update p95 16.90 ms, draw p95 12.10 ms, bounded tile cache and no terrain failures. This is not a physical phone benchmark.

Run `node --test tests/*.test.mjs`, `node tests/titan-arena-experiment.mjs`, and `BALANCE_COLOSSUS=engage node tests/stage-two-balance.mjs` (set environment variables using your shell’s syntax). Browser scripts: `kit-targeting-browser.mjs`, `hunt-feedback-browser.mjs`, `hunt-visibility-browser.mjs`, `colossus-browser.mjs`, `reaper-browser.mjs` and `sw-update-browser.mjs`. Browser scripts require the documented Playwright/browser environment paths. Raw reports/screenshots stay in ignored `test-results/`.
