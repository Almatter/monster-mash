# Passage and champion mastery — October 7, 2026

Gatebreaker now has two alternatives, each tied to a single original champion:

- Existing route: seven qualifying festival days, each with 8:30 survival and 15,000 slain.
- Experience route: 100 passage points, six finished Stage 1 runs lasting at least 60 seconds, and one finished eight-minute run. No daily limit.

Passage points: one per minute, five per finished run (maximum 30), ten for the champion's first mastery title, five for 500 slain in one run, and five for a Stage 1 Titan kill. Run and survival requirements remain mandatory even when the point total exceeds 100. Other champions cannot contribute to the same line.

Existing save version 3, title IDs, daily credits, palettes, competition rules and import/export format are preserved. Old per-champion play totals are credited once; historic Stage 1 bests and qualifying days prove single-run milestones. Old saves did not partition all playtime by stage, so existing native-champion experience is carried forward rather than discarded. No unavailable run history or eight-minute performance is invented. New experience records track Stage 1 explicitly. Imports use the existing maximum merge, not addition, to prevent duplicate transfer credit.

Stage 2 still requires the earned Gatebreaker **and server-verified October 8, 2026, midnight Eastern** (`2026-10-08T04:00Z`). Reaper, her titles and Stage 2 titles remain hidden until actual access. The dedicated test endpoint retains its bypass and isolated save. Ashen Gatebreaker and the October 15 Stage 3 date are unchanged; Stage 3 still requires a finished map/configuration before opening.

## Month-long champion mastery

Ranks: F 0; E 1,000; D 30,000; C 75,000; B 150,000; A 300,000; S 600,000.

Every rank can be earned in any available stage. There are no stage ceilings or capped pools. Repeated activities continue earning at their original rates; high rank thresholds make the climb substantial. The existing totals are re-evaluated retroactively, without changing saves or erasing credit.

Each champion has a separate rank on their roster button and a compact **Mastery + letter** link beside their preview. The preview does not show points. Monster Records provides expandable details, point sources and rank requirements. Its description simply says “F to S.” Mastery grants prestige without changing combat stats and is separate from the 100-point passage route.

Foundations:

- Playtime: 10 points/minute, continually earned.
- Finished runs: 20 points/run lasting at least 60 seconds, continually earned.
- Native champion titles: 500 per earned title.
- Ability practice: continually earned at the champion-specific rates displayed in records. The former practice goals now specify the rate rather than a cap.
- Five distinct champion combat milestones: 100 each (500 slain in one run; eight-minute survival; a Stage 1 Titan; 100-kill multikill; 60 seconds at ×5 Carnage).

Stage 2 adds larger rewards, displayed only after actual access:

- 500/completed hunt, continually earned.
- 1,000/Colossus victory in a completed hunt, continually earned.
- 25/captain and 5/guard broken, continually earned.
- 2,000/earned champion hunt title.
- Distinct rank-3 boons in completed hunts (4,000 across the seven unique boons).

Future stages can add their own objective rewards without changing earlier progression rates or imposing rank restrictions.

## Regular player release presentation

Stage 2 has its own landing narrative about hunting captains, claiming seals, choosing boons and healing at oases. Outdated practice-run wording is replaced by accurate “manually ended” descriptions; help now points to both Gatebreaker routes. Device support information is tucked into a collapsed Settings section instead of occupying the footer. Existing authenticated result codes, historical bests and the isolated testing endpoint retain their technical identities and score separation. Regular Stage 2 play contains no playtest banner, tester explanation or debug label. The separate testing endpoint uses a concise Exhibition identifier, preserving score separation without the old tester briefings.

## Completed character artwork

Character composition now publishes only after every color mask is finished. Selection previews, gameplay atlases and ultimate cut-ins request the exact completed palette, so a default image or an earlier palette cannot appear during loading. Match startup retains its preparing message and waits for the complete gameplay atlas before advancing the simulation. Source/artwork cache and concurrent composition limits remain unchanged.

## New hunt titles

All six champions get three additional Stage 2 titles (18 total): three clears plus 120 guards broken; five clears plus ability-specific kills; and five Colossus clears plus 100 captain kills. Existing hunt totals credit prior play. Stage-specific ability kills begin recording with this update because old saves did not retain their stage attribution. Titan Fissure includes impact and ongoing kills; unrelated damage, survival tuning and scoring remain unchanged.

## Verification

- New logic coverage: same-day passage for all original champions, independent champion requirements, minimum runs/survival, retroactive credit, repeated saves/finishes/imports, date/title protection, F–S thresholds, unrestricted Stage 1 ranks, continued rewards beyond former limits and all 18 new title conditions.
- Real browser checks at desktop and phone sizes: compact point-free rank links, direct preview-to-records navigation, collapsed mastery details, prior-save passage, hidden Stage 2/Reaper content on October 7, reveal on October 8, isolated test progress and no records overflow.
- Delayed-layer browser regression for all six champions, both selection/gameplay formats and two contrasting palettes; verifies no early or prior-palette draws, completed-image identity, bounded caches, and desktop/phone startup waiting.
- 244 existing gameplay/progression tests passed; production artifact verified. Complete existing gameplay/progression suite and production artifact verification run before deployment. No match balance or competition rules changed.
