# Monster Mash v31 — three-minute Colossus and clear boon ranks

October 4, 2026. Stage 2 advances to v31; Stage 1 competition rules, profile version 3, Gatebreaker days, titles, progress transfers and historical results remain compatible.

## Colossus window

The Colossus lasts 180 seconds from its arrival, including travel. The boss HUD starts at 3:00. Boon deliberation still pauses that clock. Arrival still requires captain eight before 9:00, and clearing captain ten still ends the hunt. Remote cleared-district placement, home territory, reward, health, damage and clear-time bonuses retain the v30 behavior.

Current authenticated results accept rewards during the new window. Historical v28, v29 and v30 codes retain their original 120-second validation limit, rather than gaining a retroactive scoring allowance. Saved progress and prior personal bests are preserved; new Stage 2 bests use the v31 competition rules.

## Boon choice

Cards display CURRENT 0/3 before learning a boon, then 1/3, 2/3 and 3/3. Only actual 3/3 cards are disabled and marked MAX. Hover and keyboard focus show the next rank and its cumulative benefit; touch devices display the preview immediately without requiring a second tap. Fully learned cards show their earned total.

Previews distinguish additive bonuses from the compounded cooldown reduction (10%, 19%, 27.1%). Relentless's description now correctly says cooldowns are 10% shorter. Selection changes the existing boon state once, with no respec or change to boon strength. Hover/focus uses the existing soft menu sound and a successful selection uses the distinct confirmation sound, respecting UI volume and mute. Pointer selection does not add a keyboard-focus sound or a delegated second click sound.

## Worst-route Titan retest

Defensive build: three Second Heart ranks, three Enduring Power ranks and two Relentless ranks; no Wayfarer speed bonus or Kingslayer damage bonus. Three seeds (77, 123, 444) per case, real damage, no invulnerability, full initial health and ready abilities, with known-route navigation. These are encounter probes, not human survival or full-hunt averages. Forced opposite-map placement is a stress fixture, not a change to the actual spawn selector.

All **12/12** Colossi were defeated within the extended window.

| Placement | Travel mobility | Average spawn-to-kill | Range | Time remaining on average |
|---|---|---:|---:|---:|
| Longest tested current-selector route | Walking | 2:05 | 2:04–2:06 | 0:55 |
| Longest tested current-selector route | Stampede | 1:58 | 1:52–2:01 | 1:02 |
| Forced opposite-map route | Walking | 2:13 | 2:10–2:16 | 0:47 |
| Forced opposite-map route | Stampede | 1:51 | 1:50–1:51 | 1:09 |

## Validation

- 216 regression tests passed, including exact new expiry, rewarded kills after the old cutoff, pause behavior, cleanup and historical run-code limits.
- Desktop 1440×900 and mobile/touch 844×390: visible 3:00 countdown, remote arrival before boon choice, unchanged region/hint feedback.
- Real boon dialog at all four ranks: hover and keyboard previews, touch previews, actual audible hover/confirmation cues, one upgrade per choice, correct 3/3 disable and resumed play. Screenshots inspected on both layouts.
- Pages build, relative asset paths and PWA scope validated. The automatic build hash updates cached modules safely after active runs finish.
