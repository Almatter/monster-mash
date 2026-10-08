# Passage and champion mastery — October 7, 2026

Gatebreaker now has two alternatives, each tied to a single original champion:

- Existing route: seven qualifying festival days, each with 8:30 survival and 15,000 slain.
- Experience route: 100 passage points, six finished Stage 1 runs lasting at least 60 seconds, and one finished eight-minute run. No daily limit.

Passage points: one per minute, five per finished run (maximum 30), ten for the champion's first mastery title, five for 500 slain in one run, and five for a Stage 1 Titan kill. Run and survival requirements remain mandatory even when the point total exceeds 100. Other champions cannot contribute to the same line.

Existing save version 3, title IDs, daily credits, palettes, competition rules and import/export format are preserved. Old per-champion play totals are credited once; historic Stage 1 bests and qualifying days prove single-run milestones. Old saves did not partition all playtime by stage, so existing native-champion experience is carried forward rather than discarded. No unavailable run history or eight-minute performance is invented. New experience records track Stage 1 explicitly. Imports use the existing maximum merge, not addition, to prevent duplicate transfer credit.

Stage 2 still requires the earned Gatebreaker **and server-verified October 8, 2026, midnight Eastern** (`2026-10-08T04:00Z`). Reaper, her titles and Stage 2 titles remain hidden until actual access. The dedicated test endpoint retains its bypass and isolated save. Ashen Gatebreaker and the October 15 Stage 3 date are unchanged; Stage 3 still requires a finished map/configuration before opening.

## Month-long champion mastery

Ranks: F 0; E 1,000; D 10,000; C 30,000; B 75,000; A 150,000; S 300,000.

Each champion has a separate rank on their roster button and a points link beside their preview. Monster Records contains collapsed, expandable champion details, point sources, ability goals and thresholds. Mastery grants prestige without changing combat stats. It is separate from the 100-point passage route.

Foundations have a 9,000-point cap, guaranteeing that Stage 1 alone cannot advance beyond E:

- Playtime: 10 points/minute, up to 4,500.
- Finished runs: 20 points/run, up to 1,000.
- Native champion titles: 500 each, up to 1,500.
- Ability practice: up to 1,500, proportionate to champion-specific goals.
- Five champion combat milestones: 100 each (500 slain in one run; eight-minute survival; a Stage 1 Titan; 100-kill multikill; 60 seconds at ×5 Carnage).

Stage 2 adds a separate 60,000-point pool, visible only once the stage is accessible:

- 500/completed hunt (20,000 cap).
- 1,000/Colossus victory in a completed hunt (15,000 cap).
- 25/captain (10,000 cap).
- 5/guard broken (5,000 cap).
- 2,000/new champion hunt title (6,000 cap).
- Distinct rank-3 boons in completed hunts (4,000 total across seven boons).

Stage 2 can bring a dedicated player through D to C; B–S await later challenges. When Stages 3/4 are designed, add independent stage pools rather than multiplying earlier totals. Suggested future budgets of 90,000 and 180,000 would make the 300,000-point S threshold achievable across the whole event. Those are planning budgets, not currently earned points or invented missions.

## New hunt titles

All six champions get three additional Stage 2 titles (18 total): three clears plus 120 guards broken; five clears plus ability-specific kills; and five Colossus clears plus 100 captain kills. Existing hunt totals credit prior play. Stage-specific ability kills begin recording with this update because old saves did not retain their stage attribution. Titan Fissure includes impact and ongoing kills; unrelated damage, survival tuning and scoring remain unchanged.

## Verification

- New logic coverage: same-day passage for all original champions, independent champion requirements, minimum runs/survival, retroactive credit, repeated saves/finishes/imports, date/title protection, F–S thresholds, Stage 1 rank ceiling, larger hunt pool and all 18 new title conditions.
- Real browser checks at desktop and phone sizes: roster badges, direct preview-to-records link, collapsed mastery details, prior-save passage, hidden Stage 2/Reaper content on October 7, reveal on October 8, isolated test progress and no records overflow.
- Complete existing gameplay/progression suite and production artifact verification run before deployment. No match balance or competition rules changed.
