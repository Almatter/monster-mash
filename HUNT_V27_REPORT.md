# Hunt v27: access, records, navigation and threat priority

## Player-facing changes

Reaper has no roster teaser before official Stage 2 access. Her three mastery titles and ten Ashen Wilds titles are omitted from the title picker, registry and title totals. Stage 2 achievements and Reaper personal-best entries are also omitted. The first-visit guide no longer reveals her. Imported profiles that selected Reaper show an original champion until access opens, without removing stored palettes, earned rewards or trials. Access still requires one champion’s seven qualifying days plus the October 8 opening; the tester entry bypasses access using its separate progress namespace. Once unlocked, Reaper remains playable in both stages.

Title families and individual titles are expandable, initially collapsed. Stage passage comes first. Feats also expand individually and reflect the selected stage. Gatebreaker shows five named progress lines, one for each original champion. The stored days were already independent: playing a different champion advances that champion’s line rather than combining days across champions. Any completed line earns the single title and unlocks Stage 2 for the whole roster after opening. Qualifying-run feedback now names the champion. No profile schema or qualification logic changed.

Late captain trails draw above champion auras and combat effects. A dark, gold-edged compass badge sits at the side of the viewport, with a clear directional arrow over the existing generated ember artwork. Its arrow follows the navigable route rather than pointing through walls. Clues retain their existing 12-minute pulse / 15-minute continuous timing, so they do not improve an early clear bonus. The camera’s equal-area viewport remains unchanged.

Reaper automatic basics, automatic Arc/Blink fallbacks and Eclipse share the same threat ranking: captain, Titan, elite, vanguard, hex spitter, brute, hound, then lighter prey, within the relevant attack’s reach. Equal-ranked targets stay in focus until unavailable; a higher-ranked threat immediately replaces them. The old guard/shooter checks used names that do not match the actual vanguard/spitter definitions. Player-selected taps still take precedence.

## Stage 2 run feats

Stage 1’s seven feats and their awards are unchanged. Stage 2 uses five objectives shared by every champion:

| Feat | Condition | Combat bonus |
|---|---|---:|
| Quick Claim | Claim a captain’s seal within 8 seconds | 2,000 |
| Breakthrough | Break all four guards protecting one captain | 3,000 |
| Relentless Hunt | Kill the next captain within 90 seconds | 3,000 |
| Read the Threat | Start inside a captain’s slam warning, then leave before impact | 2,000 |
| Decisive Strike | Kill a captain within 60 seconds of first damaging it | 3,000 |

Each objective can award once per captain/retinue, without farming repeated dodges or the same guard. Bonuses use the existing capped combat score budget; captain seals, guard bonuses and clear-time rewards retain their prior values. Objective tracking uses small, bounded run-only sets/maps and replaces repeated Stage 1 feat evaluations during a hunt. Old feat names remain available when viewing older results.

Hunts and Reaper Stage 1 use v27 competition rules. Original champions’ Stage 1 remains v15. Shipped v26 and older MM4 payloads stay readable and keep their existing comparisons. Cosmetic lifetime totals and Gatebreaker progress are retained.

## Validation

- 175 unit tests passed. New cases cover locked imported identity presentation, date/title gating, all five feats earned by all six champions through actual hunt events, repeat/late-claim rejection, unchanged Stage 1 feats, captain-focused automatic basics, equal-threat focus, and off-character hints.
- Exact deployed Stage 1 parity for all five original champions, two seeds each, through 600 seconds.
- Desktop and touch browser regressions: all champion swatches, independent Reaper skin/hair/fabric channels, player-targeted Blink/Arc, both unlocked stages, results and Rise Again, all hunt kits, seals/boons, isolated test progress, grouped Gatebreaker lines and aura-resistant hint draw order.
- Offline reload and versioned service-worker cache activation checked. Pages artifact paths and relative routes checked.
- 4× CPU throttle, 200 enemies: Titan/Reaper update p95 16.8ms; drawing p95 3.2ms / 3.8ms. No terrain load failures; cached terrain tiles peaked at 36. These desktop-throttle measurements do not promise a specific phone frame rate.

Three-seed automated active-play measurements (77, 123, 444), with real incoming damage and no immortality:

| Champion | Stage 2 mean clear | Mean kills | Mean Dominance | Clears |
|---|---:|---:|---:|---:|
| Overlord | 9:26 | 6,310 | 9,345,965 | 3/3 |
| Calamity | 7:52 | 5,290 | 9,844,840 | 3/3 |
| Devourer | 5:05 | 2,559 | 9,884,151 | 3/3 |
| Titan | 6:51 | 4,022 | 10,385,947 | 3/3 |
| Sovereign | 6:19 | 4,039 | 9,748,192 | 3/3 |
| Reaper | 8:26 | 5,397 | 10,253,953 | 3/3 |

Every champion earned every hunt feat in each of the full runs, though counts vary with its tactics. Reaper Stage 1 averaged **11:11 survival**, **29,845 kills**, **2,733,065 Dominance**, range **10:53–11:32**. Reaper Stage 2 clear range **8:13–8:42**. Automated route knowledge is substantially better than a new human hunter’s; these are reproducible balance probes, not predicted player averages.

## Optional late threat: recommendation only

An optional Ashen Colossus can give practiced hunters a meaningful score-versus-time decision. Recommended initial experiment: appear near the hunt route after eight captains if reached before 9:00; allow 120 seconds from its appearance, rather than disappearing at an absolute 10:00. Award roughly 1–1.5 million fixed Dominance, without repeatable minion score, and leave the remaining captains and normal ending available to skip it. After 10:00 the current speed bonus declines by about 10,667 points per second, so two extra minutes cost about 1.28 million points: the reward can make execution matter instead of being an automatic choice.

A hard 10:00 expiry can leave late qualifiers only seconds and would favor the fastest burst kits. The optional threat should use readable avoidable attacks and a bounded fight, rather than a large passive health sponge. It can narrow clear-time differences but cannot guarantee every efficient hunt lasts 10–12 minutes. No new threat, spawn, timer, art or score reward was added in this release.
