# Crucible difficulty and native-kit check

Hell is tougher in configuration, but the shared champion burst safety limits reduce the perceived difference on attacks that already reach the damage ceiling. The differences show more in ordinary hits, sustained combat, aim, reactions, sustain and long sieges.

| Rival setting | Easy | Normal | Hard | Hell |
| --- | ---: | ---: | ---: | ---: |
| Raw damage against the controlled champion | 50% | 65% | 80% | 100% |
| Effective durability multiplier | 65% | 80% | 90% | 100% |
| Healing/shield sustain while crystal survives | 35% | 55% | 75% | 100% |
| Earliest notice delay | 1.10 s | 0.85 s | 0.65 s | 0.45 s |
| Earliest spacing between AI cast attempts | 2.80 s | 2.20 s | 1.65 s | 1.35 s |
| Aim error | 90 | 60 | 35 | 16 |
| Explicit miss probability | 35% | 23% | 12% | 6% |

All difficulties preserve a 50%-of-health rolling three-second ability burst ceiling against the player. The individual hit ceiling starts at 13% and increases with Might; native basics remain outside the shared ability budget. Actual damage below those caps responds to the raw damage multipliers. Hell has no automatic siege escalation; easier modes gradually ease supported sieges. These values describe the code, not an independently validated human skill benchmark.

## Historical v50 controlled native-kit duels

These results were recorded under v50 at commit 710bd02, before the v51 sustained-damage corrections below. Run `node tools/benchmark-crucible-duels.mjs` to benchmark the currently checked-out rules; current results will differ from this historical baseline. Three seeds (17, 23, 41), all 28 pairings: 84 duels total, 21 appearances per champion. Both sides use the same AI with Hell modifiers. Full native kits, 1,000 starting mana, a 90-second round limit, no upgrades, minions, bases, shops, terrain or traps placed before the duel. Starting separation is 280 world units. This is a close-combat diagnostic, not player win rates or full-stage balance. Removing armies and preparation especially limits summoners and trappers.

| Champion | Wins | Losses | Draws |
| --- | ---: | ---: | ---: |
| Lycanthrope | 20 | 1 | 0 |
| Titan | 17 | 4 | 0 |
| Calamity | 15 | 6 | 0 |
| Sovereign | 13 | 8 | 0 |
| Devourer | 9 | 12 | 0 |
| Reaper | 7 | 14 | 0 |
| Overlord | 3 | 18 | 0 |
| Hag | 0 | 21 | 0 |

This flags strong close-range performance from Lycanthrope and Titan; the ranged Calamity also performs strongly. Devourer is not universally dominant in these duels. His recovery, melee basic attacks and ability to maintain combat pressure can still make an efficient human-led siege run forgiving. A nine-minute clear alone cannot establish a full-match melee advantage. The next meaningful balance study should compare whole-map participation, objective contribution, mana generation, recall cycles and outcomes across champions with a consistent player-control model, then validate against real player runs.


### Opportunistic crystal finishes (Hell)

Hell rivals now evaluate visible nearby crystals while their owners are recalling. A finish may override retreat, shopping and escort preferences when the rival still has a living crystal of its own, can finish before the defender returns, and can survive long enough to land the finishing damage. The calculation includes current crystal health and wards, unsupported siege mitigation, basic attack cadence, affordable ready direct spells or a discounted beam window, current health/shield and base retaliation timers. It does not require surviving afterward or waiting for a full escort. The decision is revisited on attention scans, keeps normal noticing delays and vision restrictions, and does not change damage or defenses. Other difficulties retain their cautious policy.

Regression tests cover native combat finishing despite a retreat plan, rejected suicidal failures, mana/cooldown limits, fog and line of sight, defender return and loss of the attacker's respawn crystal. Guardian/crystal retaliation now also clears immediately when the protected champion dies, returning to the closest eligible target; an already fired projectile may still arrive afterward.


### Sustained damage and recovery counters (v51)

Withering Strikes costs 150 mana plus 80 per existing rank, to three ranks. Champion basics and abilities that damage health or an existing shield apply a four-second wound, reducing healing, life steal and newly generated shields by 15% per rank (45% maximum). Each attacker refreshes its own wound; only the strongest active wound applies. It affects native recovery, Spoils of War, Mend, cast/hit wards and Titan's moving barrier regeneration. It does not remove existing shields, reduce maximum health, bypass invulnerability, or reduce recall restoration; wounds clear on respawn. Selling the stat prevents new wounds without erasing one already inflicted.

Stage 4 no longer grants the generic 0.32-second post-hit immunity used by earlier scenarios. Native dodges, leaps, ultimates that explicitly avoid damage, and respawn invulnerability remain. Basics no longer consume or get blocked by the shared spell budget, so Rending Rhythm and Haste produce actual sustained pressure. Abilities still share a 50%-health rolling three-second damage budget, including absorbed shield damage; Might increases the individual hit limit by the same percentage as its damage bonus. Maximum rank still cannot turn four simultaneous abilities into an instant full-health kill.

These are Stage 4 rules. Older stages and their mimic combat retain their existing protection. New scores use v51 best-score categories; v49 and v50 run codes remain verifiable. Unit tests exercise real native basics and healing routes, shield contact, expiry, stacking, respawn, sales, per-hit scaling and combo limits. Desktop/mobile browser checks cover the new purchase, refund and wound status.
