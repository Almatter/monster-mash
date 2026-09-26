# Player clarity and run comparisons — 2026-09-26

## Scope

Implements the approved review items 2, 3 and 4. The fixed champion kits, scoring, enemy pressure, timed Unbound seals, current week and `2026.10-v6-tester` combat rules are unchanged. There is no new map selector or upgrade-choice system.

## Player guidance

- Landing-page festival brief explains the role, escalating survival, Carnage/Dominance and absence of a victory timer.
- An optional preparation guide opens on a first visit and collapses after entering a run. Returning players can reopen it. Covers naming, starter/earned titles, palettes, controls/rules, sound and effects, landscape play and the fixed scenario.
- Champion-specific tactical advice sits above the start button. Detailed kit descriptions can be expanded. On narrow screens champion selection and starting precede the artwork editor.
- Current week/scenario is identified; future maps are clearly unavailable. The HUD counts down to the next actual release. Pause includes scenario, goal, tactical advice and release countdown.
- Titles are grouped into starter and earned prestige choices, and appear in preview, HUD (including mobile), pause, records, results, copied results, saved cards and verifier. A narrow HUD may truncate long titles; pause/results retain the full title.
- Volume, mute, shake and Low FX now share the Settings panel.

## Calamity previews

Built-in imagegen produced distinct transparent Starfall and Vortex illustrations. Both have empty centers, thin functional boundaries at the actual affected radius, red/X invalid markers, and text for out-of-range/outside-arena targeting. They also represent pending meteor and active vortex fields, and remain in Low FX. Their runtime WebPs total about 220 KiB, at 512×512 (2 MiB total decoded RGBA). Only Calamity's selected pack requests them.

Sources and exact prompts: `art-source/vfx/CALAMITY_TARGET_PROMPTS.md`. Rebuild: `node tools/pack-calamity-target-vfx.mjs`.

## Results and history

Local personal bests are scoped by champion, ruleset, event week and ending. Manually ended runs compare against practice bests; overwhelmed runs compare against completed runs. Results show first-run/new-best/tie/below-best feedback and a multikill highlight. Score, kill and survival maxima are tracked independently. Data is normalized, bounded to 160 scopes, survives profile migration, and clears with progress reset. Existing unscoped records are preserved as cosmetic history without being mislabeled competition scores.

Cards, copied results and the verifier include event week, ruleset and practice/overwhelmed status. Cards also include build identity. Local best claims are explicitly labeled local and are not added to the sealed run-code payload. Shipped MM4 rulesets remain accepted when the active ruleset changes; legacy MM1–MM3 checks remain.

## Small performance pass

- Reuse the floor CanvasPattern rather than allocating it every draw; invalidate when floor artwork loads.
- Draw result/records portraits only when the composed portrait changes.
- Precompute descending massacre tiers instead of reversing a new array on every attack completion.

These reduce avoidable work without changing combat. They do not establish support for a 2 GiB laptop or identify the reported browser crash.

## Validation

- Unit suite: 46 tests, including scope isolation, practice separation, persistence/reset, corrupt data, bounded history, share context, release timing and historical MM4 decoding.
- `player-clarity-browser.mjs`: desktop 1440×900, portrait layout 390×844 and touch landscape 844×390. Guide persistence, settings, title display, countdown, generated previews, real active fields in Low FX, first/improved practice bests, separate completed best, reload, cards and verifier. Also verifies one floor-pattern allocation across 30 draws.
- Existing mobile HUD checks: 915×412, 844×390, 667×375 and 568×320 stay at 49 px with separate controls and no page overflow.
- Existing Calamity placement/cancel, release HUD, records/title persistence, beta sharing/verifier and project-subpath checks.
- All five champion aura/lifecycle/Low FX checks pass. On this test machine with 696 enemies, draw p95 ranged 8.7–10.9 ms.
- Heavy Sovereign/Overlord simulation plus draw: 714 enemies, up to 28 servants, p95 5.6–7.9 ms desktop and 3.1 ms touch landscape. These are host measurements, not old-laptop or real-phone benchmarks.
- Production artifact check and visual review of desktop, phone, targeting and result-card screenshots.

The records browser test now uses a protected progression fixture and actual ability kills; it no longer assumes an unattended character survives 70 seconds or that locally earned records are embedded in MM4. It is not a survival benchmark. No combat tuning occurred, so prior survival averages have not been replaced with new estimates.

## Design assessment

A good small community arcade game: the five distinctive kits, monster identity, escalating power and shareable runs support its purpose. It is not yet a particularly deep repeat-play survivor. Repeating one champion offers relatively few meaningful decisions beyond execution; tactical upgrade choices and scenario variation are the clearest future opportunities. New-player comprehension and returning-player engagement should be judged with observed human sessions, not automated survival scores.
