# Stage 3 passage — October 5, 2026

The Ashen Gatebreaker appears in Monster Records after Stage 2 actually unlocks. It grants passage to Stage 3 for the entire roster, but one champion must satisfy all three requirements:

- Complete 12 Stage 2 hunts (all ten captains slain).
- Complete 5 hunts with the Ashen Colossus slain before finishing the hunt.
- Complete hunts with 4 different boon types taken to rank 3. A type counts once toward variety, regardless of how often it is mastered. The four types may be spread across runs.

There is no daily cap, streak or distinct-day requirement. Players can complete the challenge in a concentrated session or spread it over several days. Twelve 10–12 minute clears require roughly two hours of successful hunts; failed attempts and learning the Colossus add time. No score threshold or champion-specific combat action is required. The three goals encourage route mastery, taking on the optional threat, and experimenting with boon builds. A separate captain total would duplicate the clear requirement, while requiring other titles would add redundant bookkeeping.

Stage 3's opening is October 15, 2026 at midnight Eastern, exactly one week after Stage 2's October 8 opening. Access requires the title and a fresh official server-time check. Its map is not built in this update: `ready:false` prevents selecting the placeholder until the real scenario is delivered. Stage 4 remains unconfigured. The gate registry now supports either calendar-day trials or cumulative mastery requirements.

Records show a collapsed tracker for each available champion, with three progress bars and the names of mastered boons. Results show that champion's current passage progress. The earned title can be equipped and shared through the existing title system. The dedicated Stage 2 playtest exposes the challenge using its existing separate test-save namespace; test rewards do not unlock official stages.

## Save and rules compatibility

The original Gatebreaker and its seven-day-per-champion tracking remain unchanged. Version 3 saves, palettes, existing titles, best runs and progress exports remain valid. Existing per-champion `courtClears` and `courtColossusClears` contribute. Seven new numeric per-champion boon counters track completed hunts only; old global bests cannot identify which champion used each boon, so that variety starts with this update. Incremental saves, duplicate completion and repeated imports retain the existing protections against double credit. Sequential device handoffs preserve new progress; independent unsynced device totals retain the existing maximum-counter merge policy.

Combat, movement, scoring, spawn rules, Colossus timing and all competition rules are unchanged. Runtime file hashing automatically produces a fresh offline cache build.

## Validation

- 224 logic tests passed, including eight new mastery tests covering every champion, same-day completion, champion isolation, failed/unfinished hunts, expired bosses, insufficient boon ranks, duplicate finishes, historical counters, repeated imports, visibility, opening date and unbuilt-map locks.
- Desktop 1440×900 and phone 390×844 records checks passed; phone combat used the supported 844×390 landscape view. The browser fixture killed ten captains and the Colossus through the normal damage handlers, awarded the new title, decoded the resulting run, and verified save/reload and title selection.
- Existing hunt visibility tests passed: 27 titles before Stage 2, 42 after access, preserved imported rewards and original five Gatebreaker trackers.
- Production build and GitHub Pages artifact checks passed. Screenshots and machine-readable browser reports are in ignored `test-results/`.

Browser combat fixtures accelerate objective kills to exercise the complete results/save pipeline. They do not measure human completion difficulty or ordinary match balance; this update does not change either stage's gameplay.
