> The next beta pass adds champion-specific music and MM3 verification. See `DEPLOYMENT.md` for current run-code and hosting behavior.

# Monster Mash — Unbound pass, September 24, 2026

Implemented on the existing project. Pre-change Git checkpoint: `b7cbb91` (assistant-authored; no global Git identity changed). No broad redesign or persistent RPG progression.

## Art causes and fixes

- Calamity: full head exists in the master. Default Sharp cover resize into the copied 216×182 landscape box removed it before atlas assembly. A 154×228 contain envelope retains the entire tall silhouette at the existing in-game draw size/origin. No opaque pixels touch the atlas frame boundary in any animation.
- Devourer: a 230–240px-radius face exclusion suppressed the bone carapace and torso masks. Material classification now includes those regions.
- Titan: the face exclusion also covered helmet/armor. It is removed; metal/body material tints while deep linework stays neutral.
- Sovereign: the head ellipse excluded helmet and upper armor on selection. A much smaller skin-qualified preserve protects the human face, not the armor around it.
- All five: neutral deep ink preserved, registered grayscale masks clipped to base alpha; dark-purple Calamity coverage expanded; Overlord red-cloth classification unified across gameplay/selection. Visual contact sheet reviewed using pink/cyan/lime/white. Eighty masks pass structural validation, and all 120 used gameplay frames have nonzero edge margins.
- Developer art lab: original, four masks, composite, extreme presets, current-assets loading, local folder import, crop/origin/hitbox guides. Art/music labs are unlinked and redirect away on non-loopback hosts.

## Finite release rules

Survival time only; no kill/Carnage farming accelerates a release. Every incarnation resets to Base. Stage I at 2:30, II at 5:00, III at 7:00, Final at 8:30. Each stage applies 25% of the difference between base and the final values below. Timing was tested at 9:00 initially, then moved to 8:30 to leave a playable final climax. A 2.8-second nonblocking title, short impact, persistent stage HUD, stronger aura and larger attack presentation mark each release.

| Monster | Final damage | Radius | Attack interval | Cooldown | Movement | Distinct release mechanics |
|---|---:|---:|---:|---:|---:|---|
| Overlord | ×2.4 | ×1.45 | ×.90 | ×.84 | ×1.05 | Servant cap 16→20→24→28→32; summon 8→10→12→14→16; command 12→24; ultimate domination 16→32; corruption jump radius 105→152.25 |
| Calamity | ×2.45 | ×1.60 | ×.86 | ×.80 | ×1.04 | Beam width ×2.4; spell/field/ultimate radius grows; beam reach grows 21% |
| Devourer | ×2.5 | ×1.60 | ×.68 | ×.80 | ×1.12 | Lunge travel ×1.35, wider feeding/claws/execution reach; Frenzy combines with faster claws |
| Titan | ×2.6 | ×1.65 | ×.85 | ×.87 | ×1.06 | Knockback ×1.6, charge travel ×1.2, larger shocks/launches/body collisions |
| Sovereign | ×2.5 | ×1.50 | ×.82 | ×.80 | ×1.06 | Wider rupture/devour/catastrophe, knockback ×1.3, beam width ×1.8 and reach +17.5% |

Damage factors replace the old unbounded +7.5% per wave. Existing finite Rage/Frenzy/Hunger multipliers still apply. Cooldowns are set from copied definitions; global ability definitions never mutate. Devourer fastest Frenzy basic interval is .0952 seconds. Calamity's existing .75-second cooldown refund remains limited to once per second; no stage grants additional refunds. Sustain does not scale: Devour healing remains 35% (Sovereign 40%) per cast, Frenzy 25% per activation, Titan armor/heal cooldown/cap unchanged, Overlord siphon 42 HP/sec, Calamity ward 480 cap. Army pool 32, fields 8, bolts/debris 80, shots/effects 180, chain queue 128 with 16 processed per update.

## Horde and performance

Maximum enemy pool reduced 1100→720; common pressure cap 696 leaves 24 reserve slots. At 5 minutes pressure cap is 560. Brute weight replaces up to 12 percentage points of thralls after minute 7. Enemy health gains an additional linear multiplier after minute 9; damage gets a further ramp after minute 9 and steeper pressure after minute 11. Player survival bonuses stop at Final Release while enemy damage/health/pursuit continue growing. Opening composition/introduction timings remain intact.

Adaptive graphics use sustained frame-time and entity/effect load. After 1.5s pressure, each tier first drops blood particles, then secondary textures/beam stamps, then enemy bob and nonessential animation frames. Recovery requires 5s per tier. LOW FX selects the lowest cosmetic tier. Hit geometry, enemy pools, warning rings, score, RNG and progression never depend on graphics settings. Large attacks use grouped textures rather than extra damage entities.

Torches share eight world-space radius-19 circles with renderer anchors, offset to the visible stone foot. Player radius 23 and each enemy's actual radius project out of overlaps, preserving tangential movement. Contact recoil is resolved again against bases. Dash and zero-distance cases tested. Optional destruction was omitted.

## Music

Original WebAudio composition, no downloaded samples or new dependency: D harmonic minor with borrowed Phrygian E-flat, 112 BPM, 4/4, four distinct four-bar phrases. Seven asynchronously rendered 22.05kHz PCM stems loop on one scheduled transport: choir/drone, bass, ritual kick/toms, plucked motif/echo, Unbound ostinato, Titan bells/drone, results cadence. State changes automate gains without restarting the score. Active Titan state takes priority over Unbound. 20.2 MiB decoded PCM; seven sources remain bounded/reused across restarts. External catalog tracks remain supported.

Low-pass filtering, conservative gain, shared limiter and 40ms major-event ducking leave space for SFX. Master/music/mute, gesture unlock, pause and tab visibility use the existing audio buses/context. Disposal disconnects sources. `music-lab.html` auditions all six states and controls; `tools/render-music-preview.mjs` exports a WAV. PCM, playback scheduling, 60 rapid transitions, suspend/resume and cleanup passed; actual sound quality still needs human speaker/headphone audition because this environment has no listening-capable tool.

## Final seeded active-play results

Three deterministic seeds per kit, same moving/aiming/ability policy, no invulnerability or restored health. This is automated play, not a human skill study. Each run ended naturally. The separate 12-minute stress soak restores health deliberately and is not run-length evidence.

| Monster | Mean duration | Individual durations | Mean Dominance |
|---|---:|---|---:|
| Overlord | 9:06 | 9:05, 9:13, 9:01 | 2,045,407 |
| Calamity | 10:12 | 10:10, 10:04, 10:21 | 2,686,078 |
| Devourer | 9:12 | 9:42, 7:37, 10:16 | 2,164,978 |
| Titan | 10:58 | 10:57, 10:56, 11:00 | 3,131,868 |
| Sovereign | 9:50 | 10:10, 9:14, 10:06 | 2,472,455 |

Arc observations: 0–2 minutes preserves strong opening kill momentum and mostly high health. From 2–5 minutes stages I/II broaden control as ranged/brute/elite threats arrive. From 5–8 minutes stage III adds wider clears and stronger movement/impact identity. From 8–10 minutes Final Release produces larger clears while mixed heavier enemies and rising damage drain sustain. At 10+ minutes Titan and some Calamity/Sovereign/Devourer runs persist briefly, then lose; no tested runaway immortality. Titan leads mean scores by about 53% over Overlord in this policy and deserves human competitive tuning. Devourer remains variable (one 7:37 run); the mean stays near the target. Do not promise equal leaderboard strength from three seeds.

## Versioning and verification

Gameplay rules are `2026.10-v4-unbound`; MM2 envelope stays compatible. Results, share text and PNG expose the ruleset. Verifier explicitly labels historical codes as noncomparable with current rules. Cosmetic lifetime achievements/titles remain preserved and Records states they span rulesets.

Passed: production build; 27 unit/simulation tests; 80 mask validation; five-kit extreme-palette contact sheet; original art folder import and new controls; procedural music playback tests; all-five full-density Final Release tests at 1440×900 and 844×390 with high/low FX; actual release HUD/ruleset result tests; baseline palette and external-audio regressions; keyboard/touch/pause/orientation/restart/results/PNG/run-code browser smoke; offline reload and service-worker asset update.

Full simulation+render near 697 enemies measured p95 2.8–5.8ms across kits/viewports on this desktop. A separate 500-enemy/100-projectile/80-effect scene measured p95 1.9ms rendering at both viewports; recolor caches stayed bounded. These are desktop browser measurements, not real-phone GPU/thermal claims. Gameplay frame-boundary alpha audit finds no clipped edges for any lead.

Remaining launch acceptance: physical low-end Android/iOS play, thermal/memory behavior, human full-run feel and competitive balance, and headphone/speaker music/SFX audition. No known build or automated-regression blocker remains. Optional torch destruction was not implemented.
