# Champion-independent pursuit — 2026-09-26

Enemy catch-up speed no longer reads the selected champion's base movement speed. It now uses the existing shared floor of 180 world units per second multiplied by the existing time-based pursuit curve, or the enemy species' wave-scaled speed if that is faster. Nearby enemy movement, spawn pressure, arena boundaries and off-screen recycling are unchanged.

The old coupling read base champion speed; it did not directly copy temporary Predatory Momentum or Unbound bonuses. It nevertheless made distant enemies faster against faster champion definitions. This link is now removed. Devourer and other champions retain the full relative benefit of base and earned movement speed. No champion kit statistics were changed.

Rules advance to `2026.10-v8-pursuit`. v6 and v7 codes and saved cosmetic progress remain supported; competition bests remain separated by ruleset.

## Validation

53 unit tests pass. New tests measure actual movement of the same enemy across all five champions at 0, 120, 480 and 720 seconds; increased base speed and Devourer kill bonuses produce larger escape gaps without changing enemy speed. Species/wave speed differences and natural movement near the player remain intact. Historical MM4 checks include v8 after future rules changes. Desktop/touch Lunge and milestone checks, five-champion Pages routes/codes and production packaging pass.

## Active-play survival comparison

Before: revision `571cf0d` / v7 movement rules. After: v8 pursuit rules. Same unchanged `tests/balance.mjs` policy and seeds 77/123/444, before and after the fix. Every run ended naturally before the 15-minute simulation cutoff. No invulnerability or health reset is used. These are three-seed automated comparisons, not human survival predictions.

| Champion | Before | After | After individual runs |
| --- | --- | --- | --- |
| Devourer | 10:36 | 10:47 | 11:05, 10:38, 10:39 |
| Sovereign | 10:27 | 10:15 | 10:05, 9:54, 10:45 |
| Calamity | 10:34 | 10:33 | 10:58, 10:31, 10:10 |
| Overlord | 9:59 | 10:35 | 10:57, 10:36, 10:12 |
| Titan | 10:43 | 10:43 | 10:33, 10:50, 10:47 |

All means remain near ten minutes. Reduced pursuit does not monotonically increase survival for a policy that actively closes on targets: positioning, incoming spawns and ability kill opportunities change. Titan is identical because its old pursuit already used the 180-unit shared floor.

Carnage scoring, wave timing and qualification gates remain unchanged.
