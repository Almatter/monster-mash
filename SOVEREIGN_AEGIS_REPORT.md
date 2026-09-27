# Sovereign's martial and magic sustain — 2026-09-26

Sovereign now combines his existing kill-earned Devour healing with a small magical Aegis ward. Protection has three routes: Devour, Death Beam and Catastrophe. Feeding remains the main recovery tool; magic can rebuild protection when feeding is unavailable. Rupture continues creating space through knockback.

## Rules

- Devour still heals up to 40% maximum health per cast and grants six seconds of Feeding Rage (40% increased damage, 25% damage reduction).
- Each actual Devour kill now grants 4 ward in base form, increasing by 1 per Release to 8 at Final Release. This also works at full health; earned ward does not depend on missing health or actual healing received.
- Death Beam and Catastrophe kills each grant 1–2 ward as Release rises, limited to 20–40 ward per completed cast. Beam pays out once when its sweep ends; Catastrophe pays out on impact. Empty and nonlethal casts never award or refresh ward.
- All three sources share one 100–180 capacity, increasing by 20 per Release. Successful rebuilding refreshes an eight-second lifetime. Ward absorbs damage after Feeding Rage's reduction; repeated casts cannot exceed capacity. Calamity retains her much larger 480-capacity ward.
- Claws, Rupture and incidental collision kills do not earn Aegis. Healing and damage numbers are unchanged.

Landing-page ability and passive descriptions explain both recovery routes. The combat health readout shows `AEGIS` and its remaining amount. Rules advance to `2026.10-v10-aegis`; historical codes and cosmetics remain supported, with competition bests scoped to the new rules.

## Generated artwork

Built-in imagegen produced a new Sovereign-specific sapphire/silver enchanted armor ward, using separated horn-shaped petals and gold trim. PNG master: [sovereign-aegis.png](art-source/vfx/sovereign-aegis.png). Runtime: [sovereign-aegis.webp](public/assets/vfx/sovereign-aegis.webp). Exact final prompt: the `sovereign-aegis` section of [CHAMPION_AURA_PROMPTS.md](art-source/vfx/CHAMPION_AURA_PROMPTS.md).

The runtime sprite is 768 square, about 174 KiB, with transparent center and corners. It layers with Sovereign's generated Unbound coronation aura and a slightly smaller, dimmer Feeding Rage effect while the shield is present. It remains visible independently after Rage ends and disappears when ward is spent or expires. Low FX retains the gameplay status art.

## Survival comparison

Same unchanged active-play benchmark (`tests/balance.mjs`) and seeds 77/123/444. Before: v9, `balance-late-speed-after.json`. After: `balance-sovereign-aegis-after.json`. Every run ended naturally before the fifteen-minute cutoff; no invulnerability or health resets. These are three-seed automated comparisons, not human survival predictions.

| Champion | Before | After | After individual runs |
| --- | --- | --- | --- |
| Sovereign | 10:33 | **11:32** | 11:50, 11:29, 11:18 |
| Calamity | 11:13 | 11:13 | 11:05, 11:33, 11:01 |
| Overlord | 11:25 | 11:25 | 11:21, 11:09, 11:44 |
| Titan | 11:23 | 11:23 | 11:41, 11:23, 11:06 |
| Devourer | 11:42 | 11:42 | 11:39, 12:16, 11:11 |

Sovereign gains 59 seconds on average and is now within 10 seconds of Devourer. Other champions reproduce their previous seeded results exactly. A separate diagnostic policy that maintains Rage and casts Devour before Rupture averages 11:10 (11:04, 10:56, 11:31), versus its pre-Aegis 10:46. Ability timing affects healing and available prey; continuous buff upkeep is not automatically the highest-survival strategy. This diagnostic uses no combat-stat changes.

## Verification

62 unit tests pass, including actual kill credit, full-health protection, empty/nonlethal casts, base/Final caps, independent magic rebuilding, once-per-beam payout, shared capacity, damage absorption with Rage, expiry and fresh-run reset. Historical v10 codes remain readable when future rules advance.

Desktop and landscape touch checks activate the real Devour button and verify earned ward, the Aegis HUD, generated asset and expiry. The five-champion aura suite verifies layered Unbound/Rage/Aegis art, shield-only and Rage-only states, Low FX and expiry. Its static 696-enemy aura render fixture passes the existing 16.7ms p95 budget; Sovereign measured 10.4ms desktop and 9.7ms landscape on this host. Transient cast/death effects are cleared before the static aura measurement so they cannot remain frozen indefinitely in this fixture.

The all-five-champion Pages gameplay/result/verifier smoke, desktop/touch movement and outcome checks, and 172-file production package verification pass.
