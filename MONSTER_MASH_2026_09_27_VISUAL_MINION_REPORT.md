# Directional sprites, Overlord soul brands and undead hunting — 2026-09-27

Rules: `2026.10-v14-undead-hunt`. This supersedes v13 for new run records; v6–v13 MM4 codes remain readable and historical personal bests stay scoped to their own ruleset.

## Visual changes

Every playable champion's existing generated gameplay atlas now mirrors horizontally with leftward walking and faces normally when walking right. Pure vertical movement and standing still retain the last horizontal side; fresh runs begin facing right. This uses keyboard/joystick movement, independent of pointer aim. The floor, shadow, projectiles and attack effects are not mirrored. Character palettes and artwork remain intact.

Two transparent, hand-painted anime isekai assets replace placeholder shapes. `titan-cleave.png` replaces Titan's generic basic-attack arcs with fractured crimson basalt and molten-gold impact shards. `overlord-soul-brand.png` replaces plain corruption and servant ownership circles with broken black-gold crown chains and teal ghost fire. It also identifies his Raise, Dominate, Curse and corruption effects. Enemy attack windup telegraphs remain because they convey danger. Both effects remain visible in Low FX.

Built-in imagegen created the source PNGs in `art-source/vfx/`; `node tools/pack-combat-vfx.mjs` validates their transparent center and packs 512px WebP sprites into `public/assets/vfx/`. Exact prompts: `art-source/vfx/COMBAT_VFX_PROMPTS.md`.

## Undead targeting

Servants originally searched 360 units around themselves and walked directly onto Overlord when idle. Now, while no enemy is within 260 units of Overlord, they look up to 700 units away and hold dispersed 85-unit patrol positions when they have no target. When enemies enter his immediate area, they resume the original 360-unit defensive search and regroup, preserving his cover. Speed, attack damage, attack timing, duration, army cap, conversion and scoring are unchanged. Larger unconditional hunts, extra separation and a wider Raise spawn ring were tried but discarded because they reduced survival in the three-seed benchmark.

## Matched survival and scores

Twelve predetermined seeds: 77, 123, 444, 17, 53, 101, 222, 555, 987, 2026, 314, 909. Identical active-play policy and natural death with no protected health or reset. Baseline restores the shipped v13 servant behavior; after uses the final guarded hunt. Both use unchanged combat statistics. Results are automated-policy averages, not a human playtime guarantee.

| Overlord | Average survival | Average Body Count | Average Dominance |
| --- | ---: | ---: | ---: |
| Before | 11:00 | 32,027 | 3,049,036 |
| After | 11:13 | 33,092 | 3,176,435 |

Change: +12.8 seconds survival, +1,065 Body Count and +127,399 Dominance. The three original seeds alone averaged 11:25 survival before and after, so the larger sample is more informative. The other four champions have no combat changes in this version.

| Seed | Old survival | New survival | Old kills | New kills |
| --- | --- | --- | ---: | ---: |
| 77 | 11:21 | 11:16 | 33,864 | 33,498 |
| 123 | 11:09 | 11:31 | 32,985 | 34,689 |
| 444 | 11:44 | 11:29 | 36,000 | 34,569 |
| 17 | 11:15 | 10:59 | 33,116 | 31,767 |
| 53 | 11:02 | 11:19 | 32,248 | 33,637 |
| 101 | 10:38 | 11:15 | 30,006 | 33,354 |
| 222 | 10:23 | 10:38 | 28,740 | 29,862 |
| 555 | 11:16 | 11:28 | 33,601 | 34,540 |
| 987 | 11:02 | 10:58 | 32,234 | 31,640 |
| 2026 | 10:13 | 11:29 | 27,890 | 34,645 |
| 314 | 11:07 | 11:07 | 32,365 | 32,386 |
| 909 | 10:52 | 11:07 | 31,276 | 32,518 |

Reproduce the final result with `BALANCE_SEEDS=77,123,444,17,53,101,222,555,987,2026,314,909` and `node tests/balance.mjs overlord-hunt-after12 overlord`.

## Checks

76 unit tests pass, including flip memory for all five champions, servants finding distant prey while Overlord is safe, independently pursuing enemies on opposite flanks, fanning out during quiet moments, and keeping close defensive search under threat. Real rendered atlases flip at desktop and landscape sizes. Titan's basic attack draws the generated art; corrupted enemies, raised servants and casts draw the generated soul brand in normal and Low FX. The production package contains 175 files and keeps Pages paths relative.

A 400-corrupted-enemy/24+-servant rendering fixture measured p95 below 13ms at desktop and landscape sizes on this host. Its high enemy health is only for render workload isolation, not the survival comparison.
