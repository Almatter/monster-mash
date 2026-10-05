# Hunt v28: Ashen Colossus and Titan Fissure

The optional Ashen Colossus is a new generated volcanic titan for the Ashen Wilds. Its four staggered, small ranged danger zones alternate between an eruption under the player with spaced surrounding bursts, an open ring of fractures, and a volley intercepting the player’s projected movement route. Warnings are fixed snapshots, not homing circles: at least 1.25 seconds to react, 65-unit damage radius, staggered impacts, then a brief damaging scorch. Warnings draw above champion auras, with the artwork supplemented by an exact radius and filling countdown.

It arrives near the player after eight captains if game time is still below 9:00. Players have two minutes of game time to defeat it for a fixed **1,200,000 Dominance**. It is optional: the tenth captain still ends the hunt, and expiry grants no kill or points. There are no additional servants to farm. Boon choice and pausing stop its clock. Fatal hits and manually ended runs clear its remaining hazards. Titan’s massive impacts fracture its basalt shell; this vulnerability belongs only to the new enemy. Its warnings can also damage Overlord servants.

Only Stage 2 combat rules advance to v28. Original Stage 1 remains v15; Reaper Stage 1 remains v27. Existing title IDs, Gatebreaker qualifying days, profile progress and imported saves retain their format. Previous v27 and older MM4 runs remain readable. New run codes, result cards, copied results and the verifier include the colossus reward separately from capped combat and captain/speed rewards.

## Real artwork

Four transparent generated images: full-body idle, matching casting pose, volcanic warning runes and eruption impact. Sources and prompt briefs: [Ashen Colossus art](art-source/ashen-colossus/PROMPTS.md). Rebuild the optimized WebP outputs with `node tools/pack-colossus-art.mjs` (set `SHARP_PATH` to your Sharp installation when needed). The four runtime files total 358,758 bytes, roughly 350 KiB; decoded RGBA memory is about 3.1 MiB. They load only when entering Stage 2. Spawn searches retry at most twice per second; hazards are capped at 18 and use small footprint checks rather than terrain pathfinding.

## Playable Titan: Fissure

Breaker and the previous Throw shared radial damage-and-launch behavior. Stage 2 now replaces Throw with **Fissure · Faultline Rupture**, while Stage 1 keeps Throw. Breaker remains an immediate area hit and shove; Fissure is a persistent directional field.

Fissure follows Titan’s current or last movement direction and spends all Momentum plus **35% of current barrier**. It never spends health and remains usable at zero Momentum. Greater Momentum increases length, width, damage and duration. The initial impact breaks guards and, at half Momentum or more, briefly snares lesser foes. The field then damages every half second and slows lighter enemies by 30–60%; captains, elites and titans receive a smaller 20% slow without a snare. Full charge lasts four seconds before duration boons; reach, power and recharge boons also apply. Fields stop before impassable masonry, remain capped at three, pause during boon choices, and clear on death or completion. Multikill recovery and combat score limits use existing bounded mechanics.

The first Fissure probe reduced Titan’s Colossus fight from roughly 52 seconds to 43 seconds. Its enemy-specific heavy-impact vulnerability was reduced from **5× to 4×**. Final tests average about 48 seconds, with all three Colossi defeated. No other enemy’s vulnerability changes.

Fissure uses generated transparent artwork with dark basalt preserved and bright energy recolored to the player’s power color. Source and prompt brief: [Titan Fissure art](art-source/titan-fissure/PROMPTS.md). The runtime WebP is 768×192; its decoded RGBA footprint is 0.56 MiB and it loads only in Stage 2. Repack with `node tools/pack-fissure-art.mjs`.

## Automated hunt measurements

Three seeds per champion (77, 123, 444), real incoming damage, no immortality. The bot knows the map’s search route and uses all abilities. These are repeatable balance probes, not predicted human averages. All **36/36** final hunts cleared. The optional boss adds a score/time decision but does not force fast players into a 10–12 minute run.

| Champion | Mean clear, seeking boss | Mean boss fight | Mean kills | Mean Dominance | Boss kills |
|---|---:|---:|---:|---:|---:|
| Devourer | 5:29 | 0:19 | 2,878 | 11,129,961 | 3/3 |
| Titan | 7:25 | 0:48 | 4,550 | 11,556,390 | 3/3 |
| Sovereign | 6:51 | 0:31 | 4,479 | 11,020,347 | 3/3 |
| Calamity | 8:16 | 0:27 | 5,607 | 11,073,280 | 3/3 |
| Overlord | 10:26 | 0:56 | 7,188 | 10,265,076 | 3/3 |
| Reaper | 9:44 | 1:12 | 6,511 | 11,418,953 | 3/3 |

A second bot strategy keeps captains as its movement goals. Automatic attacks can still defeat the nearby colossus incidentally; this is not a strict avoidance benchmark.

| Champion | Mean clear, continuing captain route | Mean kills | Mean Dominance | Incidental boss kills |
|---|---:|---:|---:|---:|
| Devourer | 5:10 | 2,624 | 9,917,895 | 0/3 |
| Titan | 6:54 | 4,136 | 10,313,756 | 0/3 |
| Sovereign | 6:25 | 4,160 | 9,803,338 | 0/3 |
| Calamity | 8:15 | 5,603 | 10,616,910 | 2/3 |
| Overlord | 9:43 | 6,596 | 9,331,742 | 0/3 |
| Reaper | 8:45 | 5,660 | 10,636,076 | 1/3 |

## Validation

- 193 unit tests, including eligibility, walkable spawn, fixed telegraphs, damage/escape, bounded effects, pause/boon clocks, expiry, captain-ten completion, death cleanup, enemy-specific vulnerability, one-time reward, authenticated result roundtrips and historical rules compatibility.
- Exact seeded comparison against deployed Stage 1 for the five original champions, two seeds each, through 600 seconds.
- Desktop 1440×900 and touch 844×390: stage-specific Fissure/Throw names, selected energy tint with preserved dark stone, persistent field and restart; idle/cast/warning/impact assets, warning draw order above auras, boss clock, reward display and MM4 export, and Rise Again.
- Unlock/title visibility, retained imported rewards, per-champion Gatebreaker lines, Reaper art and both-stage access, result restart, worker music and service-worker offline/version updates.
- Frame-based 4× CPU-throttle stress check: 236 enemies, 16 active Colossus zones and three persistent Fissures; **49.5 FPS**, update p95 **12.4 ms**, drawing p95 **11.4 ms**, terrain cache peak 30, no terrain failures. This measures desktop throttling; it does not guarantee phone FPS.
- Pages build validates runtime assets and relative paths. Raw balance/visual/performance artifacts remain in ignored `test-results/`.

Tester endpoint: https://almatter.github.io/monster-mash/stage2-test/ . Local endpoint after building: http://127.0.0.1:4173/stage2-test/ .
