# Isekai Hell — Monster Mash

A playable, static browser arcade game for the October 2026 community event. One boss monster, four powers, seven enemies, escalating waves, Carnage feats, Discord result cards, and a run-code inspector. No accounts, tracking, server, or runtime dependencies.

## Play and build

Requires **Node 24.19 or newer**. npm is optional.

```sh
node tools/serve.mjs
```

Open http://127.0.0.1:4173. The server builds on startup; after source edits run `node tools/build.mjs`, then refresh. This is a local development server, not a public production server.

```sh
node tools/build.mjs
node --test tests/logic.test.mjs
```

Upload the **contents of `dist/`** to any HTTPS static host. All asset paths are relative, including the service worker, so repository subpaths work. Use `node tools/build.mjs` as the host build command and `dist` as its output directory. No environment variables or backend are needed. Nothing has been published or connected to a remote repository.

The build uses Node's native TypeScript stripping, currently marked experimental by Node. It erases types; it does **not** type-check. Keep the source within erasable TypeScript syntax (no enums, namespaces, or parameter properties). Browser logic is exercised with the tests below.

## Controls

- Move: WASD / arrows; touch: left thumb stick.
- Q / 1: Rupture. Area damage and knockback; collisions kill lesser prey.
- E / 2: Devour. Nearby kills restore health and grant six seconds of rage.
- R / 3: Death beam. Aim with mouse during the 2.5-second beam. Touch aim follows movement, then nearby prey when stationary.
- Space / 4: Catastrophe. Large-area destruction, 48-second cooldown.
- P / Escape: pause. Backgrounding or changing to touch portrait pauses combat.
- Basic claws attack automatically. Mute, shake, and low-effects preferences persist locally.

Rotate phones to landscape. Desktop portrait remains usable. Touch ability buttons support simultaneous movement. Clipboard and offline features need HTTPS or localhost.

## Competition

Dominance is the sum of rounded enemy base scores multiplied by current Carnage, plus wave and feat bonuses. Body Count is unweighted kills. Each kill adds 0.018 Carnage, capped at ×5. After 1.6 seconds without a kill, it decays at 0.24 per second toward ×1. Attacks killing at least five enemies add five points per kill. Waves after the first add `wave × 100`. Feat definitions expose thresholds and bonuses in `src/data.ts`.

The result screen includes all run statistics, notable feats, a PNG card, copyable text, and a run code. Players manually post to Discord. There is no web leaderboard or statistical progression between runs.

Organizer tool: **`verify.html`**. MM1 codes encode UTF-8 JSON as base64url and carry a truncated SHA-256 integrity checksum. This prevents accidental edits and casual direct text editing; it is **not cryptographic anti-cheat**, a signature, or a replay validator. Anyone who modifies the client can forge a code. The inspector verifies the checksum and basic consistency, not honest gameplay. Retired runs are explicitly labeled. Decide whether your event accepts them.

Compare scores only within the same `phase` and `rules` version. Seeds differ per run and are recorded; scores are comparable distributions, not identical encounters. Organizer policy should use each player's best run per phase. Future server verification can replace the serialization boundary in `src/run-code.ts` with server-issued IDs and signed results.

## Content and architecture

| File | Responsibility |
| --- | --- |
| `src/data.ts` | Enemy stats/behavior selection, power stats, four phase spawn tables, feat configuration, event version |
| `src/simulation.ts` | Seeded fixed-step combat, pooled enemies, spatial hash, projectiles, waves, powers |
| `src/scoring.ts` | Carnage, kill values, multikills, data-driven feat evaluation |
| `src/renderer.ts` | Final procedural stone arena, sprite atlas, monsters, telegraphs, bounded effects |
| `src/main.ts` | Application lifecycle, keyboard/pointer controls, HUD, results, PNG export, preferences |
| `src/audio.ts` | Gesture-unlocked procedural sound and mute |
| `src/run-code.ts`, `src/verify.ts` | Versioned run envelope and organizer inspector |
| `public/` | HTML/CSS, original icon, manifest, offline cache |

Change `EVENT.phase` from 0 to 3 to select a week; phase activation is explicit, not tied to an untrusted local calendar. Bump `EVENT.rules` after balance changes. Week 1 is the implemented baseline; the other tables are starting configurations needing playtesting.

Enemy additions can reuse existing `chase`, `weave`, `ranged`, or `slam` behavior. New behavior requires a simulation handler. Powers expose their tuning in data; entirely new mechanics need a handler and input binding. Feats using existing metrics require only a data row. Future monster archetypes can replace the player stats/attack setup; no character creator is included.

The renderer creates deliberate final vector-like art and reusable rasterized enemy sprites. Audio is synthesized; no external assets or third-party licenses are needed. Effects adapt under slow frames without changing enemy counts, simulation, or scoring. Enemy capacity is 1,100 with reserved boss slots. Projectiles and effects cap at 180 each. Collision queries use 80-unit spatial buckets. The simulation runs at 60 fixed steps per second, with bounded catch-up; severe sustained stalls slow game time rather than awarding skipped combat.

## Verification

`tests/logic.test.mjs` covers Carnage, bonuses, feat cooldowns, all powers, healing, death/reset isolation, seeded determinism, Unicode serialization, tamper detection, and a 12-minute high-density soak. The soak deliberately restores health to test long-lived systems; it is not evidence that a normal player survives 12 minutes.

Optional browser tests require Playwright and an installed Chromium-family browser:

```sh
node tests/browser.mjs
node tests/performance.mjs
```

Set `PLAYWRIGHT_PATH` to the absolute path of Playwright's `index.mjs` when it is installed outside this project. Set `BROWSER_PATH` to an installed browser executable if Playwright's bundled browser is unavailable. Smoke tests cover desktop controls, touch input, pause, restarts, result/PNG generation, verifier, and resizing. Screenshots are written to ignored `test-results/`.

## Before October 1

- Human-playtest the 8–12 minute difficulty target, especially titan bursts and late wave speed.
- Check real iOS Safari and Android browsers, audio loudness, thumb comfort, and sustained thermal performance. Emulation is not a substitute for hardware.
- Choose a host and obtain approval to publish. Upload the production build and smoke-test its public URL and verifier.
- Freeze the rules version and explain accepted run types and checksum limitations to organizers.
- For offline updates, bump the cache version in `public/sw.js`; old tabs retain their version until closed. Close all game tabs and reopen after an event update. During local development, unregister the service worker if testing changed assets under the same cache version.

No remote deployment, account creation, or external messaging has been performed.
