# Isekai Hell — Monster Mash

Public-anonymous, static browser horde arcade game. The original **Sovereign** remains playable alongside four distinct packages: **Titan, Devourer, Calamity, Overlord**. Name/title/palette are cosmetic identity, not progression. No accounts, tracking, external assets, server or runtime dependencies are required.

## Run and deploy

Requires Node **24.19+**. npm is optional.

```sh
node tools/serve.mjs
# http://127.0.0.1:4173
node tools/build.mjs
node --test tests/*.test.mjs
```

The server builds once at startup. Rebuild after source changes. The intended permanent project site is `https://Almatter.github.io/monster-mash/`, published from `dist/` by the GitHub Actions workflow on `main`. Relative paths support the `/monster-mash/` subpath. See [DEPLOYMENT.md](DEPLOYMENT.md) for current publication status and setup.

Build uses Node's native TypeScript erasure, which emits an experimental warning and does **not type-check**. Use erasable TypeScript syntax. Runtime behavior is covered by deterministic and real-browser tests.

**Offline cache during development:** the build derives the worker cache version from shipped runtime files. Reopen a tab to check for a new version; an active run defers its reload until results. Bump `EVENT.rules` when gameplay/scoring rules change; do not compare scores across rules versions. Current rules: `2026.10-v4-unbound`.

## Play

Choose a name, one of five packages, an optional title and four tint channels. The same identity snapshot is used in the live HUD, pause screen, run result, result card, copied text and MM3 code. Fantasy punctuation, spaces, mixed case, non-Latin names and emoji are supported, up to 32 Unicode code points. The sole blank-name fallback is **Unnamed Calamity**.

- WASD / arrows or left thumb stick: move. Mouse: aim; touch aim follows movement and nearby prey when stationary.
- Q/E/R/Space or 1/2/3/4: selected kit's three powers and ultimate. Basic attack is automatic.
- P/Escape: pause. Backgrounding or entering touch portrait pauses combat. Menus work in portrait; combat requests landscape.
- Mute, shake and low-effects toggles remain available. Repeated runs grant no statistical advantage.

| Archetype | Distinct mechanics |
|---|---|
| Titan | Slower, durable melee; surrounding enemies reduce damage; shockwave, charge, launched bodies and ground impact |
| Devourer | Fast melee; kill momentum, lunge, capped feeding, wounded-elite execution and temporary frenzy |
| Calamity | Vulnerable ranged caster; aimable beam, delayed meteor, pulling vortex, enormous detonation and bounded cooldown refunds |
| Overlord | Control up to 32 pooled servants; curse damage, conversion, summons and iterative corruption cascades |
| Sovereign | Preserved original mixed claw/shockwave/devour/beam/catastrophe package |

## Feats, records and titles

Run Feats repeat and reset each run. Monster Records preserve best-run achievements. The 26 prestige titles use lifetime totals and explicit mastery challenges; all requirements and progress are shown in separate Records sections. Titles never affect stats. Version 3 storage migrates old identity, palettes, records and earned legacy titles. See [PROGRESSION.md](PROGRESSION.md) for thresholds, persistence limits and safe developer reset.

See [BALANCE_REPORT.md](BALANCE_REPORT.md) for the five distinct sustain loops, threat curve and before/after scripted-play measurements. [ART_ASSET_SPEC.md](ART_ASSET_SPEC.md) documents the shipped layered anime art and the developer-only art-lab.html validator. [AUDIO_ASSET_SPEC.md](AUDIO_ASSET_SPEC.md) documents the master/three-bus mix, synthesized sound effects, loop/crossfade states and music delivery slots. Six distinct procedural menu/champion themes ship without external music masters.

## Scoring and competition

Enemy base score × current Carnage, rounded per kill, earns Dominance. Kills add 0.018 Carnage to a maximum of ×5. After 1.6 seconds without a kill, it decays by 0.24 per second toward ×1. Multikills of at least five add five points per kill; later waves add `wave × 100`; feats add explicit bonuses. Aggregate/held abilities settle their multikill on completion. Exact tuning lives in content modules.

All damage routes credit the player once. Source totals distinguish direct, devour, execution, lunge/trample, beam, meteor/vortex, collisions, controlled/summoned servants, curse damage, corruption chains and ultimates. Conversion itself awards no kill. Summon expiration awards no kill. The Titan's collision credit requires actual launched-body contact, replacing the prototype's outer damage annulus.

Players post their PNG card and run code manually to Discord. `/verify/` reads current MM3 plus legacy MM1/MM2 codes. The SHA-256 checksum detects damaged/simple edits; it **does not prove honest play**, provide a signature, or validate a replay. A modified client can forge results. Codes include rules, week, seed, name/title/archetype/colors, statistics, run feats, new local records and source counts. Local records are not authoritative. Compare best runs within one weekly phase and rules version; decide whether retired runs are eligible.

## Content map

| File | Edit here for |
|---|---|
| `src/content-monsters.ts` | Monster stats, fixed kits, passives, ability metadata/tuning, palette channels, swatches, titles and animation references |
| `src/powers.ts` | Reusable ability-effect handlers; new behavior is added once here, not by copying a player class |
| `src/data.ts` | Enemy stats/behavior selection, phase spawn tables, event activation/version, run feats |
| `src/content-records.ts` | Persistent achievement definitions, exact feat explanations, score constants and massacre tiers |
| `src/identity.ts`, `src/profile.ts` | Canonical identity, sanitization, cosmetic validation, storage/migration and progress |
| `src/scoring.ts` | Carnage, source counters, multikills and feat evaluation |
| `src/simulation.ts` | Fixed-step combat, enemy pool, spatial hash, waves, shared attack lifecycle |
| `src/servants.ts` | Bounded indirect-damage/ownership subsystem |
| `src/selection.ts`, `src/results.ts`, `src/main.ts` | Registry/Records, shareable results and app/input lifecycle |
| `src/assets.ts`, `src/renderer.ts` | Cached layered artwork and retained procedural fallback |
| `public/assets/catalog.json` | Shipped five-character layered art catalog |

Adding a monster that uses existing effects requires a definition, stats, four ability references, passive choice and palette/art references. A genuinely new mechanic or passive requires a small handler; this is intentionally not a freeform ability builder. New achievements using existing aggregated metrics and new feats using existing contexts require data rows. Keep the plain-language condition and implementation threshold synchronized.

Change `EVENT.phase` (0–3) to activate a week. Week 1 remains the baseline; later phase tables remain starting configurations. **[ART_ASSET_SPEC.md](ART_ASSET_SPEC.md)** gives exact atlas dimensions, animation rows, anchors, tint composition, portrait/cut-in requirements and integration boundaries. Production character and enemy art is bundled under `public/assets/`; editable original images stay in `art-source/`.

## Performance contracts

60 fixed simulation steps/second, bounded catch-up; 1,100 enemies with boss capacity reserved, 180 hostile projectiles, 180 transient effects, 80 friendly bolts, 80 launched remains, 8 fields, 32 pooled servants, 128 queued corruption blasts (16 processed/step), 10 queued notifications. Enemy bucket arrays are reused. Servant target searches run at 4 Hz. Records consume aggregate counters at HUD cadence, not entity scans. Cosmetic art composites on palette change with four cached packs and at most two pending set loads; selection, combat, cut-ins and results load on demand. Low/adaptive FX changes rendering only, not density or score.

## Tests and remaining validation

Logic: `node --test tests/*.test.mjs`. Long-run/cap/memory checks: `node --expose-gc tests/stress-event.mjs`.

Optional Playwright scripts (requires Playwright and a Chromium-family browser):

```sh
node tests/browser.mjs
node tests/event-browser.mjs
node tests/event-mobile.mjs
node tests/records-browser.mjs
node tests/death-browser.mjs
node tests/assets-browser.mjs
node tests/performance.mjs
node tests/performance-event.mjs
```

Set `PLAYWRIGHT_PATH` to an external Playwright `index.mjs`, and `BROWSER_PATH` to an installed executable if needed. Screenshots/cards go in ignored `test-results/`. See **[TESTING.md](TESTING.md)** for observed results and their limits.

Still required before public competition: human balance/playstyle tuning for broadly comparable Dominance opportunities and 8–12 minute runs, real iOS/Android browser and thermal checks, a commissioned/original music score, organizer eligibility rules, and user approval to publish. Automated immortality soaks prove stability, not fairness or ordinary-player survival time.

## Production presentation assets

All five leads have distinct silhouettes and separate selection, portrait, cut-in and 5-row gameplay sheets with primary/secondary/accent/power masks. The new enemies are ash goblin, grave hound, Hex Spitter, Carrion Wing, Iron Ogre, Blood Herald and Hollow King; a low-contrast medieval stone arena tile supports them. Twenty distinct vector skill icons replace repeated generic glyphs. The old procedural sprites remain loading/error fallbacks.

Character art ships as 100 lossless WebP layers totaling about 18.2 MiB, loaded one screen-set at a time. Source masters and processing scripts live in `art-source/` and `tools/process-*-art.mjs`; run `node tools/pack-character-art.mjs --prune-png` after regenerating PNG layers. The processing scripts require Sharp (`SHARP_PATH` may point to an installation); the built game has no runtime dependency on Sharp. The public game uses compressed enemy WebP sprites and a roughly 10 KiB floor tile.

The mobile landscape HUD is compact (49 px on the tested 915×412, 844×390, 667×375 and 568×320 viewports), with Dominance, slain, Carnage, wave, health, name and pause visible. MASTER, MUSIC, COMBAT/SFX and INTERFACE levels persist locally. Original synthesized SFX cover every semantic hook, with supplied clips taking precedence; the music catalog and five adaptive states await finished original tracks.
