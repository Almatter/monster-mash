# Monster Mash v32 — hunt Grades and stronger Colossus

October 6, 2026. Stage 2 advances to v32 because feat scoring and the Colossus threat have changed. Original Stage 1 combat/scoring/feats, earned Fissure and Reaper Stage 1 rules, profile version 3, Gatebreaker days, Ashen Gatebreaker progress and existing titles remain compatible. Earlier authenticated codes keep their original scores and are not retroactively graded. Personal bests remain separated by rules, stage, nature and ending.

## Presentation and Records

The result screen, PNG export and copied summary prominently show total Dominance and Grade. The result screen and PNG show **COMBAT SCORE earned / 500,000 MAX**, with a filled progress bar. Copy Results includes the same maximum in its score breakdown. Grade is calculated from authenticated score/rules data, not an independent saved field. On narrow portrait screens Grade uses the full card width.

Title options are grouped by their existing prestige family, with a short origin caption after selection and a requirement tooltip. Actual equipped title strings are unchanged. Unnamed identities follow the selected nature, including older generic `Unnamed Calamity` defaults; custom names and historical run-code names remain unchanged.

Opening Records from the result screen explicitly flushes final progress before rendering. Records shows a latest-run confirmation during the session, including when returning through the landing page. Best records remain bests, rather than being overwritten by a weaker latest run. Browser tests finish two runs, open Records immediately, reopen them from the menu, and reload the page: both runs and the first clear remain saved, and reopening does not add duplicate credit. The reported stale view was not independently reproduced before this change; these checks establish the new behavior without claiming a proven original cause.

## Finite scoring

| Pool | Maximum Dominance |
|---|---:|
| Combat: ordinary kills, multikills and wave scoring | 500,000 |
| Captain kill score at peak Carnage | 30,000 |
| Seals, guard breaks, impacts and close hunts | 6,750,000 |
| Clear speed, full at 10:00 or earlier | 3,200,000 |
| Ashen Colossus | 1,200,000 |
| Hunt feats | 1,515,000 |
| **Total** | **13,195,000** |

Hunt feats now pay separately from combat and continue to pay after the combat pool fills. Quick Claim / Read the Threat pay 25,000 each; Breakthrough / Relentless Hunt / Decisive Strike pay 35,000 each. Each is once per captain, except Relentless Hunt has only nine possible intervals. Thus 49 feat awards are possible and repeating a captain's slam cannot farm points. MM4 validation checks the separate feat sum, count limits and overall score budget.

S requires the entire maximum (100%); A ≥90%, B ≥80%, C ≥70%, D ≥60%, E ≥50%, F below 50%. Display percentages round down to tenths so a sub-100% A never displays 100.0%. Every nature shares this maximum; completing a hunt or defeating the Colossus alone does not guarantee A. An S was not observed in the normal-health study and is a strict theoretical perfect-score target, not a demonstrated result for every kit.

A player can still trade some time below ten minutes for combat points, but combat is capped at 500,000. Beyond ten minutes the speed bonus loses roughly 10,667 per second; beyond fifteen it is zero. Feat timing and the three-minute Colossus limit remain separate constraints. Endless low-level farming cannot produce an unbounded score.

## Colossus

Impacts increase from 78 to 125 and scorch ticks from 22 to 36. Volleys recur every 2.6 seconds (previously 3.2), with a 1.1-second first warning. Every volley places one zone at the player's current position, a second along the current movement path when moving, and four zones around that area. Prediction includes movement boons and Devourer's current speed bonus. After telegraphing, positions remain fixed so changing direction is an effective dodge. Zone radius is 75 and scorch lasts 1.5 seconds; warnings still render above champion auras.

The active-zone cap stays 18. Boss health (180,000), reward (1.2 million), remote cleared-district placement and 180-second lifetime remain unchanged. Titan's fourfold heavy-impact vulnerability remains unchanged: this update did not change Fissure strength or boss damage resistance.

## Normal-health balance sample

Seeds 77, 123 and 444; all six natures. Automated navigation searches authored pockets, circles captains, dodges warning zones and visits healing oases; it uses normal cooldowns, damage, sustain and health. No forced invulnerability, health refill, enemy relocation or score injection is used. The common policy favors Kingslayer, Relentless and then Wayfarer, taking Second Heart when low. All reported runs pass MM4 validation.

**Clear average** excludes deaths. **Run average** includes both clears and deaths; it is not an average survival guarantee. Body count and Dominance include all three runs. These are a small automated sample, not measured human/device results.

| Nature | Clears | Clear average | Run average | Average body count | Average Dominance | Best score / max |
|---|---:|---:|---:|---:|---:|---:|
| Devourer | 3/3 | 6:01 | 6:01 | 3,089 | 12,437,414 | 94.9% |
| Titan | 3/3 | 8:15 | 8:15 | 4,964 | 12,896,031 | 98.2% |
| Sovereign | 3/3 | 7:47 | 7:47 | 5,165 | 12,597,142 | 95.9% |
| Calamity | 3/3 | 8:45 | 8:45 | 6,053 | 12,256,063 | 93.8% |
| Overlord | 2/3 | 11:30 | 10:33 | 7,161 | 9,297,959 | 85.1% |
| Reaper | 1/3 | 10:54 | 8:28 | 5,344 | 8,624,414 | 94.4% |

All six natures demonstrated A capability when including the follow-up below. Reaper's baseline seed 123 earned 94.4% (A), but the other two Reaper runs died while engaging the Colossus; A capability does not imply equal consistency. Devourer still clears notably faster than the ten-to-twelve-minute human target under known-route automation. This update does not expand the map or lengthen captain fights just to force that controller to wait.

Overlord follow-up kept normal combat rules and the same damage/recharge/travel boon build, but circled captains at 160 world units and the Colossus at 450. Keeping its army away from zones around the player improved the result: **3/3 clears and Colossus victories**, average **10:48**, **7,546 body count**, **11,580,635 Dominance**, best **92.1% (A)** at **9:54**. The other two runs earned B (85.7% and 85.4%). An earlier-Wayfarer experiment also cleared 3/3 but did not reach A; no champion stats were changed to manufacture the grade.

## Verification

- 229 logic tests pass: grade boundaries, exact maximum, finite feats, current score validation, historical v28–v31 codes, naming migration, and existing combat/progress regressions.
- Desktop 1440×900 and touch/portrait 390×844 result flow: prominent grade and combat cap, collapsed breakdown, title origin, all six unnamed selections, preserved custom names, copied text, real PNG downloads, immediate Records, two-run persistence and no official progress contamination.
- Saved PNGs and both result layouts visually inspected. Stage 3 passage browser test passes both layouts: date/title gates, per-champion completion, save/reload and unbuilt Stage 3 remaining locked.
- Colossus rendering/performance probe: 236 durable enemies, three Fissures, 18-zone peak, fourfold CPU throttle. 39.1 FPS in this headless desktop sample; update mean/p95 8.78/16.60 ms, drawing 6.67/13.20 ms, terrain cache peak 30 and zero terrain failures. These are CPU/Canvas timings, not hardware-phone guarantees.
- Production artifact and Pages relative routes/PWA scope checked. Build hash updates cached runtime files through the existing safe-update flow; active runs defer updates.

Reproduce logic checks with `node --test tests/*.test.mjs`. Browser checks use `tests/hunt-grade-browser.mjs`, `tests/stage-mastery-browser.mjs`, `tests/stage-two-browser.mjs` and `tests/colossus-browser.mjs`, with the existing PLAYWRIGHT_PATH/BROWSER_PATH configuration. Screenshots and raw balance JSON are ignored under `test-results/`. Balance harness accepts BALANCE_PLAN and BALANCE_CAPTAIN_DISTANCE/BALANCE_BOSS_DISTANCE for explicit legal tactical comparisons.
