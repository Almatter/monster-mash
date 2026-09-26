# Controls, names, outcomes and pacing review — 2026-09-26

## Implemented

All five champions pair their compact combat action label with their full fantasy ability name in the landing-page kit, button tooltip, accessible name and ultimate announcement. Combat buttons keep their readable action labels. Devourer uses Lunge / Riftfang Lunge, Devour / Maw of Ruin, Execute / Royal Execution and Feast / Feast of the Unbound. Player-facing references to the old Frenzy label now say Feast. Internal effect IDs remain stable.

Devourer Lunge follows movement, independently of aimed attacks. Current keyboard/stick input is sampled at activation, even before the next simulation step. Stationary casts preserve the last movement heading; a new unmoved incarnation lunges right. Rapid recasts can redirect along new movement while retaining accumulated dash duration and kill attribution. Charges, damage, cooldowns and dodge protection are unchanged. Titan's aimed Stampede is unchanged.

Natural-end presentation is now A LEGEND IN THE MAKING before Final Release, FULLY UNBOUND after reaching Final Release, and TEN-MINUTE LEGEND at 600 seconds or longer. These are celebratory milestones, not victory conditions or engine limits. Manually ended runs remain clearly marked practice. Actual death/retirement remains in the sealed code and verifier; cards and copied summaries use the same milestone helper as the result screen. The result screen explains the three sharing buttons.

Movement affects play, so the ruleset advances to `2026.10-v7-movement`. Shipped v6 MM4 codes stay readable. Prior scoped bests remain stored and separate from v7 comparisons; cosmetic records/titles are preserved. Carnage, enemy speed, spawn timing, wave rules and access gates are unchanged.

## Validation and survival

50 unit tests pass, including cardinal/diagonal movement against opposite aim, physical dash displacement, stationary heading, rapid recast redirection, invalid vectors, Titan isolation, all 20 labels, and milestone boundaries without stopping play.

Desktop and actual touch-landscape browser checks cover every champion's kit/buttons, keyboard changes before the next tick, held joystick plus simultaneous Lunge activation, stationary casts, real result-screen fixtures at 100/510/600 seconds, sealed ending metadata and sharing explanations. Existing guidance, mobile HUD and beta verifier checks pass. Visual review covers milestone results on desktop and touch.

Active-play policy in `tests/balance.mjs`, Devourer seeds 77/123/444: 650, 614 and 643 seconds (10:50, 10:14, 10:43), average 635.67 seconds, rounded **10:36**. All three runs ended naturally. This is a three-seed scripted balance comparison, not an estimate of human average survival. No other kit's mechanics changed.

## Carnage: findings and options, not implemented

Current values: +0.018 per kill, cap ×5, decay only after 1.6 seconds with no kills, then −0.24 per second. About 223 ordinary kills reach the cap from ×1 (Calamity resonance can reduce that). Falling from ×5 to ×1 needs about 18.3 uninterrupted seconds without a kill. Automatic attacks, heavy spawn pressure and owned servant kills make that uncommon. Raising/removing the cap alone would grow scores without creating the proposed fluctuation.

| Option | Advantages | Costs / risks |
| --- | --- | --- |
| Burst-responsive Carnage with continuous decay | Well-placed multikills create visible peaks; cooldown timing matters; Release can raise a bounded ceiling; preserves relentless combat | Broad AoE and servant chains may dominate single-target kits; every scoring/feat/title dependency needs migration; feedback must stay legible |
| Faster champions / slower pursuit | Positioning can create genuine escape and recovery; safety can trade away income; clearer risk/reward | May turn play into endless kiting; changes survival and sustain across all five kits; distant enemies currently scale pursuit partly from champion base speed, so speed buffs alone are insufficient |
| Defined wave breaks with optional early advance | Deliberate rest versus aggression; clear rounds and recoverable cooldowns; more varied rhythm | Requires a wave-system redesign; empty-arena waiting must not grant free Unbound stages or infinite healing; finite batches can create boss cleanup chores |

Recommended first scoring experiment: keep a modest contribution from ordinary kills, let genuinely large activations create temporary bonus peaks, and decay the bonus continuously. A bounded ceiling can rise with Release. Do not select formulas or caps solely to make larger numbers: compare multiplier distribution, skill expression and score opportunities across all five champions. Existing Calamity resonance, ×5 streak achievements/titles, run-code peak validation and score history would need explicit treatment in a new scoring ruleset.

For actual escape, examine pursuit scaling, encirclement and off-screen straggler recycling together. Far enemies currently rush at at least `max(champion.speed × pursuit, 180 × pursuit)` and reappear nearer when more than 1150 units away after the opening. Slow nearby enemies alone do not remove that pressure. Overlord's army may continue killing while its champion retreats, and ranged basics have much longer reach than melee basics, so quiet-time decay is not equally controllable for every kit.

## Waves and respite, not implemented

Currently Wave = floor(active seconds / 30) + 1. It is a timed pressure tier, independent of cumulative Body Count. New enemies arrive continuously at the current threat rate/cap. Elites and Titans persist until killed. At 10:00 the displayed tier is Wave 21, regardless of how many enemies were slain.

A coherent round-based alternative is a finite encounter budget, a remaining-enemies counter, and a brief 3–5 second recovery interval after clearing it, with an explicit Call next wave option to start early and keep pressure/Carnage up. Kills required per round can rise, but a kill quota alone does not guarantee a safe breather if enemies remain. Decide whether bosses must die to clear a round: guaranteed safety conflicts with carrying live elites/Titans into the break. Keep encounter progress separate from optional idle time so waiting cannot unlock Final Release for free. A short respite can restore cooldown time without necessarily offering free health regeneration. That preserves the current kill-based sustain identities.

This is a substantial pacing change. Test it separately from a new Carnage formula so their effects can be distinguished. If retaining the current continuous mode, Pressure tier would describe the counter more precisely than Wave.

## Sharing

Copy results: human-readable text containing identity, title, champion, score, time, week/rules, milestone and the run code. Suitable for a chat post.

Copy run code: only the opaque verification code. Suitable for the organizer verifier or an attached submission.

Save result card: a PNG of portrait, identity/title, stats and context. It does not contain the full run code, so send the code alongside the image for verification. The result screen now explains this distinction.

## Qualification ticket, not implemented

An earned access badge is a useful future gate if it demonstrates readiness rather than repetitive farming. Suggested initial rule: on any one champion, complete three meaningful runs (for example at least five minutes each), and reach Final Release plus defeat an elite during at least one completed run. Use survival and combat milestones rather than a shared Dominance threshold, which is sensitive to champion scoring and future Carnage changes. Numbers remain proposals to test with new players.

Qualification should unlock access when the next scenario becomes available, not award its achievements or auto-enter it. Display Qualified · opens [date] before release. Track eligibility independently of the equipped cosmetic title: removing the title, recoloring or changing champion must not revoke the ticket. I would initially make it account/profile-wide after qualifying with one champion, allowing experimentation with other kits in the unlocked challenge. Persist earned access through later balance changes.

Benefits: visible mastery, an achievable preparation goal, a stronger reason to replay and clear challenge progression. Risks: dividing friends into qualified/unqualified groups, blocking newcomers from a short community event and turning into a grind. Keep the first gate modest and publish its exact conditions. Current local storage is browser-specific, so continuity across devices needs planning before access matters; a phone and PC currently have separate profiles.
