# Stage 2 v25: tester fixes and Reaper

Validated October 4, 2026. Local entry: http://127.0.0.1:4173/stage2-test/. Public testing entry: https://almatter.github.io/monster-mash/stage2-test/.

## Player-facing changes

- Repaired the keep and chapel rear masonry shown in the reports, added curved courtyard-wall collision, and retained walkable captain pockets, entrances and retreat routes. All five districts share the corrected footprint approach.
- Rise Again suspends the old battlefield renderer while the next run prepares its opening terrain. The button displays preparation, rejects duplicate clicks, and shows a retryable error if preparation fails. A browser loss far from the origin now restarts with healthy player art and opening terrain.
- Titan health text rounds fractional maxima for display; the underlying health value and balance are unchanged.
- Stage 2 instructions focus on hunting ten captains, claiming seals, choosing boons, guard tactics, healing oases and fast clears. Removed the automatic Final Release reminder and visible minion-budget statistics. Result screens lead with identity, outcome, score and a short hunt summary; the full statistics and feats remain in an optional Run breakdown.

## Reaper

Adult gothic anime monster with two long high twin tails and an ornate scythe. Generated selection art, portrait, ultimate cut-in, five gameplay animation states and seven character-specific effects. Four continuous shaded material masks preserve ink, skin and fine silhouette detail in contrasting palettes. Armor and flowing fabric use PRIMARY, twin tails and hair use SECONDARY, metal ornament uses ACCENT, and soul energy uses POWER. Changing fabric color leaves hair unchanged and changing hair leaves fabric unchanged, verified across all four presentation types. The complete recolored gameplay, portrait and cut-in load before her match starts. Scythe effects follow the selected soul-energy color.

- **Crescent Sever:** automatic piercing ranged scythe waves aimed at nearby prey.
- **Soul Harvest:** scythe sweep, knockback and life steal.
- **Graveshift:** blink toward nearby prey and slash, with brief dodge protection.
- **Reaping Arc:** three piercing ranged crescents.
- **Eclipse Requiem:** eight seconds of repeated ranged waves and sweeping cuts, including when no basic target is in reach.
- **Soul Tithe:** shared, capped life steal across scythe attacks. Duration, attack speed and other hunt boons improve the applicable parts of her kit.

Three mastery titles: The Soul Collector, Eclipse Eternal and Between Worlds. Progress belongs to Reaper and can accumulate across both stages. Existing titles and progress remain intact.

Her availability uses the **same Stage 2 gate**: seven qualifying days with one champion, The Gatebreaker, and the October 8 official opening. Qualification can be earned on any original champion. Once Stage 2 is open for that player, Reaper is selectable in either stage. The testing endpoint bypasses the gate and continues to isolate tester progress from official progress.

Built-in image generation/editing was used for all new bitmap art. Source assets and prompt briefs: [art-source/reaper/PROMPTS.md](art-source/reaper/PROMPTS.md). Reproducible production packing: `node tools/process-reaper-art.mjs`. No diagnostic shapes replace her artwork.

## Performance

Procedural battle-score generation runs in a cancellable module worker. Completed jobs release their transferred PCM references after copying the audio buffers. Canvas occlusion paths are precompiled and selected through spatial buckets; stable terrain views skip redundant queue construction. Offscreen shots and effects skip painting. Coarse-pointer pixel density is capped at 1.5; explicit Low FX caps it at 1. Camera coverage remains 912,000 world units on desktop and mobile.

The Sovereign mobile-sized browser stress check used a 3x-density, 844x390 touch viewport, 4x CPU throttling and 200 wall-contact enemies. Both FX settings had a 20 ms frame-interval p95, no page/terrain failures and at most 24 cached terrain sections. Headless timing measures this host's browser simulation; it does not predict the tester phone's GPU, thermal behavior or sustained FPS. A hardware retest remains necessary to confirm the reported occasional stutter is resolved there.

## Balance measurements

Three identical seeds (77, 123, 444), real incoming damage, no immortality. Stage 1 uses the reproducible active-play controller. Stage 2 uses a practiced route, captain circling and deterministic boon choices; these clear times are optimistic for first-time human navigation.

| Champion | Stage 1 survival | Stage 1 body count | Stage 1 Dominance | Stage 2 clear | Stage 2 body count | Stage 2 Dominance |
|---|---:|---:|---:|---:|---:|---:|
| Overlord | 11:00 | 31,965 | 3,039,015 | 9:26 | 6,310 | 9,343,193 |
| Calamity | 11:38 | 36,124 | 3,455,472 | 7:52 | 5,290 | 9,801,148 |
| Devourer | 11:03 | 30,595 | 2,875,128 | 5:05 | 2,559 | 9,767,984 |
| Titan | 11:41 | 36,849 | 3,561,191 | 6:51 | 4,022 | 10,292,647 |
| Sovereign | 11:25 | 35,506 | 3,430,936 | 6:19 | 4,039 | 9,658,692 |
| Reaper | **10:31** | **25,359** | **2,192,025** | **9:01** | **5,622** | **10,219,111** |

All 18 automated Stage 2 runs cleared. Reaper's Stage 1 survival ranged 9:44–11:14; Stage 2 clears ranged 8:01–10:07. She has lower Stage 1 body count and Dominance than the original champions in this controller, but comparable survival and a strong hunt showing. Human tuning should assess her ranged positioning and blink choices as well as these averages.

## Verification and compatibility

- 167 unit/regression tests pass, including shared sustain caps, piercing hit uniqueness, continuous ultimate firing, duration boons, mastery persistence, same-champion access and current result-code round trips.
- The original five champions match exact deployed v15 Stage 1 combat-state hashes for two seeds per champion through ten minutes. Their combat balance and Stage 1 rules are unchanged.
- Current hunts use v25 rules; Reaper Stage 1 uses its own v25 rules. Previous run-code versions, including v24, retain verification support. No save/progress schema reset or migration discards existing progress.
- All six hunt kits, seals, boon pause, victory/results, title isolation, ordinary production locks and desktop/mobile controls pass in the browser. Reaper unlock tested with Gatebreaker earned on Titan, in both stages after the opening date.
- Complete art sets, alternate colors, result portrait, correct rounded health, distant-death retry and the seven-layer worker score pass in a real browser.
- 24 registered art sets and 96 grayscale tint masks pass alpha, dimensions, coverage and frame-boundary checks.
- Five-region streaming keeps simulation still during a deliberately delayed terrain load, with zero blank frames. Character recovery passes after simulated image failures and unsupported bitmap decoding.
- Offline cached reload, safe worker update, bounded cache, equal camera area and the relative-path GitHub Pages build pass. Source art and developer files are excluded from the production artifact.

Machine-readable measurements and browser screenshots are in ignored `test-results/`, including `balance-v25-final.json`, `stage2-v25-balance-final.json`, `reaper-browser-v25.json`, and `stage2-v25-mobile-performance.json`.

Hair/fabric follow-up: the generated guides now assign ALL woven clothing panels and armor to the armor/fabric channel, and ONLY hair to the twin-tails/hair channel. Anatomical guide samples, independent mask coverage, contrasting browser composites and a downloaded result-card rendering verify the separation. Commands: `node tools/check-reaper-color-regions.mjs` and `node tests/reaper-colors-browser.mjs`. These cosmetic changes retain v25 combat rules and the measured balance above.
