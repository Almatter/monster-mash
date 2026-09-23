# Event foundation validation — September 22, 2026

- Original vertical slice preserved in Git checkpoint `98ece6f`; tested roster foundation checkpoint `72f8523`.
- 16 deterministic tests passed: original scoring/Carnage/serialization, fixed seeds, four new kits, canonical names, cosmetic invariance, record progress/migration, corrupted/blocked storage and MM1/MM2 compatibility.
- Each of five kits passed a real Chromium-family browser flow with AZRAEL, non-default primary/power colors, title, selection preview, movement, four powers, pause identity, result identity, copied text, downloadable named PNG, restart and persisted reload.
- Natural browser combat defeat was tested using a virtual clock: OVERWHELMED result and restart retained AZRAEL.
- Actual persistent unlocks were earned during browser gameplay, displayed with their completed condition, inspected in Records, reloaded, and not unlocked again. Title rewards became selectable. Apostrophes, hyphens, mixed case, long fantasy names and non-Latin/emoji names survived reload.
- Emulated 844×390 touch: naming, palette selection, 44px swatches, registry/Records navigation, joystick movement, powers, results, restart and orientation pause passed. 390×844 menu reflow passed without horizontal document overflow. Real handset testing remains outstanding.
- Tint test preserved white/gray shading and transparency; absent art used fallback. No final layered art has been supplied, so real delivered atlases still need visual acceptance and mobile-memory profiling.
- Offline first-load/reload replay passed. Service worker caches the production module list, catalog and successful subsequently loaded artwork.

## 12-minute simulations

Each used the same scripted movement and ability cadence with health restored deliberately. These measure stability and source attribution, not competitive balance. Counters, queues, effects and entity pools stayed inside their caps; sum of source kills equaled Body Count. After forced garbage collection, retained heap was flat within measurement variation (one earlier sweep retained about 0.7 MB).

| Kit | Body Count | Peak live enemies |
|---|---:|---:|
| Overlord | 35,626 | 428 |
| Calamity | 35,273 | 1,076 |
| Devourer | 21,027 | 1,078 |
| Titan | 36,476 | 503 |
| Sovereign | 36,394 | 616 |

The soak caught a fast-character pursuit stall. Enemies now commit to closing distance until melee approach rather than repeatedly stopping their catch-up sprint outside the Devourer's reach. Feeding remains bounded; the test does not claim DPS or score parity.

## Rendered stress

Headless installed Edge, 1440×900, initially 1,100 clustered enemies with boosted health, abilities repeatedly exercised. 95th percentile measured CPU time for simulation plus Canvas command submission:

| Kit | P95 work |
|---|---:|
| Overlord | 9.4 ms |
| Calamity | 11.7 ms |
| Devourer | 5.3 ms |
| Titan | 7.2 ms |
| Sovereign | 4.2 ms |

Some kits annihilated most targets before the sample ended. These are not guarantees of GPU frame presentation, mobile FPS or thermal behavior. Adaptive effects preserve identical gameplay simulation. Public-host/subpath verification, hardware Safari/Android and human balance sessions remain release checks.
