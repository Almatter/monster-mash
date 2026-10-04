# Reaper v26: colors and curved scythes

The testing endpoint remains `/stage2-test/`. Official Reaper availability still follows The Gatebreaker plus the October 8 Stage 2 opening; after unlocking she can enter either stage. Original champions retain their Stage 1 rules and combat. Existing saves, titles, device backups and authenticated run codes remain readable.

## Color correction

The selection swatch handler referenced an undefined `monster` outside the roster loop. It now uses the selected champion; real browser clicks cover all six champions on mouse and touch. Reaper has five independent regions: armor/fabric, twin tails/hair, metal/ornament, eyes/soul energy and skin. Skin offers natural and fantasy colors. Four registered skin masks cover selection, animated gameplay, portrait and ultimate cut-in; the recolored portrait carries through to result cards. Old four-color Reaper saves gain a pale default skin without discarding any previous colors or progress. New MM4 run codes optionally carry a fifth color; historical four-color payloads keep their original canonical format.

The existing art was preserved. Built-in imagegen edited the registered material guides to identify exposed skin in cyan, while retaining blue fabric, magenta twin tails, yellow ornament and red energy. Packed grayscale masks preserve source shading and clip alpha after all transforms. Final guides and prompt briefs: [art-source/reaper/PROMPTS.md](art-source/reaper/PROMPTS.md). Rebuild: `node tools/process-reaper-art.mjs`.

## Controls and attacks

- Blink: choose the ability, then click/tap a visible enemy. Empty, offscreen and nonfinite taps spend no cooldown. Teleportation projects onto walkable ground and preserves brief arrival evasion. A heavy focused strike plus smaller nearby sweep scale with Release and Kingslayer.
- Arc: choose the ability, then click/tap an enemy or battlefield direction. Three spinning, piercing crescents follow different curved paths toward that point. Clicking an enemy snaps their destination to the prey.
- Basic crescents automatically curve toward nearby prey. Movement and last facing determine the curve side; the generated crescent art rotates in that direction. Each projectile damages each enemy only once and continues curving beyond its target in the same spin direction.
- Eclipse: every 0.38-second pulse damages the nearby aura while two curved crescents seek a captain, Titan, elite, guard, shooter, then lesser prey. The close aura retains its prior total damage budget; its visual scales with its damage reach. Duration boons extend the active state. Scythe damage still shares one capped life-steal budget.

Concentrating arcs on chosen targets made the old Stage 2 2.8x ranged-captain multiplier excessive. Only Reaper's multiplier changed to 1.8x to offset her improved focus. No other champion's kit or Stage 1 combat was retuned. New competition rules are v26 for hunts and Reaper Stage 1, so altered Reaper scores are not merged into v25 comparisons. Previous rules remain verifiable.

## Measurements

Three seeds (77, 123, 444), real incoming damage, no immortality:

| Reaper | Average time | Body count | Dominance | Time range |
|---|---:|---:|---:|---:|
| Stage 1 survival | 11:28 | 24,764 | 2,244,676 | 11:10–11:46 |
| Stage 2 clear | 8:20 | 5,086 | 10,197,282 | 7:41–8:47 |

All three hunts cleared. The Stage 2 controller knows the routes and uses automatic target selection; these are optimistic compared with a human learning the map and choosing targets. The previous v25 Reaper averaged 10:31 survival and 9:01 clear. The other champions' previous measurements remain in [the v25 release report](STAGE2_REAPER_RELEASE_REPORT.md).

The Reaper stress case used 200 wall-contact enemies, Eclipse active and 4x CPU throttling. Update p95 was 14.7 ms, draw p95 3.6 ms, cache peak 36, with no page/terrain failures. Headless measurements on this host do not predict a tester phone's sustained GPU performance.

## Verification

- 170 unit/regression tests pass: curved off-axis hits, single hits per projectile, facing-dependent curve side, priority targets and damaging aura, controlled Blink and scaling, healing caps, unlock gates, old/new codes and skin backup round trips.
- All original five champions still match the deployed v15 combat-state hashes through ten minutes for two seeds each.
- Real desktop/touch checks click every champion's swatches, independently change all five Reaper colors, select distant Blink prey, reject empty taps, aim Arc, cancel targeting and encode completed results with the chosen skin.
- Four-format pixel checks show independent skin, hair and fabric recoloring. All 24 art sets and 100 masks pass dimensions, grayscale, alpha containment and animation-boundary checks.
- Existing browser regressions cover both-stage unlock, distant-death Rise Again, worker music, all six hunts, boon choices, seals, results and isolated tester progress. GitHub Pages artifact has 704 production files and verified relative routes/PWA scope.

Ignored detailed measurements and screenshots are in `test-results/`, including `reaper-controls-v26.json`, `balance-reaper-v26-final.json`, `stage2-reaper-v26-final.json`, `stage2-v26-performance.json`, `unit-v26-final.txt` and `stage1-parity-v26.txt`.
