# Devourer movement-directed claw waves — 2026-09-26

Rules: `2026.10-v13-moving-claws`. This supersedes the directional behavior and averages in the historical v12 wave tuning report.

## Fix

Feast claw waves were launched with `player.angle`, which can follow the mouse, a battlefield tap or the nearest enemy. They now snapshot `movementAngle`, the same direction memory used by Riftfang Lunge. WASD, arrows and the touch joystick control new wave directions. When stationary, waves retain the last movement direction; before the first movement, they fire right. Fresh runs reset this memory. Already launched waves continue straight and are not redirected by subsequent steering or aiming.

The generated wave art uses the projectile's launch angle. During the unlocked Feast state, the close claw animation also follows movement, keeping its visual orientation aligned with the wave. Circular melee damage still hits nearby enemies in every direction. Normal target acquisition, Unbound II unlock, width, travel, speed, damage, healing budget, Feast Guard, Predatory Momentum and all other kits retain their v12 values. Kit and sustain descriptions now explain movement control and the stationary fallback.

v6–v13 MM4 codes remain supported after future rules changes; scoped bests distinguish the new ruleset.

## Matched balance check

Same twelve seeds and active-play policy as v12: 77, 123, 444, 17, 53, 101, 222, 555, 987, 2026, 314, 909. All runs ended naturally before fifteen minutes, without protected health or resets. This change fixes the requested controls; the automated results do not establish a scoring improvement.

| Devourer version | Average survival | Average Body Count | Average Dominance |
| --- | ---: | ---: | ---: |
| v12, pointer-facing waves | 11:12 | 31,036 | 2,930,316 |
| v13, movement-directed waves | 10:58 | 30,132 | 2,820,152 |

Survival changes by -13.83 seconds; Body Count changes by -2.9% and Dominance by -3.8%. The bot often changes to circular movement near prey while continuing to aim at it; movement-directed waves necessarily change where it attacks. Human effectiveness needs playtesting with intentional steering. No balance values were changed to compensate for that policy.

| Seed | Survival | Body Count | Dominance |
| --- | --- | ---: | ---: |
| 77 | 11:11 | 31,604 | 2,969,045 |
| 123 | 11:15 | 31,814 | 3,021,050 |
| 444 | 10:42 | 28,367 | 2,635,290 |
| 17 | 11:21 | 32,443 | 3,077,440 |
| 53 | 10:40 | 28,213 | 2,600,245 |
| 101 | 11:13 | 31,059 | 2,937,525 |
| 222 | 11:14 | 31,473 | 2,981,970 |
| 555 | 10:45 | 29,240 | 2,660,450 |
| 987 | 10:36 | 28,580 | 2,641,740 |
| 2026 | 11:08 | 30,946 | 2,942,840 |
| 314 | 10:47 | 28,470 | 2,639,210 |
| 909 | 10:46 | 29,379 | 2,735,020 |

Reproduce with `BALANCE_SEEDS=77,123,444,17,53,101,222,555,987,2026,314,909` and `node tests/balance.mjs moving-claws-after devourer`.

## Validation

71 unit tests pass. Direction tests check all eight cardinal/diagonal inputs against opposing aim, actual forward kills and untouched side prey, matching claw-animation angle, steering subsequent waves, preserving old projectile directions, stationary memory and fresh-run reset. Existing circular melee, shared capped healing, guard, piercing and boundedness tests pass.

Desktop keyboard and real touch joystick browser checks steer up and left, then release movement. They verify actual projectile angles and generated-art rotation, including stationary persistence despite mouse or nearest-target facing. Real Feast activation, release gate, ranged kills and recovery, guard, Low FX and expiry pass. Five-champion Pages subpath gameplay/results/verifier checks pass. The production package contains 173 files.
