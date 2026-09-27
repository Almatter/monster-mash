# Late-match pursuit correction — 2026-09-26

The v8 fix removed champion-dependent pursuit, but left two escape problems: unbounded wave acceleration and off-screen teleporting. Its single-frame checks established independence, not useful late-match separation. This revision tests sustained retreat instead.

## Movement changes

Enemy natural speed growth stops at wave 21 (ten minutes). Pursuit and natural movement both respect fixed species limits, independent of the selected champion or their bonuses:

| Enemy | Maximum forward speed |
| --- | ---: |
| Thrall | 155 |
| Hound | 235 |
| Wing | 205 |
| Spitter | 110 |
| Brute | 125 |
| Elite | 140 |
| Titan | 110 |

Wings retain their lateral weaving (up to 45 units/sec). Ranged positioning and boss windups still govern movement. Knockback is separate from self-propelled speed.

Previously hounds reached 307 at twelve minutes and 386 at fifteen minutes. Ordinary distant enemies also shared a 252 catch-up floor at twelve minutes. Devourer walks at 274.4 after Final Release, or 315.56 with the full recent-kill bonus; the fastest pursuer now stays at 235. This gives him 39.4–80.56 units/sec of separation by running, without Lunge. Speed growth cannot erase that margin in longer matches.

Fully released walking speeds are Sovereign 217.3, Overlord 210, Calamity 202.8 and Titan 174.9. All can outpace ordinary thralls; hounds still threaten these slower champions and wings can pressure Calamity/Titan. Incoming enemies still surround the player, and the arena edge limits straight retreat. This creates room to reposition rather than unlimited safety.

Ordinary enemies escaped beyond 1,150 units leave without kill, healing or score credit. They no longer teleport to 820 units behind the player. Elites and titans remain alive at their actual positions, retain health/identity, and continue approaching; escaping never deletes a boss. New waves continue spawning normally.

Rules advance to `2026.10-v9-escape`. Historical v6/v7/v8 codes and cosmetic progress remain supported; best scores stay separated by ruleset.

## Verification

56 unit tests pass. Controlled pursuit fixtures cover all seven enemy types against all five champions through thirty minutes. Sustained three-second retreats at 8:30, 10, 12, 15, 20 and 30 minutes show Devourer gaining over 117 units against a hound without a kill bonus, and over 240 with it. No dash is used, and no kills are credited in these isolated movement fixtures. All five champions steadily separate from thralls after Final Release. Tests also check escaped enemy accounting, boss persistence, bounded wave acceleration and historical run-code compatibility.

Desktop keyboard and landscape touch browser checks exercise actual three-second retreat controls at fifteen minutes, both with and without the kill-speed bonus. The all-five-champion Pages route/gameplay/result/verifier smoke and production packaging also pass.

## Survival comparison

Same unchanged active-play policy (`tests/balance.mjs`), seeds 77/123/444. Before: v8, recorded in `balance-pursuit-after.json`. After: `balance-late-speed-after.json`. Every run ended naturally before the fifteen-minute cutoff; no invulnerability or health resets are used in this survival benchmark. Three-seed automated averages are comparisons, not predictions of human play.

| Champion | v8 average | New average | New individual runs |
| --- | --- | --- | --- |
| Devourer | 10:47 | 11:42 | 11:39, 12:16, 11:11 |
| Sovereign | 10:15 | 10:33 | 10:46, 10:16, 10:36 |
| Calamity | 10:33 | 11:13 | 11:05, 11:33, 11:01 |
| Overlord | 10:35 | 11:25 | 11:21, 11:09, 11:44 |
| Titan | 10:43 | 11:23 | 11:41, 11:23, 11:06 |

The change extends average survival by 18–55 seconds. All averages are above ten minutes; Devourer is now closest to twelve. Champion damage/sustain statistics, Carnage scoring, wave timing and qualification gates are unchanged.
